import { NextResponse } from "next/server";
import { getDb, hasMongo } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";

export async function POST(req) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const { chapterSlug, stopId, stars, coins } = body ?? {};
  if (typeof chapterSlug !== "string" || typeof stopId !== "string") {
    return NextResponse.json({ error: "chapterSlug and stopId required" }, { status: 400 });
  }
  const safeStars = Number.isInteger(stars) ? Math.min(3, Math.max(1, stars)) : 1;
  const safeCoins = Array.isArray(coins)
    ? coins.filter((c) => typeof c === "string").slice(0, 30)
    : [];

  if (!hasMongo()) return NextResponse.json({ ok: true, demo: true });

  try {
    const db = await getDb();
    await db.collection("game_progress").updateOne(
      { userId, chapterSlug, stopId },
      {
        $max: { stars: safeStars },
        $addToSet: { coins: { $each: safeCoins } },
        $set: { updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  } catch (err) {
    console.warn("Could not save progress to MongoDB Atlas (offline/DNS):", err.message);
    return NextResponse.json({ ok: true, offline: true });
  }

  return NextResponse.json({ ok: true });
}
