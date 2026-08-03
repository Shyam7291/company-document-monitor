import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ===========================================================================
 * StoneRate — Admin · Rate Requests
 * High-tech operations console. Theme: white surface + signal orange.
 * Self-contained: all styles live in the STYLES constant at the bottom.
 * ========================================================================= */

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
    buyer: "Sri Venkateshwara Infra",
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
    buyer: "Prestige Buildtech",
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
    buyer: "Anand Constructions",
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
    buyer: "Nakshatra Developers",
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
    buyer: "GreenField Estates",
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
    buyer: "Highway Works Div. 4",
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
    buyer: "Urbanline Projects",
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

const FILTER_LABELS = {
  ALL: "All",
  NEW: "New",
  "RATE PROVIDED": "Rate Provided",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired"
};

const STATUS_CLASS = {
  NEW: "new",
  "RATE PROVIDED": "provided",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired"
};

const NEW_WINDOW_MS = 6 * 60 * 60 * 1000;
const QUOTE_WINDOW_MS = 4 * 60 * 60 * 1000;

/* ---------------------------------------------------------------- Icons -- */

function Icon({ name, size = 18, strokeWidth = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  };
  const paths = {
    back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M6.1 9a7 7 0 0 1 11.6-2.6L20 9" /><path d="m4 15 2.3 2.6A7 7 0 0 0 18 15" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    close: <><path d="m7 7 10 10" /><path d="m17 7-10 10" /></>,
    sort: <><path d="M8 6h12" /><path d="M8 12h9" /><path d="M8 18h6" /><path d="m3 8 2-2 2 2" /><path d="M5 6v12" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    orders: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    samples: <><path d="m9 3 6 0" /><path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3" /><path d="M8 15h8" /></>,
    alert: <><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    inbox: <><path d="M4 5h16v14H4z" /><path d="M4 14h4l2 2h4l2-2h4" /></>,
    cube: <><path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" /><path d="m4 6.5 8 4.5 8-4.5M12 11v9" /></>,
    bolt: <><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></>,
    pulse: <><path d="M3 12h4l2.5-7 4 14L16 12h5" /></>,
    scale: <><path d="M12 4v16" /><path d="M6 8h12" /><path d="m6 8-3 6h6l-3-6Z" /><path d="m18 8-3 6h6l-3-6Z" /></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.6" /></>,
    rows: <><rect x="3.5" y="5" width="17" height="5" rx="1.6" /><rect x="3.5" y="14" width="17" height="5" rx="1.6" /></>,
    check: <><path d="m5 13 4.5 4.5L19 7" /></>,
    user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" /></>,
    target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6.4 6.4 2.8 2.8M14.8 14.8l2.8 2.8M17.6 6.4l-2.8 2.8M9.2 14.8l-2.8 2.8" /></>,
    flag: <><path d="M5 21V4" /><path d="M5 5h11l-2 3.5L16 12H5" /></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

/* ------------------------------------------------------------ Utilities -- */

function getDeadline(request) {
  if (request.status === "NEW") return new Date(request.createdAt).getTime() + NEW_WINDOW_MS;
  if (request.status === "RATE PROVIDED" && request.validUntil) return new Date(request.validUntil).getTime();
  return null;
}

function getWindow(status) {
  return status === "NEW" ? NEW_WINDOW_MS : QUOTE_WINDOW_MS;
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
  if (mins < 60) return mins + " min ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h " + (mins % 60) + "m ago";
  return Math.floor(hours / 24) + "d ago";
}

function countdown(deadline, now) {
  const ms = deadline - now;
  if (ms <= 0) return "00:00";
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

function clockTime(iso) {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusTimestamp(request, status) {
  if (status === "ACCEPTED") return request.acceptedAt;
  if (status === "REJECTED") return request.rejectedAt;
  if (status === "EXPIRED") return request.expiredAt || new Date(getDeadline(request) || Date.now()).toISOString();
  if (status === "RATE PROVIDED") return request.quotePublishedAt;
  return request.createdAt;
}

function totalTons(request) {
  return request.materials.reduce((sum, item) => sum + item.totalTons, 0);
}

function urgencyLevel(status, remaining) {
  if (status !== "NEW" && status !== "RATE PROVIDED") return "idle";
  const redLimit = status === "NEW" ? 30 * 60000 : 15 * 60000;
  const amberLimit = status === "NEW" ? 2 * 60 * 60000 : 60 * 60000;
  if (remaining < redLimit) return "critical";
  if (remaining <= amberLimit) return "warning";
  return "steady";
}

/* --------------------------------------------------------- Sub-elements -- */

function Corners() {
  return (
    <span className="rq-corners" aria-hidden="true">
      <i className="c tl" /><i className="c tr" /><i className="c bl" /><i className="c br" />
    </span>
  );
}

function CountdownRing({ ratio, level, label, value }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(1, ratio));
  const dash = safe * circumference;
  return (
    <div className={"rq-ring level-" + level}>
      <div className="rq-ring-dial">
        <svg viewBox="0 0 40 40" width="40" height="40" role="img" aria-label={label + " " + value}>
          <title>{label}</title>
          <circle className="rq-ring-track" cx="20" cy="20" r={radius} />
          <circle
            className="rq-ring-bar"
            cx="20"
            cy="20"
            r={radius}
            strokeDasharray={dash + " " + circumference}
            transform="rotate(-90 20 20)"
          />
        </svg>
        <span className="rq-ring-core" />
      </div>
      <div className="rq-ring-text">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, unit, hint, bars, tone }) {
  return (
    <article className={"rq-metric tone-" + tone}>
      <Corners />
      <div className="rq-metric-head">
        <span className="rq-metric-icon"><Icon name={icon} size={15} /></span>
        <span className="rq-metric-label">{label}</span>
      </div>
      <div className="rq-metric-value">
        {value}
        {unit ? <em>{unit}</em> : null}
      </div>
      <div className="rq-metric-foot">
        <span className="rq-metric-hint">{hint}</span>
        <span className="rq-spark" aria-hidden="true">
          {bars.map((height, index) => (
            <i key={index} style={{ height: Math.max(14, height) + "%" }} />
          ))}
        </span>
      </div>
    </article>
  );
}

function RequestCard({ request, now, onOpen, index, dense }) {
  const status = effectiveStatus(request, now);
  const deadline = getDeadline(request);
  const remaining = deadline ? deadline - now : 0;
  const level = urgencyLevel(status, remaining);
  const ratio = deadline ? remaining / getWindow(request.status) : 0;
  const timeLabel =
    status === "NEW" ? "Submitted"
      : status === "RATE PROVIDED" ? "Rate sent"
        : status === "ACCEPTED" ? "Accepted"
          : status === "REJECTED" ? "Rejected"
            : "Expired";
  const timestamp = statusTimestamp(request, status);
  const tons = totalTons(request);

  const handleKeyDown = event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(request);
    }
  };

  return (
    <article
      className={"rq-card status-" + STATUS_CLASS[status] + " urg-" + level + (dense ? " dense" : "")}
      style={{ animationDelay: index * 55 + "ms" }}
      role="button"
      tabIndex="0"
      onClick={() => onOpen(request)}
      onKeyDown={handleKeyDown}
      aria-label={"Open request " + request.requestId}
    >
      <span className="rq-card-rail" aria-hidden="true" />
      <span className="rq-card-sheen" aria-hidden="true" />
      <span className="rq-card-mesh" aria-hidden="true" />
      <Corners />

      <header className="rq-card-head">
        <span className="rq-id">
          <span className="rq-id-dot" />
          <span className="rq-id-text">{request.requestId}</span>
        </span>
        <span className={"rq-badge " + STATUS_CLASS[status]}>
          <i className="rq-badge-pip" />
          {status}
        </span>
      </header>

      <div className="rq-buyer">
        <Icon name="user" size={13} />
        <span>{request.buyer}</span>
      </div>

      <div className="rq-materials" aria-label="Materials and quantities">
        {request.materials.map((material, i) => (
          <span className="rq-chip" key={material.materialName + "-" + i}>
            <i className="rq-chip-icon"><Icon name="cube" size={12} /></i>
            <span className="rq-chip-name">{material.materialName}</span>
            <b>{material.totalTons}t</b>
          </span>
        ))}
        <span className="rq-chip total">
          <i className="rq-chip-icon"><Icon name="scale" size={12} /></i>
          <span className="rq-chip-name">Total load</span>
          <b>{tons}t</b>
        </span>
      </div>

      <div className="rq-meta">
        <div className="rq-meta-cell">
          <Icon name="pin" size={13} />
          <span>Delivery</span>
          <strong>{request.deliveryArea}</strong>
        </div>
        <div className="rq-meta-cell">
          <Icon name="clock" size={13} />
          <span>{timeLabel}</span>
          <strong>{relativeTime(timestamp, now)}</strong>
        </div>
      </div>

      <footer className="rq-card-foot">
        {deadline ? (
          <CountdownRing
            ratio={ratio}
            level={level}
            label={status === "NEW" ? "Rate window" : "Buyer window"}
            value={countdown(deadline, now)}
          />
        ) : (
          <div className={"rq-closed " + STATUS_CLASS[status]}>
            <Icon name="flag" size={13} />
            <span>Closed at</span>
            <strong>{clockTime(timestamp)}</strong>
          </div>
        )}
        <span className="rq-open">
          {status === "NEW" ? "Provide rate" : "View request"}
          <Icon name="arrow" size={14} />
        </span>
      </footer>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="rq-card rq-skeleton" aria-hidden="true">
      <span className="rq-card-rail" />
      <div className="sk sk-id" />
      <div className="sk sk-badge" />
      <div className="sk sk-line" />
      <div className="sk sk-chips" />
      <div className="sk sk-meta" />
      <div className="sk sk-foot" />
    </div>
  );
}

/* ------------------------------------------------------- Page component -- */

export default function AdminRateRequests({ onBack, onOpenRequest, onHome, onOrders, onSamples }) {
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sort, setSort] = useState("urgent");
  const [density, setDensity] = useState("comfortable");
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
    const handleVisibility = () => {
      if (!document.hidden) setNow(Date.now());
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = useCallback(message => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }, []);

  const counts = useMemo(() => {
    const result = { ALL: requests.length, NEW: 0, "RATE PROVIDED": 0, ACCEPTED: 0, REJECTED: 0, EXPIRED: 0 };
    requests.forEach(request => {
      result[effectiveStatus(request, now)] += 1;
    });
    return result;
  }, [requests, now]);

  const stats = useMemo(() => {
    const live = requests.filter(request => {
      const status = effectiveStatus(request, now);
      return status === "NEW" || status === "RATE PROVIDED";
    });
    const critical = live.filter(request => {
      const deadline = getDeadline(request);
      return deadline && urgencyLevel(effectiveStatus(request, now), deadline - now) === "critical";
    }).length;
    const tons = requests.reduce((sum, request) => sum + totalTons(request), 0);
    const decided = requests.filter(request => {
      const status = effectiveStatus(request, now);
      return status === "ACCEPTED" || status === "REJECTED";
    });
    const accepted = decided.filter(request => effectiveStatus(request, now) === "ACCEPTED").length;
    const winRate = decided.length ? Math.round((accepted / decided.length) * 100) : 0;
    return { live: live.length, critical, tons, winRate };
  }, [requests, now]);

  const visibleRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matched = requests.filter(request => {
      const status = effectiveStatus(request, now);
      const passesFilter = filter === "ALL" || status === filter;
      const materialText = request.materials.map(item => item.materialName).join(" ").toLowerCase();
      const passesSearch =
        !normalized ||
        request.requestId.toLowerCase().includes(normalized) ||
        request.deliveryArea.toLowerCase().includes(normalized) ||
        request.buyer.toLowerCase().includes(normalized) ||
        materialText.includes(normalized);
      return passesFilter && passesSearch;
    });

    return [...matched].sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "quantity") return totalTons(b) - totalTons(a);
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
      showToast("Rate requests synced");
    }, 520);
  };

  const handleOpen = request => {
    if (onOpenRequest) onOpenRequest(request);
    else showToast("Opening " + request.requestId);
  };

  const handleNav = (callback, label) => {
    if (callback) callback();
    else showToast(label + " selected");
  };

  const retry = () => {
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      setRequests([...DEMO_REQUESTS]);
      setNow(Date.now());
      setLoading(false);
    }, 500);
  };

  const isDense = density === "dense";

  return (
    <div className="rq-root">
      <style>{STYLES}</style>

      <div className="rq-bg" aria-hidden="true">
        <span className="rq-bg-grid" />
        <span className="rq-bg-orb one" />
        <span className="rq-bg-orb two" />
        <span className="rq-bg-scan" />
      </div>

      {/* ============================ HEADER ============================ */}
      <header className="rq-header">
        <div className="rq-header-inner">
          <div className="rq-header-row">
            <button
              className="rq-iconbtn"
              type="button"
              onClick={() => (onBack ? onBack() : showToast("Back navigation"))}
              aria-label="Go back"
            >
              <Icon name="back" size={18} />
            </button>

            <div className="rq-brand">
              <span className="rq-brand-mark">
                <Icon name="samples" size={17} strokeWidth={1.9} />
                <i className="rq-brand-ping" />
              </span>
              <span className="rq-brand-text">
                <span className="rq-brand-name">StoneRate</span>
                <span className="rq-brand-role">Rate Desk</span>
              </span>
            </div>

            <span className="rq-livechip">
              <i className="rq-livepip" />
              LIVE
            </span>

            <button
              className={"rq-iconbtn rq-refresh" + (loading ? " spinning" : "")}
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              aria-label="Refresh rate requests"
            >
              <Icon name="refresh" size={18} />
            </button>
          </div>

          <div className="rq-hero">
            <h1 className="rq-hero-title">
              Rate <span>Requests</span>
            </h1>
            <p className="rq-hero-sub">
              Review buyer demand and publish material-wise rates before the window closes.
            </p>
            <span className="rq-hero-meta">
              <span className="rq-hero-pip" />
              {loading ? "Syncing request queue…" : "Synced " + relativeTime(new Date(refreshedAt).toISOString(), now)}
              <em>·</em>
              {clockTime(new Date(refreshedAt).toISOString())}
            </span>
          </div>

          <div className="rq-metrics">
            <Metric
              icon="pulse"
              tone="orange"
              label="Live queue"
              value={stats.live}
              unit=" open"
              hint="Awaiting action"
              bars={[38, 62, 44, 80, 55, 92]}
            />
            <Metric
              icon="bolt"
              tone="red"
              label="Critical"
              value={stats.critical}
              unit=" urgent"
              hint="Closing in <30m"
              bars={[20, 34, 26, 58, 40, 74]}
            />
            <Metric
              icon="scale"
              tone="slate"
              label="Volume"
              value={stats.tons}
              unit=" t"
              hint="Across all requests"
              bars={[46, 30, 68, 52, 84, 60]}
            />
            <Metric
              icon="target"
              tone="green"
              label="Win rate"
              value={stats.winRate}
              unit="%"
              hint="Accepted vs decided"
              bars={[30, 48, 40, 66, 58, 88]}
            />
          </div>
        </div>
      </header>

      {/* ============================= SHELL ============================ */}
      <main className="rq-shell">
        {/* ---------------------- Command toolbar ---------------------- */}
        <section className="rq-toolbar" aria-label="Search, filter and sort rate requests">
          <Corners />
          <div className="rq-toolbar-top">
            <label className="rq-search">
              <Icon name="search" size={16} />
              <input
                ref={searchRef}
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search request ID, buyer, material or area"
                aria-label="Search requests"
              />
              {query ? (
                <button
                  className="rq-search-clear"
                  type="button"
                  onClick={() => {
                    setQuery("");
                    if (searchRef.current) searchRef.current.focus();
                  }}
                  aria-label="Clear search"
                >
                  <Icon name="close" size={13} />
                </button>
              ) : (
                <kbd className="rq-kbd">⌘K</kbd>
              )}
            </label>

            <div className="rq-toolbar-actions">
              <label className="rq-select-wrap" aria-label="Sort requests">
                <Icon name="sort" size={14} />
                <select
                  className="rq-select"
                  value={sort}
                  onChange={event => setSort(event.target.value)}
                >
                  <option value="urgent">Urgent first</option>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="quantity">Highest quantity</option>
                </select>
              </label>

              <div className="rq-density" role="group" aria-label="List density">
                <button
                  type="button"
                  className={"rq-density-btn" + (density === "comfortable" ? " active" : "")}
                  onClick={() => setDensity("comfortable")}
                  aria-pressed={density === "comfortable"}
                  aria-label="Comfortable density"
                >
                  <Icon name="grid" size={14} />
                </button>
                <button
                  type="button"
                  className={"rq-density-btn" + (density === "dense" ? " active" : "")}
                  onClick={() => setDensity("dense")}
                  aria-pressed={density === "dense"}
                  aria-label="Compact density"
                >
                  <Icon name="rows" size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="rq-filters" role="tablist" aria-label="Request status">
            {FILTERS.map(item => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={filter === item}
                className={"rq-filter s-" + (STATUS_CLASS[item] || "all") + (filter === item ? " active" : "")}
                onClick={() => setFilter(item)}
              >
                <i className="rq-filter-pip" />
                {FILTER_LABELS[item]}
                <span>{counts[item]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ------------------------- Result bar ------------------------ */}
        <div className="rq-resultbar">
          <span className="rq-result-count">
            <Icon name="spark" size={13} />
            {loading
              ? "Loading queue"
              : visibleRequests.length + " request" + (visibleRequests.length === 1 ? "" : "s")}
          </span>
          <span className="rq-result-scope">
            {filter === "ALL" ? "All statuses" : FILTER_LABELS[filter]}
            <em>·</em>
            {sort === "urgent" ? "Urgent first" : sort === "newest" ? "Newest" : sort === "oldest" ? "Oldest" : "By tonnage"}
          </span>
        </div>

        {/* --------------------------- Content ------------------------- */}
        {error ? (
          <section className="rq-state error">
            <Corners />
            <span className="rq-state-icon"><Icon name="alert" size={21} /></span>
            <h2>Could not load rate requests</h2>
            <p>{error}</p>
            <button type="button" className="rq-btn" onClick={retry}>
              Retry sync
            </button>
          </section>
        ) : loading ? (
          <section className={"rq-list" + (isDense ? " dense" : "")} aria-label="Loading requests">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </section>
        ) : visibleRequests.length === 0 ? (
          <section className="rq-state">
            <Corners />
            <span className="rq-state-icon"><Icon name="inbox" size={21} /></span>
            <h2>{query.trim() ? "No matches for “" + query.trim() + "”" : "No requests in this view"}</h2>
            <p>
              {query.trim()
                ? "Try a different request ID, buyer, material or delivery area."
                : "Switch to another status filter to review available requests."}
            </p>
            {query.trim() ? (
              <button type="button" className="rq-btn" onClick={() => setQuery("")}>
                Clear search
              </button>
            ) : null}
          </section>
        ) : (
          <section className={"rq-list" + (isDense ? " dense" : "")} aria-label="Rate requests">
            {visibleRequests.map((request, index) => (
              <RequestCard
                key={request.requestId}
                request={request}
                now={now}
                onOpen={handleOpen}
                index={index}
                dense={isDense}
              />
            ))}
          </section>
        )}
      </main>

      {/* ============================ BOTTOM ============================ */}
      <nav className="rq-bottomnav" aria-label="Admin navigation">
        <button className="rq-navitem" type="button" onClick={() => handleNav(onHome, "Home")}>
          <Icon name="home" size={19} />
          <span>Home</span>
          <i className="rq-navpip" />
        </button>
        <button
          className="rq-navitem active"
          type="button"
          aria-current="page"
          onClick={() => handleNav(onOrders, "Orders")}
        >
          <Icon name="orders" size={19} strokeWidth={2} />
          <span>Orders</span>
          <i className="rq-navpip" />
        </button>
        <button className="rq-navitem" type="button" onClick={() => handleNav(onSamples, "Samples")}>
          <Icon name="samples" size={19} />
          <span>Samples</span>
          <i className="rq-navpip" />
        </button>
      </nav>

      <div className={"rq-toast" + (toast ? " show" : "")} role="status" aria-live="polite">
        <span className="rq-toast-pip" />
        {toast}
      </div>
    </div>
  );
}

/* ===========================================================================
 * Styles — white canvas + signal orange, matching AdminDashboard tokens.
 * ========================================================================= */

const STYLES = `
.rq-root{
  --rq-orange:#f97316;
  --rq-orange-600:#ea6a0a;
  --rq-orange-700:#c2560b;
  --rq-orange-ink:#9a4408;
  --rq-orange-soft:rgba(249,115,22,.10);
  --rq-orange-soft2:rgba(249,115,22,.18);
  --rq-amber:#e08b1e;
  --rq-amber-ink:#a15c07;
  --rq-amber-soft:rgba(224,139,30,.12);
  --rq-green:#1f9463;
  --rq-green-ink:#0f7a4c;
  --rq-green-soft:rgba(31,148,99,.12);
  --rq-red:#d64545;
  --rq-red-ink:#b42318;
  --rq-red-soft:rgba(214,69,69,.10);
  --rq-ink:#141a24;
  --rq-ink-2:#3b4658;
  --rq-muted:#6b7687;
  --rq-faint:#96a0af;
  --rq-line:#e9edf3;
  --rq-line-2:#dbe2ec;
  --rq-white:#ffffff;
  --rq-glass:rgba(255,255,255,.78);
  --rq-glass-2:rgba(255,255,255,.92);
  --rq-mono:"SF Mono",ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace;
  position:relative;
  isolation:isolate;
  min-height:100dvh;
  padding-bottom:86px;
  color:var(--rq-ink);
  background:#fbfcfe;
  font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
.rq-root *{box-sizing:border-box}
.rq-root button{font-family:inherit}

/* ---------------------------------------------------------- background -- */
.rq-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;
  background:linear-gradient(180deg,#ffffff 0%,#fdfaf7 34%,#fbfcfe 100%)}
.rq-bg-grid{position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(20,26,36,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(20,26,36,.045) 1px,transparent 1px);
  background-size:38px 38px;
  -webkit-mask-image:radial-gradient(ellipse 92% 58% at 50% 0%,#000 12%,transparent 78%);
  mask-image:radial-gradient(ellipse 92% 58% at 50% 0%,#000 12%,transparent 78%)}
.rq-bg-orb{position:absolute;border-radius:50%;filter:blur(70px)}
.rq-bg-orb.one{width:520px;height:520px;top:-230px;right:-160px;
  background:radial-gradient(circle,rgba(249,115,22,.26),transparent 66%)}
.rq-bg-orb.two{width:460px;height:460px;top:-180px;left:-180px;
  background:radial-gradient(circle,rgba(224,139,30,.18),transparent 68%)}
.rq-bg-scan{position:absolute;left:0;right:0;top:0;height:210px;
  background:linear-gradient(180deg,rgba(249,115,22,.14),transparent);
  -webkit-mask-image:linear-gradient(180deg,#000,transparent);
  mask-image:linear-gradient(180deg,#000,transparent)}

/* -------------------------------------------------------------- corners -- */
.rq-corners{position:absolute;inset:0;pointer-events:none;border-radius:inherit}
.rq-corners .c{position:absolute;width:9px;height:9px;opacity:.55;
  border-color:var(--rq-orange);border-style:solid;border-width:0}
.rq-corners .tl{top:6px;left:6px;border-top-width:1.4px;border-left-width:1.4px;border-top-left-radius:4px}
.rq-corners .tr{top:6px;right:6px;border-top-width:1.4px;border-right-width:1.4px;border-top-right-radius:4px}
.rq-corners .bl{bottom:6px;left:6px;border-bottom-width:1.4px;border-left-width:1.4px;border-bottom-left-radius:4px}
.rq-corners .br{bottom:6px;right:6px;border-bottom-width:1.4px;border-right-width:1.4px;border-bottom-right-radius:4px}

/* --------------------------------------------------------------- header -- */
.rq-header{position:relative;border-bottom:1px solid var(--rq-line);
  background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(255,255,255,.72));
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.rq-header:after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;
  background:linear-gradient(90deg,transparent,var(--rq-orange) 22%,#fbbf24 52%,var(--rq-orange) 78%,transparent);
  opacity:.85}
.rq-header-inner{width:min(100%,1080px);margin:0 auto;padding:12px 14px 16px}
.rq-header-row{display:flex;align-items:center;gap:10px}

.rq-iconbtn{width:38px;height:38px;flex:0 0 auto;display:grid;place-items:center;cursor:pointer;
  border:1px solid var(--rq-line-2);border-radius:11px;color:var(--rq-ink-2);
  background:var(--rq-glass-2);
  box-shadow:0 2px 8px rgba(20,26,36,.05),inset 0 1px 0 #fff;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,color .18s ease}
.rq-iconbtn:hover{transform:translateY(-1px);color:var(--rq-orange-700);
  border-color:rgba(249,115,22,.45);box-shadow:0 6px 18px rgba(249,115,22,.18)}
.rq-iconbtn:active{transform:translateY(0)}
.rq-iconbtn:disabled{opacity:.6;cursor:default;transform:none}
.rq-refresh svg{transition:transform .4s ease}
.rq-refresh:hover svg{transform:rotate(120deg)}
.rq-refresh.spinning svg{animation:rqSpin .9s linear infinite}
@keyframes rqSpin{to{transform:rotate(360deg)}}

.rq-brand{display:flex;align-items:center;gap:9px;min-width:0;flex:1}
.rq-brand-mark{position:relative;width:36px;height:36px;flex:0 0 auto;display:grid;place-items:center;
  border-radius:11px;color:#fff;
  background:linear-gradient(135deg,var(--rq-orange),var(--rq-orange-700));
  box-shadow:0 6px 16px rgba(249,115,22,.32),inset 0 1px 0 rgba(255,255,255,.35)}
.rq-brand-ping{position:absolute;right:-2px;top:-2px;width:9px;height:9px;border-radius:50%;
  background:#22c55e;border:2px solid #fff;animation:rqPing 2.4s ease-in-out infinite}
@keyframes rqPing{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}50%{box-shadow:0 0 0 5px rgba(34,197,94,0)}}
.rq-brand-text{display:flex;flex-direction:column;min-width:0}
.rq-brand-name{font-size:14px;font-weight:700;letter-spacing:-.01em;line-height:1.15;color:var(--rq-ink)}
.rq-brand-role{font-size:10.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--rq-orange-700)}

.rq-livechip{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto;
  padding:5px 9px;border-radius:999px;font-size:9.5px;font-weight:800;letter-spacing:.12em;
  color:var(--rq-green-ink);background:var(--rq-green-soft);border:1px solid rgba(31,148,99,.28)}
.rq-livepip{width:5px;height:5px;border-radius:50%;background:var(--rq-green);
  animation:rqBlink 1.8s ease-in-out infinite}
@keyframes rqBlink{0%,100%{opacity:1}50%{opacity:.25}}

.rq-hero{padding:16px 2px 0}
.rq-hero-title{margin:0;font-size:28px;line-height:1.08;letter-spacing:-.035em;font-weight:700;color:var(--rq-ink)}
.rq-hero-title span{background:linear-gradient(100deg,var(--rq-orange),#fbbf24 55%,var(--rq-orange-700));
  -webkit-background-clip:text;background-clip:text;color:transparent}
.rq-hero-sub{margin:7px 0 0;font-size:12.5px;line-height:1.5;color:var(--rq-muted);max-width:54ch}
.rq-hero-meta{display:inline-flex;align-items:center;gap:6px;margin-top:11px;
  padding:5px 10px;border-radius:999px;font-size:10.5px;font-weight:650;letter-spacing:.01em;
  color:var(--rq-orange-ink);background:var(--rq-orange-soft);border:1px solid rgba(249,115,22,.24)}
.rq-hero-meta em{font-style:normal;opacity:.45}
.rq-hero-pip{width:5px;height:5px;border-radius:50%;background:var(--rq-orange);
  box-shadow:0 0 0 3px rgba(249,115,22,.16)}

/* -------------------------------------------------------------- metrics -- */
.rq-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:16px}
.rq-metric{position:relative;overflow:hidden;padding:11px 12px 10px;border-radius:14px;
  border:1px solid var(--rq-line);background:var(--rq-glass-2);
  box-shadow:0 4px 14px rgba(20,26,36,.05),inset 0 1px 0 #fff;
  transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;
  animation:rqRise .45s cubic-bezier(.2,.7,.3,1) both}
.rq-metric:hover{transform:translateY(-2px);border-color:rgba(249,115,22,.32);
  box-shadow:0 12px 26px rgba(20,26,36,.09)}
.rq-metric:before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:var(--rq-mtone,var(--rq-orange));opacity:.9}
.rq-metric.tone-orange{--rq-mtone:var(--rq-orange);--rq-mink:var(--rq-orange-ink);--rq-msoft:var(--rq-orange-soft)}
.rq-metric.tone-red{--rq-mtone:var(--rq-red);--rq-mink:var(--rq-red-ink);--rq-msoft:var(--rq-red-soft)}
.rq-metric.tone-green{--rq-mtone:var(--rq-green);--rq-mink:var(--rq-green-ink);--rq-msoft:var(--rq-green-soft)}
.rq-metric.tone-slate{--rq-mtone:#64748b;--rq-mink:#475569;--rq-msoft:rgba(100,116,139,.12)}
.rq-metric-head{display:flex;align-items:center;gap:6px}
.rq-metric-icon{width:22px;height:22px;flex:0 0 auto;display:grid;place-items:center;border-radius:7px;
  color:var(--rq-mink);background:var(--rq-msoft)}
.rq-metric-label{font-size:10px;font-weight:750;letter-spacing:.09em;text-transform:uppercase;color:var(--rq-muted);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-metric-value{margin-top:8px;font-size:23px;font-weight:700;letter-spacing:-.03em;line-height:1;
  color:var(--rq-ink);font-variant-numeric:tabular-nums}
.rq-metric-value em{font-style:normal;font-size:11px;font-weight:650;letter-spacing:0;color:var(--rq-muted);margin-left:2px}
.rq-metric-foot{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;margin-top:8px}
.rq-metric-hint{font-size:10px;color:var(--rq-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-spark{display:flex;align-items:flex-end;gap:2px;height:18px;flex:0 0 auto}
.rq-spark i{width:3px;border-radius:2px;background:var(--rq-mtone);opacity:.35}
.rq-spark i:last-child{opacity:.95}

/* ---------------------------------------------------------------- shell -- */
.rq-shell{width:min(100%,1080px);margin:0 auto;padding:16px 14px 24px;position:relative;z-index:1}

/* -------------------------------------------------------------- toolbar -- */
.rq-toolbar{position:relative;padding:11px;border-radius:16px;border:1px solid var(--rq-line);
  background:var(--rq-glass);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  box-shadow:0 8px 26px rgba(20,26,36,.06),inset 0 1px 0 #fff}
.rq-toolbar:before{content:"";position:absolute;inset:0;border-radius:16px;padding:1px;pointer-events:none;
  background:linear-gradient(120deg,rgba(249,115,22,.42),transparent 34%,transparent 66%,rgba(251,191,36,.34));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude}
.rq-toolbar-top{display:flex;gap:8px;align-items:center;min-width:0}

.rq-search{position:relative;flex:1;min-width:0;height:42px;display:flex;align-items:center;gap:8px;
  padding:0 10px;border-radius:12px;border:1px solid var(--rq-line-2);background:#fff;color:var(--rq-faint);
  transition:border-color .18s,box-shadow .18s,color .18s}
.rq-search:focus-within{border-color:rgba(249,115,22,.55);color:var(--rq-orange-700);
  box-shadow:0 0 0 3px rgba(249,115,22,.14)}
.rq-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;font:inherit;font-size:13px;color:var(--rq-ink)}
.rq-search input::placeholder{color:#a6b0bd}
.rq-search-clear{width:23px;height:23px;flex:0 0 auto;display:grid;place-items:center;padding:0;cursor:pointer;
  border:0;border-radius:7px;background:#eef1f6;color:#5c6878}
.rq-search-clear:hover{background:var(--rq-orange-soft);color:var(--rq-orange-700)}
.rq-kbd{flex:0 0 auto;padding:3px 6px;border-radius:6px;font-family:var(--rq-mono);font-size:9.5px;font-weight:600;
  color:var(--rq-faint);background:#f4f6f9;border:1px solid var(--rq-line-2)}

.rq-toolbar-actions{display:flex;align-items:center;gap:7px;flex:0 0 auto}
.rq-select-wrap{position:relative;flex:0 0 auto}
.rq-select-wrap svg{position:absolute;left:9px;top:14px;pointer-events:none;color:var(--rq-muted)}
.rq-select{height:42px;padding:0 12px 0 29px;cursor:pointer;outline:none;max-width:150px;
  border:1px solid var(--rq-line-2);border-radius:12px;background:#fff;color:var(--rq-ink);
  font-size:11.5px;font-weight:700;appearance:none;-webkit-appearance:none}
.rq-select:focus{border-color:rgba(249,115,22,.5);box-shadow:0 0 0 3px rgba(249,115,22,.13)}
.rq-density{display:flex;gap:3px;padding:3px;border-radius:12px;border:1px solid var(--rq-line-2);background:#f6f8fb}
.rq-density-btn{width:32px;height:34px;display:grid;place-items:center;cursor:pointer;padding:0;
  border:0;border-radius:9px;background:transparent;color:var(--rq-faint);transition:.16s}
.rq-density-btn:hover{color:var(--rq-ink-2)}
.rq-density-btn.active{color:var(--rq-orange-700);background:#fff;
  box-shadow:0 2px 7px rgba(20,26,36,.10)}

.rq-filters{display:flex;gap:6px;margin-top:9px;padding:2px;overflow-x:auto;scrollbar-width:none}
.rq-filters::-webkit-scrollbar{display:none}
.rq-filter{position:relative;display:inline-flex;align-items:center;gap:6px;height:33px;flex:0 0 auto;
  padding:0 11px;cursor:pointer;white-space:nowrap;
  border:1px solid var(--rq-line-2);border-radius:10px;background:#fff;color:var(--rq-muted);
  font-size:11.5px;font-weight:700;letter-spacing:-.005em;transition:.18s}
.rq-filter:hover{color:var(--rq-ink);border-color:rgba(249,115,22,.35)}
.rq-filter span{padding:1px 5px;border-radius:5px;font-size:10px;font-weight:800;
  background:#f1f4f8;color:var(--rq-faint);font-variant-numeric:tabular-nums}
.rq-filter-pip{width:5px;height:5px;border-radius:50%;background:#c3cbd6}
.rq-filter.s-new .rq-filter-pip{background:var(--rq-orange)}
.rq-filter.s-provided .rq-filter-pip{background:var(--rq-amber)}
.rq-filter.s-accepted .rq-filter-pip{background:var(--rq-green)}
.rq-filter.s-rejected .rq-filter-pip{background:var(--rq-red)}
.rq-filter.s-expired .rq-filter-pip{background:#98a2b3}
.rq-filter.active{color:var(--rq-orange-ink);border-color:rgba(249,115,22,.5);
  background:linear-gradient(135deg,rgba(249,115,22,.14),rgba(251,191,36,.10));
  box-shadow:0 3px 12px rgba(249,115,22,.18),inset 0 -2px 0 var(--rq-orange)}
.rq-filter.active span{background:rgba(249,115,22,.18);color:var(--rq-orange-ink)}

/* ------------------------------------------------------------ resultbar -- */
.rq-resultbar{display:flex;align-items:center;justify-content:space-between;gap:10px;
  margin:14px 3px 10px;font-size:11px;color:var(--rq-muted)}
.rq-result-count{display:inline-flex;align-items:center;gap:6px;font-weight:750;color:var(--rq-ink)}
.rq-result-count svg{color:var(--rq-orange)}
.rq-result-scope{display:inline-flex;align-items:center;gap:5px;font-weight:600;color:var(--rq-faint);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rq-result-scope em{font-style:normal;opacity:.5}

/* ----------------------------------------------------------------- list -- */
.rq-list{display:grid;gap:11px}
@keyframes rqRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

.rq-card{position:relative;overflow:hidden;cursor:pointer;padding:13px 13px 11px 16px;
  border:1px solid var(--rq-line);border-radius:16px;background:var(--rq-glass-2);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  box-shadow:0 4px 16px rgba(20,26,36,.055),inset 0 1px 0 #fff;
  transition:transform .22s cubic-bezier(.2,.7,.3,1),box-shadow .22s,border-color .22s;
  animation:rqRise .5s cubic-bezier(.2,.7,.3,1) both}
.rq-card:hover{transform:translateY(-3px);border-color:rgba(249,115,22,.34);
  box-shadow:0 18px 38px rgba(20,26,36,.11),0 0 0 1px rgba(249,115,22,.06)}
.rq-card:focus-visible,.rq-iconbtn:focus-visible,.rq-filter:focus-visible,
.rq-density-btn:focus-visible,.rq-btn:focus-visible,.rq-navitem:focus-visible{
  outline:2px solid rgba(249,115,22,.55);outline-offset:2px}

.rq-card-rail{position:absolute;left:0;top:0;bottom:0;width:4px;
  background:linear-gradient(180deg,var(--rq-orange),#fbbf24)}
.rq-card.status-provided .rq-card-rail{background:linear-gradient(180deg,#fbbf24,var(--rq-amber))}
.rq-card.status-accepted .rq-card-rail{background:linear-gradient(180deg,#34d399,var(--rq-green))}
.rq-card.status-rejected .rq-card-rail{background:linear-gradient(180deg,#f87171,var(--rq-red))}
.rq-card.status-expired .rq-card-rail{background:linear-gradient(180deg,#cbd5e1,#94a3b8)}

.rq-card-sheen{position:absolute;top:-60%;right:-30%;width:62%;height:150%;pointer-events:none;opacity:0;
  background:radial-gradient(circle,rgba(249,115,22,.16),transparent 68%);transition:opacity .3s}
.rq-card:hover .rq-card-sheen{opacity:1}
.rq-card-mesh{position:absolute;inset:0;pointer-events:none;opacity:.5;
  background-image:linear-gradient(rgba(20,26,36,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(20,26,36,.035) 1px,transparent 1px);
  background-size:22px 22px;
  -webkit-mask-image:radial-gradient(ellipse 70% 90% at 100% 0%,#000,transparent 72%);
  mask-image:radial-gradient(ellipse 70% 90% at 100% 0%,#000,transparent 72%)}

.rq-card-head{position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px}
.rq-id{display:inline-flex;align-items:center;gap:7px;min-width:0}
.rq-id-dot{width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:var(--rq-orange);
  box-shadow:0 0 0 3px var(--rq-orange-soft)}
.rq-id-text{font-family:var(--rq-mono);font-size:12.5px;font-weight:600;letter-spacing:.02em;color:var(--rq-ink);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rq-badge{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto;padding:4px 8px;border-radius:7px;
  font-size:9px;line-height:1;font-weight:850;letter-spacing:.08em;border:1px solid}
.rq-badge-pip{width:4px;height:4px;border-radius:50%;background:currentColor}
.rq-badge.new{color:var(--rq-orange-ink);background:var(--rq-orange-soft);border-color:rgba(249,115,22,.34)}
.rq-badge.provided{color:var(--rq-amber-ink);background:var(--rq-amber-soft);border-color:rgba(224,139,30,.34)}
.rq-badge.accepted{color:var(--rq-green-ink);background:var(--rq-green-soft);border-color:rgba(31,148,99,.32)}
.rq-badge.rejected{color:var(--rq-red-ink);background:var(--rq-red-soft);border-color:rgba(214,69,69,.32)}
.rq-badge.expired{color:#64748b;background:#f1f4f8;border-color:var(--rq-line-2)}

.rq-buyer{position:relative;display:flex;align-items:center;gap:6px;margin-top:8px;
  font-size:11.5px;font-weight:600;color:var(--rq-muted);min-width:0}
.rq-buyer svg{color:var(--rq-faint);flex:0 0 auto}
.rq-buyer span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.rq-materials{position:relative;display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
.rq-chip{display:inline-flex;align-items:center;gap:5px;max-width:100%;min-width:0;
  padding:4px 8px 4px 4px;border-radius:9px;border:1px solid var(--rq-line);
  background:linear-gradient(135deg,#fbfcfe,#f4f7fa);font-size:11px;color:var(--rq-ink-2)}
.rq-chip-icon{width:20px;height:20px;flex:0 0 auto;display:grid;place-items:center;border-radius:6px;
  background:var(--rq-orange-soft);color:var(--rq-orange-700)}
.rq-chip-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rq-chip b{font-family:var(--rq-mono);font-size:10.5px;font-weight:650;color:var(--rq-ink);white-space:nowrap}
.rq-chip.total{border-color:rgba(249,115,22,.3);
  background:linear-gradient(135deg,rgba(249,115,22,.10),rgba(251,191,36,.07))}
.rq-chip.total .rq-chip-name{color:var(--rq-orange-ink);font-weight:650}
.rq-chip.total b{color:var(--rq-orange-ink)}

.rq-meta{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px;
  margin-top:11px;padding:9px 0;border-top:1px dashed var(--rq-line-2);border-bottom:1px dashed var(--rq-line-2)}
.rq-meta-cell{display:flex;align-items:center;gap:5px;min-width:0;font-size:11px;color:var(--rq-muted)}
.rq-meta-cell svg{color:var(--rq-faint);flex:0 0 auto}
.rq-meta-cell span{white-space:nowrap}
.rq-meta-cell strong{color:var(--rq-ink);font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.rq-card-foot{position:relative;display:flex;align-items:center;justify-content:space-between;gap:9px;
  margin-top:10px;min-height:40px}

.rq-ring{display:flex;align-items:center;gap:8px;min-width:0}
.rq-ring-dial{position:relative;width:40px;height:40px;flex:0 0 auto}
.rq-ring-track{fill:none;stroke:#eef1f6;stroke-width:3.4}
.rq-ring-bar{fill:none;stroke:var(--rq-rtone,var(--rq-orange));stroke-width:3.4;stroke-linecap:round;
  transition:stroke-dasharray .5s ease}
.rq-ring-core{position:absolute;inset:11px;border-radius:50%;background:var(--rq-rsoft,var(--rq-orange-soft))}
.rq-ring.level-steady{--rq-rtone:var(--rq-orange);--rq-rsoft:var(--rq-orange-soft);--rq-rink:var(--rq-orange-ink)}
.rq-ring.level-warning{--rq-rtone:var(--rq-amber);--rq-rsoft:var(--rq-amber-soft);--rq-rink:var(--rq-amber-ink)}
.rq-ring.level-critical{--rq-rtone:var(--rq-red);--rq-rsoft:var(--rq-red-soft);--rq-rink:var(--rq-red-ink)}
.rq-ring.level-critical .rq-ring-dial{animation:rqAlert 1.8s ease-in-out infinite;border-radius:50%}
@keyframes rqAlert{0%,100%{box-shadow:0 0 0 0 rgba(214,69,69,0)}50%{box-shadow:0 0 0 4px rgba(214,69,69,.14)}}
.rq-ring-text{display:flex;flex-direction:column;min-width:0;gap:2px}
.rq-ring-text span{font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
  color:var(--rq-faint);white-space:nowrap}
.rq-ring-text strong{font-family:var(--rq-mono);font-size:14px;font-weight:650;letter-spacing:-.01em;
  color:var(--rq-rink,var(--rq-ink));font-variant-numeric:tabular-nums}

.rq-closed{display:flex;align-items:center;gap:6px;min-width:0;padding:7px 10px;border-radius:10px;
  font-size:10.5px;font-weight:650;color:var(--rq-muted);background:#f5f7fa;border:1px solid var(--rq-line)}
.rq-closed strong{font-family:var(--rq-mono);color:var(--rq-ink-2)}
.rq-closed.accepted{color:var(--rq-green-ink);background:var(--rq-green-soft);border-color:rgba(31,148,99,.24)}
.rq-closed.accepted strong{color:var(--rq-green-ink)}
.rq-closed.rejected{color:var(--rq-red-ink);background:var(--rq-red-soft);border-color:rgba(214,69,69,.24)}
.rq-closed.rejected strong{color:var(--rq-red-ink)}

.rq-open{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto;padding:8px 12px;border-radius:10px;
  font-size:11px;font-weight:800;letter-spacing:-.005em;white-space:nowrap;color:#fff;
  background:linear-gradient(135deg,var(--rq-orange),var(--rq-orange-700));
  box-shadow:0 4px 14px rgba(249,115,22,.30),inset 0 1px 0 rgba(255,255,255,.28);
  transition:box-shadow .2s,transform .2s}
.rq-open svg{transition:transform .2s}
.rq-card:hover .rq-open{box-shadow:0 8px 22px rgba(249,115,22,.42)}
.rq-card:hover .rq-open svg{transform:translateX(3px)}
.rq-card.status-accepted .rq-open,.rq-card.status-rejected .rq-open,.rq-card.status-expired .rq-open{
  color:var(--rq-ink-2);background:#fff;border:1px solid var(--rq-line-2);box-shadow:0 2px 8px rgba(20,26,36,.06)}
.rq-card.status-accepted:hover .rq-open,.rq-card.status-rejected:hover .rq-open,
.rq-card.status-expired:hover .rq-open{border-color:rgba(249,115,22,.4);color:var(--rq-orange-700);
  box-shadow:0 6px 16px rgba(249,115,22,.16)}
.rq-card.status-expired{opacity:.88}

/* dense variant */
.rq-list.dense{gap:8px}
.rq-card.dense{padding:11px 12px 10px 15px;border-radius:14px}
.rq-card.dense .rq-buyer,.rq-card.dense .rq-card-mesh{display:none}
.rq-card.dense .rq-materials{margin-top:9px}
.rq-card.dense .rq-meta{margin-top:9px;padding:7px 0}
.rq-card.dense .rq-card-foot{margin-top:8px;min-height:34px}
.rq-card.dense .rq-ring-dial{width:32px;height:32px}
.rq-card.dense .rq-ring-core{inset:9px}

/* ------------------------------------------------------------- skeleton -- */
.rq-skeleton{cursor:default;animation:none;pointer-events:none;min-height:172px}
.rq-skeleton:hover{transform:none;box-shadow:0 4px 16px rgba(20,26,36,.055)}
.rq-skeleton .rq-card-rail{background:linear-gradient(180deg,#f3d3b8,#e9e2d8)}
.sk{border-radius:7px;background:linear-gradient(90deg,#eef1f5 25%,#f8fafc 45%,#eef1f5 65%);
  background-size:220% 100%;animation:rqShimmer 1.3s linear infinite}
.sk-id{width:38%;height:13px}
.sk-badge{position:absolute;top:13px;right:13px;width:74px;height:19px}
.sk-line{width:52%;height:10px;margin-top:12px}
.sk-chips{width:88%;height:26px;margin-top:12px}
.sk-meta{width:100%;height:16px;margin-top:14px}
.sk-foot{width:100%;height:32px;margin-top:14px}
@keyframes rqShimmer{to{background-position:-220% 0}}

/* ---------------------------------------------------------------- state -- */
.rq-state{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;min-height:248px;padding:28px 22px;border-radius:16px;
  border:1px dashed var(--rq-line-2);background:var(--rq-glass);color:var(--rq-muted);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.rq-state-icon{width:48px;height:48px;display:grid;place-items:center;margin-bottom:12px;border-radius:15px;
  color:var(--rq-orange-700);background:var(--rq-orange-soft);border:1px solid rgba(249,115,22,.24)}
.rq-state.error .rq-state-icon{color:var(--rq-red-ink);background:var(--rq-red-soft);border-color:rgba(214,69,69,.24)}
.rq-state h2{margin:0 0 6px;font-size:14.5px;font-weight:700;letter-spacing:-.015em;color:var(--rq-ink)}
.rq-state p{margin:0;font-size:12px;line-height:1.55;max-width:36ch}
.rq-btn{margin-top:14px;padding:9px 16px;cursor:pointer;border:0;border-radius:10px;
  font-size:12px;font-weight:750;color:#fff;
  background:linear-gradient(135deg,var(--rq-orange),var(--rq-orange-700));
  box-shadow:0 5px 16px rgba(249,115,22,.30);transition:transform .18s,box-shadow .18s}
.rq-btn:hover{transform:translateY(-1px);box-shadow:0 9px 22px rgba(249,115,22,.40)}

/* ----------------------------------------------------------- bottom nav -- */
.rq-bottomnav{position:fixed;z-index:30;left:50%;bottom:0;transform:translateX(-50%);
  width:min(100%,1080px);display:grid;grid-template-columns:repeat(3,1fr);gap:4px;
  padding:8px 14px calc(8px + env(safe-area-inset-bottom));
  border-top:1px solid var(--rq-line-2);background:rgba(255,255,255,.90);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  box-shadow:0 -8px 26px rgba(20,26,36,.06)}
.rq-navitem{position:relative;height:50px;display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:3px;cursor:pointer;border:0;border-radius:12px;background:transparent;
  color:#7b8697;font-size:9.5px;font-weight:750;letter-spacing:.02em;transition:.18s}
.rq-navitem:hover{color:var(--rq-ink-2);background:#f4f7fa}
.rq-navitem.active{color:var(--rq-orange-700);
  background:linear-gradient(180deg,var(--rq-orange-soft2),rgba(249,115,22,.02))}
.rq-navpip{position:absolute;top:-8px;width:0;height:2.5px;border-radius:9px;
  background:linear-gradient(90deg,var(--rq-orange),#fbbf24);transition:width .25s ease}
.rq-navitem.active .rq-navpip{width:34px}

/* ---------------------------------------------------------------- toast -- */
.rq-toast{position:fixed;z-index:60;left:50%;bottom:82px;display:flex;align-items:center;gap:8px;
  transform:translate(-50%,12px);opacity:0;pointer-events:none;
  padding:10px 15px;border-radius:12px;white-space:nowrap;
  font-size:12px;font-weight:650;color:#fff;background:#161d29;
  border:1px solid rgba(255,255,255,.10);
  box-shadow:0 14px 34px rgba(20,26,36,.30);transition:.26s cubic-bezier(.2,.7,.3,1)}
.rq-toast.show{opacity:1;transform:translate(-50%,0)}
.rq-toast-pip{width:6px;height:6px;border-radius:50%;background:var(--rq-orange);
  box-shadow:0 0 0 3px rgba(249,115,22,.25)}

/* ----------------------------------------------------------- responsive -- */
@media(min-width:520px){
  .rq-header-inner,.rq-shell{padding-left:20px;padding-right:20px}
  .rq-bottomnav{padding-left:20px;padding-right:20px}
  .rq-hero-title{font-size:32px}
  .rq-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}
}
@media(min-width:820px){
  .rq-header-inner{padding-top:16px;padding-bottom:20px}
  .rq-hero-title{font-size:36px}
  .rq-hero-sub{font-size:13px}
  .rq-list{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}
  .rq-toolbar{padding:12px}
  .rq-bottomnav{border:1px solid var(--rq-line-2);border-bottom:0;border-radius:18px 18px 0 0}
}
@media(min-width:1100px){
  .rq-list{grid-template-columns:repeat(3,minmax(0,1fr))}
  .rq-list.dense{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media(prefers-reduced-motion:reduce){
  .rq-root *,.rq-root *:before,.rq-root *:after{animation:none!important;transition:none!important}
}
`;
