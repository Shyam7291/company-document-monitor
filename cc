import React, { useEffect, useMemo, useState } from "react";

const ORIGINAL_BG_IMAGE = "https://raw.githubusercontent.com/Shyam7291/company-document-monitor/main/you_acn_only_generate_the_sa.png";
const BG_IMAGE = `https://wsrv.nl/?url=${encodeURIComponent(ORIGINAL_BG_IMAGE)}&output=png&w=820&h=980&fit=cover`;
const GLASS_CARD_IMAGE = "https://cdn.jsdelivr.net/gh/Shyam7291/company-document-monitor@main/32454-removebg-preview.png";
const BRAND_ORANGE = "#f59e0b";

export default function BuyerHomeResponsivePhoneShellFinal() {
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
      setActiveIndex((current) => {
        const nextIndex = (current + 1) % features.length;
        setContentHidden(true);
        setRotation((rotationValue) => rotationValue + 180);

        setTimeout(() => {
          setContentHidden(false);
        }, 560);

        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [features.length]);

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
            <p>
              Ready to order
              <br />
              good quality stone today?
            </p>
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
            <span>Place New Order</span>
            <b>➜</b>
          </button>

          <div className="quickGrid">
            <button
              className={hovered === "active" ? "quick hover" : "quick"}
              onMouseEnter={() => setHovered("active")}
              onMouseLeave={() => setHovered(null)}
            >
              <h3>Active Order</h3>
              <p>40mm Crushed Stone</p>
              <small>32 tons</small>
              <em>Track →</em>
            </button>

            <button
              className={hovered === "repeat" ? "quick hover" : "quick"}
              onMouseEnter={() => setHovered("repeat")}
              onMouseLeave={() => setHovered(null)}
            >
              <h3>Last Order</h3>
              <p>20mm Stone</p>
              <small>2 trucks • 20 tons</small>
              <em>Repeat →</em>
            </button>
          </div>
        </section>

        <nav className="bottomNav">
          <button className="active">
            <span>🏠</span>
            <b>Home</b>
          </button>
          <button>
            <span>📦</span>
            <b>My Orders</b>
          </button>
          <button>
            <span>👤</span>
            <b>Profile</b>
          </button>
        </nav>
      </div>
    </div>
  );
}

const css = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  width: 100%;
  min-height: 100%;
}

.page {
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  background: #f4f1ea;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

.phone {
  width: clamp(360px, min(94vw, 52dvh), 430px);
  aspect-ratio: 390 / 760;
  max-height: calc(100dvh - 16px);
  background: #050505;
  border-radius: clamp(26px, 8vw, 34px);
  overflow: hidden;
  display: grid;
  grid-template-rows: 58% 29% 13%;
  box-shadow: 0 30px 80px rgba(0, 0, 0, .28);
}

.hero {
  position: relative;
  height: 100%;
  overflow: hidden;
  color: white;
  padding: 3.7% 5.1% 2%;
  background: #111;
}

.heroBg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 46%;
  transform: scale(1.10);
  z-index: 0;
}

.heroShade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(to bottom, rgba(0,0,0,.14), rgba(0,0,0,.02) 42%, rgba(0,0,0,.13) 72%);
  pointer-events: none;
}

.bottomBlend {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 18%;
  z-index: 2;
  background: linear-gradient(to bottom, transparent, #050505 94%);
  pointer-events: none;
}

.activeGlow {
  position: absolute;
  left: 50%;
  top: 52%;
  width: 53%;
  height: 43%;
  transform: translateX(-50%);
  border-radius: 50%;
  filter: blur(36px);
  opacity: .24;
  z-index: 2;
  background: ${BRAND_ORANGE};
  animation: pulse 3s ease-in-out infinite;
}

.topNav,
.intro,
.featureWrap,
.dots {
  position: relative;
  z-index: 5;
}

.topNav {
  display: flex;
  justify-content: space-between;
}

.topNav button {
  width: clamp(30px, 8.7vw, 36px);
  height: clamp(30px, 8.7vw, 36px);
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, .50);
  color: white;
  font-size: clamp(18px, 5vw, 21px);
  font-weight: 950;
}

.intro {
  margin-top: 3%;
  margin-left: 2%;
  text-shadow: 0 4px 14px rgba(0, 0, 0, .75);
}

.intro h1 {
  margin: 0;
  color: #fde68a;
  font-size: clamp(20px, 7.2vw, 30px);
  line-height: 1;
  font-weight: 950;
}

.intro p {
  margin: 3% 0 0;
  color: white;
  font-size: clamp(14px, 4.6vw, 22px);
  line-height: 1.13;
  font-weight: 950;
}

.featureWrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 39%;
  bottom: 8%;
  height: auto;
  perspective: 1100px;
  z-index: 5;
}

