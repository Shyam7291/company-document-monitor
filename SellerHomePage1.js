import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
      <path className="spark-line" d={path} />
      <path className="spark-fill" d={`${path} L100 30 L0 30 Z`} />
    </svg>
  );
}

/* ============================================================
   HERO
   ============================================================ */

function SellerAdvantageCard({ onExplore }) {
  const tilt = useTilt({ max: 10, scale: 1.01 });

  return (
    <section className="advantage-card tilt" {...tilt}>
      <div className="advantage-grid" />
      <div className="advantage-mesh" />
      <div className="advantage-orb advantage-orb-one" />
      <div className="advantage-orb advantage-orb-two" />
      <div className="scan-line" />

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
      </div>

      <div className="scene layer-2" aria-hidden="true">
        <div className="scene-platform platform-back" />
        <div className="scene-platform platform-front" />
        <div className="digital-ring ring-one" />
        <div className="digital-ring ring-two" />

        <div className="warehouse">
          <div className="warehouse-roof" />
          <div className="warehouse-wall">
            <i /><i /><i />
          </div>
          <div className="warehouse-door" />
        </div>

        <div className="truck-3d">
          <div className="truck-box"><i /><i /><i /></div>
          <div className="truck-cabin"><span /></div>
          <div className="truck-bumper" />
          <div className="wheel wheel-one"><i /></div>
          <div className="wheel wheel-two"><i /></div>
        </div>

        <div className="growth-hologram">
          <i className="bar bar-one" />
          <i className="bar bar-two" />
          <i className="bar bar-three" />
          <i className="bar bar-four" />
          <span className="growth-line">↗</span>
        </div>

        <div className="floating-cube cube-one" />
        <div className="floating-cube cube-two" />
        <div className="floating-cube cube-three" />
      </div>
    </section>
  );
}

/* ============================================================
   FEATURES — 3D MOTION CARDS
   ============================================================ */

function FeatureCard({ item, index }) {
  const tilt = useTilt({ max: 18, scale: 1.05 });

  return (
    <Reveal delay={index * 90}>
      <article
        className={`feature-card tilt ${item.tone}`}
        {...tilt}
        style={{ "--i": index }}
      >
        <span className="feature-beam" aria-hidden="true" />
        <span className="feature-glare" aria-hidden="true" />
        <span className="feature-corner tl" aria-hidden="true" />
        <span className="feature-corner br" aria-hidden="true" />

        <div className="feature-body">
          <span className="feature-icon layer-3">
            <i className="icon-ring" />
            <Icon name={item.icon} size={20} />
          </span>

          <div className="feature-text layer-2">
            <b>{item.title}</b>
            <small>{item.detail}</small>
          </div>

          <span className="feature-check layer-3">✓</span>
        </div>

        <span className="feature-shadow" aria-hidden="true" />
      </article>
    </Reveal>
  );
}

