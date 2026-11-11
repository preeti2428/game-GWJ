/**
 * MongoDB ke stage documents ko game "stops" me badalta hai.
 */

export function stageToGameData(stage, doneIds = new Set()) {
  const vocab = (stage.vocabSet || []).map((v) => ({
    de: v.word,
    hi: v.translation || v.word,
    gender: v.gender !== "none" ? v.gender : undefined,
  }));

  const stops = [];
  const sessions = stage.sessions || [];

  // Helper to slice vocab for street coins
  const getVocabSlice = (index, count = 4) => {
    if (vocab.length === 0) return [];
    const start = (index * count) % vocab.length;
    const slice = vocab.slice(start, start + count);
    if (slice.length < count && vocab.length >= count) {
      slice.push(...vocab.slice(0, count - slice.length));
    }
    return slice;
  };

  sessions.forEach((session, idx) => {
    const sNum = session.sessionNumber || idx + 1;
    const sId = String(session._id || `s_${sNum}`);
    const exercises = session.exercises || [];
    const title = session.title?.replace(/\s*\([^)]*\)/g, "").trim() || `Level ${sNum}`;
    const coins = getVocabSlice(idx, 4);

    let kind = "mcq";
    if (
      session.skillType === "matching" ||
      session.title?.toLowerCase().includes("match") ||
      exercises.some((e) => e.type === "matching")
    ) {
      kind = "match";
    } else if (
      session.title?.toLowerCase().includes("build sentences") ||
      exercises.some((e) => e.type === "sentence_build")
    ) {
      kind = "order";
    } else {
      kind = "mcq";
    }

    const stop = {
      id: sId,
      order: sNum,
      kind,
      title,
      done: doneIds.has(sId),
      coins,
    };

    if (kind === "match") {
      // Collect ALL matching rounds from exercises (minimum 10 exercises in Session 3!)
      const matchExercises = exercises.filter((e) => e.type === "matching" && e.options);
      if (matchExercises.length > 0) {
        stop.matchRounds = matchExercises.map((e, roundIdx) => ({
          round: roundIdx + 1,
          prompt: e.prompt || "Ordne die richtigen Paare zu:",
          pairs: Object.entries(e.options).map(([de, hi]) => ({ de, hi })),
        }));
        // Provide pairs of first round for simple fallbacks
        stop.pairs = stop.matchRounds[0].pairs;
      } else {
        stop.pairs = vocab.slice(0, 6).map((v) => ({ de: v.de, hi: v.hi }));
        stop.matchRounds = [{ round: 1, prompt: "Ordne die Wörter zu:", pairs: stop.pairs }];
      }
    } else if (kind === "order") {
      // Collect ALL sentence-build exercises (do NOT cut down to 3!)
      const orderExs = exercises.filter((e) => e.type === "sentence_build" || e.correctAnswer);
      stop.sentences = orderExs.map((e) => {
        const cleanAnswer = (e.correctAnswer || "").replace(/[.!?]/g, "").trim();
        const words = cleanAnswer.split(/\s+/).filter(Boolean);
        const hint = (e.prompt || "").replace(/^Arrange the words to make a correct sentence:\s*/i, "").trim();
        return { words, hint: hint.length > 60 ? "" : hint };
      }).filter((s) => s.words.length >= 2);
    } else if (kind === "mcq") {
      // Collect ALL MCQ questions (minimum 10-12 questions per session!)
      const mcqExs = exercises.filter((e) => e.options && Array.isArray(e.options) && e.options.length > 1);
      stop.questions = mcqExs.map((e) => {
        let answerIdx = e.options.indexOf(e.correctAnswer);
        if (answerIdx === -1) answerIdx = 0;
        return {
          q: e.prompt || "Wähle die richtige Antwort:",
          options: e.options,
          answer: answerIdx,
        };
      });
    }

    stops.push(stop);
  });

  // Chapter Boss Exam: collect at least 10 comprehensive questions from across all sessions
  if (stops.length > 0) {
    const allMcqExs = [];
    sessions.forEach((s) => {
      (s.exercises || []).forEach((e) => {
        if (e.options && Array.isArray(e.options) && e.options.length > 1 && e.correctAnswer) {
          allMcqExs.push(e);
        }
      });
    });

    // Select 10 questions evenly distributed across sessions
    const bossCount = Math.min(10, allMcqExs.length);
    const step = allMcqExs.length / bossCount;
    const bossQuestions = [];
    for (let i = 0; i < bossCount; i++) {
      const ex = allMcqExs[Math.floor(i * step)];
      if (ex) {
        bossQuestions.push({
          q: ex.prompt,
          options: ex.options,
          answer: Math.max(0, ex.options.indexOf(ex.correctAnswer)),
        });
      }
    }

    stops.push({
      id: `boss_${stage.stageNumber}`,
      order: stops.length + 1,
      kind: "boss",
      title: `${stage.cityNameDe || stage.cityName} Boss Exam`,
      done: doneIds.has(`boss_${stage.stageNumber}`),
      coins: vocab.slice(0, 5),
      questions: bossQuestions.length >= 5 ? bossQuestions : [
        { q: "Wie heißt die Stadt?", options: [stage.cityNameDe || "Köln", "Berlin", "München"], answer: 0 },
      ],
    });
  }

  return {
    city: stage.cityNameDe || stage.cityName || "Köln",
    level: stage.tier || "A1",
    subtitle: stage.theme || "Entdeckungsreise",
    stops,
  };
}

export function toStops(sessions, opts) {
  return sessions;
}
