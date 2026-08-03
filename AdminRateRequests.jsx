import React, { useEffect, useMemo, useRef, useState } from "react";

const DEMO_REQUESTS = [
  {
    requestId: "SR-260802-012",
    status: "NEW",
    materials: [
      { materialName: "40mm Crushed Stone", totalTons: 30 },
      { materialName: "20mm Crushed Stone", totalTons: 15 },
      { materialName: "GSB", totalTons: 17 }
    ],
    deliveryArea: "Hoskote",
    createdAt: "2026-08-02T17:02:00.000Z",
    quotePublishedAt: null,
    validUntil: null,
    acceptedAt: null,
    rejectedAt: null,
    expiredAt: null,
    updatedAt: "2026-08-02T17:02:00.000Z"
  },
  {
    requestId: "SR-260802-011",
    status: "RATE PROVIDED",
    materials: [{ materialName: "M-Sand", totalTons: 42 }],
    deliveryArea: "Whitefield",
    createdAt: "2026-08-02T13:35:00.000Z",
    quotePublishedAt: "2026-08-02T17:08:00.000Z",
    validUntil: "2026-08-02T21:08:00.000Z",
    acceptedAt: null,
    rejectedAt: null,
    expiredAt: null,
    updatedAt: "2026-08-02T17:08:00.000Z"
  },
  {
    requestId: "SR-260802-010",
    status: "NEW",
    materials: [{ materialName: "River Sand", totalTons: 18 }],
    deliveryArea: "Sarjapur",
    createdAt: "2026-08-02T14:52:00.000Z",
    quotePublishedAt: null,
    validUntil: null,
    acceptedAt: null,
    rejectedAt: null,
    expiredAt: null,
    updatedAt: "2026-08-02T14:52:00.000Z"
  },
  {
    requestId: "SR-260802-009",
    status: "ACCEPTED",
    materials: [
      { materialName: "20mm Aggregate", totalTons: 24 },
      { materialName: "Manufactured Sand", totalTons: 28 }
    ],
    deliveryArea: "KR Puram",
    createdAt: "2026-08-02T11:20:00.000Z",
    quotePublishedAt: "2026-08-02T14:10:00.000Z",
    validUntil: "2026-08-02T18:10:00.000Z",
    acceptedAt: "2026-08-02T16:55:00.000Z",
    rejectedAt: null,
    expiredAt: null,
    updatedAt: "2026-08-02T16:55:00.000Z"
  },
  {
    requestId: "SR-260802-008",
    status: "REJECTED",
    materials: [
      { materialName: "Red Soil", totalTons: 50 },
      { materialName: "Quarry Dust", totalTons: 12 }
    ],
    deliveryArea: "Devanahalli",
    createdAt: "2026-08-02T10:05:00.000Z",
    quotePublishedAt: "2026-08-02T13:22:00.000Z",
    validUntil: "2026-08-02T17:22:00.000Z",
    acceptedAt: null,
    rejectedAt: "2026-08-02T17:06:00.000Z",
    expiredAt: null,
    updatedAt: "2026-08-02T17:06:00.000Z"
  },
  {
    requestId: "SR-260802-007",
    status: "EXPIRED",
    materials: [{ materialName: "WMM", totalTons: 65 }],
    deliveryArea: "Yelahanka",
    createdAt: "2026-08-02T09:02:00.000Z",
    quotePublishedAt: null,
    validUntil: null,
    acceptedAt: null,
    rejectedAt: null,
    expiredAt: "2026-08-02T15:02:00.000Z",
    updatedAt: "2026-08-02T15:02:00.000Z"
  },
  {
    requestId: "SR-260802-006",
    status: "RATE PROVIDED",
    materials: [
      { materialName: "6mm Chips", totalTons: 10 },
      { materialName: "12mm Aggregate", totalTons: 16 },
      { materialName: "Plastering Sand", totalTons: 22 }
    ],
    deliveryArea: "Electronic City",
    createdAt: "2026-08-02T12:18:00.000Z",
    quotePublishedAt: "2026-08-02T16:35:00.000Z",
    validUntil: "2026-08-02T20:35:00.000Z",
    acceptedAt: null,
    rejectedAt: null,
    expiredAt: null,
    updatedAt: "2026-08-02T16:35:00.000Z"
  }
];

