import React, { useEffect, useMemo, useState } from "react";

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
  },
];

const PERFORMANCE = [
  {
    id: "orders",
    label: "Total Orders",
    value: "18",
    change: 12,
    icon: "orders",
  },
  {
    id: "tons",
    label: "Tons Sold",
    value: "426 t",
    change: 8,
    icon: "weight",
  },
  {
    id: "active",
    label: "Active Orders",
    value: "8",
    change: -5,
    icon: "activity",
  },
  {
    id: "completed",
    label: "Completed",
    value: "5",
    change: 10,
    icon: "check",
  },
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
  {
    title: "20mm rates increased",
    detail: "Starting rates moved up today",
    icon: "trend",
    tone: "green",
  },
  {
    title: "40mm rates are stable",
    detail: "No major movement since morning",
    icon: "stable",
    tone: "blue",
  },
  {
    title: "Transport availability limited",
    detail: "Confirm vehicles early for today",
    icon: "truck",
    tone: "amber",
  },
];

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
  };

  return <svg {...common}>{paths[name] || paths.home}</svg>;
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function SellerAdvantageCard({ onExplore }) {
  const benefits = [
    "No hidden margins",
    "Direct buyer orders",
    "Live market updates",
    "Direct transport network",
  ];

  return (
    <section className="advantage-card">
      <div className="advantage-grid" />
      <div className="advantage-orb advantage-orb-one" />
      <div className="advantage-orb advantage-orb-two" />

      <div className="advantage-copy">
        <span className="advantage-eyebrow">STONERATE ADVANTAGE</span>
        <h1>Sell direct.<br />Grow stronger.</h1>
        <p>Transparent business tools built for modern material sellers.</p>

        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <div className="benefit-chip" key={benefit}>
              <span>✓</span>
              <b>{benefit}</b>
            </div>
          ))}
        </div>

        <button type="button" className="hero-action" onClick={onExplore}>
          Explore Opportunities
          <Icon name="arrow" size={16} />
        </button>
      </div>

      <div className="scene" aria-hidden="true">
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

function QuickActions({ onNavigate }) {
  const actions = [
    { id: "upload", label: "Upload Sample", icon: "upload" },
    { id: "rates", label: "Update Rates", icon: "rates" },
    { id: "orders", label: "View Orders", icon: "orders" },
    { id: "availability", label: "Set Availability", icon: "availability" },
  ];

  return (
    <section className="quick-actions" aria-label="Seller quick actions">
      {actions.map((action) => (
        <button
          type="button"
          key={action.id}
          onClick={() => onNavigate?.(action.id)}
        >
          <span><Icon name={action.icon} size={19} /></span>
          <b>{action.label}</b>
        </button>
      ))}
    </section>
  );
}

