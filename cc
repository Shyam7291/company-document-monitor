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




















































orderpage
import React, { useEffect, useMemo, useState } from "react";

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

            <div style={styles.truckIcon}>🚚</div>
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
      background: "linear-gradient(135deg, #09090b, #292524, #92400e)",
      color: "white",
      padding: px(short ? 18 : 22),
      flexShrink: 0,
      zIndex: 20,
      boxShadow: "0 8px 22px rgba(0,0,0,0.16)",
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
      background: "#111827",
      color: "white",
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
      background: "#1c1917",
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
