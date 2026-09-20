import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, ArrowLeft, Check, CheckCircle2, ChevronDown, ClipboardList,
  Clock3, Image as ImageIcon, MapPin, Mountain, Navigation, PackageCheck,
  Plus, RefreshCw, Send, Trash2, Truck, XCircle
} from "lucide-react";

/*
  StoneRate Transporter Your Order Details Page
  One-file React component with embedded CSS.
  Dependencies: react, lucide-react
*/

const MATERIAL_IMAGES = {
  stone20: "https://cdn.jsdelivr.net/gh/shyam7291/Image-icons@main/availabletrips.png",
  stone40: "https://cdn.jsdelivr.net/gh/shyam7291/Image-icons@main/completed.png"
};

/* Material tracking stages, in order. Each material carries its own tracking object:
   tracking: { status: "Confirmed" | "Loading" | "Loaded" | "Dispatched", loadedAt: "", dispatchedAt: "" } */
const TRACK_STEPS = ["Confirmed", "Loading", "Loaded", "Dispatched"];

const MOCK_ORDER = {
  id: "TR260916-625",
  requestTime: "3:20 PM",
  responseSeconds: 30 * 60,
  status: "No response yet",
  statusDetail: "Waiting for both sellers to respond to the transport request.",
  materials: [
    {
      id: "material-20",
      name: "20MM",
      quantity: "50 ton",
      vehicles: 2,
      pickup: "Dalla",
      image: MATERIAL_IMAGES.stone20,
      sellerStatus: "Pending",
      tracking: { status: "Loaded", loadedAt: "4:05 PM", dispatchedAt: "" }
    },
    {
      id: "material-40",
      name: "40MM",
      quantity: "20 ton",
      vehicles: 1,
      pickup: "Ariora",
      image: MATERIAL_IMAGES.stone40,
      sellerStatus: "Pending",
      tracking: { status: "Loading", loadedAt: "", dispatchedAt: "" }
    }
  ]
};

const STATUS_STYLES = {
  "No response yet": "pending",
  Accepted: "accepted",
  Rejected: "rejected",
  "Partial complete": "partial"
};

const TRACK_STYLES = {
  Confirmed: "accepted",
  Loading: "pending",
  Loaded: "partial",
  Dispatched: "dispatched",
  Rejected: "rejected"
};

const cx = (...items) => items.filter(Boolean).join(" ");

