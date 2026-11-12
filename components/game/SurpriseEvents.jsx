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
  { label: "+30 🪙", coins: 30, color: "#f4a261", text: "#2b2118" },
  { label: "+100 🪙", coins: 100, color: "#ffd166", text: "#1a1512", isJackpot: true },
  { label: "+40 🪙", coins: 40, color: "#2a9d8f", text: "#fff" },
  { label: "+70 🪙", coins: 70, color: "#457b9d", text: "#fff" },
  { label: "+20 🪙", coins: 20, color: "#e76f51", text: "#fff" },
  { label: "+80 🪙", coins: 80, color: "#8338ec", text: "#fff" },
  { label: "+60 🪙", coins: 60, color: "#06d6a0", text: "#1a1512" },
];

export function LuckyWheel({ onFinish }) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);

  function spinWheel() {
    if (spinning || wonPrize) return;
    setSpinning(true);
    playCoinSound();

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
      playPassSound();
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
          <h3>🎉 Glückwunsch!</h3>
          <p>
            Du hast <strong>{wonPrize.label}</strong> gewonnen!
          </p>
          <button className="kg-btn kg-btn-primary" onClick={() => onFinish(wonPrize.coins)}>
            {wonPrize.coins} Münzen einsammeln ➔
          </button>
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
   2. MINI-GAME 2: FOTO-DETEKTIV (TRUE / FALSE WITH REAL IMAGES) 🖼️
   ========================================================================= */
const PHOTO_QUESTIONS = [
  {
    image: "https://images.unsplash.com/photo-1548625361-195fe5787e98?w=500&auto=format&fit=crop&q=80",
    caption: "Das ist der Kölner Dom.",
    translation: "This is the Cologne Cathedral.",
    isTrue: true,
  },
  {
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
    caption: "Das ist ein Fahrrad.",
    translation: "This is a bicycle.",
    isTrue: false, // Picture is a restaurant / food
  },
  {
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
    caption: "Das ist Brot.",
    translation: "This is bread.",
    isTrue: true,
  },
  {
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80",
    caption: "Das ist ein Fahrrad.",
    translation: "This is a bicycle.",
    isTrue: true,
  },
  {
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80",
    caption: "Das ist eine Kirche.",
    translation: "This is a church.",
    isTrue: false, // Picture is an office/cafe
  },
];

export function PhotoTrueFalse({ onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);

  const q = PHOTO_QUESTIONS[currentIdx];

  useEffect(() => {
    if (done || picked !== null) return;
    if (timeLeft <= 0) {
      handleAnswer(null); // Time's up
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, done, picked]);

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
      setTimeLeft(6);
      if (currentIdx + 1 >= PHOTO_QUESTIONS.length) {
        setDone(true);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 1200);
  }

  const earnedCoins = 30 + score * 14; // up to 100 coins

  return (
    <div className="kg-minigame-card kg-photo-wrap">
      <div className="kg-minigame-badge">📸 Bonus-Spiel 2 von 3</div>
      <h2 className="kg-minigame-title">Foto-Detektiv: Wahr oder Falsch?</h2>
      <p className="kg-minigame-desc">
        Schau dir das Bild genau an. Stimmt der deutsche Satz? Schnelligkeit zählt!
      </p>

      {!done ? (
        <div className="kg-photo-box">
          <div className="kg-photo-meta">
            <span className="kg-step">
              Bild {currentIdx + 1} von {PHOTO_QUESTIONS.length}
            </span>
            <span className="kg-timer-chip">⏱️ {timeLeft}s</span>
          </div>

          <div className="kg-photo-frame">
            <img src={q.image} alt="Quiz Bild" className="kg-photo-img" />
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
            Du hast <strong>{score} von 5</strong> Bildern richtig erkannt!
          </p>
          <div className="kg-reward-badge">🪙 +{earnedCoins} Goldmünzen verdient!</div>
          <button className="kg-btn kg-btn-primary" onClick={() => onFinish(earnedCoins)}>
            Münzen einsammeln & Weitergehen ➔
          </button>
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
