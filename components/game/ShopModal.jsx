"use client";

import React, { useState } from "react";

export const SKIN_TONES = [
  { id: "fair", name: "Hell (Fair)", color: "#ffe0bd" },
  { id: "medium", name: "Beige (Medium)", color: "#ffd19a" },
  { id: "olive", name: "Olive (Gebräunt)", color: "#e0ac69" },
  { id: "brown", name: "Braun (Warm Brown)", color: "#c68642" },
  { id: "deep", name: "Dunkel (Deep)", color: "#8d5524" },
];

export const HAIR_COLORS = [
  { id: "blond", name: "Blond", color: "#ffd166" },
  { id: "brown", name: "Braun", color: "#5c3d2e" },
  { id: "black", name: "Schwarz", color: "#1a1a1a" },
  { id: "red", name: "Rot", color: "#c84b31" },
  { id: "pink", name: "Neon-Pink", color: "#ec4899" },
  { id: "silver", name: "Silber", color: "#cbd5e1" },
];

export const VEHICLE_LIST = [
  { id: "none", name: "Zu Fuß", icon: "🚶", price: 0, desc: "Klassischer Kölner Fußgänger", speed: "1x" },
  { id: "skateboard", name: "Street Pro Skateboard", icon: "🛹", price: 50, desc: "Flitze stylisch über das Pflaster", speed: "1.3x" },
  { id: "kickscooter", name: "E-Kickscooter LED", icon: "🛴", price: 90, desc: "Modern, leise und wendig am Rheinufer", speed: "1.5x" },
  { id: "bike", name: "Kölner City-Fahrrad", icon: "🚲", price: 150, desc: "Der echte Kölner Klassiker mit Klingel", speed: "1.8x" },
  { id: "scooter", name: "Retro Vespa-Roller", icon: "🛵", price: 260, desc: "Italienischer Flair vor dem Kölner Dom", speed: "2.2x" },
  { id: "motorbike", name: "Düsen-Superbike", icon: "🏍️", price: 420, desc: "Extrem schnelles Racing-Motorrad", speed: "2.8x" },
  { id: "car", name: "Roter Renn-Sportwagen", icon: "🏎️", price: 650, desc: "Aerodynamischer Rennwagen mit V8-Sound", speed: "3.5x" },
  { id: "jeep", name: "4x4 Offroad Safari-Jeep", icon: "🚙", price: 950, desc: "Riesige Reifen für jedes Rheinland-Abenteuer", speed: "3.8x" },
  { id: "helicopter", name: "Kölner Rettungshubschrauber", icon: "🚁", price: 1500, desc: "Fliegt über dem Boden mit drehendem Rotor!", speed: "5.0x" },
  { id: "rocket", name: "Galaktische Dom-Rakete", icon: "🚀", price: 2500, desc: "Hyperschall-Triebwerk mit Feuerschweif!", speed: "8.0x" },
  { id: "ufo", name: "Antigravity Alien-UFO", icon: "🛸", price: 4000, desc: "Außerirdische Technologie mit Traktorstrahl!", speed: "10.0x" },
];

