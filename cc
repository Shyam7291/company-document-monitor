import ViewportSize from "./ViewportSize.jsx";
import React, { useEffect, useMemo, useState } from "react";

const SHOW_DEVICE_LAB = false;

const ORIGINAL_BG_IMAGE =
  "https://raw.githubusercontent.com/Shyam7291/company-document-monitor/main/you_acn_only_generate_the_sa.png";

const BG_IMAGE = `https://wsrv.nl/?url=${encodeURIComponent(
  ORIGINAL_BG_IMAGE
)}&output=png&w=820&h=980&fit=cover`;

const GLASS_CARD_IMAGE =
  "https://cdn.jsdelivr.net/gh/Shyam7291/company-document-monitor@main/32454-removebg-preview.png";

const BRAND_ORANGE = "#f59e0b";

const DEVICES = [
  { name: "iPhone SE", w: 375, h: 667 },
  { name: "iPhone 12 Mini", w: 360, h: 780 },
  { name: "iPhone 13 Mini", w: 375, h: 812 },
  { name: "iPhone 12", w: 390, h: 844 },
  { name: "iPhone 13", w: 390, h: 844 },
  { name: "iPhone 14", w: 390, h: 844 },
  { name: "iPhone 14 Pro", w: 393, h: 852 },
  { name: "iPhone 14 Pro Max", w: 430, h: 932 },
  { name: "iPhone 15", w: 393, h: 852 },
  { name: "iPhone 15 Pro", w: 393, h: 852 },
  { name: "iPhone 15 Pro Max", w: 430, h: 932 },
  { name: "Galaxy S22", w: 360, h: 780 },
  { name: "Galaxy S23", w: 360, h: 780 },
  { name: "Galaxy S24", w: 412, h: 915 },
  { name: "Galaxy S25 Ultra", w: 412, h: 891 },
  { name: "Android Large", w: 430, h: 932 },
];

function BuyerHomeScreen({ labMode = false }) {
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
    }, 420);

    setTimeout(() => {
      setContentHidden(false);
    }, 560);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setContentHidden(true);
      setRotation((current) => current + 180);

      setTimeout(() => {
        setActiveIndex((current) => (current + 1) % features.length);
      }, 420);

      setTimeout(() => {
        setContentHidden(false);
      }, 560);
    }, 3000);

    return () => clearInterval(timer);
  }, [features.length]);

  const active = features[activeIndex];

  return (
    <div className={labMode ? "phone labPhone" : "phone"}>
      <section className="hero">
        {React.createElement("img", {
          className: "heroBg",
          src: BG_IMAGE,
          alt: "Quarry background",
        })}

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
            <div
              className="glassSpinLayer"
              style={{ transform: `rotateY(${rotation}deg)` }}
            >
              {React.createElement("img", {
                className: "glassCardImage",
                src: GLASS_CARD_IMAGE,
                alt: "Glass feature card",
              })}
            </div>

            <div
              className={contentHidden ? "cardContent hidden" : "cardContent"}
            >
              <div className="featureIcon">{active.icon}</div>
              <div className="stars">★★★★★</div>
              <h2>{active.title}</h2>
              <p>{active.subtitle}</p>
            </div>

            <button className="featureArrow">➜</button>
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
  );
}

function DeviceLab() {
  const zoom = 0.45;

  return (
    <div className="deviceLabPage">
      <style>{css}</style>

      <header className="labHeader">
        <h1>StoneRate Device Fit Lab</h1>
        <p>Preview the screen across multiple phone sizes.</p>
      </header>

      <div className="deviceGrid">
        {DEVICES.map((device) => (
          <div
            className="deviceShell"
            key={device.name}
            style={{
              width: device.w * zoom,
              height: device.h * zoom + 44,
            }}
          >
            <div className="deviceName">
              {device.name} — {device.w}×{device.h}
            </div>

            <div
              className="deviceViewport"
              style={{
                width: device.w,
                height: device.h,
                transform: `scale(${zoom})`,
              }}
            >
              <BuyerHomeScreen labMode />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  if (SHOW_DEVICE_LAB) {
    return <DeviceLab />;
  }

  return (
    <div className="page">
      <style>{css}</style>

      {/* Uncomment only when you want to check viewport size */}
      {/* <ViewportSize /> */}

      <BuyerHomeScreen />
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
  width: 100vw;
  height: 100dvh;
  min-height: 100dvh;
  background: #050505;
  display: block;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

.phone {
  width: 100vw;
  height: 100dvh;
  min-width: 0;
  min-height: 0;
  max-width: none;
  max-height: none;
  aspect-ratio: auto;
  background: #050505;
  border-radius: 0;
  overflow: hidden;
  display: grid;
  grid-template-rows: 56% 31% 13%;
  box-shadow: none;
  container-type: size;
}

@media (min-width: 700px) {
  .page {
    background: #f4f1ea;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
  }

  .phone {
    width: 390px;
    height: 844px;
    border-radius: 32px;
    box-shadow: 0 30px 80px rgba(0,0,0,.28);
  }
}

.labPhone {
  width: 100%;
  height: 100%;
  max-height: none;
  border-radius: 0;
  box-shadow: none;
}

.hero {
  position: relative;
  height: 100%;
  overflow: hidden;
  color: white;
  padding:
    calc(env(safe-area-inset-top, 0px) + 3.6cqw)
    5cqw
    2cqw;
  background: #111;
}

.heroBg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transform: translateY(-2%) scale(1.12);
  transform-origin: center center;
  z-index: 0;
}

.heroShade {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,.14),
    rgba(0,0,0,.02) 42%,
    rgba(0,0,0,.13) 74%
  );
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
  top: 53%;
  width: 48cqw;
  height: 24cqh;
  transform: translateX(-50%);
  border-radius: 50%;
  filter: blur(7cqw);
  opacity: .24;
  z-index: 2;
  background: #f59e0b;
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
  width: 8.8cqw;
  height: 8.8cqw;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, .50);
  color: white;
  font-size: 5.2cqw;
  font-weight: 950;
}

.intro {
  margin-top: 3cqw;
  margin-left: 2cqw;
  text-shadow: 0 1cqw 3cqw rgba(0, 0, 0, .75);
}

.intro h1 {
  margin: 0;
  color: #fde68a;
  font-size: 7.2cqw;
  line-height: 1;
  font-weight: 950;
}

.intro p {
  margin: 3cqw 0 0;
  color: white;
  font-size: 4.55cqw;
  line-height: 1.12;
  font-weight: 950;
}

.featureWrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 40%;
  bottom: 8%;
  height: auto;
  perspective: 280cqw;
  z-index: 5;
}

.singleFeatureCard {
  position: absolute;
  left: 50%;
  top: -13%;
  width: clamp(1px, 70cqw, 250px);
  aspect-ratio: 120 / 120;
  color: white;
  text-align: center;
  transform: translateX(-50%);
  animation: floatCard 3.8s ease-in-out infinite;
  overflow: visible;
}

.glassSpinLayer {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform-origin: center center;
  transition: transform 1500ms cubic-bezier(.32,.72,.22,1);
  will-change: transform;
}

.glassCardImage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
  filter: drop-shadow(0 3.5cqw 5cqw rgba(0,0,0,.24));
}

.cardContent {
  position: absolute;
  left: 50%;
  top: 17%;
  width: 58%;
  max-height: 68%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1;
  overflow: hidden;
  transition: opacity 150ms ease, transform 150ms ease;
}

.cardContent.hidden {
  opacity: 0;
  transform: translateX(-50%) scale(.96);
}

.featureIcon {
  width: 10cqw;
  height: 10cqw;
  border-radius: 5.8cqw;
  color: #111827;
  background: #f59e0b;
  box-shadow: 0 0 7cqw #f59e0b;
  display: grid;
  place-items: center;
  font-size: 6.8cqw;
  font-weight: 950;
}

.stars {
  margin-top: 4cqw;
  font-size: 4cqw;
  letter-spacing: .7cqw;
  color: #f59e0b;
}

.cardContent h2 {
  margin: 1cqw 0 0;
  font-size: 4.5cqw;
  line-height: 1.08;
  font-weight: 950;
  text-shadow: 0 1.5cqw 4cqw rgba(0,0,0,.55);
}

.cardContent p {
  margin: 3cqw 0 0;
  color: #fff7ed;
  font-size: 3.4cqw;
  line-height: 1.16;
  font-weight: 750;
  text-align: center;
  text-shadow: 0 1.2cqw 3.2cqw rgba(0,0,0,.65);
}

.featureArrow {
  position: absolute;
  left: 50%;
  bottom: -5.1cqw;
  width: 12cqw;
  height: 12cqw;
  transform: translateX(-50%);
  border: 0;
  border-radius: 999px;
  color: #ffffff;
  background: #f59e0b;
  font-size: 5.8cqw;
  font-weight: 950;
  z-index: 20;
  display: grid;
  place-items: center;
  line-height: 1;
  padding: 0;
  margin: 0;
  appearance: none;
  -webkit-appearance: none;
  box-shadow: 0 1.5cqw 4cqw rgba(245,158,11,.45);
}

.ring {
  position: absolute;
  left: 50%;
  bottom: 3%;
  width: 46cqw;
  height: 8.6cqh;
  border-radius: 50%;
  border: .45cqw solid #f59e0b;
  box-shadow: 0 0 4.8cqw #f59e0b;
  transform: translateX(-50%) rotateX(68deg);
}

.platform {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 39cqw;
  height: 15%;
  border-radius: 50%;
  background: rgba(0,0,0,.36);
  filter: blur(.8cqw);
  transform: translateX(-50%);
}

.dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 2.5%;
  display: flex;
  justify-content: center;
  gap: 2cqw;
  z-index: 6;
}

.dot {
  width: 2cqw;
  height: 2cqw;
  border-radius: 999px;
  border: 0;
  background: rgba(255,255,255,.76);
}

.dot.active {
  width: 3cqw;
  background: #f59e0b;
}

.actions {
  height: 100%;
  padding: 4% 5% 0;
  background: #050505;
  overflow: hidden;
}

.place {
  width: 100%;
  height: 23%;
  min-height: 0;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6% 0 11%;
  font-size: 4.7cqw;
  font-weight: 950;
  box-shadow: 0 4.5cqw 8.5cqw rgba(245,158,11,.28);
}

.place.hover {
  transform: translateY(-.8cqw) scale(1.012);
}

.quickGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(8px, 3cqw, 14px);
  margin-top: 4%;
  height: 58%;
  min-height: 0;
}

