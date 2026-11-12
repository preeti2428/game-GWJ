"use client";

import React, { useState, useEffect, useMemo } from "react";
import { playCorrectSound, playWrongSound, playPassSound, playCoinSound, speakGermanWord } from "@/lib/audio";

// Pre-defined crossword layouts using words learned in Köln (A1)
export const KOELN_CROSSWORDS = [
  // Puzzle 1: Triggered after Stop 3 (Greetings & Dom)
  {
    id: "puzzle-1",
    title: "Kreuzwort-Rätsel I: Erste Worte am Rhein",
    gridSize: 6,
    rewardCoins: 80,
    words: [
      {
        id: "w1",
        answer: "HALLO",
        direction: "H",
        row: 1,
        col: 0,
        hint: "Begrüßung · Hello / नमस्ते",
        icon: "👋",
      },
      {
        id: "w2",
        answer: "LAND",
        direction: "V",
        row: 1,
        col: 2,
        hint: "Deutschland ist ein... · Country",
        icon: "🌍",
      },
      {
        id: "w3",
        answer: "NAME",
        direction: "H",
        row: 3,
        col: 2,
        hint: "Ich heiße... Mein... ist · Name",
        icon: "🪪",
      },
      {
        id: "w4",
        answer: "DOM",
        direction: "H",
        row: 5,
        col: 1,
        hint: "Das Wahrzeichen von Köln · Kathedrale",
        icon: "⛪",
      },
    ],
  },

  // Puzzle 2: Triggered after Stop 6 (Politeness & Altstadt)
  {
    id: "puzzle-2",
    title: "Kreuzwort-Rätsel II: Höflichkeit & Stadt",
    gridSize: 6,
    rewardCoins: 100,
    words: [
      {
        id: "w1",
        answer: "DANKE",
        direction: "H",
        row: 1,
        col: 0,
        hint: "Vielen Dank! · Thank you",
        icon: "🙏",
      },
      {
        id: "w2",
        answer: "STADT",
        direction: "V",
        row: 0,
        col: 1,
        hint: "Köln ist eine schöne... · City",
        icon: "🏙️",
      },
      {
        id: "w3",
        answer: "BITTE",
        direction: "H",
        row: 3,
        col: 1,
        hint: "Sehr gerne / Bitte schön · Please",
        icon: "🤝",
      },
      {
        id: "w4",
        answer: "TAG",
        direction: "V",
        row: 1,
        col: 4,
        hint: "Guten Tag! · Day",
        icon: "☀️",
      },
    ],
  },

  // Puzzle 3: Triggered after Stop 9 (Master Puzzle before Boss)
  {
    id: "puzzle-3",
    title: "Kreuzwort-Rätsel III: Kölner Meister-Puzzle",
    gridSize: 7,
    rewardCoins: 150,
    words: [
      {
        id: "w1",
        answer: "GUTEN",
        direction: "H",
        row: 1,
        col: 1,
        hint: "Guten Morgen & Guten Abend · Good",
        icon: "🌅",
      },
      {
        id: "w2",
        answer: "NACHT",
        direction: "V",
        row: 1,
        col: 5,
        hint: "Gute Nacht & Schlaf gut · Night",
        icon: "🌙",
      },
      {
        id: "w3",
        answer: "FREUND",
        direction: "H",
        row: 4,
        col: 1,
        hint: "Mein bester Kumpel · Friend",
        icon: "🧑‍🤝‍🧑",
      },
      {
        id: "w4",
        answer: "WOHNEN",
        direction: "V",
        row: 1,
        col: 2,
        hint: "Ich ... in Köln · To live in",
        icon: "🏠",
      },
    ],
  },
];

