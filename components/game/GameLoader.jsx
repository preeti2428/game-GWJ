"use client";

import dynamic from "next/dynamic";

// Game (GSAP + ScrollTrigger + UI) sirf is page par aur sirf browser me load hota hai.
// Baaki website ke bundle me iska ek byte nahi jaata.
const CityGame = dynamic(() => import("./CityGame"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100vh", display: "grid", placeItems: "center", color: "#8a6f5a" }}>
      Reise wird geladen…
    </div>
  ),
});

export default function GameLoader(props) {
  return <CityGame {...props} />;
}