export const SUIT_LIST = [
  // --- BOY OUTFITS ---
  {
    id: "boy_casual",
    gender: "boy",
    name: "Entdecker Junge (Classic)",
    icon: "🎒",
    price: 0,
    desc: "Blaue Jacke, Jeans & rote Reisemütze",
  },
  {
    id: "boy_bavarian",
    gender: "boy",
    name: "Lederhosen Junge",
    icon: "🥨",
    price: 80,
    desc: "Bayerische Tracht mit Hirschhornknöpfen & Alpenhut",
  },
  {
    id: "boy_karneval",
    gender: "boy",
    name: "Kölner Prinz (Karneval)",
    icon: "🎭",
    price: 180,
    desc: "Kölle Alaaf! Traditioneller Prinzen-Prunk mit Goldfeder",
  },
  {
    id: "boy_racer",
    gender: "boy",
    name: "Formel-1 Rennfahrer",
    icon: "🏎️",
    price: 320,
    desc: "Profi-Rennoverall in Mattschwarz mit Sponsor-Patches",
  },
  {
    id: "boy_detective",
    gender: "boy",
    name: "Meister-Detektiv Junge",
    icon: "🕵️",
    price: 500,
    desc: "Klassischer Trenchcoat, Lupe & karierte Schlägermütze",
  },
  {
    id: "boy_king",
    gender: "boy",
    name: "Kölner Dom-König",
    icon: "👑",
    price: 850,
    desc: "Königlicher Samtmantel mit Hermelinbesatz & Goldkrone",
  },
  {
    id: "boy_cyber",
    gender: "boy",
    name: "Cyber-Samurai",
    icon: "⚡",
    price: 1400,
    desc: "Futuristischer Neon-Kampfanzug mit Leuchtvisier",
  },
  {
    id: "boy_astronaut",
    gender: "boy",
    name: "Galaktischer Raumfahrer",
    icon: "👨‍🚀",
    price: 2200,
    desc: "High-Tech NASA Weltraumanzug mit Sauerstoffhelm",
  },

  // --- GIRL OUTFITS ---
  {
    id: "girl_casual",
    gender: "girl",
    name: "Entdeckerin Mädchen (Classic)",
    icon: "🎀",
    price: 0,
    desc: "Rosa Sportjacke, Pferdeschwanz & stylische Sonnenbrille",
  },
  {
    id: "girl_dirndl",
    gender: "girl",
    name: "Festtags-Dirndl",
    icon: "👗",
    price: 80,
    desc: "Traditionelles bayerisches Dirndlkleid mit Schürze",
  },
  {
    id: "girl_karneval",
    gender: "girl",
    name: "Kölner Prinzessin (Karneval)",
    icon: "👸",
    price: 180,
    desc: "Prachtvolles Karnevalskleid mit funkelnder Glitzer-Tiara",
  },
  {
    id: "girl_racer",
    gender: "girl",
    name: "Aero-Rennfahrerin",
    icon: "🏎️",
    price: 320,
    desc: "High-Speed Rennanzug in Violett mit Gold-Visier",
  },
  {
    id: "girl_detective",
    gender: "girl",
    name: "Meister-Detektivin",
    icon: "🕵️‍♀️",
    price: 500,
    desc: "Eleganter Detektivmantel mit Barett & Notizbuch",
  },
  {
    id: "girl_queen",
    gender: "girl",
    name: "Kölner Dom-Kaiserin",
    icon: "👑",
    price: 850,
    desc: "Majestätisches Prachtkleid mit Saphir-Kollier & Krone",
  },
  {
    id: "girl_cyber",
    gender: "girl",
    name: "Cyber-Valkyrie",
    icon: "⚡",
    price: 1400,
    desc: "Holographische Cyber-Rüstung mit Energie-Flügeln",
  },
  {
    id: "girl_astronaut",
    gender: "girl",
    name: "Galaktische Raumfahrerin",
    icon: "👩‍🚀",
    price: 2200,
    desc: "High-Tech Astronautenanzug mit getöntem Goldvisier",
  },
];

