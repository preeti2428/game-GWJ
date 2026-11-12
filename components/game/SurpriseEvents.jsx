"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  playCoinSound,
  playCorrectSound,
  playWrongSound,
  playPassSound,
  speakGermanWord,
} from "@/lib/audio";

/* =========================================================================
   1. MINI-GAME 1: GLÜCKSRAD (LUCKY SPINNING WHEEL) 🎡
   ========================================================================= */
const WHEEL_SEGMENTS = [
  { label: "+50 🪙", coins: 50, color: "#e63946", text: "#fff" },
  { label: "0 🪙 (Niete)", coins: 0, color: "#64748b", text: "#fff" },
  { label: "+100 🪙", coins: 100, color: "#ffd166", text: "#1a1512", isJackpot: true },
  { label: "+20 🪙", coins: 20, color: "#2a9d8f", text: "#fff" },
  { label: "+35 🪙", coins: 35, color: "#457b9d", text: "#fff" },
  { label: "0 🪙 (Niete)", coins: 0, color: "#475569", text: "#fff" },
  { label: "+75 🪙", coins: 75, color: "#8338ec", text: "#fff" },
  { label: "+15 🪙", coins: 15, color: "#06d6a0", text: "#1a1512" },
];

export function LuckyWheel({ onFinish }) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);

  function spinWheel() {
    if (spinning || wonPrize) return;
    setSpinning(true);

    // Random pick
    const winIdx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segAngle = 360 / WHEEL_SEGMENTS.length;
    // Extra rotations (5 to 8 full spins) + offset
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    // Align segment to top indicator (270 deg)
    const targetAngle = extraSpins + (360 - winIdx * segAngle - segAngle / 2);

    setAngle(targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const prize = WHEEL_SEGMENTS[winIdx];
      setWonPrize(prize);
      if (prize.coins > 0) {
        playPassSound();
        playCoinSound();
      } else {
        playWrongSound();
      }
    }, 4200);
  }

  return (
    <div className="kg-minigame-card kg-wheel-wrap">
      <div className="kg-minigame-badge">🎡 Bonus-Spiel 1 von 3</div>
      <h2 className="kg-minigame-title">Kölner Glücksrad</h2>
      <p className="kg-minigame-desc">
        Drehe am Glücksrad und gewinne bis zu <strong>100 Goldmünzen</strong> für deine Garage!
      </p>

      <div className="kg-wheel-stage">
        {/* Top Pointer Needle */}
        <div className="kg-wheel-needle" />

        {/* Rotating Wheel Circle */}
        <div
          className="kg-wheel-circle"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: spinning ? "transform 4.2s cubic-bezier(0.15, 0.9, 0.25, 1)" : "none",
          }}
        >
          {WHEEL_SEGMENTS.map((seg, idx) => {
            const rot = (360 / WHEEL_SEGMENTS.length) * idx;
            return (
              <div
                key={idx}
                className="kg-wheel-slice"
                style={{
                  transform: `rotate(${rot}deg)`,
                  backgroundColor: seg.color,
                  color: seg.text,
                }}
              >
                <span className="kg-slice-text">{seg.label}</span>
              </div>
            );
          })}
          {/* Wheel Center Button */}
          <div className="kg-wheel-center" onClick={spinWheel}>
            <span>{spinning ? "..." : "DREHEN"}</span>
          </div>
        </div>
      </div>

      {wonPrize ? (
        <div className="kg-prize-announce">
          {wonPrize.coins > 0 ? (
            <>
              <h3>🎉 Glückwunsch!</h3>
              <p>
                Du hast <strong>{wonPrize.label}</strong> gewonnen!
              </p>
              <button className="kg-btn kg-btn-primary" onClick={() => onFinish(wonPrize.coins)}>
                {wonPrize.coins} Münzen einsammeln ➔
              </button>
            </>
          ) : (
            <>
              <h3>😢 Schade!</h3>
              <p>Das Rad ist auf <strong>Niete (0 Münzen)</strong> gelandet!</p>
              <button className="kg-btn" onClick={() => onFinish(0)}>
                Weitergehen (0 Münzen) ➔
              </button>
            </>
          )}
        </div>
      ) : (
        <button
          className="kg-btn kg-btn-primary"
          onClick={spinWheel}
          disabled={spinning}
          style={{ marginTop: 20 }}
        >
          {spinning ? "Rad dreht sich…" : "🎡 Jetzt am Rad drehen!"}
        </button>
      )}
    </div>
  );
}

