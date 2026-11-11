"use client";

import { useEffect, useState } from "react";
import { playCorrectSound, playWrongSound, playPassSound } from "@/lib/audio";

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- MCQ (Say It / Translate / Fill the Blanks / Boss) ---------- */
function McqRun({ questions, onComplete }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const q = questions[i];

  function choose(idx) {
    if (picked !== null) return;
    setPicked(idx);
    const ok = idx === q.answer;
    let nextCorrect = correctCount;
    if (ok) {
      playCorrectSound();
      nextCorrect += 1;
      setCorrectCount(nextCorrect);
    } else {
      playWrongSound();
    }
    setTimeout(() => {
      setPicked(null);
      if (i + 1 >= questions.length) {
        onComplete({ total: questions.length, correct: nextCorrect });
      } else {
        setI(i + 1);
      }
    }, ok ? 550 : 1100);
  }

  useEffect(() => {
    const onKey = (e) => {
      const k = Number(e.key);
      if (k >= 1 && k <= q.options.length) choose(k - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const progressPct = Math.round(((i + 1) / questions.length) * 100);

  return (
    <div>
      <div className="kg-obstacle-progress-wrap">
        <div className="kg-obstacle-progress-info">
          <span className="kg-step">Frage {i + 1} von {questions.length}</span>
          <span className="kg-accuracy-pill">
            Richtig: <strong>{correctCount}</strong> / {i} (Ziel: min. 50%)
          </span>
        </div>
        <div className="kg-obstacle-bar">
          <div className="kg-obstacle-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <h3 className="kg-q">{q.q}</h3>

      <div className="kg-options">
        {q.options.map((o, idx) => {
          let cls = "kg-opt";
          if (picked !== null) {
            if (idx === q.answer) cls += " kg-ok";
            else if (idx === picked) cls += " kg-bad";
          }
          return (
            <button key={idx} className={cls} onClick={() => choose(idx)} disabled={picked !== null}>
              <kbd>{idx + 1}</kbd> {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Match the Following (Supports multi-round matching sets) ---------- */
function MatchRun({ rounds, onComplete }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const curRound = rounds[roundIdx] || rounds[0];
  const pairs = curRound.pairs || [];

  const [right, setRight] = useState(() => shuffle(pairs.map((p) => p.hi)));
  const [sel, setSel] = useState(null);
  const [matched, setMatched] = useState([]);
  const [flash, setFlash] = useState(null);
  const [roundErrors, setRoundErrors] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);

  // When round changes, reload pairs & shuffled right
  useEffect(() => {
    setRight(shuffle(pairs.map((p) => p.hi)));
    setSel(null);
    setMatched([]);
    setRoundErrors(0);
  }, [roundIdx]);

  function pickRight(hi) {
    if (sel === null) return;
    const pair = pairs.find((p) => p.de === sel);
    if (pair && pair.hi === hi) {
      playCorrectSound();
      const next = [...matched, sel];
      setMatched(next);
      setSel(null);
      if (next.length === pairs.length) {
        const nextCorrect = roundErrors === 0 ? correctRounds + 1 : correctRounds;
        if (roundErrors === 0) setCorrectRounds(nextCorrect);

        setTimeout(() => {
          if (roundIdx + 1 >= rounds.length) {
            onComplete({ total: rounds.length, correct: nextCorrect });
          } else {
            setRoundIdx((r) => r + 1);
          }
        }, 500);
      }
    } else {
      playWrongSound();
      setRoundErrors((e) => e + 1);
      setFlash(hi);
      setTimeout(() => setFlash(null), 500);
    }
  }

  const matchedHi = pairs.filter((p) => matched.includes(p.de)).map((p) => p.hi);
  const progressPct = Math.round(((roundIdx + 1) / rounds.length) * 100);

  return (
    <div>
      <div className="kg-obstacle-progress-wrap">
        <div className="kg-obstacle-progress-info">
          <span className="kg-step">Runde {roundIdx + 1} von {rounds.length}</span>
          <span className="kg-accuracy-pill">
            Richtig: <strong>{correctRounds}</strong> / {roundIdx} (Ziel: min. 50%)
          </span>
        </div>
        <div className="kg-obstacle-bar">
          <div className="kg-obstacle-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <h3 className="kg-q" style={{ fontSize: "17px", marginBottom: "8px" }}>
        {curRound.prompt || "Wähle das deutsche Wort und dann die richtige Bedeutung:"}
      </h3>

      <div className="kg-match">
        <div>
          {pairs.map((p) => (
            <button
              key={p.de}
              className={`kg-opt ${sel === p.de ? "kg-sel" : ""} ${matched.includes(p.de) ? "kg-ok" : ""}`}
              disabled={matched.includes(p.de)}
              onClick={() => setSel(p.de)}
            >
              {p.de}
            </button>
          ))}
        </div>
        <div>
          {right.map((hi) => (
            <button
              key={hi}
              className={`kg-opt ${matchedHi.includes(hi) ? "kg-ok" : ""} ${flash === hi ? "kg-bad" : ""}`}
              disabled={matchedHi.includes(hi)}
              onClick={() => pickRight(hi)}
            >
              {hi}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Build Sentences (word order) ---------- */
function OrderRun({ sentences, onComplete }) {
  const [i, setI] = useState(0);
  const s = sentences[i];
  const [pool, setPool] = useState(() => shuffle(s.words.map((w, k) => ({ w, k }))));
  const [chosen, setChosen] = useState([]);
  const [bad, setBad] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  function load(nextIdx) {
    setI(nextIdx);
    setPool(shuffle(sentences[nextIdx].words.map((w, k) => ({ w, k }))));
    setChosen([]);
    setHadMistake(false);
  }

  function check() {
    const ok = chosen.map((c) => c.w).join(" ") === s.words.join(" ");
    if (ok) {
      playCorrectSound();
      const nextCorrect = !hadMistake ? correctCount + 1 : correctCount;
      if (!hadMistake) setCorrectCount(nextCorrect);

      if (i + 1 >= sentences.length) {
        onComplete({ total: sentences.length, correct: nextCorrect });
      } else {
        load(i + 1);
      }
    } else {
      playWrongSound();
      setHadMistake(true);
      setBad(true);
      setTimeout(() => setBad(false), 600);
      setPool(shuffle(s.words.map((w, k) => ({ w, k }))));
      setChosen([]);
    }
  }

  const progressPct = Math.round(((i + 1) / sentences.length) * 100);

  return (
    <div>
      <div className="kg-obstacle-progress-wrap">
        <div className="kg-obstacle-progress-info">
          <span className="kg-step">Satz {i + 1} von {sentences.length}</span>
          <span className="kg-accuracy-pill">
            Richtig: <strong>{correctCount}</strong> / {i} (Ziel: min. 50%)
          </span>
        </div>
        <div className="kg-obstacle-bar">
          <div className="kg-obstacle-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <h3 className="kg-q" style={{ fontSize: "17px", marginBottom: "6px" }}>
        Ordne die Wörter zu einem korrekten deutschen Satz:
      </h3>
      {s.hint && <p className="kg-hint-text">💡 Hinweis: {s.hint}</p>}

      <div className={`kg-slots ${bad ? "kg-bad" : ""}`}>
        {chosen.length === 0 && <span className="kg-muted">Klicke unten auf die Wörter in der richtigen Reihenfolge…</span>}
        {chosen.map((c) => (
          <button
            key={c.k}
            className="kg-chip"
            onClick={() => {
              setChosen(chosen.filter((x) => x.k !== c.k));
              setPool([...pool, c]);
            }}
          >
            {c.w}
          </button>
        ))}
      </div>

      <div className="kg-pool">
        {pool.map((c) => (
          <button
            key={c.k}
            className="kg-chip"
            onClick={() => {
              setPool(pool.filter((x) => x.k !== c.k));
              setChosen([...chosen, c]);
            }}
          >
            {c.w}
          </button>
        ))}
      </div>

      <button className="kg-btn" disabled={pool.length > 0} onClick={check} style={{ marginTop: "14px", width: "100%" }}>
        Prüfen ✓
      </button>
    </div>
  );
}

/* ---------- Main Obstacle Modal with 50% Passing Logic ---------- */
export default function Obstacle({ stop, onPass, onClose }) {
  const [result, setResult] = useState(null); // { total, correct, score, passed, stars }
  const [roundKey, setRoundKey] = useState(0);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleComplete({ total, correct }) {
    const score = Math.round((correct / Math.max(total, 1)) * 100);
    const passed = score >= 50;
    const stars = score >= 85 ? 3 : score >= 70 ? 2 : passed ? 1 : 0;

    if (passed) {
      playPassSound();
    } else {
      playWrongSound();
    }

    setResult({ total, correct, score, passed, stars });
  }

  function handleRetry() {
    setResult(null);
    setRoundKey((k) => k + 1);
  }

  function handleProceed() {
    if (result && result.passed) {
      onPass(result.stars);
    }
  }

  // Determine rounds for matching
  const matchRounds =
    stop.matchRounds && stop.matchRounds.length > 0
      ? stop.matchRounds
      : stop.pairs && stop.pairs.length > 0
      ? [{ round: 1, prompt: "Ordne die richtigen Paare zu:", pairs: stop.pairs }]
      : [];

  let body;
  if (result) {
    if (result.passed) {
      body = (
        <div className="kg-result-card kg-result-success">
          <div className="kg-result-icon">🎉</div>
          <h3 className="kg-result-title">Tor gemeistert! ({result.score}%)</h3>
          <div className="kg-stars-display">
            {"⭐".repeat(result.stars)}
            <span className="kg-stars-label">
              {result.stars === 3 ? "Perfekt gemeistert!" : result.stars === 2 ? "Sehr gut!" : "Bestanden!"}
            </span>
          </div>

          <p className="kg-result-detail">
            Du hast <strong>{result.correct} von {result.total}</strong> Aufgaben richtig gelöst.
          </p>

          <div className="kg-reward-badge">
            🪙 +{result.stars * 5} Bonus-Münzen belohnt!
          </div>

          <p className="kg-result-msg">
            Das Tor ist jetzt geöffnet! Du kannst nun zur nächsten Station weitergehen.
          </p>

          <button className="kg-btn kg-btn-primary" onClick={handleProceed} style={{ width: "100%", fontSize: "16px", padding: "14px" }}>
            Weitergehen ➔
          </button>
        </div>
      );
    } else {
      body = (
        <div className="kg-result-card kg-result-fail">
          <div className="kg-result-icon">❌</div>
          <h3 className="kg-result-title" style={{ color: "#d90429" }}>
            Tor versperrt! ({result.score}%)
          </h3>

          <p className="kg-result-detail">
            Du hast nur <strong>{result.correct} von {result.total}</strong> Aufgaben richtig gelöst.
          </p>

          <div className="kg-fail-notice">
            ⚠️ <strong>Mindestens 50% erforderlich!</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
              Du musst mindestens 50% erreichen, um dieses Tor zu öffnen und zur nächsten Station weiterzugehen.
            </p>
          </div>

          <button className="kg-btn kg-btn-retry" onClick={handleRetry} style={{ width: "100%", fontSize: "16px", padding: "14px" }}>
            🔄 Session wiederholen (Nochmal versuchen)
          </button>
        </div>
      );
    }
  } else if (stop.kind === "match" && matchRounds.length > 0) {
    body = <MatchRun key={roundKey} rounds={matchRounds} onComplete={handleComplete} />;
  } else if (stop.kind === "order" && stop.sentences?.length) {
    body = <OrderRun key={roundKey} sentences={stop.sentences} onComplete={handleComplete} />;
  } else if ((stop.kind === "mcq" || stop.kind === "boss") && stop.questions?.length) {
    body = <McqRun key={roundKey} questions={stop.questions} onComplete={handleComplete} />;
  } else {
    body = (
      <div>
        <p>Dieses Tor hat keine Aufgaben hinterlegt. Du kannst direkt weitergehen!</p>
        <button className="kg-btn kg-btn-primary" onClick={() => onPass(3)} style={{ width: "100%" }}>
          Weitergehen ➔
        </button>
      </div>
    );
  }

  return (
    <div className="kg-overlay" role="dialog" aria-modal="true" aria-label={stop.title}>
      <div className={`kg-card ${stop.kind === "boss" ? "kg-boss" : ""}`}>
        <div className="kg-card-head">
          <div>
            <h2>{stop.kind === "boss" ? "👑 " : ""}{stop.title}</h2>
            <span className="kg-req-tag">Bedingung: min. 50% zum Öffnen</span>
          </div>
          <button className="kg-close-x" onClick={onClose} title="Schließen (Später)">✕</button>
        </div>
        {body}
        {!result && (
          <div style={{ textAlign: "center", marginTop: "14px" }}>
            <button className="kg-link" onClick={onClose}>Später fortsetzen</button>
          </div>
        )}
      </div>
    </div>
  );
}