function FeatureDeck() {
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

      <div className="feature-deck">
        {ADVANTAGES.map((item, index) => (
          <FeatureCard key={item.id} item={item} index={index} />
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
    { id: "upload", label: "Upload Sample", icon: "upload" },
    { id: "rates", label: "Update Rates", icon: "rates" },
    { id: "orders", label: "View Orders", icon: "orders" },
    { id: "availability", label: "Set Availability", icon: "availability" },
  ];

  return (
    <section className="quick-actions" aria-label="Seller quick actions">
      {actions.map((action, index) => (
        <button
          type="button"
          key={action.id}
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
      <div className="rate-top layer-2">
        <span className="stone-mark">
          <i /><b /><em />
        </span>
        <small>{rate.updated}</small>
      </div>
      <h3 className="layer-3">{rate.name}</h3>
      <p>{rate.fullName}</p>
      <span className="starting-label">Starting at</span>
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
        <h2>Today&apos;s Market Rates</h2>
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
      if (!event.target.closest(".availability-control")) {
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

  const currentAvailability = availabilityData[availability];

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
            <SellerAdvantageCard onExplore={() => navigate("orders")} />
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
   STYLES
   ============================================================ */

const CSS_CORE = `
:root{color-scheme:light}
*{box-sizing:border-box}
html,body,#root{margin:0;width:100%;min-height:100%;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}

.seller-app{
  --ink:#0f172a;--muted:#6b7686;--line:#e6ebf3;
  --orange:#f97316;--amber:#f59e0b;--green:#16a36a;--blue:#2563eb;--purple:#7c3aed;
  --card:#ffffff;--glass:rgba(255,255,255,.72);
  --shadow-sm:0 2px 8px rgba(15,23,42,.05);
  --shadow-md:0 10px 30px rgba(15,23,42,.08);
  --shadow-lg:0 26px 60px rgba(15,23,42,.14);
  width:100%;height:100dvh;display:flex;align-items:center;justify-content:center;
  overflow:hidden;background:radial-gradient(1200px 600px at 50% -10%,#f4f7ff,#e9edf5)}
.seller-app button{font:inherit}

.seller-phone{position:relative;width:min(100%,430px);height:100dvh;overflow:hidden;
  background:linear-gradient(180deg,#fdfeff,#f4f7fc 60%,#eef2f9);color:var(--ink)}

/* ---------- ambient aurora ---------- */
.aurora{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.aurora i{position:absolute;display:block;border-radius:50%;filter:blur(48px);opacity:.5}
.aurora-one{width:280px;height:280px;top:-90px;left:-70px;
  background:radial-gradient(circle,rgba(249,115,22,.30),transparent 68%);
  animation:auroraA 18s ease-in-out infinite}
.aurora-two{width:320px;height:320px;top:34%;right:-120px;
  background:radial-gradient(circle,rgba(37,99,235,.24),transparent 68%);
  animation:auroraB 22s ease-in-out infinite}
.aurora-three{width:260px;height:260px;bottom:-80px;left:-60px;
  background:radial-gradient(circle,rgba(22,163,106,.22),transparent 68%);
  animation:auroraA 26s ease-in-out infinite reverse}

/* ---------- header ---------- */
.seller-header{position:absolute;z-index:40;top:0;left:0;right:0;height:90px;
  display:grid;grid-template-columns:40px minmax(0,1fr) 40px;align-items:start;gap:10px;
  padding:14px 15px 10px;border-bottom:1px solid rgba(217,224,234,.8);
  background:rgba(255,255,255,.78);backdrop-filter:blur(22px) saturate(150%);
  -webkit-backdrop-filter:blur(22px) saturate(150%);
  box-shadow:0 6px 22px rgba(15,23,42,.05);transition:box-shadow .3s,background .3s}
.seller-header.condensed{background:rgba(255,255,255,.93);box-shadow:0 10px 30px rgba(15,23,42,.10)}
.seller-header::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(249,115,22,.55),rgba(37,99,235,.5),transparent);
  opacity:.8}
.header-icon{position:relative;width:38px;height:38px;display:grid;place-items:center;
  border:1px solid #e2e8f1;border-radius:13px;background:#fff;color:#1f2937;cursor:pointer;
  box-shadow:var(--shadow-sm);transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s}
.header-icon:hover{transform:translateY(-2px) scale(1.04);box-shadow:var(--shadow-md)}
.header-icon:active{transform:scale(.94)}
.header-icon.notification b{position:absolute;top:-5px;right:-5px;min-width:17px;height:17px;
  display:grid;place-items:center;padding:0 4px;border-radius:999px;border:2px solid #fff;
  background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;font-size:9px;font-weight:800;
  box-shadow:0 3px 10px rgba(249,115,22,.45);animation:badgePop 2.6s ease-in-out infinite}
.seller-identity{min-width:0;padding-top:1px}
.seller-identity>span{display:block;color:#8b95a6;font-size:10px;letter-spacing:.02em}
.seller-identity>b{display:block;margin-top:2px;overflow:hidden;font-size:14px;
  text-overflow:ellipsis;white-space:nowrap;letter-spacing:-.01em}
.availability-control{position:relative;display:inline-block}
.availability-button{display:inline-flex;align-items:center;gap:5px;margin-top:7px;
  padding:4px 9px;border:0;border-radius:999px;font-size:8.5px;font-weight:850;cursor:pointer;
  transition:transform .2s,filter .2s}
.availability-button:hover{transform:translateY(-1px);filter:brightness(1.03)}
.availability-button i{width:6px;height:6px;border-radius:50%;background:currentColor;
  box-shadow:0 0 0 0 currentColor;animation:dotPing 2.2s ease-out infinite}
.availability-button.green{color:#117a4f;background:#e8f8f0}
.availability-button.amber{color:#9a5705;background:#fff5d9}
.availability-button.red{color:#b42318;background:#ffeded}
.availability-menu{position:absolute;z-index:70;top:36px;left:0;width:215px;padding:6px;
  border:1px solid #e6ecf5;border-radius:15px;background:rgba(255,255,255,.97);
  backdrop-filter:blur(16px);box-shadow:var(--shadow-lg);animation:menuIn .22s ease both}
.availability-menu button{width:100%;display:flex;align-items:center;gap:9px;padding:9px 10px;
  border:0;border-radius:11px;background:transparent;color:#1f2937;font-size:11.5px;
  font-weight:650;text-align:left;cursor:pointer;transition:background .18s,transform .18s}
.availability-menu button:hover{background:#f3f6fb;transform:translateX(2px)}
.availability-menu i{width:8px;height:8px;border-radius:50%;flex:0 0 auto}
.availability-menu i.green{background:var(--green)}
.availability-menu i.amber{background:var(--amber)}
.availability-menu i.red{background:#ef4444}
.availability-menu span{flex:1}
.availability-menu b{color:var(--green);font-size:12px}

/* ---------- scroll shell ---------- */
.seller-scroll{position:absolute;z-index:10;top:90px;bottom:66px;left:0;right:0;
  overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;scroll-behavior:smooth}
.seller-scroll::-webkit-scrollbar{width:0}
.seller-content{display:flex;flex-direction:column;gap:20px;padding:16px 15px 26px}

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
  opacity:var(--glare);transition:opacity .3s;
  background:radial-gradient(280px circle at var(--px) var(--py),rgba(255,255,255,.85),transparent 60%);
  mix-blend-mode:overlay}

/* ---------- hero ---------- */
.advantage-card{position:relative;overflow:hidden;min-height:340px;padding:20px;
  border:1px solid rgba(255,255,255,.7);border-radius:26px;
  background:linear-gradient(140deg,#fff8f2 0%,#ffffff 42%,#eff5ff 100%);
  box-shadow:var(--shadow-md),inset 0 1px 0 rgba(255,255,255,.9)}
.advantage-card:hover{box-shadow:var(--shadow-lg)}
.advantage-grid{position:absolute;inset:0;opacity:.5;
  background-image:linear-gradient(rgba(37,99,235,.07) 1px,transparent 1px),
    linear-gradient(90deg,rgba(37,99,235,.07) 1px,transparent 1px);
  background-size:26px 26px;
  -webkit-mask-image:radial-gradient(circle at 70% 45%,#000,transparent 76%);
  mask-image:radial-gradient(circle at 70% 45%,#000,transparent 76%)}
.advantage-mesh{position:absolute;inset:-30%;opacity:.55;pointer-events:none;
  background:conic-gradient(from 0deg at 72% 48%,rgba(249,115,22,.16),rgba(37,99,235,.14),
    rgba(22,163,106,.13),rgba(249,115,22,.16));
  filter:blur(42px);animation:meshSpin 26s linear infinite}
.advantage-orb{position:absolute;border-radius:50%;filter:blur(1px);pointer-events:none}
.advantage-orb-one{width:11px;height:11px;top:22%;left:8%;
  background:radial-gradient(circle,#fdba74,#f97316);opacity:.75;
  box-shadow:0 0 18px rgba(249,115,22,.55);animation:orbFloat 6s ease-in-out infinite}
.advantage-orb-two{width:8px;height:8px;bottom:24%;left:16%;
  background:radial-gradient(circle,#93c5fd,#2563eb);opacity:.7;
  box-shadow:0 0 16px rgba(37,99,235,.5);animation:orbFloat 8s ease-in-out infinite reverse}
.scan-line{position:absolute;left:0;right:0;height:70px;pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(255,255,255,.55),transparent);
  animation:scanMove 7s linear infinite}
.advantage-copy{position:relative;z-index:3;width:64%}
.advantage-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;
  border:1px solid rgba(249,115,22,.28);border-radius:999px;background:rgba(255,247,237,.9);
  color:#c2410c;font-size:8px;font-weight:900;letter-spacing:.11em}
.eyebrow-dot{width:5px;height:5px;border-radius:50%;background:#f97316;
  box-shadow:0 0 0 0 rgba(249,115,22,.6);animation:dotPing 2s ease-out infinite}
.advantage-copy h1{margin:12px 0 8px;font-size:27px;line-height:1.14;letter-spacing:-.035em;
  font-weight:850}
.grad-text{background:linear-gradient(100deg,#f97316,#ef4444 40%,#2563eb);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  background-size:200% 100%;animation:gradShift 6s ease-in-out infinite}
.advantage-copy p{margin:0 0 16px;max-width:230px;color:var(--muted);font-size:11.5px;
  line-height:1.55}
.hero-action{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:8px;
  padding:11px 17px;border:0;border-radius:14px;
  background:linear-gradient(120deg,#f97316,#ea580c 55%,#f59e0b);color:#fff;
  font-size:11.5px;font-weight:800;cursor:pointer;
  box-shadow:0 12px 26px rgba(249,115,22,.34);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s}
.hero-action::after{content:"";position:absolute;top:0;left:-140%;width:60%;height:100%;
  transform:skewX(-22deg);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);
  animation:shimmer 3.4s ease-in-out infinite}
.hero-action:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 18px 34px rgba(249,115,22,.42)}
.hero-action:active{transform:scale(.97)}
.hero-action svg{transition:transform .25s}
.hero-action:hover svg{transform:translateX(3px)}

/* ---------- hero 3D scene ---------- */
.scene{position:absolute;z-index:2;right:-8px;bottom:14px;width:190px;height:210px;
  transform-style:preserve-3d;perspective:640px;pointer-events:none}
.scene-platform{position:absolute;left:50%;border-radius:50%;transform:translateX(-50%) rotateX(72deg)}
.platform-back{bottom:36px;width:150px;height:150px;
  background:radial-gradient(circle,rgba(37,99,235,.14),transparent 66%)}
.platform-front{bottom:26px;width:118px;height:118px;
  background:radial-gradient(circle,rgba(249,115,22,.16),transparent 66%)}
.digital-ring{position:absolute;left:50%;border:1.5px dashed rgba(37,99,235,.4);border-radius:50%;
  transform:translateX(-50%) rotateX(70deg)}
.ring-one{bottom:34px;width:140px;height:140px;animation:ringPulse 4.6s ease-in-out infinite}
.ring-two{bottom:44px;width:104px;height:104px;border-color:rgba(249,115,22,.4);
  animation:ringPulse 4.6s ease-in-out infinite .9s}
.warehouse{position:absolute;top:16px;left:8px;width:78px;transform:rotateY(-14deg)}
.warehouse-roof{height:16px;border-radius:6px 6px 2px 2px;
  background:linear-gradient(160deg,#94a3b8,#64748b);box-shadow:0 3px 8px rgba(15,23,42,.16)}
.warehouse-wall{position:relative;height:52px;display:flex;align-items:center;
  justify-content:space-around;padding:0 6px;border-radius:0 0 5px 5px;
  background:linear-gradient(170deg,#f8fafc,#e2e8f0)}
.warehouse-wall i{width:12px;height:12px;border-radius:2px;
  background:linear-gradient(140deg,#bfdbfe,#60a5fa);box-shadow:0 0 8px rgba(96,165,250,.55);
  animation:barGlow 3.2s ease-in-out infinite}
.warehouse-wall i:nth-child(2){animation-delay:.5s}
.warehouse-wall i:nth-child(3){animation-delay:1s}
.warehouse-door{width:26px;height:18px;margin:-2px auto 0;border-radius:3px 3px 0 0;
  background:linear-gradient(180deg,#cbd5e1,#94a3b8)}
.truck-3d{position:absolute;right:6px;bottom:52px;width:112px;height:52px;
  animation:truckHover 4.2s ease-in-out infinite}
.truck-box{position:absolute;left:0;bottom:9px;width:66px;height:36px;border-radius:5px;
  display:flex;align-items:center;justify-content:space-evenly;
  background:linear-gradient(150deg,#fed7aa,#fb923c);
  box-shadow:0 8px 18px rgba(249,115,22,.3),inset 0 1px 0 rgba(255,255,255,.6)}
.truck-box i{width:8px;height:20px;border-radius:2px;background:rgba(255,255,255,.5)}
.truck-cabin{position:absolute;right:8px;bottom:9px;width:36px;height:27px;
  border-radius:5px 7px 3px 3px;background:linear-gradient(150deg,#60a5fa,#2563eb);
  box-shadow:0 8px 16px rgba(37,99,235,.32)}
.truck-cabin span{position:absolute;top:5px;left:6px;width:20px;height:11px;border-radius:3px;
  background:linear-gradient(160deg,#e0f2fe,#bae6fd)}
.truck-bumper{position:absolute;right:4px;bottom:7px;width:8px;height:6px;border-radius:2px;
  background:#475569}
.wheel{position:absolute;bottom:0;width:17px;height:17px;border-radius:50%;
  display:grid;place-items:center;background:#1f2937;
  box-shadow:0 3px 7px rgba(15,23,42,.3);animation:wheelSpin 2.4s linear infinite}
.wheel i{width:7px;height:7px;border-radius:50%;background:#cbd5e1}
.wheel-one{left:12px}
.wheel-two{right:16px}
.growth-hologram{position:absolute;left:14px;bottom:20px;height:48px;display:flex;
  align-items:flex-end;gap:5px;padding:6px 9px;border:1px solid rgba(37,99,235,.2);
  border-radius:9px;background:rgba(255,255,255,.6);backdrop-filter:blur(6px);
  animation:hologramFloat 5.2s ease-in-out infinite}
.growth-hologram .bar{width:6px;border-radius:2px;
  background:linear-gradient(180deg,#34d399,#059669);animation:barGlow 2.6s ease-in-out infinite}
.bar-one{height:12px}
.bar-two{height:20px;animation-delay:.3s}
.bar-three{height:16px;animation-delay:.6s}
.bar-four{height:26px;animation-delay:.9s}
.growth-line{position:absolute;top:-8px;right:-6px;color:#059669;font-size:14px;font-weight:900}
.floating-cube{position:absolute;border-radius:4px;
  background:linear-gradient(140deg,rgba(255,255,255,.9),rgba(226,232,240,.7));
  border:1px solid rgba(148,163,184,.45);box-shadow:0 6px 14px rgba(15,23,42,.1)}
.cube-one{width:16px;height:16px;top:6px;right:26px;animation:cubeFloat 6s ease-in-out infinite}
.cube-two{width:11px;height:11px;top:64px;right:2px;animation:cubeFloat 7.5s ease-in-out infinite .8s}
.cube-three{width:13px;height:13px;top:104px;left:0;animation:cubeFloat 8.4s ease-in-out infinite 1.4s}
`;

const CSS_SECTIONS = `
/* ---------- section shell ---------- */
.section-block{display:flex;flex-direction:column;gap:12px}
.section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.section-heading h2{margin:0;font-size:15.5px;font-weight:800;letter-spacing:-.025em}
.section-kicker{display:block;margin-bottom:3px;color:#98a2b3;font-size:8px;font-weight:900;
  letter-spacing:.13em}
.section-heading>button{padding:5px 11px;border:1px solid #e3e9f2;border-radius:999px;
  background:#fff;color:#3b4658;font-size:10px;font-weight:750;cursor:pointer;
  box-shadow:var(--shadow-sm);transition:transform .2s,box-shadow .2s,color .2s}
.section-heading>button:hover{transform:translateY(-1px);color:#f97316;box-shadow:var(--shadow-md)}
.chip-3d{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;
  border:1px solid rgba(124,58,237,.25);background:rgba(245,243,255,.9);color:#6d28d9;
  font-size:9px;font-weight:900;letter-spacing:.06em}
.live-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;
  background:rgba(232,248,240,.95);color:#117a4f;font-size:9px;font-weight:850}
.live-pill i{width:6px;height:6px;border-radius:50%;background:#16a36a;
  animation:livePulse 1.9s ease-in-out infinite}

/* ---------- FEATURE DECK (3D motion cards) ---------- */
.feature-deck{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.feature-deck>.reveal,.performance-grid>.reveal{height:100%}
.feature-card{position:relative;overflow:hidden;height:100%;min-height:126px;padding:14px 13px;
  border:1px solid rgba(255,255,255,.85);border-radius:20px;
  background:linear-gradient(155deg,rgba(255,255,255,.96),rgba(248,250,254,.9));
  box-shadow:var(--shadow-md),inset 0 1px 0 rgba(255,255,255,.95)}
.feature-card:hover{box-shadow:var(--shadow-lg)}
.feature-card::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;
  background:linear-gradient(140deg,var(--tone-a),transparent 42%,transparent 62%,var(--tone-b));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;opacity:.85;pointer-events:none}
.feature-card.green{--tone-a:rgba(22,163,106,.65);--tone-b:rgba(22,163,106,.18);--tone:#16a36a;
  --tone-soft:rgba(22,163,106,.12)}
.feature-card.blue{--tone-a:rgba(37,99,235,.65);--tone-b:rgba(37,99,235,.18);--tone:#2563eb;
  --tone-soft:rgba(37,99,235,.12)}
.feature-card.orange{--tone-a:rgba(249,115,22,.65);--tone-b:rgba(249,115,22,.18);--tone:#f97316;
  --tone-soft:rgba(249,115,22,.12)}
.feature-card.purple{--tone-a:rgba(124,58,237,.65);--tone-b:rgba(124,58,237,.18);--tone:#7c3aed;
  --tone-soft:rgba(124,58,237,.12)}
.feature-beam{position:absolute;top:-60%;left:-40%;width:60%;height:220%;pointer-events:none;
  transform:rotate(22deg);
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);
  animation:beamSweep 5.5s ease-in-out infinite;animation-delay:calc(var(--i) * .7s)}
.feature-corner{position:absolute;width:13px;height:13px;pointer-events:none;opacity:.55;
  border-color:var(--tone)}
.feature-corner.tl{top:9px;left:9px;border-top:1.5px solid;border-left:1.5px solid;
  border-radius:4px 0 0 0}
.feature-corner.br{bottom:9px;right:9px;border-bottom:1.5px solid;border-right:1.5px solid;
  border-radius:0 0 4px 0}
.feature-body{position:relative;z-index:2;display:flex;flex-direction:column;gap:9px;height:100%;
  transform-style:preserve-3d;
  animation:cardBreathe 7s ease-in-out infinite;animation-delay:calc(var(--i) * .55s)}
.feature-icon{position:relative;width:38px;height:38px;display:grid;place-items:center;
  border-radius:13px;color:var(--tone);background:var(--tone-soft);
  box-shadow:0 8px 18px var(--tone-soft),inset 0 1px 0 rgba(255,255,255,.8)}
.icon-ring{position:absolute;inset:-5px;border:1.5px dashed var(--tone);border-radius:16px;
  opacity:.35;animation:ringSpin 9s linear infinite}
.feature-text b{display:block;font-size:12px;font-weight:800;letter-spacing:-.015em;
  line-height:1.3}
.feature-text small{display:block;margin-top:4px;color:var(--muted);font-size:9.5px;
  line-height:1.45}
.feature-check{position:absolute;top:0;right:0;width:19px;height:19px;display:grid;
  place-items:center;border-radius:50%;background:var(--tone);color:#fff;font-size:10px;
  font-weight:900;box-shadow:0 5px 12px var(--tone-soft)}
.feature-shadow{position:absolute;left:12%;right:12%;bottom:-8px;height:14px;border-radius:50%;
  background:radial-gradient(ellipse,rgba(15,23,42,.16),transparent 70%);filter:blur(5px);
  opacity:0;transition:opacity .35s}
.feature-card:hover .feature-shadow{opacity:1}

/* ---------- quick actions ---------- */
.quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
.quick-actions button{position:relative;overflow:hidden;display:flex;flex-direction:column;
  align-items:center;gap:7px;padding:13px 5px;border:1px solid rgba(255,255,255,.9);
  border-radius:17px;background:linear-gradient(160deg,#fff,#f7f9fd);cursor:pointer;
  box-shadow:var(--shadow-sm);
  transition:transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .28s}
.quick-actions button::after{content:"";position:absolute;inset:auto 0 0 0;height:2px;
  background:linear-gradient(90deg,#f97316,#2563eb);transform:scaleX(0);transform-origin:left;
  transition:transform .35s}
.quick-actions button:hover{transform:translateY(-4px);box-shadow:var(--shadow-md)}
.quick-actions button:hover::after{transform:scaleX(1)}
.quick-actions button:active{transform:translateY(-1px) scale(.97)}
.quick-actions span{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;
  color:#f97316;background:linear-gradient(150deg,rgba(255,247,237,.95),rgba(255,237,213,.7));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9);transition:transform .3s}
.quick-actions button:hover span{transform:rotateY(180deg)}
.quick-actions b{color:#435063;font-size:8px;font-weight:800;text-align:center;
  line-height:1.25}

/* ---------- market rates ---------- */
.rate-scroll{display:flex;gap:11px;overflow-x:auto;padding:6px 2px 10px;margin:0 -15px;
  padding-left:15px;padding-right:15px;scroll-snap-type:x mandatory}
.rate-scroll::-webkit-scrollbar{height:0}
.rate-card{position:relative;overflow:hidden;flex:0 0 150px;padding:14px 13px 13px;
  border:1px solid rgba(255,255,255,.9);border-radius:19px;scroll-snap-align:start;
  background:linear-gradient(160deg,#fff,#f8fafd);box-shadow:var(--shadow-md);cursor:default}
.rate-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;
  background:var(--accent);opacity:.85}
.rate-card.green{--accent:linear-gradient(90deg,#16a36a,#4ade80);--dot:#16a36a}
.rate-card.orange{--accent:linear-gradient(90deg,#f97316,#fdba74);--dot:#f97316}
.rate-card.blue{--accent:linear-gradient(90deg,#2563eb,#93c5fd);--dot:#2563eb}
.rate-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.stone-mark{position:relative;width:26px;height:22px;display:block}
.stone-mark i,.stone-mark b,.stone-mark em{position:absolute;border-radius:3px;
  background:var(--dot);opacity:.9}
.stone-mark i{width:11px;height:11px;left:0;bottom:0;opacity:.55}
.stone-mark b{width:9px;height:9px;left:9px;bottom:6px;opacity:.75}
.stone-mark em{width:7px;height:7px;left:17px;bottom:0;opacity:.95}
.rate-top small{color:#a3adbd;font-size:7.5px;font-weight:650}
.rate-card h3{margin:0;font-size:16px;font-weight:850;letter-spacing:-.03em}
.rate-card p{margin:2px 0 9px;color:var(--muted);font-size:9px}
.starting-label{display:block;color:#a3adbd;font-size:7.5px;font-weight:800;letter-spacing:.08em}
.rate-card strong{display:block;margin-top:2px;font-size:19px;font-weight:850;letter-spacing:-.035em}
.rate-card strong small{margin-left:2px;color:var(--muted);font-size:9px;font-weight:650}
.spark{width:100%;height:26px;margin:7px 0 2px;display:block}
.spark-line{fill:none;stroke-width:2;vector-effect:non-scaling-stroke;stroke-linecap:round}
.spark.up .spark-line{stroke:#16a36a}
.spark.down .spark-line{stroke:#f97316}
.spark.stable .spark-line{stroke:#2563eb}
.spark-fill{stroke:none;opacity:.14}
.spark.up .spark-fill{fill:#16a36a}
.spark.down .spark-fill{fill:#f97316}
.spark.stable .spark-fill{fill:#2563eb}
.movement{margin-top:5px;padding:4px 8px;border-radius:999px;font-size:8.5px;font-weight:850;
  display:inline-block}
.movement.up{color:#117a4f;background:#e8f8f0}
.movement.down{color:#c2410c;background:#fff1e6}
.movement.stable{color:#1d4ed8;background:#eaf1ff}

/* ---------- performance ---------- */
.performance-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.performance-card{position:relative;overflow:hidden;height:100%;padding:14px 13px;
  border:1px solid rgba(255,255,255,.9);border-radius:19px;
  background:linear-gradient(155deg,#fff,#f7f9fd);box-shadow:var(--shadow-md);
  transform-style:preserve-3d}
.metric-wave{position:absolute;left:0;right:0;bottom:0;height:34px;pointer-events:none;
  background:radial-gradient(120% 100% at 50% 130%,rgba(37,99,235,.14),transparent 70%)}
.metric-icon{width:33px;height:33px;display:grid;place-items:center;border-radius:11px;
  color:#16a36a;background:rgba(232,248,240,.9);
  box-shadow:0 6px 14px rgba(22,163,106,.16),inset 0 1px 0 rgba(255,255,255,.85)}
.metric-icon.negative{color:#c2410c;background:rgba(255,241,230,.95);
  box-shadow:0 6px 14px rgba(249,115,22,.16),inset 0 1px 0 rgba(255,255,255,.85)}
.performance-card strong{display:block;margin-top:11px;font-size:22px;font-weight:850;
  letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.performance-card>span{display:block;margin-top:1px;color:var(--muted);font-size:10px;
  font-weight:650}
.performance-card small{display:block;margin-top:7px;font-size:8.5px;font-weight:800}
.performance-card small.up{color:#117a4f}
.performance-card small.down{color:#c2410c}

/* ---------- loading today ---------- */
.loading-stack{display:flex;flex-direction:column;gap:10px}
.loading-card{width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;
  align-items:center;gap:11px;padding:13px 12px;border:1px solid rgba(255,255,255,.9);
  border-radius:18px;background:linear-gradient(160deg,#fff,#f8fafd);color:var(--ink);
  text-align:left;cursor:pointer;box-shadow:var(--shadow-sm);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s}
.loading-card:hover{transform:translateY(-3px) scale(1.008);box-shadow:var(--shadow-md)}
.loading-card:active{transform:scale(.99)}
.loading-card>svg{color:#b6bfcd;flex:0 0 auto;transition:transform .25s,color .25s}
.loading-card:hover>svg{transform:translateX(3px);color:#f97316}
.loading-icon{position:relative;width:42px;height:42px;display:grid;place-items:center;
  border-radius:14px}
.loading-icon.amber{color:#c2410c;background:rgba(255,244,229,.95)}
.loading-icon.blue{color:#1d4ed8;background:rgba(234,241,255,.95)}
.loading-icon i{position:absolute;top:-2px;right:-2px;width:9px;height:9px;border-radius:50%;
  border:2px solid #fff;background:currentColor;animation:livePulse 2.1s ease-in-out infinite}
.loading-copy{min-width:0}
.loading-copy small{display:block;color:#a3adbd;font-size:8px;font-weight:750;
  letter-spacing:.05em}
.loading-copy b{display:block;margin-top:2px;overflow:hidden;font-size:11.5px;font-weight:800;
  text-overflow:ellipsis;white-space:nowrap}
.loading-copy em{display:block;margin-top:2px;color:var(--muted);font-size:9px;font-style:normal}
.loading-time{text-align:right}
.loading-time b{display:block;font-size:11px;font-weight:850}
.loading-time small{display:inline-block;margin-top:3px;padding:2px 7px;border-radius:999px;
  font-size:7.5px;font-weight:850;white-space:nowrap}
.loading-time small.amber{color:#c2410c;background:#fff1e6}
.loading-time small.blue{color:#1d4ed8;background:#eaf1ff}

/* ---------- order overview ---------- */
.order-overview{position:relative;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;
  gap:14px;padding:18px 16px;border:1px solid rgba(255,255,255,.75);border-radius:24px;
  background:linear-gradient(140deg,#ffffff,#f2f6fd 55%,#eef4ff);
  box-shadow:var(--shadow-md),inset 0 1px 0 rgba(255,255,255,.95)}
.overview-mesh{position:absolute;inset:-40%;pointer-events:none;opacity:.5;filter:blur(46px);
  background:conic-gradient(from 90deg at 30% 60%,rgba(37,99,235,.16),rgba(124,58,237,.14),
    rgba(249,115,22,.13),rgba(37,99,235,.16));animation:meshSpin 30s linear infinite reverse}
.overview-copy{position:relative;z-index:2}
.overview-copy h2{margin:0 0 5px;font-size:16px;font-weight:850;letter-spacing:-.03em}
.overview-copy p{margin:0 0 13px;color:var(--muted);font-size:10px;line-height:1.5}
.overview-copy button{display:inline-flex;align-items:center;gap:6px;padding:9px 13px;border:0;
  border-radius:12px;background:linear-gradient(120deg,#1f2937,#0f172a);color:#fff;
  font-size:10px;font-weight:800;cursor:pointer;box-shadow:0 10px 22px rgba(15,23,42,.24);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s}
.overview-copy button:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(15,23,42,.3)}
.overview-copy button:active{transform:scale(.97)}
.overview-grid{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:9px}
.overview-metric{padding:11px 10px;border:1px solid rgba(255,255,255,.9);border-radius:15px;
  background:rgba(255,255,255,.88);backdrop-filter:blur(8px);box-shadow:var(--shadow-sm);
  transition:transform .25s,box-shadow .25s}
.overview-metric:hover{transform:translateY(-3px) rotateX(6deg);box-shadow:var(--shadow-md)}
.overview-metric strong{display:block;font-size:19px;font-weight:850;letter-spacing:-.04em}
.overview-metric span{display:block;margin-top:1px;color:var(--muted);font-size:8.5px;
  font-weight:700}
.overview-metric.blue strong{color:#2563eb}
.overview-metric.green strong{color:#16a36a}
.overview-metric.amber strong{color:#d97706}
.overview-metric.purple strong{color:#7c3aed}

/* ---------- market pulse ---------- */
.pulse-grid{display:flex;flex-direction:column;gap:10px}
.pulse-card{position:relative;overflow:hidden;display:flex;align-items:center;gap:11px;
  padding:13px 12px;border:1px solid rgba(255,255,255,.9);border-radius:17px;
  background:linear-gradient(160deg,#fff,#f8fafd);box-shadow:var(--shadow-sm);
  transform-style:preserve-3d}
.pulse-card::before{content:"";position:absolute;top:0;bottom:0;left:0;width:3px;
  background:var(--pulse)}
.pulse-card.green{--pulse:#16a36a;--pulse-soft:rgba(232,248,240,.95)}
.pulse-card.blue{--pulse:#2563eb;--pulse-soft:rgba(234,241,255,.95)}
.pulse-card.amber{--pulse:#d97706;--pulse-soft:rgba(255,245,217,.95)}
.pulse-card>span{width:35px;height:35px;display:grid;place-items:center;border-radius:12px;
  flex:0 0 auto;color:var(--pulse);background:var(--pulse-soft)}
.pulse-card b{display:block;font-size:11.5px;font-weight:800;letter-spacing:-.015em}
.pulse-card small{display:block;margin-top:2px;color:var(--muted);font-size:9.5px}
.last-section{padding-bottom:4px}

/* ---------- bottom nav ---------- */
.bottom-nav{position:absolute;z-index:40;bottom:0;left:0;right:0;height:66px;
  display:grid;grid-template-columns:repeat(5,1fr);align-items:center;padding:0 6px 4px;
  border-top:1px solid rgba(217,224,234,.8);background:rgba(255,255,255,.9);
  backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%);
  box-shadow:0 -8px 26px rgba(15,23,42,.06)}
.bottom-nav button{position:relative;display:flex;flex-direction:column;align-items:center;
  gap:3px;padding:6px 2px;border:0;background:transparent;color:#9aa4b4;cursor:pointer;
  transition:color .22s}
.bottom-nav button span{width:34px;height:30px;display:grid;place-items:center;border-radius:11px;
  transition:transform .3s cubic-bezier(.34,1.56,.64,1),background .3s}
.bottom-nav button small{font-size:8px;font-weight:750}
.bottom-nav button:hover{color:#5b6676}
.bottom-nav button.active{color:#f97316}
.bottom-nav button.active span{transform:translateY(-3px) scale(1.06);
  background:linear-gradient(150deg,rgba(255,247,237,.95),rgba(255,237,213,.75));
  box-shadow:0 8px 18px rgba(249,115,22,.22)}
.bottom-nav button.active::after{content:"";position:absolute;top:0;width:18px;height:2.5px;
  border-radius:999px;background:linear-gradient(90deg,#f97316,#f59e0b)}
`;

const CSS_MOTION = `
/* ---------- keyframes ---------- */
@keyframes auroraA{0%,100%{transform:translate3d(0,0,0) scale(1)}
  50%{transform:translate3d(18px,26px,0) scale(1.12)}}
@keyframes auroraB{0%,100%{transform:translate3d(0,0,0) scale(1)}
  50%{transform:translate3d(-24px,-18px,0) scale(1.08)}}
@keyframes meshSpin{to{transform:rotate(360deg)}}
@keyframes scanMove{0%{top:-70px;opacity:0}12%{opacity:.9}88%{opacity:.9}100%{top:100%;opacity:0}}
@keyframes gradShift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes shimmer{0%{left:-140%}55%,100%{left:140%}}
@keyframes beamSweep{0%{transform:translateX(0) rotate(22deg);opacity:0}
  18%{opacity:.85}50%{transform:translateX(320%) rotate(22deg);opacity:0}
  100%{transform:translateX(320%) rotate(22deg);opacity:0}}
@keyframes cardBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ringSpin{to{transform:rotate(360deg)}}
@keyframes badgePop{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
@keyframes dotPing{0%{box-shadow:0 0 0 0 currentColor;opacity:.9}
  70%{box-shadow:0 0 0 6px transparent;opacity:1}100%{box-shadow:0 0 0 0 transparent;opacity:.9}}
@keyframes menuIn{from{opacity:0;transform:translateY(-6px) scale(.97)}
  to{opacity:1;transform:none}}
@keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes ringPulse{0%,100%{opacity:.35;transform:translateX(-50%) rotateX(70deg) scale(.95)}
  50%{opacity:.75;transform:translateX(-50%) rotateX(70deg) scale(1.06)}}
@keyframes truckHover{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes wheelSpin{to{transform:rotate(360deg)}}
@keyframes barGlow{0%,100%{opacity:.65;filter:brightness(.9)}
  50%{opacity:1;filter:brightness(1.35)}}
@keyframes hologramFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes cubeFloat{0%,100%{transform:translateY(0) rotate(30deg)}
  50%{transform:translateY(-9px) rotate(50deg)}}
@keyframes livePulse{0%,100%{opacity:.6}
  50%{opacity:1;box-shadow:0 0 0 6px rgba(34,197,94,.08)}}

/* ---------- responsive ---------- */
@media(min-width:700px){
  .seller-phone{height:min(900px,calc(100dvh - 24px));border:1px solid #dfe5ee;
    border-radius:30px;box-shadow:0 34px 90px rgba(15,23,42,.26)}
}
@media(max-width:370px){
  .advantage-card{min-height:315px;padding:17px}
  .advantage-copy{width:62%}
  .advantage-copy h1{font-size:23px}
  .feature-deck{grid-template-columns:1fr}
  .feature-card{min-height:0}
  .scene{right:-15px}
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
