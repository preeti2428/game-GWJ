"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Obstacle from "./Obstacle";
import Traveler from "./Traveler";
import ShopModal, { VEHICLE_LIST, SUIT_LIST } from "./ShopModal";
import SurpriseModal from "./SurpriseEvents";
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

// 3 Surprise Mini-Game Events along the journey (After Stop 3, Stop 6, Stop 9)
const SURPRISE_EVENTS = [
  {
    id: "event-1",
    type: "wheel",
    p: 0.32, // Right after Stop 3 (0.27)
    title: "🎡 Kölner Glücksrad!",
    desc: "Drehe am Glücksrad und gewinne bis zu 100 Goldmünzen!",
    icon: "🎡",
    tag: "Bonus: Glücksrad",
  },
  {
    id: "event-2",
    type: "photo",
    p: 0.58, // Right after Stop 6 (0.54)
    title: "📸 Foto-Detektiv!",
    desc: "Wahr oder Falsch Bilder-Quiz! Erkenne die Fotos für +100 Münzen!",
    icon: "📸",
    tag: "Bonus: Foto-Quiz",
  },
  {
    id: "event-3",
    type: "crossword",
    p: 0.85, // Right after Stop 9 (0.81)
    title: "🧩 Kölner Kreuzwort-Puzzle!",
    desc: "Löse das Wörter-Gitter mit deinen Vokabeln für +150 Münzen JACKPOT!",
    icon: "🧩",
    tag: "Bonus: Kreuzwort",
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
  const [openedEvents, setOpenedEvents] = useState(new Set());
  const [activeEvent, setActiveEvent] = useState(null); // active mini-game { type: 'wheel'|'photo'|'crossword', ... }
  const [eventInvitation, setEventInvitation] = useState(null); // optional prompt to play or skip
  const [shopOpen, setShopOpen] = useState(false);

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
  const openedEventsRef = useRef(openedEvents);
  const walkTimer = useRef(null);

  useEffect(() => {
    openedEventsRef.current = openedEvents;
  }, [openedEvents]);

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
      const savedEvents = JSON.parse(localStorage.getItem(`koeln_events:${chapterSlug}`) || "[]");
      if (Array.isArray(savedEvents)) {
        const eSet = new Set(savedEvents);
        setOpenedEvents(eSet);
        openedEventsRef.current = eSet;
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

            // Check if player reached a Surprise Event (After Stop 3, 6, 9)
            const hitEvent = SURPRISE_EVENTS.find(
              (ev) => ev.p <= p && !openedEventsRef.current.has(ev.id)
            );
            if (hitEvent && !activeRef.current) {
              openedEventsRef.current.add(hitEvent.id);
              setOpenedEvents(new Set(openedEventsRef.current));
              try {
                localStorage.setItem(
                  `koeln_events:${chapterSlug}`,
                  JSON.stringify([...openedEventsRef.current])
                );
              } catch {}
              playPassSound();
              setEventInvitation(hitEvent);
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

  // Handle clicking or triggering surprise mini-game event
  function handleTriggerEvent(ev) {
    setEventInvitation(ev);
  }

  function handleStartEvent() {
    if (!eventInvitation) return;
    setActiveEvent(eventInvitation);
    setEventInvitation(null);
  }

  function handleCompleteEvent(wonCoins) {
    if (!activeEvent) return;
    const evId = activeEvent.id;
    const nextEvents = new Set(openedEvents);
    nextEvents.add(evId);
    setOpenedEvents(nextEvents);
    try {
      localStorage.setItem(`koeln_events:${chapterSlug}`, JSON.stringify([...nextEvents]));
    } catch {}

    setCoinsWallet((prev) => {
      const nv = prev + wonCoins;
      try {
        localStorage.setItem("koeln_coin_wallet", String(nv));
      } catch {}
      return nv;
    });
    triggerCoinDelta(`+${wonCoins} 🪙`, "plus");
    setToast(`🎉 +${wonCoins} 🪙 Jackpot gewonnen!`);
    setActiveEvent(null);
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

          {/* 3 Surprise Mini-Game Pavilions (After Stop 3, Stop 6, Stop 9) */}
          {SURPRISE_EVENTS.map((ev) => {
            const isOpened = openedEvents.has(ev.id);
            return (
              <div
                key={ev.id}
                className={`kg-pavilion ${isOpened ? "kg-pavilion-done" : ""}`}
                style={{ left: `${20 + ev.p * TRAVEL}vw` }}
                onClick={() => handleTriggerEvent(ev)}
                title={isOpened ? "Bereits abgeschlossen ⭐" : "🎁 Klicke für das Bonus-Spiel!"}
              >
                <div className="kg-pavilion-halo" />
                <div className="kg-pavilion-icon">{isOpened ? "⭐" : ev.icon}</div>
                <div className="kg-pavilion-tag">{isOpened ? "Beendet ✓" : ev.tag}</div>
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

      {/* Surprise Event Invitation Modal (Optional / Non-compulsory) */}
      {eventInvitation && (
        <div
          className="kg-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setEventInvitation(null)}
        >
          <div className="kg-card kg-surprise-card" onClick={(e) => e.stopPropagation()}>
            <div className="kg-surprise-badge">{eventInvitation.icon}</div>
            <h2>{eventInvitation.title}</h2>
            <p style={{ fontSize: 16, color: "#374151", margin: "8px 0 16px" }}>
              {eventInvitation.desc}
            </p>

            <div className="kg-reward-badge" style={{ marginBottom: 20 }}>
              ✨ Freiwilliges Bonus-Spiel · Gewinne riesige Münzen-Jackpots!
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="kg-btn kg-btn-primary"
                onClick={handleStartEvent}
                style={{ fontSize: 16, padding: "14px", width: "100%" }}
              >
                🎮 Jetzt Spielen! (Play Now)
              </button>
              <button
                className="kg-btn"
                onClick={() => setEventInvitation(null)}
                style={{ background: "#f3f4f6", color: "#4b5563", border: "1px solid #d1d5db", width: "100%" }}
              >
                ➔ Überspringen / Weitergehen (Skip)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Surprise Mini-Game Modal 🎮 (Wheel, Photo T/F, Crossword) */}
      {activeEvent && (
        <SurpriseModal
          eventType={activeEvent.type}
          onComplete={handleCompleteEvent}
          onSkip={() => setActiveEvent(null)}
        />
      )}
    </div>
  );
}