.quick {
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: clamp(7px, 3.2cqw, 12px);
  border-radius: clamp(14px, 4.7cqw, 20px);
  border: 1px solid rgba(255,255,255,.12);
  background:
    radial-gradient(circle at top left, rgba(255,255,255,.13), transparent 42%),
    linear-gradient(145deg, #1b1b1b 0%, #0b0b0b 100%);
  color: #ffffff;
  text-align: left;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}

.quick.hover {
  transform: translateY(-.8cqw);
  background:
    radial-gradient(circle at top left, rgba(245,158,11,.18), transparent 42%),
    linear-gradient(145deg, #1c1710 0%, #0b0b0b 100%);
}

.quick h3 {
  margin: 0;
  color: #f59e0b;
  font-size: clamp(10px, 3.5cqw, 14px);
  line-height: 1.05;
  font-weight: 950;
  white-space: normal;
  overflow: hidden;
}

.quick p,
.quick small {
  display: block;
  margin-top: clamp(2px, 1.2cqw, 5px);
  color: #e7e5e4;
  font-size: clamp(8px, 2.45cqw, 11px);
  line-height: 1.08;
  font-weight: 750;
  overflow-wrap: break-word;
}

.quick em {
  display: block;
  margin-top: auto;
  padding-top: clamp(2px, 1.2cqw, 5px);
  color: #f59e0b;
  font-size: clamp(8px, 2.8cqw, 12px);
  line-height: 1;
  font-weight: 950;
  font-style: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bottomNav {
  height: calc(100% - env(safe-area-inset-bottom, 0px));
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2%;
  margin:
    0
    6%
    calc(env(safe-area-inset-bottom, 0px) + 3%);
  padding: 2% 3%;
  background: rgba(16,16,16,.92);
  border-radius: 5cqw;
  border: 1px solid rgba(255,255,255,.08);
}

.bottomNav button {
  min-height: 0;
  border: 0;
  border-radius: 4cqw;
  background: transparent;
  color: #a8a29e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .4cqw;
  font-weight: 900;
}

.bottomNav button.active {
  color: #f59e0b;
}

.bottomNav span {
  font-size: 4.1cqw;
}

.bottomNav b {
  font-size: 2.8cqw;
}

.deviceLabPage {
  width: 100%;
  min-height: 100vh;
  background: #111827;
  color: white;
  font-family: Arial, sans-serif;
  padding: 20px;
  overflow: auto;
}

.labHeader {
  margin-bottom: 18px;
}

.labHeader h1 {
  margin: 0;
  font-size: 26px;
}

.labHeader p {
  margin: 8px 0 0;
  color: #d1d5db;
}

.deviceGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-start;
}

.deviceShell {
  position: relative;
  background: #020617;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 18px;
  overflow: hidden;
}

.deviceName {
  height: 42px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 11px;
  font-weight: 800;
  color: #fde68a;
  background: rgba(0,0,0,.7);
}

.deviceViewport {
  transform-origin: top left;
  background: #050505;
}

@keyframes floatCard {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-1.3cqw);
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




















































import React, { useEffect, useMemo, useState } from "react";
const HEADER_BG_IMAGE =
  "https://cdn.jsdelivr.net/gh/Shyam7291/company-document-monitor@main/Designer (1).png";
export default function App() {
  const viewport = useViewport();
  const styles = useMemo(
    () => createStyles(viewport),
    [viewport.width, viewport.height]
  );
  
  const vehicles = [
    { id: "truck12", name: "12 Tyre Truck", capacity: 10, tag: "Small site" },
    { id: "truck14", name: "14 Tyre Truck", capacity: 16, tag: "Popular" },
    { id: "truck18", name: "18 Tyre Truck", capacity: 22, tag: "Bulk order" },
    { id: "hyva", name: "Hyva", capacity: 18, tag: "Fast delivery" },
  ];

  const materials = [
    "20mm Crushed Stone",
    "40mm Crushed Stone",
    "GSB",
    "M-Sand",
    "Stone Dust",
  ];

  const emptyVehicleQty = {
    truck12: 0,
    truck14: 0,
    truck18: 0,
    hyva: 0,
  };

  const [selectedMaterial, setSelectedMaterial] = useState(
    "20mm Crushed Stone"
  );

  const [ordersByMaterial, setOrdersByMaterial] = useState({
    "20mm Crushed Stone": { ...emptyVehicleQty },
    "40mm Crushed Stone": { ...emptyVehicleQty },
    GSB: { ...emptyVehicleQty },
    "M-Sand": { ...emptyVehicleQty },
    "Stone Dust": { ...emptyVehicleQty },
  });

  const [arrivalDate, setArrivalDate] = useState("2026-07-05");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState(
    "Please arrange best rate from nearby sellers."
  );

  const currentMaterialQty = ordersByMaterial[selectedMaterial];

  const addVehicle = (vehicleId) => {
    setOrdersByMaterial((previousOrders) => ({
      ...previousOrders,
      [selectedMaterial]: {
        ...previousOrders[selectedMaterial],
        [vehicleId]: previousOrders[selectedMaterial][vehicleId] + 1,
      },
    }));
  };

  const removeVehicle = (vehicleId) => {
    setOrdersByMaterial((previousOrders) => ({
      ...previousOrders,
      [selectedMaterial]: {
        ...previousOrders[selectedMaterial],
        [vehicleId]: Math.max(0, previousOrders[selectedMaterial][vehicleId] - 1),
      },
    }));
  };

  const getMaterialTons = (materialName) => {
    const materialQty = ordersByMaterial[materialName];

    return vehicles.reduce(
      (sum, vehicle) => sum + materialQty[vehicle.id] * vehicle.capacity,
      0
    );
  };

  const materialSummary = useMemo(() => {
    return materials
      .map((materialName) => ({
        materialName,
        tons: getMaterialTons(materialName),
        vehicles: vehicles.reduce(
          (sum, vehicle) =>
            sum + ordersByMaterial[materialName][vehicle.id],
          0
        ),
      }))
      .filter((item) => item.tons > 0);
  }, [ordersByMaterial]);

  const totalTons = useMemo(() => {
    return materialSummary.reduce((sum, item) => sum + item.tons, 0);
  }, [materialSummary]);

  const totalVehicles = useMemo(() => {
    return materialSummary.reduce((sum, item) => sum + item.vehicles, 0);
  }, [materialSummary]);

  return (
    <div style={styles.page}>
      <div style={styles.phone}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>BEST RATE ORDER</p>

          <div style={styles.headerRow}>
            <div style={{ minWidth: 0 }}>
              <h1 style={styles.title}>
                Crushed Stone
                <br />
                Booking
              </h1>
            </div>

            
          </div>

          <div style={styles.trustGrid}>
            <div style={styles.trustBox}>
              <b style={styles.trustValue}>24h</b>
              <span style={styles.trustText}>Rate check</span>
            </div>

            <div style={styles.trustBox}>
              <b style={styles.trustValue}>Verified</b>
              <span style={styles.trustText}>Sellers</span>
            </div>

            <div style={styles.trustBox}>
              <b style={styles.trustValue}>Fast</b>
              <span style={styles.trustText}>Dispatch</span>
            </div>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.card}>
            <div style={styles.labelRow}>
              <label style={styles.label}>📦 Material</label>
              <span style={styles.badge}>Saved separately</span>
            </div>

            <select
              style={styles.input}
              value={selectedMaterial}
              onChange={(event) => setSelectedMaterial(event.target.value)}
            >
              {materials.map((materialName) => (
                <option key={materialName}>{materialName}</option>
              ))}
            </select>

            <p style={styles.helperText}>
              Select one material, add vehicles, then switch material. Previous
              material quantity will stay saved.
            </p>
          </div>

          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🚚 Select Vehicle</h2>
            <span style={styles.smallText}>For {selectedMaterial}</span>
          </div>

          <div style={styles.vehicleGrid}>
            {vehicles.map((vehicle) => {
              const qty = currentMaterialQty[vehicle.id];
              const active = qty > 0;

              return (
                <div
                  key={vehicle.id}
                  style={{
                    ...styles.vehicleCard,
                    ...(active ? styles.vehicleCardActive : {}),
                  }}
                >
                  {active && <div style={styles.check}>✓</div>}

                  <div
                    onClick={() => addVehicle(vehicle.id)}
                    style={styles.vehicleInfo}
                  >
                    <b style={styles.vehicleName}>{vehicle.name}</b>
                    <span style={styles.vehicleCapacity}>
                      {vehicle.capacity} ton / vehicle
                    </span>
                    <span style={styles.tag}>{vehicle.tag}</span>
                  </div>

                  {active ? (
                    <div style={styles.qtyBox}>
                      <button
                        style={styles.qtyBtn}
                        onClick={() => removeVehicle(vehicle.id)}
                      >
                        −
                      </button>

                      <div style={styles.qtyCenter}>
                        <b style={styles.qtyNumber}>{qty}</b>
                        <span style={styles.qtyText}>vehicles</span>
                      </div>

                      <button
                        style={{ ...styles.qtyBtn, ...styles.plusBtn }}
                        onClick={() => addVehicle(vehicle.id)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      style={styles.addBtn}
                      onClick={() => addVehicle(vehicle.id)}
                    >
                      + Add Vehicle
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div style={styles.quantityCard}>
            <div>
              <p style={styles.quantityLabel}>Total Estimated Quantity</p>

              <div style={styles.tonsRow}>
                <b style={styles.tons}>{totalTons}</b>
                <span style={styles.tonsText}>tons</span>
              </div>
            </div>

            <div style={styles.rupee}>₹</div>

            <div style={styles.totalVehicleText}>
              {totalVehicles > 0
                ? `${totalVehicles} total vehicle${
                    totalVehicles === 1 ? "" : "s"
                  } selected`
                : "Select material and vehicles to calculate total tons"}
            </div>

            {materialSummary.length > 0 && (
              <div style={styles.materialSummaryBox}>
                {materialSummary.map((item) => (
                  <div
                    key={item.materialName}
                    style={styles.materialSummaryRow}
                  >
                    <span style={styles.summaryMaterialName}>
                      {item.materialName.replace(" Crushed Stone", "")}
                    </span>
                    <b>{item.tons} ton</b>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.field}>
              <label style={styles.label}>📅 Date of Arrival</label>
              <input
                type="date"
                style={styles.input}
                value={arrivalDate}
                onChange={(event) => setArrivalDate(event.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Buyer Contact Number</label>
              <input
                style={styles.input}
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Enter mobile number"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Order Notes</label>
              <textarea
                style={styles.textarea}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </div>

          <div style={styles.infoBox}>
            <div style={styles.infoIcon}>✓</div>

            <div style={{ minWidth: 0 }}>
              <b style={styles.infoTitle}>How this works</b>
              <p style={styles.infoText}>
                Buyer can add different vehicles for each material. Full vehicle
                breakdown will appear on the confirmation page.
              </p>
            </div>
          </div>

          <button
            style={{
              ...styles.continueBtn,
              opacity: totalVehicles === 0 ? 0.5 : 1,
            }}
            disabled={totalVehicles === 0}
          >
            Continue to Confirmation →
          </button>

          <p style={styles.footer}>
            Final order request is submitted after confirmation.
          </p>
        </div>

        <nav style={styles.bottomTabs}>
          <button style={{ ...styles.tabBtn, ...styles.tabBtnActive }}>
            <span style={styles.tabIcon}>🏠</span>
            <b style={styles.tabText}>Home</b>
          </button>

          <button style={styles.tabBtn}>
            <span style={styles.tabIcon}>📦</span>
            <b style={styles.tabText}>My Orders</b>
          </button>

          <button style={styles.tabBtn}>
            <span style={styles.tabIcon}>👤</span>
            <b style={styles.tabText}>Profile</b>
          </button>
        </nav>
      </div>
    </div>
  );
}

function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
  });

  useEffect(() => {
    const update = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  return viewport;
}

function createStyles(viewport) {
  const vw = viewport.width || 390;
  const vh = viewport.height || 844;

  const isDesktop = vw >= 700;
  const phoneW = isDesktop ? 390 : vw;
  const phoneH = isDesktop ? 844 : vh;

  const scale = Math.max(
    0.72,
    Math.min(1, Math.min(phoneW / 390, phoneH / 844))
  );

  const narrow = phoneW < 360;
  const veryNarrow = phoneW < 220;
  const short = phoneH < 700;

  const px = (value) => Math.round(value * scale);

  return {
    page: {
      width: "100vw",
      height: "100dvh",
      minHeight: "100dvh",
      background: isDesktop ? "#f4f1ea" : "#ffffff",
      display: "flex",
      justifyContent: "center",
      alignItems: isDesktop ? "center" : "stretch",
      padding: isDesktop ? 16 : 0,
      fontFamily: "Arial, sans-serif",
      overflow: "hidden",
      boxSizing: "border-box",
    },

    phone: {
      width: isDesktop ? 390 : "100vw",
      height: isDesktop ? 844 : "100dvh",
      maxWidth: isDesktop ? 430 : "none",
      background: "#ffffff",
      borderRadius: isDesktop ? 32 : 0,
      overflow: "hidden",
      boxShadow: isDesktop ? "0 25px 60px rgba(0,0,0,0.18)" : "none",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
    },

    header: {
      position: "relative",
      color: "white",
    
      padding:
        "clamp(13px, 3.8vw, 22px) clamp(12px, 4vw, 20px) clamp(13px, 4.2vw, 24px)",
    
        backgroundImage: HEADER_BG_IMAGE
        ? `linear-gradient(
            135deg,
            rgba(8, 7, 6, 0.38),
            rgba(28, 25, 23, 0.30) 52%,
            rgba(120, 53, 15, 0.22)
          ),
          url("${HEADER_BG_IMAGE}")`
        : `radial-gradient(
            circle at 88% 8%,
            rgba(245, 158, 11, 0.38),
            transparent 32%
          ),
          linear-gradient(
            135deg,
            #080706,
            #1c1917 52%,
            #78350f
          )`,
    
      backgroundSize: "cover",
      backgroundPosition: "center 45%",
      backgroundRepeat: "no-repeat",
    
      overflow: "hidden",
      boxSizing: "border-box",
    },

    eyebrow: {
      fontSize: px(11),
      letterSpacing: narrow ? 2 : 3,
      color: "#fde68a",
      fontWeight: 700,
      margin: 0,
    },

    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: px(10),
    },

    title: {
      fontSize: px(short ? 30 : 34),
      lineHeight: 1.1,
      margin: `${px(10)}px 0 0`,
      fontWeight: 900,
      letterSpacing: -0.6,
    },

    truckIcon: {
      fontSize: px(32),
      background: "rgba(255,255,255,0.15)",
      padding: px(14),
      borderRadius: px(24),
      flexShrink: 0,
    },

    trustGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: px(8),
      marginTop: px(20),
    },

    trustBox: {
      background: "rgba(255,255,255,0.13)",
      borderRadius: px(18),
      padding: px(10),
      fontSize: px(12),
      display: "flex",
      flexDirection: "column",
      gap: px(4),
      minWidth: 0,
      overflow: "hidden",
    },

    trustValue: {
      fontSize: px(narrow ? 10 : 12),
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    trustText: {
      fontSize: px(narrow ? 9 : 11),
      color: "#e7e5e4",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    content: {
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      padding: px(narrow ? 14 : 20),
      paddingBottom: px(18),
      borderRadius: `${px(28)}px ${px(28)}px 0 0`,
      marginTop: px(-10),
      background: "white",
      boxSizing: "border-box",
    },

    card: {
      background: "#fafaf9",
      borderRadius: px(24),
      padding: px(narrow ? 13 : 16),
      marginBottom: px(18),
      boxSizing: "border-box",
    },

    labelRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: px(8),
      marginBottom: px(10),
    },

    label: {
      fontSize: px(14),
      fontWeight: 800,
      display: "block",
      marginBottom: px(8),
    },

    badge: {
      background: "#fef3c7",
      color: "#92400e",
      padding: `${px(5)}px ${px(10)}px`,
      borderRadius: 999,
      fontSize: px(10),
      fontWeight: 800,
      whiteSpace: "nowrap",
      flexShrink: 0,
    },

    helperText: {
      margin: `${px(10)}px 0 0`,
      color: "#78716c",
      fontSize: px(12),
      lineHeight: 1.4,
    },

    input: {
      width: "100%",
      height: px(46),
      padding: `0 ${px(13)}px`,
      borderRadius: px(16),
      border: "1px solid #e7e5e4",
      fontSize: px(14),
      boxSizing: "border-box",
      background: "white",
      color: "#111827",
      outline: "none",
    },

    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: px(8),
      marginBottom: px(12),
    },

    sectionTitle: {
      fontSize: px(16),
      fontWeight: 900,
      margin: 0,
      whiteSpace: "nowrap",
    },

    smallText: {
      fontSize: px(11),
      color: "#64748b",
      textAlign: "right",
      lineHeight: 1.25,
      maxWidth: "50%",
    },

    vehicleGrid: {
      display: "grid",
      gridTemplateColumns: veryNarrow
        ? "1fr"
        : "repeat(2, minmax(0, 1fr))",
      gap: px(narrow ? 6 : 8),
      marginBottom: px(16),
    },

    vehicleCard: {
      position: "relative",
      background: "white",
      border: "1px solid #e7e5e4",
      borderRadius: px(18),
      padding: px(narrow ? 8 : 10),
      boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
      minWidth: 0,
      overflow: "hidden",
      boxSizing: "border-box",
    },

    vehicleCardActive: {
      borderColor: "#b45309",
      background: "linear-gradient(135deg, #fffbeb, #f5f5f4)",
    },

    check: {
      position: "absolute",
      right: px(10),
      top: px(10),
      background: "#b45309",
      color: "white",
      width: px(22),
      height: px(22),
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      fontSize: px(13),
      fontWeight: 900,
      zIndex: 2,
    },

    vehicleInfo: {
      cursor: "pointer",
      minWidth: 0,
    },

    vehicleName: {
      display: "block",
      fontSize: px(narrow ? 10 : 12),
      paddingRight: px(22),
      lineHeight: 1.15,
      minHeight: px(narrow ? 24 : 28),
    },

    vehicleCapacity: {
      display: "block",
      marginTop: px(3),
      color: "#64748b",
      fontSize: px(narrow ? 9 : 10),
      lineHeight: 1.2,
    },

    tag: {
      display: "inline-block",
      marginTop: px(narrow ? 8 : 10),
      background: "#fef3c7",
      color: "#92400e",
      padding: `${px(4)}px ${px(7)}px`,
      borderRadius: 999,
      fontSize: px(narrow ? 8 : 9),
      fontWeight: 800,
      maxWidth: "100%",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    addBtn: {
      width: "100%",
      marginTop: px(10),
      minHeight: px(narrow ? 28 : 30),
      border: 0,
      borderRadius: px(12),
      background: "#f59e0b",
      color: "white",
      fontSize: px(narrow ? 10 : 11),
      fontWeight: 800,
      cursor: "pointer",
      padding: `0 ${px(4)}px`,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },

    qtyBox: {
      marginTop: px(12),
      padding: px(7),
      borderRadius: px(16),
      background: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: px(5),
    },

    qtyBtn: {
      width: px(30),
      height: px(30),
      border: 0,
      borderRadius: px(12),
      background: "#f5f5f4",
      fontWeight: 900,
      fontSize: px(18),
      cursor: "pointer",
      flexShrink: 0,
    },

    plusBtn: {
      background: "#d97706",
      color: "white",
    },

    qtyCenter: {
      textAlign: "center",
      minWidth: 0,
    },

    qtyNumber: {
      display: "block",
      fontSize: px(18),
      lineHeight: 1,
    },

    qtyText: {
      fontSize: px(9),
      color: "#64748b",
    },

    quantityCard: {
      position: "relative",
      background: "linear-gradient(135deg, #020617, #292524)",
      color: "white",
      borderRadius: px(26),
      padding: px(narrow ? 16 : 20),
      marginBottom: px(18),
      boxShadow: "0 16px 35px rgba(0,0,0,0.18)",
      overflow: "hidden",
    },

    quantityLabel: {
      color: "#d6d3d1",
      fontSize: px(13),
      margin: 0,
      paddingRight: px(58),
    },

    tonsRow: {
      display: "flex",
      alignItems: "flex-end",
      gap: px(8),
      marginTop: px(4),
    },

    tons: {
      fontSize: px(narrow ? 44 : 52),
      lineHeight: 1,
    },

    tonsText: {
      marginBottom: px(6),
      color: "#d6d3d1",
      fontWeight: 700,
      fontSize: px(13),
    },

    rupee: {
      position: "absolute",
      right: px(18),
      top: px(18),
      width: px(44),
      height: px(44),
      borderRadius: px(16),
      background: "rgba(255,255,255,0.12)",
      color: "#fbbf24",
      display: "grid",
      placeItems: "center",
      fontSize: px(24),
      fontWeight: 900,
    },

    totalVehicleText: {
      marginTop: px(14),
      background: "rgba(255,255,255,0.1)",
      padding: px(12),
      borderRadius: px(16),
      fontSize: px(12),
      color: "#e7e5e4",
      lineHeight: 1.35,
    },

    materialSummaryBox: {
      marginTop: px(12),
      padding: px(12),
      borderRadius: px(16),
      background: "rgba(255,255,255,0.08)",
    },

    materialSummaryRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: px(10),
      fontSize: px(13),
      padding: `${px(6)}px 0`,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    },

    summaryMaterialName: {
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    field: {
      marginBottom: px(16),
    },

    textarea: {
      width: "100%",
      minHeight: px(90),
      padding: px(13),
      borderRadius: px(16),
      border: "1px solid #e7e5e4",
      fontSize: px(14),
      boxSizing: "border-box",
      resize: "vertical",
      outline: "none",
      fontFamily: "Arial, sans-serif",
    },

    infoBox: {
      display: "flex",
      gap: px(12),
      background: "#fffbeb",
      borderRadius: px(24),
      padding: px(16),
      marginBottom: px(18),
      boxSizing: "border-box",
    },

    infoIcon: {
      width: px(36),
      height: px(36),
      borderRadius: px(14),
      background: "#d97706",
      color: "white",
      display: "grid",
      placeItems: "center",
      fontWeight: 900,
      flexShrink: 0,
    },

    infoTitle: {
      fontSize: px(14),
    },

    infoText: {
      fontSize: px(12),
      color: "#57534e",
      lineHeight: 1.5,
      margin: `${px(5)}px 0 0`,
    },

    continueBtn: {
      width: "100%",
      minHeight: px(56),
      border: 0,
      borderRadius: px(24),
      background: "linear-gradient(135deg, #020617, #92400e)",
      color: "white",
      fontSize: px(16),
      fontWeight: 900,
      cursor: "pointer",
      padding: `0 ${px(12)}px`,
    },

    footer: {
      textAlign: "center",
      color: "#64748b",
      fontSize: px(12),
      marginTop: px(14),
      marginBottom: px(8),
    },

    bottomTabs: {
      flexShrink: 0,
      height: px(72),
      margin: `0 ${px(14)}px ${px(10)}px`,
      padding: `${px(8)}px ${px(10)}px`,
      borderRadius: px(24),
      background: "rgba(16,16,16,0.96)",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: px(6),
      boxShadow: "0 -10px 28px rgba(0,0,0,0.18)",
    },

    tabBtn: {
      border: 0,
      borderRadius: px(18),
      background: "transparent",
      color: "#a8a29e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: px(3),
      fontWeight: 900,
      cursor: "pointer",
      minWidth: 0,
    },

    tabBtnActive: {
      color: "#f59e0b",
    },

    tabIcon: {
      fontSize: px(18),
      lineHeight: 1,
    },

    tabText: {
      fontSize: px(10),
      lineHeight: 1,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  };
}





















































oder confirmation
import React, { useEffect, useMemo, useState } from "react";

const BASE_W = 206;
const BASE_H = 445;
const HEADER_BG_IMAGE = ""; // Add your quarry/mining image URL here.

function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
  });

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return viewport;
}

export default function App() {
  const viewport = useViewport();
  const styles = useMemo(
    () => createStyles(viewport),
    [viewport.width, viewport.height]
  );

  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const orderItems = [
    { product: "20mm Crushed Stone", vehicles: 2, quantity: 20 },
    { product: "40mm Crushed Stone", vehicles: 1, quantity: 10 },
  ];

  const totalVehicles = orderItems.reduce(
    (sum, item) => sum + item.vehicles,
    0
  );
  const totalTons = orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleSubmit = () => {
    if (!confirmed) return;
    setSubmitted(true);
  };

  return (
    <div style={styles.page}>
      <style>{globalCss}</style>

      <main style={styles.phone}>
        <div style={styles.scrollArea}>
          <section style={styles.header}>
            <div style={styles.headerShade} />
            <div style={styles.headerGrid} />

            <div style={styles.topBar}>
              <button type="button" style={styles.backButton} aria-label="Go back">
                ‹
              </button>
              <div style={styles.stepBadge}>FINAL REVIEW</div>
              <button type="button" style={styles.editHeaderButton}>
                Edit
              </button>
            </div>

            <div style={styles.heroRow}>
              <div style={{ minWidth: 0 }}>
                <p style={styles.eyebrow}>ORDER CONFIRMATION</p>
                <h1 style={styles.title}>Review Your<br />Stone Request</h1>
                <p style={styles.heroSubtext}>
                  Check the product, vehicle quantity and delivery date before
                  raising the rate enquiry.
                </p>
              </div>
              <div style={styles.heroIcon}>✓</div>
            </div>

            <div style={styles.summaryStrip}>
              <div style={styles.summaryItem}><b>2</b><span>Products</span></div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryItem}><b>{totalVehicles}</b><span>Vehicles</span></div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryItem}><b>{totalTons}t</b><span>Total qty.</span></div>
            </div>
          </section>

          <section style={styles.content}>
            <div style={styles.noticeCard}>
              <div style={styles.noticeIcon}>₹</div>
              <div style={{ minWidth: 0 }}>
                <b style={styles.noticeTitle}>Rate enquiry only</b>
                <p style={styles.noticeText}>
                  No payment is required now. StoneRate will check the best
                  available rate and contact you for approval.
                </p>
              </div>
            </div>

            <div style={styles.sectionTitleRow}>
              <div>
                <p style={styles.sectionEyebrow}>ORDER INFORMATION</p>
                <h2 style={styles.sectionTitle}>Order summary</h2>
              </div>
              <button type="button" style={styles.editOrderButton}>Edit order</button>
            </div>

            <article style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <span>Product</span>
                <span>Vehicle</span>
                <span>Qty.</span>
              </div>

              {orderItems.map((item, index) => (
                <div key={item.product}>
                  {index > 0 && <div style={styles.tableDivider} />}
                  <div style={styles.tableRow}>
                    <div style={styles.productCell}>
                      <span style={styles.productIcon}>🪨</span>
                      <b>{item.product}</b>
                    </div>
                    <div style={styles.vehicleCell}>
                      <span style={styles.smallTruck}>🚚</span>
                      <b>{item.vehicles}</b>
                      <span>{item.vehicles === 1 ? "vehicle" : "vehicles"}</span>
                    </div>
                    <div style={styles.qtyCell}>
                      <b>{item.quantity}</b>
                      <span>tons</span>
                    </div>
                  </div>
                </div>
              ))}

              <div style={styles.tableTotalRow}>
                <b>Total</b>
                <span>{totalVehicles} vehicles</span>
                <strong>{totalTons} tons</strong>
              </div>
            </article>

            <article style={styles.deliveryCard}>
              <div style={styles.calendarIcon}>📅</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={styles.detailLabel}>Expected delivery date</p>
                <h3 style={styles.deliveryDate}>05 July 2026</h3>
                <span style={styles.deliveryCaption}>
                  Delivery timing will be reconfirmed after rate approval.
                </span>
              </div>
              <button type="button" style={styles.changeButton}>Change</button>
            </article>

            <article style={styles.processCard}>
              <p style={styles.processTitle}>What happens next?</p>
              <div style={styles.processSteps}>
                <div style={styles.processStep}>
                  <div style={styles.processNumber}>1</div>
                  <div><b>Enquiry submitted</b><span>Your requirement reaches StoneRate.</span></div>
                </div>
                <div style={styles.processLine} />
                <div style={styles.processStep}>
                  <div style={styles.processNumber}>2</div>
                  <div><b>Best rate checked</b><span>Nearby verified sellers are contacted.</span></div>
                </div>
                <div style={styles.processLine} />
                <div style={styles.processStep}>
                  <div style={styles.processNumber}>3</div>
                  <div><b>You confirm the rate</b><span>The request becomes an active order afterward.</span></div>
                </div>
              </div>
            </article>

            <button
              type="button"
              style={styles.agreementCard}
              onClick={() => setConfirmed((value) => !value)}
            >
              <span style={{ ...styles.checkbox, ...(confirmed ? styles.checkboxActive : {}) }}>
                {confirmed ? "✓" : ""}
              </span>
              <span style={styles.agreementText}>
                I confirm that the product, vehicle quantity and expected
                delivery date shown above are correct.
              </span>
            </button>

            {submitted && (
              <div style={styles.successCard}>
                <div style={styles.successIcon}>✓</div>
                <div>
                  <b>Rate enquiry raised successfully</b>
                  <p>The request is waiting for rate confirmation. You will be notified when the best rate is ready.</p>
                </div>
              </div>
            )}

            <div style={styles.bottomSpacer} />
          </section>
        </div>

        <footer style={styles.fixedFooter}>
          <div style={styles.footerHint}>
            <span>🛡️</span>
            <span>No payment is collected at this stage</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!confirmed || submitted}
            style={{
              ...styles.primaryButton,
              opacity: confirmed && !submitted ? 1 : 0.52,
            }}
          >
            <span style={styles.primaryIcon}>✦</span>
            <span>{submitted ? "Enquiry Submitted" : "Place Order & Raise Enquiry"}</span>
            <b style={styles.primaryArrow}>›</b>
          </button>
        </footer>
        {submitted && (
  <div style={styles.popupOverlay}>
    <div style={styles.popupCard}>
      <div style={styles.popupGlow} />

      <div style={styles.greenTick}>✓</div>

      <h2 style={styles.popupTitle}>
        Order Raised for
        <br />
        Rate Enquiry
      </h2>

      <p style={styles.popupText}>
        Your order request has been submitted successfully. StoneRate will
        check the best available rate and notify you once the rate is ready.
      </p>

      <div style={styles.popupStatus}>
        <span style={styles.popupStatusDot} />
        Waiting for rate confirmation
      </div>

      <button
        type="button"
        style={styles.popupButton}
        onClick={() => setSubmitted(false)}
      >
        Done
      </button>
    </div>
  </div>
)}
      </main>
    </div>
  );
}

function createStyles(viewport) {
  const vw = viewport.width || 390;
  const vh = viewport.height || 844;
  const isDesktop = vw >= 700;
  const appW = isDesktop ? 390 : vw;
  const appH = isDesktop ? 844 : vh;
  const rawScale = Math.min(appW / BASE_W, appH / BASE_H);
  const scale = Math.max(0.86, Math.min(2.05, rawScale));
  const ms = (value, factor = 0.55) => Math.round(value + (value * scale - value) * factor);
  const tiny = appW <= 230;
  const short = appH <= 620;

  return {
    page: {
      width: "100vw", height: "100dvh", minHeight: "100dvh",
      display: "flex", justifyContent: "center", alignItems: isDesktop ? "center" : "stretch",
      margin: 0, padding: isDesktop ? 10 : 0, overflow: "hidden",
      background: isDesktop ? "#f4f1ea" : "#0b0907", fontFamily: "Arial, sans-serif",
      boxSizing: "border-box",
    },
    phone: {
      position: "relative", width: isDesktop ? 390 : "100vw", height: isDesktop ? 844 : "100dvh",
      overflow: "hidden", background: "#f6f4ef", borderRadius: isDesktop ? 30 : 0,
      boxShadow: isDesktop ? "0 25px 70px rgba(0,0,0,.25)" : "none", boxSizing: "border-box",
    },
    scrollArea: {
      width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden",
      WebkitOverflowScrolling: "touch", boxSizing: "border-box",
    },
    header: {
      position: "relative", padding: `${ms(short ? 12 : 16)}px ${ms(tiny ? 11 : 15)}px ${ms(19)}px`,
      overflow: "hidden", color: "white", boxSizing: "border-box",
      backgroundImage: HEADER_BG_IMAGE
        ? `linear-gradient(135deg, rgba(5,4,3,.55), rgba(28,25,23,.46) 55%, rgba(120,53,15,.35)), url("${HEADER_BG_IMAGE}")`
        : "radial-gradient(circle at 84% 10%, rgba(245,158,11,.45), transparent 30%), linear-gradient(135deg, #080706, #1c1917 54%, #78350f)",
      backgroundSize: "cover", backgroundPosition: "center 42%", backgroundRepeat: "no-repeat",
    },
    headerShade: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.02), rgba(0,0,0,.3))", pointerEvents: "none" },
    headerGrid: { position: "absolute", inset: 0, opacity: 0.24, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)", backgroundSize: `${ms(30)}px ${ms(30)}px` },
    topBar: { position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: ms(8) },
    backButton: { width: ms(32), height: ms(32), display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.18)", borderRadius: ms(12), background: "rgba(255,255,255,.11)", color: "white", fontSize: ms(23), lineHeight: 1, cursor: "pointer" },
    stepBadge: { padding: `${ms(5)}px ${ms(10)}px`, borderRadius: 999, border: "1px solid rgba(245,158,11,.45)", background: "rgba(245,158,11,.17)", color: "#fde68a", fontSize: ms(7.7), letterSpacing: ms(1.2), fontWeight: 950 },
    editHeaderButton: { minWidth: ms(43), height: ms(30), padding: `0 ${ms(9)}px`, border: "1px solid rgba(255,255,255,.18)", borderRadius: 999, background: "rgba(255,255,255,.11)", color: "white", fontSize: ms(9), fontWeight: 900, cursor: "pointer" },
    heroRow: { position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: ms(12), marginTop: ms(14) },
    eyebrow: { margin: 0, color: "#fde68a", fontSize: ms(7.2), letterSpacing: ms(1.7), fontWeight: 950 },
    title: { margin: `${ms(6)}px 0 0`, fontSize: ms(short ? 23 : 28), lineHeight: 1.02, letterSpacing: -0.7, fontWeight: 950 },
    heroSubtext: { maxWidth: ms(220), margin: `${ms(8)}px 0 0`, color: "#e7e5e4", fontSize: ms(8.7), lineHeight: 1.35, fontWeight: 650 },
    heroIcon: { width: ms(51), height: ms(51), display: "grid", placeItems: "center", borderRadius: ms(20), background: "linear-gradient(135deg, #f59e0b, #ea580c)", boxShadow: "0 15px 30px rgba(234,88,12,.32)", fontSize: ms(25), fontWeight: 950, flexShrink: 0 },
    summaryStrip: { position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", alignItems: "center", marginTop: ms(15), padding: ms(8), border: "1px solid rgba(255,255,255,.13)", borderRadius: ms(16), background: "rgba(255,255,255,.12)", backdropFilter: "blur(10px)" },
    summaryItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: ms(2), minWidth: 0, fontSize: ms(7.7), textAlign: "center" },
    summaryDivider: { width: 1, height: ms(27), background: "rgba(255,255,255,.17)" },
    content: { padding: `${ms(13)}px ${ms(tiny ? 9 : 13)}px 0`, color: "#111827", background: "linear-gradient(180deg, #fff, #f6f4ef 58%, #efede8)", boxSizing: "border-box" },
    noticeCard: { display: "flex", gap: ms(10), padding: ms(12), border: "1px solid #fde68a", borderRadius: ms(19), background: "linear-gradient(135deg, #fffbeb, #fef3c7)", boxShadow: "0 10px 22px rgba(146,64,14,.08)" },
    noticeIcon: { width: ms(36), height: ms(36), display: "grid", placeItems: "center", borderRadius: ms(14), background: "#f59e0b", color: "white", fontSize: ms(18), fontWeight: 950, flexShrink: 0 },
    noticeTitle: { color: "#78350f", fontSize: ms(10.5) },
    noticeText: { margin: `${ms(4)}px 0 0`, color: "#92400e", fontSize: ms(8.2), lineHeight: 1.35, fontWeight: 650 },
    sectionTitleRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: ms(9), marginTop: ms(16), marginBottom: ms(9) },
    sectionEyebrow: { margin: 0, color: "#b45309", fontSize: ms(7.3), letterSpacing: ms(1.15), fontWeight: 950 },
    sectionTitle: { margin: `${ms(3)}px 0 0`, fontSize: ms(15), fontWeight: 950 },
    editOrderButton: { padding: 0, border: 0, background: "transparent", color: "#b45309", fontSize: ms(8.7), fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap" },
    tableCard: { overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: ms(20), background: "rgba(255,255,255,.96)", boxShadow: "0 10px 24px rgba(0,0,0,.055)" },
    tableHeader: { display: "grid", gridTemplateColumns: "1.55fr .85fr .65fr", gap: ms(6), padding: `${ms(9)}px ${ms(11)}px`, background: "#1c1917", color: "#fde68a", fontSize: ms(7.5), letterSpacing: ms(.6), fontWeight: 950 },
    tableRow: { display: "grid", gridTemplateColumns: "1.55fr .85fr .65fr", alignItems: "center", gap: ms(6), padding: `${ms(11)}px`, fontSize: ms(8.6) },
    productCell: { display: "flex", alignItems: "center", gap: ms(7), minWidth: 0, lineHeight: 1.15 },
    productIcon: { width: ms(27), height: ms(27), display: "grid", placeItems: "center", borderRadius: ms(10), background: "#fef3c7", flexShrink: 0 },
    vehicleCell: { display: "grid", gridTemplateColumns: "auto auto", justifyContent: "start", alignItems: "center", columnGap: ms(3), minWidth: 0 },
    smallTruck: { gridRow: "1 / span 2", marginRight: ms(2), fontSize: ms(13) },
    qtyCell: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ms(1), color: "#92400e" },
    tableDivider: { height: 1, margin: `0 ${ms(11)}px`, background: "#eeeae6" },
    tableTotalRow: { display: "grid", gridTemplateColumns: "1.55fr .85fr .65fr", gap: ms(6), padding: `${ms(9)}px ${ms(11)}px`, background: "#fffbeb", color: "#78350f", fontSize: ms(8.2), alignItems: "center" },
    deliveryCard: { display: "flex", alignItems: "center", gap: ms(9), marginTop: ms(12), padding: ms(12), border: "1px solid #e7e5e4", borderRadius: ms(20), background: "white", boxShadow: "0 10px 24px rgba(0,0,0,.05)" },
    calendarIcon: { width: ms(38), height: ms(38), display: "grid", placeItems: "center", borderRadius: ms(14), background: "#fffbeb", fontSize: ms(19), flexShrink: 0 },
    detailLabel: { margin: 0, color: "#78716c", fontSize: ms(7.8) },
    deliveryDate: { margin: `${ms(3)}px 0 0`, fontSize: ms(11.3), fontWeight: 950 },
    deliveryCaption: { display: "block", marginTop: ms(3), color: "#78716c", fontSize: ms(7.2), lineHeight: 1.25 },
    changeButton: { padding: `${ms(5)}px ${ms(8)}px`, border: "1px solid #fde68a", borderRadius: 999, background: "#fffbeb", color: "#b45309", fontSize: ms(7.8), fontWeight: 900, cursor: "pointer" },
    processCard: { marginTop: ms(12), padding: ms(13), border: "1px solid #e7e5e4", borderRadius: ms(20), background: "rgba(255,255,255,.88)" },
    processTitle: { margin: 0, fontSize: ms(11), fontWeight: 950 },
    processSteps: { marginTop: ms(10) },
    processStep: { display: "flex", alignItems: "flex-start", gap: ms(9), fontSize: ms(8.3) },
    processNumber: { width: ms(22), height: ms(22), display: "grid", placeItems: "center", borderRadius: ms(8), background: "#f59e0b", color: "white", fontSize: ms(9), fontWeight: 950, flexShrink: 0 },
    processLine: { width: 2, height: ms(10), marginLeft: ms(10), background: "#fde68a" },
    agreementCard: { width: "100%", display: "flex", alignItems: "flex-start", gap: ms(9), marginTop: ms(12), padding: ms(11), border: "1px solid #fde68a", borderRadius: ms(17), background: "#fffbeb", textAlign: "left", cursor: "pointer" },
    checkbox: { width: ms(21), height: ms(21), display: "grid", placeItems: "center", border: "2px solid #d97706", borderRadius: ms(7), background: "white", color: "white", fontSize: ms(11), fontWeight: 950, flexShrink: 0 },
    checkboxActive: { background: "#d97706" },
    agreementText: { color: "#78350f", fontSize: ms(8.4), lineHeight: 1.35, fontWeight: 750 },
    successCard: { display: "flex", gap: ms(9), marginTop: ms(12), padding: ms(12), border: "1px solid #bbf7d0", borderRadius: ms(18), background: "#f0fdf4", color: "#166534", fontSize: ms(8.5), lineHeight: 1.35 },
    successIcon: { width: ms(30), height: ms(30), display: "grid", placeItems: "center", borderRadius: ms(11), background: "#22c55e", color: "white", fontWeight: 950, flexShrink: 0 },
    bottomSpacer: { height: ms(116) },
    fixedFooter: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 30, padding: `${ms(8)}px ${ms(13)}px calc(env(safe-area-inset-bottom, 0px) + ${ms(10)}px)`, background: "linear-gradient(to top, #f6f4ef 76%, rgba(246,244,239,.98) 90%, rgba(246,244,239,.82))", borderTop: "1px solid rgba(120,113,108,.12)", boxShadow: "0 -12px 30px rgba(0,0,0,.10)" },
    footerHint: { display: "flex", alignItems: "center", justifyContent: "center", gap: ms(5), marginBottom: ms(7), color: "#78716c", fontSize: ms(7.8), fontWeight: 700 },
    primaryButton: { position: "relative", width: "100%", minHeight: ms(52), display: "flex", alignItems: "center", justifyContent: "center", gap: ms(8), border: 0, borderRadius: ms(21), background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", fontSize: ms(11.7), fontWeight: 950, boxShadow: "0 15px 30px rgba(234,88,12,.3)", cursor: "pointer" },
    primaryIcon: { width: ms(26), height: ms(26), display: "grid", placeItems: "center", borderRadius: ms(9), background: "rgba(255,255,255,.18)" },
    popupOverlay: {
      position: "absolute",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: ms(18),
      background: "rgba(2, 6, 23, 0.72)",
      backdropFilter: "blur(8px)",
    },
    
    popupCard: {
      position: "relative",
      width: "100%",
      maxWidth: ms(280),
      overflow: "hidden",
      padding: `${ms(25)}px ${ms(18)}px ${ms(18)}px`,
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: ms(26),
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(240,253,244,0.97))",
      boxShadow:
        "0 30px 80px rgba(0,0,0,0.38), 0 0 45px rgba(34,197,94,0.16)",
      textAlign: "center",
    },
    
    popupGlow: {
      position: "absolute",
      left: "50%",
      top: ms(-65),
      width: ms(170),
      height: ms(130),
      borderRadius: "50%",
      background: "rgba(34,197,94,0.20)",
      filter: `blur(${ms(28)}px)`,
      transform: "translateX(-50%)",
      pointerEvents: "none",
    },
    
    greenTick: {
      position: "relative",
      zIndex: 2,
      width: ms(62),
      height: ms(62),
      margin: "0 auto",
      display: "grid",
      placeItems: "center",
      border: `${ms(5)}px solid #dcfce7`,
      borderRadius: "50%",
      background: "linear-gradient(135deg, #22c55e, #15803d)",
      color: "white",
      fontSize: ms(30),
      fontWeight: 950,
      boxShadow:
        "0 14px 30px rgba(34,197,94,0.30), 0 0 0 7px rgba(34,197,94,0.08)",
    },
    
    popupTitle: {
      position: "relative",
      zIndex: 2,
      margin: `${ms(18)}px 0 0`,
      color: "#111827",
      fontSize: ms(20),
      lineHeight: 1.06,
      fontWeight: 950,
      letterSpacing: -0.5,
    },
    
    popupText: {
      position: "relative",
      zIndex: 2,
      margin: `${ms(11)}px auto 0`,
      maxWidth: ms(235),
      color: "#57534e",
      fontSize: ms(9.2),
      lineHeight: 1.45,
      fontWeight: 650,
    },
    
    popupStatus: {
      position: "relative",
      zIndex: 2,
      width: "fit-content",
      margin: `${ms(14)}px auto 0`,
      padding: `${ms(7)}px ${ms(11)}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(6),
      border: "1px solid #bbf7d0",
      borderRadius: 999,
      background: "#f0fdf4",
      color: "#166534",
      fontSize: ms(8.5),
      fontWeight: 900,
    },
    
    popupStatusDot: {
      width: ms(7),
      height: ms(7),
      borderRadius: "50%",
      background: "#22c55e",
      boxShadow: "0 0 0 4px rgba(34,197,94,0.12)",
    },
    
    popupButton: {
      position: "relative",
      zIndex: 2,
      width: "100%",
      minHeight: ms(44),
      marginTop: ms(17),
      border: 0,
      borderRadius: ms(17),
      background: "linear-gradient(135deg, #22c55e, #15803d)",
      color: "white",
      fontSize: ms(11),
      fontWeight: 950,
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(34,197,94,0.24)",
    },
    primaryArrow: { position: "absolute", right: ms(17), fontSize: ms(24), fontWeight: 400 },
  };
}

const globalCss = `
* { box-sizing: border-box; }
html, body, #root { margin: 0; width: 100%; height: 100%; min-height: 100%; background: #0b0907; overflow: hidden; }
button, input, select, textarea { font: inherit; }
body { -webkit-text-size-adjust: 100%; }
`;







































































































rate status page
import React, { useEffect, useMemo, useRef, useState } from "react";

const BASE_W = 206;
const BASE_H = 445;
const HEADER_BG_IMAGE = ""; // Add quarry/mining image URL here.

function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 390,
    height: typeof window !== "undefined" ? window.innerHeight : 844,
  });

  useEffect(() => {
    const update = () => setViewport({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return viewport;
}

export default function App() {
  const viewport = useViewport();
  const styles = useMemo(
    () => createStyles(viewport),
    [viewport.width, viewport.height]
  );

  // pending | accepted | rejected
  const [decision, setDecision] = useState("pending");
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [showAcceptPopup, setShowAcceptPopup] = useState(false);
  const trackerRef = useRef(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trackerElement = trackerRef.current;
  
      if (!trackerElement) return;
  
      trackerElement.scrollTo({
        left: trackerElement.scrollWidth - trackerElement.clientWidth,
        behavior: "smooth",
      });
    }, 350);
  
    return () => window.clearTimeout(timer);
  }, []);
  const orderItems = [
    { product: "20mm Crushed Stone", vehicles: 2, quantity: 20 },
    { product: "40mm Crushed Stone", vehicles: 1, quantity: 10 },
  ];

  const totalVehicles = orderItems.reduce((sum, item) => sum + item.vehicles, 0);
  const totalTons = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const finalStatus =
    decision === "accepted"
      ? { label: "Accepted", color: "green", symbol: "✓" }
      : decision === "rejected"
      ? { label: "Rejected", color: "red", symbol: "×" }
      : { label: "Waiting for your confirmation", color: "orange", symbol: "" };

  const acceptRate = () => {
    setDecision("accepted");
    setShowAcceptPopup(true);
  };

  const rejectRate = () => {
    setDecision("rejected");
    setShowRejectPopup(false);
  };

  return (
    <div style={styles.page}>
      <style>{globalCss}</style>

      <main style={styles.phone}>
        <div style={styles.scrollArea}>
          <header style={styles.header}>
            <div style={styles.headerShade} />
            <div style={styles.headerGrid} />

            <div style={styles.topBar}>
              <button style={styles.backButton}>‹</button>
              <div style={styles.requestBadge}>RATE REQUEST</div>
              <button style={styles.helpButton}>Help</button>
            </div>

            <div style={styles.heroRow}>
              <div style={{ minWidth: 0 }}>
                <p style={styles.eyebrow}>REQUEST ID: SR-260705-01</p>
                <h1 style={styles.title}>Your Best Rate<br />Is Ready</h1>
                <p style={styles.heroText}>
                  Review the quote and accept or reject the seller rate.
                </p>
              </div>
              <div style={styles.rateIcon}>₹</div>
            </div>
          </header>

          <section style={styles.content}>
            <article style={styles.trackerCard}>
              <p style={styles.trackerHeading}>Rate request status</p>

              <div ref={trackerRef} style={styles.trackerViewport}>

                <div style={styles.tracker}>
                  <StatusStep
                    styles={styles}
                    label="Request submitted"
                    state="done"
                  />
                  <StatusConnector styles={styles} state="done" />

                  <StatusStep
                    styles={styles}
                    label="Checking with sellers"
                    state="done"
                  />
                  <StatusConnector styles={styles} state="done" />

                  <StatusStep
                    styles={styles}
                    label="Best rate provided"
                    state="done"
                  />
                  <StatusConnector
                    styles={styles}
                    state={finalStatus.color}
                  />

                  <StatusStep
                    styles={styles}
                    label={finalStatus.label}
                    state={finalStatus.color}
                    symbol={finalStatus.symbol}
                    wide
                  />
                </div>
              </div>
            </article>

            <div style={styles.rateNotice}>
              <div style={styles.noticeIcon}>✓</div>
              <div style={{ minWidth: 0 }}>
                <b style={styles.noticeTitle}>
                  Best rate provided
                </b>
                <p style={styles.noticeText}>
                  The quote is waiting for your confirmation.
                </p>
              </div>
            </div>

            <div style={styles.sectionHeading}>
              <div>
                <p style={styles.sectionEyebrow}>QUOTE DETAILS</p>
                <h2 style={styles.sectionTitle}>Rate summary</h2>
              </div>
              <div style={styles.validPill}>Valid today</div>
            </div>

            <article style={styles.quoteCard}>
              <div style={styles.quoteGlow} />
              <div style={styles.quoteTopRow}>
                <div>
                  <p style={styles.quoteLabel}>Best available rate</p>
                  <div style={styles.quoteValueRow}>
                    <span style={styles.rupeeSymbol}>₹</span>
                    <b style={styles.quoteValue}>1,280</b>
                    <span style={styles.perTon}>/ ton</span>
                  </div>
                </div>
                <div style={styles.bestRateBadge}>BEST RATE</div>
              </div>

              <div style={styles.quoteMetaGrid}>
                <div style={styles.quoteMetaItem}>
                  <span>Total quantity</span>
                  <b>{totalTons} tons</b>
                </div>
                <div style={styles.quoteMetaItem}>
                  <span>Vehicles</span>
                  <b>{totalVehicles} vehicles</b>
                </div>
                <div style={styles.quoteMetaItem}>
                  <span>Transport</span>
                  <b>Included</b>
                </div>
              </div>

              <div style={styles.estimatedRow}>
                <span>Estimated material value</span>
                <b>₹38,400</b>
              </div>
            </article>

            <article style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <span>Product</span>
                <span>Vehicle</span>
                <span>Qty.</span>
              </div>

              {orderItems.map((item, index) => (
                <React.Fragment key={item.product}>
                  {index > 0 && <div style={styles.tableDivider} />}
                  <div style={styles.tableRow}>
                    <div style={styles.productCell}>
                      <span style={styles.productIcon}>🪨</span>
                      <b>{item.product}</b>
                    </div>
                    <div style={styles.vehicleCell}>
                      <span>🚚</span>
                      <b>{item.vehicles}</b>
                      <small>{item.vehicles === 1 ? "vehicle" : "vehicles"}</small>
                    </div>
                    <div style={styles.qtyCell}>
                      <b>{item.quantity}</b>
                      <span>tons</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </article>

            <article style={styles.deliveryCard}>
              <div style={styles.deliveryIcon}>📅</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={styles.detailLabel}>Expected delivery</span>
                <b style={styles.deliveryDate}>05 July 2026</b>
              </div>
              <div style={styles.deliveryStatus}>Scheduled</div>
            </article>

            {decision === "accepted" && (
              <div style={styles.acceptedCard}>
                <div style={styles.acceptedIcon}>✓</div>
                <div>
                  <b>Rate accepted</b>
                  <p>Continue to the supplier-details page to review and confirm the seller.</p>
                </div>
              </div>
            )}

            {decision === "rejected" && (
              <div style={styles.rejectedCard}>
                <div style={styles.rejectedIcon}>×</div>
                <div>
                  <b>Rate rejected</b>
                  <p>This quote will not be used to place the order.</p>
                </div>
              </div>
            )}

            <div style={styles.bottomSpacer} />
          </section>
        </div>

        <footer style={styles.fixedFooter}>
          {decision === "pending" && (
            <>
              <div style={styles.footerHint}>
                <span>🛡️</span>
                <span>Choose whether to accept or reject this rate</span>
              </div>
              <div style={styles.footerButtons}>
                <button
                  type="button"
                  onClick={() => setShowRejectPopup(true)}
                  style={styles.rejectButton}
                >
                  <span>×</span>
                  Reject Rate
                </button>
                <button
                  type="button"
                  onClick={acceptRate}
                  style={styles.acceptButton}
                >
                  <span>✓</span>
                  Accept Rate
                </button>
              </div>
            </>
          )}

          {decision === "accepted" && (
            <>
              <div style={styles.footerHintGreen}>
                <span>✓</span>
                <span>Rate accepted successfully</span>
              </div>
              <button type="button" style={styles.nextPageButton}>
                Continue to Supplier Details
                <b>›</b>
              </button>
            </>
          )}

          {decision === "rejected" && (
            <>
              <div style={styles.footerHintRed}>
                <span>×</span>
                <span>This rate has been rejected</span>
              </div>
              <button type="button" style={styles.rejectedOnlyButton} disabled>
                Rate Rejected
              </button>
            </>
          )}
        </footer>

        {showRejectPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.rejectPopup}>
              <div style={styles.warningIcon}>!</div>
              <h2 style={styles.popupTitle}>Reject this rate?</h2>
              <p style={styles.popupText}>
                The quote will be marked as rejected and will not be used to place this order.
              </p>
              <div style={styles.popupButtons}>
                <button
                  type="button"
                  onClick={() => setShowRejectPopup(false)}
                  style={styles.cancelButton}
                >
                  Keep Rate
                </button>
                <button
                  type="button"
                  onClick={rejectRate}
                  style={styles.confirmRejectButton}
                >
                  Yes, Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {showAcceptPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.acceptPopup}>
              <div style={styles.popupGlow} />
              <div style={styles.greenTick}>✓</div>
              <h2 style={styles.popupTitle}>Rate Accepted</h2>
              <p style={styles.popupText}>
                The best rate has been accepted. Supplier details can now be reviewed on the next page.
              </p>
              <button
                type="button"
                onClick={() => setShowAcceptPopup(false)}
                style={styles.doneButton}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusStep({ styles, label, state, symbol, wide }) {
  const circleStyle =
    state === "done" || state === "green"
      ? styles.statusCircleGreen
      : state === "red"
      ? styles.statusCircleRed
      : styles.statusCircleOrange;

  const labelStyle =
    state === "done" || state === "green"
      ? styles.statusLabelGreen
      : state === "red"
      ? styles.statusLabelRed
      : styles.statusLabelOrange;

  return (
    <div style={{ ...styles.statusStep, ...(wide ? styles.statusStepWide : {}) }}>
      <div style={{ ...styles.statusCircle, ...circleStyle }}>
        {state === "done" ? "✓" : symbol}
      </div>
      <span style={{ ...styles.statusLabel, ...labelStyle }}>{label}</span>
    </div>
  );
}

function StatusConnector({ styles, state }) {
  const color =
    state === "done" || state === "green"
      ? "#22c55e"
      : state === "red"
      ? "linear-gradient(to right, #22c55e, #ef4444)"
      : "linear-gradient(to right, #22c55e, #f59e0b)";

  return <div style={{ ...styles.statusConnector, background: color }} />;
}

function createStyles(viewport) {
  const vw = viewport.width || 390;
  const vh = viewport.height || 844;
  const isDesktop = vw >= 700;
  const appW = isDesktop ? 390 : vw;
  const appH = isDesktop ? 844 : vh;
  const rawScale = Math.min(appW / BASE_W, appH / BASE_H);
  const scale = Math.max(0.86, Math.min(2.05, rawScale));
  const ms = (value, factor = 0.55) =>
    Math.round(value + (value * scale - value) * factor);
  const tiny = appW <= 230;
  const short = appH <= 620;

  return {
    page: {
      width: "100vw", height: "100dvh", minHeight: "100dvh",
      display: "flex", justifyContent: "center", alignItems: isDesktop ? "center" : "stretch",
      margin: 0, padding: isDesktop ? 10 : 0, overflow: "hidden",
      background: isDesktop ? "#f4f1ea" : "#0b0907", fontFamily: "Arial, sans-serif",
    },
    phone: {
      position: "relative", width: isDesktop ? 390 : "100vw", height: isDesktop ? 844 : "100dvh",
      overflow: "hidden", background: "#f6f4ef", borderRadius: isDesktop ? 30 : 0,
      boxShadow: isDesktop ? "0 25px 70px rgba(0,0,0,.25)" : "none",
    },
    scrollArea: { width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden",
    scrollBehavior: "smooth",
  WebkitOverflowScrolling: "touch" },
    
header: {
  position: "sticky",
  top: 0,
  zIndex: 40,
 padding: `${ms(short ? 8 : 11)}px ${ms(tiny ? 10 : 13)}px ${ms(12)}px`,
      overflow: "hidden", color: "white",
      backgroundImage: HEADER_BG_IMAGE
        ? `linear-gradient(135deg, rgba(5,4,3,.58), rgba(28,25,23,.46) 55%, rgba(120,53,15,.34)), url("${HEADER_BG_IMAGE}")`
        : "radial-gradient(circle at 84% 10%, rgba(245,158,11,.45), transparent 30%), linear-gradient(135deg, #080706, #1c1917 54%, #78350f)",
      backgroundSize: "cover", backgroundPosition: "center 42%", backgroundRepeat: "no-repeat",
    },
    headerShade: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.02), rgba(0,0,0,.32))", pointerEvents: "none" },
    headerGrid: { position: "absolute", inset: 0, opacity: .24, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)", backgroundSize: `${ms(30)}px ${ms(30)}px` },
    topBar: { position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: ms(8) },
    backButton: { width: ms(32), height: ms(32), display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.18)", borderRadius: ms(12), background: "rgba(255,255,255,.11)", color: "white", fontSize: ms(23), cursor: "pointer" },
    requestBadge: { padding: `${ms(5)}px ${ms(10)}px`, borderRadius: 999, border: "1px solid rgba(245,158,11,.45)", background: "rgba(245,158,11,.17)", color: "#fde68a", fontSize: ms(7.7), letterSpacing: ms(1.2), fontWeight: 950 },
    helpButton: { minWidth: ms(43), height: ms(30), padding: `0 ${ms(9)}px`, border: "1px solid rgba(255,255,255,.18)", borderRadius: 999, background: "rgba(255,255,255,.11)", color: "white", fontSize: ms(9), fontWeight: 900, cursor: "pointer" },
    heroRow: { position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: ms(12), marginTop: ms(14) },
    eyebrow: { margin: 0, color: "#fde68a", fontSize: ms(7.1), letterSpacing: ms(1.25), fontWeight: 950 },
    title: { margin: `${ms(6)}px 0 0`, fontSize: ms(short ? 23 : 28), lineHeight: 1.02, letterSpacing: -.7, fontWeight: 950 },
    heroText: { maxWidth: ms(220), margin: `${ms(8)}px 0 0`, color: "#e7e5e4", fontSize: ms(8.7), lineHeight: 1.35, fontWeight: 650 },
    rateIcon: { width: ms(51), height: ms(51), display: "grid", placeItems: "center", borderRadius: ms(20), background: "linear-gradient(135deg, #f59e0b, #ea580c)", color: "white", fontSize: ms(27), fontWeight: 950, boxShadow: "0 15px 30px rgba(234,88,12,.32)", flexShrink: 0 },
    content: { padding: `${ms(13)}px ${ms(tiny ? 9 : 13)}px 0`, color: "#111827", background: "linear-gradient(180deg, #fff, #f6f4ef 58%, #efede8)" },
    trackerCard: { padding: `${ms(12)}px ${ms(8)}px ${ms(10)}px`, border: "1px solid #e7e5e4", borderRadius: ms(20), background: "white", boxShadow: "0 10px 24px rgba(0,0,0,.05)" },
    trackerHeading: { margin: `0 0 ${ms(11)}px`, textAlign: "center", fontSize: ms(11), fontWeight: 950 },
    trackerViewport: { width: "100%", overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none", paddingBottom: ms(3) },
    tracker: { minWidth: ms(455), display: "flex", alignItems: "flex-start", justifyContent: "center" },
    statusStep: { width: ms(86), display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, textAlign: "center" },
    statusStepWide: { width: ms(112) },
    statusCircle: { width: ms(25), height: ms(25), display: "grid", placeItems: "center", borderRadius: "50%", fontSize: ms(10), fontWeight: 950 },
    statusCircleGreen: { background: "#22c55e", color: "white", boxShadow: "0 6px 14px rgba(34,197,94,.22)" },
    statusCircleOrange: { background: "#f59e0b", color: "white", boxShadow: "0 6px 14px rgba(245,158,11,.24)" },
    statusCircleRed: { background: "#ef4444", color: "white", boxShadow: "0 6px 14px rgba(239,68,68,.22)" },
    statusLabel: { marginTop: ms(6), fontSize: ms(7), lineHeight: 1.16, fontWeight: 850 },
    statusLabelGreen: { color: "#166534" },
    statusLabelOrange: { color: "#92400e" },
    statusLabelRed: { color: "#b91c1c" },
    statusConnector: { width: ms(22), height: ms(4), marginTop: ms(10.5), borderRadius: 999, flexShrink: 0 },
    rateNotice: { display: "flex", gap: ms(10), marginTop: ms(11), padding: ms(12), border: "1px solid #fde68a", borderRadius: ms(19), background: "linear-gradient(135deg, #fffbeb, #fef3c7)", boxShadow: "0 10px 22px rgba(146,64,14,.08)" },
    noticeIcon: { width: ms(36), height: ms(36), display: "grid", placeItems: "center", borderRadius: ms(14), background: "#22c55e", color: "white", fontSize: ms(18), fontWeight: 950, flexShrink: 0 },
    noticeTitle: { color: "#78350f", fontSize: ms(10.1) },
    noticeText: { margin: `${ms(4)}px 0 0`, color: "#92400e", fontSize: ms(8.1), lineHeight: 1.35, fontWeight: 650 },
    sectionHeading: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: ms(9), marginTop: ms(16), marginBottom: ms(9) },
    sectionEyebrow: { margin: 0, color: "#b45309", fontSize: ms(7.3), letterSpacing: ms(1.15), fontWeight: 950 },
    sectionTitle: { margin: `${ms(3)}px 0 0`, fontSize: ms(15), fontWeight: 950 },
    validPill: { padding: `${ms(5)}px ${ms(8)}px`, borderRadius: 999, background: "#ecfdf5", color: "#15803d", fontSize: ms(7.7), fontWeight: 950 },
    quoteCard: { position: "relative", overflow: "hidden", padding: ms(15), borderRadius: ms(22), background: "linear-gradient(135deg, #020617, #292524)", color: "white", boxShadow: "0 17px 36px rgba(0,0,0,.18)" },
    quoteGlow: { position: "absolute", right: ms(-30), top: ms(-35), width: ms(105), height: ms(105), borderRadius: "50%", background: "rgba(245,158,11,.25)", filter: `blur(${ms(20)}px)` },
    quoteTopRow: { position: "relative", zIndex: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: ms(10) },
    quoteLabel: { margin: 0, color: "#d6d3d1", fontSize: ms(9.3) },
    quoteValueRow: { display: "flex", alignItems: "flex-end", gap: ms(3), marginTop: ms(5) },
    rupeeSymbol: { marginBottom: ms(4), color: "#fbbf24", fontSize: ms(18), fontWeight: 950 },
    quoteValue: { fontSize: ms(38), lineHeight: 1 },
    perTon: { marginBottom: ms(4), color: "#d6d3d1", fontSize: ms(9.5), fontWeight: 800 },
    bestRateBadge: { padding: `${ms(6)}px ${ms(9)}px`, border: "1px solid rgba(245,158,11,.35)", borderRadius: 999, background: "rgba(245,158,11,.16)", color: "#fde68a", fontSize: ms(7.6), fontWeight: 950 },
    quoteMetaGrid: { position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: ms(7), marginTop: ms(13) },
    quoteMetaItem: { display: "flex", flexDirection: "column", gap: ms(3), minWidth: 0, padding: ms(8), borderRadius: ms(13), background: "rgba(255,255,255,.08)", color: "#d6d3d1", fontSize: ms(7.2) },
    estimatedRow: { position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: ms(8), marginTop: ms(10), padding: ms(9), borderRadius: ms(12), background: "rgba(255,255,255,.1)", color: "#e7e5e4", fontSize: ms(8.4) },
    tableCard: { marginTop: ms(12), overflow: "hidden", border: "1px solid #e7e5e4", borderRadius: ms(20), background: "rgba(255,255,255,.96)", boxShadow: "0 10px 24px rgba(0,0,0,.055)" },
    tableHeader: { display: "grid", gridTemplateColumns: "1.55fr .85fr .65fr", gap: ms(6), padding: `${ms(9)}px ${ms(11)}px`, background: "#1c1917", color: "#fde68a", fontSize: ms(7.5), fontWeight: 950 },
    tableRow: { display: "grid", gridTemplateColumns: "1.55fr .85fr .65fr", alignItems: "center", gap: ms(6), padding: `${ms(11)}px`, fontSize: ms(8.5) },
    productCell: { display: "flex", alignItems: "center", gap: ms(7), minWidth: 0, lineHeight: 1.15 },
    productIcon: { width: ms(27), height: ms(27), display: "grid", placeItems: "center", borderRadius: ms(10), background: "#fef3c7", flexShrink: 0 },
    vehicleCell: { display: "grid", gridTemplateColumns: "auto auto", justifyContent: "start", columnGap: ms(3), minWidth: 0 },
    qtyCell: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ms(1), color: "#92400e" },
    tableDivider: { height: 1, margin: `0 ${ms(11)}px`, background: "#eeeae6" },
    deliveryCard: { display: "flex", alignItems: "center", gap: ms(9), marginTop: ms(12), padding: ms(12), border: "1px solid #e7e5e4", borderRadius: ms(20), background: "white", boxShadow: "0 10px 24px rgba(0,0,0,.05)" },
    deliveryIcon: { width: ms(38), height: ms(38), display: "grid", placeItems: "center", borderRadius: ms(14), background: "#fffbeb", fontSize: ms(19), flexShrink: 0 },
    detailLabel: { display: "block", color: "#78716c", fontSize: ms(7.8) },
    deliveryDate: { display: "block", marginTop: ms(3), fontSize: ms(11.2) },
    deliveryStatus: { padding: `${ms(5)}px ${ms(8)}px`, borderRadius: 999, background: "#ecfdf5", color: "#15803d", fontSize: ms(7.6), fontWeight: 950 },
    acceptedCard: { display: "flex", gap: ms(9), marginTop: ms(12), padding: ms(12), border: "1px solid #bbf7d0", borderRadius: ms(18), background: "#f0fdf4", color: "#166534", fontSize: ms(8.4), lineHeight: 1.35 },
    acceptedIcon: { width: ms(30), height: ms(30), display: "grid", placeItems: "center", borderRadius: ms(11), background: "#22c55e", color: "white", fontWeight: 950, flexShrink: 0 },
    rejectedCard: { display: "flex", gap: ms(9), marginTop: ms(12), padding: ms(12), border: "1px solid #fecaca", borderRadius: ms(18), background: "#fff7f7", color: "#991b1b", fontSize: ms(8.4), lineHeight: 1.35 },
    rejectedIcon: { width: ms(30), height: ms(30), display: "grid", placeItems: "center", borderRadius: ms(11), background: "#ef4444", color: "white", fontWeight: 950, flexShrink: 0 },
    bottomSpacer: { height: ms(128) },
    fixedFooter: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 30, padding: `${ms(8)}px ${ms(13)}px calc(env(safe-area-inset-bottom, 0px) + ${ms(10)}px)`, background: "linear-gradient(to top, #f6f4ef 76%, rgba(246,244,239,.98) 90%, rgba(246,244,239,.82))", borderTop: "1px solid rgba(120,113,108,.12)", boxShadow: "0 -12px 30px rgba(0,0,0,.10)" },
    footerHint: { display: "flex", alignItems: "center", justifyContent: "center", gap: ms(5), marginBottom: ms(7), color: "#78716c", fontSize: ms(7.8), fontWeight: 700 },
    footerHintGreen: { display: "flex", alignItems: "center", justifyContent: "center", gap: ms(5), marginBottom: ms(7), color: "#15803d", fontSize: ms(8), fontWeight: 900 },
    footerHintRed: { display: "flex", alignItems: "center", justifyContent: "center", gap: ms(5), marginBottom: ms(7), color: "#b91c1c", fontSize: ms(8), fontWeight: 900 },
    footerButtons: { display: "grid", gridTemplateColumns: "1fr 1.18fr", gap: ms(8) },
    rejectButton: { minHeight: ms(48), display: "flex", alignItems: "center", justifyContent: "center", gap: ms(6), border: "1px solid #fecaca", borderRadius: ms(18), background: "#fff7f7", color: "#b91c1c", fontSize: ms(9.3), fontWeight: 950, cursor: "pointer" },
    acceptButton: { minHeight: ms(48), display: "flex", alignItems: "center", justifyContent: "center", gap: ms(6), border: 0, borderRadius: ms(18), background: "linear-gradient(135deg, #22c55e, #15803d)", color: "white", fontSize: ms(9.3), fontWeight: 950, boxShadow: "0 12px 24px rgba(34,197,94,.22)", cursor: "pointer" },
    nextPageButton: { position: "relative", width: "100%", minHeight: ms(48), border: 0, borderRadius: ms(18), background: "linear-gradient(135deg, #22c55e, #15803d)", color: "white", fontSize: ms(10), fontWeight: 950, boxShadow: "0 12px 24px rgba(34,197,94,.22)", cursor: "pointer" },
    rejectedOnlyButton: { width: "100%", minHeight: ms(48), border: 0, borderRadius: ms(18), background: "#ef4444", color: "white", fontSize: ms(10), fontWeight: 950, boxShadow: "0 12px 24px rgba(239,68,68,.20)" },
    popupOverlay: { position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: ms(18), background: "rgba(2,6,23,.72)", backdropFilter: "blur(8px)" },
    rejectPopup: { width: "100%", maxWidth: ms(280), padding: `${ms(23)}px ${ms(18)}px ${ms(18)}px`, borderRadius: ms(25), border: "1px solid #fecaca", background: "white", textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,.38)" },
    acceptPopup: { position: "relative", width: "100%", maxWidth: ms(280), overflow: "hidden", padding: `${ms(25)}px ${ms(18)}px ${ms(18)}px`, borderRadius: ms(25), border: "1px solid #bbf7d0", background: "linear-gradient(145deg, white, #f0fdf4)", textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,.38)" },
    warningIcon: { width: ms(58), height: ms(58), margin: "0 auto", display: "grid", placeItems: "center", borderRadius: "50%", background: "#fee2e2", color: "#dc2626", fontSize: ms(29), fontWeight: 950, boxShadow: "0 0 0 7px rgba(239,68,68,.08)" },
    popupGlow: { position: "absolute", left: "50%", top: ms(-65), width: ms(170), height: ms(130), borderRadius: "50%", background: "rgba(34,197,94,.20)", filter: `blur(${ms(28)}px)`, transform: "translateX(-50%)" },
    greenTick: { position: "relative", zIndex: 2, width: ms(62), height: ms(62), margin: "0 auto", display: "grid", placeItems: "center", border: `${ms(5)}px solid #dcfce7`, borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #15803d)", color: "white", fontSize: ms(30), fontWeight: 950 },
    popupTitle: { margin: `${ms(17)}px 0 0`, color: "#111827", fontSize: ms(19), lineHeight: 1.06, fontWeight: 950 },
    popupText: { margin: `${ms(10)}px auto 0`, maxWidth: ms(235), color: "#57534e", fontSize: ms(9), lineHeight: 1.45, fontWeight: 650 },
    popupButtons: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: ms(8), marginTop: ms(17) },
    cancelButton: { minHeight: ms(42), border: "1px solid #e7e5e4", borderRadius: ms(16), background: "#fafaf9", color: "#44403c", fontSize: ms(9), fontWeight: 900, cursor: "pointer" },
    confirmRejectButton: { minHeight: ms(42), border: 0, borderRadius: ms(16), background: "#ef4444", color: "white", fontSize: ms(9), fontWeight: 950, cursor: "pointer" },
    doneButton: { position: "relative", zIndex: 2, width: "100%", minHeight: ms(44), marginTop: ms(17), border: 0, borderRadius: ms(17), background: "linear-gradient(135deg, #22c55e, #15803d)", color: "white", fontSize: ms(10.5), fontWeight: 950, cursor: "pointer" },
  };
}

const globalCss = `
* { box-sizing: border-box; }
html, body, #root { margin: 0; width: 100%; height: 100%; min-height: 100%; background: #0b0907; overflow: hidden; }
button, input, select, textarea { font: inherit; }
body { -webkit-text-size-adjust: 100%; }
`;