/* =========================================================================
   2. MINI-GAME 2: FOTO-DETEKTIV (TRUE / FALSE WITH SELF-CONTAINED CRISP ART) 🖼️
   ========================================================================= */

function DomIllustration() {
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="60%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <linearGradient id="domGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#skyGrad)" />
      <circle cx="200" cy="95" r="32" fill="#fbbf24" opacity="0.9" />
      <rect y="185" width="400" height="35" fill="#0284c7" />
      <path d="M0 190 Q 100 185, 200 190 T 400 190" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.7" />
      {/* Spires */}
      <polygon points="135,185 155,40 175,185" fill="url(#domGrad)" />
      <polygon points="152,45 155,16 158,45" fill="#dc2626" />
      <polygon points="225,185 245,40 265,185" fill="url(#domGrad)" />
      <polygon points="242,45 245,16 248,45" fill="#dc2626" />
      {/* Central nave */}
      <rect x="175" y="100" width="50" height="85" fill="#1e293b" />
      <polygon points="175,100 200,70 225,100" fill="#0f172a" />
      {/* Rose window */}
      <circle cx="200" cy="118" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
      <circle cx="200" cy="118" r="6" fill="#dc2626" />
      {/* Portal */}
      <path d="M192 185 A 8 10 0 0 1 208 185 Z" fill="#d97706" />
      {/* Windows */}
      <rect x="152" y="75" width="6" height="20" rx="3" fill="#fbbf24" opacity="0.85" />
      <rect x="242" y="75" width="6" height="20" rx="3" fill="#fbbf24" opacity="0.85" />
      {/* Clouds */}
      <ellipse cx="60" cy="50" rx="28" ry="12" fill="#fff" opacity="0.8" />
      <ellipse cx="340" cy="60" rx="32" ry="13" fill="#fff" opacity="0.8" />
    </svg>
  );
}

function FoodIllustration() {
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="tableGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <rect width="400" height="135" fill="#fef3c7" />
      <rect y="135" width="400" height="85" fill="url(#tableGrad)" />
      {/* Pizza Plate */}
      <ellipse cx="200" cy="155" rx="95" ry="50" fill="#e2e8f0" />
      {/* Pizza Crust */}
      <ellipse cx="200" cy="153" rx="85" ry="42" fill="#d97706" stroke="#b45309" strokeWidth="3" />
      {/* Cheese */}
      <ellipse cx="200" cy="152" rx="72" ry="34" fill="#facc15" />
      {/* Toppings */}
      <circle cx="160" cy="146" r="9" fill="#dc2626" />
      <circle cx="230" cy="143" r="10" fill="#dc2626" />
      <circle cx="195" cy="160" r="11" fill="#dc2626" />
      <circle cx="170" cy="162" r="7" fill="#16a34a" />
      <circle cx="232" cy="158" r="8" fill="#16a34a" />
      <circle cx="204" cy="138" r="7" fill="#16a34a" />
      {/* Drink Glass */}
      <rect x="315" y="105" width="28" height="50" rx="4" fill="#ef4444" opacity="0.9" />
      <line x1="329" y1="85" x2="329" y2="135" stroke="#facc15" strokeWidth="4" />
      {/* Fork */}
      <rect x="65" y="125" width="7" height="45" rx="3" fill="#64748b" />
      <path d="M60 125 L60 110 M65 125 L65 110 M70 125 L70 110 M77 125 L77 110" stroke="#64748b" strokeWidth="2.5" />
    </svg>
  );
}