function MarketRates({ onViewAll }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>Today&apos;s Market Rates</h2>
        <button type="button" onClick={onViewAll}>View all</button>
      </div>

      <div className="rate-scroll">
        {MARKET_RATES.map((rate) => (
          <article className={`rate-card ${rate.tint}`} key={rate.id}>
            <div className="rate-top">
              <span className="stone-mark"><i /><b /><em /></span>
              <small>{rate.updated}</small>
            </div>
            <h3>{rate.name}</h3>
            <p>{rate.fullName}</p>
            <span className="starting-label">Starting at</span>
            <strong>{formatMoney(rate.rate)}<small>/ton</small></strong>
            <div className={`movement ${rate.direction}`}>
              {rate.direction === "up"
                ? `↑ ${formatMoney(rate.movement)} today`
                : rate.direction === "down"
                  ? `↓ ${formatMoney(rate.movement)} today`
                  : "• Stable"}
            </div>
          </article>
        ))}
      </div>
    </section>
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
        <span className="live-pill"><i /> Live</span>
      </div>

      <div className="performance-grid">
        {PERFORMANCE.map((metric) => (
          <article className="performance-card" key={metric.id}>
            <div className={`metric-icon ${metric.change < 0 ? "negative" : ""}`}>
              <Icon name={metric.icon} size={17} />
            </div>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
            <small className={metric.change < 0 ? "down" : "up"}>
              {metric.change < 0 ? "↓" : "↑"} {Math.abs(metric.change)}% vs last month
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoadingToday({ onViewAll, onOpenOrder }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="section-kicker">TODAY&apos;S OPERATIONS</span>
          <h2>Loading Today</h2>
        </div>
        <button type="button" onClick={onViewAll}>View all</button>
      </div>

      <div className="loading-stack">
        {LOADING_ORDERS.map((order) => (
          <button
            type="button"
            className="loading-card"
            key={order.deliveryId}
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
                {order.tons} tons · {order.vehicles} {order.vehicles === 1 ? "vehicle" : "vehicles"}
              </em>
            </span>
            <span className="loading-time">
              <b>{order.time}</b>
              <small className={order.tone}>{order.status}</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
        ))}
      </div>
    </section>
  );
}

function OrderOverview({ onViewOrders }) {
  const entries = [
    { label: "New Orders", value: 3, tone: "blue" },
    { label: "Confirmed", value: 5, tone: "green" },
    { label: "Loading", value: 2, tone: "amber" },
    { label: "In Transit", value: 4, tone: "purple" },
  ];

  return (
    <section className="order-overview">
      <div className="overview-copy">
        <span className="section-kicker">ORDER OVERVIEW</span>
        <h2>Business in motion</h2>
        <p>Track every active order from confirmation to delivery.</p>
        <button type="button" onClick={onViewOrders}>
          View All Orders <Icon name="arrow" size={15} />
        </button>
      </div>
      <div className="overview-grid">
        {entries.map((entry) => (
          <div className={`overview-metric ${entry.tone}`} key={entry.label}>
            <strong>{entry.value}</strong>
            <span>{entry.label}</span>
          </div>
        ))}
      </div>
    </section>
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
        {MARKET_PULSE.map((item) => (
          <article className={`pulse-card ${item.tone}`} key={item.title}>
            <span><Icon name={item.icon} size={18} /></span>
            <div>
              <b>{item.title}</b>
              <small>{item.detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

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
          <span><Icon name={tab.icon} size={19} /></span>
          <small>{tab.label}</small>
        </button>
      ))}
    </nav>
  );
}

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

  useEffect(() => {
    const close = (event) => {
      if (!event.target.closest(".availability-control")) {
        setShowAvailability(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const availabilityData = useMemo(() => ({
    accepting: { label: "Accepting Orders", tone: "green" },
    limited: { label: "Limited Availability", tone: "amber" },
    unavailable: { label: "Temporarily Unavailable", tone: "red" },
  }), []);

  const currentAvailability = availabilityData[availability];

  const navigate = (target) => {
    if (["samples", "orders", "home", "mySamples", "profile"].includes(target)) {
      setActiveTab(target);
    }
    onNavigate?.(target);
  };

  return (
    <div className="seller-app">
      <style>{CSS}</style>
      <main className="seller-phone">
        <header className="seller-header">
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

        <div className="seller-scroll">
          <div className="seller-content">
            <SellerAdvantageCard onExplore={() => navigate("orders")} />
            <QuickActions onNavigate={navigate} />
            <MarketRates onViewAll={() => navigate("samples")} />
            <PerformanceDashboard />
            <LoadingToday
              onViewAll={() => navigate("orders")}
              onOpenOrder={onOpenOrder}
            />
            <OrderOverview onViewOrders={() => navigate("orders")} />
            <MarketPulse />
          </div>
        </div>

        <BottomNavigation activeTab={activeTab} onTabChange={navigate} />
      </main>
    </div>
  );
}

const CSS = `
:root{color-scheme:light}*{box-sizing:border-box}html,body,#root{margin:0;width:100%;min-height:100%;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}.seller-app{--ink:#111827;--muted:#687386;--line:#e7ebf1;--orange:#f97316;--amber:#f59e0b;--green:#16a36a;--blue:#2563eb;width:100%;height:100dvh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#eef1f6}.seller-app button{font:inherit}.seller-phone{position:relative;width:min(100%,430px);height:100dvh;overflow:hidden;background:linear-gradient(180deg,#fbfcff,#f3f6fa 72%,#eef2f7);color:var(--ink)}.seller-header{position:absolute;z-index:40;top:0;left:0;right:0;height:90px;display:grid;grid-template-columns:40px minmax(0,1fr) 40px;align-items:start;gap:10px;padding:14px 15px 10px;border-bottom:1px solid rgba(217,224,234,.85);background:rgba(255,255,255,.92);backdrop-filter:blur(20px);box-shadow:0 7px 24px rgba(15,23,42,.055)}.header-icon{width:38px;height:38px;display:grid;place-items:center;border:1px solid #e0e6ee;border-radius:12px;background:#fff;color:#202938;cursor:pointer}.seller-identity{min-width:0;padding-top:1px}.seller-identity>span{display:block;color:#8791a2;font-size:10px}.seller-identity>b{display:block;margin-top:2px;overflow:hidden;font-size:14px;text-overflow:ellipsis;white-space:nowrap}.availability-control{position:relative;display:inline-block}.availability-button{display:inline-flex;align-items:center;gap:5px;margin-top:7px;padding:4px 8px;border:0;border-radius:999px;font-size:8px;font-weight:850;cursor:pointer}.availability-button i{width:6px;height:6px;border-radius:50%;background:currentColor}.availability-button.green{color:#117a4f;background:#e8f8f0}.availability-button.amber{color:#9a5705;background:#fff5d9}.availability-button.red{color:#b42318;background:#ffeded}.availability-menu{position:absolute;z-index:70;top:36px;left:0;width:215px;padding:6px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;box-shadow:0 18px 45px rgba(15,23,42,.16)}.availability-menu button{width:100%;display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:8px;padding:9px;border:0;border-radius:10px;background:transparent;text-align:left;color:#273244;font-size:10px;cursor:pointer}.availability-menu button:hover{background:#f6f8fb}.availability-menu i{width:7px;height:7px;border-radius:50%}.availability-menu i.green{background:#16a36a}.availability-menu i.amber{background:#f59e0b}.availability-menu i.red{background:#dc2626}.availability-menu b{color:#16a36a}.notification{position:relative}.notification>b{position:absolute;right:-3px;top:-4px;min-width:16px;height:16px;padding:0 4px;display:grid;place-items:center;border:2px solid #fff;border-radius:999px;background:#ef4444;color:#fff;font-size:7px}.seller-scroll{position:absolute;top:90px;bottom:72px;left:0;right:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:none}.seller-scroll::-webkit-scrollbar,.rate-scroll::-webkit-scrollbar{display:none}.seller-content{padding:13px 13px 24px}.advantage-card{position:relative;min-height:300px;overflow:hidden;padding:20px;border:1px solid rgba(186,199,222,.65);border-radius:25px;background:radial-gradient(circle at 78% 20%,rgba(96,165,250,.28),transparent 30%),radial-gradient(circle at 85% 78%,rgba(251,146,60,.23),transparent 34%),linear-gradient(145deg,#fff,#eef4ff 58%,#fff7ed);box-shadow:0 18px 42px rgba(30,64,175,.12);isolation:isolate}.advantage-grid{position:absolute;inset:0;z-index:-3;opacity:.5;background-image:linear-gradient(rgba(64,94,160,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(64,94,160,.055) 1px,transparent 1px);background-size:24px 24px;mask-image:linear-gradient(90deg,#000 35%,transparent)}.advantage-orb{position:absolute;border-radius:50%;filter:blur(3px);animation:orbFloat 5s ease-in-out infinite}.advantage-orb-one{width:90px;height:90px;right:-20px;top:-25px;background:rgba(96,165,250,.18)}.advantage-orb-two{width:70px;height:70px;right:120px;bottom:-28px;background:rgba(249,115,22,.14);animation-delay:-2s}.advantage-copy{position:relative;z-index:5;width:58%}.advantage-eyebrow{color:#d35b0c;font-size:8px;letter-spacing:1.2px;font-weight:950}.advantage-copy h1{margin:7px 0 0;color:#13224a;font-size:26px;line-height:1.02;letter-spacing:-.7px}.advantage-copy>p{margin:9px 0 0;color:#5d6b83;font-size:10px;line-height:1.45}.benefit-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:13px}.benefit-chip{display:flex;align-items:center;gap:5px;padding:6px;border:1px solid rgba(207,218,236,.8);border-radius:9px;background:rgba(255,255,255,.7);backdrop-filter:blur(8px)}.benefit-chip span{width:15px;height:15px;display:grid;place-items:center;border-radius:5px;color:#fff;background:linear-gradient(135deg,#22c55e,#15803d);font-size:8px}.benefit-chip b{font-size:7px;line-height:1.15}.hero-action{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:10px 13px;border:0;border-radius:12px;background:linear-gradient(135deg,#f59e0b,#f05b16);color:#fff;font-size:9px;font-weight:900;box-shadow:0 10px 22px rgba(249,115,22,.22);cursor:pointer}.scene{position:absolute;right:2px;bottom:11px;width:47%;height:230px;perspective:700px}.scene-platform{position:absolute;right:8px;border-radius:50%;transform:rotateX(68deg);background:linear-gradient(135deg,rgba(147,197,253,.6),rgba(255,237,213,.8));box-shadow:0 22px 35px rgba(37,99,235,.14)}.platform-back{width:147px;height:102px;bottom:25px}.platform-front{width:170px;height:116px;right:-4px;bottom:-2px;background:linear-gradient(135deg,#e0ecff,#fff3e4)}.digital-ring{position:absolute;border:2px solid rgba(37,99,235,.32);border-radius:50%;transform:rotateX(70deg);animation:ringPulse 2.8s ease-in-out infinite}.ring-one{width:136px;height:72px;right:10px;bottom:13px}.ring-two{width:105px;height:52px;right:25px;bottom:24px;animation-delay:-1.1s}.warehouse{position:absolute;right:31px;bottom:78px;width:92px;height:82px;filter:drop-shadow(0 14px 15px rgba(30,64,175,.18));transform:rotateY(-12deg)}.warehouse-roof{position:absolute;left:-8px;top:3px;width:105px;height:43px;clip-path:polygon(50% 0,100% 44%,88% 54%,50% 21%,11% 56%,0 45%);background:linear-gradient(145deg,#93c5fd,#4f75d4)}.warehouse-wall{position:absolute;left:5px;right:3px;top:27px;height:53px;border-radius:2px 2px 8px 8px;background:linear-gradient(120deg,#dbeafe,#9fbaf0)}.warehouse-wall i{position:relative;top:8px;display:inline-block;width:6px;height:14px;margin-left:8px;border-radius:2px;background:#f8fbff;box-shadow:inset 0 0 4px rgba(30,64,175,.2)}.warehouse-door{position:absolute;left:33px;bottom:2px;width:34px;height:39px;border-radius:5px 5px 2px 2px;background:repeating-linear-gradient(0deg,#6c86bd 0 4px,#8299c8 4px 7px)}.truck-3d{position:absolute;right:7px;bottom:37px;width:112px;height:60px;filter:drop-shadow(0 12px 11px rgba(15,23,42,.22));animation:truckHover 3.3s ease-in-out infinite}.truck-box{position:absolute;left:0;top:7px;width:69px;height:35px;border-radius:6px 3px 3px 6px;background:linear-gradient(135deg,#ffb347,#f97316);transform:skewY(-2deg)}.truck-box i{display:block;height:2px;margin:7px 8px 0;border-radius:2px;background:rgba(255,255,255,.42)}.truck-cabin{position:absolute;right:4px;top:16px;width:40px;height:31px;border-radius:7px 11px 4px 3px;background:linear-gradient(135deg,#3b82f6,#174ea6)}.truck-cabin:before{content:"";position:absolute;left:8px;top:4px;width:19px;height:11px;clip-path:polygon(0 0,72% 0,100% 100%,0 100%);border-radius:2px;background:linear-gradient(135deg,#dff4ff,#83c4ec)}.truck-cabin span{position:absolute;right:2px;bottom:6px;width:6px;height:4px;border-radius:1px;background:#fef3c7}.truck-bumper{position:absolute;right:0;bottom:12px;width:16px;height:4px;border-radius:3px;background:#17305f}.wheel{position:absolute;bottom:3px;width:18px;height:18px;border:4px solid #24324a;border-radius:50%;background:#dae2ef}.wheel i{display:block;width:5px;height:5px;margin:2.5px;border-radius:50%;background:#718096}.wheel-one{left:17px}.wheel-two{right:18px}.growth-hologram{position:absolute;right:16px;top:19px;width:73px;height:67px;padding:3px;border-left:1px solid rgba(16,185,129,.33);border-bottom:1px solid rgba(16,185,129,.33);transform:rotateY(-5deg);filter:drop-shadow(0 0 8px rgba(16,185,129,.28))}.growth-hologram .bar{position:absolute;bottom:0;width:9px;border-radius:3px 3px 0 0;background:linear-gradient(180deg,#34d399,#0ea5e9);animation:barGlow 2.2s ease-in-out infinite}.bar-one{left:8px;height:15px}.bar-two{left:23px;height:27px;animation-delay:-.4s!important}.bar-three{left:38px;height:40px;animation-delay:-.8s!important}.bar-four{left:53px;height:55px;animation-delay:-1.2s!important}.growth-line{position:absolute;right:-1px;top:-17px;color:#10b981;font-size:30px;font-weight:300;animation:hologramFloat 2.5s ease-in-out infinite}.floating-cube{position:absolute;width:13px;height:13px;border:1px solid rgba(37,99,235,.35);background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(147,197,253,.45));transform:rotate(30deg);box-shadow:0 7px 12px rgba(37,99,235,.16);animation:cubeFloat 4s ease-in-out infinite}.cube-one{right:135px;top:64px}.cube-two{right:7px;top:102px;animation-delay:-1.2s}.cube-three{right:120px;bottom:37px;animation-delay:-2.4s}.quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.quick-actions button{min-width:0;display:flex;flex-direction:column;align-items:center;gap:7px;padding:10px 4px;border:1px solid #e4e9f1;border-radius:15px;background:#fff;color:#263246;box-shadow:0 7px 18px rgba(15,23,42,.045);cursor:pointer}.quick-actions button span{width:34px;height:34px;display:grid;place-items:center;border-radius:12px;color:#db5b0b;background:linear-gradient(145deg,#fff3dc,#ffe2ba);box-shadow:inset 1px 1px 0 #fff,0 7px 14px rgba(245,158,11,.12)}.quick-actions button b{font-size:8px;line-height:1.2;text-align:center}.section-block{margin-top:20px}.section-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:10px;padding:0 2px}.section-heading h2{margin:0;font-size:15px;letter-spacing:-.25px}.section-heading button{padding:0;border:0;background:transparent;color:#d35b0c;font-size:9px;font-weight:850;cursor:pointer}.section-kicker{display:block;margin-bottom:3px;color:#d35b0c;font-size:7px;letter-spacing:.9px;font-weight:950}.live-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;color:#15803d;background:#ebf9f1;font-size:8px;font-weight:850}.live-pill i{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.13);animation:livePulse 1.8s ease-in-out infinite}.rate-scroll{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(132px,1fr);gap:9px;overflow-x:auto;padding:1px 1px 7px;scrollbar-width:none}.rate-card{position:relative;min-height:183px;padding:12px;overflow:hidden;border:1px solid #e5eaf1;border-radius:18px;background:#fff;box-shadow:0 8px 20px rgba(15,23,42,.05)}.rate-card:after{content:"";position:absolute;width:70px;height:70px;right:-28px;top:32px;border-radius:50%;opacity:.26}.rate-card.green:after{background:#86efac}.rate-card.orange:after{background:#fdba74}.rate-card.blue:after{background:#93c5fd}.rate-top{display:flex;align-items:center;justify-content:space-between}.rate-top small{color:#9aa4b2;font-size:6px}.stone-mark{position:relative;width:30px;height:27px;display:block}.stone-mark i,.stone-mark b,.stone-mark em{position:absolute;bottom:0;display:block;clip-path:polygon(50% 0,100% 45%,83% 100%,18% 93%,0 43%);background:linear-gradient(145deg,#8493a7,#4b5563)}.stone-mark i{left:0;width:17px;height:20px}.stone-mark b{right:0;width:15px;height:16px;background:linear-gradient(145deg,#b8c3d1,#687386)}.stone-mark em{left:10px;bottom:2px;width:10px;height:11px;background:#d5dce5}.rate-card h3{margin:7px 0 0;font-size:13px}.rate-card p{margin:2px 0 0;color:#778294;font-size:8px}.starting-label{display:block;margin-top:12px;color:#9aa4b2;font-size:7px}.rate-card>strong{display:block;margin-top:2px;color:#111827;font-size:18px}.rate-card>strong small{font-size:7px;color:#687386}.movement{display:inline-flex;margin-top:9px;padding:5px 7px;border-radius:999px;font-size:7px;font-weight:850}.movement.up{color:#15803d;background:#eaf9f0}.movement.down{color:#c2410c;background:#fff0e8}.movement.stable{color:#475569;background:#edf1f5}.performance-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.performance-card{position:relative;min-height:126px;padding:12px;border:1px solid #e4e9f1;border-radius:18px;background:linear-gradient(145deg,#fff,#f8faff);box-shadow:0 8px 20px rgba(15,23,42,.045)}.metric-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:12px;color:#1d4ed8;background:#eaf2ff}.metric-icon.negative{color:#c2410c;background:#fff0e8}.performance-card>strong{display:block;margin-top:10px;font-size:19px}.performance-card>span{display:block;margin-top:1px;color:#657185;font-size:8px}.performance-card>small{display:block;margin-top:7px;font-size:7px;font-weight:850}.performance-card>small.up{color:#15803d}.performance-card>small.down{color:#dc2626}.loading-stack{display:grid;gap:9px}.loading-card{width:100%;display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:9px;padding:11px;border:1px solid #e2e8f0;border-radius:17px;background:#fff;text-align:left;color:#152033;box-shadow:0 8px 20px rgba(15,23,42,.045);cursor:pointer}.loading-icon{position:relative;width:42px;height:42px;display:grid;place-items:center;border-radius:14px}.loading-icon.amber{color:#c65a05;background:#fff2dc}.loading-icon.blue{color:#1d4ed8;background:#eaf2ff}.loading-icon i{position:absolute;right:3px;bottom:3px;width:8px;height:8px;border:2px solid #fff;border-radius:50%;background:#22c55e}.loading-copy{min-width:0;display:flex;flex-direction:column}.loading-copy small{color:#8a95a5;font-size:7px}.loading-copy b{margin-top:2px;overflow:hidden;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.loading-copy em{margin-top:3px;color:#657185;font-size:8px;font-style:normal}.loading-time{text-align:right}.loading-time b{display:block;font-size:10px;white-space:nowrap}.loading-time small{display:block;margin-top:3px;font-size:7px}.loading-time small.amber{color:#c65a05}.loading-time small.blue{color:#1d4ed8}.order-overview{display:grid;grid-template-columns:1.06fr .94fr;gap:11px;margin-top:20px;padding:15px;border:1px solid #dfe6f0;border-radius:21px;background:radial-gradient(circle at 93% 10%,rgba(251,191,36,.20),transparent 34%),linear-gradient(145deg,#fff,#f2f7ff);box-shadow:0 10px 26px rgba(15,23,42,.06)}.overview-copy h2{margin:4px 0 0;font-size:16px}.overview-copy p{margin:6px 0 0;color:#687386;font-size:8px;line-height:1.4}.overview-copy button{display:inline-flex;align-items:center;gap:5px;margin-top:10px;padding:7px 9px;border:0;border-radius:9px;background:#18243b;color:#fff;font-size:7px;font-weight:850;cursor:pointer}.overview-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.overview-metric{display:flex;flex-direction:column;justify-content:center;padding:8px;border-radius:12px;background:#fff;box-shadow:0 5px 12px rgba(15,23,42,.05)}.overview-metric strong{font-size:15px}.overview-metric span{margin-top:2px;color:#687386;font-size:6.5px}.overview-metric.blue strong{color:#2563eb}.overview-metric.green strong{color:#16a36a}.overview-metric.amber strong{color:#d97706}.overview-metric.purple strong{color:#7c3aed}.pulse-grid{display:grid;gap:8px}.pulse-card{display:flex;align-items:center;gap:10px;padding:11px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 7px 18px rgba(15,23,42,.04)}.pulse-card>span{width:38px;height:38px;display:grid;place-items:center;flex-shrink:0;border-radius:13px}.pulse-card.green>span{color:#15803d;background:#eaf9f0}.pulse-card.blue>span{color:#1d4ed8;background:#eaf2ff}.pulse-card.amber>span{color:#c65a05;background:#fff2dc}.pulse-card div{display:flex;flex-direction:column}.pulse-card b{font-size:9px}.pulse-card small{margin-top:3px;color:#718096;font-size:7px}.last-section{padding-bottom:12px}.bottom-nav{position:absolute;z-index:50;left:0;right:0;bottom:0;height:72px;display:grid;grid-template-columns:repeat(5,1fr);align-items:center;padding:7px 7px calc(env(safe-area-inset-bottom,0px) + 6px);border-top:1px solid rgba(218,225,235,.95);background:rgba(255,255,255,.94);backdrop-filter:blur(20px);box-shadow:0 -10px 28px rgba(15,23,42,.075)}.bottom-nav button{min-width:0;height:54px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border:0;border-radius:15px;background:transparent;color:#647084;cursor:pointer}.bottom-nav button>span{width:30px;height:28px;display:grid;place-items:center;border-radius:10px}.bottom-nav button small{font-size:7px}.bottom-nav button.active{color:#d95d0b;font-weight:900}.bottom-nav button.active>span{color:#fff;background:linear-gradient(135deg,#f59e0b,#f05b16);box-shadow:0 8px 18px rgba(249,115,22,.25);transform:translateY(-3px)}
@keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}@keyframes ringPulse{0%,100%{opacity:.35;transform:rotateX(70deg) scale(.95)}50%{opacity:.75;transform:rotateX(70deg) scale(1.06)}}@keyframes truckHover{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes barGlow{0%,100%{opacity:.65;filter:brightness(.9)}50%{opacity:1;filter:brightness(1.35)}}@keyframes hologramFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes cubeFloat{0%,100%{transform:translateY(0) rotate(30deg)}50%{transform:translateY(-9px) rotate(50deg)}}@keyframes livePulse{0%,100%{opacity:.6}50%{opacity:1;box-shadow:0 0 0 6px rgba(34,197,94,.08)}}
@media(min-width:700px){.seller-phone{height:min(900px,calc(100dvh - 24px));border:1px solid #dfe5ee;border-radius:28px;box-shadow:0 28px 80px rgba(15,23,42,.22)}}
@media(max-width:370px){.advantage-card{min-height:315px;padding:17px}.advantage-copy{width:62%}.advantage-copy h1{font-size:23px}.benefit-grid{grid-template-columns:1fr}.benefit-chip:nth-child(n+4){display:none}.scene{right:-15px}.quick-actions button b{font-size:7px}.loading-card{grid-template-columns:auto minmax(0,1fr) auto}.loading-card>svg{display:none}.loading-time small{max-width:65px}}
@media(prefers-reduced-motion:reduce){.seller-app *{animation:none!important;transition:none!important}}
`;
