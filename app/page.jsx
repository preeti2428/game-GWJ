import { redirect } from "next/navigation";

// Demo ke liye seedha Köln ka game kholta hai. Apni site me ye file chahiye nahi.
export default function Home() {
  redirect("/course/koeln/play");
}
