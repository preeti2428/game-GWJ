"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Obstacle from "./Obstacle";
import Traveler from "./Traveler";
import ShopModal, { VEHICLE_LIST, SUIT_LIST } from "./ShopModal";
import CrosswordPuzzle from "./CrosswordPuzzle";
import { FAR_SKYLINE, MID_STREET, NEAR_STREET } from "@/lib/scenery";
import {
  playCoinSound,
  playPassSound,
  playGateSound,
  playCorrectSound,
  playWrongSound,
  playBuySound,
  speakGermanWord,
  toggleMute,
  getMuteState,
} from "@/lib/audio";
import "./game.css";

const TRAVEL_PER_STOP = 90; // vw: distance between stops

// Surprise Mystery Chests along the journey (Every 3 stops)
const SURPRISE_CHESTS = [
  {
    id: "chest-1",
    p: 0.35,
    coins: 50,
    puzzleIndex: 0,
    giftVeh: "skateboard",
    title: "🎁 Überraschungs-Event 1: Rhein-Puzzle!",
    giftName: "Street Pro Skateboard 🛹",
    giftDesc: "Du hast ein Pro-Skateboard gefunden! +50 Münzen erhalten!",
  },
  {
    id: "chest-2",
    p: 0.72,
    coins: 100,
    puzzleIndex: 1,
    giftSuit: "boy_karneval",
    title: "🎉 Überraschungs-Event 2: Altstadt-Kreuzwort!",
    giftName: "Kölner Karneval Prunk 🎭",
    giftDesc: "Kölle Alaaf! Traditionelles Fest-Outfit +100 Münzen freigeschaltet!",
  },
  {
    id: "chest-3",
    p: 0.88,
    coins: 250,
    puzzleIndex: 2,
    giftVeh: "kickscooter",
    title: "⭐ Überraschungs-Event 3: Dom-Meisterrätsel!",
    giftName: "E-Kickscooter LED 🛴",
    giftDesc: "Meister-Belohnung kurz vor dem Dom! +250 Münzen!",
  },
];

const ICONS = { coins: "🪙", mcq: "💬", match: "🧩", order: "🌉", link: "🎤", boss: "👑" };
const iconFor = (s) => {
  if (s.kind !== "link") return ICONS[s.kind] ?? "🚧";
  if (/writ/i.test(s.title)) return "✍️";
  if (/read/i.test(s.title)) return "📰";
  return "🎤";
};

// Köln landmarks according to progress (0..1)
function getLandmarkName(p) {
  if (p < 0.22) return { name: "Rheinufer Promenade", sub: "Startpunkt am Fluss" };
  if (p < 0.45) return { name: "Heumarkt & Alter Markt", sub: "Historische Kölner Altstadt" };
  if (p < 0.72) return { name: "Hohenzollernbrücke", sub: "Liebesschlösser & Rheinblick" };
  if (p < 0.88) return { name: "Roncalliplatz", sub: "Vorhof des Doms" };
  return { name: "Kölner Dom (Kathedrale)", sub: "Ziel & Meisterprüfung" };
}