function BreadIllustration() {
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="breadBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
        <linearGradient id="crustGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#breadBg)" />
      {/* Board */}
      <rect x="45" y="150" width="310" height="20" rx="8" fill="#78350f" />
      {/* Loaf */}
      <path d="M85 150 C 85 75, 280 75, 280 150 Z" fill="url(#crustGrad)" stroke="#78350f" strokeWidth="3" />
      {/* Slash cuts */}
      <path d="M120 125 Q 135 100, 145 130" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M170 120 Q 185 95, 195 125" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M220 125 Q 235 100, 245 130" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.9" />
      {/* Bread slice */}
      <path d="M275 150 C 275 105, 325 105, 325 150 Z" fill="#fef08a" stroke="#b45309" strokeWidth="2.5" />
      <ellipse cx="300" cy="128" rx="14" ry="16" fill="#fef9c3" />
      {/* Wheat */}
      <path d="M48 115 Q 65 95, 55 65" stroke="#d97706" strokeWidth="2.5" fill="none" />
      <ellipse cx="50" cy="72" rx="4" ry="8" fill="#f59e0b" transform="rotate(-20 50 72)" />
      <ellipse cx="59" cy="82" rx="4" ry="8" fill="#f59e0b" transform="rotate(20 59 82)" />
      <ellipse cx="53" cy="94" rx="4" ry="8" fill="#f59e0b" transform="rotate(-20 53 94)" />
    </svg>
  );
}

function BicycleIllustration() {
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#skyB)" />
      <rect y="175" width="400" height="45" fill="#64748b" />
      <line x1="0" y1="175" x2="400" y2="175" stroke="#475569" strokeWidth="3" />
      {/* Rear Wheel */}
      <circle cx="110" cy="142" r="35" fill="none" stroke="#0f172a" strokeWidth="5" />
      <circle cx="110" cy="142" r="31" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="110" cy="142" r="5" fill="#0f172a" />
      <line x1="110" y1="111" x2="110" y2="173" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="79" y1="142" x2="141" y2="142" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Front Wheel */}
      <circle cx="285" cy="142" r="35" fill="none" stroke="#0f172a" strokeWidth="5" />
      <circle cx="285" cy="142" r="31" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="285" cy="142" r="5" fill="#0f172a" />
      <line x1="285" y1="111" x2="285" y2="173" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="254" y1="142" x2="316" y2="142" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Bike Frame */}
      <polyline points="110,142 165,142 245,98 165,98 110,142" fill="none" stroke="#e11d48" strokeWidth="5.5" strokeLinejoin="round" />
      <line x1="165" y1="142" x2="165" y2="85" stroke="#e11d48" strokeWidth="5.5" />
      <line x1="165" y1="142" x2="245" y2="98" stroke="#e11d48" strokeWidth="5.5" />
      <line x1="245" y1="98" x2="285" y2="142" stroke="#e11d48" strokeWidth="5.5" />
      {/* Handlebars */}
      <path d="M245 98 L250 75 L270 75" fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
      {/* Saddle */}
      <path d="M145 85 Q 165 80, 180 85" fill="none" stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
      {/* Pedal */}
      <circle cx="165" cy="142" r="10" fill="#334155" />
      <line x1="165" y1="142" x2="175" y2="155" stroke="#0f172a" strokeWidth="3" />
      <rect x="170" y="153" width="10" height="4" rx="2" fill="#0f172a" />
    </svg>
  );
}