.singleFeatureCard {
  position: absolute;
  left: 50%;
  top: 2%;
  width: clamp(150px, 45%, 188px);
  aspect-ratio: 205 / 240;
  color: white;
  text-align: center;
  transform: translateX(-50%);
  animation: floatCard 3.8s ease-in-out infinite;
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
  filter: drop-shadow(0 18px 24px rgba(0,0,0,.24));
}

.cardContent {
  position: absolute;
  left: 50%;
  top: 20%;
  width: 64%;
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
  width: clamp(36px, 11.5vw, 49px);
  height: clamp(36px, 11.5vw, 49px);
  border-radius: clamp(13px, 4vw, 17px);
  color: #111827;
  background: ${BRAND_ORANGE};
  box-shadow: 0 0 20px ${BRAND_ORANGE};
  display: grid;
  place-items: center;
  font-size: clamp(17px, 5.3vw, 22px);
  font-weight: 950;
}

.stars {
  margin-top: 6%;
  font-size: clamp(8px, 2.7vw, 10px);
  letter-spacing: 2px;
  color: ${BRAND_ORANGE};
}

.cardContent h2 {
  margin: 6% 0 0;
  font-size: clamp(13px, 4.4vw, 17px);
  line-height: 1.12;
  font-weight: 950;
  text-shadow: 0 4px 12px rgba(0,0,0,.55);
}

.cardContent p {
  margin: 5% 0 0;
  color: #fff7ed;
  font-size: clamp(7.5px, 2.5vw, 9.2px);
  line-height: 1.18;
  font-weight: 750;
  text-shadow: 0 3px 9px rgba(0,0,0,.65);
}

.cardContent button {
  width: clamp(24px, 7vw, 30px);
  height: clamp(24px, 7vw, 30px);
  margin-top: 7%;
  border: 0;
  border-radius: 999px;
  color: white;
  background: ${BRAND_ORANGE};
  font-weight: 950;
}

.ring {
  position: absolute;
  left: 50%;
  bottom: 15%;
  width: clamp(145px, 43%, 185px);
  height: clamp(42px, 12%, 54px);
  border-radius: 50%;
  border: 2px solid ${BRAND_ORANGE};
  box-shadow: 0 0 22px ${BRAND_ORANGE};
  transform: translateX(-50%) rotateX(68deg);
}

.platform {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: clamp(150px, 45%, 192px);
  height: 17%;
  border-radius: 50%;
  background: rgba(0,0,0,.36);
  filter: blur(4px);
  transform: translateX(-50%);
}

.dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2.5%;
  display: flex;
  justify-content: center;
  gap: 8px;
  z-index: 6;
}

.dot {
  width: clamp(7px, 2vw, 8px);
  height: clamp(7px, 2vw, 8px);
  border-radius: 999px;
  border: 0;
  background: rgba(255,255,255,.76);
}

.dot.active {
  width: clamp(10px, 2.8vw, 11px);
  background: ${BRAND_ORANGE};
}

.actions {
  height: 100%;
  padding: 4% 6% 0;
  background: #050505;
}

.place {
  width: 100%;
  height: clamp(46px, 23%, 56px);
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6% 0 11%;
  font-size: clamp(15px, 4.7vw, 18px);
  font-weight: 950;
  box-shadow: 0 18px 34px rgba(245,158,11,.28);
}

.place.hover {
  transform: translateY(-3px) scale(1.012);
}

.quickGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4%;
  margin-top: 4%;
  height: 54%;
}

.quick {
  min-height: 0;
  height: 100%;
  padding: 10%;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,.10);
  background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
  color: white;
  text-align: left;
}

.quick.hover {
  transform: translateY(-3px);
  background: rgba(245,158,11,.12);
}

.quick h3 {
  margin: 0;
  font-size: clamp(12px, 3.6vw, 14px);
  font-weight: 950;
}

.quick p,
.quick small {
  display: block;
  margin-top: 6%;
  color: #d6d3d1;
  font-size: clamp(8px, 2.6vw, 10px);
  line-height: 1.22;
  font-weight: 750;
}

.quick em {
  display: block;
  margin-top: 9%;
  color: ${BRAND_ORANGE};
  font-size: clamp(11px, 3.3vw, 13px);
  font-weight: 950;
  font-style: normal;
}

.bottomNav {
  height: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2%;
  margin: 0 6% 3%;
  padding: 2% 3%;
  background: rgba(16,16,16,.92);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,.08);
}

.bottomNav button {
  min-height: 0;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: #a8a29e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-weight: 900;
}

.bottomNav button.active {
  color: ${BRAND_ORANGE};
}

.bottomNav span {
  font-size: clamp(14px, 4vw, 17px);
}

.bottomNav b {
  font-size: clamp(9px, 2.7vw, 11px);
}

@keyframes floatCard {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translateX(-50%) scale(.92);
    opacity: .22;
  }
  50% {
    transform: translateX(-50%) scale(1.12);
    opacity: .36;
  }
}
`;
