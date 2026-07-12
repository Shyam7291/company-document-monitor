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





















































recent order 
import React, { useEffect, useMemo, useState } from "react";

const BASE_W = 206;
const BASE_H = 445;
const HEADER_BG_IMAGE = "";

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
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return viewport;
}

const ORDERS = [
  {
    id: "SR-260711-04",
    type: "rate",
    title: "20mm + 40mm Crushed Stone",
    subtitle: "30 tons • 3 vehicles",
    date: "11 Jul 2026",
    value: "₹1,280 / ton",
    status: "Best rate ready",
    tone: "active",
    progress: 3,
    stages: ["Submitted", "Checking", "Rate ready", "Confirm"],
  },
  {
    id: "SR-260709-02",
    type: "delivery",
    title: "40mm Crushed Stone",
    subtitle: "22 tons • 1 vehicle",
    date: "09 Jul 2026",
    value: "Order confirmed",
    status: "In route",
    tone: "active",
    progress: 3,
    stages: ["Ordered", "Dispatched", "In route", "Delivered"],
  },
  {
    id: "SR-260707-01",
    type: "rate",
    title: "M-Sand",
    subtitle: "18 tons • 1 vehicle",
    date: "07 Jul 2026",
    value: "₹1,050 / ton",
    status: "Rejected",
    tone: "rejected",
    progress: 4,
    stages: ["Submitted", "Checking", "Rate ready", "Rejected"],
  },
];