// Helper to generate keyboard letter tiles for a word (word letters + scrambled distractors)
function generateLetterPool(word) {
  const letters = word.toUpperCase().split("");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const distractorsCount = Math.max(2, 8 - letters.length);
  const distractors = [];
  for (let i = 0; i < distractorsCount; i++) {
    const rand = alphabet[Math.floor(Math.random() * alphabet.length)];
    distractors.push(rand);
  }
  const combined = [...letters, ...distractors].map((char, index) => ({
    id: `${char}-${index}-${Math.random()}`,
    char,
  }));
  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined;
}

export default function CrosswordPuzzle({
  puzzleIndex = 0,
  onComplete,
  onClose,
}) {
  const puzzle = KOELN_CROSSWORDS[puzzleIndex % KOELN_CROSSWORDS.length];
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const activeWord = puzzle.words[activeWordIdx];

  // Solved state per word: { [wordId]: boolean }
  const [solvedWords, setSolvedWords] = useState({});

  // Current inputs for each word: { [wordId]: string[] }
  const [wordInputs, setWordInputs] = useState({});

  // Keyboard pool per word: { [wordId]: Array<{ id, char }> }
  const [letterPools, setLetterPools] = useState({});

  // Selected tile IDs for the active word: string[]
  const [selectedTileIds, setSelectedTileIds] = useState([]);

  // Finished state
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // Initialize pool for active word if not created
  useEffect(() => {
    if (!letterPools[activeWord.id]) {
      const pool = generateLetterPool(activeWord.answer);
      setLetterPools((prev) => ({ ...prev, [activeWord.id]: pool }));
    }
  }, [activeWord, letterPools]);

  // Read current input for active word
  const currentInput = wordInputs[activeWord.id] || [];
  const currentPool = letterPools[activeWord.id] || [];

  // Play word pronunciation
  function handleSpeak() {
    speakGermanWord(activeWord.answer);
  }

  // Tap a letter tile from pool
  function handleSelectTile(tile) {
    if (solvedWords[activeWord.id]) return;
    if (currentInput.length >= activeWord.answer.length) return;
    if (selectedTileIds.includes(tile.id)) return;

    playCoinSound();
    const nextInput = [...currentInput, tile.char];
    const nextTileIds = [...selectedTileIds, tile.id];

    setSelectedTileIds(nextTileIds);
    setWordInputs((prev) => ({ ...prev, [activeWord.id]: nextInput }));

    // Check if word completed
    if (nextInput.length === activeWord.answer.length) {
      const formedWord = nextInput.join("");
      if (formedWord === activeWord.answer.toUpperCase()) {
        // CORRECT!
        playCorrectSound();
        const nextSolved = { ...solvedWords, [activeWord.id]: true };
        setSolvedWords(nextSolved);

        // Check if all words are solved!
        if (puzzle.words.every((w) => nextSolved[w.id])) {
          setTimeout(() => {
            playPassSound();
            setIsAllCompleted(true);
          }, 600);
        } else {
          // Auto advance to next unsolved word
          setTimeout(() => {
            const nextUnsolved = puzzle.words.findIndex((w) => !nextSolved[w.id]);
            if (nextUnsolved !== -1) {
              setActiveWordIdx(nextUnsolved);
              setSelectedTileIds([]);
            }
          }, 800);
        }
      } else {
        // INCORRECT
        playWrongSound();
        setTimeout(() => {
          // Clear current input so user can try again
          setWordInputs((prev) => ({ ...prev, [activeWord.id]: [] }));
          setSelectedTileIds([]);
        }, 600);
      }
    }
  }

  // Remove letter from placed slots
  function handleRemoveSlot(slotIdx) {
    if (solvedWords[activeWord.id]) return;
    if (slotIdx >= currentInput.length) return;

    const nextInput = [...currentInput];
    nextInput.splice(slotIdx, 1);
    const nextTileIds = [...selectedTileIds];
    nextTileIds.splice(slotIdx, 1);

    setSelectedTileIds(nextTileIds);
    setWordInputs((prev) => ({ ...prev, [activeWord.id]: nextInput }));
  }

  // Backspace
  function handleBackspace() {
    if (currentInput.length > 0) {
      handleRemoveSlot(currentInput.length - 1);
    }
  }

  // Shuffle Keyboard Tiles
  function handleShufflePool() {
    if (currentPool.length === 0) return;
    const shuffled = [...currentPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setLetterPools((prev) => ({ ...prev, [activeWord.id]: shuffled }));
  }

  // Arrow navigation
  function handlePrevWord() {
    setActiveWordIdx((prev) => (prev > 0 ? prev - 1 : puzzle.words.length - 1));
    setSelectedTileIds([]);
  }

  function handleNextWord() {
    setActiveWordIdx((prev) => (prev < puzzle.words.length - 1 ? prev + 1 : 0));
    setSelectedTileIds([]);
  }

  // Claim jackpot reward & finish
  function handleClaimReward() {
    onComplete(puzzle.rewardCoins);
  }

  // Build grid matrix
  const gridCells = useMemo(() => {
    const size = puzzle.gridSize;
    const matrix = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => null)
    );

    puzzle.words.forEach((w) => {
      const isSolved = solvedWords[w.id];
      const inputs = wordInputs[w.id] || [];

      for (let i = 0; i < w.answer.length; i++) {
        const r = w.direction === "H" ? w.row : w.row + i;
        const c = w.direction === "H" ? w.col + i : w.col;

        let char = "";
        if (isSolved) {
          char = w.answer[i];
        } else if (inputs[i]) {
          char = inputs[i];
        }

        if (!matrix[r][c]) {
          matrix[r][c] = {
            char,
            isWordCell: true,
            wordIds: [w.id],
          };
        } else {
          matrix[r][c].wordIds.push(w.id);
          if (char) matrix[r][c].char = char;
        }
      }
    });

    return matrix;
  }, [puzzle, solvedWords, wordInputs]);

  // Check if cell belongs to active word
  function isActiveCell(r, c) {
    const w = activeWord;
    if (w.direction === "H") {
      return r === w.row && c >= w.col && c < w.col + w.answer.length;
    } else {
      return c === w.col && r >= w.row && r < w.row + w.answer.length;
    }
  }

  return (
    <div className="kg-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="kg-crossword-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="kg-cw-header">
          <div className="kg-cw-title-wrap">
            <span className="kg-cw-badge">🧩 Überraschungs-Mini-Game</span>
            <h2>{puzzle.title}</h2>
          </div>
          <div className="kg-cw-reward-tag">
            🪙 Jackpot: <strong>+{puzzle.rewardCoins} Münzen!</strong>
          </div>
          <button className="kg-btn-close" onClick={onClose} title="Schließen / Später">
            ✕
          </button>
        </div>

        {/* ================= COMPLETED JACKPOT SCREEN ================= */}
        {isAllCompleted ? (
          <div className="kg-cw-victory-screen">
            <div className="kg-cw-victory-icon">🎉</div>
            <h2 className="kg-cw-victory-title">RÄTSEL VOLLSTÄNDIG GELÖST!</h2>
            <p className="kg-cw-victory-sub">
              Hervorragend! Du hast alle Wörter des Kreuzworträtsels perfekt kombiniert!
            </p>
            <div className="kg-cw-jackpot-bubble">
              <span className="kg-cw-coin-spin">🪙</span>
              <strong>+{puzzle.rewardCoins} GOLDENE MÜNZEN</strong>
            </div>
            <button className="kg-btn kg-btn-primary kg-cw-claim-btn" onClick={handleClaimReward}>
              Münzen einsammeln & Weiterreisen ➔
            </button>
          </div>
        ) : (
          /* ================= MAIN SPLIT CROSSWORD WORKSPACE ================= */
          <div className="kg-cw-workspace">
            {/* 1. LEFT PANEL: INTERACTIVE CROSSWORD GRID */}
            <div className="kg-cw-left-panel">
              <div
                className="kg-cw-grid"
                style={{
                  gridTemplateColumns: `repeat(${puzzle.gridSize}, 1fr)`,
                }}
              >
                {gridCells.map((row, r) =>
                  row.map((cell, c) => {
                    const isCellActive = isActiveCell(r, c);
                    const isCellWord = cell && cell.isWordCell;
                    const isCellSolved = cell?.wordIds.some((id) => solvedWords[id]);

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`kg-cw-cell ${isCellWord ? "is-word-cell" : "is-empty-cell"} ${
                          isCellActive ? "is-active-word" : ""
                        } ${isCellSolved ? "is-solved-cell" : ""}`}
                        onClick={() => {
                          if (cell?.wordIds?.length) {
                            const foundIdx = puzzle.words.findIndex(
                              (w) => w.id === cell.wordIds[0]
                            );
                            if (foundIdx !== -1) setActiveWordIdx(foundIdx);
                          }
                        }}
                      >
                        {cell?.char ? <span>{cell.char}</span> : null}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Arrows & Word Index */}
              <div className="kg-cw-nav-bar">
                <button
                  className="kg-cw-nav-btn"
                  onClick={handlePrevWord}
                  title="Vorheriges Wort"
                >
                  ◀
                </button>
                <div className="kg-cw-word-counter">
                  Wort <strong>{activeWordIdx + 1}</strong> von {puzzle.words.length}
                </div>
                <button
                  className="kg-cw-nav-btn"
                  onClick={handleNextWord}
                  title="Nächstes Wort"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* 2. RIGHT PANEL: CLUE, AUDIO & LETTER KEYBOARD */}
            <div className="kg-cw-right-panel">
              {/* Top Clue & Blanks Card */}
              <div className="kg-cw-clue-card">
                <div className="kg-cw-clue-top">
                  <button
                    className="kg-cw-speaker-btn"
                    onClick={handleSpeak}
                    title="Aussprache anhören (Listen in German)"
                  >
                    🔊
                  </button>
                  <div className="kg-cw-clue-icon">{activeWord.icon}</div>
                  <div className="kg-cw-clue-texts">
                    <small>Hinweis:</small>
                    <strong>{activeWord.hint}</strong>
                  </div>
                </div>

                {/* Target Letter Blanks */}
                <div className="kg-cw-slots-wrap">
                  {Array.from({ length: activeWord.answer.length }).map((_, idx) => {
                    const letter = currentInput[idx] || (solvedWords[activeWord.id] ? activeWord.answer[idx] : "");
                    return (
                      <div
                        key={idx}
                        className={`kg-cw-slot ${letter ? "has-letter" : ""} ${
                          solvedWords[activeWord.id] ? "is-locked" : ""
                        }`}
                        onClick={() => handleRemoveSlot(idx)}
                      >
                        {letter || "_"}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Letter Tiles Keyboard */}
              <div className="kg-cw-keyboard-card">
                <div className="kg-cw-kb-label">
                  <span>Wähle Buchstaben aus:</span>
                  <div className="kg-cw-kb-actions">
                    <button
                      className="kg-cw-kb-tool"
                      onClick={handleShufflePool}
                      title="Buchstaben mischen"
                    >
                      🔀 Mischen
                    </button>
                    <button
                      className="kg-cw-kb-tool"
                      onClick={handleBackspace}
                      title="Letzten Buchstaben löschen"
                    >
                      ⌫ Löschen
                    </button>
                  </div>
                </div>

                {/* Letter Chips Grid */}
                <div className="kg-cw-tiles-grid">
                  {currentPool.map((tile) => {
                    const isUsed = selectedTileIds.includes(tile.id);
                    return (
                      <button
                        key={tile.id}
                        className={`kg-cw-tile ${isUsed ? "is-used" : ""}`}
                        disabled={isUsed || solvedWords[activeWord.id]}
                        onClick={() => handleSelectTile(tile)}
                      >
                        {tile.char.toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
