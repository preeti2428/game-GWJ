import Link from "next/link";
import { getDb, hasMongo } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// Standard fallback German cities list if offline
const DEFAULT_CITIES = [
  {
    stageNumber: 1,
    slug: "koeln",
    cityName: "Cologne",
    cityNameDe: "Köln",
    emoji: "⛪",
    tier: "A1",
    theme: "Greetings & Introducing Yourself",
    exercisesCount: 110,
    unlocked: true,
  },
  {
    stageNumber: 2,
    slug: "frankfurt",
    cityName: "Frankfurt",
    cityNameDe: "Frankfurt",
    emoji: "🏦",
    tier: "A1",
    theme: "Freunde, Kollegen und ich",
    exercisesCount: 90,
    unlocked: true,
  },
  {
    stageNumber: 3,
    slug: "stuttgart",
    cityName: "Stuttgart",
    cityNameDe: "Stuttgart",
    emoji: "🚗",
    tier: "A1",
    theme: "Family & People",
    exercisesCount: 108,
    unlocked: true,
  },
  {
    stageNumber: 4,
    slug: "muenchen",
    cityName: "Munich",
    cityNameDe: "München",
    emoji: "🍺",
    tier: "A1",
    theme: "Food & Drink",
    exercisesCount: 86,
    unlocked: true,
  },
  {
    stageNumber: 5,
    slug: "duesseldorf",
    cityName: "Düsseldorf",
    cityNameDe: "Düsseldorf",
    emoji: "🎨",
    tier: "A1",
    theme: "Daily Routine & Time",
    exercisesCount: 110,
    unlocked: true,
  },
  {
    stageNumber: 6,
    slug: "hannover",
    cityName: "Hannover",
    cityNameDe: "Hannover",
    emoji: "🌳",
    tier: "A1",
    theme: "City, Directions & Transport",
    exercisesCount: 108,
    unlocked: true,
  },
  {
    stageNumber: 7,
    slug: "hamburg",
    cityName: "Hamburg",
    cityNameDe: "Hamburg",
    emoji: "🚢",
    tier: "A1",
    theme: "Weather, Hobbies & Free Time",
    exercisesCount: 168,
    unlocked: true,
  },
  {
    stageNumber: 8,
    slug: "berlin",
    cityName: "Berlin",
    cityNameDe: "Berlin",
    emoji: "🏛️",
    tier: "A1",
    theme: "Making Plans & Visiting the Capital",
    exercisesCount: 80,
    unlocked: true,
  },
];

async function loadStages() {
  if (!hasMongo()) return DEFAULT_CITIES;

  try {
    const db = await getDb();
    const stages = await db
      .collection("stages")
      .find({})
      .sort({ stageNumber: 1 })
      .toArray();

    if (!stages || stages.length === 0) return DEFAULT_CITIES;

    return stages.map((s) => {
      const slugMap = {
        1: "koeln",
        2: "frankfurt",
        3: "stuttgart",
        4: "muenchen",
        5: "duesseldorf",
        6: "hannover",
        7: "hamburg",
        8: "berlin",
        9: "dresden",
        10: "leipzig",
        11: "bremen",
        12: "nuernberg",
      };

      const slug =
        slugMap[s.stageNumber] ||
        (s.cityNameDe || s.cityName || "")
          .toLowerCase()
          .replace(/[ö]/g, "oe")
          .replace(/[ü]/g, "ue")
          .replace(/[ä]/g, "ae")
          .replace(/\s+/g, "-");

      const totalExercises = (s.sessions || []).reduce(
        (acc, sess) => acc + (sess.exercises?.length || 0),
        0
      );

      return {
        stageNumber: s.stageNumber,
        slug,
        cityName: s.cityName || s.cityNameDe,
        cityNameDe: s.cityNameDe || s.cityName,
        emoji: s.emoji || "🇩🇪",
        tier: s.tier || "A1",
        theme: s.theme || "Deutsch Entdeckungsreise",
        exercisesCount: totalExercises > 0 ? totalExercises : 90,
        unlocked: true,
      };
    });
  } catch (err) {
    console.warn("Could not load stages from MongoDB, using defaults:", err.message);
    return DEFAULT_CITIES;
  }
}

export default async function CourseHubPage() {
  const cities = await loadStages();

  return (
    <div className="kg-hub-page">
      {/* Top Banner Header */}
      <header className="kg-hub-header">
        <div className="kg-hub-header-inner">
          <div className="kg-hub-badge">🇩🇪 Deutsche Entdeckungsreise</div>
          <h1 className="kg-hub-title">Städte & Kapitel Übersicht</h1>
          <p className="kg-hub-subtitle">
            Wähle eine deutsche Stadt, erkunde die Sehenswürdigkeiten und schalte Level & Fahrzeuge frei!
          </p>
          <div className="kg-hub-quick-actions">
            <Link href="/course/koeln/play" className="kg-hub-quick-btn">
              ⚡ Direkt nach Köln weiterreisen ➔
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid of Cities */}
      <main className="kg-hub-container">
        <div className="kg-hub-grid">
          {cities.map((city) => (
            <div key={city.stageNumber} className="kg-city-card">
              <div className="kg-city-head">
                <span className="kg-city-emoji">{city.emoji}</span>
                <div className="kg-city-tier-pill">{city.tier} Niveau</div>
              </div>

              <div className="kg-city-body">
                <span className="kg-city-stage">Etappe {city.stageNumber}</span>
                <h2 className="kg-city-name">
                  {city.cityNameDe}{" "}
                  {city.cityName !== city.cityNameDe && (
                    <small>({city.cityName})</small>
                  )}
                </h2>
                <p className="kg-city-theme">{city.theme}</p>

                <div className="kg-city-meta">
                  <span>📝 {city.exercisesCount} Aufgaben</span>
                  <span>⭐ 10 Meilensteine</span>
                </div>
              </div>

              <div className="kg-city-footer">
                <Link
                  href={`/course/${city.slug}/play`}
                  className="kg-city-play-btn"
                >
                  Stadt bereisen ➔
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