const styles = `
:root{--ink:#10243e;--muted:#68778c;--line:#dfe6ef;--blue:#2457e6;--violet:#6c4ee7;--cyan:#00a9c7;--green:#19a875;--orange:#f28a33;--red:#e75665;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;color:var(--ink)}
*{box-sizing:border-box}html,body{margin:0;min-width:320px;overflow-x:hidden;background:linear-gradient(180deg,#f8fcfb,#edf5f6 48%,#f5f1fb)}button,input{font:inherit}.od-app{min-height:100vh;padding-bottom:28px;position:relative;isolation:isolate;overflow-x:hidden}.od-app:before,.od-app:after{content:"";position:fixed;z-index:-1;border-radius:50%;pointer-events:none}.od-app:before{width:310px;height:310px;left:-180px;top:100px;background:radial-gradient(circle,rgba(91,108,255,.16),transparent 68%)}.od-app:after{width:390px;height:390px;right:-225px;top:430px;background:radial-gradient(circle,rgba(0,169,199,.14),transparent 68%)}.od-shell{width:min(100% - 28px,850px);margin:auto;max-width:100%}
.od-header{position:sticky;top:0;z-index:40;background:rgba(255,255,255,.84);border-bottom:1px solid #dfe5ed;backdrop-filter:blur(18px)}.od-head{height:58px;display:grid;grid-template-columns:40px 1fr 40px;align-items:center}.od-icon-btn{width:36px;height:36px;border:1px solid #e0e5ef;border-radius:12px;background:#fff;color:var(--ink);display:grid;place-items:center;cursor:pointer}.od-logo{justify-self:center;display:flex;align-items:center;gap:6px;font-size:16px;font-weight:900}.od-logo i{width:27px;height:27px;border-radius:9px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7,#00a9c7)}.od-logo em{font-style:normal;color:var(--violet)}
.od-main{padding-top:15px}.od-hero{position:relative;overflow:hidden;padding:18px;border-radius:25px;color:#fff;background:linear-gradient(135deg,#152b4b,#245b89 55%,#058896);box-shadow:0 20px 42px rgba(44,73,120,.22)}.od-hero:after{content:"";position:absolute;width:190px;height:190px;border-radius:50%;right:-80px;top:-110px;background:rgba(255,255,255,.13)}.od-hero-top{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.od-order-id small{display:block;font-size:8px;letter-spacing:1.2px;font-weight:900;opacity:.72}.od-order-id strong{display:block;font-size:19px;margin-top:4px}.od-timer{padding:8px 10px;border-radius:14px;background:linear-gradient(135deg,#ed5665,#fa8c3a);text-align:center;box-shadow:0 9px 20px rgba(235,89,76,.27)}.od-timer small{display:flex;align-items:center;justify-content:center;gap:4px;font-size:7px;font-weight:900;letter-spacing:.7px}.od-timer strong{display:block;font-size:15px;margin-top:4px;font-variant-numeric:tabular-nums}.od-hero-meta{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:15px}.od-meta{padding:10px;border-radius:14px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.18)}.od-meta small{display:block;font-size:8px;letter-spacing:.8px;opacity:.72;font-weight:850}.od-meta b{display:block;font-size:11px;margin-top:4px}.od-status{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:99px;font-size:9px;font-weight:900;white-space:nowrap}.od-status.pending{color:#934f15;background:#fff0df}.od-status.accepted{color:#087f5b;background:#def7ed}.od-status.rejected{color:#b63f4c;background:#fde5e8}.od-status.partial{color:#5844c6;background:#eeebff}.od-status.dispatched{color:#0b6e8f;background:#dcf3fa}
.od-card{margin-top:14px;padding:16px;border:1px solid rgba(220,225,238,.96);border-radius:23px;background:rgba(255,255,255,.94);box-shadow:0 12px 32px rgba(48,58,108,.08)}.od-section-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.od-section-title h2{font-size:16px;margin:0}.od-section-title p{font-size:9px;color:var(--muted);margin:4px 0 0}.od-title-icon{width:39px;height:39px;border-radius:13px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7,#00a9c7);box-shadow:0 8px 18px rgba(75,84,194,.22)}
.od-toggle{width:100%;padding:0;border:0;background:transparent;text-align:left;color:inherit;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px}.od-toggle.collapsed{margin-bottom:0}.od-toggle-right{display:flex;align-items:center;gap:8px}.od-chevron{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;color:#5847c7;background:#eceeff;transition:transform .25s}.od-toggle.open .od-chevron{transform:rotate(180deg)}.od-collapse-hint{display:flex;align-items:center;gap:6px;margin-top:10px;padding:9px 10px;border-radius:13px;background:#f4f6fa;color:#667187;font-size:9px}.od-collapse-hint b{color:#5645c8}.od-collapse-body{margin-top:12px}
.od-status-detail{display:flex;align-items:flex-start;gap:10px;padding:12px;border-radius:16px;background:#f4f6ff;border:1px solid #e2e5f2}.od-status-detail i{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;color:#5d4bd2;background:#e8e4ff;flex:0 0 auto}.od-status-detail b{display:block;font-size:10px}.od-status-detail span{display:block;color:var(--muted);font-size:9px;line-height:1.5;margin-top:3px}.od-rejection{margin-top:10px;padding:12px;border-radius:16px;background:#fff2f3;border:1px solid #ffd7dc}.od-rejection strong{display:flex;align-items:center;gap:6px;color:#b93f4d;font-size:10px}.od-rejection p{font-size:9px;color:#876067;line-height:1.55;margin:6px 0 0}.od-apology{display:block;margin-top:5px;color:#6f7585}
.od-materials{display:grid;gap:10px}.od-material{padding:10px;border-radius:18px;background:linear-gradient(135deg,#f4f6ff,#eefbfa);border:1px solid #e2e7ef}.od-material-main{display:grid;grid-template-columns:54px minmax(0,1fr);gap:11px;align-items:center}.od-image{width:54px;height:54px;border-radius:14px;background:#fff;border:1px solid #dfe4ed;overflow:hidden;display:grid;place-items:center}.od-image img{width:100%;height:100%;object-fit:cover}.od-material-data{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.od-material-data small{display:block;color:#788298;font-size:7px;letter-spacing:.6px;font-weight:850}.od-material-data b{display:block;font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.od-material-data span:last-child{text-align:right}.od-material-data span:last-child b{color:#5e4bd0}.od-pickup{display:flex;align-items:center;gap:8px;margin-top:10px;padding:9px 10px;border-radius:13px;background:#fff;border:1px solid #e2e7ef}.od-pickup i{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;color:#15916a;background:#e1f8ef}.od-pickup small{display:block;color:#788298;font-size:7px}.od-pickup b{display:block;font-size:10px;margin-top:2px}
.od-track-list{display:grid;gap:10px}.od-track{padding:12px;border-radius:18px;background:#f7f8fe;border:1px solid #e2e7ef}.od-track-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.od-track-head b{font-size:12px}.od-track-head small{display:block;color:#788298;font-size:8px;margin-top:2px}.od-steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:14px}.od-step{position:relative;display:grid;justify-items:center;text-align:center}.od-step i{position:relative;z-index:1;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#e6e9f2;color:#9aa3b5;border:2px solid #fff;font-size:9px;font-weight:900}.od-step.done i{background:#19a875;color:#fff}.od-step.active i{background:linear-gradient(135deg,#2457e6,#6c4ee7);color:#fff;box-shadow:0 0 0 4px rgba(108,78,231,.15)}.od-step small{font-size:8px;font-weight:850;margin-top:6px;color:#8a93a6}.od-step.done small,.od-step.active small{color:var(--ink)}.od-step em{display:block;font-style:normal;font-size:7px;color:#5e4bd0;margin-top:3px;font-variant-numeric:tabular-nums;font-weight:800}.od-step em.muted{color:#a1a9b7;font-weight:600}.od-step:not(:last-child):after{content:"";position:absolute;top:12px;left:50%;width:100%;height:2px;background:#e1e5ee}.od-step.done:not(:last-child):after{background:#19a875}
.od-summary-wrap{overflow-x:auto}.od-summary{width:100%;border-collapse:collapse;font-size:9px}.od-summary th{text-align:left;font-size:7px;letter-spacing:.6px;color:#788298;font-weight:850;padding:8px 6px;border-bottom:1px solid #e2e7ef;white-space:nowrap}.od-summary td{padding:10px 6px;border-bottom:1px solid #eef1f6;font-weight:800;vertical-align:middle}.od-summary tbody tr:last-child td{border-bottom:0}.od-summary th:last-child,.od-summary td:last-child{text-align:right}.od-summary tfoot td{color:#5e4bd0;background:#f7f7ff;border-top:1px solid #e2e7ef}.od-summary tfoot td:first-child{border-radius:10px 0 0 10px}.od-summary tfoot td:last-child{border-radius:0 10px 10px 0}
.od-advice{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:16px;color:#5c4930;background:#fff8ed;border:1px solid #ffe1ba}.od-advice i{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;color:#c4661e;background:#ffe9cf;flex:0 0 auto}.od-advice b{display:block;font-size:10px}.od-advice span{display:block;font-size:9px;line-height:1.5;margin-top:3px;color:#826a4e}
.od-progress{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:13px;padding:10px 11px;border-radius:14px;background:#f4f6fa}.od-progress span{font-size:9px;color:#667187}.od-progress b{font-size:10px;color:#5645c8}.od-truck-list{display:grid;gap:9px;margin-top:11px}.od-truck-row{display:grid;grid-template-columns:28px minmax(0,1fr) 38px;gap:8px;align-items:center}.od-index{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:#eceeff;color:#5847c7;font-size:9px;font-weight:900}.od-input{display:flex;align-items:center;border:1px solid #dfe4ed;border-radius:13px;background:#fafbfe;overflow:hidden;transition:.2s}.od-input:focus-within{border-color:#6c4ee7;box-shadow:0 0 0 3px rgba(108,78,231,.12);background:#fff}.od-input input{width:100%;border:0;outline:0;background:transparent;padding:12px 11px;color:var(--ink);font-size:12px;font-weight:850;text-transform:uppercase}.od-input input::placeholder{text-transform:none;color:#a1a9b7}.od-delete{width:38px;height:38px;border:0;border-radius:11px;display:grid;place-items:center;color:#cf4d5a;background:#fdebed;cursor:pointer}.od-add{width:100%;margin-top:10px;border:1px dashed #bfc8dc;border-radius:13px;padding:10px;color:#5b53c9;background:#f7f7ff;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer}.od-format{margin-top:8px;color:#7b8496;font-size:8px;line-height:1.45}.od-format b{color:#4f5d75}.od-error{display:flex;align-items:center;gap:5px;margin-top:8px;color:#cc4653;font-size:8px;font-weight:850}
.od-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.od-submit,.od-nav{border:0;border-radius:14px;padding:13px;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:6px}.od-submit{color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7);box-shadow:0 9px 20px rgba(75,84,194,.22)}.od-submit:disabled{opacity:.45;box-shadow:none;cursor:not-allowed}.od-nav{color:#7d8798;background:#e9edf3;cursor:not-allowed}.od-nav.active{color:#fff;background:linear-gradient(135deg,#16a575,#00a9c7);box-shadow:0 9px 20px rgba(16,165,117,.22);cursor:pointer}.od-saved{display:flex;align-items:center;gap:7px;margin-top:10px;padding:9px 10px;border-radius:13px;color:#087f5b;background:#def7ed;font-size:9px;font-weight:850}
@media(max-width:390px){.od-order-id strong{font-size:16px}.od-timer{padding:7px 8px}.od-material-main{grid-template-columns:47px minmax(0,1fr)}.od-image{width:47px;height:47px}.od-material-data b{font-size:9px}.od-actions{grid-template-columns:1fr}.od-step small{font-size:7px}}
@media(min-width:700px){.od-shell{width:min(100% - 42px,850px)}.od-main{padding-top:20px}.od-card{padding:19px}.od-materials{grid-template-columns:repeat(2,minmax(0,1fr))}.od-track-list{grid-template-columns:repeat(2,minmax(0,1fr))}.od-truck-list{grid-template-columns:repeat(2,minmax(0,1fr))}.od-add{width:auto;padding-left:18px;padding-right:18px}}
`;

