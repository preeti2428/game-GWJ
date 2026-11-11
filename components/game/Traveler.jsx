"use client";

import React from "react";

export default function Traveler({
  isWalking = false,
  vehicle = "none",
  suit = "boy_casual",
  gender = "boy",
  skinTone = "#ffd19a",
  hairColor = "#5c3d2e",
}) {
  // Outfits configuration
  const suits = {
    // --- BOY OUTFITS ---
    boy_casual: {
      jacket: ["#2a6f97", "#013a63"],
      pants: "#3a3d56",
      cap: "#e63946",
      capVisor: "#b7094c",
      scarf: ["#e63946", "#d90429"],
      backpack: ["#b07d62", "#774936"],
      accessory: "cap",
    },
    boy_bavarian: {
      jacket: ["#2d6a4f", "#1b4332"],
      pants: "#582f0e",
      cap: "#2d6a4f",
      capVisor: "#d8f3dc",
      scarf: ["#d4a373", "#ccd5ae"],
      backpack: ["#7f4f24", "#582f0e"],
      accessory: "edelweiss",
    },
    boy_karneval: {
      jacket: ["#e63946", "#f1faee"],
      pants: "#e63946",
      cap: "#ffd166",
      capVisor: "#e63946",
      scarf: ["#f1faee", "#e63946"],
      backpack: ["#e63946", "#ffd166"],
      accessory: "feather",
    },
    boy_racer: {
      jacket: ["#111111", "#333333"],
      pants: "#111111",
      cap: "#ffd166",
      capVisor: "#111111",
      scarf: ["#ffd166", "#f77f00"],
      backpack: ["#222222", "#ffd166"],
      accessory: "helmet",
    },
    boy_detective: {
      jacket: ["#8d7b68", "#6c584c"],
      pants: "#4a3e35",
      cap: "#6c584c",
      capVisor: "#4a3e35",
      scarf: ["#a98467", "#adc178"],
      backpack: ["#582f0e", "#3a1f09"],
      accessory: "beret",
    },
    boy_king: {
      jacket: ["#7209b7", "#3a0ca3"],
      pants: "#240046",
      cap: "#ffd166",
      capVisor: "#ffb703",
      scarf: ["#f72585", "#7209b7"],
      backpack: ["#ffd166", "#b5179e"],
      accessory: "crown",
    },
    boy_cyber: {
      jacket: ["#050505", "#1f2937"],
      pants: "#111827",
      cap: "#06b6d4",
      capVisor: "#3b82f6",
      scarf: ["#06b6d4", "#ec4899"],
      backpack: ["#111827", "#06b6d4"],
      accessory: "visor",
    },
    boy_astronaut: {
      jacket: ["#f8fafc", "#cbd5e1"],
      pants: "#94a3b8",
      cap: "#e2e8f0",
      capVisor: "#38bdf8",
      scarf: ["#38bdf8", "#0284c7"],
      backpack: ["#e2e8f0", "#64748b"],
      accessory: "spacehelmet",
    },

    // --- GIRL OUTFITS ---
    girl_casual: {
      jacket: ["#f472b6", "#db2777"],
      pants: "#374151",
      cap: "#ec4899",
      capVisor: "#be185d",
      scarf: ["#fbcfe8", "#f472b6"],
      backpack: ["#f472b6", "#9d174d"],
      accessory: "headband",
    },
    girl_dirndl: {
      jacket: ["#e11d48", "#9f1239"],
      pants: "#15803d",
      cap: "#be123c",
      capVisor: "#fda4af",
      scarf: ["#ffffff", "#fecdd3"],
      backpack: ["#881337", "#4c0519"],
      accessory: "flower",
    },
    girl_karneval: {
      jacket: ["#f59e0b", "#d97706"],
      pants: "#ef4444",
      cap: "#ffd166",
      capVisor: "#f59e0b",
      scarf: ["#fef08a", "#f59e0b"],
      backpack: ["#f59e0b", "#b45309"],
      accessory: "tiara",
    },
    girl_racer: {
      jacket: ["#8b5cf6", "#6d28d9"],
      pants: "#4c1d95",
      cap: "#a78bfa",
      capVisor: "#4c1d95",
      scarf: ["#c4b5fd", "#7c3aed"],
      backpack: ["#5b21b6", "#2e1065"],
      accessory: "helmet",
    },
    girl_detective: {
      jacket: ["#78716c", "#57534e"],
      pants: "#292524",
      cap: "#57534e",
      capVisor: "#292524",
      scarf: ["#e7e5e4", "#a8a29e"],
      backpack: ["#44403c", "#1c1917"],
      accessory: "beret",
    },
    girl_queen: {
      jacket: ["#be185d", "#831843"],
      pants: "#500724",
      cap: "#f59e0b",
      capVisor: "#d97706",
      scarf: ["#fbcfe8", "#db2777"],
      backpack: ["#f59e0b", "#9d174d"],
      accessory: "crown",
    },
    girl_cyber: {
      jacket: ["#09090b", "#18181b"],
      pants: "#18181b",
      cap: "#d946ef",
      capVisor: "#a21caf",
      scarf: ["#d946ef", "#06b6d4"],
      backpack: ["#27272a", "#d946ef"],
      accessory: "visor",
    },
    girl_astronaut: {
      jacket: ["#f8fafc", "#e2e8f0"],
      pants: "#94a3b8",
      cap: "#cbd5e1",
      capVisor: "#f472b6",
      scarf: ["#f472b6", "#db2777"],
      backpack: ["#e2e8f0", "#64748b"],
      accessory: "spacehelmet",
    },
  };

  // Fallback to suitable outfit if legacy id passed
  let resolvedSuitKey = suit;
  if (!suits[resolvedSuitKey]) {
    resolvedSuitKey = gender === "girl" ? "girl_casual" : "boy_casual";
  }
  const curSuit = suits[resolvedSuitKey];

  const isOnWheels = vehicle !== "none";
  const isFlying = vehicle === "helicopter" || vehicle === "rocket" || vehicle === "ufo";

  return (
    <div
      className={`kg-traveler ${isWalking ? "kg-walking" : "kg-idle"} kg-v-${vehicle} ${
        isOnWheels ? "kg-on-wheels" : ""
      } ${isFlying ? "kg-flying" : ""}`}
    >
      {/* Ground Shadow */}
      <div
        className={`kg-traveler-shadow ${isOnWheels ? "kg-shadow-vehicle" : ""} ${
          isFlying ? "kg-shadow-flying" : ""
        }`}
      />

      {/* Speed lines when driving */}
      {isOnWheels && isWalking && (
        <div className="kg-speed-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}

      {/* Main SVG Character & Vehicle */}
      <svg
        className="kg-traveler-svg"
        viewBox="0 0 160 160"
        width={isFlying ? "140" : isOnWheels ? "120" : "86"}
        height={isFlying ? "145" : isOnWheels ? "130" : "118"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="jacketGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={curSuit.jacket[0]} />
            <stop offset="100%" stopColor={curSuit.jacket[1]} />
          </linearGradient>
          <linearGradient id="packGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={curSuit.backpack[0]} />
            <stop offset="100%" stopColor={curSuit.backpack[1]} />
          </linearGradient>
          <linearGradient id="scarfGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={curSuit.scarf[0]} />
            <stop offset="100%" stopColor={curSuit.scarf[1]} />
          </linearGradient>
          <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>
          <linearGradient id="chromeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="flameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="ufoBeamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* ---------------- CHARACTER BODY ---------------- */}
        <g transform={isFlying ? "translate(24, 6)" : isOnWheels ? "translate(16, 2)" : "translate(10, 8)"}>
          {/* GIRL PONYTAIL / HAIR (Behind head) */}
          {gender === "girl" && (
            <g className="kg-girl-hair-back">
              <path
                d="M38,30 C22,34 16,50 18,64 C22,66 28,62 30,52 C32,44 38,38 42,34 Z"
                fill={hairColor}
              />
              {/* Cute hair bow / ribbon */}
              <circle cx="36" cy="32" r="4.5" fill="#ec4899" />
              <path d="M33,30 L29,27 L33,33 Z" fill="#f472b6" />
              <path d="M38,30 L42,27 L38,33 Z" fill="#f472b6" />
            </g>
          )}

          {/* Back Leg (Only if walking on foot) */}
          {!isOnWheels && (
            <g className="kg-leg kg-leg-back">
              <rect x="36" y="90" width="10" height="28" rx="5" fill={curSuit.pants} />
              <path d="M34,114 L50,114 Q52,122 46,122 L32,122 Z" fill="#6c584c" />
            </g>
          )}

          {/* Backpack */}
          <rect x="22" y="52" width="16" height="34" rx="6" fill="url(#packGrad)" stroke="#3a1f09" strokeWidth="1.5" />
          <rect x="20" y="60" width="6" height="18" rx="3" fill={curSuit.backpack[1]} />

          {/* Torso / Jacket */}
          <g className="kg-torso">
            <rect x="34" y="50" width="30" height="42" rx="8" fill="url(#jacketGrad)" />
            {/* Belt & Buckle */}
            <rect x="34" y="84" width="30" height="6" fill="#2d1e18" />
            <rect x="46" y="83" width="8" height="8" rx="1" fill="#ffd166" />
            {/* Girl Dirndl Apron Lace if dirndl */}
            {resolvedSuitKey === "girl_dirndl" && (
              <path d="M38,62 L60,62 L57,84 L41,84 Z" fill="#ffffff" opacity="0.9" />
            )}
          </g>

          {/* Scarf / Collar */}
          <path d="M34,48 Q49,54 64,48 Q56,42 34,48" fill="url(#scarfGrad)" />
          <path className="kg-scarf-tail" d="M30,48 Q15,44 10,54 Q20,58 32,54 Z" fill="url(#scarfGrad)" />

          {/* Head & Face */}
          <g className="kg-head">
            {/* Face with chosen Skin Tone */}
            <circle cx="50" cy="32" r="16" fill={skinTone} />
            <circle cx="34" cy="34" r="3.5" fill={skinTone} /> {/* Ear */}

            {/* Eyes & Cute Features */}
            <circle cx="56" cy="30" r="2.2" fill="#1e1e1e" />
            {gender === "girl" && (
              <>
                {/* Eyelashes */}
                <path d="M57,28 L61,26 M57,30 L62,31" stroke="#1e1e1e" strokeWidth="1.2" strokeLinecap="round" />
                {/* Cheek Blush */}
                <circle cx="58" cy="36" r="3" fill="#f43f5e" opacity="0.45" />
              </>
            )}

            {/* Smile */}
            <path d="M52,38 Q56,42 60,38" stroke="#be123c" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Hair Bangs (Chosen Hair Color) */}
            <path d="M36,28 Q48,16 64,24 Q52,26 44,28 Z" fill={hairColor} />

            {/* Headgear / Accessory */}
            {curSuit.accessory === "crown" && (
              <g transform="translate(40, 10)">
                <path d="M0,14 L5,2 L10,8 L15,2 L20,14 Z" fill="#ffd166" stroke="#d97706" strokeWidth="1" />
                <circle cx="10" cy="9" r="1.5" fill="#ef4444" />
              </g>
            )}

            {curSuit.accessory === "tiara" && (
              <g transform="translate(42, 14)">
                <path d="M0,10 Q8,0 16,10" stroke="#ffd166" strokeWidth="3" fill="none" />
                <circle cx="8" cy="3" r="2.5" fill="#38bdf8" />
              </g>
            )}

            {curSuit.accessory === "feather" && (
              <g transform="translate(48, 8)">
                <path d="M12,14 Q22,4 18,-2 Q10,6 12,14" fill="#ffd166" />
                <path d="M10,14 L14,14" stroke="#e11d48" strokeWidth="2" />
              </g>
            )}

            {curSuit.accessory === "edelweiss" && (
              <circle cx="62" cy="18" r="4.5" fill="#ffffff" stroke="#e11d48" strokeWidth="1.5" />
            )}

            {curSuit.accessory === "visor" && (
              <path d="M48,26 L66,28 L64,34 L48,32 Z" fill="#06b6d4" opacity="0.85" />
            )}

            {curSuit.accessory === "spacehelmet" && (
              <circle cx="50" cy="32" r="19" fill="#38bdf8" opacity="0.35" stroke="#94a3b8" strokeWidth="2.5" />
            )}

            {/* Standard Cap for Casual outfits */}
            {(curSuit.accessory === "cap" || curSuit.accessory === "headband") && (
              <>
                <path d="M32,28 Q50,12 68,28 Z" fill={curSuit.cap} />
                <path d="M48,26 Q68,26 74,31 L64,32 Z" fill={curSuit.capVisor} />
              </>
            )}
          </g>

          {/* Front Leg (If walking on foot) */}
          {!isOnWheels && (
            <g className="kg-leg kg-leg-front">
              <rect x="48" y="90" width="10" height="28" rx="5" fill={curSuit.pants} />
              <path d="M46,114 L62,114 Q64,122 58,122 L44,122 Z" fill="#8c7264" />
            </g>
          )}

          {/* Bent Riding Legs (If on vehicle) */}
          {isOnWheels && (
            <g className="kg-riding-legs">
              <path
                d="M42,88 L52,108 L66,110"
                stroke={curSuit.pants}
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path d="M60,108 L72,110 Q74,116 66,116 L58,114 Z" fill="#6c584c" />
            </g>
          )}

          {/* Arm with Hand in chosen skin tone */}
          <g className="kg-arm">
            <rect
              x="42"
              y="54"
              width="10"
              height="26"
              rx="5"
              fill={curSuit.jacket[0]}
              transform={isOnWheels ? "rotate(-35 42 54)" : "rotate(-15 42 54)"}
            />
            <circle
              cx={isOnWheels ? "54" : "48"}
              cy={isOnWheels ? "72" : "80"}
              r="5"
              fill={skinTone}
            />
          </g>
        </g>

        {/* ---------------- VEHICLE MODELS ---------------- */}

        {/* 1. SKATEBOARD 🛹 */}
        {vehicle === "skateboard" && (
          <g className="kg-veh-skateboard" transform="translate(32, 122)">
            <path d="M0,8 Q5,0 15,2 L65,2 Q75,0 80,8 L75,10 L5,10 Z" fill="#ff595e" stroke="#1982c4" strokeWidth="2" />
            <rect x="14" y="10" width="6" height="4" fill="#333" />
            <rect x="60" y="10" width="6" height="4" fill="#333" />
            <circle cx="17" cy="16" r="6" fill="#ffca3a" stroke="#222" strokeWidth="2" />
            <circle cx="63" cy="16" r="6" fill="#ffca3a" stroke="#222" strokeWidth="2" />
          </g>
        )}

        {/* 2. E-KICKSCOOTER 🛴 */}
        {vehicle === "kickscooter" && (
          <g className="kg-veh-kickscooter" transform="translate(24, 98)">
            <line x1="68" y1="38" x2="62" y2="8" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
            <line x1="56" y1="8" x2="68" y2="8" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
            <path d="M18,38 L68,38" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
            <circle cx="68" cy="12" r="3.5" fill="#22c55e" /> {/* LED headlight */}
            <circle cx="20" cy="40" r="7" fill="#1f2937" stroke="#10b981" strokeWidth="2" />
            <circle cx="68" cy="40" r="7" fill="#1f2937" stroke="#10b981" strokeWidth="2" />
          </g>
        )}

        {/* 3. BICYCLE 🚲 */}
        {vehicle === "bike" && (
          <g className="kg-veh-bike" transform="translate(24, 100)">
            <path d="M22,36 L44,36 L56,16 L34,16 Z" stroke="#e63946" strokeWidth="3.5" fill="none" strokeLinejoin="round" />
            <line x1="34" y1="16" x2="22" y2="36" stroke="#e63946" strokeWidth="3.5" />
            <line x1="44" y1="36" x2="68" y2="36" stroke="#e63946" strokeWidth="3.5" />
            <line x1="68" y1="36" x2="56" y2="12" stroke="#e63946" strokeWidth="3.5" />
            <path d="M52,10 L60,10 L64,14" stroke="#333" strokeWidth="3" fill="none" />
            <path d="M30,14 L40,14" stroke="#222" strokeWidth="5" strokeLinecap="round" />
            <circle cx="22" cy="36" r="14" fill="none" stroke="#222" strokeWidth="3" />
            <circle cx="68" cy="36" r="14" fill="none" stroke="#222" strokeWidth="3" />
          </g>
        )}

        {/* 4. SCOOTER (Vespa) 🛵 */}
        {vehicle === "scooter" && (
          <g className="kg-veh-scooter" transform="translate(20, 96)">
            <path d="M10,24 Q24,18 42,28 L64,28 Q72,16 76,8 L82,14 L74,34 Q65,40 50,40 L16,40 Z" fill="#2a9d8f" stroke="#1d7066" strokeWidth="2" />
            <rect x="22" y="20" width="22" height="7" rx="3" fill="#5c3d2e" />
            <circle cx="78" cy="11" r="5" fill="#ffd166" />
            <circle cx="72" cy="2" r="3" fill="url(#metalGrad)" />
            <circle cx="24" cy="38" r="11" fill="#222" />
            <circle cx="24" cy="38" r="5" fill="url(#metalGrad)" />
            <circle cx="68" cy="38" r="11" fill="#222" />
            <circle cx="68" cy="38" r="5" fill="url(#metalGrad)" />
          </g>
        )}

        {/* 5. SUPERBIKE / MOTORRAD 🏍️ */}
        {vehicle === "motorbike" && (
          <g className="kg-veh-motorbike" transform="translate(18, 96)">
            <path d="M14,32 L36,18 L64,18 L84,24 L78,38 L16,38 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2" />
            <path d="M60,18 L76,10 L82,18 Z" fill="#1e293b" opacity="0.8" />
            <circle cx="82" cy="24" r="4" fill="#fbbf24" />
            <rect x="18" y="32" width="28" height="5" rx="2" fill="url(#chromeGrad)" />
            <circle cx="20" cy="36" r="13" fill="#111" stroke="#3b82f6" strokeWidth="3" />
            <circle cx="76" cy="36" r="13" fill="#111" stroke="#3b82f6" strokeWidth="3" />
          </g>
        )}

        {/* 6. SPORTS CAR 🏎️ */}
        {vehicle === "car" && (
          <g className="kg-veh-car" transform="translate(10, 98)">
            <path d="M8,28 Q14,14 34,16 L76,16 Q94,18 108,28 L114,38 L0,38 Z" fill="#d90429" stroke="#900" strokeWidth="2" />
            <path d="M40,16 L56,4 L72,16 Z" fill="#a8dadc" opacity="0.75" />
            <circle cx="106" cy="30" r="4" fill="#ffea00" />
            <rect x="0" y="24" width="114" height="4" fill="#ffffff" />
            <circle cx="24" cy="38" r="12" fill="#111" />
            <circle cx="24" cy="38" r="6" fill="url(#metalGrad)" />
            <circle cx="90" cy="38" r="12" fill="#111" />
            <circle cx="90" cy="38" r="6" fill="url(#metalGrad)" />
          </g>
        )}

        {/* 7. OFFROAD JEEP 🚙 */}
        {vehicle === "jeep" && (
          <g className="kg-veh-jeep" transform="translate(10, 92)">
            <path d="M10,24 L32,24 L48,8 L88,8 L98,24 L108,28 L108,40 L10,40 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            <path d="M50,12 L84,12 L80,24 L46,24 Z" fill="#93c5fd" opacity="0.75" />
            <rect x="100" y="28" width="8" height="12" fill="#1e293b" />
            <circle cx="104" cy="30" r="3.5" fill="#fef08a" />
            {/* Big Knobby Offroad Tires */}
            <circle cx="28" cy="40" r="15" fill="#18181b" stroke="#71717a" strokeWidth="4" />
            <circle cx="86" cy="40" r="15" fill="#18181b" stroke="#71717a" strokeWidth="4" />
          </g>
        )}

        {/* 8. HELICOPTER 🚁 */}
        {vehicle === "helicopter" && (
          <g className="kg-veh-helicopter" transform="translate(8, 62)">
            {/* Main Rotor Mast & Spinning Blades */}
            <rect x="56" y="8" width="6" height="12" fill="url(#chromeGrad)" />
            <g className="kg-heli-rotor">
              <ellipse cx="59" cy="8" rx="55" ry="3.5" fill="#38bdf8" opacity="0.75" />
              <line x1="4" y1="8" x2="114" y2="8" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Bubble Cockpit Body */}
            <path
              d="M32,20 Q18,34 26,52 L76,52 Q92,50 92,34 Q92,20 72,18 Z"
              fill="#e11d48"
              stroke="#9f1239"
              strokeWidth="2"
            />
            {/* Glass Cockpit Bubble */}
            <path d="M56,20 Q88,20 88,34 L56,36 Z" fill="#bae6fd" opacity="0.85" />

            {/* Tail Boom & Tail Rotor */}
            <path d="M26,38 L0,32 L0,24 L28,34 Z" fill="#be123c" />
            <line x1="0" y1="20" x2="0" y2="36" stroke="#38bdf8" strokeWidth="3" className="kg-heli-tail-rotor" />

            {/* Landing Skids */}
            <line x1="28" y1="52" x2="24" y2="62" stroke="#475569" strokeWidth="3" />
            <line x1="68" y1="52" x2="64" y2="62" stroke="#475569" strokeWidth="3" />
            <line x1="16" y1="62" x2="84" y2="62" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* 9. SPACE ROCKET 🚀 */}
        {vehicle === "rocket" && (
          <g className="kg-veh-rocket" transform="translate(14, 60)">
            {/* Rocket Thruster Flame Plume */}
            <g className="kg-rocket-flame" transform="translate(8, 38) rotate(-90)">
              <polygon points="0,0 8,26 16,0" fill="url(#flameGrad)" />
            </g>
            {/* Sleek Rocket Fuselage */}
            <path
              d="M16,30 L36,18 L84,18 Q108,24 116,36 Q108,48 84,54 L36,54 L16,42 Z"
              fill="url(#chromeGrad)"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Cockpit Dome */}
            <circle cx="78" cy="36" r="10" fill="#38bdf8" opacity="0.8" stroke="#0284c7" strokeWidth="2" />
            {/* Stabilizer Fins */}
            <polygon points="20,18 4,6 36,18" fill="#e11d48" />
            <polygon points="20,54 4,66 36,54" fill="#e11d48" />
          </g>
        )}

        {/* 10. ALIEN UFO 🛸 */}
        {vehicle === "ufo" && (
          <g className="kg-veh-ufo" transform="translate(10, 60)">
            {/* Glowing Tractor Beam */}
            <polygon points="40,54 18,88 106,88 84,54" fill="url(#ufoBeamGrad)" className="kg-ufo-beam" />
            {/* Glass Pilot Dome */}
            <ellipse cx="62" cy="26" rx="24" ry="16" fill="#67e8f9" opacity="0.8" stroke="#06b6d4" strokeWidth="2" />
            {/* Metallic Flying Saucer Ring */}
            <ellipse cx="62" cy="42" rx="54" ry="14" fill="#334155" stroke="#06b6d4" strokeWidth="2.5" />
            <ellipse cx="62" cy="46" rx="42" ry="7" fill="#1e293b" />
            {/* Glowing Edge Lights */}
            <circle cx="24" cy="42" r="3" fill="#22c55e" className="kg-ufo-light" />
            <circle cx="42" cy="47" r="3" fill="#eab308" className="kg-ufo-light" />
            <circle cx="62" cy="49" r="3.5" fill="#ec4899" className="kg-ufo-light" />
            <circle cx="82" cy="47" r="3" fill="#eab308" className="kg-ufo-light" />
            <circle cx="100" cy="42" r="3" fill="#22c55e" className="kg-ufo-light" />
          </g>
        )}
      </svg>
    </div>
  );
}
