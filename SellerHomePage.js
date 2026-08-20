import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ============================================================
   STONERATE · SELLER CONSOLE
   Theme: "Obsidian Neon" — dark hi-tech / holographic HUD
   ============================================================ */

/* ============================================================
   DATA
   ============================================================ */

const MARKET_RATES = [
  {
    id: "20mm",
    name: "20mm",
    fullName: "Crushed Stone",
    rate: 1150,
    movement: 20,
    direction: "up",
    updated: "12 min ago",
    tint: "green",
    spark: [12, 18, 15, 24, 20, 30, 34],
  },
  {
    id: "40mm",
    name: "40mm",
    fullName: "Crushed Stone",
    rate: 1220,
    movement: 10,
    direction: "down",
    updated: "18 min ago",
    tint: "orange",
    spark: [30, 26, 28, 22, 25, 18, 16],
  },
  {
    id: "black",
    name: "Black Stone",
    fullName: "Building Stone",
    rate: 980,
    movement: 0,
    direction: "stable",
    updated: "24 min ago",
    tint: "blue",
    spark: [20, 21, 20, 22, 21, 20, 21],
  },
];

const PERFORMANCE = [
  { id: "orders", label: "Total Orders", value: "18", num: 18, suffix: "", change: 12, icon: "orders" },
  { id: "tons", label: "Tons Sold", value: "426 t", num: 426, suffix: " t", change: 8, icon: "weight" },
  { id: "active", label: "Active Orders", value: "8", num: 8, suffix: "", change: -5, icon: "activity" },
  { id: "completed", label: "Completed", value: "5", num: 5, suffix: "", change: 10, icon: "check" },
];

const LOADING_ORDERS = [
  {
    deliveryId: "SD-260820-014",
    material: "40mm Crushed Stone",
    tons: 30,
    vehicles: 2,
    time: "10:30 AM",
    status: "Ready to load",
    tone: "amber",
  },
  {
    deliveryId: "SD-260820-019",
    material: "20mm Crushed Stone",
    tons: 16,
    vehicles: 1,
    time: "01:15 PM",
    status: "Scheduled",
    tone: "blue",
  },
];

const MARKET_PULSE = [
  { title: "20mm rates increased", detail: "Starting rates moved up today", icon: "trend", tone: "green" },
  { title: "40mm rates are stable", detail: "No major movement since morning", icon: "stable", tone: "blue" },
  { title: "Transport availability limited", detail: "Confirm vehicles early for today", icon: "truck", tone: "amber" },
];

const ADVANTAGES = [
  { id: "margins", title: "No hidden margins", detail: "Every rupee stays yours", icon: "shield", tone: "green" },
  { id: "direct", title: "Direct buyer orders", detail: "Zero middlemen in between", icon: "orders", tone: "blue" },
  { id: "live", title: "Live market updates", detail: "Rates refresh every minute", icon: "rates", tone: "orange" },
  { id: "transport", title: "Direct transport network", detail: "Vehicles on demand, nearby", icon: "truck", tone: "purple" },
];

const TICKER = [
  { label: "20mm", value: "₹1,150", dir: "up" },
  { label: "40mm", value: "₹1,220", dir: "down" },
  { label: "Black Stone", value: "₹980", dir: "stable" },
  { label: "Fleet online", value: "24", dir: "up" },
  { label: "Avg. dispatch", value: "38 min", dir: "stable" },
];

/* ============================================================
   ICONS
   ============================================================ */

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
    rates: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="M2 19h20" /></>,
    orders: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
    availability: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    weight: <><path d="M7 8a5 5 0 0 1 10 0" /><path d="M5 8h14l2 13H3L5 8Z" /></>,
    activity: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    truck: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    stable: <><path d="M4 12h16" /><path d="m16 8 4 4-4 4" /></>,
    samples: <><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="2" /><path d="m5 17 4-4 3 3 2-2 5 5" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    shield: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z" /><path d="m9 12 2 2 4-4" /></>,
    spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><circle cx="12" cy="12" r="3" /></>,
    pulse: <><path d="M2 12h4l3-8 4 16 3-8h6" /></>,
  };

  return <svg {...common}>{paths[name] || paths.home}</svg>;
}

/* ============================================================
   HELPERS + HOOKS
   ============================================================ */

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * useTilt — pointer-reactive 3D tilt with a light-follow glare.
 * Writes CSS custom properties so the paint stays on the compositor.
 */
function useTilt({ max = 14, scale = 1.03, glare = true } = {}) {
  const ref = useRef(null);
  const frame = useRef(0);

  const apply = useCallback((rx, ry, px, py, active) => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--rx", `${rx}deg`);
    node.style.setProperty("--ry", `${ry}deg`);
    node.style.setProperty("--px", `${px}%`);
    node.style.setProperty("--py", `${py}%`);
    node.style.setProperty("--tscale", active ? String(scale) : "1");
    node.style.setProperty("--glare", active && glare ? "1" : "0");
  }, [scale, glare]);

  const onMove = useCallback((event) => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;
    const point = event.touches ? event.touches[0] : event;
    const rect = node.getBoundingClientRect();
    const x = (point.clientX - rect.left) / rect.width;
    const y = (point.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      apply(((0.5 - y) * max).toFixed(2), ((x - 0.5) * max).toFixed(2), (x * 100).toFixed(1), (y * 100).toFixed(1), true);
    });
  }, [apply, max]);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
    apply(0, 0, 50, 50, false);
  }, [apply]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return {
    ref,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    onTouchStart: onMove,
    onTouchMove: onMove,
    onTouchEnd: onLeave,
  };
}

/** useCountUp — animates a number into view once the element is visible. */
function useCountUp(target, duration = 1100) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }

    let raf = 0;
    const run = () => {
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !done.current) {
            done.current = true;
            run();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return { ref, value };
}