function OfficeIllustration() {
  return (
    <svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <defs>
        <linearGradient id="officeBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#officeBg)" />
      {/* Window */}
      <rect x="35" y="25" width="95" height="85" fill="#bae6fd" stroke="#94a3b8" strokeWidth="3.5" />
      <line x1="82" y1="25" x2="82" y2="110" stroke="#94a3b8" strokeWidth="2.5" />
      <line x1="35" y1="67" x2="130" y2="67" stroke="#94a3b8" strokeWidth="2.5" />
      {/* Table */}
      <rect y="145" width="400" height="75" fill="#92400e" />
      <rect y="145" width="400" height="10" fill="#b45309" />
      {/* Laptop */}
      <rect x="170" y="70" width="105" height="70" rx="4" fill="#0f172a" />
      <rect x="175" y="75" width="95" height="60" fill="#0284c7" />
      {/* Screen text lines */}
      <line x1="185" y1="85" x2="225" y2="85" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <line x1="185" y1="95" x2="250" y2="95" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
      <line x1="185" y1="105" x2="215" y2="105" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
      {/* Laptop keyboard base */}
      <path d="M150 140 L295 140 L285 147 L160 147 Z" fill="#94a3b8" />
      {/* Coffee mug */}
      <rect x="315" y="118" width="24" height="27" rx="3" fill="#dc2626" />
      <path d="M339 123 Q 348 131, 339 139" fill="none" stroke="#dc2626" strokeWidth="3.5" />
      {/* Lamp */}
      <path d="M125 145 L125 85 L150 75" fill="none" stroke="#334155" strokeWidth="3.5" />
      <polygon points="145,70 165,80 150,90" fill="#eab308" />
    </svg>
  );
}

const PHOTO_QUESTIONS = [
  {
    Illustration: DomIllustration,
    caption: "Das ist der Kölner Dom.",
    translation: "This is the Cologne Cathedral.",
    isTrue: true,
  },
  {
    Illustration: FoodIllustration,
    caption: "Das ist ein Fahrrad.",
    translation: "This is a bicycle.",
    isTrue: false, // Picture is a restaurant meal with pizza
  },
  {
    Illustration: BreadIllustration,
    caption: "Das ist Brot.",
    translation: "This is bread.",
    isTrue: true,
  },
  {
    Illustration: BicycleIllustration,
    caption: "Das ist ein Fahrrad.",
    translation: "This is a bicycle.",
    isTrue: true,
  },
  {
    Illustration: OfficeIllustration,
    caption: "Das ist eine Kirche.",
    translation: "This is a church.",
    isTrue: false, // Picture is an office workspace
  },
];