const FILTERS = ["ALL", "NEW", "RATE PROVIDED", "ACCEPTED", "REJECTED", "EXPIRED"];
const FILTER_LABELS = { ALL: "All", NEW: "New", "RATE PROVIDED": "Rate Provided", ACCEPTED: "Accepted", REJECTED: "Rejected", EXPIRED: "Expired" };
const STATUS_CLASS = { NEW: "new", "RATE PROVIDED": "provided", ACCEPTED: "accepted", REJECTED: "rejected", EXPIRED: "expired" };

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  const paths = {
    back: <><path d="m15 18-6-6 6-6"/><path d="M9 12h10"/></>,
    refresh: <><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M6.1 9a7 7 0 0 1 11.6-2.6L20 9"/><path d="m4 15 2.3 2.6A7 7 0 0 0 18 15"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    close: <><path d="m7 7 10 10"/><path d="m17 7-10 10"/></>,
    sort: <><path d="M8 6h12"/><path d="M8 12h9"/><path d="M8 18h6"/><path d="m3 8 2-2 2 2"/><path d="M5 6v12"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    arrow: <><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    orders: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    samples: <><path d="m9 3 6 0"/><path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/><path d="M8 15h8"/></>,
    alert: <><path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    inbox: <><path d="M4 5h16v14H4z"/><path d="M4 14h4l2 2h4l2-2h4"/></>,
    cube: <><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z"/><path d="m4 6.5 8 4.5 8-4.5M12 11v9"/></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function getDeadline(request) {
  if (request.status === "NEW") return new Date(request.createdAt).getTime() + 6 * 60 * 60 * 1000;
  if (request.status === "RATE PROVIDED" && request.validUntil) return new Date(request.validUntil).getTime();
  return null;
}

function effectiveStatus(request, now) {
  const deadline = getDeadline(request);
  if ((request.status === "NEW" || request.status === "RATE PROVIDED") && deadline && deadline <= now) return "EXPIRED";
  return request.status;
}