export default function ShopModal({
  coins = 0,
  gender = "boy",
  skinTone = "#ffd19a",
  hairColor = "#5c3d2e",
  unlockedVehicles = ["none"],
  unlockedSuits = ["boy_casual", "girl_casual"],
  currentVehicle = "none",
  currentSuit = "boy_casual",
  onChangeGender,
  onChangeSkinTone,
  onChangeHairColor,
  onEquipVehicle,
  onEquipSuit,
  onUnlockVehicle,
  onUnlockSuit,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("avatar"); // 'avatar' | 'suits' | 'vehicles'
  const [suitFilter, setSuitFilter] = useState("all"); // 'all' | 'boy' | 'girl'

  const filteredSuits = SUIT_LIST.filter((s) => {
    if (suitFilter === "all") return true;
    return s.gender === suitFilter;
  });

  return (
    <div className="kg-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="kg-card kg-shop-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="kg-card-head">
          <div className="kg-shop-title">
            <h2>🎁 Hangar & Charakter-Studio</h2>
            <p className="kg-shop-subtitle">
              Passe deinen Körper an und schalte High-End Fahrzeuge (Hubschrauber, UFO) & Outfits frei!
            </p>
          </div>
          <button className="kg-btn-close" onClick={onClose} aria-label="Schließen">
            ✕
          </button>
        </div>

        {/* Coin Balance & Daily Streak Bar */}
        <div className="kg-shop-wallet">
          <div className="kg-wallet-pill">
            <span className="kg-wallet-coin">🪙</span>
            <div>
              <small>Dein Guthaben</small>
              <strong>{coins} Münzen</strong>
            </div>
          </div>
          <div className="kg-wallet-streak">
            <span>🔥</span>
            <div>
              <small>Tägliche Übung</small>
              <strong>Streak Aktiv (+5 Bonus je Level)</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="kg-shop-tabs">
          <button
            className={`kg-shop-tab ${activeTab === "avatar" ? "is-active" : ""}`}
            onClick={() => setActiveTab("avatar")}
          >
            👤 Körper & Avatar
          </button>
          <button
            className={`kg-shop-tab ${activeTab === "suits" ? "is-active" : ""}`}
            onClick={() => setActiveTab("suits")}
          >
            👗 Kleidung & Outfits ({unlockedSuits.length}/{SUIT_LIST.length})
          </button>
          <button
            className={`kg-shop-tab ${activeTab === "vehicles" ? "is-active" : ""}`}
            onClick={() => setActiveTab("vehicles")}
          >
            🚁 Fahrzeuge & Hangar ({unlockedVehicles.length}/{VEHICLE_LIST.length})
          </button>
        </div>

        {/* ================= TAB 1: AVATAR / BODY CUSTOMIZER ================= */}
        {activeTab === "avatar" && (
          <div className="kg-avatar-builder">
            {/* Gender Selection */}
            <div className="kg-builder-section">
              <label className="kg-builder-label">1. Wähle dein Geschlecht / Körper:</label>
              <div className="kg-gender-toggle-group">
                <button
                  className={`kg-gender-card ${gender === "boy" ? "is-selected" : ""}`}
                  onClick={() => onChangeGender("boy")}
                >
                  <span className="kg-gender-icon">👦</span>
                  <strong>Junge (Boy)</strong>
                  <small>Kurze Haare, Kappe & Abenteurer-Look</small>
                </button>
                <button
                  className={`kg-gender-card ${gender === "girl" ? "is-selected" : ""}`}
                  onClick={() => onChangeGender("girl")}
                >
                  <span className="kg-gender-icon">👧</span>
                  <strong>Mädchen (Girl)</strong>
                  <small>Langer Pferdeschwanz, Wimpern & Dirndl</small>
                </button>
              </div>
            </div>

            {/* Skin Tone Selector */}
            <div className="kg-builder-section">
              <label className="kg-builder-label">2. Hautfarbe (Skin Tone):</label>
              <div className="kg-color-palette">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone.id}
                    className={`kg-swatch ${skinTone === tone.color ? "is-active" : ""}`}
                    style={{ backgroundColor: tone.color }}
                    onClick={() => onChangeSkinTone(tone.color)}
                    title={tone.name}
                  >
                    {skinTone === tone.color && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color Selector */}
            <div className="kg-builder-section">
              <label className="kg-builder-label">3. Haarfarbe (Hair Color):</label>
              <div className="kg-color-palette">
                {HAIR_COLORS.map((hair) => (
                  <button
                    key={hair.id}
                    className={`kg-swatch ${hairColor === hair.color ? "is-active" : ""}`}
                    style={{ backgroundColor: hair.color }}
                    onClick={() => onChangeHairColor(hair.color)}
                    title={hair.name}
                  >
                    {hairColor === hair.color && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="kg-avatar-preview-box">
              <p>
                ✨ <strong>Avatar angepasst:</strong> Dein Charakter spiegelt diese Änderungen sofort auf der Straße und allen Fahrzeugen wider!
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 2: OUTFITS & DRESSES ================= */}
        {activeTab === "suits" && (
          <div>
            {/* Filter Buttons */}
            <div className="kg-filter-bar">
              <button
                className={`kg-filter-pill ${suitFilter === "all" ? "is-active" : ""}`}
                onClick={() => setSuitFilter("all")}
              >
                Alle ({SUIT_LIST.length})
              </button>
              <button
                className={`kg-filter-pill ${suitFilter === "boy" ? "is-active" : ""}`}
                onClick={() => setSuitFilter("boy")}
              >
                👦 Für Jungs
              </button>
              <button
                className={`kg-filter-pill ${suitFilter === "girl" ? "is-active" : ""}`}
                onClick={() => setSuitFilter("girl")}
              >
                👧 Für Mädchen
              </button>
            </div>

            <div className="kg-shop-grid">
              {filteredSuits.map((suit) => {
                const isUnlocked = unlockedSuits.includes(suit.id);
                const isEquipped = currentSuit === suit.id;
                const canAfford = coins >= suit.price;

                return (
                  <div key={suit.id} className={`kg-shop-item ${isEquipped ? "is-equipped" : ""}`}>
                    <div className="kg-item-badge">{suit.gender === "boy" ? "👦 Junge" : "👧 Mädchen"}</div>
                    <div className="kg-item-icon">{suit.icon}</div>
                    <div className="kg-item-info">
                      <strong>{suit.name}</strong>
                      <p>{suit.desc}</p>
                    </div>

                    <div className="kg-item-action">
                      {isEquipped ? (
                        <span className="kg-tag-active">✓ Ausgerüstet</span>
                      ) : isUnlocked ? (
                        <button className="kg-btn-equip" onClick={() => onEquipSuit(suit.id)}>
                          Ausrüsten
                        </button>
                      ) : (
                        <button
                          className="kg-btn-buy"
                          disabled={!canAfford}
                          onClick={() => onUnlockSuit(suit)}
                          title={canAfford ? "Freischalten" : "Zu wenige Münzen"}
                        >
                          🪙 {suit.price} Münzen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: VEHICLES & HANGAR ================= */}
        {activeTab === "vehicles" && (
          <div className="kg-shop-grid">
            {VEHICLE_LIST.map((veh) => {
              const isUnlocked = unlockedVehicles.includes(veh.id);
              const isEquipped = currentVehicle === veh.id;
              const canAfford = coins >= veh.price;

              return (
                <div key={veh.id} className={`kg-shop-item ${isEquipped ? "is-equipped" : ""}`}>
                  <div className="kg-speed-badge">⚡ Tempo: {veh.speed}</div>
                  <div className="kg-item-icon">{veh.icon}</div>
                  <div className="kg-item-info">
                    <strong>{veh.name}</strong>
                    <p>{veh.desc}</p>
                  </div>

                  <div className="kg-item-action">
                    {isEquipped ? (
                      <span className="kg-tag-active">✓ Im Einsatz</span>
                    ) : isUnlocked ? (
                      <button className="kg-btn-equip" onClick={() => onEquipVehicle(veh.id)}>
                        Fahren
                      </button>
                    ) : (
                      <button
                        className="kg-btn-buy"
                        disabled={!canAfford}
                        onClick={() => onUnlockVehicle(veh)}
                        title={canAfford ? "Freischalten" : "Zu wenige Münzen"}
                      >
                        🪙 {veh.price} Münzen
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Hint */}
        <div className="kg-shop-hint">
          💡 <strong>Belohnungs-Tipp:</strong> Meistere Sessions mit 100% Richtigkeit (+15 Bonus) und öffne goldene Schatzkisten am Straßenrand, um legendäre Fahrzeuge wie den Hubschrauber 🚁 oder das UFO 🛸 freizuschalten!
        </div>
      </div>
    </div>
  );
}