export function PhotoTrueFalse({ onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);

  const q = PHOTO_QUESTIONS[currentIdx];

  function handleAnswer(ans) {
    if (picked !== null) return;
    setPicked(ans);

    const isCorrect = ans === q.isTrue;
    if (isCorrect) {
      playCorrectSound();
      setScore((s) => s + 1);
    } else {
      playWrongSound();
    }

    setTimeout(() => {
      setPicked(null);
      if (currentIdx + 1 >= PHOTO_QUESTIONS.length) {
        setDone(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 1000);
  }

  // Coins strictly earned per correct answer: 12 coins each (max 60 coins, 0 if score 0)
  const earnedCoins = score * 12;

  return (
    <div className="kg-minigame-card kg-photo-wrap">
      <div className="kg-minigame-badge">📸 Bonus-Spiel 2 von 3</div>
      <h2 className="kg-minigame-title">Foto-Detektiv: Wahr oder Falsch?</h2>
      <p className="kg-minigame-desc">
        Schau dir das Bild genau an. Stimmt der deutsche Satz? Klicke auf Richtig oder Falsch!
      </p>

      {!done ? (
        <div className="kg-photo-box">
          <div className="kg-photo-meta">
            <span className="kg-step">
              Bild {currentIdx + 1} von {PHOTO_QUESTIONS.length}
            </span>
            <span className="kg-score-chip">Richtige Antworten: <strong>{score}</strong></span>
          </div>

          {/* Guaranteed Beautiful Artwork Illustration */}
          <div className="kg-photo-frame">
            <q.Illustration />
          </div>

          <div className="kg-photo-caption-card">
            <h3 className="kg-photo-caption">{q.caption}</h3>
            <small className="kg-photo-translation">({q.translation})</small>
          </div>

          <div className="kg-tf-buttons">
            <button
              className={`kg-btn-tf kg-btn-true ${
                picked !== null
                  ? q.isTrue
                    ? "kg-tf-correct"
                    : picked === true
                    ? "kg-tf-wrong"
                    : ""
                  : ""
              }`}
              onClick={() => handleAnswer(true)}
              disabled={picked !== null}
            >
              ✅ Richtig (Wahr)
            </button>
            <button
              className={`kg-btn-tf kg-btn-false ${
                picked !== null
                  ? !q.isTrue
                    ? "kg-tf-correct"
                    : picked === false
                    ? "kg-tf-wrong"
                    : ""
                  : ""
              }`}
              onClick={() => handleAnswer(false)}
              disabled={picked !== null}
            >
              ❌ Falsch
            </button>
          </div>
        </div>
      ) : (
        <div className="kg-prize-announce">
          <h3>🎉 Detektiv-Runde beendet!</h3>
          <p>
            Du hast <strong>{score} von {PHOTO_QUESTIONS.length}</strong> Bildern richtig erkannt!
          </p>
          {score > 0 ? (
            <>
              <div className="kg-reward-badge">🪙 +{earnedCoins} Goldmünzen verdient!</div>
              <button className="kg-btn kg-btn-primary" onClick={() => onFinish(earnedCoins)}>
                {earnedCoins} Münzen einsammeln ➔
              </button>
            </>
          ) : (
            <>
              <div className="kg-reward-badge" style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }}>
                0 Münzen (Leider kein Bild richtig – beim nächsten Mal klappt es!)
              </div>
              <button className="kg-btn" onClick={() => onFinish(0)}>
                Weitergehen (0 Münzen) ➔
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   3. MINI-GAME 3: KREUZWORT-RÄTSEL (CROSSWORD GRID & LETTER PUZZLE) 🧩
   (Matches user's exact uploaded image design!)
   ========================================================================= */
const CROSSWORD_DATA = {
  gridSize: 5, // 5x5 grid
  words: [
    {
      id: "w1",
      word: "DOM",
      clue: "Große berühmte Kirche in Köln",
      translation: "Cathedral (Church)",
      emoji: "⛪",
      icon: "⛪",
      direction: "across",
      startRow: 0,
      startCol: 1,
      // letters at (0,1)='D', (0,2)='O', (0,3)='M'
    },
    {
      id: "w2",
      word: "NAME",
      clue: "Ich heiße Anna. Das ist mein...",
      translation: "Name",
      emoji: "🏷️",
      icon: "🏷️",
      direction: "across",
      startRow: 2,
      startCol: 0,
      // letters at (2,0)='N', (2,1)='A', (2,2)='M', (2,3)='E'
    },
    {
      id: "w3",
      word: "TAG",
      clue: "Guten ... ! Begrüßung am Nachmittag",
      translation: "Day (Good day)",
      emoji: "☀️",
      icon: "☀️",
      direction: "across",
      startRow: 4,
      startCol: 1,
      // letters at (4,1)='T', (4,2)='A', (4,3)='G'
    },
    {
      id: "w4",
      word: "LAND",
      clue: "Deutschland ist ein...",
      translation: "Country",
      emoji: "🗺️",
      icon: "🗺️",
      direction: "down",
      startRow: 1,
      startCol: 1,
      // letters at (1,1)='L', (2,1)='A', (3,1)='N', (4,1)='D'
    },
  ],
};

// Letter keyboard pool for current puzzle
const LETTER_KEYBOARD = [
  ["D", "O", "M", "N"],
  ["A", "E", "T", "G"],
  ["L", "A", "N", "D"],
];

export function CrosswordPuzzle({ onFinish }) {
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [solvedWords, setSolvedWords] = useState(new Set()); // set of solved word IDs
  const [currentInput, setCurrentInput] = useState([]); // array of letters entered
  const [shake, setShake] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const activeWord = CROSSWORD_DATA.words[activeWordIdx];

  // Sound pronunciation
  function playWordVoice() {
    speakGermanWord(activeWord.word);
  }

  // Handle letter click from keyboard
  function handleLetterClick(letter) {
    if (solvedWords.has(activeWord.id) || currentInput.length >= activeWord.word.length) return;
    const nextInput = [...currentInput, letter];
    setCurrentInput(nextInput);

    // If word is filled, check answer!
    if (nextInput.length === activeWord.word.length) {
      const spelled = nextInput.join("");
      if (spelled === activeWord.word) {
        // Correct!
        playCorrectSound();
        const nextSolved = new Set(solvedWords);
        nextSolved.add(activeWord.id);
        setSolvedWords(nextSolved);
        setCurrentInput([]);

        if (nextSolved.size === CROSSWORD_DATA.words.length) {
          playPassSound();
          setTimeout(() => setAllDone(true), 600);
        } else {
          // Move to next unsolved word
          const nextUnsolved = CROSSWORD_DATA.words.findIndex(
            (w, i) => i !== activeWordIdx && !nextSolved.has(w.id)
          );
          if (nextUnsolved !== -1) {
            setTimeout(() => {
              setActiveWordIdx(nextUnsolved);
              setCurrentInput([]);
            }, 500);
          }
        }
      } else {
        // Wrong spelling
        playWrongSound();
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setCurrentInput([]);
        }, 600);
      }
    }
  }

  function handleBackspace() {
    setCurrentInput((prev) => prev.slice(0, -1));
  }

  function nextWord() {
    setActiveWordIdx((i) => (i + 1) % CROSSWORD_DATA.words.length);
    setCurrentInput([]);
  }

  function prevWord() {
    setActiveWordIdx((i) => (i - 1 + CROSSWORD_DATA.words.length) % CROSSWORD_DATA.words.length);
    setCurrentInput([]);
  }

  // Build grid cell mapping
  const gridCells = Array(CROSSWORD_DATA.gridSize)
    .fill(null)
    .map(() => Array(CROSSWORD_DATA.gridSize).fill(null));

  CROSSWORD_DATA.words.forEach((w) => {
    const isSolved = solvedWords.has(w.id);
    for (let i = 0; i < w.word.length; i++) {
      const r = w.direction === "across" ? w.startRow : w.startRow + i;
      const c = w.direction === "across" ? w.startCol + i : w.startCol;
      gridCells[r][c] = {
        letter: isSolved ? w.word[i] : null,
        wordId: w.id,
      };
    }
  });

  return (
    <div className="kg-minigame-card kg-crossword-wrapper">
      <div className="kg-minigame-badge">🧩 Bonus-Spiel 3 von 3</div>
      <h2 className="kg-minigame-title">Kölner Kreuzwort-Puzzle</h2>
      <p className="kg-minigame-desc">
        Bilde deutsche Wörter mit den Buchstaben und fülle das Rätselgitter!
      </p>

      {!allDone ? (
        <div className="kg-crossword-layout">
          {/* ================= LEFT COLUMN: CROSSWORD GRID ================= */}
          <div className="kg-cw-left">
            <div className="kg-cw-grid-frame">
              <div className="kg-cw-grid">
                {gridCells.map((row, r) =>
                  row.map((cell, c) => {
                    if (!cell) {
                      return <div key={`${r}-${c}`} className="kg-cw-cell kg-cw-empty" />;
                    }

                    // Check if part of active word
                    const isActiveWord =
                      activeWord.direction === "across"
                        ? r === activeWord.startRow &&
                          c >= activeWord.startCol &&
                          c < activeWord.startCol + activeWord.word.length
                        : c === activeWord.startCol &&
                          r >= activeWord.startRow &&
                          r < activeWord.startRow + activeWord.word.length;

                    const isCurrentLetter =
                      isActiveWord &&
                      (activeWord.direction === "across"
                        ? c - activeWord.startCol === currentInput.length
                        : r - activeWord.startRow === currentInput.length);

                    let displayLetter = cell.letter;
                    if (isActiveWord && !cell.letter) {
                      const offset =
                        activeWord.direction === "across"
                          ? c - activeWord.startCol
                          : r - activeWord.startRow;
                      displayLetter = currentInput[offset] || "";
                    }

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`kg-cw-cell kg-cw-active ${
                          isActiveWord ? "kg-cw-highlight" : ""
                        } ${isCurrentLetter ? "kg-cw-cursor" : ""} ${
                          cell.letter ? "kg-cw-solved" : ""
                        }`}
                      >
                        {displayLetter}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Navigation Buttons: ◀ and ▶ */}
            <div className="kg-cw-nav-buttons">
              <button className="kg-cw-arrow-btn" onClick={prevWord} title="Vorheriges Wort">
                ◀
              </button>
              <span className="kg-cw-word-counter">
                Wort {activeWordIdx + 1} / {CROSSWORD_DATA.words.length}
              </span>
              <button className="kg-cw-arrow-btn" onClick={nextWord} title="Nächstes Wort">
                ▶
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: CLUE & LETTER KEYBOARD ================= */}
          <div className="kg-cw-right">
            {/* Clue Card */}
            <div className="kg-cw-clue-card">
              <div className="kg-cw-clue-head">
                <button
                  className="kg-cw-speaker-btn"
                  onClick={playWordVoice}
                  title="Aussprache anhören 🔊"
                >
                  🔊
                </button>
                <div className="kg-cw-clue-icon">{activeWord.emoji}</div>
              </div>

              <div className="kg-cw-clue-text">
                <p><strong>Hinweis:</strong> {activeWord.clue}</p>
                <small>Bedeutung: {activeWord.translation}</small>
              </div>

              {/* Word Blank Underline Slots */}
              <div className={`kg-cw-slots-row ${shake ? "kg-shake" : ""}`}>
                {Array(activeWord.word.length)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`kg-cw-slot-box ${
                        currentInput[i] ? "has-letter" : ""
                      } ${solvedWords.has(activeWord.id) ? "is-solved" : ""}`}
                    >
                      {solvedWords.has(activeWord.id)
                        ? activeWord.word[i]
                        : currentInput[i] || ""}
                    </div>
                  ))}
              </div>
            </div>

            {/* Letter Tile Bank (2 Rows) */}
            <div className="kg-cw-keyboard">
              {LETTER_KEYBOARD.map((row, rIdx) => (
                <div key={rIdx} className="kg-cw-kb-row">
                  {row.map((ch, cIdx) => (
                    <button
                      key={cIdx}
                      className="kg-cw-key-tile"
                      onClick={() => handleLetterClick(ch)}
                      disabled={solvedWords.has(activeWord.id)}
                    >
                      {ch.toLowerCase()}
                    </button>
                  ))}
                </div>
              ))}

              <div className="kg-cw-kb-actions">
                <button
                  className="kg-cw-action-btn"
                  onClick={handleBackspace}
                  disabled={currentInput.length === 0}
                >
                  ⌫ Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="kg-prize-announce">
          <h3>🎉 Kreuzwort-Rätsel gemeistert!</h3>
          <p>Du hast alle Wörter fehlerfrei im Gitter verbunden!</p>
          <div className="kg-reward-badge">🪙 +150 Goldmünzen JACKPOT!</div>
          <button className="kg-btn kg-btn-primary" onClick={() => onFinish(150)}>
            Jackpot einsammeln & Weiterreisen ➔
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   4. MAIN SURPRISE EVENT MODAL DISPATCHER
   ========================================================================= */
export default function SurpriseModal({ eventType, onComplete, onSkip }) {
  return (
    <div className="kg-overlay" role="dialog" aria-modal="true">
      <div className="kg-card kg-surprise-modal-box">
        <button className="kg-close-x" onClick={onSkip} title="Überspringen">
          ✕
        </button>

        {eventType === "wheel" && <LuckyWheel onFinish={onComplete} />}
        {eventType === "photo" && <PhotoTrueFalse onFinish={onComplete} />}
        {eventType === "crossword" && <CrosswordPuzzle onFinish={onComplete} />}
      </div>
    </div>
  );
}

