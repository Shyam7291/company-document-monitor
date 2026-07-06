import React, { useEffect, useMemo, useState } from "react";

const ORIGINAL_BG_IMAGE = "https://cdn.jsdelivr.net/gh/Shyam7291/company-document-monitor@main/Designer (1).png";
const BG_IMAGE = `https://wsrv.nl/?url=${encodeURIComponent(ORIGINAL_BG_IMAGE)}&output=png&w=820&h=980&fit=cover`;
const GLASS_CARD_IMAGE = "https://cdn.jsdelivr.net/gh/Shyam7291/company-document-monitor@main/32454-removebg-preview.png";
const BRAND_ORANGE = "#f59e0b";

export default function BuyerHomeAlignedSmallerGlassCard() {
  const buyerName = "Shyam";
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [contentHidden, setContentHidden] = useState(false);
  const [hovered, setHovered] = useState(null);

  const features = useMemo(
    () => [
      {
        title: "Best Rate",
        subtitle: "Comparison support from 1K+ sellers",
        icon: "🪨",
      },
      {
        title: "Pure Quality",
        subtitle: "No mixing. Quality checked material",
        icon: "🛡️",
      },
      {
        title: "Zero Brokerage",
        subtitle: "0% brokerage. No heavy middleman cost",
        icon: "0%",
      },
      {
        title: "Easy Transport",
        subtitle: "Transport as per your availability",
        icon: "🚚",
      },
    ],
    []
  );

  const rotateToFeature = (nextIndex) => {
    setContentHidden(true);
    setRotation((current) => current + 180);

    setTimeout(() => {
      setActiveIndex(nextIndex);
    }, 430);

    setTimeout(() => {
      setContentHidden(false);
    }, 560);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % features.length;
      rotateToFeature(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [activeIndex, features.length]);

  const active = features[activeIndex];

  return (
    <div className="page">
      <style>{css}</style>

      <div className="phone">
        <section className="hero">
          <img className="heroBg" src={BG_IMAGE} alt="Quarry background" />
          <div className="heroShade" />
          <div className="bottomBlend" />
          <div className="activeGlow" />

          <nav className="topNav">
            <button>≡</button>
            <button>●</button>
          </nav>

          <div className="intro">
            <h1>Hey {buyerName} 👋</h1>
            <p>Ready to order<br />good quality stone today?</p>
          </div>

          <div className="featureWrap">
            <div className="platform" />
            <div className="ring" />

            <article className="singleFeatureCard">
              <div className="glassSpinLayer" style={{ transform: `rotateY(${rotation}deg)` }}>
                <img className="glassCardImage" src={GLASS_CARD_IMAGE} alt="Glass feature card" />
              </div>

              <div className={contentHidden ? "cardContent hidden" : "cardContent"}>
                <div className="featureIcon">{active.icon}</div>
                <div className="stars">★★★★★</div>
                <h2>{active.title}</h2>
                <p>{active.subtitle}</p>
                <button>➜</button>
              </div>
            </article>
          </div>

          <div className="dots">
            {features.map((feature, index) => (
              <button
                key={feature.title}
                onClick={() => {
                  if (index !== activeIndex) rotateToFeature(index);
                }}
                className={index === activeIndex ? "dot active" : "dot"}
              />
            ))}
          </div>
        </section>

        <section className="actions">
          <button
            className={hovered === "place" ? "place hover" : "place"}
            onMouseEnter={() => setHovered("place")}
            onMouseLeave={() => setHovered(null)}
          >
            <span>Place New Order</span><b>➜</b>
          </button>

          <div className="quickGrid">
            <button
              className={hovered === "active" ? "quick hover" : "quick"}
              onMouseEnter={() => setHovered("active")}
              onMouseLeave={() => setHovered(null)}
            >
              <h3>Active Order</h3><p>40mm Crushed Stone</p><small>32 tons</small><em>Track →</em>
            </button>

            <button
              className={hovered === "repeat" ? "quick hover" : "quick"}
              onMouseEnter={() => setHovered("repeat")}
              onMouseLeave={() => setHovered(null)}
            >
              <h3>Last Order</h3><p>20mm Stone</p><small>2 trucks • 20 tons</small><em>Repeat →</em>
            </button>
          </div>
        </section>

        <nav className="bottomNav">
          <button className="active"><span>🏠</span><b>Home</b></button>
          <button><span>📦</span><b>My Orders</b></button>
          <button><span>👤</span><b>Profile</b></button>
        </nav>
      </div>
    </div>
  );
}

const css = `
* { box-sizing: border-box; }
html, body, #root { margin: 0; width: 100%; min-height: 100%; }
.page {
  min-height: 100vh;
  width: 100%;
  background: #f4f1ea;
  display: flex;
  justify-content: center;
  padding: 14px;
  font-family: Arial, sans-serif;
}
.phone {
  width: 390px;
  min-width: 390px;
  height: 760px;
  background: #050505;
  border-radius: 32px;
  overflow: hidden;
  display: grid;
  grid-template-rows: 470px 210px 80px;
  box-shadow: 0 30px 80px rgba(0,0,0,.28);
}
.hero {
  position: relative;
  height: 470px;
  overflow: hidden;
  color: white;
  padding: 16px 20px 10px;
  background: #111;
}
.heroBg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  z-index: 0;
  transform: scale(1.3);
}
.heroShade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(to bottom, rgba(0,0,0,.12), rgba(0,0,0,.01) 42%, rgba(0,0,0,.12) 72%);
  pointer-events: none;
}
.bottomBlend {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 82px;
  z-index: 2;
  background: linear-gradient(to bottom, transparent, #050505 94%);
  pointer-events: none;
}
.activeGlow {
  position: absolute;
  left: 50%;
  top: 232px;
  width: 205px;
  height: 190px;
  margin-left: -102.5px;
  border-radius: 50%;
  filter: blur(34px);
  opacity: .26;
  z-index: 2;
  background: ${BRAND_ORANGE};
  animation: pulse 3s ease-in-out infinite;
}
.topNav, .intro, .featureWrap, .dots { position: relative; z-index: 5; }
.topNav { display: flex; justify-content: space-between; }
.topNav button {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: rgba(0,0,0,.50);
  color: white;
  font-size: 20px;
  font-weight: 950;
}
.intro {
  margin-top: 12px;
  margin-left: 7px;
  text-shadow: 0 4px 14px rgba(0,0,0,.75);
}
.intro h1 { margin: 0; color: #fde68a; font-size: 22px; font-weight: 950; }
.intro p { margin: 12px 0 0; color: white; font-size: 15px; line-height: 1.22; font-weight: 950; }
.featureWrap {
  height: 260px;
  margin-top: 0;
  perspective: 1100px;
}
.platform {
  position: absolute;
  left: 50%;
  bottom: 2px;
  width: 185px;
  height: 46px;
  margin-left: -92.5px;
  border-radius: 50%;
  background: rgba(0,0,0,.36);
  filter: blur(4px);
}
.ring {
  position: absolute;
  left: 50%;
  bottom: 45px;
  width: 178px;
  height: 52px;
  margin-left: -89px;
  border-radius: 50%;
  border: 2px solid ${BRAND_ORANGE};
  box-shadow: 0 0 22px ${BRAND_ORANGE};
  transform: rotateX(68deg);
}
.singleFeatureCard {
  position: absolute;
  left: 50%;
  top: 14px;
  width: 178px;
  height: 210px;
  margin-left: -89px;
  color: white;
  text-align: center;
  animation: float 3.8s ease-in-out infinite;
}
.glassSpinLayer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: center center;
  transition: transform 900ms cubic-bezier(.32,.72,.22,1);
  will-change: transform;
}
.glassCardImage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1; 
  transform: scale(1.10);
  transform-origin: center center;

  filter: drop-shadow(0 20px 26px rgba(0,0,0,.24));
}
.cardContent {
  position: absolute;
  left: 50%;
  top: 42px;
  width: 112px;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1;
  transition: opacity 150ms ease, transform 150ms ease;
}
.cardContent.hidden {
  opacity: 0;
  transform: translateX(-50%) scale(.96);
}
.featureIcon {
  width: 43px;
  height: 43px;
  border-radius: 15px;
  color: #111827;
  background: ${BRAND_ORANGE};
  box-shadow: 0 0 18px ${BRAND_ORANGE};
  display: grid;
  place-items: center;
  font-size: 20px;
  font-weight: 950;
}
.stars { margin-top: 7px; font-size: 9px; letter-spacing: 2px; color: ${BRAND_ORANGE}; }
.cardContent h2 { margin: 7px 0 0; font-size: 15px; font-weight: 950; text-shadow: 0 4px 12px rgba(0,0,0,.55); }
.cardContent p { margin: 6px 0 0; color: #fff7ed; font-size: 8.5px; line-height: 1.22; font-weight: 750; text-shadow: 0 3px 9px rgba(0,0,0,.65); }
.cardContent button {
  width: 27px;
  height: 27px;
  margin-top: 8px;
  border: 0;
  border-radius: 999px;
  color: white;
  background: ${BRAND_ORANGE};
  font-weight: 950;
}
.dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: -1px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: 0;
  background: rgba(255,255,255,.76);
}
.dot.active { width: 11px; background: ${BRAND_ORANGE}; }
.actions { height: 210px; padding: 12px 26px 0; background: #050505; }
.place {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 28px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 18px 0 28px;
  font-size: 16px;
  font-weight: 950;
  box-shadow: 0 18px 34px rgba(245,158,11,.28);
}
.place.hover { transform: translateY(-3px) scale(1.012); }
.quickGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
.quick {
  min-height: 98px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.10);
  background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
  color: white;
  text-align: left;
}
.quick.hover { transform: translateY(-3px); background: rgba(245,158,11,.12); }
.quick h3 { margin: 0; font-size: 13px; font-weight: 950; }
.quick p { margin: 7px 0 0; color: #d6d3d1; font-size: 9.2px; line-height: 1.25; font-weight: 750; }
.quick small { display: block; margin-top: 3px; color: #d6d3d1; font-size: 9.2px; font-weight: 750; }
.quick em { display: block; margin-top: 7px; color: #fbbf24; font-size: 12px; font-weight: 950; font-style: normal; }
.bottomNav {
  height: 80px;
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 8px;
  margin: 0 26px 12px;
  padding: 7px 10px 8px;
  background: rgba(16,16,16,.92);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,.08);
}
.bottomNav button { min-height: 43px; border: 0; border-radius: 16px; background: transparent; color: #a8a29e; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-weight: 900; }
.bottomNav button.active { color: ${BRAND_ORANGE}; }
.bottomNav span { font-size: 16px; }
.bottomNav b { font-size: 10px; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes pulse { 0%,100% { transform: scale(.92); opacity: .22; } 50% { transform: scale(1.12); opacity: .36; } }
`;