export default function App() {
  const viewport = useViewport();

  const styles = useMemo(
    () => createStyles(viewport),
    [viewport.width, viewport.height]
  );

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showSort, setShowSort] = useState(false);
  const [sortOrder, setSortOrder] = useState("Newest first");
  const [activeNav, setActiveNav] = useState("Orders");

  const filters = [
    "All",
    "Rate requests",
    "Delivery orders",
    "Pending",
    "Rejected",
  ];

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase();

    let result = ORDERS.filter((order) => {
      const searchMatch =
        !search ||
        order.id.toLowerCase().includes(search) ||
        order.title.toLowerCase().includes(search);

      const filterMatch =
        filter === "All" ||
        (filter === "Rate requests" && order.type === "rate") ||
        (filter === "Delivery orders" && order.type === "delivery") ||
        (filter === "Pending" && order.tone === "active") ||
        (filter === "Rejected" && order.tone === "rejected");

      return searchMatch && filterMatch;
    });

    if (sortOrder === "Oldest first") {
      result = [...result].reverse();
    }

    if (sortOrder === "Rejected first") {
      result = [...result].sort((a, b) => {
        if (a.tone === b.tone) return 0;
        return a.tone === "rejected" ? -1 : 1;
      });
    }

    return result;
  }, [query, filter, sortOrder]);

  const totalOrders = ORDERS.length;

  const totalRateRequests = ORDERS.filter(
    (order) => order.type === "rate"
  ).length;

  const totalInRoute = ORDERS.filter(
    (order) => order.status === "In route"
  ).length;

  return (
    <div style={styles.page}>
      <style>{globalCss}</style>

      <main style={styles.phone}>
        <header style={styles.fixedControls}>
          <div style={styles.combinedControlsCard}>
            <div style={styles.searchShell}>
              <button
                type="button"
                style={styles.backButton}
                aria-label="Go back"
                onClick={() => window.history.back()}
              >
                ‹
              </button>

              <label style={styles.searchBox}>
                <span style={styles.searchIcon}>⌕</span>

                <div style={styles.searchTextArea}>
                  <span style={styles.searchLabel}>SEARCH ORDERS</span>

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Order ID or material"
                    style={styles.searchInput}
                  />
                </div>

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    style={styles.clearButton}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </label>

              <button
                type="button"
                onClick={() => setShowSort((value) => !value)}
                style={{
                  ...styles.sortButton,
                  ...(showSort ? styles.sortButtonActive : {}),
                }}
                aria-label="Sort orders"
              >
                <span style={styles.sortIcon}>⇅</span>
              </button>
            </div>

            <div className="filter-scroll" style={styles.filterScroller}>
              {filters.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setFilter(item)}
                  style={{
                    ...styles.filterChip,
                    ...(filter === item ? styles.filterChipActive : {}),
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {showSort && (
              <div style={styles.sortPanel}>
                <span style={styles.sortLabel}>SORT ORDERS</span>

                {[
                  "Newest first",
                  "Oldest first",
                  "Rejected first",
                ].map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => {
                      setSortOrder(option);
                      setShowSort(false);
                    }}
                    style={{
                      ...styles.sortOption,
                      ...(sortOrder === option
                        ? styles.sortOptionActive
                        : {}),
                    }}
                  >
                    <span>{option}</span>

                    {sortOrder === option && <b>✓</b>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <section
          className="orders-scroll-area"
          style={styles.ordersScrollArea}
        >
          <section style={styles.hero}>
            <div style={styles.heroShade} />
            <div style={styles.heroGrid} />

            <div style={styles.heroContent}>
              <p style={styles.eyebrow}>ORDER CENTRE</p>

              <h1 style={styles.title}>Recent Orders</h1>

              <p style={styles.heroText}>
                Track rate requests, deliveries and rejected quotes.
              </p>
            </div>

            <div style={styles.orderSummaryTable}>
              <div style={styles.orderSummaryCell}>
                <b>{totalOrders}</b>
                <span>Total orders</span>
              </div>

              <div style={styles.orderSummaryDivider} />

              <div style={styles.orderSummaryCell}>
                <b>{totalRateRequests}</b>
                <span>Rate requests</span>
              </div>

              <div style={styles.orderSummaryDivider} />

              <div style={styles.orderSummaryCell}>
                <b>{totalInRoute}</b>
                <span>In route</span>
              </div>
            </div>
          </section>

          <div style={styles.activityArea}>
            <div style={styles.resultsHeader}>
              <div>
                <p style={styles.resultsEyebrow}>RECENT ACTIVITY</p>

                <h2 style={styles.resultsTitle}>
                  {filteredOrders.length}{" "}
                  {filteredOrders.length === 1 ? "order" : "orders"}
                </h2>
              </div>

              <span style={styles.sortText}>{sortOrder}</span>
            </div>

            <div style={styles.orderStack}>
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  styles={styles}
                />
              ))}

              {filteredOrders.length === 0 && (
                <div style={styles.emptyCard}>
                  <div style={styles.emptyIcon}>⌕</div>

                  <b>No matching orders</b>

                  <p>Try another order ID, material name or filter.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <nav style={styles.bottomNav}>
  {[
    { name: "Home", icon: "⌂" },
    { name: "Orders", icon: "▣" },
    { name: "Profile", icon: "●" },
  ].map((item) => {
    const active = activeNav === item.name;

    return (
      <button
        type="button"
        key={item.name}
        onClick={() => setActiveNav(item.name)}
        style={{
          ...styles.navButton,
          ...(active ? styles.navButtonActive : {}),
        }}
      >
        {active && <span style={styles.activeIndicator} />}

        <span
          style={{
            ...styles.navIconBox,
            ...(active ? styles.navIconBoxActive : {}),
          }}
        >
          <span style={styles.navIcon}>{item.icon}</span>
        </span>

        <span
          style={{
            ...styles.navLabel,
            ...(active ? styles.navLabelActive : {}),
          }}
        >
          {item.name}
        </span>
      </button>
    );
  })}
</nav>

      </main>
    </div>
  );
}

function OrderCard({ order, styles }) {
  const rejected = order.tone === "rejected";
  const delivery = order.type === "delivery";

  return (
    <article
      style={{
        ...styles.orderCard,
        ...(rejected ? styles.orderCardRejected : {}),
      }}
    >
      <div
        style={{
          ...styles.cardGlow,
          background: rejected
            ? "rgba(239,68,68,.16)"
            : delivery
            ? "rgba(59,130,246,.14)"
            : "rgba(34,197,94,.14)",
        }}
      />

      <div
        style={{
          ...styles.cardAccent,
          background: rejected
            ? "linear-gradient(to bottom, #ef4444, #991b1b)"
            : delivery
            ? "linear-gradient(to bottom, #38bdf8, #1d4ed8)"
            : "linear-gradient(to bottom, #22c55e, #15803d)",
        }}
      />

      <div style={styles.orderTopRow}>
        <div
          style={{
            ...styles.orderTypeIcon,
            ...(delivery ? styles.deliveryTypeIcon : {}),
            ...(rejected ? styles.rejectedTypeIcon : {}),
          }}
        >
          {delivery ? "🚚" : "₹"}
        </div>

        <div style={styles.orderMainContent}>
          <div style={styles.orderMetaLine}>
            <span style={styles.orderId}>{order.id}</span>

            <div
              style={{
                ...styles.statusPill,
                ...(rejected
                  ? styles.statusPillRejected
                  : delivery
                  ? styles.statusPillDelivery
                  : styles.statusPillActive),
              }}
            >
              <span
                style={{
                  ...styles.statusDot,
                  background: rejected
                    ? "#ef4444"
                    : delivery
                    ? "#38bdf8"
                    : "#22c55e",
                }}
              />

              <span style={styles.statusText}>{order.status}</span>
            </div>
          </div>

          <h3 style={styles.orderTitle}>{order.title}</h3>

          <p style={styles.orderSubtitle}>{order.subtitle}</p>
        </div>
      </div>

      <div style={styles.orderInfoGrid}>
        <div style={styles.infoCell}>
          <span>Request date</span>
          <b>{order.date}</b>
        </div>

        <div style={styles.infoCell}>
          <span>{delivery ? "Current state" : "Quoted rate"}</span>
          <b>{order.value}</b>
        </div>
      </div>

      <div style={styles.cardProgressArea}>
        <p style={styles.progressCaption}>
          {delivery ? "DELIVERY PROGRESS" : "RATE REQUEST PROGRESS"}
        </p>

        <div
          className="progress-scroll"
          style={styles.progressScroller}
        >
          <div style={styles.miniTracker}>
            {order.stages.map((stage, index) => {
              const completed = index < order.progress;
              const current = index === order.progress - 1;

              const finalRejected =
                rejected && index === order.stages.length - 1;

              return (
                <React.Fragment key={stage}>
                  <div style={styles.miniStep}>
                    <div
                      style={{
                        ...styles.miniCircle,

                        background: finalRejected
                          ? "#ef4444"
                          : completed
                          ? delivery
                            ? "#38bdf8"
                            : "#22c55e"
                          : "#e7e5e4",

                        color: completed ? "white" : "#a8a29e",

                        boxShadow: current
                          ? finalRejected
                            ? "0 0 0 4px rgba(239,68,68,.12)"
                            : delivery
                            ? "0 0 0 4px rgba(56,189,248,.12)"
                            : "0 0 0 4px rgba(34,197,94,.12)"
                          : "none",
                      }}
                    >
                      {finalRejected ? "×" : completed ? "✓" : ""}
                    </div>

                    <span
                      style={{
                        ...styles.miniLabel,

                        color: finalRejected
                          ? "#b91c1c"
                          : completed
                          ? delivery
                            ? "#0369a1"
                            : "#166534"
                          : "#a8a29e",

                        fontWeight: current ? 950 : 750,
                      }}
                    >
                      {stage}
                    </span>
                  </div>

                  {index < order.stages.length - 1 && (
                    <div
                      style={{
                        ...styles.miniConnector,

                        background:
                          index < order.progress - 1
                            ? delivery
                              ? "#38bdf8"
                              : "#22c55e"
                            : finalRejected
                            ? "linear-gradient(to right, #22c55e, #ef4444)"
                            : "#e7e5e4",
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div style={styles.orderFooter}>
        <span
          style={{
            ...styles.orderTypeLabel,
            color: rejected
              ? "#b91c1c"
              : delivery
              ? "#0369a1"
              : "#15803d",
          }}
        >
          {delivery
            ? "Delivery order"
            : rejected
            ? "Rejected rate request"
            : "Active rate request"}
        </span>

        <button
          type="button"
          style={{
            ...styles.viewButton,
            ...(rejected ? styles.viewButtonRejected : {}),
            ...(delivery ? styles.viewButtonDelivery : {}),
          }}
        >
          View details <b>›</b>
        </button>
      </div>
    </article>
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

  const ms = (value, factor = 0.55) =>
    Math.round(value + (value * scale - value) * factor);

  const tiny = appW <= 230;
  const short = appH <= 620;

  const navHeight = ms(58);
  const controlsHeight = ms(short ? 103 : 113);
  const heroHeight = ms(short ? 122 : 142);

  const themedSurface = HEADER_BG_IMAGE
    ? `linear-gradient(
        180deg,
        rgba(8,7,6,.78) 0%,
        rgba(28,25,23,.72) 48%,
        rgba(95,37,8,.68) 100%
      ),
      url("${HEADER_BG_IMAGE}")`
    : `radial-gradient(
        circle at 88% 7%,
        rgba(245,158,11,.34),
        transparent 34%
      ),
      linear-gradient(
        180deg,
        #080706 0%,
        #171310 46%,
        #371707 72%,
        #5f2508 100%
      )`;

  return {
    page: {
      width: "100vw",
      height: "100dvh",
      minHeight: "100dvh",

      display: "flex",
      justifyContent: "center",
      alignItems: isDesktop ? "center" : "stretch",

      margin: 0,
      padding: isDesktop ? 10 : 0,
      overflow: "hidden",

      background: isDesktop ? "#f4f1ea" : "#0b0907",
      fontFamily: "Arial, sans-serif",
    },

    phone: {
      position: "relative",

      width: isDesktop ? 390 : "100vw",
      height: isDesktop ? 844 : "100dvh",

      overflow: "hidden",

      backgroundColor: "#080706",
      backgroundImage: themedSurface,
      backgroundSize: "cover",
      backgroundPosition: "center top",
      backgroundRepeat: "no-repeat",

      borderRadius: isDesktop ? 30 : 0,

      boxShadow: isDesktop
        ? "0 25px 70px rgba(0,0,0,.25)"
        : "none",
    },

    fixedControls: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      zIndex: 40,

      height: controlsHeight,
      padding: `${ms(6)}px ${ms(tiny ? 2 : 4)}px`,

      overflow: "visible",
      color: "white",

      background:
        "radial-gradient(circle at 88% 0%, rgba(245,158,11,.28), transparent 34%), linear-gradient(180deg, #080706 0%, #171310 52%, #3f1b08 100%)",

      borderBottom: "1px solid rgba(245,158,11,.18)",
      boxShadow: "0 12px 28px rgba(28,25,23,.24)",
    },

    combinedControlsCard: {
      position: "relative",

      width: "100%",
      height: "100%",

      padding: `${ms(6)}px ${ms(6)}px ${ms(5)}px`,

      border: "1px solid rgba(255,255,255,.12)",
      borderRadius: ms(20),

      background:
        "linear-gradient(145deg, rgba(255,255,255,.095), rgba(255,255,255,.035))",

      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,.12), 0 10px 24px rgba(0,0,0,.14)",

      backdropFilter: "blur(14px)",
    },

    searchShell: {
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr) auto",
      gap: ms(6),
      alignItems: "stretch",
    },

    backButton: {
      width: ms(42),
      minHeight: ms(42),

      display: "grid",
      placeItems: "center",

      padding: 0,

      border: "1px solid rgba(255,255,255,.16)",
      borderRadius: ms(15),

      background: "rgba(255,255,255,.09)",
      color: "white",

      fontSize: ms(24),
      lineHeight: 1,
      fontWeight: 700,

      boxShadow: "inset 0 1px 0 rgba(255,255,255,.14)",
      backdropFilter: "blur(12px)",

      cursor: "pointer",
    },

    searchBox: {
      position: "relative",

      minWidth: 0,
      minHeight: ms(42),

      display: "flex",
      alignItems: "center",

      gap: ms(8),
      padding: `0 ${ms(9)}px`,

      overflow: "hidden",

      border: "1px solid rgba(255,255,255,.16)",
      borderRadius: ms(15),

      background: "rgba(255,255,255,.09)",

      boxShadow: "inset 0 1px 0 rgba(255,255,255,.14)",
      backdropFilter: "blur(12px)",
    },

    searchIcon: {
      width: ms(28),
      height: ms(28),

      display: "grid",
      placeItems: "center",

      flexShrink: 0,

      borderRadius: ms(10),

      background: "rgba(245,158,11,.16)",
      color: "#fbbf24",

      fontSize: ms(18),
      fontWeight: 950,

      boxShadow:
        "inset 0 0 0 1px rgba(245,158,11,.22)",
    },

    searchTextArea: {
      minWidth: 0,
      flex: 1,

      display: "flex",
      flexDirection: "column",
      justifyContent: "center",

      gap: ms(1),
    },

    searchLabel: {
      color: "#fde68a",

      fontSize: ms(5.7),
      letterSpacing: ms(.65),
      lineHeight: 1,
      fontWeight: 950,
    },

    searchInput: {
      width: "100%",
      minWidth: 0,

      padding: 0,
      border: 0,
      outline: 0,

      background: "transparent",

      color: "white",
      caretColor: "#f59e0b",

      fontSize: ms(8.5),
      lineHeight: 1.2,
      fontWeight: 800,
    },

    clearButton: {
      width: ms(22),
      height: ms(22),

      display: "grid",
      placeItems: "center",

      flexShrink: 0,

      padding: 0,
      border: 0,
      borderRadius: "50%",

      background: "rgba(255,255,255,.14)",
      color: "white",

      fontSize: ms(13),
      fontWeight: 900,

      cursor: "pointer",
    },

    sortButton: {
      position: "relative",

      width: ms(42),
      minHeight: ms(42),

      display: "grid",
      placeItems: "center",

      border: "1px solid rgba(245,158,11,.38)",
      borderRadius: ms(15),

      background:
        "linear-gradient(145deg, #f59e0b, #ea580c)",

      color: "white",

      boxShadow:
        "0 10px 22px rgba(234,88,12,.30), inset 0 1px 0 rgba(255,255,255,.25)",

      cursor: "pointer",
    },

    sortButtonActive: {
      transform: "scale(.96)",

      boxShadow:
        "0 6px 15px rgba(234,88,12,.26), inset 0 0 0 2px rgba(255,255,255,.18)",
    },

    sortIcon: {
      fontSize: ms(19),
      lineHeight: 1,
      fontWeight: 950,
    },

    filterScroller: {
      width: "100%",

      display: "flex",
      alignItems: "center",

      gap: ms(6),
      marginTop: ms(6),

      padding: `0 ${ms(1)}px ${ms(2)}px`,

      overflowX: "auto",
      overflowY: "hidden",

      scrollbarWidth: "none",
      msOverflowStyle: "none",
      scrollSnapType: "x proximity",
    },

    filterChip: {
      flexShrink: 0,

      minHeight: ms(30),
      padding: `0 ${ms(10)}px`,

      border: "1px solid rgba(255,255,255,.14)",
      borderRadius: 999,

      background: "rgba(255,255,255,.08)",
      color: "#e7e5e4",

      fontSize: ms(7.7),
      fontWeight: 900,

      backdropFilter: "blur(10px)",

      cursor: "pointer",
      scrollSnapAlign: "start",
    },

    filterChipActive: {
      borderColor: "#f59e0b",

      background:
        "linear-gradient(135deg, #f59e0b, #ea580c)",

      color: "white",

      boxShadow:
        "0 8px 18px rgba(245,158,11,.24)",
    },

    sortPanel: {
      position: "absolute",

      top: `calc(100% + ${ms(6)}px)`,
      left: ms(5),
      right: ms(5),

      zIndex: 80,

      padding: ms(9),

      border: "1px solid rgba(245,158,11,.22)",
      borderRadius: ms(17),

      background: "rgba(28,25,23,.98)",
      color: "white",

      boxShadow: "0 18px 38px rgba(0,0,0,.32)",
      backdropFilter: "blur(16px)",
    },

    sortLabel: {
      display: "block",
      marginBottom: ms(6),

      color: "#fde68a",

      fontSize: ms(7.3),
      letterSpacing: ms(.7),
      fontWeight: 950,
    },

    sortOption: {
      width: "100%",
      minHeight: ms(33),

      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",

      padding: `0 ${ms(9)}px`,

      border: 0,
      borderRadius: ms(11),

      background: "transparent",
      color: "#e7e5e4",

      fontSize: ms(8.5),
      fontWeight: 800,

      cursor: "pointer",
    },

    sortOptionActive: {
      background: "rgba(245,158,11,.16)",
      color: "#fbbf24",
    },

    ordersScrollArea: {
      position: "absolute",
      left: 0,
      right: 0,

      top: controlsHeight,
      bottom: navHeight,

      overflowY: "auto",
      overflowX: "hidden",

      scrollbarWidth: "none",
      msOverflowStyle: "none",

      padding: 0,

      background: "transparent",

      WebkitOverflowScrolling: "touch",
      scrollBehavior: "smooth",
    },

    hero: {
      position: "relative",

      minHeight: heroHeight,
      margin: 0,

      padding: `${ms(14)}px ${ms(tiny ? 12 : 16)}px ${ms(13)}px`,

      overflow: "hidden",

      color: "white",
      borderRadius: 0,

      background:
        "radial-gradient(circle at 85% 10%, rgba(251,191,36,.30), transparent 35%), linear-gradient(135deg, #17100b 0%, #3f2414 55%, #92400e 100%)",

      borderBottom:
        "1px solid rgba(245,158,11,.14)",

      boxShadow:
        "0 14px 30px rgba(28,25,23,.16)",
    },

    heroShade: {
      position: "absolute",
      inset: 0,

      background:
        "linear-gradient(to bottom, rgba(0,0,0,.02), rgba(0,0,0,.10))",

      pointerEvents: "none",
    },

    heroGrid: {
      position: "absolute",
      inset: 0,

      opacity: .24,
      pointerEvents: "none",

      backgroundImage:
        "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",

      backgroundSize: `${ms(30)}px ${ms(30)}px`,
    },

    heroContent: {
      position: "relative",
      zIndex: 2,
    },

    eyebrow: {
      margin: 0,

      color: "#fde68a",

      fontSize: ms(6.8),
      letterSpacing: ms(1.35),
      fontWeight: 950,
    },

    title: {
      margin: `${ms(4)}px 0 0`,

      fontSize: ms(short ? 23 : 27),
      lineHeight: 1,
      fontWeight: 950,
      letterSpacing: -.6,
    },

    heroText: {
      maxWidth: ms(250),

      margin: `${ms(5)}px 0 0`,

      color: "#e7e5e4",

      fontSize: ms(7.5),
      lineHeight: 1.25,
      fontWeight: 650,
    },

    orderSummaryTable: {
      position: "relative",
      zIndex: 2,

      display: "grid",
      gridTemplateColumns:
        "1fr auto 1fr auto 1fr",

      alignItems: "stretch",

      marginTop: ms(13),
      padding: ms(8),

      border:
        "1px solid rgba(255,255,255,.15)",

      borderRadius: ms(16),

      background: "rgba(255,255,255,.11)",
      backdropFilter: "blur(12px)",
    },

    orderSummaryCell: {
      minWidth: 0,

      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",

      gap: ms(2),

      color: "white",
      textAlign: "center",

      fontSize: ms(7),
    },

    orderSummaryDivider: {
      width: 1,
      minHeight: ms(28),

      background:
        "rgba(255,255,255,.18)",
    },

    activityArea: {
      minHeight: "100%",

      padding: `${ms(14)}px 0 ${ms(14)}px`,

      background:
        "linear-gradient(180deg, #f9f8f5 0%, #f6f4ef 48%, #efede8 100%)",
    },

    resultsHeader: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",

      gap: ms(8),

      margin: `0 ${ms(tiny ? 9 : 13)}px ${ms(10)}px`,
    },

    resultsEyebrow: {
      margin: 0,

      color: "#b45309",

      fontSize: ms(7.1),
      letterSpacing: ms(1.1),
      fontWeight: 950,
    },

    resultsTitle: {
      margin: `${ms(3)}px 0 0`,

      fontSize: ms(14),
      fontWeight: 950,
    },

    sortText: {
      color: "#78716c",

      fontSize: ms(7.5),
      fontWeight: 750,
    },

    orderStack: {
      display: "grid",

      gap: ms(12),
      padding: `0 ${ms(tiny ? 9 : 13)}px`,
    },

    orderCard: {
      position: "relative",
      overflow: "hidden",

      padding: ms(13),

      border:
        "1px solid rgba(231,229,228,.9)",

      borderRadius: ms(23),

      background:
        "linear-gradient(145deg, rgba(255,255,255,.99), rgba(250,250,249,.96))",

      boxShadow:
        "0 16px 34px rgba(28,25,23,.09), inset 0 1px 0 white",
    },

    orderCardRejected: {
      borderColor: "#fecaca",

      background:
        "linear-gradient(145deg, #fff, #fff7f7)",
    },

    cardGlow: {
      position: "absolute",

      right: ms(-28),
      top: ms(-34),

      width: ms(105),
      height: ms(105),

      borderRadius: "50%",

      filter: `blur(${ms(24)}px)`,
      pointerEvents: "none",
    },

    cardAccent: {
      position: "absolute",

      left: 0,
      top: ms(15),
      bottom: ms(15),

      width: ms(4),

      borderRadius:
        "0 999px 999px 0",
    },

    orderTopRow: {
      position: "relative",
      zIndex: 2,

      display: "grid",

      gridTemplateColumns:
        `${ms(tiny ? 34 : 39)}px minmax(0, 1fr)`,

      alignItems: "start",

      gap: ms(tiny ? 7 : 9),

      width: "100%",
    },

    orderMainContent: {
      minWidth: 0,
      width: "100%",
    },

    orderMetaLine: {
      width: "100%",
      minWidth: 0,

      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",

      gap: ms(5),
    },

    orderTypeIcon: {
      width: ms(tiny ? 34 : 39),
      height: ms(tiny ? 34 : 39),

      display: "grid",
      placeItems: "center",

      borderRadius: ms(15),

      background:
        "linear-gradient(145deg, #fffbeb, #fef3c7)",

      color: "#b45309",

      fontSize: ms(tiny ? 16 : 19),
      fontWeight: 950,

      boxShadow:
        "0 8px 18px rgba(180,83,9,.10)",

      flexShrink: 0,
    },

    deliveryTypeIcon: {
      background:
        "linear-gradient(145deg, #eff6ff, #dbeafe)",

      color: "#0369a1",
    },

    rejectedTypeIcon: {
      background:
        "linear-gradient(145deg, #fff7f7, #fee2e2)",

      color: "#b91c1c",
    },

    orderId: {
      minWidth: 0,

      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",

      color: "#a8a29e",

      fontSize: ms(6.9),
      letterSpacing: ms(.6),
      fontWeight: 900,
    },

    orderTitle: {
      width: "100%",

      margin: `${ms(5)}px 0 0`,

      color: "#111827",

      fontSize: ms(tiny ? 9.8 : 10.8),
      lineHeight: 1.08,
      fontWeight: 950,

      letterSpacing: tiny ? -0.25 : -0.15,

      overflowWrap: "normal",
      wordBreak: "normal",
    },

    orderSubtitle: {
      margin: `${ms(4)}px 0 0`,

      color: "#78716c",

      fontSize: ms(7.7),
      lineHeight: 1.2,
      fontWeight: 700,
    },

    statusPill: {
      position: "relative",
      zIndex: 2,

      minWidth: 0,
      maxWidth: tiny ? ms(92) : ms(120),
      minHeight: ms(23),

      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",

      gap: ms(4),

      padding:
        `${ms(4)}px ${ms(tiny ? 6 : 8)}px`,

      borderRadius: 999,

      fontSize: ms(tiny ? 6.3 : 7),
      lineHeight: 1,
      fontWeight: 950,

      whiteSpace: "nowrap",
      flexShrink: 1,
    },

    statusText: {
      minWidth: 0,

      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    statusPillActive: {
      background: "#ecfdf5",
      color: "#15803d",
    },

    statusPillDelivery: {
      background: "#eff6ff",
      color: "#0369a1",
    },

    statusPillRejected: {
      background: "#fee2e2",
      color: "#b91c1c",
    },

    statusDot: {
      width: ms(6),
      height: ms(6),

      flexShrink: 0,

      borderRadius: "50%",

      boxShadow:
        "0 0 0 3px rgba(34,197,94,.10)",
    },

    orderInfoGrid: {
      position: "relative",
      zIndex: 2,

      display: "grid",
      gridTemplateColumns: "1fr 1fr",

      gap: ms(7),
      marginTop: ms(10),
    },

    infoCell: {
      display: "flex",
      flexDirection: "column",

      gap: ms(3),
      padding: ms(8),

      border: "1px solid #eeeae6",
      borderRadius: ms(13),

      background:
        "rgba(250,250,249,.86)",

      color: "#78716c",

      fontSize: ms(7.1),
    },

    cardProgressArea: {
      position: "relative",
      zIndex: 2,

      margin:
        `${ms(11)}px ${ms(-4)}px 0`,

      padding:
        `${ms(9)}px ${ms(4)}px ${ms(4)}px`,

      borderTop: "1px solid #eeeae6",
    },

    progressCaption: {
      margin: `0 0 ${ms(8)}px`,

      color: "#a8a29e",

      fontSize: ms(6.6),
      letterSpacing: ms(.8),
      fontWeight: 950,
    },

    progressScroller: {
      overflowX: "auto",
      overflowY: "hidden",

      scrollbarWidth: "none",
      msOverflowStyle: "none",

      paddingBottom: ms(2),
    },

    miniTracker: {
      minWidth: ms(350),

      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
    },

    miniStep: {
      width: ms(72),

      display: "flex",
      flexDirection: "column",
      alignItems: "center",

      flexShrink: 0,

      textAlign: "center",
    },

    miniCircle: {
      width: ms(20),
      height: ms(20),

      display: "grid",
      placeItems: "center",

      borderRadius: "50%",

      fontSize: ms(8),
      fontWeight: 950,
    },

    miniLabel: {
      marginTop: ms(5),

      fontSize: ms(6.4),
      lineHeight: 1.15,
    },

    miniConnector: {
      width: ms(20),
      height: ms(3),

      marginTop: ms(8.5),

      borderRadius: 999,
      flexShrink: 0,
    },

    orderFooter: {
      position: "relative",
      zIndex: 2,

      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",

      gap: ms(8),
      marginTop: ms(10),
    },

    orderTypeLabel: {
      fontSize: ms(7.2),
      fontWeight: 900,
    },

    viewButton: {
      minHeight: ms(32),

      padding: `0 ${ms(11)}px`,

      border: 0,
      borderRadius: 999,

      background:
        "linear-gradient(135deg, #1c1917, #44403c)",

      color: "white",

      fontSize: ms(8),
      fontWeight: 950,

      boxShadow:
        "0 8px 16px rgba(28,25,23,.16)",

      cursor: "pointer",
    },

    viewButtonDelivery: {
      background:
        "linear-gradient(135deg, #0284c7, #1d4ed8)",
    },

    viewButtonRejected: {
      background:
        "linear-gradient(135deg, #ef4444, #b91c1c)",
    },

    emptyCard: {
      padding: ms(24),

      border: "1px dashed #d6d3d1",
      borderRadius: ms(20),

      background: "rgba(255,255,255,.7)",

      textAlign: "center",
      color: "#57534e",

      fontSize: ms(9),
    },

    emptyIcon: {
      width: ms(42),
      height: ms(42),

      margin: `0 auto ${ms(8)}px`,

      display: "grid",
      placeItems: "center",

      borderRadius: ms(15),

      background: "#fffbeb",
      color: "#b45309",

      fontSize: ms(22),
    },

    bottomNav: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 40,
    
      minHeight: navHeight,
    
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      alignItems: "stretch",
    
      padding: `${ms(5)}px ${ms(8)}px calc(env(safe-area-inset-bottom, 0px) + ${ms(
        5
      )}px)`,
    
      borderTop: "1px solid rgba(251,191,36,.20)",
    
      background:
        "radial-gradient(circle at 50% 0%, rgba(245,158,11,.16), transparent 46%), linear-gradient(135deg, #21140d 0%, #352013 52%, #4b250d 100%)",
    
      boxShadow:
        "0 -14px 34px rgba(28,15,7,.30), inset 0 1px 0 rgba(255,255,255,.07)",
    
      backdropFilter: "blur(18px)",
    },
    
    navButton: {
      minHeight: 0,

      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",

      gap: ms(1),

      border: 0,
      borderRadius: ms(12),

      background: "transparent",
      color: "#a8a29e",

      fontSize: ms(7.2),

      cursor: "pointer",
    },

    navButtonActive: {
      background:
        "rgba(245,158,11,.14)",

      color: "#f59e0b",

      boxShadow:
        "inset 0 0 0 1px rgba(245,158,11,.18)",
    },

    navIcon: {
      fontSize: ms(15),
      lineHeight: 1,
    },
  };
}

const globalCss = `
* {
  box-sizing: border-box;
}

html,
body,
#root {
  margin: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  background: #0b0907;
  overflow: hidden;
}

button,
input,
select,
textarea {
  font: inherit;
}

input::placeholder {
  color: rgba(255,255,255,.62);
  opacity: 1;
}

.orders-scroll-area,
.filter-scroll,
.progress-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.orders-scroll-area::-webkit-scrollbar,
.filter-scroll::-webkit-scrollbar,
.progress-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

body {
  -webkit-text-size-adjust: 100%;
}
`;




































profile
import React, { useEffect, useMemo, useState } from "react";

const BASE_W = 206;
const BASE_H = 445;
const PROFILE_BG_IMAGE ="https://cdn.jsdelivr.net/gh/Shyam7291/company-document-monitor@main/1783841473662.png";

const INITIAL_PROFILE = {
  name: "Arjun Kumar",
  shopName: "AK Stone Building Materials",
  email: "arjun@akstone.in",
  phone: "9876543210",
  alternatePhone: "9123456780",
  address: "Plot 18, Quarry Link Road, Hoskote Industrial Area",
  pincode: "562114",
  city: "Bengaluru",
  state: "Karnataka",
};
const requiredFields = [
  { key: "name", label: "Full Name" },
  { key: "shopName", label: "Shop Name" },
  { key: "phone", label: "Phone Number" },
  { key: "address", label: "Address" },
  { key: "pincode", label: "Pincode" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
];

const allProfileFields = [
  "name",
  "shopName",
  "email",
  "phone",
  "alternatePhone",
  "address",
  "pincode",
  "city",
  "state",
];


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

  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draft, setDraft] = useState(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);
  const [focused, setFocused] = useState(null);
  const [saved, setSaved] = useState(false);
  const [activeNav, setActiveNav] = useState("Profile");
  const closeValidationPopup = () => {
    const fieldToFocus = validationPopup.field;
  
    setValidationPopup({
      visible: false,
      field: "",
      message: "",
    });
  
    if (fieldToFocus) {
      setFocused(fieldToFocus);
  
      window.setTimeout(() => {
        const fieldElement = document.querySelector(
          `[data-profile-field="${fieldToFocus}"]`
        );
  
        if (fieldElement) {
          fieldElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
  
          fieldElement.focus();
        }
      }, 150);
    }
  };
  const [validationPopup, setValidationPopup] = useState({
    visible: false,
    field: "",
    message: "",
  });

  const shown = editing ? draft : profile;
  

const requiredFields = [
  { key: "name", label: "Full Name" },
  { key: "shopName", label: "Shop Name" },
  { key: "phone", label: "Phone Number" },
  { key: "address", label: "Address" },
  { key: "pincode", label: "Pincode" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
];

const allProfileFields = [
  "name",
  "shopName",
  "email",
  "phone",
  "alternatePhone",
  "address",
  "pincode",
  "city",
  "state",
];

const completedFieldCount = allProfileFields.filter((field) => {
  const value = shown[field];

  return typeof value === "string" && value.trim() !== "";
}).length;

const profileCompletion = Math.round(
  (completedFieldCount / allProfileFields.length) * 100
);
  const initials = shown.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

    const changeField = (field, value) => {
      let cleanedValue = value;
    
      // Phone fields: numeric only, maximum 10 digits
      if (field === "phone" || field === "alternatePhone") {
        cleanedValue = value.replace(/\D/g, "").slice(0, 10);
      }
    
      // Pincode: numeric only, maximum 6 digits
      if (field === "pincode") {
        cleanedValue = value.replace(/\D/g, "").slice(0, 6);
      }
    
      // Name and shop name: alphabets and spaces only
      if (field === "name" || field === "shopName") {
        cleanedValue = value
          .replace(/[^a-zA-Z ]/g, "")
          .replace(/\s{2,}/g, " ");
      }
    
      // City and state: alphabets and spaces only
      if (field === "city" || field === "state") {
        cleanedValue = value
          .replace(/[^a-zA-Z ]/g, "")
          .replace(/\s{2,}/g, " ");
      }
    
      setDraft((current) => ({
        ...current,
        [field]: cleanedValue,
      }));
    };

  const beginEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setEditing(false);
    setFocused(null);
  };

  const saveChanges = () => {
    const firstEmptyRequiredField = requiredFields.find(({ key }) => {
      const value = draft[key];
  
      return typeof value !== "string" || value.trim() === "";
    });
  
    if (firstEmptyRequiredField) {
      setValidationPopup({
        visible: true,
        field: firstEmptyRequiredField.key,
        message: `${firstEmptyRequiredField.label} cannot be blank.`,
      });
  
      return;
    }
  
    if (!/^[A-Za-z ]+$/.test(draft.name.trim())) {
      setValidationPopup({
        visible: true,
        field: "name",
        message: "Full Name can contain alphabets only.",
      });
  
      return;
    }
  
    if (!/^[A-Za-z ]+$/.test(draft.shopName.trim())) {
      setValidationPopup({
        visible: true,
        field: "shopName",
        message: "Shop Name can contain alphabets only.",
      });
  
      return;
    }
  
    if (!/^\d{10}$/.test(draft.phone)) {
      setValidationPopup({
        visible: true,
        field: "phone",
        message: "Phone Number must contain exactly 10 digits.",
      });
  
      return;
    }
  
    if (
      draft.alternatePhone.trim() !== "" &&
      !/^\d{10}$/.test(draft.alternatePhone)
    ) {
      setValidationPopup({
        visible: true,
        field: "alternatePhone",
        message: "Alternate Phone must contain exactly 10 digits.",
      });
  
      return;
    }
  
    if (!/^\d{6}$/.test(draft.pincode)) {
      setValidationPopup({
        visible: true,
        field: "pincode",
        message: "Pincode must contain exactly 6 digits.",
      });
  
      return;
    }
  
    const cleanedProfile = {
      name: draft.name.trim(),
      shopName: draft.shopName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      alternatePhone: draft.alternatePhone.trim(),
      address: draft.address.trim(),
      pincode: draft.pincode.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
    };
  
    setProfile(cleanedProfile);
    setDraft(cleanedProfile);
    setEditing(false);
    setFocused(null);
    setSaved(true);
  
    window.setTimeout(() => {
      setSaved(false);
    }, 2200);
  };

  return (
    <div style={styles.page}>
      <style>{globalCss}</style>

      <main style={styles.phone}>
        <header style={styles.hero}>
          <div style={styles.heroGlow} />
          <div style={styles.heroGrid} />

          
           <div style={styles.topRow}>
  <button
    type="button"
    style={{
      ...styles.circleButton,
      ...styles.backCircleButton,
    }}
    onClick={() => window.history.back()}
    aria-label="Go back"
  >
    <span style={styles.backArrow}>‹</span>
  </button>

  <div style={styles.brandPill}>
    <span>🪨</span>
    <b>StoneRate</b>
  </div>

  <button
    type="button"
    style={{
      ...styles.circleButton,
      ...styles.notificationButton,
    }}
    aria-label="Notifications"
  >
    <span style={styles.bellIcon}>🔔</span>
    <span style={styles.notificationDot} />
  </button>
</div>

        </header>

        <section style={styles.profileSurface}>
          <div style={styles.avatarWrap}>
            <div style={styles.avatarRing}>
              <div style={styles.avatar}>{initials || "BP"}</div>
            </div>

            <button type="button" style={styles.cameraButton} aria-label="Change profile picture">
              ◉
            </button>
          </div>

          <div style={styles.identityBlock}>
            <div style={styles.nameLine}>
              <h1 style={styles.name}>{shown.name}</h1>
              <span style={styles.verifiedIcon}>✓</span>
            </div>
            <p style={styles.email}>{shown.email}</p>
            <p style={styles.shop}>{shown.shopName}</p>
          </div>

          <div style={styles.profileCompletion}>
          <div style={styles.completionTop}>
  <span>PROFILE COMPLETION</span>
  <b>{profileCompletion}%</b>
</div>

<div style={styles.progressTrack}>
  <div
    style={{
      ...styles.progressFill,
      width: `${profileCompletion}%`,
    }}
  />
</div>
          </div>

          <div className="profile-content-scroll" style={styles.contentScroll}>
            <section style={styles.detailCard}>
              <ProfileRow
                styles={styles}
                icon="👤"
                label="Full Name"
                field="name"
                value={shown.name}
                editing={editing}
                focused={focused}
                setFocused={setFocused}
                onChange={changeField}
              />

              <ProfileRow
                styles={styles}
                icon="◆"
                label="Shop Name"
                field="shopName"
                value={shown.shopName}
                editing={editing}
                focused={focused}
                setFocused={setFocused}
                onChange={changeField}
              />

              <ProfileRow
                styles={styles}
                icon="✉"
                label="Mail ID"
                field="email"
                type="email"
                value={shown.email}
                editing={editing}
                focused={focused}
                setFocused={setFocused}
                onChange={changeField}
              />
            </section>

            <section style={styles.detailCard}>
            <ProfileRow
  styles={styles}
  icon="☎"
  label="Phone Number"
  field="phone"
  value={shown.phone}
  editing={editing}
  focused={focused}
  setFocused={setFocused}
  onChange={changeField}
  verified
  prefix="+91"
  inputMode="numeric"
  maxLength={10}
/>

<ProfileRow
  styles={styles}
  icon="☏"
  label="Alternate Phone (Optional)"
  field="alternatePhone"
  value={shown.alternatePhone}
  editing={editing}
  focused={focused}
  setFocused={setFocused}
  onChange={changeField}
  prefix="+91"
  inputMode="numeric"
  maxLength={10}
/>
            </section>

            <section style={styles.addressCard}>
              <div style={styles.addressHeading}>
                <div style={styles.addressHeadingIcon}>⌖</div>
                <div>
                  <p style={styles.addressKicker}>DELIVERY LOCATION</p>
                  <h2 style={styles.addressTitle}>Business Address</h2>
                </div>
                <span style={styles.defaultPill}>Default</span>
              </div>

              <ProfileRow
                styles={styles}
                icon="⌂"
                label="Address"
                field="address"
                value={shown.address}
                editing={editing}
                focused={focused}
                setFocused={setFocused}
                onChange={changeField}
                multiline
              />

              <div style={styles.twoColumns}>
              <ProfileRow
  styles={styles}
  icon="#"
  label="Pincode"
  field="pincode"
  value={shown.pincode}
  editing={editing}
  focused={focused}
  setFocused={setFocused}
  onChange={changeField}
  compact
  inputMode="numeric"
  maxLength={6}
/>
                <ProfileRow
                  styles={styles}
                  icon="⌾"
                  label="City"
                  field="city"
                  value={shown.city}
                  editing={editing}
                  focused={focused}
                  setFocused={setFocused}
                  onChange={changeField}
                  compact
                />
              </div>

              <ProfileRow
                styles={styles}
                icon="◇"
                label="State"
                field="state"
                value={shown.state}
                editing={editing}
                focused={focused}
                setFocused={setFocused}
                onChange={changeField}
              />
            </section>

            <div style={styles.securityNote}>
              <div style={styles.securityIcon}>🛡</div>
              <div>
                <b>Your information is protected</b>
                <p>Details are used only for rate enquiries and order delivery.</p>
              </div>
            </div>

            {!editing ? (
              <button type="button" style={styles.primaryButton} onClick={beginEdit}>
                <span>✎</span>
                Edit Profile
              </button>
            ) : (
              <div style={styles.editButtons}>
                <button type="button" style={styles.cancelButton} onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="button" style={styles.primaryButton} onClick={saveChanges}>
                  <span>✓</span>
                  Save Profile
                </button>
              </div>
            )}

            <div style={styles.bottomSpace} />
          </div>
        </section>

        <nav style={styles.bottomNav}>
          {[
            { name: "Home", icon: "⌂" },
            { name: "Orders", icon: "▣" },
            { name: "Profile", icon: "●" },
          ].map((item) => {
            const active = activeNav === item.name;

            return (
              <button
                type="button"
                key={item.name}
                onClick={() => setActiveNav(item.name)}
                style={{
                  ...styles.navButton,
                  ...(active ? styles.navButtonActive : {}),
                }}
              >
                {active && <span style={styles.activeMarker} />}
                <span
                  style={{
                    ...styles.navIcon,
                    ...(active ? styles.navIconActive : {}),
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    ...styles.navText,
                    ...(active ? styles.navTextActive : {}),
                  }}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        {saved && (
          <div style={styles.toast}>
            <span>✓</span>
            Profile updated successfully
          </div>
        )}
        {validationPopup.visible && (
  <div style={styles.validationOverlay}>
    <div style={styles.validationPopup}>
      <div style={styles.validationGlow} />

      <div style={styles.warningCircle}>!</div>

      <p style={styles.validationKicker}>REQUIRED INFORMATION</p>

      <h2 style={styles.validationTitle}>
        Complete Your Profile
      </h2>

      <p style={styles.validationMessage}>
        {validationPopup.message}
      </p>

      <div style={styles.validationHint}>
        <span style={styles.validationHintIcon}>✎</span>

        <span>
          Please enter this information before saving your profile.
        </span>
      </div>

      <button
        type="button"
        style={styles.validationButton}
        onClick={closeValidationPopup}
      >
        Fill Required Field
      </button>
    </div>
  </div>
)}
      </main>
    </div>
  );
}

function ProfileRow({
  styles,
  icon,
  label,
  field,
  value,
  editing,
  focused,
  setFocused,
  onChange,
  type = "text",
  multiline = false,
  compact = false,
  verified = false,
  prefix = "",
  inputMode,
  maxLength,
}) {
  const isFocused = focused === field;

  return (
    <div
      style={{
        ...styles.profileRow,
        ...(compact ? styles.profileRowCompact : {}),
        ...(isFocused ? styles.profileRowFocused : {}),
      }}
    >
      <div style={styles.rowIcon}>{icon}</div>

      <div style={styles.rowContent}>
        <span style={styles.rowLabel}>{label}</span>

        {editing ? (
          multiline ? (
            
<textarea
  data-profile-field={field}
  rows={2}
  value={value}
  onChange={(event) => onChange(field, event.target.value)}
  onFocus={() => setFocused(field)}
  onBlur={() => setFocused(null)}
  style={styles.rowTextarea}
/>

          ) : (
            
<div style={styles.inputValueWrap}>
  {prefix && <span style={styles.fixedPrefix}>{prefix}</span>}

  <input
    data-profile-field={field}
    type={type}
    value={value}
    inputMode={inputMode}
    maxLength={maxLength}
    onChange={(event) => onChange(field, event.target.value)}
    onFocus={() => setFocused(field)}
    onBlur={() => setFocused(null)}
    style={styles.rowInput}
  />
</div>

          )
        ) : (
          <b
  style={{
    ...styles.rowValue,
    ...(compact ? styles.rowValueCompact : {}),
  }}
>
  {prefix ? `${prefix} ${value}` : value}
</b>
        )}
      </div>

      {verified ? (
        <span style={styles.rowVerified}>✓</span>
      ) : !editing ? (
        <span style={styles.rowArrow}>›</span>
      ) : (
        <span style={styles.editMark}>✎</span>
      )}
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
  const ms = (value, factor = 0.55) =>
    Math.round(value + (value * scale - value) * factor);
  const tiny = appW <= 230;
  const navHeight = ms(63);
  const heroHeight = ms(127);


  return {
    page: {
      width: "100vw",
      height: "100dvh",
      minHeight: "100dvh",
      display: "flex",
      justifyContent: "center",
      alignItems: isDesktop ? "center" : "stretch",
      padding: isDesktop ? 10 : 0,
      margin: 0,
      overflow: "hidden",
      background:
        "radial-gradient(circle at 50% 0%, rgba(245,158,11,.18), transparent 35%), #17110d",
      fontFamily: "Arial, sans-serif",
    },
    phone: {
      position: "relative",
      width: isDesktop ? 390 : "100vw",
      height: isDesktop ? 844 : "100dvh",
      overflow: "hidden",
      background: "#f7f4ef",
      borderRadius: isDesktop ? 30 : 0,
      boxShadow: isDesktop ? "0 28px 80px rgba(0,0,0,.34)" : "none",
    },
    hero: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      zIndex: 2,
      height: heroHeight,
      padding: `${ms(3)}px ${ms(tiny ? 10 : 14)}px`,
      overflow: "hidden",
      color: "white",
    
      backgroundImage: PROFILE_BG_IMAGE
        ? `linear-gradient(
            135deg,
            rgba(2, 6, 23, 0.25),
            rgba(28, 25, 23, 0.18) 55%,
            rgba(146, 64, 14, 0.10)
          ),
          url("${PROFILE_BG_IMAGE}")`
        : `radial-gradient(
            circle at 86% 8%,
            rgba(251, 191, 36, 0.34),
            transparent 30%
          ),
          radial-gradient(
            circle at 8% 95%,
            rgba(249, 115, 22, 0.18),
            transparent 34%
          ),
          linear-gradient(
            145deg,
            #020617 0%,
            #1c1917 54%,
            #92400e 100%
          )`,
    
      backgroundSize: "cover",
      backgroundPosition: "center top",
      backgroundRepeat: "no-repeat",
    },
    validationOverlay: {
      position: "absolute",
      inset: 0,
      zIndex: 200,
    
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    
      padding: ms(18),
    
      background: "rgba(2, 6, 23, 0.72)",
      backdropFilter: "blur(9px)",
    },
    
    validationPopup: {
      position: "relative",
    
      width: "100%",
      maxWidth: ms(280),
    
      overflow: "hidden",
    
      padding: `${ms(24)}px ${ms(17)}px ${ms(17)}px`,
    
      border: "1px solid rgba(245,158,11,.28)",
      borderRadius: ms(25),
    
      background:
        "linear-gradient(145deg, rgba(255,255,255,.99), rgba(255,251,235,.98))",
    
      textAlign: "center",
    
      boxShadow:
        "0 30px 80px rgba(0,0,0,.38), 0 0 45px rgba(245,158,11,.14)",
    },
    
    validationGlow: {
      position: "absolute",
    
      left: "50%",
      top: ms(-60),
    
      width: ms(170),
      height: ms(125),
    
      borderRadius: "50%",
    
      background: "rgba(245,158,11,.22)",
      filter: `blur(${ms(28)}px)`,
    
      transform: "translateX(-50%)",
      pointerEvents: "none",
    },
    
    warningCircle: {
      position: "relative",
      zIndex: 2,
    
      width: ms(59),
      height: ms(59),
    
      margin: "0 auto",
    
      display: "grid",
      placeItems: "center",
    
      border: `${ms(5)}px solid #fef3c7`,
      borderRadius: "50%",
    
      background:
        "linear-gradient(145deg, #f59e0b, #ea580c)",
    
      color: "white",
    
      fontSize: ms(27),
      fontWeight: 950,
    
      boxShadow:
        "0 14px 28px rgba(234,88,12,.27), 0 0 0 7px rgba(245,158,11,.08)",
    },
    
    validationKicker: {
      position: "relative",
      zIndex: 2,
    
      margin: `${ms(15)}px 0 0`,
    
      color: "#b45309",
    
      fontSize: ms(6.8),
      letterSpacing: ms(1.1),
      fontWeight: 950,
    },
    
    validationTitle: {
      position: "relative",
      zIndex: 2,
    
      margin: `${ms(5)}px 0 0`,
    
      color: "#1c1917",
    
      fontSize: ms(18),
      lineHeight: 1.08,
      fontWeight: 950,
      letterSpacing: -0.35,
    },
    
    validationMessage: {
      position: "relative",
      zIndex: 2,
    
      margin: `${ms(9)}px auto 0`,
    
      color: "#92400e",
    
      fontSize: ms(9.2),
      lineHeight: 1.4,
      fontWeight: 900,
    },
    
    validationHint: {
      position: "relative",
      zIndex: 2,
    
      display: "flex",
      alignItems: "center",
    
      gap: ms(7),
    
      marginTop: ms(13),
      padding: ms(9),
    
      border: "1px solid #fde68a",
      borderRadius: ms(14),
    
      background: "#fffbeb",
    
      color: "#78716c",
    
      textAlign: "left",
    
      fontSize: ms(7.6),
      lineHeight: 1.35,
      fontWeight: 750,
    },
    
    validationHintIcon: {
      width: ms(27),
      height: ms(27),
    
      display: "grid",
      placeItems: "center",
    
      flexShrink: 0,
    
      borderRadius: ms(10),
    
      background: "#1c1917",
      color: "#fbbf24",
    
      fontSize: ms(12),
      fontWeight: 950,
    },
    
    validationButton: {
      position: "relative",
      zIndex: 2,
    
      width: "100%",
      minHeight: ms(45),
    
      marginTop: ms(15),
    
      border: 0,
      borderRadius: ms(17),
    
      background:
        "linear-gradient(135deg, #020617, #92400e)",
    
      color: "white",
    
      fontSize: ms(9.7),
      fontWeight: 950,
    
      boxShadow:
        "0 13px 27px rgba(146,64,14,.25)",
    
      cursor: "pointer",
    },

    heroGlow: {
      position: "absolute",
      right: ms(-45),
      top: ms(-65),
      width: ms(170),
      height: ms(170),
      borderRadius: "50%",
      background: "rgba(245,158,11,.20)",
      filter: `blur(${ms(30)}px)`,
    },
    heroGrid: {
      position: "absolute",
      inset: 0,
      opacity: .25,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
      backgroundSize: `${ms(30)}px ${ms(30)}px`,
      pointerEvents: "none",
    },
    topRow: {
      position: "relative",
      zIndex: 5,
    
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
    
      width: `calc(100% + ${ms(10)}px)`,
      marginLeft: ms(-5),
    
      transform: `translateY(${ms(-3)}px)`,
    },
    circleButton: {
      position: "relative",
    
      width: ms(34),
      height: ms(34),
    
      display: "grid",
      placeItems: "center",
    
      padding: 0,
    
      border: "1px solid rgba(255,255,255,.22)",
      borderRadius: ms(12),
    
      background: "rgba(28,25,23,.52)",
      color: "white",
      
      boxShadow:
        "0 8px 18px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.15)",
    
      backdropFilter: "blur(12px)",
      cursor: "pointer",
    },
    backCircleButton: {
      justifySelf: "start",
      transform: `translateX(${ms(-6)}px)`,
    },
    
    notificationButton: {
      justifySelf: "end",
      transform: `translateX(${ms(5)}px)`,
    },
    notificationDot: {
      position: "absolute",
      right: ms(7),
      top: ms(7),
      width: ms(6),
      height: ms(6),
      border: "1px solid #1c1917",
      borderRadius: "50%",
      background: "#f59e0b",
    },
    brandPill: {
      position: "relative",
      zIndex: 5,
    
      display: "flex",
      alignItems: "center",
      gap: ms(5),
    
      padding: `${ms(6)}px ${ms(11)}px`,
    
      border: "1px solid rgba(251,191,36,.55)",
      borderRadius: 999,
    
      background:
        "linear-gradient(145deg, rgba(2,6,23,.92), rgba(28,25,23,.88))",
    
      color: "#fde68a",
    
      fontSize: ms(7.8),
      fontWeight: 950,
    
      boxShadow:
        "0 8px 20px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.12)",
    
      backdropFilter: "blur(12px)",
    
      transform: `translateY(${ms(-4)}px)`,
    },
    profileSurface: {
      position: "absolute",
      left: 0,
      right: 0,
      top: ms(70),
      bottom: navHeight,
      zIndex: 5,
      borderRadius: `${ms(34)}px ${ms(34)}px 0 0`,
      background:
        "radial-gradient(circle at 90% 2%, rgba(245,158,11,.08), transparent 24%), linear-gradient(180deg, #fff 0%, #f8f5f0 55%, #efeae3 100%)",
      boxShadow: "0 -12px 35px rgba(0,0,0,.18)",
    },
    avatarWrap: {
      position: "absolute",
      left: "50%",
      top: ms(-42),
      width: ms(88),
      height: ms(88),
      transform: "translateX(-50%)",
    },
    avatarRing: {
      width: "100%",
      height: "100%",
      padding: ms(4),
      borderRadius: "50%",
    
      background:
        "linear-gradient(145deg, #fde68a, #f59e0b 45%, #ea580c 75%, #92400e)",
    
      boxShadow:
        "0 14px 30px rgba(28,25,23,.24), " +
        "0 0 0 3px rgba(255,255,255,.85), " +
        "0 0 14px rgba(245,158,11,.80), " +
        "0 0 28px rgba(234,88,12,.52), " +
        "0 0 48px rgba(146,64,14,.28)",
    
      animation: "profileGlow 2.4s ease-in-out infinite",
    },
    avatar: {
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      background:
        "radial-gradient(circle at 35% 25%, rgba(255,255,255,.27), transparent 25%), linear-gradient(145deg, #f59e0b, #92400e)",
      color: "white",
      fontSize: ms(24),
      fontWeight: 950,
      letterSpacing: ms(1),
    },
    cameraButton: {
      position: "absolute",
      right: ms(-2),
      bottom: ms(4),
      width: ms(29),
      height: ms(29),
      display: "grid",
      placeItems: "center",
      padding: 0,
      border: `${ms(3)}px solid white`,
      borderRadius: "50%",
      background: "linear-gradient(145deg, #1c1917, #44403c)",
      color: "#fbbf24",
      fontSize: ms(13),
      boxShadow: "0 7px 15px rgba(0,0,0,.20)",
      cursor: "pointer",
    },
    identityBlock: {
      padding: `${ms(52)}px ${ms(14)}px 0`,
      textAlign: "center",
    },
    nameLine: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(5),
    },
    name: {
      maxWidth: "78%",
      margin: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: "#1c1917",
      fontSize: ms(tiny ? 17 : 20),
      fontWeight: 950,
      letterSpacing: -.35,
    },
    verifiedIcon: {
      width: ms(18),
      height: ms(18),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: "50%",
      background: "#f59e0b",
      color: "white",
      fontSize: ms(8),
      fontWeight: 950,
      boxShadow: "0 5px 12px rgba(245,158,11,.25)",
    },
    email: {
      margin: `${ms(4)}px 0 0`,
      color: "#8a817b",
      fontSize: ms(7.7),
      fontWeight: 750,
    },
    shop: {
      maxWidth: "85%",
      margin: `${ms(4)}px auto 0`,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      color: "#92400e",
      fontSize: ms(7.4),
      fontWeight: 900,
    },
    profileCompletion: {
      width: `calc(100% - ${ms(26)}px)`,
      margin: `${ms(10)}px auto 0`,
      padding: ms(9),
      border: "1px solid rgba(245,158,11,.16)",
      borderRadius: ms(15),
      background: "linear-gradient(145deg, #fffdf8, #fff7e7)",
      boxShadow: "0 8px 20px rgba(146,64,14,.06)",
    },
    completionTop: {
      display: "flex",
      justifyContent: "space-between",
      color: "#92400e",
      fontSize: ms(6.3),
      letterSpacing: ms(.7),
      fontWeight: 950,
    },
    progressTrack: {
      height: ms(5),
      marginTop: ms(6),
      overflow: "hidden",
      borderRadius: 999,
      background: "#fde7bd",
    },
    progressFill: {
      height: "100%",
      minWidth: 0,
      borderRadius: 999,
      background: "linear-gradient(90deg, #f59e0b, #ea580c)",
      boxShadow: "0 0 12px rgba(245,158,11,.32)",
      transition: "width 320ms ease",
    },
    contentScroll: {
      position: "absolute",
      left: 0,
      right: 0,
      top: ms(142),
      bottom: 0,
      overflowY: "auto",
      overflowX: "hidden",
      padding: `${ms(9)}px ${ms(tiny ? 9 : 13)}px ${ms(16)}px`,
      scrollbarWidth: "none",
      WebkitOverflowScrolling: "touch",
    },
    detailCard: {
      overflow: "hidden",
      marginTop: ms(10),
      border: "1px solid #eeeae4",
      borderRadius: ms(20),
      background: "rgba(255,255,255,.96)",
      boxShadow: "0 13px 28px rgba(28,25,23,.07)",
    },
    addressCard: {
      marginTop: ms(10),
      padding: ms(10),
      border: "1px solid rgba(245,158,11,.16)",
      borderRadius: ms(20),
      background:
        "radial-gradient(circle at 100% 0%, rgba(245,158,11,.08), transparent 30%), rgba(255,255,255,.97)",
      boxShadow: "0 13px 28px rgba(28,25,23,.07)",
    },
    addressHeading: {
      display: "flex",
      alignItems: "center",
      gap: ms(8),
      marginBottom: ms(7),
    },
    addressHeadingIcon: {
      width: ms(33),
      height: ms(33),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: ms(12),
      background: "linear-gradient(145deg, #fef3c7, #fde68a)",
      color: "#92400e",
      fontSize: ms(16),
      fontWeight: 950,
    },
    addressKicker: {
      margin: 0,
      color: "#b45309",
      fontSize: ms(5.8),
      letterSpacing: ms(.8),
      fontWeight: 950,
    },
    addressTitle: {
      margin: `${ms(2)}px 0 0`,
      color: "#1c1917",
      fontSize: ms(10),
      fontWeight: 950,
    },
    defaultPill: {
      marginLeft: "auto",
      padding: `${ms(4)}px ${ms(7)}px`,
      borderRadius: 999,
      background: "#fffbeb",
      color: "#92400e",
      fontSize: ms(6.4),
      fontWeight: 950,
    },
    profileRow: {
      minWidth: 0,
      minHeight: ms(50),
      display: "flex",
      alignItems: "center",
      gap: ms(8),
      padding: `${ms(8)}px ${ms(9)}px`,
      borderBottom: "1px solid #eeeae4",
      background: "transparent",
      transition: "all 180ms ease",
    },
    profileRowCompact: {
      minWidth: 0,
      minHeight: ms(55),
      padding: `${ms(7)}px ${ms(6)}px`,
      gap: ms(5),
      border: "1px solid #eeeae4",
      borderRadius: ms(14),
      background: "#fffdf9",
    },
    
    profileRowFocused: {
      borderColor: "rgba(245,158,11,.55)",
      background: "#fffbeb",
      boxShadow: "inset 0 0 0 2px rgba(245,158,11,.08)",
    },
    rowIcon: {
      width: ms(32),
      height: ms(32),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: ms(11),
      background: "linear-gradient(145deg, #fff7df, #fef3c7)",
      color: "#b45309",
      fontSize: ms(14),
      fontWeight: 950,
    },
    rowContent: {
      minWidth: 0,
      flex: 1,
    },
    rowLabel: {
      display: "block",
      color: "#8a817b",
      fontSize: ms(6.6),
      fontWeight: 800,
    },
    rowValue: {
      display: "block",
      marginTop: ms(3),
      overflowWrap: "anywhere",
      color: "#292524",
      fontSize: ms(8.4),
      lineHeight: 1.22,
      fontWeight: 900,
    },
    rowInput: {
      width: "100%",
      minWidth: 0,
      marginTop: ms(3),
      padding: 0,
      border: 0,
      outline: 0,
      background: "transparent",
      color: "#292524",
      fontSize: ms(8.4),
      fontWeight: 900,
    },
    rowTextarea: {
      width: "100%",
      minWidth: 0,
      marginTop: ms(3),
      padding: 0,
      resize: "none",
      border: 0,
      outline: 0,
      background: "transparent",
      color: "#292524",
      fontSize: ms(8.2),
      lineHeight: 1.3,
      fontWeight: 850,
    },
    rowArrow: {
      color: "#b8afa7",
      fontSize: ms(20),
      lineHeight: 1,
    },
    rowVerified: {
      width: ms(22),
      height: ms(22),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: "50%",
      background: "#22c55e",
      color: "white",
      fontSize: ms(9),
      fontWeight: 950,
    },
    editMark: {
      color: "#f59e0b",
      fontSize: ms(12),
      fontWeight: 950,
    },
    twoColumns: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      alignItems: "stretch",
      gap: ms(7),
      margin: `${ms(6)}px 0`,
    },
    
    securityNote: {
      display: "flex",
      alignItems: "center",
      gap: ms(9),
      marginTop: ms(10),
      padding: ms(10),
      border: "1px solid #fde68a",
      borderRadius: ms(18),
      background: "#fffbeb",
      color: "#78350f",
      fontSize: ms(7.2),
    },
    securityIcon: {
      width: ms(34),
      height: ms(34),
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      borderRadius: ms(13),
      background: "linear-gradient(145deg, #1c1917, #44403c)",
      color: "#fbbf24",
      fontSize: ms(16),
    },
    primaryButton: {
      width: "100%",
      minHeight: ms(49),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(6),
      marginTop: ms(12),
      border: 0,
      borderRadius: ms(22),
      background: "linear-gradient(135deg, #020617, #92400e)",
      color: "white",
      fontSize: ms(10),
      fontWeight: 950,
      boxShadow: "0 15px 31px rgba(146,64,14,.25)",
      cursor: "pointer",
    },
    editButtons: {
      display: "grid",
      gridTemplateColumns: ".8fr 1.45fr",
      gap: ms(8),
    },
    cancelButton: {
      minHeight: ms(49),
      marginTop: ms(12),
      border: "1px solid #e7e5e4",
      borderRadius: ms(22),
      background: "white",
      color: "#57534e",
      fontSize: ms(9),
      fontWeight: 900,
      cursor: "pointer",
    },
    bottomSpace: {
      height: ms(10),
    },
    bottomNav: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
      height: navHeight,
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      padding: `${ms(5)}px ${ms(8)}px calc(env(safe-area-inset-bottom, 0px) + ${ms(5)}px)`,
      borderTop: "1px solid rgba(251,191,36,.20)",
      background:
        "radial-gradient(circle at 50% 0%, rgba(245,158,11,.16), transparent 46%), linear-gradient(135deg, #21140d 0%, #352013 52%, #4b250d 100%)",
      boxShadow: "0 -14px 34px rgba(28,15,7,.30)",
    },
    navButton: {
      position: "relative",
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: ms(3),
      padding: ms(3),
      border: 0,
      borderRadius: ms(15),
      background: "transparent",
      cursor: "pointer",
    },
    navButtonActive: {
      background:
        "linear-gradient(145deg, rgba(245,158,11,.22), rgba(234,88,12,.10))",
      boxShadow: "inset 0 0 0 1px rgba(251,191,36,.24)",
    },
    activeMarker: {
      position: "absolute",
      top: ms(-5),
      left: "50%",
      width: ms(25),
      height: ms(3),
      borderRadius: 999,
      background: "linear-gradient(90deg,#fbbf24,#f97316)",
      boxShadow: "0 0 12px rgba(245,158,11,.70)",
      transform: "translateX(-50%)",
    },
    navIcon: {
      width: ms(28),
      height: ms(26),
      display: "grid",
      placeItems: "center",
      border: "1px solid rgba(255,255,255,.07)",
      borderRadius: ms(9),
      background: "rgba(255,255,255,.06)",
      color: "#d6c3b5",
      fontSize: ms(15),
      fontWeight: 900,
    },
    navIconActive: {
      borderColor: "rgba(251,191,36,.35)",
      background: "linear-gradient(145deg,#f59e0b,#ea580c)",
      color: "white",
      boxShadow: "0 8px 17px rgba(234,88,12,.30)",
    },
    navText: {
      color: "#c4afa0",
      fontSize: ms(7.1),
      fontWeight: 800,
    },
    navTextActive: {
      color: "#fbbf24",
      fontWeight: 950,
    },
    toast: {
      position: "absolute",
      left: "50%",
      bottom: navHeight + ms(12),
      zIndex: 80,
      display: "flex",
      alignItems: "center",
      gap: ms(7),
      padding: `${ms(9)}px ${ms(13)}px`,
      border: "1px solid #bbf7d0",
      borderRadius: 999,
      background: "rgba(240,253,244,.98)",
      color: "#166534",
      fontSize: ms(8),
      fontWeight: 950,
      boxShadow: "0 14px 30px rgba(0,0,0,.18)",
      transform: "translateX(-50%)",
      whiteSpace: "nowrap",
    },
  };
}

const globalCss = `
* { box-sizing: border-box; }
html, body, #root {
  margin: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background: #17110d;
}
@keyframes profileGlow {
  0%,
  100% {
    box-shadow:
      0 14px 30px rgba(28,25,23,.24),
      0 0 0 3px rgba(255,255,255,.85),
      0 0 14px rgba(245,158,11,.65),
      0 0 27px rgba(234,88,12,.42),
      0 0 42px rgba(146,64,14,.22);
  }

  50% {
    box-shadow:
      0 17px 34px rgba(28,25,23,.28),
      0 0 0 3px rgba(255,255,255,.95),
      0 0 19px rgba(251,191,36,.92),
      0 0 36px rgba(234,88,12,.64),
      0 0 57px rgba(146,64,14,.34);
  }
}
button, input, textarea { font: inherit; }
.profile-content-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.profile-content-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
body { -webkit-text-size-adjust: 100%; }
`;









































signup
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const StylesContext = createContext(null);

function useAppStyles() {
  return useContext(StylesContext);
}

const EMPTY_FORM = {
  name: "",
  shopName: "",
  contactNumber: "",
  alternateContactNumber: "",
  aadhaarNumber: "",
  address: "",
  transporterAgencyName: "",
  plantName: "",
  plantAddress: "",
};

export default function SignupRoleCardsSlideFormPageWithValidation() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedProduction, setSelectedProduction] = useState("");

  const [hoveredRole, setHoveredRole] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredFrequency, setHoveredFrequency] = useState(null);
  const [hoveredProduction, setHoveredProduction] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const viewport = useViewport();

  const styles = useMemo(
    () => createStyles(viewport, selectedRole),
    [viewport.width, viewport.height, selectedRole]
  );

  const productCategories = [
    "20mm Crushed Stone",
    "40mm Crushed Stone",
    "GSB",
    "M-Sand",
    "Stone Dust",
  ];

  const truckFrequencyOptions = ["1-5", "5-10", "10-20", "More than 20"];

  const productionOptions = [
    "10-20 ton",
    "20-40 ton",
    "40-60 ton",
    "More than 60 ton",
  ];

  /*
   * IMPORTANT FIX:
   * [field] updates the property passed to this function.
   *
   * For example:
   * updateField("name", "Shyam")
   *
   * updates formData.name.
   */
  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetFormByRole = (role) => {
    setSelectedRole(role);
    setSelectedCategories([]);
    setSelectedFrequency("");
    setSelectedProduction("");
    setFormData({ ...EMPTY_FORM });
  };

  const toggleCategory = (category) => {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  };

  const roleConfig = {
    buyer: {
      title: "Buyer Registration",
      kicker: "BUYER DETAILS",
      icon: "🛒",
      color: "#f59e0b",
      label: "Buyer",
      description: "I want to order crushed stone",
    },
    transporter: {
      title: "Transporter Registration",
      kicker: "TRANSPORTER DETAILS",
      icon: "🚚",
      color: "#38bdf8",
      label: "Transporter",
      description: "I manage trucks and transport",
    },
    seller: {
      title: "Seller Registration",
      kicker: "SELLER DETAILS",
      icon: "🏭",
      color: "#22c55e",
      label: "Seller",
      description: "I produce and sell materials",
    },
  };

  const activeRole = selectedRole ? roleConfig[selectedRole] : null;

  const isFormComplete = useMemo(() => {
    if (!selectedRole) return false;
    if (selectedCategories.length === 0) return false;

    const aadhaarValid = formData.aadhaarNumber.trim().length === 12;

    if (selectedRole === "buyer") {
      return Boolean(
        formData.name.trim() &&
          formData.shopName.trim() &&
          formData.contactNumber.trim() &&
          formData.alternateContactNumber.trim() &&
          aadhaarValid &&
          formData.address.trim()
      );
    }

    if (selectedRole === "transporter") {
      return Boolean(
        formData.name.trim() &&
          formData.transporterAgencyName.trim() &&
          aadhaarValid &&
          selectedFrequency &&
          formData.address.trim()
      );
    }

    if (selectedRole === "seller") {
      return Boolean(
        formData.name.trim() &&
          formData.plantName.trim() &&
          aadhaarValid &&
          selectedProduction &&
          formData.plantAddress.trim()
      );
    }

    return false;
  }, [
    selectedRole,
    selectedCategories,
    selectedFrequency,
    selectedProduction,
    formData,
  ]);

  const handleSubmit = () => {
    if (!isFormComplete) return;

    const submissionData = {
      role: selectedRole,
      categories: selectedCategories,
      truckFrequency:
        selectedRole === "transporter" ? selectedFrequency : "",
      dailyProduction:
        selectedRole === "seller" ? selectedProduction : "",
      ...formData,
    };

    console.log("Registration data:", submissionData);
  };

  return (
    <StylesContext.Provider value={styles}>
      <div style={styles.page}>
        <div style={styles.phone}>
          <section style={styles.hero}>
            <div style={styles.bgOrbOne} />
            <div style={styles.bgOrbTwo} />
            <div style={styles.bgOrbThree} />
            <div style={styles.gridOverlay} />

            <nav style={styles.nav}>
              <div style={styles.brandWrap}>
                <div style={styles.logo3d}>🪨</div>

                <div style={{ minWidth: 0 }}>
                  <p style={styles.brandName}>StoneRate</p>
                  <p style={styles.brandSub}>Create your account</p>
                </div>
              </div>

              <button type="button" style={styles.backBtn}>
                Back
              </button>
            </nav>

            <div style={styles.headerText}>
              <div style={styles.heroBadge}>SIGN UP</div>

              <h1 style={styles.title}>Who are you?</h1>

              <p style={styles.subtitle}>
                Choose your account type. The form will change based on your
                role.
              </p>
            </div>

            <div
              style={
                selectedRole ? styles.roleCardsRow : styles.roleCardsStack
              }
            >
              {Object.entries(roleConfig).map(([role, config]) => (
                <RoleCard
                  key={role}
                  compact={Boolean(selectedRole)}
                  label={config.label}
                  description={config.description}
                  icon={config.icon}
                  active={selectedRole === role}
                  hovered={hoveredRole === role}
                  color={config.color}
                  onClick={() => resetFormByRole(role)}
                  onMouseEnter={() => setHoveredRole(role)}
                  onMouseLeave={() => setHoveredRole(null)}
                />
              ))}
            </div>
          </section>

          {/*
           * The form section is a flex column.
           *
           * formScrollArea:
           *  - scrolls independently
           *
           * bottomPanel:
           *  - flexShrink: 0
           *  - always remains at the bottom
           */}
          <section style={styles.formSection}>
            <div style={styles.formScrollArea}>
              {selectedRole && activeRole && (
                <div style={styles.formCard}>
                  <div style={styles.formHeader}>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          ...styles.formKicker,
                          color: activeRole.color,
                        }}
                      >
                        {activeRole.kicker}
                      </p>

                      <h2 style={styles.formTitle}>{activeRole.title}</h2>
                    </div>

                    <div
                      style={{
                        ...styles.roleIconBadge,
                        background: activeRole.color,
                      }}
                    >
                      {activeRole.icon}
                    </div>
                  </div>

                  {selectedRole === "buyer" && (
                    <BuyerForm
                      formData={formData}
                      updateField={updateField}
                      productCategories={productCategories}
                      selectedCategories={selectedCategories}
                      toggleCategory={toggleCategory}
                      hoveredCategory={hoveredCategory}
                      setHoveredCategory={setHoveredCategory}
                    />
                  )}

                  {selectedRole === "transporter" && (
                    <TransporterForm
                      formData={formData}
                      updateField={updateField}
                      productCategories={productCategories}
                      selectedCategories={selectedCategories}
                      toggleCategory={toggleCategory}
                      truckFrequencyOptions={truckFrequencyOptions}
                      selectedFrequency={selectedFrequency}
                      setSelectedFrequency={setSelectedFrequency}
                      hoveredCategory={hoveredCategory}
                      setHoveredCategory={setHoveredCategory}
                      hoveredFrequency={hoveredFrequency}
                      setHoveredFrequency={setHoveredFrequency}
                    />
                  )}

                  {selectedRole === "seller" && (
                    <SellerForm
                      formData={formData}
                      updateField={updateField}
                      productCategories={productCategories}
                      selectedCategories={selectedCategories}
                      toggleCategory={toggleCategory}
                      productionOptions={productionOptions}
                      selectedProduction={selectedProduction}
                      setSelectedProduction={setSelectedProduction}
                      hoveredCategory={hoveredCategory}
                      setHoveredCategory={setHoveredCategory}
                      hoveredProduction={hoveredProduction}
                      setHoveredProduction={setHoveredProduction}
                    />
                  )}
                </div>
              )}
            </div>

            <div style={styles.bottomPanel}>
              <div style={styles.privacyNote}>
                <span style={styles.lockIcon}>🔒</span>

                <p style={styles.privacyText}>
                  Sensitive details should be verified and stored securely.
                </p>
              </div>

              <button
                type="button"
                disabled={!isFormComplete}
                onClick={handleSubmit}
                style={{
                  ...styles.submitBtn,
                  ...(isFormComplete
                    ? styles.submitBtnBright
                    : styles.submitBtnDisabled),
                }}
              >
                Create Account
              </button>

              <p style={styles.signInText}>
                Already have an account? <b>Sign In</b>
              </p>
            </div>
          </section>
        </div>
      </div>
    </StylesContext.Provider>
  );
}

function RoleCard({
  label,
  description,
  icon,
  active,
  hovered,
  color,
  onClick,
  onMouseEnter,
  onMouseLeave,
  compact,
}) {
  const styles = useAppStyles();

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        ...(compact ? styles.roleCardCompact : styles.roleCard),
        ...(active ? styles.roleCardActive : {}),
        borderColor: active ? color : "rgba(255,255,255,0.18)",
        transform: hovered
          ? compact
            ? "translateY(-4px) scale(1.04)"
            : "translateY(-7px) scale(1.025)"
          : active
          ? compact
            ? "translateY(-2px) scale(1.02)"
            : "translateY(-2px) scale(1.01)"
          : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 20px 42px ${color}44`
          : active
          ? `0 16px 34px ${color}33`
          : "0 12px 28px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          ...(compact ? styles.roleIconCompact : styles.roleIcon),
          background: active ? color : "rgba(255,255,255,0.16)",
        }}
      >
        {icon}
      </div>

      {compact ? (
        <span style={styles.roleLabelCompact}>{label}</span>
      ) : (
        <>
          <div style={styles.roleTextBlock}>
            <span style={styles.roleLabel}>{label}</span>
            <span style={styles.roleDescription}>{description}</span>
          </div>

          <div
            style={{
              ...styles.roleStatus,
              background: active ? color : "rgba(255,255,255,0.14)",
            }}
          >
            {active ? "✓" : "+"}
          </div>
        </>
      )}
    </button>
  );
}

function BuyerForm({
  formData,
  updateField,
  productCategories,
  selectedCategories,
  toggleCategory,
  hoveredCategory,
  setHoveredCategory,
}) {
  const styles = useAppStyles();

  return (
    <div style={styles.formFields}>
      <Input
        id="buyer-name"
        label="Name"
        value={formData.name}
        onChange={(value) => updateField("name", value)}
        placeholder="Enter full name"
        autoComplete="name"
      />

      <Input
        id="buyer-shop-name"
        label="Shop Name"
        value={formData.shopName}
        onChange={(value) => updateField("shopName", value)}
        placeholder="Enter shop/company name"
        autoComplete="organization"
      />

      <Input
        id="buyer-contact-number"
        label="Contact Number"
        value={formData.contactNumber}
        onChange={(value) =>
          updateField(
            "contactNumber",
            value.replace(/\D/g, "").slice(0, 10)
          )
        }
        placeholder="Enter mobile number"
        inputMode="numeric"
        maxLength={10}
        autoComplete="tel"
      />

      <Input
        id="buyer-alternate-contact"
        label="Alternate Contact Number"
        value={formData.alternateContactNumber}
        onChange={(value) =>
          updateField(
            "alternateContactNumber",
            value.replace(/\D/g, "").slice(0, 10)
          )
        }
        placeholder="Enter alternate mobile number"
        inputMode="numeric"
        maxLength={10}
        autoComplete="tel"
      />

      <Input
        id="buyer-aadhaar-number"
        label="Aadhaar Number"
        value={formData.aadhaarNumber}
        onChange={(value) =>
          updateField(
            "aadhaarNumber",
            value.replace(/\D/g, "").slice(0, 12)
          )
        }
        placeholder="Enter 12 digit Aadhaar number"
        inputMode="numeric"
        maxLength={12}
        autoComplete="off"
      />

      <CategorySelect
        title="Which category are you looking for?"
        productCategories={productCategories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        hoveredCategory={hoveredCategory}
        setHoveredCategory={setHoveredCategory}
      />

      <TextArea
        id="buyer-address"
        label="Address"
        value={formData.address}
        onChange={(value) => updateField("address", value)}
        placeholder="Enter complete address"
        autoComplete="street-address"
      />
    </div>
  );
}

function TransporterForm({
  formData,
  updateField,
  productCategories,
  selectedCategories,
  toggleCategory,
  truckFrequencyOptions,
  selectedFrequency,
  setSelectedFrequency,
  hoveredCategory,
  setHoveredCategory,
  hoveredFrequency,
  setHoveredFrequency,
}) {
  const styles = useAppStyles();

  return (
    <div style={styles.formFields}>
      <Input
        id="transporter-name"
        label="Name"
        value={formData.name}
        onChange={(value) => updateField("name", value)}
        placeholder="Enter full name"
        autoComplete="name"
      />

      <Input
        id="transporter-agency-name"
        label="Transporter Agency Name"
        value={formData.transporterAgencyName}
        onChange={(value) => updateField("transporterAgencyName", value)}
        placeholder="Enter agency name"
        autoComplete="organization"
      />

      <Input
        id="transporter-aadhaar-number"
        label="Aadhaar Number"
        value={formData.aadhaarNumber}
        onChange={(value) =>
          updateField(
            "aadhaarNumber",
            value.replace(/\D/g, "").slice(0, 12)
          )
        }
        placeholder="Enter 12 digit Aadhaar number"
        inputMode="numeric"
        maxLength={12}
        autoComplete="off"
      />

      <CategorySelect
        title="Which category do you deal with?"
        productCategories={productCategories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        hoveredCategory={hoveredCategory}
        setHoveredCategory={setHoveredCategory}
      />

      <OptionSelect
        title="How many trucks do you frequently need in a week?"
        options={truckFrequencyOptions}
        selectedOption={selectedFrequency}
        setSelectedOption={setSelectedFrequency}
        hoveredOption={hoveredFrequency}
        setHoveredOption={setHoveredFrequency}
        activeColor="#38bdf8"
      />

      <TextArea
        id="transporter-address"
        label="Address"
        value={formData.address}
        onChange={(value) => updateField("address", value)}
        placeholder="Enter complete address"
        autoComplete="street-address"
      />
    </div>
  );
}

function SellerForm({
  formData,
  updateField,
  productCategories,
  selectedCategories,
  toggleCategory,
  productionOptions,
  selectedProduction,
  setSelectedProduction,
  hoveredCategory,
  setHoveredCategory,
  hoveredProduction,
  setHoveredProduction,
}) {
  const styles = useAppStyles();

  return (
    <div style={styles.formFields}>
      <Input
        id="seller-name"
        label="Name"
        value={formData.name}
        onChange={(value) => updateField("name", value)}
        placeholder="Enter full name"
        autoComplete="name"
      />

      <Input
        id="seller-plant-name"
        label="Plant Name"
        value={formData.plantName}
        onChange={(value) => updateField("plantName", value)}
        placeholder="Enter plant name"
        autoComplete="organization"
      />

      <Input
        id="seller-aadhaar-number"
        label="Aadhaar Number"
        value={formData.aadhaarNumber}
        onChange={(value) =>
          updateField(
            "aadhaarNumber",
            value.replace(/\D/g, "").slice(0, 12)
          )
        }
        placeholder="Enter 12 digit Aadhaar number"
        inputMode="numeric"
        maxLength={12}
        autoComplete="off"
      />

      <CategorySelect
        title="Which material do you produce?"
        productCategories={productCategories}
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        hoveredCategory={hoveredCategory}
        setHoveredCategory={setHoveredCategory}
      />

      <OptionSelect
        title="How many tons do you produce daily?"
        options={productionOptions}
        selectedOption={selectedProduction}
        setSelectedOption={setSelectedProduction}
        hoveredOption={hoveredProduction}
        setHoveredOption={setHoveredProduction}
        activeColor="#22c55e"
      />

      <TextArea
        id="seller-plant-address"
        label="Plant Address"
        value={formData.plantAddress}
        onChange={(value) => updateField("plantAddress", value)}
        placeholder="Enter complete plant address"
        autoComplete="street-address"
      />
    </div>
  );
}

function CategorySelect({
  title,
  productCategories,
  selectedCategories,
  toggleCategory,
  hoveredCategory,
  setHoveredCategory,
}) {
  const styles = useAppStyles();

  return (
    <div style={styles.fieldWrapper}>
      <p style={styles.label}>{title}</p>

      <div style={styles.categoryGrid}>
        {productCategories.map((category) => {
          const active = selectedCategories.includes(category);
          const hovered = hoveredCategory === category;

          return (
            <button
              type="button"
              key={category}
              aria-pressed={active}
              onClick={() => toggleCategory(category)}
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
              style={{
                ...styles.categoryChip,
                ...(active ? styles.categoryChipActive : {}),
                transform: hovered
                  ? "scale(1.03) translateY(-2px)"
                  : active
                  ? "scale(1.01)"
                  : "scale(1)",
              }}
            >
              <span>{active ? "✓" : "+"}</span>{" "}
              {category.replace(" Crushed Stone", "")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionSelect({
  title,
  options,
  selectedOption,
  setSelectedOption,
  hoveredOption,
  setHoveredOption,
  activeColor,
}) {
  const styles = useAppStyles();

  return (
    <div style={styles.fieldWrapper}>
      <p style={styles.label}>{title}</p>

      <div style={styles.frequencyGrid}>
        {options.map((option) => {
          const active = selectedOption === option;
          const hovered = hoveredOption === option;

          return (
            <button
              type="button"
              key={option}
              aria-pressed={active}
              onClick={() => setSelectedOption(option)}
              onMouseEnter={() => setHoveredOption(option)}
              onMouseLeave={() => setHoveredOption(null)}
              style={{
                ...styles.frequencyChip,
                ...(active
                  ? {
                      ...styles.frequencyChipActive,
                      background: activeColor,
                      borderColor: activeColor,
                    }
                  : {}),
                transform: hovered
                  ? "scale(1.03) translateY(-2px)"
                  : active
                  ? "scale(1.01)"
                  : "scale(1)",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Input({
  id,
  label,
  placeholder,
  inputMode,
  maxLength,
  value,
  onChange,
  autoComplete = "off",
}) {
  const styles = useAppStyles();
  const [focused, setFocused] = useState(false);

  return (
    <div style={styles.fieldWrapper}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>

      <input
        id={id}
        name={id}
        type="text"
        style={{
          ...styles.input,
          ...(focused ? styles.inputFocused : {}),
        }}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function TextArea({
  id,
  label,
  placeholder,
  value,
  onChange,
  autoComplete = "off",
}) {
  const styles = useAppStyles();
  const [focused, setFocused] = useState(false);

  return (
    <div style={styles.fieldWrapper}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>

      <textarea
        id={id}
        name={id}
        style={{
          ...styles.textarea,
          ...(focused ? styles.inputFocused : {}),
        }}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
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
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, []);

  return viewport;
}

function createStyles(viewport, selectedRole) {
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
  const veryNarrow = phoneW < 300;
  const short = phoneH < 700;
  const veryShort = phoneH < 570;

  const px = (value) => Math.round(value * scale);

  const horizontalPadding = px(narrow ? 14 : 18);

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
      position: "relative",
      width: isDesktop ? 390 : "100vw",
      height: isDesktop ? 844 : "100dvh",
      maxWidth: isDesktop ? 430 : "none",
      minHeight: 0,
      background: "#ffffff",
      borderRadius: isDesktop ? 36 : 0,
      overflow: "hidden",
      boxShadow: isDesktop ? "0 30px 80px rgba(0,0,0,0.25)" : "none",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      isolation: "isolate",
    },

    hero: {
      position: "relative",
      minHeight: selectedRole
        ? px(veryShort ? 245 : short ? 285 : 330)
        : px(veryShort ? 455 : short ? 500 : 560),
      padding: `${px(short ? 18 : 22)}px ${px(
        narrow ? 16 : 20
      )}px ${px(selectedRole ? 22 : 30)}px`,
      color: "white",
      background:
        "radial-gradient(circle at 20% 8%, rgba(245,158,11,0.38), transparent 28%), linear-gradient(145deg, #020617 0%, #1c1917 52%, #92400e 100%)",
      overflow: "hidden",
      transition: "min-height 360ms ease",
      flexShrink: 0,
      boxSizing: "border-box",
    },

    bgOrbOne: {
      position: "absolute",
      top: px(-75),
      right: px(-80),
      width: px(230),
      height: px(230),
      borderRadius: "50%",
      background: "rgba(251,191,36,0.25)",
      filter: `blur(${px(38)}px)`,
      pointerEvents: "none",
    },

    bgOrbTwo: {
      position: "absolute",
      bottom: px(70),
      left: px(-95),
      width: px(210),
      height: px(210),
      borderRadius: "50%",
      background: "rgba(255,255,255,0.11)",
      filter: `blur(${px(46)}px)`,
      pointerEvents: "none",
    },

    bgOrbThree: {
      position: "absolute",
      bottom: px(-70),
      right: px(-50),
      width: px(180),
      height: px(180),
      borderRadius: "50%",
      background: "rgba(34,197,94,0.16)",
      filter: `blur(${px(42)}px)`,
      pointerEvents: "none",
    },

    gridOverlay: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      backgroundSize: `${px(34)}px ${px(34)}px`,
      maskImage: "linear-gradient(to bottom, black, transparent 82%)",
      WebkitMaskImage: "linear-gradient(to bottom, black, transparent 82%)",
      pointerEvents: "none",
    },

    nav: {
      position: "relative",
      zIndex: 3,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: px(10),
    },

    brandWrap: {
      display: "flex",
      alignItems: "center",
      gap: px(12),
      minWidth: 0,
    },

    logo3d: {
      width: px(short ? 42 : 50),
      height: px(short ? 42 : 50),
      borderRadius: px(19),
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.24), rgba(255,255,255,0.08))",
      display: "grid",
      placeItems: "center",
      fontSize: px(short ? 20 : 24),
      boxShadow:
        "inset 0 1px 0 rgba(255,255,255,0.3), 0 14px 26px rgba(0,0,0,0.25)",
      flexShrink: 0,
    },

    brandName: {
      margin: 0,
      fontSize: px(short ? 16 : 18),
      fontWeight: 950,
      lineHeight: 1,
    },

    brandSub: {
      margin: `${px(3)}px 0 0`,
      color: "#d6d3d1",
      fontSize: px(10),
      fontWeight: 700,
      whiteSpace: "nowrap",
    },

    backBtn: {
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 999,
      background: "rgba(255,255,255,0.1)",
      color: "white",
      padding: `${px(8)}px ${px(13)}px`,
      fontSize: px(12),
      fontWeight: 900,
      cursor: "pointer",
      flexShrink: 0,
    },

    headerText: {
      position: "relative",
      zIndex: 3,
      marginTop: selectedRole ? px(16) : px(short ? 24 : 34),
      transition: "all 300ms ease",
    },

    heroBadge: {
      display: "inline-block",
      padding: `${px(6)}px ${px(11)}px`,
      borderRadius: 999,
      background: "rgba(245,158,11,0.16)",
      border: "1px solid rgba(245,158,11,0.35)",
      color: "#fde68a",
      fontSize: px(10),
      letterSpacing: 1.5,
      fontWeight: 950,
    },

    title: {
      margin: `${px(12)}px 0 0`,
      color: "white",
      fontSize: selectedRole ? px(30) : px(short ? 34 : 40),
      lineHeight: 1.02,
      fontWeight: 950,
      letterSpacing: -1.1,
      transition: "all 300ms ease",
    },

    subtitle: {
      margin: `${px(10)}px 0 0`,
      color: "#e7e5e4",
      fontSize: px(short ? 12 : 13),
      lineHeight: 1.4,
      fontWeight: 600,
      maxWidth: px(330),
    },

    roleCardsStack: {
      position: "relative",
      zIndex: 3,
      marginTop: px(short ? 18 : 24),
      display: "flex",
      flexDirection: "column",
      gap: px(short ? 12 : 16),
      perspective: 900,
    },

    roleCardsRow: {
      position: "relative",
      zIndex: 3,
      marginTop: px(16),
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: px(narrow ? 7 : 9),
      perspective: 900,
      transition: "all 360ms ease",
    },

    roleCard: {
      width: "100%",
      minHeight: px(short ? 84 : 96),
      borderRadius: px(28),
      border: "1px solid rgba(255,255,255,0.18)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
      color: "white",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      cursor: "pointer",
      transition: "all 260ms ease",
      display: "flex",
      alignItems: "center",
      gap: px(13),
      padding: px(narrow ? 12 : 14),
      textAlign: "left",
      boxSizing: "border-box",
    },

    roleCardCompact: {
      width: "100%",
      minHeight: px(short ? 76 : 92),
      borderRadius: px(24),
      border: "1px solid rgba(255,255,255,0.18)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
      color: "white",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      cursor: "pointer",
      transition: "all 260ms ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: px(6),
      padding: px(7),
      textAlign: "center",
      boxSizing: "border-box",
      overflow: "hidden",
    },

    roleCardActive: {
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.32), rgba(255,255,255,0.12))",
    },

    roleIcon: {
      width: px(short ? 48 : 56),
      height: px(short ? 48 : 56),
      borderRadius: px(21),
      display: "grid",
      placeItems: "center",
      fontSize: px(short ? 25 : 29),
      boxShadow: "0 14px 26px rgba(0,0,0,0.24)",
      transition: "all 260ms ease",
      flexShrink: 0,
    },

    roleIconCompact: {
      width: px(short ? 36 : 42),
      height: px(short ? 36 : 42),
      borderRadius: px(16),
      display: "grid",
      placeItems: "center",
      fontSize: px(short ? 19 : 23),
      boxShadow: "0 12px 22px rgba(0,0,0,0.22)",
      transition: "all 260ms ease",
      flexShrink: 0,
    },

    roleTextBlock: {
      display: "flex",
      flexDirection: "column",
      gap: px(4),
      flex: 1,
      minWidth: 0,
    },

    roleLabel: {
      fontSize: px(16),
      fontWeight: 950,
    },

    roleLabelCompact: {
      fontSize: px(narrow ? 9 : 11),
      fontWeight: 950,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
    },

    roleDescription: {
      color: "#d6d3d1",
      fontSize: px(11),
      fontWeight: 700,
      lineHeight: 1.25,
    },

    roleStatus: {
      width: px(30),
      height: px(30),
      borderRadius: px(12),
      display: "grid",
      placeItems: "center",
      fontSize: px(15),
      fontWeight: 950,
      color: "#111827",
      flexShrink: 0,
    },

    /*
     * Bottom-sheet container.
     * It takes all remaining phone height.
     */
    formSection: {
      position: "relative",
      zIndex: 5,
      flex: 1,
      minHeight: 0,
      marginTop: px(-28),
      background: "#ffffff",
      borderRadius: `${px(32)}px ${px(32)}px 0 0`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxSizing: "border-box",
      padding: `0 ${horizontalPadding}px`,
    },

    /*
     * Only this section scrolls.
     * The bottom panel is outside this element.
     */
    formScrollArea: {
      position: "relative",
      zIndex: 1,
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      overscrollBehavior: "contain",
      scrollbarGutter: "stable",
      paddingTop: px(16),
      paddingBottom: px(14),
      boxSizing: "border-box",
      pointerEvents: "auto",
    },

    formCard: {
      position: "relative",
      zIndex: 2,
      padding: px(narrow ? 14 : 16),
      borderRadius: px(30),
      background: "#fafaf9",
      border: "1px solid #eee7df",
      boxShadow: "0 16px 34px rgba(0,0,0,0.08)",
      boxSizing: "border-box",
      pointerEvents: "auto",
    },

    formHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: px(12),
      marginBottom: px(16),
    },

    formKicker: {
      margin: 0,
      fontSize: px(10),
      letterSpacing: 1.5,
      fontWeight: 950,
    },

    formTitle: {
      margin: `${px(5)}px 0 0`,
      color: "#1c1917",
      fontSize: px(21),
      fontWeight: 950,
      lineHeight: 1.1,
    },

    roleIconBadge: {
      width: px(48),
      height: px(48),
      borderRadius: px(18),
      color: "white",
      display: "grid",
      placeItems: "center",
      fontSize: px(24),
      boxShadow: "0 14px 24px rgba(0,0,0,0.18)",
      flexShrink: 0,
    },

    formFields: {
      position: "relative",
      zIndex: 2,
      display: "flex",
      flexDirection: "column",
      gap: px(14),
      pointerEvents: "auto",
    },

    fieldWrapper: {
      position: "relative",
      zIndex: 2,
      pointerEvents: "auto",
    },

    label: {
      display: "block",
      margin: `0 0 ${px(7)}px`,
      color: "#1c1917",
      fontSize: px(13),
      fontWeight: 900,
      lineHeight: 1.25,
    },

    input: {
      position: "relative",
      zIndex: 3,
      display: "block",
      width: "100%",
      height: px(48),
      border: "1px solid #e7e5e4",
      borderRadius: px(17),
      padding: `0 ${px(14)}px`,
      fontSize: px(13),
      fontWeight: 650,
      outline: "none",
      background: "#ffffff",
      color: "#1c1917",
      WebkitTextFillColor: "#1c1917",
      boxSizing: "border-box",
      transition: "border-color 220ms ease, box-shadow 220ms ease",
      pointerEvents: "auto",
      touchAction: "manipulation",
      userSelect: "text",
      WebkitUserSelect: "text",
    },

    inputFocused: {
      borderColor: "#f59e0b",
      boxShadow: "0 0 0 4px rgba(245,158,11,0.15)",
    },

    textarea: {
      position: "relative",
      zIndex: 3,
      display: "block",
      width: "100%",
      minHeight: px(88),
      border: "1px solid #e7e5e4",
      borderRadius: px(17),
      padding: px(14),
      fontSize: px(13),
      fontWeight: 650,
      outline: "none",
      background: "#ffffff",
      color: "#1c1917",
      WebkitTextFillColor: "#1c1917",
      boxSizing: "border-box",
      resize: "vertical",
      transition: "border-color 220ms ease, box-shadow 220ms ease",
      fontFamily: "Arial, sans-serif",
      pointerEvents: "auto",
      touchAction: "manipulation",
      userSelect: "text",
      WebkitUserSelect: "text",
    },

    categoryGrid: {
      display: "grid",
      gridTemplateColumns: veryNarrow
        ? "1fr"
        : "repeat(2, minmax(0, 1fr))",
      gap: px(9),
    },

    categoryChip: {
      minHeight: px(42),
      border: "1px solid #e7e5e4",
      borderRadius: px(16),
      background: "white",
      color: "#1c1917",
      fontSize: px(narrow ? 10 : 11),
      fontWeight: 850,
      cursor: "pointer",
      transition: "all 220ms ease",
      boxShadow: "0 7px 16px rgba(0,0,0,0.04)",
      padding: `0 ${px(8)}px`,
      overflow: "hidden",
      textOverflow: "ellipsis",
      pointerEvents: "auto",
    },

    categoryChipActive: {
      background: "linear-gradient(135deg, #020617, #92400e)",
      color: "white",
      borderColor: "#92400e",
      boxShadow: "0 12px 22px rgba(146,64,14,0.22)",
    },

    frequencyGrid: {
      display: "grid",
      gridTemplateColumns: veryNarrow
        ? "1fr"
        : "repeat(2, minmax(0, 1fr))",
      gap: px(9),
    },

    frequencyChip: {
      height: px(42),
      border: "1px solid #e7e5e4",
      borderRadius: px(16),
      background: "white",
      color: "#1c1917",
      fontSize: px(12),
      fontWeight: 900,
      cursor: "pointer",
      transition: "all 220ms ease",
      boxShadow: "0 7px 16px rgba(0,0,0,0.04)",
      padding: `0 ${px(8)}px`,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      pointerEvents: "auto",
    },

    frequencyChipActive: {
      color: "#111827",
      boxShadow: "0 12px 22px rgba(0,0,0,0.14)",
    },

    /*
     * This panel always stays attached to the bottom of the phone.
     * It does not scroll with the form fields.
     */
    bottomPanel: {
      position: "relative",
      zIndex: 20,
      flexShrink: 0,
      width: `calc(100% + ${horizontalPadding * 2}px)`,
      marginLeft: -horizontalPadding,
      marginRight: -horizontalPadding,
      marginTop: "auto",
      padding: `${px(14)}px ${horizontalPadding}px`,
      paddingBottom: `calc(${px(
        14
      )}px + env(safe-area-inset-bottom, 0px))`,
      borderRadius: `${px(30)}px ${px(30)}px 0 0`,
      background: "#fafaf9",
      border: "1px solid #eee7df",
      borderBottom: 0,
      boxShadow: "0 -12px 34px rgba(0,0,0,0.10)",
      boxSizing: "border-box",
      pointerEvents: "auto",
    },

    privacyNote: {
      padding: px(12),
      borderRadius: px(22),
      background: "#fffbeb",
      border: "1px solid #fde68a",
      display: "flex",
      alignItems: "center",
      gap: px(10),
    },

    lockIcon: {
      width: px(48),
      height: px(48),
      borderRadius: px(18),
      background: "#1c1917",
      color: "white",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      fontSize: px(21),
    },

    privacyText: {
      margin: 0,
      color: "#78716c",
      fontSize: px(13),
      lineHeight: 1.35,
      fontWeight: 900,
    },

    submitBtn: {
      width: "100%",
      height: px(58),
      marginTop: px(16),
      border: 0,
      borderRadius: px(28),
      color: "white",
      fontSize: px(18),
      fontWeight: 950,
      cursor: "pointer",
      transition: "all 260ms ease",
    },

    submitBtnDisabled: {
      background:
        "linear-gradient(135deg, rgba(2,6,23,0.38), rgba(146,64,14,0.38))",
      opacity: 0.55,
      boxShadow: "none",
      cursor: "not-allowed",
    },

    submitBtnBright: {
      background: "linear-gradient(135deg, #020617, #92400e)",
      opacity: 1,
      boxShadow: "0 18px 38px rgba(146,64,14,0.28)",
    },

    signInText: {
      margin: `${px(14)}px 0 0`,
      textAlign: "center",
      color: "#78716c",
      fontSize: px(13),
      fontWeight: 850,
    },
  };
}




























signin
import React, { useMemo, useState } from "react";

export default function FinalSignInOTPPageWithChangeMobileNumber() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  const isMobileValid = mobileNumber.length === 10;
  const isOtpValid = otp.length === 6;
  const isNumberLocked = otpVisible;

  const formattedNumber = useMemo(() => {
    if (!mobileNumber) return "+91 XXXXX XXXXX";
    return `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5, 10)}`;
  }, [mobileNumber]);

  const handleMobileChange = (value) => {
    if (isNumberLocked) return;

    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setMobileNumber(digitsOnly);
    setOtp("");
    setOtpVisible(false);
  };

  const handleOtpChange = (value) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digitsOnly);
  };

  const handleNext = () => {
    if (isMobileValid) {
      setOtpVisible(true);
      setFocusedField("otp");
    }
  };

  const handleChangeNumber = () => {
    setOtpVisible(false);
    setOtp("");
    setFocusedField("mobile");
  };

  return (
    <div style={styles.page}>
      <div style={styles.phone}>
        <section style={styles.hero}>
          <div style={styles.glowOne} />
          <div style={styles.glowTwo} />
          <div style={styles.gridOverlay} />

          <nav style={styles.nav}>
            <div style={styles.brandWrap}>
              <div style={styles.logo}>🪨</div>
              <div>
                <p style={styles.brandName}>StoneRate</p>
                <p style={styles.brandSub}>Secure OTP Login</p>
              </div>
            </div>

            <button style={styles.backBtn}>Back</button>
          </nav>

          <div style={styles.heroText}>
            <p style={styles.kicker}>SIGN IN</p>
            <h1 style={styles.title}>Verify your mobile number</h1>
            <p style={styles.subtitle}>
              Enter your number to receive OTP and continue to your account.
            </p>
          </div>

          <div style={styles.visualStage}>
            <div style={styles.orbitOne} />
            <div style={styles.orbitTwo} />

            <div
              style={{
                ...styles.loginCard3d,
                ...(isMobileValid ? styles.loginCardReady : {}),
              }}
            >
              <div style={styles.topHandle} />

              <div style={styles.cardHeaderRow}>
                <div
                  style={{
                    ...styles.lockBox,
                    background: isMobileValid ? "#22c55e" : "#f59e0b",
                  }}
                >
                  {isNumberLocked ? "🔒" : isMobileValid ? "✅" : "🔐"}
                </div>

                <div style={styles.statusPill}>
                  {isNumberLocked ? "Locked" : isMobileValid ? "Ready" : "Waiting"}
                </div>
              </div>

              <div style={styles.numberPanel}>
                <p style={styles.panelLabel}>Mobile Number</p>
                <p style={styles.panelNumber}>{formattedNumber}</p>
              </div>

              <div style={styles.readyPanel}>
                <span
                  style={{
                    ...styles.statusDot,
                    background: isMobileValid ? "#22c55e" : "#f59e0b",
                  }}
                />

                <div>
                  <p style={styles.readyTitle}>
                    {isMobileValid ? "Ready for OTP" : "Enter 10 digits"}
                  </p>
                  <p style={styles.readySub}>
                    {otpVisible ? "Mobile number locked" : "OTP appears after Next"}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                ...styles.floatBadgeTop,
                color: isMobileValid ? "#15803d" : "#92400e",
              }}
            >
              +91 India
            </div>

            <div
              style={{
                ...styles.floatBadgeLeft,
                borderColor: isMobileValid ? "#22c55e" : "#f59e0b",
              }}
            >
              OTP Login
            </div>

            <div
              style={{
                ...styles.floatIcon,
                background: isMobileValid ? "#22c55e" : "#f59e0b",
              }}
            >
              📲
            </div>
          </div>
        </section>

        <section style={styles.formSection}>
          <div style={styles.formCard}>
            <div style={styles.formTitleRow}>
              <div>
                <p style={styles.formKicker}>MOBILE VERIFICATION</p>
                <h2 style={styles.formTitle}>Sign In</h2>
              </div>

              <div
                style={{
                  ...styles.formIcon,
                  background: isMobileValid ? "#22c55e" : "#1c1917",
                }}
              >
                {isNumberLocked ? "🔒" : isMobileValid ? "✓" : "🔐"}
              </div>
            </div>

            <div style={styles.fieldBlock}>
              <label style={styles.label}>Mobile Number</label>

              <div
                style={{
                  ...styles.mobileWrap,
                  ...(focusedField === "mobile" ? styles.fieldFocused : {}),
                  ...(isNumberLocked ? styles.mobileWrapLocked : {}),
                }}
              >
                <div
                  style={{
                    ...styles.prefix,
                    ...(isNumberLocked ? styles.prefixLocked : {}),
                  }}
                >
                  +91
                </div>

                <input
                  value={mobileNumber}
                  onChange={(event) => handleMobileChange(event.target.value)}
                  onFocus={() => setFocusedField("mobile")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="10 digit number"
                  inputMode="numeric"
                  maxLength={10}
                  disabled={isNumberLocked}
                  style={{
                    ...styles.mobileInput,
                    ...(isNumberLocked ? styles.mobileInputLocked : {}),
                  }}
                />

                <div
                  style={{
                    ...styles.inputStatus,
                    background: isMobileValid ? "#22c55e" : "#e7e5e4",
                  }}
                >
                  {isNumberLocked ? "🔒" : isMobileValid ? "✓" : mobileNumber.length}
                </div>
              </div>

              <div style={styles.mobileHelperRow}>
                <p style={styles.helper}>
                  {isNumberLocked
                    ? "Mobile number is locked for OTP verification."
                    : "Required format: +91 followed by exactly 10 numeric digits."}
                </p>

                {isNumberLocked && (
                  <button onClick={handleChangeNumber} style={styles.changeNumberBtn}>
                    Change mobile number
                  </button>
                )}
              </div>
            </div>

            {otpVisible && (
              <div style={styles.otpSection}>
                <div style={styles.otpTopRow}>
                  <div>
                    <label style={styles.label}>OTP Verification</label>
                    <p style={styles.otpHint}>OTP sent to {formattedNumber}</p>
                  </div>

                  <button style={styles.resendBtn}>Resend</button>
                </div>

                <input
                  value={otp}
                  onChange={(event) => handleOtpChange(event.target.value)}
                  onFocus={() => setFocusedField("otp")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••"
                  inputMode="numeric"
                  maxLength={6}
                  style={{
                    ...styles.otpInput,
                    ...(focusedField === "otp" ? styles.otpFocused : {}),
                  }}
                />

                <div style={styles.otpDotRow}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <span
                      key={index}
                      style={{
                        ...styles.otpDot,
                        background: otp.length > index ? "#22c55e" : "#e7e5e4",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div style={styles.securityNote}>
              <div style={styles.noteIcon}>🔒</div>
              <p style={styles.noteText}>
                Your account is protected with secure one-time password verification.
              </p>
            </div>

            {!otpVisible ? (
              <button
                disabled={!isMobileValid}
                onClick={handleNext}
                onMouseEnter={() => setHoveredButton("next")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.primaryBtn,
                  ...(isMobileValid ? styles.primaryActive : styles.primaryDisabled),
                  transform:
                    hoveredButton === "next" && isMobileValid
                      ? "translateY(-3px) scale(1.015)"
                      : "none",
                }}
              >
                Next
              </button>
            ) : (
              <button
                disabled={!isOtpValid}
                onMouseEnter={() => setHoveredButton("verify")}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  ...styles.primaryBtn,
                  ...(isOtpValid ? styles.primaryActive : styles.primaryDisabled),
                  transform:
                    hoveredButton === "verify" && isOtpValid
                      ? "translateY(-3px) scale(1.015)"
                      : "none",
                }}
              >
                Verify & Sign In
              </button>
            )}

            <p style={styles.createText}>
              New to StoneRate? <b>Create Account</b>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f1ea",
    display: "flex",
    justifyContent: "center",
    padding: 16,
    fontFamily: "Arial, sans-serif",
  },
  phone: {
    width: "100%",
    maxWidth: 430,
    background: "#ffffff",
    borderRadius: 36,
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
  },
  hero: {
    position: "relative",
    minHeight: 565,
    padding: "22px 20px 28px",
    color: "white",
    background:
      "radial-gradient(circle at 20% 8%, rgba(245,158,11,0.38), transparent 28%), linear-gradient(145deg, #020617 0%, #1c1917 52%, #92400e 100%)",
    overflow: "hidden",
  },
  glowOne: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 230,
    height: 230,
    borderRadius: "50%",
    background: "rgba(251,191,36,0.25)",
    filter: "blur(38px)",
  },
  glowTwo: {
    position: "absolute",
    bottom: 70,
    left: -95,
    width: 225,
    height: 225,
    borderRadius: "50%",
    background: "rgba(34,197,94,0.14)",
    filter: "blur(44px)",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "34px 34px",
    maskImage: "linear-gradient(to bottom, black, transparent 82%)",
  },
  nav: {
    position: "relative",
    zIndex: 3,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 19,
    background: "linear-gradient(145deg, rgba(255,255,255,0.24), rgba(255,255,255,0.08))",
    display: "grid",
    placeItems: "center",
    fontSize: 24,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 14px 26px rgba(0,0,0,0.25)",
  },
  brandName: {
    margin: 0,
    fontSize: 18,
    fontWeight: 950,
  },
  brandSub: {
    margin: "3px 0 0",
    color: "#d6d3d1",
    fontSize: 10,
    fontWeight: 700,
  },
  backBtn: {
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    color: "white",
    padding: "9px 14px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },
  heroText: {
    position: "relative",
    zIndex: 3,
    marginTop: 30,
    textAlign: "center",
  },
  kicker: {
    display: "inline-block",
    margin: 0,
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(245,158,11,0.16)",
    border: "1px solid rgba(245,158,11,0.35)",
    color: "#fde68a",
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: 950,
  },
  title: {
    margin: "14px 0 0",
    fontSize: 37,
    lineHeight: 1.05,
    fontWeight: 950,
    letterSpacing: -1,
  },
  subtitle: {
    margin: "12px auto 0",
    maxWidth: 330,
    color: "#e7e5e4",
    fontSize: 13,
    lineHeight: 1.5,
    fontWeight: 600,
  },
  visualStage: {
    position: "relative",
    zIndex: 3,
    height: 290,
    marginTop: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    perspective: 1100,
  },
  orbitOne: {
    position: "absolute",
    width: 350,
    height: 190,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.16)",
    transform: "rotateX(66deg) rotateZ(-12deg)",
  },
  orbitTwo: {
    position: "absolute",
    width: 250,
    height: 235,
    borderRadius: "50%",
    border: "1px solid rgba(245,158,11,0.33)",
    transform: "rotateX(64deg) rotateZ(12deg)",
  },
  loginCard3d: {
    position: "relative",
    width: 258,
    minHeight: 255,
    borderRadius: 36,
    background: "linear-gradient(145deg, rgba(255,255,255,0.30), rgba(255,255,255,0.08))",
    border: "2px solid rgba(255,255,255,0.25)",
    backdropFilter: "blur(14px)",
    transform: "rotateX(8deg) rotateY(-9deg) rotateZ(1deg)",
    boxShadow: "0 30px 60px rgba(245,158,11,0.22)",
    padding: 18,
    transition: "all 320ms ease",
  },
  loginCardReady: {
    border: "2px solid #22c55e",
    boxShadow: "0 34px 72px rgba(34,197,94,0.38)",
    background: "linear-gradient(145deg, rgba(34,197,94,0.22), rgba(255,255,255,0.09))",
  },
  topHandle: {
    width: 75,
    height: 8,
    borderRadius: 999,
    background: "rgba(255,255,255,0.62)",
    marginBottom: 17,
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lockBox: {
    width: 62,
    height: 62,
    borderRadius: 23,
    color: "#111827",
    display: "grid",
    placeItems: "center",
    fontSize: 29,
    boxShadow: "0 16px 28px rgba(0,0,0,0.25)",
    transition: "all 280ms ease",
  },
  statusPill: {
    padding: "8px 11px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.16)",
    color: "white",
    fontSize: 11,
    fontWeight: 900,
  },
  numberPanel: {
    marginTop: 16,
    padding: 14,
    borderRadius: 21,
    background: "rgba(0,0,0,0.24)",
    minWidth: 0,
  },
  panelLabel: {
    margin: 0,
    color: "#d6d3d1",
    fontSize: 10,
    fontWeight: 850,
  },
  panelNumber: {
    margin: "7px 0 0",
    color: "white",
    fontSize: 17,
    fontWeight: 950,
    whiteSpace: "nowrap",
    letterSpacing: -0.2,
  },
  readyPanel: {
    marginTop: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 20,
    background: "rgba(255,255,255,0.18)",
  },
  statusDot: {
    width: 13,
    height: 13,
    borderRadius: "50%",
    flexShrink: 0,
  },
  readyTitle: {
    margin: 0,
    color: "white",
    fontSize: 13,
    fontWeight: 950,
  },
  readySub: {
    margin: "4px 0 0",
    color: "#e7e5e4",
    fontSize: 10,
    fontWeight: 700,
  },
  floatBadgeTop: {
    position: "absolute",
    top: 25,
    right: 10,
    zIndex: 5,
    padding: "10px 13px",
    borderRadius: 19,
    background: "rgba(255,255,255,0.94)",
    fontSize: 12,
    fontWeight: 950,
    boxShadow: "0 16px 30px rgba(0,0,0,0.25)",
  },
  floatBadgeLeft: {
    position: "absolute",
    bottom: 32,
    left: 10,
    zIndex: 5,
    padding: "10px 13px",
    borderRadius: 19,
    background: "rgba(255,255,255,0.92)",
    border: "2px solid #f59e0b",
    color: "#1c1917",
    fontSize: 12,
    fontWeight: 950,
    boxShadow: "0 16px 30px rgba(0,0,0,0.24)",
  },
  floatIcon: {
    position: "absolute",
    bottom: 73,
    right: 16,
    zIndex: 5,
    width: 58,
    height: 58,
    borderRadius: 22,
    display: "grid",
    placeItems: "center",
    fontSize: 29,
    boxShadow: "0 18px 32px rgba(0,0,0,0.28)",
    transition: "all 280ms ease",
  },
  formSection: {
    marginTop: -28,
    position: "relative",
    zIndex: 5,
    padding: "0 18px 24px",
    background: "white",
    borderRadius: "32px 32px 0 0",
  },
  formCard: {
    padding: 16,
    borderRadius: 30,
    background: "#fafaf9",
    border: "1px solid #eee7df",
    boxShadow: "0 16px 34px rgba(0,0,0,0.08)",
  },
  formTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  formKicker: {
    margin: 0,
    color: "#b45309",
    fontSize: 10,
    letterSpacing: 1.7,
    fontWeight: 950,
  },
  formTitle: {
    margin: "5px 0 0",
    color: "#1c1917",
    fontSize: 23,
    fontWeight: 950,
  },
  formIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    color: "white",
    display: "grid",
    placeItems: "center",
    fontSize: 23,
    boxShadow: "0 14px 24px rgba(0,0,0,0.18)",
  },
  fieldBlock: {
    marginTop: 4,
  },
  label: {
    display: "block",
    marginBottom: 8,
    color: "#1c1917",
    fontSize: 13,
    fontWeight: 900,
  },
  mobileWrap: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    height: 54,
    border: "1px solid #e7e5e4",
    borderRadius: 20,
    padding: "0 10px",
    background: "white",
    boxSizing: "border-box",
    transition: "all 220ms ease",
  },
  mobileWrapLocked: {
    borderColor: "#bbf7d0",
    background: "#f0fdf4",
  },
  fieldFocused: {
    borderColor: "#f59e0b",
    boxShadow: "0 0 0 4px rgba(245,158,11,0.15)",
    transform: "translateY(-1px)",
  },
  prefix: {
    height: 36,
    minWidth: 52,
    borderRadius: 14,
    background: "#1c1917",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontSize: 13,
    fontWeight: 950,
  },
  prefixLocked: {
    background: "#166534",
  },
  mobileInput: {
    flex: 1,
    height: "100%",
    border: 0,
    outline: "none",
    background: "transparent",
    fontSize: 14,
    fontWeight: 800,
    color: "#1c1917",
    minWidth: 0,
  },
  mobileInputLocked: {
    color: "#166534",
  },
  inputStatus: {
    width: 34,
    height: 34,
    borderRadius: 13,
    color: "white",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 950,
  },
  mobileHelperRow: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  helper: {
    margin: 0,
    color: "#78716c",
    fontSize: 11,
    lineHeight: 1.35,
    fontWeight: 700,
  },
  changeNumberBtn: {
    alignSelf: "flex-start",
    border: 0,
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    padding: "8px 11px",
    fontSize: 11,
    fontWeight: 950,
    cursor: "pointer",
  },
  otpSection: {
    marginTop: 17,
    padding: 14,
    borderRadius: 24,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
  },
  otpTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  otpHint: {
    margin: "-3px 0 0",
    color: "#15803d",
    fontSize: 11,
    fontWeight: 750,
  },
  resendBtn: {
    border: 0,
    borderRadius: 999,
    background: "#166534",
    color: "white",
    padding: "8px 11px",
    fontSize: 11,
    fontWeight: 900,
    cursor: "pointer",
  },
  otpInput: {
    width: "100%",
    height: 52,
    marginTop: 12,
    border: "1px solid #bbf7d0",
    borderRadius: 18,
    padding: "0 14px",
    fontSize: 18,
    fontWeight: 950,
    letterSpacing: 7,
    outline: "none",
    background: "white",
    color: "#1c1917",
    boxSizing: "border-box",
    transition: "all 220ms ease",
  },
  otpFocused: {
    borderColor: "#22c55e",
    boxShadow: "0 0 0 4px rgba(34,197,94,0.14)",
  },
  otpDotRow: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  otpDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  securityNote: {
    marginTop: 17,
    padding: 12,
    borderRadius: 22,
    background: "#fffbeb",
    border: "1px solid #fde68a",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  noteIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    background: "#1c1917",
    color: "white",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    fontSize: 20,
  },
  noteText: {
    margin: 0,
    color: "#78716c",
    fontSize: 12,
    lineHeight: 1.35,
    fontWeight: 800,
  },
  primaryBtn: {
    width: "100%",
    height: 58,
    marginTop: 22,
    border: 0,
    borderRadius: 28,
    color: "white",
    fontSize: 18,
    fontWeight: 950,
    transition: "all 260ms ease",
  },
  primaryDisabled: {
    background: "linear-gradient(135deg, rgba(2,6,23,0.38), rgba(146,64,14,0.38))",
    opacity: 0.55,
    boxShadow: "none",
    cursor: "not-allowed",
  },
  primaryActive: {
    background: "linear-gradient(135deg, #020617, #92400e)",
    opacity: 1,
    boxShadow: "0 18px 38px rgba(146,64,14,0.28)",
    cursor: "pointer",
  },
  createText: {
    margin: "20px 0 0",
    textAlign: "center",
    color: "#78716c",
    fontSize: 13,
    fontWeight: 850,
  },
};