/** Reveal-on-scroll wrapper. */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "in" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Sparkline({ points, tone }) {
  const path = useMemo(() => {
    const max = Math.max(...points);
    const min = Math.min(...points);
    const span = max - min || 1;
    return points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * 100;
        const y = 30 - ((p - min) / span) * 26 - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [points]);

  return (
    <svg className={`spark ${tone}`} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <path className="spark-fill" d={`${path} L100 30 L0 30 Z`} />
      <path className="spark-line" d={path} />
    </svg>
  );
}

/* ============================================================
   TICKER
   ============================================================ */

function RateTicker() {
  const feed = [...TICKER, ...TICKER];
  return (
    <div className="ticker" aria-label="Live market ticker">
      <span className="ticker-tag">
        <i />
        LIVE
      </span>
      <div className="ticker-window">
        <div className="ticker-track">
          {feed.map((item, index) => (
            <span className={`ticker-item ${item.dir}`} key={`${item.label}-${index}`}>
              <b>{item.label}</b>
              <em>{item.value}</em>
              <i>{item.dir === "up" ? "▲" : item.dir === "down" ? "▼" : "•"}</i>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HERO
   ============================================================ */

function SellerAdvantageCard({ onExplore }) {
  const tilt = useTilt({ max: 10, scale: 1.01 });

  return (
    <section className="advantage-card tilt" {...tilt}>
      <span className="feature-glare" aria-hidden="true" />
      <div className="advantage-grid" aria-hidden="true" />
      <div className="advantage-mesh" aria-hidden="true" />
      <div className="advantage-orb advantage-orb-one" aria-hidden="true" />
      <div className="advantage-orb advantage-orb-two" aria-hidden="true" />
      <div className="scan-line" aria-hidden="true" />

      <div className="advantage-copy layer-3">
        <span className="advantage-eyebrow">
          <i className="eyebrow-dot" />
          STONERATE ADVANTAGE
        </span>
        <h1>
          Sell direct.
          <br />
          <span className="grad-text">Grow stronger.</span>
        </h1>
        <p>Transparent business tools built for modern material sellers.</p>

        <button type="button" className="hero-action" onClick={onExplore}>
          <span>Explore Opportunities</span>
          <Icon name="arrow" size={16} />
        </button>

        <div className="hero-stats">
          <span>
            <b>₹0</b>
            <small>Commission</small>
          </span>
          <i />
          <span>
            <b>24/7</b>
            <small>Live rates</small>
          </span>
          <i />
          <span>
            <b>1.2k+</b>
            <small>Buyers</small>
          </span>
        </div>
      </div>

      <div className="hero-hud" aria-hidden="true">
        <span className="hud-ring hud-ring-a" />
        <span className="hud-ring hud-ring-b" />
        <span className="hud-core">
          <i />
        </span>
        <span className="hud-bars">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    </section>
  );
}

/* ============================================================
   FEATURES — ROTATING 3D COVERFLOW CAROUSEL
   ============================================================ */

/** Returns the shortest circular distance from `index` to `active`. */
function circularOffset(index, active, total) {
  let offset = index - active;
  const half = total / 2;
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;
  return offset;
}

function FeatureDeck() {
  const total = ADVANTAGES.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragRef = useRef({ x: 0, dragging: false, moved: false });

  const go = useCallback(
    (step) => setActive((prev) => (prev + step + total) % total),
    [total]
  );

  useEffect(() => {
    if (paused || prefersReducedMotion()) return undefined;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 3200);
    return () => clearInterval(timer);
  }, [paused, total]);

  const onDown = useCallback((event) => {
    const point = event.touches ? event.touches[0] : event;
    dragRef.current = { x: point.clientX, dragging: true, moved: false };
    setPaused(true);
  }, []);

  const onMove = useCallback(
    (event) => {
      const state = dragRef.current;
      if (!state.dragging || state.moved) return;
      const point = event.touches ? event.touches[0] : event;
      const delta = point.clientX - state.x;
      if (Math.abs(delta) > 40) {
        state.moved = true;
        go(delta < 0 ? 1 : -1);
      }
    },
    [go]
  );

  const onUp = useCallback(() => {
    dragRef.current.dragging = false;
    setPaused(false);
  }, []);

  return (
    <section className="section-block feature-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">WHY STONERATE</span>
          <h2>Built for your advantage</h2>
        </div>
        <span className="chip-3d">
          <Icon name="spark" size={13} /> 3D
        </span>
      </div>

      <Reveal>
        <div
          className="feature-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            dragRef.current.dragging = false;
            setPaused(false);
          }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        >
          <span className="stage-glow" aria-hidden="true" />
          <span className="stage-ring ring-a" aria-hidden="true" />
          <span className="stage-ring ring-b" aria-hidden="true" />

          <div className="feature-orbit">
            {ADVANTAGES.map((item, index) => {
              const offset = circularOffset(index, active, total);
              const distance = Math.abs(offset);
              const isActive = offset === 0;
              return (
                <article
                  key={item.id}
                  className={`orbit-card ${item.tone} ${isActive ? "is-active" : ""}`}
                  style={{
                    "--offset": offset,
                    "--distance": distance,
                    zIndex: 20 - distance,
                    opacity: distance > 1.6 ? 0 : 1,
                    pointerEvents: distance > 1.6 ? "none" : "auto",
                  }}
                  onClick={() => {
                    if (!dragRef.current.moved && !isActive) setActive(index);
                  }}
                >
                  <span className="orbit-sheen" aria-hidden="true" />
                  <span className="orbit-edge" aria-hidden="true" />

                  <span className="orbit-icon">
                    <i className="orbit-icon-ring" />
                    <Icon name={item.icon} size={24} />
                  </span>

                  <b className="orbit-title">{item.title}</b>
                  <small className="orbit-detail">{item.detail}</small>

                  <span className="orbit-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>

                  <span className="orbit-reflection" aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div className="feature-pager" role="tablist" aria-label="Advantages">
        {ADVANTAGES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={item.title}
            className={`pager-dot ${item.tone} ${index === active ? "on" : ""}`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   QUICK ACTIONS
   ============================================================ */

function QuickActions({ onNavigate }) {
  const actions = [
    { id: "upload", label: "Upload Sample", icon: "upload", tone: "orange" },
    { id: "rates", label: "Update Rates", icon: "rates", tone: "cyan" },
    { id: "orders", label: "View Orders", icon: "orders", tone: "violet" },
    { id: "availability", label: "Set Availability", icon: "availability", tone: "green" },
  ];

  return (
    <section className="quick-actions" aria-label="Seller quick actions">
      {actions.map((action, index) => (
        <button
          type="button"
          key={action.id}
          className={action.tone}
          style={{ "--i": index }}
          onClick={() => onNavigate?.(action.id)}
        >
          <span>
            <Icon name={action.icon} size={19} />
          </span>
          <b>{action.label}</b>
        </button>
      ))}
    </section>
  );
}

/* ============================================================
   MARKET RATES
   ============================================================ */

function RateCard({ rate }) {
  const tilt = useTilt({ max: 14, scale: 1.04 });

  return (
    <article className={`rate-card tilt ${rate.tint}`} {...tilt}>
      <span className="feature-glare" aria-hidden="true" />
      <span className="card-edge" aria-hidden="true" />
      <div className="rate-top layer-2">
        <span className="stone-mark">
          <i /><b /><em />
        </span>
        <small>{rate.updated}</small>
      </div>
      <h3 className="layer-3">{rate.name}</h3>
      <p>{rate.fullName}</p>
      <span className="starting-label">STARTING AT</span>
      <strong className="layer-3">
        {formatMoney(rate.rate)}
        <small>/ton</small>
      </strong>
      <Sparkline points={rate.spark} tone={rate.direction} />
      <div className={`movement ${rate.direction}`}>
        {rate.direction === "up"
          ? `↑ ${formatMoney(rate.movement)} today`
          : rate.direction === "down"
            ? `↓ ${formatMoney(rate.movement)} today`
            : "• Stable"}
      </div>
    </article>
  );
}

function MarketRates({ onViewAll }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-kicker">LIVE PRICING</span>
          <h2>Today&apos;s Market Rates</h2>
        </div>
        <button type="button" onClick={onViewAll}>
          View all
        </button>
      </div>

      <div className="rate-scroll">
        {MARKET_RATES.map((rate) => (
          <RateCard key={rate.id} rate={rate} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   PERFORMANCE
   ============================================================ */

function PerformanceCard({ metric, index }) {
  const tilt = useTilt({ max: 16, scale: 1.05 });
  const counter = useCountUp(metric.num);

  return (
    <Reveal delay={index * 70}>
      <article className="performance-card tilt" {...tilt}>
        <span className="feature-glare" aria-hidden="true" />
        <span className="card-edge" aria-hidden="true" />
        <span className="metric-wave" aria-hidden="true" />
        <div className={`metric-icon layer-3 ${metric.change < 0 ? "negative" : ""}`}>
          <Icon name={metric.icon} size={17} />
        </div>
        <strong ref={counter.ref} className="layer-2">
          {counter.value}
          {metric.suffix}
        </strong>
        <span>{metric.label}</span>
        <small className={metric.change < 0 ? "down" : "up"}>
          {metric.change < 0 ? "↓" : "↑"} {Math.abs(metric.change)}% vs last month
        </small>
      </article>
    </Reveal>
  );
}

function PerformanceDashboard() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-kicker">BUSINESS OVERVIEW</span>
          <h2>This Month Performance</h2>
        </div>
        <span className="live-pill">
          <i /> Live
        </span>
      </div>

      <div className="performance-grid">
        {PERFORMANCE.map((metric, index) => (
          <PerformanceCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   LOADING TODAY
   ============================================================ */

function LoadingToday({ onViewAll, onOpenOrder }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-kicker">TODAY&apos;S OPERATIONS</span>
          <h2>Loading Today</h2>
        </div>
        <button type="button" onClick={onViewAll}>
          View all
        </button>
      </div>

      <div className="loading-stack">
        {LOADING_ORDERS.map((order, index) => (
          <Reveal key={order.deliveryId} delay={index * 80}>
            <button
              type="button"
              className="loading-card"
              onClick={() => onOpenOrder?.(order)}
            >
              <span className={`loading-icon ${order.tone}`}>
                <Icon name="truck" size={21} />
                <i />
              </span>
              <span className="loading-copy">
                <small>{order.deliveryId}</small>
                <b>{order.material}</b>
                <em>
                  {order.tons} tons · {order.vehicles}{" "}
                  {order.vehicles === 1 ? "vehicle" : "vehicles"}
                </em>
              </span>
              <span className="loading-time">
                <b>{order.time}</b>
                <small className={order.tone}>{order.status}</small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   ORDER OVERVIEW
   ============================================================ */

function OrderOverview({ onViewOrders }) {
  const entries = [
    { label: "New Orders", value: 3, tone: "blue" },
    { label: "Confirmed", value: 5, tone: "green" },
    { label: "Loading", value: 2, tone: "amber" },
    { label: "In Transit", value: 4, tone: "purple" },
  ];
  const tilt = useTilt({ max: 8, scale: 1.01 });

  return (
    <section className="order-overview tilt" {...tilt}>
      <span className="feature-glare" aria-hidden="true" />
      <div className="overview-mesh" aria-hidden="true" />
      <div className="overview-copy layer-2">
        <span className="section-kicker">ORDER OVERVIEW</span>
        <h2>Business in motion</h2>
        <p>Track every active order from confirmation to delivery.</p>
        <button type="button" onClick={onViewOrders}>
          View All Orders <Icon name="arrow" size={15} />
        </button>
      </div>
      <div className="overview-grid layer-3">
        {entries.map((entry, index) => (
          <div
            className={`overview-metric ${entry.tone}`}
            key={entry.label}
            style={{ "--i": index }}
          >
            <strong>{entry.value}</strong>
            <span>{entry.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   MARKET PULSE
   ============================================================ */

function PulseCard({ item, index }) {
  const tilt = useTilt({ max: 12, scale: 1.03 });

  return (
    <Reveal delay={index * 80}>
      <article className={`pulse-card tilt ${item.tone}`} {...tilt}>
        <span className="feature-glare" aria-hidden="true" />
        <span className="layer-3">
          <Icon name={item.icon} size={18} />
        </span>
        <div className="layer-2">
          <b>{item.title}</b>
          <small>{item.detail}</small>
        </div>
      </article>
    </Reveal>
  );
}

function MarketPulse() {
  return (
    <section className="section-block last-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">MARKET INTELLIGENCE</span>
          <h2>Market Pulse</h2>
        </div>
        <span className="chip-3d">
          <Icon name="pulse" size={13} /> AI
        </span>
      </div>
      <div className="pulse-grid">
        {MARKET_PULSE.map((item, index) => (
          <PulseCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   BOTTOM NAV
   ============================================================ */

function BottomNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: "samples", label: "Samples", icon: "samples" },
    { id: "orders", label: "Orders", icon: "orders" },
    { id: "home", label: "Home", icon: "home" },
    { id: "mySamples", label: "My Samples", icon: "upload" },
    { id: "profile", label: "Profile", icon: "profile" },
  ];

  return (
    <nav className="bottom-nav" aria-label="Seller navigation">
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={activeTab === tab.id ? "active" : ""}
          onClick={() => onTabChange?.(tab.id)}
        >
          <span>
            <Icon name={tab.icon} size={19} />
          </span>
          <small>{tab.label}</small>
        </button>
      ))}
    </nav>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function SellerHomePage({
  sellerName = "Venkateshwara Aggregates",
  initialAvailability = "accepting",
  onNavigate,
  onOpenOrder,
}) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [showAvailability, setShowAvailability] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [notificationCount] = useState(3);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const close = (event) => {
      if (!event.target.closest || !event.target.closest(".availability-control")) {
        setShowAvailability(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const availabilityData = useMemo(
    () => ({
      accepting: { label: "Accepting Orders", tone: "green" },
      limited: { label: "Limited Availability", tone: "amber" },
      unavailable: { label: "Temporarily Unavailable", tone: "red" },
    }),
    []
  );

  const currentAvailability = availabilityData[availability] || availabilityData.accepting;

  const navigate = (target) => {
    if (["samples", "orders", "home", "mySamples", "profile"].includes(target)) {
      setActiveTab(target);
    }
    onNavigate?.(target);
  };

  const handleScroll = (event) => {
    const next = event.currentTarget.scrollTop > 8;
    setScrolled((prev) => (prev === next ? prev : next));
  };

  return (
    <div className="seller-app">
      <style>{CSS}</style>
      <main className="seller-phone">
        <div className="aurora" aria-hidden="true">
          <i className="aurora-one" />
          <i className="aurora-two" />
          <i className="aurora-three" />
        </div>
        <div className="grid-floor" aria-hidden="true" />
        <div className="noise" aria-hidden="true" />

        <header className={`seller-header ${scrolled ? "condensed" : ""}`}>
          <button type="button" className="header-icon" aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>

          <div className="seller-identity">
            <span>Good morning,</span>
            <b>{sellerName}</b>
            <div className="availability-control">
              <button
                type="button"
                className={`availability-button ${currentAvailability.tone}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setShowAvailability((value) => !value);
                }}
              >
                <i /> {currentAvailability.label}⌄
              </button>
              {showAvailability && (
                <div className="availability-menu">
                  {Object.entries(availabilityData).map(([id, item]) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => {
                        setAvailability(id);
                        setShowAvailability(false);
                      }}
                    >
                      <i className={item.tone} />
                      <span>{item.label}</span>
                      {availability === id ? <b>✓</b> : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="button" className="header-icon notification" aria-label="Notifications">
            <Icon name="bell" size={19} />
            {notificationCount > 0 ? <b>{notificationCount}</b> : null}
          </button>
        </header>

        <div className="seller-scroll" onScroll={handleScroll}>
          <div className="seller-content">
            <RateTicker />
            
            <FeatureDeck />
            <QuickActions onNavigate={navigate} />
            <MarketRates onViewAll={() => navigate("samples")} />
            <PerformanceDashboard />
            <LoadingToday onViewAll={() => navigate("orders")} onOpenOrder={onOpenOrder} />
            <OrderOverview onViewOrders={() => navigate("orders")} />
            <MarketPulse />
          </div>
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={navigate} />
      </main>
    </div>
  );
}

/* ============================================================
   STYLES — OBSIDIAN NEON
   ============================================================ */

const CSS_CORE = `
:root{color-scheme:dark}
*{box-sizing:border-box}
html,body,#root{margin:0;width:100%;min-height:100%;
  font-family:"Space Grotesk",Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}

.seller-app{
  --bg-0:#05070f;--bg-1:#080b17;--bg-2:#0c1120;
  --ink:#eaf1ff;--muted:#8b9ac0;--dim:#63719a;
  --line:rgba(140,170,255,.14);--line-hi:rgba(140,170,255,.28);
  --cyan:#22d3ee;--violet:#8b5cf6;--orange:#fb923c;--amber:#fbbf24;
  --green:#34d399;--blue:#60a5fa;--purple:#a78bfa;--red:#fb7185;
  --card:rgba(16,22,40,.72);--glass:rgba(20,27,48,.6);
  --shadow-sm:0 2px 10px rgba(0,0,0,.45);
  --shadow-md:0 14px 34px rgba(0,0,0,.55);
  --shadow-lg:0 30px 70px rgba(0,0,0,.65);
  --glow-cyan:0 0 26px rgba(34,211,238,.35);
  --glow-violet:0 0 26px rgba(139,92,246,.35);
  width:100%;height:100dvh;display:flex;align-items:center;justify-content:center;
  overflow:hidden;color:var(--ink);
  background:
    radial-gradient(900px 520px at 50% -12%,rgba(34,211,238,.12),transparent 70%),
    radial-gradient(700px 480px at 90% 110%,rgba(139,92,246,.14),transparent 70%),
    #03050c}
.seller-app button{font:inherit}
.seller-app ::selection{background:rgba(34,211,238,.3);color:#fff}

.seller-phone{position:relative;width:min(100%,430px);height:100dvh;overflow:hidden;
  color:var(--ink);isolation:isolate;
  background:
    radial-gradient(620px 320px at 12% 0%,rgba(34,211,238,.14),transparent 66%),
    radial-gradient(560px 340px at 100% 32%,rgba(139,92,246,.16),transparent 68%),
    linear-gradient(180deg,#070a14,#05070f 55%,#04060d)}

/* ---------- ambient layers ---------- */
.aurora{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.aurora i{position:absolute;display:block;border-radius:50%;filter:blur(56px);opacity:.55}
.aurora-one{width:300px;height:300px;top:-100px;left:-80px;
  background:radial-gradient(circle,rgba(34,211,238,.42),transparent 68%);
  animation:auroraA 18s ease-in-out infinite}
.aurora-two{width:340px;height:340px;top:32%;right:-130px;
  background:radial-gradient(circle,rgba(139,92,246,.38),transparent 68%);
  animation:auroraB 22s ease-in-out infinite}
.aurora-three{width:280px;height:280px;bottom:-90px;left:-70px;
  background:radial-gradient(circle,rgba(251,146,60,.28),transparent 68%);
  animation:auroraA 26s ease-in-out infinite reverse}
.grid-floor{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.5;
  background-image:linear-gradient(rgba(120,170,255,.09) 1px,transparent 1px),
    linear-gradient(90deg,rgba(120,170,255,.09) 1px,transparent 1px);
  background-size:34px 34px;
  -webkit-mask-image:radial-gradient(circle at 50% 22%,#000,transparent 78%);
  mask-image:radial-gradient(circle at 50% 22%,#000,transparent 78%)}
.noise{position:absolute;inset:0;z-index:1;pointer-events:none;opacity:.05;mix-blend-mode:overlay;
  background-image:radial-gradient(rgba(255,255,255,.6) .5px,transparent .5px);
  background-size:3px 3px}

/* ---------- header ---------- */
.seller-header{position:absolute;z-index:40;top:0;left:0;right:0;height:90px;
  display:grid;grid-template-columns:40px minmax(0,1fr) 40px;align-items:start;gap:10px;
  padding:14px 15px 10px;border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,rgba(8,12,24,.88),rgba(8,12,24,.55));
  backdrop-filter:blur(22px) saturate(160%);
  -webkit-backdrop-filter:blur(22px) saturate(160%);
  transition:box-shadow .3s,background .3s}
.seller-header.condensed{background:linear-gradient(180deg,rgba(6,9,19,.96),rgba(6,9,19,.82));
  box-shadow:0 14px 34px rgba(0,0,0,.55)}
.seller-header::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(34,211,238,.85),rgba(139,92,246,.75),transparent);
  opacity:.9;animation:lineSlide 6s ease-in-out infinite}
.header-icon{position:relative;width:38px;height:38px;display:grid;place-items:center;
  border:1px solid var(--line-hi);border-radius:13px;color:#cfe0ff;cursor:pointer;
  background:linear-gradient(160deg,rgba(30,41,70,.9),rgba(14,20,38,.9));
  box-shadow:var(--shadow-sm),inset 0 1px 0 rgba(255,255,255,.06);
  transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,border-color .22s}
.header-icon:hover{transform:translateY(-2px) scale(1.04);border-color:rgba(34,211,238,.55);
  box-shadow:var(--shadow-md),var(--glow-cyan)}
.header-icon:active{transform:scale(.94)}
.header-icon.notification b{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;
  display:grid;place-items:center;padding:0 4px;border-radius:999px;border:2px solid #070a14;
  background:linear-gradient(135deg,#fb7185,#f43f5e);color:#fff;font-size:9px;font-weight:800;
  box-shadow:0 3px 12px rgba(244,63,94,.6);animation:badgePop 2.6s ease-in-out infinite}
.seller-identity{min-width:0;padding-top:1px}
.seller-identity>span{display:block;color:var(--dim);font-size:10px;letter-spacing:.02em}
.seller-identity>b{display:block;margin-top:2px;overflow:hidden;font-size:14px;color:#f2f7ff;
  text-overflow:ellipsis;white-space:nowrap;letter-spacing:-.01em}
.availability-control{position:relative;display:inline-block}
.availability-button{display:inline-flex;align-items:center;gap:5px;margin-top:7px;
  padding:4px 9px;border-radius:999px;font-size:8.5px;font-weight:850;cursor:pointer;
  border:1px solid currentColor;background:rgba(10,16,30,.7);
  transition:transform .2s,filter .2s,box-shadow .2s}
.availability-button:hover{transform:translateY(-1px);filter:brightness(1.12)}
.availability-button i{width:6px;height:6px;border-radius:50%;background:currentColor;
  box-shadow:0 0 0 0 currentColor;animation:dotPing 2.2s ease-out infinite}
.availability-button.green{color:#34d399;box-shadow:0 0 14px rgba(52,211,153,.28)}
.availability-button.amber{color:#fbbf24;box-shadow:0 0 14px rgba(251,191,36,.28)}
.availability-button.red{color:#fb7185;box-shadow:0 0 14px rgba(251,113,133,.28)}
.availability-menu{position:absolute;z-index:70;top:36px;left:0;width:215px;padding:6px;
  border:1px solid var(--line-hi);border-radius:15px;background:rgba(12,18,34,.96);
  backdrop-filter:blur(16px);box-shadow:var(--shadow-lg);animation:menuIn .22s ease both}
.availability-menu button{width:100%;display:flex;align-items:center;gap:9px;padding:9px 10px;
  border:0;border-radius:11px;background:transparent;color:#d7e3ff;font-size:11.5px;
  font-weight:650;text-align:left;cursor:pointer;transition:background .18s,transform .18s}
.availability-menu button:hover{background:rgba(56,86,150,.25);transform:translateX(2px)}
.availability-menu i{width:8px;height:8px;border-radius:50%;flex:0 0 auto}
.availability-menu i.green{background:var(--green);box-shadow:0 0 10px var(--green)}
.availability-menu i.amber{background:var(--amber);box-shadow:0 0 10px var(--amber)}
.availability-menu i.red{background:var(--red);box-shadow:0 0 10px var(--red)}
.availability-menu span{flex:1}
.availability-menu b{color:var(--green);font-size:12px}

/* ---------- scroll shell ---------- */
.seller-scroll{position:absolute;z-index:10;top:90px;bottom:66px;left:0;right:0;
  overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scroll-behavior:smooth}
.seller-scroll::-webkit-scrollbar{width:0}
.seller-content{display:flex;flex-direction:column;gap:20px;padding:14px 15px 26px}

/* ---------- reveal ---------- */
.reveal{opacity:0;transform:translateY(16px) scale(.985);
  transition:opacity .55s cubic-bezier(.22,1,.36,1),transform .55s cubic-bezier(.22,1,.36,1)}
.reveal.in{opacity:1;transform:none}

/* ---------- shared 3D tilt ---------- */
.tilt{--rx:0deg;--ry:0deg;--px:50%;--py:50%;--tscale:1;--glare:0;
  transform-style:preserve-3d;perspective:900px;will-change:transform;
  transform:perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)) scale(var(--tscale));
  transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s}
.layer-2{transform:translateZ(22px)}
.layer-3{transform:translateZ(42px)}
.feature-glare{position:absolute;inset:0;pointer-events:none;border-radius:inherit;
  opacity:var(--glare);transition:opacity .3s;z-index:4;
  background:radial-gradient(240px circle at var(--px) var(--py),rgba(120,200,255,.28),transparent 62%);
  mix-blend-mode:screen}
.card-edge{position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;
  background:linear-gradient(150deg,rgba(34,211,238,.55),transparent 42%,transparent 62%,rgba(139,92,246,.5));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;opacity:.55;transition:opacity .35s}

/* ---------- ticker ---------- */
.ticker{position:relative;display:flex;align-items:center;gap:10px;height:34px;padding:0 10px;
  border:1px solid var(--line);border-radius:12px;overflow:hidden;
  background:linear-gradient(90deg,rgba(13,19,36,.95),rgba(15,22,42,.75));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
.ticker-tag{display:inline-flex;align-items:center;gap:5px;flex:0 0 auto;padding:3px 8px;
  border-radius:999px;background:rgba(52,211,153,.12);color:#34d399;
  font-size:8px;font-weight:900;letter-spacing:.14em}
.ticker-tag i{width:5px;height:5px;border-radius:50%;background:#34d399;
  box-shadow:0 0 8px #34d399;animation:livePulse 1.8s ease-in-out infinite}
.ticker-window{position:relative;flex:1;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
  mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.ticker-track{display:flex;align-items:center;gap:22px;width:max-content;
  animation:tickerRun 26s linear infinite}
.ticker-item{display:inline-flex;align-items:center;gap:6px;font-size:9.5px;white-space:nowrap}
.ticker-item b{color:var(--dim);font-weight:700;letter-spacing:.04em}
.ticker-item em{font-style:normal;font-weight:850;color:#e6efff;font-variant-numeric:tabular-nums}
.ticker-item i{font-style:normal;font-size:7.5px}
.ticker-item.up i{color:var(--green)}
.ticker-item.down i{color:var(--orange)}
.ticker-item.stable i{color:var(--blue)}

/* ---------- hero ---------- */
.advantage-card{position:relative;overflow:hidden;min-height:340px;padding:20px;
  border:1px solid var(--line-hi);border-radius:26px;
  background:
    radial-gradient(420px 260px at 88% 18%,rgba(139,92,246,.22),transparent 70%),
    linear-gradient(150deg,rgba(19,27,49,.95),rgba(9,13,26,.95));
  box-shadow:var(--shadow-md),inset 0 1px 0 rgba(255,255,255,.07)}
.advantage-card:hover{box-shadow:var(--shadow-lg),0 0 40px rgba(34,211,238,.16)}
.advantage-grid{position:absolute;inset:0;opacity:.6;
  background-image:linear-gradient(rgba(34,211,238,.11) 1px,transparent 1px),
    linear-gradient(90deg,rgba(34,211,238,.11) 1px,transparent 1px);
  background-size:26px 26px;
  -webkit-mask-image:radial-gradient(circle at 72% 42%,#000,transparent 74%);
  mask-image:radial-gradient(circle at 72% 42%,#000,transparent 74%)}
.advantage-mesh{position:absolute;inset:-30%;opacity:.6;pointer-events:none;
  background:conic-gradient(from 0deg at 72% 48%,rgba(34,211,238,.24),rgba(139,92,246,.22),
    rgba(251,146,60,.18),rgba(34,211,238,.24));
  filter:blur(46px);animation:meshSpin 26s linear infinite}
.advantage-orb{position:absolute;border-radius:50%;filter:blur(.5px);pointer-events:none}
.advantage-orb-one{width:11px;height:11px;top:20%;left:7%;
  background:radial-gradient(circle,#a5f3fc,#22d3ee);opacity:.9;
  box-shadow:0 0 22px rgba(34,211,238,.8);animation:orbFloat 6s ease-in-out infinite}
.advantage-orb-two{width:8px;height:8px;bottom:26%;left:15%;
  background:radial-gradient(circle,#ddd6fe,#8b5cf6);opacity:.85;
  box-shadow:0 0 20px rgba(139,92,246,.75);animation:orbFloat 8s ease-in-out infinite reverse}
.scan-line{position:absolute;left:0;right:0;height:80px;pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(34,211,238,.16),transparent);
  animation:scanMove 7s linear infinite}
.advantage-copy{position:relative;z-index:3;width:66%}
.advantage-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;
  border:1px solid rgba(34,211,238,.4);border-radius:999px;background:rgba(34,211,238,.1);
  color:#67e8f9;font-size:8px;font-weight:900;letter-spacing:.13em;
  box-shadow:0 0 18px rgba(34,211,238,.2)}
.eyebrow-dot{width:5px;height:5px;border-radius:50%;background:#22d3ee;
  box-shadow:0 0 0 0 rgba(34,211,238,.7);animation:dotPing 2s ease-out infinite}
.advantage-copy h1{margin:12px 0 8px;font-size:28px;line-height:1.12;letter-spacing:-.04em;
  font-weight:850;color:#f5f9ff;text-shadow:0 0 30px rgba(120,180,255,.25)}
.grad-text{background:linear-gradient(100deg,#22d3ee,#8b5cf6 45%,#fb923c);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  background-size:220% 100%;animation:gradShift 6s ease-in-out infinite;
  filter:drop-shadow(0 0 18px rgba(139,92,246,.35))}
.advantage-copy p{margin:0 0 16px;max-width:230px;color:var(--muted);font-size:11.5px;
  line-height:1.55}
.hero-action{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:8px;
  padding:11px 17px;border:1px solid rgba(255,255,255,.16);border-radius:14px;
  background:linear-gradient(120deg,#22d3ee,#3b82f6 52%,#8b5cf6);color:#04121c;
  font-size:11.5px;font-weight:850;cursor:pointer;
  box-shadow:0 14px 30px rgba(34,211,238,.28),0 0 24px rgba(139,92,246,.24);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s}
.hero-action::after{content:"";position:absolute;top:0;left:-140%;width:60%;height:100%;
  transform:skewX(-22deg);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);
  animation:shimmer 3.4s ease-in-out infinite}
.hero-action:hover{transform:translateY(-2px) scale(1.02);
  box-shadow:0 20px 40px rgba(34,211,238,.36),0 0 34px rgba(139,92,246,.32)}
.hero-action:active{transform:scale(.97)}
.hero-action svg{transition:transform .25s}
.hero-action:hover svg{transform:translateX(3px)}
.hero-stats{display:flex;align-items:center;gap:10px;margin-top:16px}
.hero-stats span{display:flex;flex-direction:column;gap:1px}
.hero-stats b{font-size:13px;font-weight:850;letter-spacing:-.02em;color:#e8f2ff}
.hero-stats small{color:var(--dim);font-size:7.5px;font-weight:750;letter-spacing:.07em;
  text-transform:uppercase}
.hero-stats>i{width:1px;height:22px;background:linear-gradient(180deg,transparent,
  rgba(140,170,255,.35),transparent)}

/* ---------- hero HUD ---------- */
.hero-hud{position:absolute;z-index:2;right:-14px;bottom:24px;width:172px;height:172px;
  pointer-events:none}
.hud-ring{position:absolute;left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%)}
.hud-ring-a{width:158px;height:158px;border:1.4px dashed rgba(34,211,238,.45);
  animation:ringSpin 16s linear infinite}
.hud-ring-b{width:112px;height:112px;border:1.4px solid rgba(139,92,246,.4);
  border-right-color:transparent;border-bottom-color:transparent;
  animation:ringSpin 9s linear infinite reverse}
.hud-core{position:absolute;left:50%;top:50%;width:62px;height:62px;border-radius:50%;
  transform:translate(-50%,-50%);display:grid;place-items:center;
  background:radial-gradient(circle,rgba(34,211,238,.4),rgba(139,92,246,.16) 60%,transparent 72%);
  box-shadow:0 0 40px rgba(34,211,238,.4);animation:corePulse 4s ease-in-out infinite}
.hud-core i{width:20px;height:20px;border-radius:6px;
  background:linear-gradient(140deg,#a5f3fc,#8b5cf6);
  box-shadow:0 0 22px rgba(165,243,252,.8);animation:cubeFloat 7s ease-in-out infinite}
.hud-bars{position:absolute;left:50%;bottom:8px;display:flex;align-items:flex-end;gap:5px;
  height:34px;transform:translateX(-50%)}
.hud-bars i{width:5px;border-radius:2px;background:linear-gradient(180deg,#22d3ee,#3b82f6);
  box-shadow:0 0 12px rgba(34,211,238,.55);animation:barGlow 2.6s ease-in-out infinite}
.hud-bars i:nth-child(1){height:12px}
.hud-bars i:nth-child(2){height:24px;animation-delay:.3s}
.hud-bars i:nth-child(3){height:17px;animation-delay:.6s}
.hud-bars i:nth-child(4){height:30px;animation-delay:.9s}
`;

const CSS_SECTIONS = `
/* ---------- section shell ---------- */
.section-block{display:flex;flex-direction:column;gap:12px}
.section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.section-heading h2{margin:0;font-size:15.5px;font-weight:850;letter-spacing:-.03em;color:#eef4ff}
.section-kicker{display:block;margin-bottom:3px;color:#5f7099;font-size:8px;font-weight:900;
  letter-spacing:.16em}
.section-heading>button{padding:5px 11px;border:1px solid var(--line-hi);border-radius:999px;
  background:rgba(18,25,45,.85);color:#b9caf0;font-size:10px;font-weight:750;cursor:pointer;
  box-shadow:var(--shadow-sm);transition:transform .2s,box-shadow .2s,color .2s,border-color .2s}
.section-heading>button:hover{transform:translateY(-1px);color:#67e8f9;
  border-color:rgba(34,211,238,.5);box-shadow:var(--glow-cyan)}
.chip-3d{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;
  border:1px solid rgba(139,92,246,.45);background:rgba(139,92,246,.13);color:#c4b5fd;
  font-size:9px;font-weight:900;letter-spacing:.08em;box-shadow:0 0 16px rgba(139,92,246,.22)}
.live-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;
  border:1px solid rgba(52,211,153,.4);background:rgba(52,211,153,.12);color:#6ee7b7;
  font-size:9px;font-weight:850}
.live-pill i{width:6px;height:6px;border-radius:50%;background:#34d399;
  box-shadow:0 0 10px #34d399;animation:livePulse 1.9s ease-in-out infinite}

/* ---------- FEATURE COVERFLOW (rotating 3D deck) ---------- */
.performance-grid>.reveal{height:100%}
.feature-stage{position:relative;height:250px;margin:2px -15px 0;overflow:hidden;
  perspective:1000px;perspective-origin:50% 46%;
  cursor:grab;user-select:none;-webkit-user-select:none;touch-action:pan-y}
.feature-stage:active{cursor:grabbing}
.stage-glow{position:absolute;left:50%;top:52%;width:340px;height:340px;pointer-events:none;
  transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(34,211,238,.26),rgba(139,92,246,.18) 44%,transparent 70%);
  filter:blur(28px);animation:stageGlow 8s ease-in-out infinite}
.stage-ring{position:absolute;left:50%;bottom:26px;border-radius:50%;pointer-events:none;
  border:1.5px solid rgba(34,211,238,.35);
  transform:translateX(-50%) rotateX(72deg)}
.stage-ring.ring-a{width:210px;height:210px;animation:stageRing 5.5s ease-in-out infinite}
.stage-ring.ring-b{width:290px;height:290px;border-color:rgba(139,92,246,.28);
  animation:stageRing 5.5s ease-in-out infinite .9s}
.feature-orbit{position:absolute;inset:0;transform-style:preserve-3d}

.orbit-card{position:absolute;left:50%;top:50%;width:158px;height:206px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;
  padding:18px 14px;border-radius:24px;border:1px solid rgba(255,255,255,.08);
  background:linear-gradient(158deg,var(--tone-hi),rgba(12,17,33,.96) 48%,var(--tone-lo));
  box-shadow:0 22px 46px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.08);
  text-align:center;cursor:pointer;backface-visibility:hidden;
  transform-origin:50% 50%;
  transform:translate(-50%,-50%)
    translateX(calc(var(--offset) * 118px))
    translateY(calc(var(--distance) * 6px))
    translateZ(calc(var(--distance) * -180px))
    rotateY(calc(var(--offset) * -38deg))
    scale(calc(1 - var(--distance) * .12));
  transition:transform .62s cubic-bezier(.22,1,.36,1),opacity .45s ease,
    box-shadow .45s ease,filter .45s ease;
  filter:saturate(.55) brightness(.72)}
.orbit-card.green{--tone:#34d399;--tone-hi:rgba(52,211,153,.22);--tone-lo:rgba(52,211,153,.1);
  --tone-soft:rgba(52,211,153,.26)}
.orbit-card.blue{--tone:#60a5fa;--tone-hi:rgba(96,165,250,.22);--tone-lo:rgba(96,165,250,.1);
  --tone-soft:rgba(96,165,250,.26)}
.orbit-card.orange{--tone:#fb923c;--tone-hi:rgba(251,146,60,.22);--tone-lo:rgba(251,146,60,.1);
  --tone-soft:rgba(251,146,60,.26)}
.orbit-card.purple{--tone:#a78bfa;--tone-hi:rgba(167,139,250,.22);--tone-lo:rgba(167,139,250,.1);
  --tone-soft:rgba(167,139,250,.26)}
.orbit-card.is-active{cursor:default;filter:none;
  box-shadow:0 34px 68px rgba(0,0,0,.7),0 0 0 1px var(--tone-soft),
    0 0 42px var(--tone-soft),inset 0 1px 0 rgba(255,255,255,.12);
  animation:orbitFloat 4.6s ease-in-out .62s infinite}
.orbit-edge{position:absolute;inset:0;border-radius:inherit;padding:1.2px;pointer-events:none;
  background:linear-gradient(150deg,var(--tone),transparent 45%,transparent 60%,var(--tone));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;opacity:.35;transition:opacity .45s}
.orbit-card.is-active .orbit-edge{opacity:.95}
.orbit-sheen{position:absolute;top:-70%;left:-45%;width:55%;height:240%;pointer-events:none;
  border-radius:inherit;transform:rotate(20deg);opacity:0;
  background:linear-gradient(90deg,transparent,rgba(190,230,255,.35),transparent)}
.orbit-card.is-active .orbit-sheen{opacity:1;animation:orbitSheen 4.2s ease-in-out infinite}
.orbit-icon{position:relative;width:52px;height:52px;display:grid;place-items:center;
  border-radius:18px;color:var(--tone);background:var(--tone-soft);
  box-shadow:0 0 26px var(--tone-soft),inset 0 1px 0 rgba(255,255,255,.14)}
.orbit-icon-ring{position:absolute;inset:-6px;border:1.5px dashed var(--tone);border-radius:22px;
  opacity:.45;animation:ringSpin 11s linear infinite}
.orbit-title{max-width:100%;color:#f0f6ff;font-size:14px;font-weight:850;
  letter-spacing:-.02em;line-height:1.22}
.orbit-detail{max-width:130px;color:var(--muted);font-size:10px;line-height:1.45}
.orbit-dots{display:flex;gap:5px;margin-top:2px}
.orbit-dots i{width:5px;height:5px;border-radius:50%;background:var(--tone);opacity:.35}
.orbit-card.is-active .orbit-dots i{animation:dotBlink 1.5s ease-in-out infinite}
.orbit-card.is-active .orbit-dots i:nth-child(2){animation-delay:.2s}
.orbit-card.is-active .orbit-dots i:nth-child(3){animation-delay:.4s}
.orbit-reflection{position:absolute;left:8%;right:8%;bottom:-16px;height:18px;border-radius:50%;
  pointer-events:none;background:radial-gradient(ellipse,var(--tone-soft),transparent 72%);
  filter:blur(8px);opacity:0;transition:opacity .45s}
.orbit-card.is-active .orbit-reflection{opacity:1}

.feature-pager{display:flex;justify-content:center;gap:7px;margin-top:6px}
.pager-dot{width:7px;height:7px;padding:0;border:0;border-radius:999px;cursor:pointer;
  background:rgba(140,170,255,.28);transition:width .35s cubic-bezier(.22,1,.36,1),background .35s,
  box-shadow .35s}
.pager-dot.on{width:22px}
.pager-dot.on.green{background:var(--green);box-shadow:0 0 12px var(--green)}
.pager-dot.on.blue{background:var(--blue);box-shadow:0 0 12px var(--blue)}
.pager-dot.on.orange{background:var(--orange);box-shadow:0 0 12px var(--orange)}
.pager-dot.on.purple{background:var(--purple);box-shadow:0 0 12px var(--purple)}

/* ---------- quick actions ---------- */
.quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
.quick-actions button{position:relative;overflow:hidden;display:flex;flex-direction:column;
  align-items:center;gap:7px;padding:13px 5px;border:1px solid var(--line);
  border-radius:17px;cursor:pointer;color:inherit;
  background:linear-gradient(160deg,rgba(22,30,53,.92),rgba(11,16,31,.92));
  box-shadow:var(--shadow-sm),inset 0 1px 0 rgba(255,255,255,.05);
  transition:transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .28s,border-color .28s}
.quick-actions button::after{content:"";position:absolute;inset:auto 0 0 0;height:2px;
  background:linear-gradient(90deg,var(--qa),transparent);transform:scaleX(0);
  transform-origin:left;transition:transform .35s}
.quick-actions button.orange{--qa:#fb923c;--qa-soft:rgba(251,146,60,.16)}
.quick-actions button.cyan{--qa:#22d3ee;--qa-soft:rgba(34,211,238,.16)}
.quick-actions button.violet{--qa:#a78bfa;--qa-soft:rgba(167,139,250,.16)}
.quick-actions button.green{--qa:#34d399;--qa-soft:rgba(52,211,153,.16)}
.quick-actions button:hover{transform:translateY(-4px);border-color:var(--qa);
  box-shadow:var(--shadow-md),0 0 24px var(--qa-soft)}
.quick-actions button:hover::after{transform:scaleX(1)}
.quick-actions button:active{transform:translateY(-1px) scale(.97)}
.quick-actions span{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;
  color:var(--qa);background:var(--qa-soft);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 0 18px var(--qa-soft);
  transition:transform .35s}
.quick-actions button:hover span{transform:rotateY(180deg)}
.quick-actions b{color:#b7c6e6;font-size:8px;font-weight:800;text-align:center;line-height:1.25}

/* ---------- market rates ---------- */
.rate-scroll{display:flex;gap:11px;overflow-x:auto;padding:6px 15px 10px;margin:0 -15px;
  scroll-snap-type:x mandatory}
.rate-scroll::-webkit-scrollbar{height:0}
.rate-card{position:relative;overflow:hidden;flex:0 0 150px;padding:14px 13px 13px;
  border:1px solid var(--line);border-radius:19px;scroll-snap-align:start;
  background:linear-gradient(160deg,rgba(21,29,52,.95),rgba(10,15,29,.95));
  box-shadow:var(--shadow-md);cursor:default}
.rate-card::before{content:"";position:absolute;top:0;left:0;right:0;height:2.5px;z-index:3;
  background:var(--accent);box-shadow:0 0 16px var(--dot)}
.rate-card.green{--accent:linear-gradient(90deg,#34d399,#a7f3d0);--dot:#34d399}
.rate-card.orange{--accent:linear-gradient(90deg,#fb923c,#fdba74);--dot:#fb923c}
.rate-card.blue{--accent:linear-gradient(90deg,#60a5fa,#c7d2fe);--dot:#60a5fa}
.rate-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.stone-mark{position:relative;width:26px;height:22px;display:block}
.stone-mark i,.stone-mark b,.stone-mark em{position:absolute;border-radius:3px;
  background:var(--dot);box-shadow:0 0 10px var(--dot)}
.stone-mark i{width:11px;height:11px;left:0;bottom:0;opacity:.5}
.stone-mark b{width:9px;height:9px;left:9px;bottom:6px;opacity:.75}
.stone-mark em{width:7px;height:7px;left:17px;bottom:0;opacity:.95}
.rate-top small{color:var(--dim);font-size:7.5px;font-weight:650}
.rate-card h3{margin:0;font-size:16px;font-weight:850;letter-spacing:-.03em;color:#f0f6ff}
.rate-card p{margin:2px 0 9px;color:var(--muted);font-size:9px}
.starting-label{display:block;color:#5f7099;font-size:7.5px;font-weight:800;letter-spacing:.12em}
.rate-card strong{display:block;margin-top:2px;font-size:19px;font-weight:850;
  letter-spacing:-.035em;color:#fff;font-variant-numeric:tabular-nums}
.rate-card strong small{margin-left:2px;color:var(--muted);font-size:9px;font-weight:650}
.spark{width:100%;height:26px;margin:7px 0 2px;display:block}
.spark-line{fill:none;stroke-width:2;vector-effect:non-scaling-stroke;stroke-linecap:round}
.spark.up .spark-line{stroke:#34d399;filter:drop-shadow(0 0 5px rgba(52,211,153,.8))}
.spark.down .spark-line{stroke:#fb923c;filter:drop-shadow(0 0 5px rgba(251,146,60,.8))}
.spark.stable .spark-line{stroke:#60a5fa;filter:drop-shadow(0 0 5px rgba(96,165,250,.8))}
.spark-fill{stroke:none;opacity:.2}
.spark.up .spark-fill{fill:#34d399}
.spark.down .spark-fill{fill:#fb923c}
.spark.stable .spark-fill{fill:#60a5fa}
.movement{margin-top:5px;padding:4px 8px;border-radius:999px;font-size:8.5px;font-weight:850;
  display:inline-block;border:1px solid currentColor}
.movement.up{color:#6ee7b7;background:rgba(52,211,153,.12)}
.movement.down{color:#fdba74;background:rgba(251,146,60,.12)}
.movement.stable{color:#93c5fd;background:rgba(96,165,250,.12)}

/* ---------- performance ---------- */
.performance-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.performance-card{position:relative;overflow:hidden;height:100%;padding:14px 13px;
  border:1px solid var(--line);border-radius:19px;
  background:linear-gradient(155deg,rgba(21,29,52,.95),rgba(10,15,29,.95));
  box-shadow:var(--shadow-md);transform-style:preserve-3d}
.metric-wave{position:absolute;left:0;right:0;bottom:0;height:40px;pointer-events:none;
  background:radial-gradient(120% 100% at 50% 130%,rgba(34,211,238,.22),transparent 70%)}
.metric-icon{width:33px;height:33px;display:grid;place-items:center;border-radius:11px;
  color:#34d399;background:rgba(52,211,153,.14);
  box-shadow:0 0 20px rgba(52,211,153,.24),inset 0 1px 0 rgba(255,255,255,.1)}
.metric-icon.negative{color:#fb923c;background:rgba(251,146,60,.14);
  box-shadow:0 0 20px rgba(251,146,60,.24),inset 0 1px 0 rgba(255,255,255,.1)}
.performance-card strong{display:block;margin-top:11px;font-size:22px;font-weight:850;
  letter-spacing:-.04em;font-variant-numeric:tabular-nums;color:#fff;
  text-shadow:0 0 22px rgba(120,180,255,.28)}
.performance-card>span{display:block;margin-top:1px;color:var(--muted);font-size:10px;
  font-weight:650}
.performance-card small{display:block;margin-top:7px;font-size:8.5px;font-weight:800}
.performance-card small.up{color:#6ee7b7}
.performance-card small.down{color:#fdba74}

/* ---------- loading today ---------- */
.loading-stack{display:flex;flex-direction:column;gap:10px}
.loading-card{width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;
  align-items:center;gap:11px;padding:13px 12px;border:1px solid var(--line);
  border-radius:18px;color:var(--ink);text-align:left;cursor:pointer;
  background:linear-gradient(160deg,rgba(20,28,50,.92),rgba(10,15,29,.92));
  box-shadow:var(--shadow-sm);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,border-color .25s}
.loading-card:hover{transform:translateY(-3px) scale(1.008);border-color:rgba(34,211,238,.4);
  box-shadow:var(--shadow-md),0 0 26px rgba(34,211,238,.14)}
.loading-card:active{transform:scale(.99)}
.loading-card>svg{color:#4d5c82;flex:0 0 auto;transition:transform .25s,color .25s}
.loading-card:hover>svg{transform:translateX(3px);color:#22d3ee}
.loading-icon{position:relative;width:42px;height:42px;display:grid;place-items:center;
  border-radius:14px}
.loading-icon.amber{color:#fbbf24;background:rgba(251,191,36,.13);
  box-shadow:0 0 22px rgba(251,191,36,.2)}
.loading-icon.blue{color:#60a5fa;background:rgba(96,165,250,.13);
  box-shadow:0 0 22px rgba(96,165,250,.2)}
.loading-icon i{position:absolute;top:-2px;right:-2px;width:9px;height:9px;border-radius:50%;
  border:2px solid #0a0f1d;background:currentColor;animation:livePulse 2.1s ease-in-out infinite}
.loading-copy{min-width:0}
.loading-copy small{display:block;color:#5f7099;font-size:8px;font-weight:750;
  letter-spacing:.07em}
.loading-copy b{display:block;margin-top:2px;overflow:hidden;font-size:11.5px;font-weight:800;
  text-overflow:ellipsis;white-space:nowrap;color:#eaf1ff}
.loading-copy em{display:block;margin-top:2px;color:var(--muted);font-size:9px;font-style:normal}
.loading-time{text-align:right}
.loading-time b{display:block;font-size:11px;font-weight:850;color:#eaf1ff}
.loading-time small{display:inline-block;margin-top:3px;padding:2px 7px;border-radius:999px;
  font-size:7.5px;font-weight:850;white-space:nowrap;border:1px solid currentColor}
.loading-time small.amber{color:#fbbf24;background:rgba(251,191,36,.12)}
.loading-time small.blue{color:#93c5fd;background:rgba(96,165,250,.12)}

/* ---------- order overview ---------- */
.order-overview{position:relative;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;
  gap:14px;padding:18px 16px;border:1px solid var(--line-hi);border-radius:24px;
  background:
    radial-gradient(400px 240px at 12% 10%,rgba(34,211,238,.18),transparent 70%),
    linear-gradient(140deg,rgba(19,27,49,.96),rgba(9,13,26,.96));
  box-shadow:var(--shadow-md),inset 0 1px 0 rgba(255,255,255,.07)}
.overview-mesh{position:absolute;inset:-40%;pointer-events:none;opacity:.55;filter:blur(48px);
  background:conic-gradient(from 90deg at 30% 60%,rgba(34,211,238,.24),rgba(139,92,246,.22),
    rgba(251,146,60,.16),rgba(34,211,238,.24));animation:meshSpin 30s linear infinite reverse}
.overview-copy{position:relative;z-index:2}
.overview-copy h2{margin:0 0 5px;font-size:16px;font-weight:850;letter-spacing:-.03em;
  color:#f2f7ff}
.overview-copy p{margin:0 0 13px;color:var(--muted);font-size:10px;line-height:1.5}
.overview-copy button{display:inline-flex;align-items:center;gap:6px;padding:9px 13px;
  border:1px solid rgba(34,211,238,.45);border-radius:12px;
  background:linear-gradient(120deg,rgba(34,211,238,.18),rgba(139,92,246,.18));color:#d7f6ff;
  font-size:10px;font-weight:850;cursor:pointer;box-shadow:0 0 22px rgba(34,211,238,.2);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s}
.overview-copy button:hover{transform:translateY(-2px);box-shadow:0 0 32px rgba(34,211,238,.36)}
.overview-copy button:active{transform:scale(.97)}
.overview-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:9px}
.overview-metric{padding:11px 10px;border:1px solid var(--line);border-radius:15px;
  background:rgba(10,15,29,.7);backdrop-filter:blur(8px);box-shadow:var(--shadow-sm);
  transition:transform .25s,box-shadow .25s,border-color .25s}
.overview-metric:hover{transform:translateY(-3px) rotateX(6deg);border-color:var(--om);
  box-shadow:0 0 22px var(--om-soft)}
.overview-metric strong{display:block;font-size:19px;font-weight:850;letter-spacing:-.04em}
.overview-metric span{display:block;margin-top:1px;color:var(--muted);font-size:8.5px;
  font-weight:700}
.overview-metric.blue{--om:#60a5fa;--om-soft:rgba(96,165,250,.25)}
.overview-metric.green{--om:#34d399;--om-soft:rgba(52,211,153,.25)}
.overview-metric.amber{--om:#fbbf24;--om-soft:rgba(251,191,36,.25)}
.overview-metric.purple{--om:#a78bfa;--om-soft:rgba(167,139,250,.25)}
.overview-metric strong{color:var(--om);text-shadow:0 0 18px var(--om-soft)}

/* ---------- market pulse ---------- */
.pulse-grid{display:flex;flex-direction:column;gap:10px}
.pulse-card{position:relative;overflow:hidden;display:flex;align-items:center;gap:11px;
  padding:13px 12px;border:1px solid var(--line);border-radius:17px;
  background:linear-gradient(160deg,rgba(20,28,50,.92),rgba(10,15,29,.92));
  box-shadow:var(--shadow-sm);transform-style:preserve-3d}
.pulse-card::before{content:"";position:absolute;top:0;bottom:0;left:0;width:2.5px;
  background:var(--pulse);box-shadow:0 0 16px var(--pulse)}
.pulse-card.green{--pulse:#34d399;--pulse-soft:rgba(52,211,153,.14)}
.pulse-card.blue{--pulse:#60a5fa;--pulse-soft:rgba(96,165,250,.14)}
.pulse-card.amber{--pulse:#fbbf24;--pulse-soft:rgba(251,191,36,.14)}
.pulse-card>span{width:35px;height:35px;display:grid;place-items:center;border-radius:12px;
  flex:0 0 auto;color:var(--pulse);background:var(--pulse-soft);
  box-shadow:0 0 20px var(--pulse-soft)}
.pulse-card b{display:block;font-size:11.5px;font-weight:800;letter-spacing:-.015em;
  color:#eaf1ff}
.pulse-card small{display:block;margin-top:2px;color:var(--muted);font-size:9.5px}
.last-section{padding-bottom:4px}

/* ---------- bottom nav ---------- */
.bottom-nav{position:absolute;z-index:40;bottom:0;left:0;right:0;height:66px;
  display:grid;grid-template-columns:repeat(5,1fr);align-items:center;padding:0 6px 4px;
  border-top:1px solid var(--line);
  background:linear-gradient(0deg,rgba(6,9,19,.96),rgba(9,13,26,.7));
  backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);
  box-shadow:0 -10px 30px rgba(0,0,0,.5)}
.bottom-nav::before{content:"";position:absolute;left:0;right:0;top:-1px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(34,211,238,.6),rgba(139,92,246,.5),transparent)}
.bottom-nav button{position:relative;display:flex;flex-direction:column;align-items:center;
  gap:3px;padding:6px 2px;border:0;background:transparent;color:#5f7099;cursor:pointer;
  transition:color .22s}
.bottom-nav button span{width:34px;height:30px;display:grid;place-items:center;border-radius:11px;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1),background .3s,box-shadow .3s}
.bottom-nav button small{font-size:8px;font-weight:750}
.bottom-nav button:hover{color:#9fb3dd}
.bottom-nav button.active{color:#67e8f9}
.bottom-nav button.active span{transform:translateY(-3px) scale(1.06);
  background:linear-gradient(150deg,rgba(34,211,238,.2),rgba(139,92,246,.16));
  box-shadow:0 0 22px rgba(34,211,238,.35)}
.bottom-nav button.active::after{content:"";position:absolute;top:0;width:18px;height:2.5px;
  border-radius:999px;background:linear-gradient(90deg,#22d3ee,#8b5cf6);
  box-shadow:0 0 12px rgba(34,211,238,.8)}
`;

const CSS_MOTION = `
/* ---------- keyframes ---------- */
@keyframes auroraA{0%,100%{transform:translate3d(0,0,0) scale(1)}
  50%{transform:translate3d(18px,26px,0) scale(1.12)}}
@keyframes auroraB{0%,100%{transform:translate3d(0,0,0) scale(1)}
  50%{transform:translate3d(-24px,-18px,0) scale(1.08)}}
@keyframes meshSpin{to{transform:rotate(360deg)}}
@keyframes scanMove{0%{top:-80px;opacity:0}12%{opacity:1}88%{opacity:1}100%{top:100%;opacity:0}}
@keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes shimmer{0%{left:-140%}55%,100%{left:140%}}
@keyframes lineSlide{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes tickerRun{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes ringSpin{to{transform:rotate(360deg)}}
@keyframes corePulse{0%,100%{opacity:.85;transform:translate(-50%,-50%) scale(1)}
  50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}
@keyframes stageGlow{0%,100%{opacity:.75;transform:translate(-50%,-50%) scale(1)}
  50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}}
@keyframes stageRing{0%,100%{opacity:.3;transform:translateX(-50%) rotateX(72deg) scale(.94)}
  50%{opacity:.8;transform:translateX(-50%) rotateX(72deg) scale(1.05)}}
@keyframes orbitFloat{0%,100%{transform:translate(-50%,-50%) translateX(0) translateZ(0)
    rotateY(0deg) scale(1)}
  50%{transform:translate(-50%,-52.5%) translateX(0) translateZ(14px)
    rotateY(4deg) scale(1.015)}}
@keyframes orbitSheen{0%{transform:translateX(0) rotate(20deg);opacity:0}
  16%{opacity:.9}48%{transform:translateX(330%) rotate(20deg);opacity:0}
  100%{transform:translateX(330%) rotate(20deg);opacity:0}}
@keyframes dotBlink{0%,100%{opacity:.28;transform:scale(1)}
  50%{opacity:1;transform:scale(1.25)}}
@keyframes badgePop{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@keyframes dotPing{0%{box-shadow:0 0 0 0 currentColor;opacity:.9}
  70%{box-shadow:0 0 0 6px transparent;opacity:1}100%{box-shadow:0 0 0 0 transparent;opacity:.9}}
@keyframes menuIn{from{opacity:0;transform:translateY(-6px) scale(.97)}
  to{opacity:1;transform:none}}
@keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes barGlow{0%,100%{opacity:.6;filter:brightness(.85)}
  50%{opacity:1;filter:brightness(1.45)}}
@keyframes cubeFloat{0%,100%{transform:translateY(0) rotate(30deg)}
  50%{transform:translateY(-8px) rotate(52deg)}}
@keyframes livePulse{0%,100%{opacity:.6}
  50%{opacity:1;box-shadow:0 0 0 6px rgba(52,211,153,.1)}}

/* ---------- responsive ---------- */
@media(min-width:700px){
  .seller-phone{height:min(900px,calc(100dvh - 24px));border:1px solid rgba(140,170,255,.18);
    border-radius:30px;
    box-shadow:0 40px 100px rgba(0,0,0,.75),0 0 70px rgba(34,211,238,.12)}
}
@media(max-width:370px){
  .advantage-card{min-height:318px;padding:17px}
  .advantage-copy{width:64%}
  .advantage-copy h1{font-size:23px}
  .hero-stats{gap:8px}
  .hero-hud{width:150px;height:150px;right:-22px}
  .feature-stage{height:228px}
  .orbit-card{width:144px;height:190px;padding:16px 12px;
    transform:translate(-50%,-50%)
      translateX(calc(var(--offset) * 104px))
      translateY(calc(var(--distance) * 6px))
      translateZ(calc(var(--distance) * -170px))
      rotateY(calc(var(--offset) * -38deg))
      scale(calc(1 - var(--distance) * .12))}
  .orbit-title{font-size:13px}
  .quick-actions button b{font-size:7px}
  .loading-card{grid-template-columns:auto minmax(0,1fr) auto}
  .loading-card>svg{display:none}
  .loading-time small{max-width:65px}
  .order-overview{grid-template-columns:1fr}
}
@media(hover:none){
  .tilt{transform:none!important}
}
@media(prefers-reduced-motion:reduce){
  .seller-app *{animation:none!important;transition:none!important}
  .tilt{transform:none!important}
  .reveal{opacity:1!important;transform:none!important}
}
`;

const CSS = CSS_CORE + CSS_SECTIONS + CSS_MOTION;