export default function CityGame({ city, chapterSlug, backHref = "/" }) {
  const stops = city.stops;
  const n = stops.length;
  const TRAVEL = (n + 1) * TRAVEL_PER_STOP;

  // Stop position (0..1 scroll progress)
  const pos = useMemo(() => stops.map((_, i) => (i + 1) / (n + 1)), [stops, n]);

  // Coins spread between stops
  const coinItems = useMemo(() => {
    const items = [];
    stops.forEach((s, i) => {
      const prev = i === 0 ? 0 : pos[i - 1];
      const span = pos[i] - prev;
      const m = s.coins?.length ?? 0;
      s.coins?.forEach((c, k) => {
        const t = m === 1 ? 0.5 : 0.2 + (0.6 * k) / (m - 1);
        items.push({ key: `${s.id}:${c.de}`, p: prev + span * t, ...c });
      });
    });
    return items;
  }, [stops, pos]);

  const [done, setDone] = useState(() => new Set(stops.filter((s) => s.done).map((s) => s.id)));
  const [bag, setBag] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [toast, setToast] = useState(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [muted, setMuted] = useState(false);

  // Coins, Rewards & Garage System
  const [coinsWallet, setCoinsWallet] = useState(25);
  const [coinDelta, setCoinDelta] = useState(null); // { text: "+5 🪙", type: "plus" }
  const [gender, setGender] = useState("boy"); // 'boy' | 'girl'
  const [skinTone, setSkinTone] = useState("#ffd19a");
  const [hairColor, setHairColor] = useState("#5c3d2e");
  const [unlockedVehicles, setUnlockedVehicles] = useState(["none"]);
  const [unlockedSuits, setUnlockedSuits] = useState(["boy_casual", "girl_casual"]);
  const [currentVehicle, setCurrentVehicle] = useState("none");
  const [currentSuit, setCurrentSuit] = useState("boy_casual");
  const [openedChests, setOpenedChests] = useState(new Set());
  const [shopOpen, setShopOpen] = useState(false);
  const [surpriseModal, setSurpriseModal] = useState(null);
  const [puzzleState, setPuzzleState] = useState(null); // { puzzleIndex, reward }

  const deltaTimer = useRef(null);
  function triggerCoinDelta(text, type) {
    setCoinDelta({ text, type });
    clearTimeout(deltaTimer.current);
    deltaTimer.current = setTimeout(() => setCoinDelta(null), 1500);
  }

  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const farRef = useRef(null);
  const midRef = useRef(null);
  const heroRef = useRef(null);
  const stRef = useRef(null);

  const doneRef = useRef(done);
  const activeRef = useRef(null);
  const bagKeys = useRef(new Set());
  const openedChestsRef = useRef(openedChests);
  const walkTimer = useRef(null);

  useEffect(() => {
    openedChestsRef.current = openedChests;
  }, [openedChests]);

  useEffect(() => {
    doneRef.current = done;
    if (stops.every((s) => done.has(s.id))) setFinished(true);
  }, [done, stops]);

  useEffect(() => {
    activeRef.current = activeId;
    document.documentElement.style.overflow = activeId ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [activeId]);

  // Load bag and rewards from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`wortschatz:${chapterSlug}`) || "[]");
      if (Array.isArray(saved)) {
        saved.forEach((w) => bagKeys.current.add(w.key));
        setBag(saved);
      }
      const savedCoins = localStorage.getItem("koeln_coin_wallet");
      if (savedCoins !== null) setCoinsWallet(Number(savedCoins));
      const savedGender = localStorage.getItem("koeln_cur_gender") || "boy";
      setGender(savedGender);
      const savedSkin = localStorage.getItem("koeln_cur_skin") || "#ffd19a";
      setSkinTone(savedSkin);
      const savedHair = localStorage.getItem("koeln_cur_hair") || "#5c3d2e";
      setHairColor(savedHair);
      const savedVehs = JSON.parse(localStorage.getItem("koeln_unlocked_vehs") || '["none"]');
      if (Array.isArray(savedVehs)) setUnlockedVehicles(savedVehs);
      const savedSuits = JSON.parse(localStorage.getItem("koeln_unlocked_suits") || '["boy_casual", "girl_casual"]');
      if (Array.isArray(savedSuits)) setUnlockedSuits(savedSuits);
      const savedCurVeh = localStorage.getItem("koeln_cur_veh") || "none";
      setCurrentVehicle(savedCurVeh);
      const savedCurSuit = localStorage.getItem("koeln_cur_suit") || "boy_casual";
      setCurrentSuit(savedCurSuit);
      const savedChests = JSON.parse(localStorage.getItem(`koeln_chests:${chapterSlug}`) || "[]");
      if (Array.isArray(savedChests)) {
        const cSet = new Set(savedChests);
        setOpenedChests(cSet);
        openedChestsRef.current = cSet;
      }
    } catch {}
    setMuted(getMuteState());
  }, [chapterSlug]);

  useEffect(() => {
    let cancelled = false;
    let ctx;

    (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scrub = reduce ? true : 0.6;
      const vw = () => window.innerWidth / 100;
      const range = () => ({ start: stRef.current.start, end: stRef.current.end });

      ctx = gsap.context(() => {
        const common = {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub,
          invalidateOnRefresh: true,
        };

        // Deep Parallax with varying speeds
        gsap.to(trackRef.current, { x: () => -TRAVEL * vw(), ease: "none", scrollTrigger: common });
        gsap.to(midRef.current, { x: () => -TRAVEL * 0.42 * vw(), ease: "none", scrollTrigger: common });
        gsap.to(farRef.current, { x: () => -TRAVEL * 0.16 * vw(), ease: "none", scrollTrigger: common });

        stRef.current = ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            let p = self.progress;

            // Character walking state
            setIsWalking(true);
            clearTimeout(walkTimer.current);
            walkTimer.current = setTimeout(() => setIsWalking(false), 180);

            // Obstacle lock: Stops further scroll until obstacle is solved
            const lockIdx = stops.findIndex((s) => !doneRef.current.has(s.id));
            if (lockIdx !== -1) {
              const lp = pos[lockIdx];
              if (p > lp) {
                const { start, end } = range();
                window.scrollTo(0, start + lp * (end - start));
                p = lp;
              }
              if (p >= lp - 0.003 && !activeRef.current) {
                activeRef.current = stops[lockIdx].id;
                setActiveId(stops[lockIdx].id);
                playGateSound();
              }
            }

            setScrollProgress(p);

            // Collect Vocabulary Coins
            const fresh = coinItems.filter((c) => c.p <= p && !bagKeys.current.has(c.key));
            if (fresh.length) {
              fresh.forEach((c) => bagKeys.current.add(c.key));
              playCoinSound();
              triggerCoinDelta(`+${fresh.length} 🪙`, "plus");
              const last = fresh[fresh.length - 1];
              speakGermanWord(last.de);
              setCoinsWallet((prev) => {
                const nextVal = prev + fresh.length;
                try {
                  localStorage.setItem("koeln_coin_wallet", String(nextVal));
                } catch {}
                return nextVal;
              });
              setBag((prev) => {
                const next = [...prev, ...fresh.map(({ key, de, hi }) => ({ key, de, hi }))];
                try {
                  localStorage.setItem(`wortschatz:${chapterSlug}`, JSON.stringify(next));
                } catch {}
                return next;
              });
              setToast(`🪙 +${fresh.length} Münze! ${last.de} = ${last.hi}`);
            }

            // Check if player reached a Surprise Mystery Chest 🎁
            const hitChest = SURPRISE_CHESTS.find(
              (c) => c.p <= p && !openedChestsRef.current.has(c.id)
            );
            if (hitChest) {
              openedChestsRef.current.add(hitChest.id);
              setOpenedChests(new Set(openedChestsRef.current));
              try {
                localStorage.setItem(
                  `koeln_chests:${chapterSlug}`,
                  JSON.stringify([...openedChestsRef.current])
                );
              } catch {}

              // Award bonus coins
              setCoinsWallet((prev) => {
                const nv = prev + hitChest.coins;
                try {
                  localStorage.setItem("koeln_coin_wallet", String(nv));
                } catch {}
                return nv;
              });

              // Unlock vehicle or suit gift
              if (hitChest.giftVeh) {
                setUnlockedVehicles((prev) => {
                  const n = prev.includes(hitChest.giftVeh) ? prev : [...prev, hitChest.giftVeh];
                  try {
                    localStorage.setItem("koeln_unlocked_vehs", JSON.stringify(n));
                    localStorage.setItem("koeln_cur_veh", hitChest.giftVeh);
                  } catch {}
                  return n;
                });
                setCurrentVehicle(hitChest.giftVeh);
              }

              if (hitChest.giftSuit) {
                const effectiveSuit = gender === "girl" && hitChest.giftSuit.startsWith("boy_")
                  ? hitChest.giftSuit.replace("boy_", "girl_")
                  : hitChest.giftSuit;
                setUnlockedSuits((prev) => {
                  const n = prev.includes(effectiveSuit) ? prev : [...prev, effectiveSuit];
                  try {
                    localStorage.setItem("koeln_unlocked_suits", JSON.stringify(n));
                    localStorage.setItem("koeln_cur_suit", effectiveSuit);
                  } catch {}
                  return n;
                });
                setCurrentSuit(effectiveSuit);
              }

              playPassSound();
              setSurpriseModal(hitChest);
            }
          },
        });
      }, rootRef);

      // Auto-position to first unfinished stop
      const first = stops.findIndex((s) => !doneRef.current.has(s.id));
      if (first > 0) {
        const { start, end } = range();
        window.scrollTo(0, start + (pos[first] - 0.05) * (end - start));
      }
    })();

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    return () => {
      cancelled = true;
      clearTimeout(walkTimer.current);
      ctx?.revert();
      stRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const activeStop = stops.find((s) => s.id === activeId) ?? null;
  const bagSet = useMemo(() => new Set(bag.map((b) => b.key)), [bag]);

  function handlePass(stop, stars) {
    const next = new Set(doneRef.current);
    next.add(stop.id);
    doneRef.current = next;
    setDone(next);
    activeRef.current = null;
    setActiveId(null);
    playPassSound();

    // Award +5 coins for solving level!
    triggerCoinDelta("+5 🪙", "plus");
    setCoinsWallet((prev) => {
      const nv = prev + 5;
      try {
        localStorage.setItem("koeln_coin_wallet", String(nv));
      } catch {}
      return nv;
    });

    setToast(`🎉 ${"★".repeat(stars)}${"☆".repeat(3 - stars)}  ${stop.title} gemeistert! +5 🪙 Münzen!`);

    fetch("/api/game/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapterSlug,
        stopId: stop.id,
        stars,
        coins: (stop.coins ?? []).map((c) => c.de),
      }),
    }).catch(() => {});

    setTimeout(() => window.scrollBy({ top: 180, behavior: "smooth" }), 100);
  }

  function handleClose() {
    activeRef.current = null;
    setActiveId(null);
    if (stRef.current) {
      const { start, end } = stRef.current;
      window.scrollTo(0, window.scrollY - 0.03 * (end - start));
    }
  }

  function handleToggleSound() {
    const nextState = toggleMute();
    setMuted(nextState);
  }

  // Shop actions with live coin deduction and feedback
  function handleUnlockVehicle(vehItem) {
    if (coinsWallet < vehItem.price) {
      setToast(`❌ Zu wenige Münzen! Du hast ${coinsWallet} 🪙, brauchst aber ${vehItem.price} 🪙`);
      playWrongSound();
      return;
    }
    const nextCoins = coinsWallet - vehItem.price;
    const nextList = [...unlockedVehicles, vehItem.id];
    setCoinsWallet(nextCoins);
    setUnlockedVehicles(nextList);
    setCurrentVehicle(vehItem.id);
    triggerCoinDelta(`-${vehItem.price} 🪙`, "minus");
    try {
      localStorage.setItem("koeln_coin_wallet", String(nextCoins));
      localStorage.setItem("koeln_unlocked_vehs", JSON.stringify(nextList));
      localStorage.setItem("koeln_cur_veh", vehItem.id);
    } catch {}
    playBuySound();
    setToast(`🛒 Gekauft: ${vehItem.name} (-${vehItem.price} 🪙) · Noch ${nextCoins} 🪙 übrig!`);
  }

  function handleUnlockSuit(suitItem) {
    if (coinsWallet < suitItem.price) {
      setToast(`❌ Zu wenige Münzen! Du hast ${coinsWallet} 🪙, brauchst aber ${suitItem.price} 🪙`);
      playWrongSound();
      return;
    }
    const nextCoins = coinsWallet - suitItem.price;
    const nextList = [...unlockedSuits, suitItem.id];
    setCoinsWallet(nextCoins);
    setUnlockedSuits(nextList);
    setCurrentSuit(suitItem.id);
    triggerCoinDelta(`-${suitItem.price} 🪙`, "minus");
    try {
      localStorage.setItem("koeln_coin_wallet", String(nextCoins));
      localStorage.setItem("koeln_unlocked_suits", JSON.stringify(nextList));
      localStorage.setItem("koeln_cur_suit", suitItem.id);
    } catch {}
    playBuySound();
    setToast(`🛒 Gekauft: ${suitItem.name} (-${suitItem.price} 🪙) · Noch ${nextCoins} 🪙 übrig!`);
  }

  function handleEquipVehicle(vehId) {
    setCurrentVehicle(vehId);
    try {
      localStorage.setItem("koeln_cur_veh", vehId);
    } catch {}
    setToast(`✓ Fahrzeug ausgerüstet!`);
  }

  function handleEquipSuit(suitId) {
    setCurrentSuit(suitId);
    try {
      localStorage.setItem("koeln_cur_suit", suitId);
    } catch {}
    setToast(`✓ Outfit ausgerüstet!`);
  }

  function handleChangeGender(nextGender) {
    setGender(nextGender);
    try {
      localStorage.setItem("koeln_cur_gender", nextGender);
    } catch {}
    if (nextGender === "girl" && currentSuit.startsWith("boy_")) {
      const girlDefault = "girl_casual";
      setCurrentSuit(girlDefault);
      try {
        localStorage.setItem("koeln_cur_suit", girlDefault);
      } catch {}
    } else if (nextGender === "boy" && currentSuit.startsWith("girl_")) {
      const boyDefault = "boy_casual";
      setCurrentSuit(boyDefault);
      try {
        localStorage.setItem("koeln_cur_suit", boyDefault);
      } catch {}
    }
    setToast(`✓ Gewechselt zu: ${nextGender === "girl" ? "👧 Mädchen" : "👦 Junge"}`);
  }

  function handleChangeSkinTone(color) {
    setSkinTone(color);
    try {
      localStorage.setItem("koeln_cur_skin", color);
    } catch {}
    setToast(`✓ Hautfarbe geändert!`);
  }

  function handleChangeHairColor(color) {
    setHairColor(color);
    try {
      localStorage.setItem("koeln_cur_hair", color);
    } catch {}
    setToast(`✓ Haarfarbe geändert!`);
  }

  // Manual click on mystery chest
  function handleManualChestOpen(chest) {
    if (openedChests.has(chest.id)) return;
    openedChestsRef.current.add(chest.id);
    setOpenedChests(new Set(openedChestsRef.current));
    try {
      localStorage.setItem(`koeln_chests:${chapterSlug}`, JSON.stringify([...openedChestsRef.current]));
    } catch {}

    setCoinsWallet((prev) => {
      const nv = prev + chest.coins;
      try {
        localStorage.setItem("koeln_coin_wallet", String(nv));
      } catch {}
      return nv;
    });

    if (chest.giftVeh) {
      setUnlockedVehicles((prev) => {
        const n = prev.includes(chest.giftVeh) ? prev : [...prev, chest.giftVeh];
        try {
          localStorage.setItem("koeln_unlocked_vehs", JSON.stringify(n));
          localStorage.setItem("koeln_cur_veh", chest.giftVeh);
        } catch {}
        return n;
      });
      setCurrentVehicle(chest.giftVeh);
    }

    if (chest.giftSuit) {
      setUnlockedSuits((prev) => {
        const n = prev.includes(chest.giftSuit) ? prev : [...prev, chest.giftSuit];
        try {
          localStorage.setItem("koeln_unlocked_suits", JSON.stringify(n));
          localStorage.setItem("koeln_cur_suit", chest.giftSuit);
        } catch {}
        return n;
      });
      setCurrentSuit(chest.giftSuit);
    }

    playPassSound();
    setSurpriseModal(chest);
  }

  // Restart the whole journey from the beginning
  function handleResetJourney() {
    if (typeof window !== "undefined") {
      const confirmReset = window.confirm("Möchtest du die Reise wirklich von vorne neu starten? (Do you want to restart the whole journey from the beginning?)");
      if (!confirmReset) return;

      const emptyDone = new Set();
      doneRef.current = emptyDone;
      setDone(emptyDone);
      setFinished(false);
      activeRef.current = null;
      setActiveId(null);

      bagKeys.current = new Set();
      setBag([]);
      const emptyChests = new Set();
      openedChestsRef.current = emptyChests;
      setOpenedChests(emptyChests);

      try {
        localStorage.removeItem(`wortschatz:${chapterSlug}`);
        localStorage.removeItem(`koeln_chests:${chapterSlug}`);
      } catch {}

      window.scrollTo({ top: 0, behavior: "smooth" });
      setToast("🔄 Reise neu gestartet! Auf geht's!");
    }
  }

  // Replay a specific completed stop
  function handleReplayStop(stopId) {
    activeRef.current = stopId;
    setActiveId(stopId);
  }

  // Dynamic Sky Gradient & Sun Position according to journey progress
  const skyBackground = useMemo(() => {
    if (scrollProgress < 0.28) {
      // Early morning sunrise
      return "linear-gradient(180deg, #ff9f7d 0%, #ffd0a8 45%, #fff1de 100%)";
    } else if (scrollProgress < 0.65) {
      // Bright midday
      return "linear-gradient(180deg, #5da5d9 0%, #9cd3f7 50%, #eaf5fd 100%)";
    } else if (scrollProgress < 0.85) {
      // Golden hour sunset
      return "linear-gradient(180deg, #592455 0%, #d65947 45%, #ffb66c 100%)";
    } else {
      // Starry night at Kölner Dom
      return "linear-gradient(180deg, #090e1d 0%, #17213d 50%, #293452 100%)";
    }
  }, [scrollProgress]);

  const sunOpacity = scrollProgress > 0.82 ? 0 : 1;
  const starsOpacity = scrollProgress > 0.8 ? (scrollProgress - 0.8) / 0.2 : 0;
  const landmark = getLandmarkName(scrollProgress);

  return (
    <div ref={rootRef} className="kg-root" style={{ height: `${(n + 1) * 110}vh` }}>
      <div className="kg-stage">
        {/* Dynamic Sky Layer */}
        <div className="kg-sky" style={{ background: skyBackground }}>
          <div
            className="kg-sky-sun"
            style={{
              opacity: sunOpacity,
              transform: `translate(${-scrollProgress * 20}vw, ${scrollProgress * 30}px)`,
            }}
          />
          <div className="kg-sky-stars" style={{ opacity: starsOpacity }} />
        </div>

        {/* Ambient Leaves Floating in Breeze */}
        <div className="kg-leaves-overlay">
          <div className="kg-leaf" />
          <div className="kg-leaf" />
          <div className="kg-leaf" />
          <div className="kg-leaf" />
        </div>

        {/* Parallax Layer 1: Distant Skyline & Rhine River */}
        <div
          ref={farRef}
          className="kg-layer kg-far"
          style={{ width: `${TRAVEL * 0.16 + 180}vw`, backgroundImage: FAR_SKYLINE }}
        />

        {/* Parallax Layer 2: Midground Old Town Altstadt & Bridges */}
        <div
          ref={midRef}
          className="kg-layer kg-mid"
          style={{ width: `${TRAVEL * 0.42 + 180}vw`, backgroundImage: MID_STREET }}
        />

        {/* Track with Cobblestone Street, Obstacles, and Coins */}
        <div ref={trackRef} className="kg-track" style={{ width: `${20 + TRAVEL + 80}vw` }}>
          <div className="kg-road" style={{ backgroundImage: NEAR_STREET }} />

          {/* Vocabulary Coins */}
          {coinItems.map((c) => (
            <div
              key={c.key}
              className={`kg-coin ${bagSet.has(c.key) ? "kg-coin-got" : ""}`}
              style={{ left: `${20 + c.p * TRAVEL}vw` }}
              aria-hidden="true"
            >
              <div className="kg-coin-disc" />
              <span>{c.de}</span>
            </div>
          ))}

          {/* Surprise Mystery Chests 🎁 */}
          {SURPRISE_CHESTS.map((chest) => {
            const isOpened = openedChests.has(chest.id);
            return (
              <div
                key={chest.id}
                className={`kg-chest ${isOpened ? "kg-chest-opened" : ""}`}
                style={{ left: `${20 + chest.p * TRAVEL}vw` }}
                onClick={() => !isOpened && handleManualChestOpen(chest)}
                title={isOpened ? "Bereits geöffnet" : "🎁 Klicke für die Überraschung!"}
              >
                <div className="kg-chest-halo" />
                <div className="kg-chest-box">{isOpened ? "✨" : "🎁"}</div>
                <div className="kg-chest-label">{isOpened ? "Geöffnet" : "Überraschung!"}</div>
              </div>
            );
          })}

          {/* Checkpoint Landmark Arches */}
          {stops.map((s, i) => {
            const isDone = done.has(s.id);
            const isBoss = s.kind === "boss";
            return (
              <div key={s.id} className="kg-stop" style={{ left: `${20 + pos[i] * TRAVEL}vw` }}>
                <div
                  className={`kg-arch ${isDone ? "kg-arch-open kg-arch-clickable" : ""}`}
                  onClick={() => isDone && handleReplayStop(s.id)}
                  title={isDone ? "Klicken, um diesen Stop zu wiederholen 🔄" : ""}
                >
                  {/* Floating Interactive Emblem ABOVE the Gate */}
                  <div className="kg-arch-float-badge" aria-hidden="true">
                    <div className="kg-float-halo" />
                    <div className={`kg-float-emblem ${isDone ? "kg-is-done" : ""}`}>
                      {isDone ? "⭐" : iconFor(s)}
                    </div>
                  </div>

                  <div className="kg-arch-roof">
                    <b>{s.order ?? i + 1}</b> {s.title}
                    {isDone && <span className="kg-retry-tag" title="Level wiederholen">🔄</span>}
                  </div>
                  <div className="kg-arch-portal">
                    <div className="kg-portal-marker">{isDone ? "✨" : "🚧"}</div>
                    <div className="kg-gate-arm" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Destination: Kölner Dom Plaza (Finish Landmark) */}
          <div className="kg-finish" style={{ left: `${20 + TRAVEL}vw` }}>
            <div className="kg-dom-plaza">
              <div className="kg-dom-spires">⛪</div>
              <span>Kölner Dom Geschafft!</span>
            </div>
          </div>
        </div>

        {/* Animated Traveler Character with Vehicle & Suit */}
        <div ref={heroRef} className="kg-hero" aria-hidden="true">
          <Traveler
            isWalking={isWalking}
            vehicle={currentVehicle}
            suit={currentSuit}
            gender={gender}
            skinTone={skinTone}
            hairColor={hairColor}
          />
        </div>

        {/* Current Landmark Banner */}
        <div className="kg-loc-banner">
          <span>{landmark.name}</span> · {landmark.sub}
        </div>

        {/* Cinematic Journey HUD & Minimap */}
        <header className="kg-hud">
          <div className="kg-hud-top">
            <a className="kg-back" href={backHref}>
              ← Kurs
            </a>
            <div className="kg-title">
              <strong>{city.city} Entdeckungsreise</strong>
              <span>{city.subtitle}</span>
            </div>
            <div className="kg-hud-actions">
              {/* Standalone Gold Coin Wallet Pill */}
              <div className="kg-coin-wallet-pill" title="Dein Münzen-Guthaben">
                <span className="kg-coin-wallet-icon">🪙</span>
                <span className="kg-coin-wallet-num">{coinsWallet}</span>
                <small className="kg-coin-wallet-text">Münzen</small>
                {coinDelta && (
                  <span className={`kg-coin-delta-float is-${coinDelta.type}`}>
                    {coinDelta.text}
                  </span>
                )}
              </div>

              <button
                className="kg-shop-btn"
                onClick={() => setShopOpen(true)}
                title="Fahrzeuge & Outfits Belohnungs-Garage öffnen"
              >
                <span>🎁 Garage</span>
                {coinsWallet >= 6 && <span className="kg-shop-notify-dot" />}
              </button>
              <button
                className="kg-shop-btn"
                style={{ background: "#eff6ff", borderColor: "#93c5fd", color: "#1d4ed8" }}
                onClick={() => setPuzzleState({ puzzleIndex: 0, reward: 80 })}
                title="Kölner Kreuzwort-Puzzle spielen (+Bonus Münzen!)"
              >
                <span>🧩 Rätsel</span>
              </button>
              <button
                className="kg-retry-btn"
                onClick={handleResetJourney}
                title="Ganze Reise neu starten (Restart whole journey)"
              >
                🔄 Neustart
              </button>
              <button
                className="kg-audio-btn"
                onClick={handleToggleSound}
                title={muted ? "Ton einschalten" : "Ton stummschalten"}
              >
                {muted ? "🔇 Ton aus" : "🔊 Ton an"}
              </button>
              <button className="kg-bag" onClick={() => setBagOpen(true)}>
                📖 Wörter <b>{bag.length}</b>
              </button>
            </div>
          </div>

          {/* Journey Milestone Minimap */}
          <div className="kg-minimap" aria-hidden="true">
            <div className="kg-minimap-track">
              <div className="kg-minimap-fill" style={{ transform: `scaleX(${scrollProgress})` }} />
            </div>

            {/* Traveler walker icon on minimap */}
            <div
              className="kg-minimap-walker"
              style={{ left: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
            >
              🚶
            </div>

            {/* Checkpoint milestone nodes */}
            {stops.map((s, idx) => {
              const nodeP = pos[idx] * 100;
              const isNodeDone = done.has(s.id);
              const isCurrent = Math.abs(scrollProgress - pos[idx]) < 0.04;
              return (
                <div
                  key={s.id}
                  className={`kg-minimap-node ${isNodeDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
                  style={{ left: `${nodeP}%` }}
                  title={s.title}
                />
              );
            })}
          </div>
        </header>

        {/* Scroll Hint */}
        <div className="kg-hint">
          <span>↓ Scrollen zum Wandern</span> · {done.size}/{n} Meilensteine
        </div>

        {/* Toast popup */}
        {toast && (
          <div className="kg-toast" role="status">
            {toast}
          </div>
        )}

        {/* Finished banner */}
        {finished && (
          <div className="kg-finish-banner">
            <div className="kg-finish-msg">🎉 Herzlichen Glückwunsch! Köln geschafft!</div>
            <div className="kg-finish-actions">
              <button className="kg-btn-retry" onClick={handleResetJourney}>
                🔄 Nochmal von vorn
              </button>
              <a href={backHref}>Nächste Stadt →</a>
            </div>
          </div>
        )}
      </div>

      {/* Active Obstacle / Quiz Modal */}
      {activeStop && (
        <Obstacle
          key={activeStop.id}
          stop={activeStop}
          onPass={(stars) => handlePass(activeStop, stars)}
          onClose={handleClose}
        />
      )}

      {/* Wortschatz Notebook Modal */}
      {bagOpen && (
        <div
          className="kg-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Wortschatz"
          onClick={() => setBagOpen(false)}
        >
          <div className="kg-card" onClick={(e) => e.stopPropagation()}>
            <div className="kg-card-head">
              <h2>📖 Dein Kölner Wortschatz ({bag.length})</h2>
              <button className="kg-btn" onClick={() => setBagOpen(false)}>
                Schließen
              </button>
            </div>
            {bag.length === 0 ? (
              <p>Noch keine Vokabeln gesammelt. Scrolle die Straße entlang!</p>
            ) : (
              <ul className="kg-words">
                {bag.map((w) => (
                  <li key={w.key}>
                    <b>{w.de}</b> <span>{w.hi}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Rewards & Garage Shop Modal 🎁 */}
      {shopOpen && (
        <ShopModal
          coins={coinsWallet}
          gender={gender}
          skinTone={skinTone}
          hairColor={hairColor}
          unlockedVehicles={unlockedVehicles}
          unlockedSuits={unlockedSuits}
          currentVehicle={currentVehicle}
          currentSuit={currentSuit}
          onChangeGender={handleChangeGender}
          onChangeSkinTone={handleChangeSkinTone}
          onChangeHairColor={handleChangeHairColor}
          onEquipVehicle={handleEquipVehicle}
          onEquipSuit={handleEquipSuit}
          onUnlockVehicle={handleUnlockVehicle}
          onUnlockSuit={handleUnlockSuit}
          onClose={() => setShopOpen(false)}
        />
      )}

      {/* Surprise Mystery Event Modal 🎉 */}
      {surpriseModal && (
        <div
          className="kg-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSurpriseModal(null)}
        >
          <div className="kg-card kg-surprise-card" onClick={(e) => e.stopPropagation()}>
            <div className="kg-surprise-badge">🎁</div>
            <h2>{surpriseModal.title}</h2>
            <div className="kg-surprise-coins">+{surpriseModal.coins} 🪙 Bonus-Münzen!</div>

            {surpriseModal.giftName && (
              <div className="kg-surprise-gift-box">
                <b>🎉 Geschenk: {surpriseModal.giftName}</b>
                <p>{surpriseModal.giftDesc}</p>
              </div>
            )}

            {/* Crossword Puzzle Challenge Card */}
            <div
              style={{
                background: "#eff6ff",
                border: "2px dashed #93c5fd",
                borderRadius: "16px",
                padding: "14px",
                margin: "12px 0 18px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "32px" }}>🧩</span>
                <div>
                  <strong style={{ color: "#1e40af", fontSize: "15px", display: "block" }}>
                    Bonus-Minigame: Kölner Kreuzwort-Puzzle!
                  </strong>
                  <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#2563eb" }}>
                    Löse das Wörter-Gitter aus deinen bisher gelernten Vokabeln und sichere dir extra Jackpot-Münzen!
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                className="kg-btn kg-btn-primary"
                onClick={() => {
                  const pIdx = surpriseModal.puzzleIndex ?? 0;
                  setSurpriseModal(null);
                  setPuzzleState({ puzzleIndex: pIdx, reward: surpriseModal.coins });
                }}
              >
                🧩 Kreuzworträtsel spielen (+Bonus 🪙)
              </button>
              <button
                className="kg-btn"
                style={{ background: "#f1f5f9", color: "#334155" }}
                onClick={() => setSurpriseModal(null)}
              >
                ➔ Jetzt weitergehen (Später spielen)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Crossword Word Puzzle Modal 🧩 */}
      {puzzleState && (
        <CrosswordPuzzle
          puzzleIndex={puzzleState.puzzleIndex}
          onComplete={(coinsWon) => {
            triggerCoinDelta(`+${coinsWon} 🪙`, "plus");
            setCoinsWallet((prev) => {
              const nv = prev + coinsWon;
              try {
                localStorage.setItem("koeln_coin_wallet", String(nv));
              } catch {}
              return nv;
            });
            setToast(`🎉 Kreuzworträtsel gemeistert! +${coinsWon} 🪙 Jackpot erhalten!`);
            setPuzzleState(null);
          }}
          onClose={() => setPuzzleState(null)}
        />
      )}
    </div>
  );
}
