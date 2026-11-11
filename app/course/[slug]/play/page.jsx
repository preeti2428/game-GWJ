import { notFound } from "next/navigation";
import koeln from "@/data/koeln.json";
import { getDb, hasMongo } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { stageToGameData } from "@/lib/toStops";
import GameLoader from "@/components/game/GameLoader";

// Progress har baar fresh chahiye
export const dynamic = "force-dynamic";

async function loadCity(slug) {
  if (!hasMongo()) return slug === "koeln" ? koeln : null;

  try {
    const db = await getDb();
    const userId = await getUserId();
    const cleanSlug = (slug || "").toLowerCase();

    const stageQuery = {
      $or: [
        { cityNameDe: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
        { cityName: { $regex: new RegExp(`^${cleanSlug}$`, "i") } },
        ...(cleanSlug === "koeln" ? [{ stageNumber: 1 }, { cityNameDe: { $regex: /^k[oö]ln$/i } }] : []),
        ...(cleanSlug === "frankfurt" ? [{ stageNumber: 2 }] : []),
        ...(cleanSlug === "stuttgart" ? [{ stageNumber: 3 }] : []),
        ...(cleanSlug === "muenchen" || cleanSlug === "munich" ? [{ stageNumber: 4 }] : []),
        ...(cleanSlug === "duesseldorf" || cleanSlug === "dusseldorf" ? [{ stageNumber: 5 }] : []),
        ...(cleanSlug === "hannover" ? [{ stageNumber: 6 }] : []),
        ...(cleanSlug === "hamburg" ? [{ stageNumber: 7 }] : []),
        ...(cleanSlug === "berlin" ? [{ stageNumber: 8 }] : []),
      ],
    };

    let stage = await db.collection("stages").findOne(stageQuery);
    if (!stage && cleanSlug === "koeln") {
      stage = await db.collection("stages").findOne({ stageNumber: 1 });
    }

    if (!stage) {
      return slug === "koeln" ? koeln : null;
    }

    const doneIds = new Set();
    try {
      const gameDone = await db.collection("game_progress").find({ userId, stageNumber: stage.stageNumber }).toArray();
      gameDone.forEach((g) => doneIds.add(String(g.stopId)));
    } catch {
      // ignore
    }

    return stageToGameData(stage, doneIds);
  } catch (err) {
    console.error("MongoDB Atlas loadCity error, falling back to local JSON:", err);
    return slug === "koeln" ? koeln : null;
  }
}

export default async function PlayPage({ params }) {
  const { slug } = await params;
  const city = await loadCity(slug);
  if (!city) notFound();

  // Plain JSON serializable for client components
  const plain = JSON.parse(JSON.stringify(city));
  return <GameLoader city={plain} chapterSlug={slug} backHref="/course" />;
}