function ResponseTimer({ initialSeconds }) {
  const [seconds, setSeconds] = useState(Math.max(0, initialSeconds || 0));
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds > 0]);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return (
    <div className="od-timer" role="timer" aria-label={`${minutes} minutes ${secs} seconds remaining`}>
      <small><Clock3 size={9} />RESPONSE TIME</small>
      <strong>{minutes} : {secs}</strong>
    </div>
  );
}

function StatusIcon({ status }) {
  if (status === "Accepted") return <CheckCircle2 size={15} />;
  if (status === "Rejected") return <XCircle size={15} />;
  return <Clock3 size={15} />;
}

/* Returns the effective tracking status of a material for badges and summary. */
function getMaterialStatus(material) {
  if (material.sellerStatus === "Rejected") return "Rejected";
  const status = material.tracking && material.tracking.status;
  return TRACK_STEPS.includes(status) ? status : TRACK_STEPS[0];
}

/* Per-material status tracker: Confirmed -> Loading -> Loaded -> Dispatched */
function MaterialStatusTracker({ material }) {
  const tracking = material.tracking || {};
  const currentStatus = getMaterialStatus(material);
  const isRejected = currentStatus === "Rejected";
  const currentIndex = isRejected ? -1 : TRACK_STEPS.indexOf(currentStatus);

  const timeFor = step => {
    if (step === "Loaded") return tracking.loadedAt;
    if (step === "Dispatched") return tracking.dispatchedAt;
    return null;
  };

  return (
    <article className="od-track">
      <div className="od-track-head">
        <div>
          <b>{material.name}</b>
          <small>{material.quantity} · {material.vehicles} vehicle{Number(material.vehicles) === 1 ? "" : "s"} · {material.pickup}</small>
        </div>
        <span className={cx("od-status", TRACK_STYLES[currentStatus] || "pending")}>{currentStatus}</span>
      </div>
      <div className="od-steps" role="list" aria-label={`${material.name} status progress`}>
        {TRACK_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const time = timeFor(step);
          const showsTime = step === "Loaded" || step === "Dispatched";
          return (
            <div className={cx("od-step", done && "done", active && "active")} key={step} role="listitem" aria-current={active ? "step" : undefined}>
              <i>{done ? <Check size={13} /> : index + 1}</i>
              <small>{step}</small>
              {showsTime && (
                time
                  ? <em>{time}</em>
                  : <em className="muted">{done || active ? "Time not recorded" : "Pending"}</em>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function StoneRateTransporterYourOrderDetails({
  order = MOCK_ORDER,
  onBack = () => {},
  onRefresh = () => {},
  onNavigate = () => {},
  onTruckDetailsSubmit = () => {}
}) {
  const materials = order.materials || [];

  const committedVehicles = useMemo(
    () => materials.reduce((sum, material) => sum + (Number(material.vehicles) || 0), 0),
    [materials]
  );

  const [truckNumbers, setTruckNumbers] = useState(
    Array.from({ length: committedVehicles }, (_, index) => ({
      id: `truck-${Date.now()}-${index}`,
      value: ""
    }))
  );
  const [submittedNumbers, setSubmittedNumbers] = useState([]);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [truckCardOpen, setTruckCardOpen] = useState(false);

  const filledNumbers = truckNumbers
    .map(truck => truck.value.trim())
    .filter(Boolean);
  const navigationEnabled = submittedNumbers.length > 0;

  const updateTruck = (id, value) => {
    setShowEmptyWarning(false);
    setTruckNumbers(rows => rows.map(row => row.id === id ? { ...row, value } : row));
  };

  const removeTruck = id => {
    setTruckNumbers(rows => rows.filter(row => row.id !== id));
  };

  const addTruck = () => {
    setTruckNumbers(rows => [
      ...rows,
      { id: `truck-${Date.now()}-${Math.random()}`, value: "" }
    ]);
  };

  const submitTruckNumbers = () => {
    if (!filledNumbers.length) {
      setShowEmptyWarning(true);
      return;
    }
    setSubmittedNumbers(filledNumbers);
    onTruckDetailsSubmit({ order, truckNumbers: filledNumbers });
  };

  const openNavigation = () => {
    if (!navigationEnabled) return;
    onNavigate({ order, truckNumbers: submittedNumbers });
  };

  const rejectedMaterial = materials.find(material => material.sellerStatus === "Rejected");
  const statusClass = STATUS_STYLES[order.status] || "pending";

  /* Summary totals: quantity summed only when every quantity is a parsable number with the same unit. */
  const summaryTotals = useMemo(() => {
    const parsed = materials.map(material => {
      const match = String(material.quantity || "").trim().match(/^([\d.]+)\s*(.*)$/);
      return match ? { value: parseFloat(match[1]), unit: match[2].trim() } : null;
    });
    const sameUnit = parsed.length > 0 && parsed.every(item => item && !Number.isNaN(item.value) && item.unit === parsed[0].unit);
    const quantity = sameUnit
      ? `${parsed.reduce((sum, item) => sum + item.value, 0)} ${parsed[0].unit}`.trim()
      : "—";
    return { quantity, trucks: committedVehicles };
  }, [materials, committedVehicles]);

  return (
    <div className="od-app">
      <style>{styles}</style>
      <header className="od-header">
        <div className="od-shell od-head">
          <button type="button" className="od-icon-btn" onClick={onBack} aria-label="Back"><ArrowLeft size={18} /></button>
          <div className="od-logo"><i><Mountain size={15} /></i><span>Stone<em>Rate</em></span></div>
          <button type="button" className="od-icon-btn" onClick={onRefresh} aria-label="Refresh"><RefreshCw size={17} /></button>
        </div>
      </header>

      <main className="od-shell od-main">
        <section className="od-hero">
          <div className="od-hero-top">
            <div className="od-order-id"><small>ORDER ID</small><strong>{order.id}</strong></div>
            <ResponseTimer initialSeconds={order.responseSeconds} />
          </div>
          <div className="od-hero-meta">
            <div className="od-meta"><small>REQUEST TIME</small><b>{order.requestTime}</b></div>
            <div className="od-meta"><small>STATUS</small><b><span className={cx("od-status", statusClass)}><StatusIcon status={order.status} />{order.status}</span></b></div>
          </div>
        </section>

        <section className="od-card">
          <div className="od-section-title"><div><h2>Status details</h2><p>Seller response and order availability</p></div><span className="od-title-icon"><Clock3 size={18} /></span></div>
          <div className="od-status-detail"><i><StatusIcon status={order.status} /></i><span><b>{order.status}</b><span>{order.statusDetail}</span></span></div>
          {rejectedMaterial && (
            <div className="od-rejection">
              <strong><XCircle size={14} />For {rejectedMaterial.name}, the seller rejected the request</strong>
              <p>Reason: {rejectedMaterial.rejectionReason || "Material sold"}.<span className="od-apology">Sorry for the inconvenience. StoneRate is working hard to reduce such situations in future orders.</span></p>
            </div>
          )}
        </section>

        <section className="od-card">
          <div className="od-section-title"><div><h2>Materials and pickups</h2><p>Material, quantity, vehicles, and pickup location</p></div><span className="od-title-icon"><ImageIcon size={18} /></span></div>
          <div className="od-materials">
            {materials.map(material => (
              <article className="od-material" key={material.id}>
                <div className="od-material-main">
                  <span className="od-image"><img src={material.image} alt="" loading="lazy" /></span>
                  <div className="od-material-data">
                    <span><small>MATERIAL</small><b>{material.name}</b></span>
                    <span><small>QUANTITY</small><b>{material.quantity}</b></span>
                    <span><small>VEHICLES</small><b>{material.vehicles}</b></span>
                  </div>
                </div>
                <div className="od-pickup"><i><MapPin size={15} /></i><span><small>PICKUP LOCATION</small><b>{material.pickup}</b></span></div>
              </article>
            ))}
          </div>
        </section>

        {/* Truck number details — collapsible card */}
        <section className="od-card">
          <button
            type="button"
            className={cx("od-toggle", truckCardOpen ? "open" : "collapsed")}
            onClick={() => setTruckCardOpen(open => !open)}
            aria-expanded={truckCardOpen}
            aria-controls="od-truck-panel"
          >
            <div><h2 style={{ fontSize: 16, margin: 0 }}>Truck number details</h2><p style={{ fontSize: 9, color: "var(--muted)", margin: "4px 0 0" }}>{truckCardOpen ? "Add available vehicle registration numbers" : "Tap to add vehicle numbers"}</p></div>
            <span className="od-toggle-right">
              <span className="od-title-icon"><Truck size={18} /></span>
              <span className="od-chevron"><ChevronDown size={16} /></span>
            </span>
          </button>

          {!truckCardOpen && (
            <div className="od-collapse-hint">
              <Truck size={12} />
              <span><b>{filledNumbers.length}</b> of {committedVehicles} truck numbers filled{navigationEnabled ? " · Submitted" : ""}</span>
            </div>
          )}

          {truckCardOpen && (
            <div className="od-collapse-body" id="od-truck-panel">
              <div className="od-advice"><i><Navigation size={17} /></i><span><b>Add at least one truck number to unlock navigation</b><span>Please fill truck-number details so navigation access can be enabled and the StoneRate team can reach out when required.</span></span></div>
              <div className="od-progress"><span>{truckNumbers.length} field{truckNumbers.length === 1 ? "" : "s"} shown from {committedVehicles} committed vehicles</span><b>{filledNumbers.length} filled</b></div>

              <div className="od-truck-list">
                {truckNumbers.map((truck, index) => (
                  <div className="od-truck-row" key={truck.id}>
                    <span className="od-index">{index + 1}</span>
                    <label className="od-input">
                      <input
                        type="text"
                        value={truck.value}
                        onChange={event => updateTruck(truck.id, event.target.value)}
                        placeholder="AA-NN-AA-NNNN"
                        autoComplete="off"
                        aria-label={`Truck ${index + 1} registration number`}
                      />
                    </label>
                    <button type="button" className="od-delete" onClick={() => removeTruck(truck.id)} aria-label={`Delete truck ${index + 1}`}><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>

              <button type="button" className="od-add" onClick={addTruck}><Plus size={14} />Add another truck</button>
              <p className="od-format"><b>Suggested format:</b> AA-NN-AA-NNNN. The format is not compulsory. Even one entered character or number is accepted.</p>
              {showEmptyWarning && <div className="od-error"><AlertCircle size={12} />Enter at least one truck number before submitting.</div>}
              {navigationEnabled && <div className="od-saved"><CheckCircle2 size={13} />Truck details submitted. Navigation access is now available.</div>}

              <div className="od-actions">
                <button type="button" className="od-submit" onClick={submitTruckNumbers} disabled={!filledNumbers.length}><Send size={14} />Submit truck details</button>
                <button type="button" className={cx("od-nav", navigationEnabled && "active")} onClick={openNavigation} disabled={!navigationEnabled}><Navigation size={14} />Navigation</button>
              </div>
            </div>
          )}
        </section>

        {/* Status information — one tracker per material */}
        <section className="od-card">
          <div className="od-section-title"><div><h2>Status information</h2><p>Confirmed → Loading → Loaded → Dispatched, tracked per material</p></div><span className="od-title-icon"><PackageCheck size={18} /></span></div>
          <div className="od-track-list">
            {materials.map(material => (
              <MaterialStatusTracker material={material} key={material.id} />
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="od-card">
          <div className="od-section-title"><div><h2>Summary</h2><p>Material, quantity, trucks and current status</p></div><span className="od-title-icon"><ClipboardList size={18} /></span></div>
          <div className="od-summary-wrap">
            <table className="od-summary">
              <thead>
                <tr>
                  <th>MATERIAL</th>
                  <th>QTY</th>
                  <th>NO. OF TRUCKS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(material => {
                  const status = getMaterialStatus(material);
                  return (
                    <tr key={material.id}>
                      <td>{material.name}</td>
                      <td>{material.quantity}</td>
                      <td>{material.vehicles}</td>
                      <td><span className={cx("od-status", TRACK_STYLES[status] || "pending")}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total ({materials.length} material{materials.length === 1 ? "" : "s"})</td>
                  <td>{summaryTotals.quantity}</td>
                  <td>{summaryTotals.trucks}</td>
                  <td>{navigationEnabled ? `${submittedNumbers.length} truck no. submitted` : "Truck no. pending"}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