function relativeTime(iso, now) {
  if (!iso) return "";
  const delta = Math.max(0, now - new Date(iso).getTime());
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function countdown(deadline, now) {
  const ms = deadline - now;
  if (ms <= 0) return "Expired";
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

function statusTimestamp(request, status) {
  if (status === "ACCEPTED") return request.acceptedAt;
  if (status === "REJECTED") return request.rejectedAt;
  if (status === "EXPIRED") return request.expiredAt || new Date(getDeadline(request)).toISOString();
  if (status === "RATE PROVIDED") return request.quotePublishedAt;
  return request.createdAt;
}

function UrgencyTime({ request, now, status }) {
  if (status === "NEW" || status === "RATE PROVIDED") {
    const deadline = getDeadline(request);
    const remaining = deadline - now;
    const redLimit = status === "NEW" ? 30 * 60000 : 15 * 60000;
    const amberLimit = status === "NEW" ? 2 * 60 * 60000 : 60 * 60000;
    const level = remaining < redLimit ? "critical" : remaining <= amberLimit ? "warning" : status === "NEW" ? "safe" : "teal";
    return (
      <div className={`sr-rr-countdown ${level}${level === "critical" ? " sr-rr-pulse" : ""}`}>
        <Icon name="clock" size={15}/>
        <span>{status === "NEW" ? "Time left" : "Buyer response time left"}</span>
        <strong>{countdown(deadline, now)}</strong>
      </div>
    );
  }
  return null;
}

function RequestCard({ request, now, onOpen }) {
  const status = effectiveStatus(request, now);
  const timeLabel = status === "NEW" ? "Submitted" : status === "RATE PROVIDED" ? "Rate provided" : status === "ACCEPTED" ? "Accepted" : status === "REJECTED" ? "Rejected" : "Expired";
  const timestamp = statusTimestamp(request, status);
  const handleKeyDown = event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(request);
    }
  };
  return (
    <article className={`sr-rr-card status-${STATUS_CLASS[status]}`} role="button" tabIndex="0" onClick={() => onOpen(request)} onKeyDown={handleKeyDown} aria-label={`View request ${request.requestId}`}>
      <div className="sr-rr-card-accent"/>
      <div className="sr-rr-card-glow" aria-hidden="true"/>
      <header className="sr-rr-card-head">
        <div className="sr-rr-id-wrap"><span className="sr-rr-id-dot"/><strong>{request.requestId}</strong></div>
        <span className={`sr-rr-badge ${STATUS_CLASS[status]}`}>{status}</span>
      </header>
      <div className="sr-rr-materials" aria-label="Materials and quantities">
        {request.materials.map((material, index) => (
          <div className="sr-rr-material" key={`${material.materialName}-${index}`}>
            <span className="sr-rr-material-icon"><Icon name="cube" size={14}/></span>
            <span className="sr-rr-material-name">{material.materialName}</span>
            <strong>{material.totalTons} t</strong>
          </div>
        ))}
      </div>
      <div className="sr-rr-meta-row">
        <div className="sr-rr-meta"><Icon name="pin" size={15}/><span>Delivery area</span><strong>{request.deliveryArea}</strong></div>
        <div className="sr-rr-meta"><Icon name="clock" size={15}/><span>{timeLabel}</span><strong>{relativeTime(timestamp, now)}</strong></div>
      </div>
      <div className="sr-rr-card-foot">
        <UrgencyTime request={request} now={now} status={status}/>
        <span className="sr-rr-view">View Request <Icon name="arrow" size={15}/></span>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return <div className="sr-rr-card sr-rr-skeleton" aria-hidden="true"><div className="sk sk-top"/><div className="sk sk-chip"/><div className="sk sk-line wide"/><div className="sk sk-line mid"/><div className="sk sk-bottom"/></div>;
}

export default function AdminRateRequests({ onBack, onOpenRequest, onHome, onOrders, onSamples }) {
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("urgent");
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [refreshedAt, setRefreshedAt] = useState(() => Date.now());
  const toastTimer = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    const handleVisibility = () => { if (!document.hidden) setNow(Date.now()); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = message => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  };

  const counts = useMemo(() => {
    const result = { ALL: requests.length, NEW: 0, "RATE PROVIDED": 0, ACCEPTED: 0, REJECTED: 0, EXPIRED: 0 };
    requests.forEach(request => { result[effectiveStatus(request, now)] += 1; });
    return result;
  }, [requests, now]);

  const visibleRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matched = requests.filter(request => {
      const status = effectiveStatus(request, now);
      const passesFilter = filter === "ALL" || status === filter;
      const materialText = request.materials.map(item => item.materialName).join(" ").toLowerCase();
      const passesSearch = !normalized || request.requestId.toLowerCase().includes(normalized) || request.deliveryArea.toLowerCase().includes(normalized) || materialText.includes(normalized);
      return passesFilter && passesSearch;
    });
    return [...matched].sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "quantity") {
        const total = request => request.materials.reduce((sum, item) => sum + item.totalTons, 0);
        return total(b) - total(a);
      }
      const aStatus = effectiveStatus(a, now);
      const bStatus = effectiveStatus(b, now);
      const aActive = aStatus === "NEW" || aStatus === "RATE PROVIDED";
      const bActive = bStatus === "NEW" || bStatus === "RATE PROVIDED";
      if (aActive && bActive) return getDeadline(a) - getDeadline(b);
      if (aActive !== bActive) return aActive ? -1 : 1;
      return new Date(statusTimestamp(b, bStatus)) - new Date(statusTimestamp(a, aStatus));
    });
  }, [requests, query, filter, sort, now]);

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    window.setTimeout(() => {
      setRequests([...DEMO_REQUESTS]);
      const refreshed = Date.now();
      setNow(refreshed);
      setRefreshedAt(refreshed);
      setLoading(false);
      showToast("Rate requests refreshed");
    }, 520);
  };

  const handleOpen = request => {
    if (onOpenRequest) onOpenRequest(request);
    else showToast(`Opening ${request.requestId}`);
  };

  const handleNav = (callback, label) => {
    if (callback) callback();
    else showToast(`${label} selected`);
  };

  const retry = () => {
    setError("");
    setLoading(true);
    window.setTimeout(() => { setRequests([...DEMO_REQUESTS]); setNow(Date.now()); setLoading(false); }, 500);
  };

  return (
    <div className="sr-rate-requests">
      <style>{`
        .sr-rate-requests{--sr-bg:#f4f6fb;--sr-bg-soft:#ffffff;--sr-surface:rgba(255,255,255,.86);--sr-surface-solid:#ffffff;--sr-line:#e3e8f0;--sr-line-strong:#d3dae6;--sr-ink:#172033;--sr-muted:#667085;--sr-blue:#2f6fd0;--sr-blue-soft:rgba(47,111,208,.10);--sr-blue-ink:#2058ad;--sr-amber:#e08b1e;--sr-amber-soft:rgba(224,139,30,.12);--sr-amber-ink:#a15c07;--sr-green:#1f9463;--sr-green-soft:rgba(31,148,99,.12);--sr-green-ink:#0f7a4c;--sr-red:#d64545;--sr-red-soft:rgba(214,69,69,.10);--sr-red-ink:#b42318;--sr-cyan:#19b6c9;--sr-cyan-soft:rgba(25,182,201,.12);--sr-cyan-ink:#08776d;min-height:100dvh;box-sizing:border-box;color:var(--sr-ink);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--sr-bg);position:relative;isolation:isolate;overflow-x:hidden;padding-bottom:78px}
        .sr-rate-requests *{box-sizing:border-box}
        .sr-rate-requests:before{content:"";position:fixed;inset:0;z-index:-3;background:radial-gradient(720px 420px at 8% -6%,rgba(47,111,208,.10),transparent 62%),radial-gradient(640px 460px at 100% 0%,rgba(224,139,30,.10),transparent 58%),radial-gradient(900px 620px at 50% 120%,rgba(25,182,201,.08),transparent 60%),linear-gradient(180deg,#f9fafc,#f2f5f9 45%,#f4f6fb)}
        .sr-rate-requests:after{content:"";position:fixed;inset:0;z-index:-2;opacity:.4;background-image:linear-gradient(rgba(65,84,115,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(65,84,115,.05) 1px,transparent 1px);background-size:34px 34px;mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,#000,transparent 72%)}
        .sr-rr-noise{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.025;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        .sr-rr-shell{width:min(100%,1020px);margin:0 auto;padding:12px 12px 20px;position:relative;z-index:1}
        .sr-rr-header{display:flex;align-items:center;gap:10px;padding:3px 0 14px}
        .sr-rr-icon-btn{width:38px;height:38px;border:1px solid var(--sr-line-strong);border-radius:11px;color:var(--sr-ink);background:var(--sr-surface);box-shadow:0 3px 12px rgba(16,24,40,.06),inset 0 1px 0 rgba(255,255,255,.6);display:grid;place-items:center;cursor:pointer;transition:.2s ease;flex:0 0 auto;backdrop-filter:blur(14px)}
        .sr-rr-icon-btn:hover{transform:translateY(-1px);border-color:rgba(47,111,208,.4);background:rgba(47,111,208,.06);box-shadow:0 6px 18px rgba(47,111,208,.14)}.sr-rr-icon-btn:active{transform:translateY(0)}.sr-rr-icon-btn:focus-visible,.sr-rr-card:focus-visible,.sr-rr-filter:focus-visible,.sr-rr-view:focus-visible{outline:2px solid rgba(47,111,208,.4);outline-offset:2px}
        .sr-rr-title{min-width:0;flex:1}.sr-rr-title h1{margin:0;font-size:20px;line-height:1.2;letter-spacing:-.02em;background:linear-gradient(135deg,#172033,#2f6fd0);-webkit-background-clip:text;background-clip:text;color:transparent}.sr-rr-title p{margin:3px 0 0;color:var(--sr-muted);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sr-rr-count-pill{display:none;background:var(--sr-surface);border:1px solid var(--sr-line-strong);border-radius:999px;padding:5px 10px;font-size:11px;color:var(--sr-blue-ink);font-weight:700;letter-spacing:.02em}
        .sr-rr-refresh svg{transition:transform .35s}.sr-rr-refresh:hover svg{transform:rotate(90deg)}
        .sr-rr-toolbar{position:relative;background:var(--sr-surface);border:1px solid var(--sr-line);box-shadow:0 8px 24px rgba(28,39,58,.06),inset 0 1px 0 rgba(255,255,255,.6);border-radius:16px;padding:10px;backdrop-filter:blur(16px)}
        .sr-rr-toolbar:before{content:"";position:absolute;inset:0;border-radius:16px;padding:1px;background:linear-gradient(120deg,rgba(47,111,208,.22),transparent 30%,transparent 70%,rgba(224,139,30,.18));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
        .sr-rr-search{height:41px;display:flex;align-items:center;gap:8px;padding:0 11px;border:1px solid var(--sr-line-strong);border-radius:11px;background:#fff;color:var(--sr-muted);transition:.2s}.sr-rr-search:focus-within{border-color:rgba(47,111,208,.5);box-shadow:0 0 0 3px rgba(47,111,208,.12);color:var(--sr-blue-ink)}.sr-rr-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:var(--sr-ink);font:inherit;font-size:13px}.sr-rr-search input::placeholder{color:#98a2b3}.sr-rr-clear{border:0;background:#eef2f6;color:#596579;width:24px;height:24px;border-radius:7px;display:grid;place-items:center;cursor:pointer;padding:0}
        .sr-rr-controls{display:flex;gap:8px;align-items:center;margin-top:8px;min-width:0}.sr-rr-filters{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;min-width:0;flex:1;padding:1px}.sr-rr-filters::-webkit-scrollbar{display:none}.sr-rr-filter{height:31px;white-space:nowrap;border:1px solid var(--sr-line-strong);background:#fff;color:var(--sr-muted);border-radius:9px;padding:0 10px;font-size:11.5px;font-weight:700;cursor:pointer;transition:.18s}.sr-rr-filter:hover{border-color:rgba(47,111,208,.35);color:var(--sr-ink)}.sr-rr-filter.active{color:var(--sr-blue-ink);border-color:rgba(47,111,208,.4);background:linear-gradient(135deg,rgba(47,111,208,.12),rgba(25,182,201,.08));box-shadow:inset 0 -2px 0 var(--sr-blue)}.sr-rr-filter span{margin-left:4px;color:#8b95a5}.sr-rr-filter.active span{color:var(--sr-blue-ink)}
        .sr-rr-sort{height:31px;border:1px solid var(--sr-line-strong);background:#fff;color:var(--sr-ink);border-radius:9px;padding:0 25px 0 28px;font-size:11.5px;font-weight:700;max-width:139px;outline:none;cursor:pointer}.sr-rr-sort-wrap{position:relative;flex:0 0 auto}.sr-rr-sort-wrap svg{position:absolute;left:8px;top:8px;pointer-events:none;color:var(--sr-muted)}.sr-rr-sort option{background:#fff;color:var(--sr-ink)}
        .sr-rr-summary{display:flex;align-items:center;justify-content:space-between;margin:12px 2px 8px;color:var(--sr-muted);font-size:11px}.sr-rr-summary strong{color:var(--sr-ink)}.sr-rr-updated{display:flex;align-items:center;gap:5px}
        .sr-rr-list{display:grid;gap:10px}.sr-rr-card{position:relative;overflow:hidden;background:var(--sr-surface);border:1px solid var(--sr-line);border-radius:15px;padding:12px 12px 10px;box-shadow:0 4px 16px rgba(16,24,40,.06),inset 0 1px 0 rgba(255,255,255,.6);cursor:pointer;transition:border-color .2s,box-shadow .2s,transform .2s;min-width:0;backdrop-filter:blur(14px)}.sr-rr-card:hover{transform:translateY(-2px);border-color:rgba(47,111,208,.3);box-shadow:0 14px 32px rgba(16,24,40,.10)}
        .sr-rr-card-glow{position:absolute;inset:-40% -40% auto auto;width:60%;height:60%;background:radial-gradient(circle,rgba(47,111,208,.08),transparent 70%);pointer-events:none;opacity:0;transition:opacity .3s}.sr-rr-card:hover .sr-rr-card-glow{opacity:1}
        .sr-rr-card-accent{position:absolute;inset:0 auto 0 0;width:3px;background:linear-gradient(var(--sr-blue),var(--sr-cyan))}.status-provided .sr-rr-card-accent{background:linear-gradient(var(--sr-cyan),var(--sr-amber))}.status-accepted .sr-rr-card-accent{background:var(--sr-green)}.status-rejected .sr-rr-card-accent{background:var(--sr-red)}.status-expired .sr-rr-card-accent{background:#98a2b3}
        .sr-rr-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-left:2px}.sr-rr-id-wrap{display:flex;align-items:center;gap:7px;font-size:12.5px;letter-spacing:.03em;color:var(--sr-ink);font-family:"SF Mono",ui-monospace,Menlo,Consolas,monospace}.sr-rr-id-dot{width:6px;height:6px;border-radius:50%;background:var(--sr-amber);box-shadow:0 0 0 3px var(--sr-amber-soft)}.sr-rr-badge{flex:0 0 auto;padding:4px 8px;border-radius:6px;font-size:9.5px;line-height:1;font-weight:800;letter-spacing:.06em;border:1px solid}.sr-rr-badge.new{color:var(--sr-blue-ink);background:var(--sr-blue-soft);border-color:rgba(47,111,208,.3)}.sr-rr-badge.provided{color:var(--sr-amber-ink);background:linear-gradient(135deg,var(--sr-amber-soft),var(--sr-cyan-soft));border-color:rgba(224,139,30,.3)}.sr-rr-badge.accepted{color:var(--sr-green-ink);background:var(--sr-green-soft);border-color:rgba(31,148,99,.3)}.sr-rr-badge.rejected{color:var(--sr-red-ink);background:var(--sr-red-soft);border-color:rgba(214,69,69,.3)}.sr-rr-badge.expired{color:var(--sr-muted);background:#f2f4f7;border-color:var(--sr-line-strong)}
        .sr-rr-materials{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.sr-rr-material{display:inline-flex;align-items:center;gap:5px;min-width:0;max-width:100%;padding:5px 8px 5px 5px;border:1px solid var(--sr-line);background:linear-gradient(135deg,#fafbfc,#f5f7fa);border-radius:8px;font-size:11.5px;color:#344054}.sr-rr-material-icon{display:grid;place-items:center;width:21px;height:21px;flex:0 0 auto;border-radius:6px;background:var(--sr-amber-soft);color:var(--sr-amber-ink)}.sr-rr-material-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sr-rr-material strong{white-space:nowrap;color:var(--sr-ink);padding-left:2px}
        .sr-rr-meta-row{display:grid;grid-template-columns:1fr;gap:5px;padding:9px 0;border-top:1px solid var(--sr-line);border-bottom:1px solid var(--sr-line)}.sr-rr-meta{display:flex;align-items:center;gap:5px;min-width:0;font-size:11.5px;color:var(--sr-muted)}.sr-rr-meta svg{color:#718096;flex:0 0 auto}.sr-rr-meta span{white-space:nowrap}.sr-rr-meta strong{color:var(--sr-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sr-rr-card-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:9px;min-height:26px}.sr-rr-countdown{display:flex;align-items:center;gap:5px;min-width:0;font-size:10.5px;font-weight:600;color:var(--sr-muted)}.sr-rr-countdown span{white-space:nowrap}.sr-rr-countdown strong{white-space:nowrap;border-radius:5px;padding:3px 6px}.sr-rr-countdown.safe strong{color:var(--sr-blue-ink);background:var(--sr-blue-soft)}.sr-rr-countdown.teal strong{color:var(--sr-cyan-ink);background:var(--sr-cyan-soft)}.sr-rr-countdown.warning strong{color:var(--sr-amber-ink);background:var(--sr-amber-soft)}.sr-rr-countdown.critical strong{color:var(--sr-red-ink);background:var(--sr-red-soft)}.sr-rr-countdown.warning svg{color:var(--sr-amber-ink)}.sr-rr-countdown.critical svg{color:var(--sr-red-ink)}.sr-rr-pulse strong{animation:srRrPulse 1.8s ease-in-out infinite}.sr-rr-view{display:flex;align-items:center;gap:3px;white-space:nowrap;color:var(--sr-blue-ink);font-size:11.5px;font-weight:800}.sr-rr-view svg{transition:transform .18s}.sr-rr-card:hover .sr-rr-view svg{transform:translateX(2px)}
        @keyframes srRrPulse{0%,100%{box-shadow:0 0 0 0 rgba(214,69,69,0)}50%{box-shadow:0 0 0 3px rgba(214,69,69,.12)}}
        .sr-rr-state{min-height:230px;border:1px dashed var(--sr-line-strong);border-radius:15px;background:var(--sr-surface);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;color:var(--sr-muted);backdrop-filter:blur(14px)}.sr-rr-state-icon{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:var(--sr-blue-soft);color:var(--sr-blue-ink);margin-bottom:10px}.sr-rr-state.error .sr-rr-state-icon{background:var(--sr-red-soft);color:var(--sr-red-ink)}.sr-rr-state h2{font-size:14px;color:var(--sr-ink);margin:0 0 5px}.sr-rr-state p{font-size:12px;margin:0;max-width:330px}.sr-rr-retry{margin-top:12px;border:1px solid var(--sr-line-strong);background:#fff;border-radius:9px;color:var(--sr-ink);padding:7px 13px;font-weight:700;font-size:12px;cursor:pointer}.sr-rr-retry:hover{border-color:rgba(47,111,208,.4)}.sr-rr-skeleton{height:145px;cursor:default}.sr-rr-skeleton:hover{transform:none}.sk{border-radius:6px;background:linear-gradient(90deg,#edf0f4 25%,#f7f8fa 45%,#edf0f4 65%);background-size:220% 100%;animation:srShimmer 1.25s infinite}.sk-top{width:37%;height:13px}.sk-chip{position:absolute;right:12px;top:12px;width:73px;height:19px}.sk-line{height:23px;margin-top:14px}.sk-line.wide{width:72%}.sk-line.mid{width:48%;height:10px}.sk-bottom{width:100%;height:26px;margin-top:14px}@keyframes srShimmer{to{background-position:-220% 0}}
        .sr-rr-toast{position:fixed;z-index:50;left:50%;bottom:79px;transform:translate(-50%,10px);opacity:0;pointer-events:none;background:#172033;color:#fff;border:1px solid rgba(255,255,255,.12);box-shadow:0 12px 30px rgba(16,24,40,.25);border-radius:10px;padding:9px 14px;font-size:12px;font-weight:650;white-space:nowrap;transition:.25s}.sr-rr-toast.show{opacity:1;transform:translate(-50%,0)}
        .sr-rr-bottom{position:fixed;z-index:30;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,1020px);padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:rgba(249,250,252,.9);border-top:1px solid var(--sr-line-strong);backdrop-filter:blur(20px);display:grid;grid-template-columns:repeat(3,1fr);gap:4px}.sr-rr-nav{height:48px;border:0;background:transparent;color:#778295;border-radius:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:9.5px;font-weight:700;cursor:pointer;position:relative}.sr-rr-nav:hover{background:#f0f4f9;color:#475467}.sr-rr-nav.active{color:var(--sr-amber-ink);background:linear-gradient(180deg,var(--sr-amber-soft),transparent)}.sr-rr-nav.active:before{content:"";position:absolute;top:-8px;width:33px;height:2px;border-radius:9px;background:linear-gradient(90deg,var(--sr-amber),var(--sr-cyan))}
        @media(min-width:430px){.sr-rr-shell{padding:14px 16px 22px}.sr-rr-count-pill{display:block}.sr-rr-meta-row{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.sr-rr-bottom{padding-left:16px;padding-right:16px}}
        @media(min-width:720px){.sr-rr-shell{padding-top:18px}.sr-rr-title h1{font-size:22px}.sr-rr-toolbar{display:grid;grid-template-columns:minmax(260px,.75fr) minmax(0,1.25fr);align-items:center;gap:10px}.sr-rr-controls{margin:0}.sr-rr-list{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.sr-rr-card{padding:13px}.sr-rr-bottom{border:1px solid var(--sr-line-strong);border-bottom:0;border-radius:16px 16px 0 0;box-shadow:0 -6px 22px rgba(16,24,40,.06)}}
        @media(prefers-reduced-motion:reduce){.sr-rate-requests *{animation:none!important;transition:none!important}}
      `}</style>
      <div className="sr-rr-noise" aria-hidden="true"/>
      <main className="sr-rr-shell">
        <header className="sr-rr-header">
          <button className="sr-rr-icon-btn" type="button" onClick={() => onBack ? onBack() : showToast("Back navigation") } aria-label="Go back"><Icon name="back"/></button>
          <div className="sr-rr-title"><h1>Rate Requests</h1><p>Review buyer requests and publish material-wise rates</p></div>
          <span className="sr-rr-count-pill">{visibleRequests.length} visible</span>
          <button className="sr-rr-icon-btn sr-rr-refresh" type="button" onClick={handleRefresh} aria-label="Refresh rate requests"><Icon name="refresh"/></button>
        </header>

        <section className="sr-rr-toolbar" aria-label="Search, filter, and sort rate requests">
          <label className="sr-rr-search">
            <Icon name="search" size={17}/>
            <input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by request ID, material, or delivery area" aria-label="Search requests"/>
            {query && <button className="sr-rr-clear" type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }} aria-label="Clear search"><Icon name="close" size={14}/></button>}
          </label>
          <div className="sr-rr-controls">
            <div className="sr-rr-filters" role="tablist" aria-label="Request status">
              {FILTERS.map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} className={`sr-rr-filter${filter === item ? " active" : ""}`} onClick={() => setFilter(item)}>{FILTER_LABELS[item]} <span>{counts[item]}</span></button>)}
            </div>
            <label className="sr-rr-sort-wrap" aria-label="Sort requests"><Icon name="sort" size={15}/><select className="sr-rr-sort" value={sort} onChange={event => setSort(event.target.value)}><option value="urgent">Urgent first</option><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="quantity">Highest quantity</option></select></label>
          </div>
        </section>

        <div className="sr-rr-summary"><strong>{loading ? "Loading requests" : `${visibleRequests.length} request${visibleRequests.length === 1 ? "" : "s"}`}</strong><span className="sr-rr-updated"><Icon name="refresh" size={12}/> Updated {relativeTime(new Date(refreshedAt).toISOString(), now)}</span></div>

        {error ? (
          <section className="sr-rr-state error"><div className="sr-rr-state-icon"><Icon name="alert" size={22}/></div><h2>Could not load rate requests</h2><p>{error}</p><button type="button" className="sr-rr-retry" onClick={retry}>Retry</button></section>
        ) : loading ? (
          <section className="sr-rr-list" aria-label="Loading requests"><SkeletonCard/><SkeletonCard/><SkeletonCard/><SkeletonCard/></section>
        ) : visibleRequests.length === 0 ? (
          <section className="sr-rr-state"><div className="sr-rr-state-icon"><Icon name="inbox" size={22}/></div><h2>{query.trim() ? `No requests found for “${query.trim()}”.` : "No rate requests match this filter."}</h2><p>{query.trim() ? "Try another request ID, material, or delivery area." : "Choose another status to review available requests."}</p>{query.trim() && <button type="button" className="sr-rr-retry" onClick={() => setQuery("")}>Clear search</button>}</section>
        ) : (
          <section className="sr-rr-list" aria-label="Rate requests">{visibleRequests.map(request => <RequestCard key={request.requestId} request={request} now={now} onOpen={handleOpen}/>)}</section>
        )}
      </main>

      <nav className="sr-rr-bottom" aria-label="Admin navigation">
        <button className="sr-rr-nav" type="button" onClick={() => handleNav(onHome, "Home")}><Icon name="home" size={19}/><span>Home</span></button>
        <button className="sr-rr-nav active" type="button" aria-current="page" onClick={() => handleNav(onOrders, "Orders")}><Icon name="orders" size={19}/><span>Orders</span></button>
        <button className="sr-rr-nav" type="button" onClick={() => handleNav(onSamples, "Samples")}><Icon name="samples" size={19}/><span>Samples</span></button>
      </nav>
      <div className={`sr-rr-toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </div>
  );
}
