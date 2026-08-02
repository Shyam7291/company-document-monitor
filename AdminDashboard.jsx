import React, { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * StoneRate Admin — Neo Console
 * High-tech light theme: glass surfaces, aurora mesh, grid field,
 * live sparklines, animated counters, precision micro-typography.
 * ------------------------------------------------------------------ */

const Icon = ({ name, size = 20, strokeWidth = 1.7 }) => {
  const paths = {
    menu: <><path d="M4 7h16M4 12h16M4 17h11" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 1-2-5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    sample: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h5M8 16h3" /></>,
    rate: <><path d="M4 6h16v12H4z" /><path d="M8 10h8M8 14h5" /></>,
    order: <><path d="M6 3h12l2 5v11H4V8z" /><path d="M4 8h16M9 12h6" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    chevron: <><path d="m9 6 6 6-6 6" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5" /></>,
    support: <><path d="M4 13a8 8 0 0 1 16 0" /><path d="M4 13v5h4v-6H4M20 13v5h-4v-6h4M16 18c0 2-2 3-4 3" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    activity: <><path d="M3 12h4l2-6 4 12 2-6h6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    alert: <><path d="M12 3 2 20h20z" /><path d="M12 9v4M12 17h.01" /></>,
    truck: <><path d="M3 6h11v11H3zM14 10h4l3 4v3h-7z" /><circle cx="7" cy="19" r="2" /><circle cx="18" cy="19" r="2" /></>,
    eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" /><circle cx="12" cy="12" r="2.5" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>,
    bolt: <><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></>,
    shield: <><path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
    pulse: <><path d="M2 12h4l2.5-7 4 14L15 12h7" /></>,
    grid: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></>,
    up: <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    down: <><path d="M12 5v14M6 13l6 6 6-6" /></>,
    cpu: <><path d="M7 7h10v10H7z" /><path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3" /></>
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || paths.home}
    </svg>
  );
};

/* Animated counter -------------------------------------------------- */
const useCountUp = (target, deps) => {
  const [value, setValue] = useState(0);
  const frame = useRef(0);
  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
    if (reduce) { setValue(target); return undefined; }
    const start = performance.now();
    const run = now => {
      const p = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) frame.current = requestAnimationFrame(run);
    };
    frame.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, deps]);
  return value;
};

const Counter = ({ value, seed }) => <>{useCountUp(value, seed)}</>;

/* Sparkline --------------------------------------------------------- */
const Sparkline = ({ data, id }) => {
  const w = 92, h = 26, max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => [
    (i / (data.length - 1)) * w,
    h - 3 - ((d - min) / span) * (h - 8)
  ]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + " L" + w + " " + h + " L0 " + h + " Z";
  const last = pts[pts.length - 1];
  return (
    <svg className="nx-spark" viewBox={"0 0 " + w + " " + h} width={w} height={h} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={"g" + id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity=".22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={"url(#g" + id + ")"} />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.1" fill="var(--accent)" />
    </svg>
  );
};

/* Progress ring ----------------------------------------------------- */
const Ring = ({ value, size = 34, stroke = 3.2 }) => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={"0 0 " + size + " " + size} className="nx-ring" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity=".13" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * value) / 100}
        transform={"rotate(-90 " + size / 2 + " " + size / 2 + ")"} />
    </svg>
  );
};

const ButtonIcon = ({ label, icon, onClick, badge, spin }) => (
  <button className="nx-icon-btn" aria-label={label} onClick={onClick}>
    <span className={spin ? "nx-spin" : ""}><Icon name={icon} size={18} /></span>
    {badge ? <span className="nx-badge">{badge}</span> : null}
  </button>
);

export default function AdminDashboard() {
  const [drawer, setDrawer] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [logout, setLogout] = useState(false);
  const [activeNav, setActiveNav] = useState("Home");
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [toast, setToast] = useState("");
  const [updated, setUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [unread, setUnread] = useState(3);
  const [tick, setTick] = useState(0);
  const [noticeFilter, setNoticeFilter] = useState("All");

  const overlayOpen = drawer || notifications || logout;
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    const escape = e => {
      if (e.key === "Escape") { setDrawer(false); setNotifications(false); setLogout(false); }
    };
    window.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", escape); };
  }, [overlayOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const timeText = useMemo(
    () => updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [updated]
  );
  const dateText = useMemo(
    () => updated.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" }),
    [updated]
  );

  const showToast = text => setToast(text);
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => {
      setUpdated(new Date());
      setRefreshing(false);
      setTick(t => t + 1);
      showToast("Telemetry synced");
    }, 700);
  };
  const openNotifications = () => { setNotifications(true); setUnread(0); };

  const stats = [
    {
      icon: "sample", value: 12, label: "Samples Today", detail: "3 expiring soon", short: "3 expiring",
      color: "#f97316", delta: "+18%", dir: "up", ring: 74, series: [4, 6, 5, 8, 7, 10, 9, 12]
    },
    {
      icon: "rate", value: 8, label: "Rate Requests", detail: "2 require action", short: "2 actions",
      color: "#2563eb", delta: "+9%", dir: "up", ring: 52, series: [3, 5, 4, 6, 5, 7, 6, 8]
    },
    {
      icon: "order", value: 6, label: "Active Orders", detail: "1 needs assignment", short: "1 assign",
      color: "#0d9488", delta: "-4%", dir: "down", ring: 61, series: [7, 8, 6, 7, 5, 6, 7, 6]
    }
  ];

  const attention = [
    { type: "urgent", icon: "alert", title: "Rates pending", sub: "2 requests need material-wise rates", action: "Resolve", target: "Rate Requests", tag: "P1" },
    { type: "amber", icon: "clock", title: "Samples expiring", sub: "3 references expire within 24 hours", action: "View", target: "Daily Material Samples", tag: "24h" },
    { type: "blue", icon: "truck", title: "Assignment required", sub: "Order #SR-2408 is awaiting a transporter", action: "Resolve", target: "Active Orders", tag: "P2" },
    { type: "green", icon: "check", title: "Delivery updates current", sub: "All in-transit orders were updated", action: "View", target: "Delivery Statuses", tag: "OK" },
    { type: "amber", icon: "clock", title: "Quotation nearing expiry", sub: "Quotation #QT-118 expires this evening", action: "View", target: "Quotation QT-118", tag: "6h" }
  ];

  const operations = [
    { icon: "sample", title: "Daily Material Samples", text: "Upload and manage material reference samples.", color: "orange", meta: "12 active" },
    { icon: "rate", title: "Rate Requests", text: "Review buyer requests and publish material-wise rates.", color: "blue", meta: "8 open" },
    { icon: "order", title: "Active Orders", text: "Manage assignments, loading, transit, and delivery.", color: "green", meta: "6 running" }
  ];

  const menu = [
    ["Dashboard", "Operations overview", "home", "core"],
    ["Users & Partners", "Buyers, sellers, and transporters", "users", "core"],
    ["Support & Issues", "Complaints and operational concerns", "support", "core"],
    ["Reports & Analytics", "Business and delivery performance", "chart", "insight"],
    ["Notifications", "System and operational alerts", "bell", "insight"],
    ["Activity Log", "Admin action history", "activity", "insight"],
    ["Settings", "Materials, vehicles, quotation validity, sample expiry, image retention, and access control", "settings", "system"],
    ["Admin Profile", "Account and access settings", "profile", "system"],
    ["Logout", "Sign out of StoneRate Admin", "logout", "system"]
  ];
  const groups = [["core", "Operations"], ["insight", "Intelligence"], ["system", "Account"]];

  const notices = [
    ["New rate request received", "M-Sand request from BuildCore, 8 minutes ago", true, "rate", "Rates"],
    ["Material samples expiring soon", "Three aggregate references expire tomorrow", true, "sample", "Samples"],
    ["Active order requires assignment", "Order #SR-2408 needs a transporter", true, "truck", "Orders"],
    ["Delivery status updated", "Order #SR-2391 is now in transit", false, "check", "Orders"]
  ];
  const filters = ["All", "Rates", "Samples", "Orders"];
  const visibleNotices = notices.filter(n => noticeFilter === "All" || n[4] === noticeFilter);

  const health = [
    { label: "API latency", value: "82 ms", ok: true, icon: "bolt" },
    { label: "Sync queue", value: "0 pending", ok: true, icon: "cpu" },
    { label: "Uptime 30d", value: "99.98%", ok: true, icon: "shield" }
  ];

  const menuClick = label => {
    if (label === "Logout") { setLogout(true); return; }
    if (label === "Notifications") { setDrawer(false); setNotifications(true); setUnread(0); return; }
    setActiveMenu(label);
    setDrawer(false);
    if (label === "Dashboard") setActiveNav("Home");
    else showToast("Opening " + label);
  };
  const navClick = label => {
    setActiveNav(label);
    if (label === "Home") setActiveMenu("Dashboard");
    else showToast(label === "Orders" ? "Opening Orders workspace" : "Opening Daily Material Samples");
  };
  const navItems = [["Home", "home"], ["Orders", "order"], ["Samples", "sample"]];
  const navIndex = Math.max(0, navItems.findIndex(n => n[0] === activeNav));

  return (
    <div className="nx-admin">
      <style>{CSS}</style>

      <div className="nx-field" aria-hidden="true">
        <span className="nx-orb nx-orb-a" />
        <span className="nx-orb nx-orb-b" />
        <span className="nx-orb nx-orb-c" />
        <span className="nx-scan" />
      </div>

      <header className="nx-header">
        <div className="nx-shell">
          <div className="nx-topbar">
            <ButtonIcon label="Open menu" icon="menu" onClick={() => setDrawer(true)} />
            <div className="nx-brand">
              <span className="nx-logo" aria-hidden="true"><Icon name="grid" size={16} /></span>
              <span className="nx-brand-copy">
                <strong>Stone<span>Rate</span></strong>
                <small>Admin&nbsp;Console<i className="nx-dot" />v2.4</small>
              </span>
            </div>
            <div className="nx-actions">
              <ButtonIcon label="Refresh dashboard" icon="refresh" onClick={refresh} spin={refreshing} />
              <ButtonIcon label="Open notifications" icon="bell" badge={unread || null} onClick={openNotifications} />
            </div>
          </div>

          <div className="nx-hero">
            <div className="nx-hero-copy">
              <span className="nx-eyebrow"><i className="nx-pulse" />Live operations&nbsp;&middot;&nbsp;{dateText}</span>
              <h1>Hi, Alok</h1>
              <p>Here is what is happening with StoneRate operations today.</p>
            </div>
            <div className="nx-hero-meter">
              <span className="nx-meter-ring" style={{ "--accent": "#0d9488" }}>
                <Ring value={94} size={46} stroke={3.6} />
                <b>94</b>
              </span>
              <span className="nx-meter-copy">
                <strong>Ops health</strong>
                <small>{refreshing ? "Syncing telemetry…" : "Updated " + timeText}</small>
              </span>
            </div>
          </div>

          <div className="nx-health">
            {health.map(h => (
              <span className="nx-health-chip" key={h.label}>
                <i><Icon name={h.icon} size={12} /></i>
                <em>{h.label}</em>
                <b>{h.value}</b>
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="nx-shell">
        <section className="nx-section">
          <div className="nx-section-head">
            <h2>Today&rsquo;s Overview</h2>
            <span className="nx-tagline"><i className="nx-pulse" />Real-time</span>
          </div>
          <div className="nx-stats">
            {stats.map((s, i) => (
              <button key={s.label} className="nx-stat" style={{ "--accent": s.color }}
                onClick={() => showToast("Opening " + s.label)}>
                <span className="nx-stat-glow" aria-hidden="true" />
                <span className="nx-stat-top">
                  <span className="nx-stat-icon"><Icon name={s.icon} size={15} /></span>
                  <span className={"nx-delta " + s.dir}>
                    <Icon name={s.dir} size={10} strokeWidth={2.4} />{s.delta}
                  </span>
                </span>
                <strong className="nx-stat-value"><Counter value={s.value} seed={tick} /></strong>
                <span className="nx-stat-label">{s.label}</span>
                <Sparkline data={s.series} id={i} />
                <span className="nx-stat-detail nx-full">{s.detail}</span>
                <span className="nx-stat-detail nx-short">{s.short}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="nx-content-grid">
          <div className="nx-main-left">
            <section className="nx-section">
              <div className="nx-section-head">
                <h2>Attention Required</h2>
                <span className="nx-count">{attention.length} items</span>
              </div>
              <div className="nx-panel">
                {attention.length ? attention.map(a => (
                  <div className={"nx-alert " + a.type} key={a.title}>
                    <span className="nx-alert-icon"><Icon name={a.icon} size={15} /></span>
                    <div className="nx-alert-copy">
                      <h3>{a.title}<em className="nx-tag">{a.tag}</em></h3>
                      <p>{a.sub}</p>
                    </div>
                    <button className="nx-mini-action" onClick={() => showToast("Opening " + a.target)}>
                      {a.action}<Icon name="chevron" size={11} strokeWidth={2.4} />
                    </button>
                  </div>
                )) : (
                  <div className="nx-alert green">
                    <span className="nx-alert-icon"><Icon name="check" size={15} /></span>
                    <div className="nx-alert-copy">
                      <h3>No urgent actions right now.</h3>
                      <p>StoneRate operations are running smoothly.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="nx-section">
            <div className="nx-section-head">
              <h2>Manage Operations</h2>
              <span className="nx-count">Quick access</span>
            </div>
            <div className="nx-operations">
              {operations.map(o => (
                <button key={o.title} className={"nx-operation " + o.color}
                  onClick={() => showToast("Opening " + o.title)}>
                  <span className="nx-op-icon"><Icon name={o.icon} /></span>
                  <span className="nx-op-copy">
                    <h3>{o.title}</h3>
                    <p>{o.text}</p>
                    <em className="nx-op-meta">{o.meta}</em>
                  </span>
                  <span className="nx-op-arrow"><Icon name="chevron" size={16} /></span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <nav className="nx-bottom" aria-label="Primary navigation">
        <span className="nx-nav-pill" style={{ transform: "translateX(" + navIndex * 100 + "%)" }} aria-hidden="true" />
        {navItems.map(([label, icon]) => (
          <button key={label} className={"nx-nav-item " + (activeNav === label ? "active" : "")}
            onClick={() => navClick(label)}>
            <Icon name={icon} size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {drawer && (
        <>
          <div className="nx-backdrop" onClick={() => setDrawer(false)} />
          <aside className="nx-drawer" role="dialog" aria-modal="true" aria-label="Admin menu">
            <div className="nx-drawer-head">
              <span className="nx-avatar"><i>AK</i></span>
              <div className="nx-drawer-id">
                <h2>Alok</h2>
                <p>StoneRate Administrator</p>
                <span className="nx-role"><i className="nx-pulse" />Super admin</span>
              </div>
              <ButtonIcon label="Close menu" icon="close" onClick={() => setDrawer(false)} />
            </div>
            <div className="nx-menu">
              {groups.map(([key, title]) => (
                <div className="nx-menu-group" key={key}>
                  <span className="nx-menu-title">{title}</span>
                  {menu.filter(m => m[3] === key).map(([label, desc, icon]) => (
                    <button key={label}
                      className={"nx-menu-item " + (activeMenu === label ? "active " : "") + (label === "Logout" ? "logout" : "")}
                      onClick={() => menuClick(label)}>
                      <span className="nx-menu-icon"><Icon name={icon} size={16} /></span>
                      <span className="nx-menu-copy">
                        <strong>{label}</strong>
                        <span>{desc}</span>
                      </span>
                      <span className="nx-menu-arrow"><Icon name="chevron" size={13} /></span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <div className="nx-drawer-foot">
              <span><Icon name="shield" size={13} />Secure session</span>
              <b>{timeText}</b>
            </div>
          </aside>
        </>
      )}

      {notifications && (
        <>
          <div className="nx-backdrop" onClick={() => setNotifications(false)} />
          <section className="nx-sheet" role="dialog" aria-modal="true" aria-label="Notifications">
            <span className="nx-sheet-grip" aria-hidden="true" />
            <div className="nx-sheet-head">
              <div>
                <h2>Notifications</h2>
                <p>Recent StoneRate operational alerts</p>
              </div>
              <ButtonIcon label="Close notifications" icon="close" onClick={() => setNotifications(false)} />
            </div>
            <div className="nx-filters">
              {filters.map(f => (
                <button key={f} className={"nx-filter " + (noticeFilter === f ? "active" : "")}
                  onClick={() => setNoticeFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="nx-notice-list">
              {visibleNotices.length ? visibleNotices.map(([title, text, isUnread, icon]) => (
                <button className={"nx-notice " + (isUnread ? "unread" : "")} key={title}
                  onClick={() => showToast("Opening " + title)}>
                  <span className="nx-notice-icon"><Icon name={icon} size={16} /></span>
                  <span className="nx-notice-copy">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </span>
                  {isUnread ? <i className="nx-unread-dot" /> : null}
                </button>
              )) : <p className="nx-empty">Nothing here yet.</p>}
            </div>
          </section>
        </>
      )}

      {logout && (
        <>
          <div className="nx-backdrop" onClick={() => setLogout(false)} />
          <div className="nx-modal-wrap">
            <div className="nx-modal" role="alertdialog" aria-modal="true" aria-labelledby="logout-title">
              <span className="nx-modal-icon"><Icon name="logout" /></span>
              <h2 id="logout-title">Sign out of StoneRate?</h2>
              <p>You will need to sign in again to access the operations dashboard.</p>
              <div className="nx-modal-actions">
                <button className="nx-btn" onClick={() => setLogout(false)}>Cancel</button>
                <button className="nx-btn danger"
                  onClick={() => { setLogout(false); setDrawer(false); showToast("Logout confirmed (demo)"); }}>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="nx-toast" role="status">
          <i className="nx-toast-dot" />{toast}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Design tokens + component styles (scoped under .nx-admin)
 * ------------------------------------------------------------------ */
const CSS = `
.nx-admin{
  --ink:#0e1626;--ink-2:#28344a;--muted:#66748d;--faint:#8b97ab;
  --line:rgba(16,28,50,.09);--line-2:rgba(16,28,50,.06);
  --brand:#f0730a;--brand-2:#ffa63d;--blue:#2563eb;--teal:#0d9488;--violet:#6d5ae0;
  --paper:#ffffff;--glass:rgba(255,255,255,.72);--glass-2:rgba(255,255,255,.55);
  --shadow-s:0 2px 8px rgba(14,26,48,.05);
  --shadow-m:0 10px 30px rgba(14,26,48,.07),0 1px 2px rgba(14,26,48,.04);
  --shadow-l:0 24px 60px rgba(14,26,48,.13);
  --r-s:10px;--r-m:14px;--r-l:20px;--r-xl:26px;
  font-family:"Inter var",Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-feature-settings:"cv02","cv03","ss01","tnum";
  color:var(--ink);position:relative;min-height:100vh;isolation:isolate;
  background:#f4f7fb;box-sizing:border-box;overflow-x:hidden;padding-bottom:86px;
  -webkit-font-smoothing:antialiased;
}
.nx-admin *{box-sizing:border-box}
.nx-admin button{font:inherit;color:inherit}
.nx-shell{width:min(100%,1180px);margin:auto;padding:0 14px;position:relative;z-index:1}

/* ---- ambient field ---- */
.nx-field{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;
  background:
    linear-gradient(transparent 0 31px,rgba(24,42,72,.035) 31px 32px),
    linear-gradient(90deg,transparent 0 31px,rgba(24,42,72,.035) 31px 32px);
  background-size:32px 32px;
  -webkit-mask-image:radial-gradient(120% 85% at 50% 0%,#000 20%,transparent 78%);
  mask-image:radial-gradient(120% 85% at 50% 0%,#000 20%,transparent 78%);
}
.nx-orb{position:absolute;border-radius:50%;filter:blur(58px);opacity:.5}
.nx-orb-a{width:44vw;height:44vw;max-width:520px;max-height:520px;left:-9vw;top:-16vw;
  background:radial-gradient(circle,rgba(255,168,74,.55),transparent 66%)}
.nx-orb-b{width:40vw;height:40vw;max-width:470px;max-height:470px;right:-10vw;top:-6vw;
  background:radial-gradient(circle,rgba(80,140,255,.42),transparent 66%)}
.nx-orb-c{width:36vw;height:36vw;max-width:420px;max-height:420px;left:34vw;top:26vw;
  background:radial-gradient(circle,rgba(13,148,136,.26),transparent 68%)}
.nx-scan{position:absolute;left:0;right:0;top:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(59,130,246,.5),transparent);
  animation:nxScan 9s linear infinite}

/* ---- header ---- */
.nx-header{position:relative;padding:14px 0 4px}
.nx-topbar{display:flex;align-items:center;gap:10px}
.nx-brand{display:flex;align-items:center;gap:9px;min-width:0;flex:1}
.nx-logo{width:32px;height:32px;flex:0 0 32px;border-radius:11px;display:grid;place-items:center;color:#fff;
  background:linear-gradient(140deg,var(--brand-2),var(--brand));
  box-shadow:0 6px 16px rgba(240,115,10,.28),inset 0 1px 0 rgba(255,255,255,.45)}
.nx-brand-copy{min-width:0}
.nx-brand strong{display:block;font-size:16px;font-weight:700;line-height:1.05;letter-spacing:-.5px}
.nx-brand strong span{background:linear-gradient(96deg,var(--brand),#ff9a3c);-webkit-background-clip:text;
  background-clip:text;-webkit-text-fill-color:transparent}
.nx-brand small{display:flex;align-items:center;gap:6px;margin-top:3px;color:var(--faint);
  font-size:9px;font-weight:500;letter-spacing:.85px;text-transform:uppercase}
.nx-dot{width:3px;height:3px;border-radius:50%;background:currentColor;opacity:.55}
.nx-actions{display:flex;gap:8px}

.nx-icon-btn{position:relative;width:38px;height:38px;flex:0 0 38px;border:1px solid var(--line);
  border-radius:12px;background:var(--glass);color:var(--ink-2);display:grid;place-items:center;cursor:pointer;
  box-shadow:var(--shadow-s),inset 0 1px 0 rgba(255,255,255,.85);
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);
  transition:transform .18s cubic-bezier(.2,.7,.3,1),border-color .18s,color .18s,box-shadow .18s}
.nx-icon-btn:hover{color:var(--brand);border-color:rgba(240,115,10,.42);transform:translateY(-1px);
  box-shadow:0 8px 20px rgba(240,115,10,.16)}
.nx-icon-btn:active{transform:scale(.93)}
.nx-icon-btn:focus-visible{outline:2px solid rgba(37,99,235,.5);outline-offset:2px}
.nx-badge{position:absolute;right:-4px;top:-5px;min-width:17px;height:17px;padding:0 4px;border:2px solid #f4f7fb;
  border-radius:9px;background:linear-gradient(140deg,#ff5f57,#e0393f);color:#fff;font-size:9px;font-weight:700;
  display:grid;place-items:center;box-shadow:0 3px 9px rgba(224,57,63,.35)}

.nx-hero{margin-top:16px;display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap}
.nx-hero-copy{min-width:0}
.nx-eyebrow{display:inline-flex;align-items:center;gap:6px;padding:3px 9px 3px 7px;border-radius:20px;
  border:1px solid var(--line);background:var(--glass);color:#55637b;font-size:9.5px;font-weight:600;
  letter-spacing:.5px;text-transform:uppercase;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.nx-pulse{width:6px;height:6px;border-radius:50%;background:#12b981;flex:0 0 6px;
  box-shadow:0 0 0 0 rgba(18,185,129,.42);animation:nxPulse 2.2s ease-out infinite}
.nx-hero h1{font-size:26px;font-weight:700;letter-spacing:-1px;line-height:1.05;margin:9px 0 5px}
.nx-hero p{font-size:12px;color:var(--muted);line-height:1.45;margin:0;max-width:520px}
.nx-hero-meter{display:flex;align-items:center;gap:10px;padding:8px 13px 8px 9px;border-radius:16px;
  border:1px solid var(--line);background:var(--glass);box-shadow:var(--shadow-s);
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.nx-meter-ring{position:relative;display:grid;place-items:center;color:var(--ink)}
.nx-meter-ring b{position:absolute;font-size:12px;font-weight:700;letter-spacing:-.4px}
.nx-meter-copy{display:block;line-height:1.25}
.nx-meter-copy strong{display:block;font-size:11px;font-weight:650}
.nx-meter-copy small{display:block;font-size:9.5px;color:var(--faint);margin-top:2px;white-space:nowrap}

.nx-health{margin-top:12px;display:flex;gap:7px;flex-wrap:wrap}
.nx-health-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:11px;
  border:1px solid var(--line-2);background:var(--glass-2);box-shadow:var(--shadow-s);
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.nx-health-chip i{display:grid;place-items:center;color:var(--teal)}
.nx-health-chip em{font-style:normal;font-size:9.5px;color:var(--faint);letter-spacing:.2px}
.nx-health-chip b{font-size:10px;font-weight:650;color:var(--ink-2);font-variant-numeric:tabular-nums}

/* ---- sections ---- */
.nx-section{margin-top:16px}
.nx-section-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 2px 9px}
.nx-section-head h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.1px;margin:0;color:#3d4a61}
.nx-count{font-size:9.5px;font-weight:600;color:var(--faint);padding:2px 8px;border-radius:20px;
  border:1px solid var(--line-2);background:var(--glass-2)}
.nx-tagline{display:inline-flex;align-items:center;gap:5px;font-size:9.5px;font-weight:600;color:var(--faint);
  text-transform:uppercase;letter-spacing:.6px}

/* ---- stats ---- */
.nx-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.nx-stat{position:relative;min-width:0;overflow:hidden;text-align:left;cursor:pointer;padding:11px 10px 10px;
  border:1px solid var(--line);border-radius:var(--r-m);
  background:linear-gradient(160deg,rgba(255,255,255,.92),rgba(255,255,255,.62));
  box-shadow:var(--shadow-m),inset 0 1px 0 rgba(255,255,255,.9);
  -webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  transition:transform .22s cubic-bezier(.2,.7,.3,1),box-shadow .22s,border-color .22s}
.nx-stat:before{content:"";position:absolute;left:0;top:0;bottom:0;width:2.5px;border-radius:3px;
  background:linear-gradient(180deg,var(--accent),transparent);opacity:.85}
.nx-stat-glow{position:absolute;right:-30px;top:-34px;width:96px;height:96px;border-radius:50%;
  background:radial-gradient(circle,var(--accent),transparent 68%);opacity:.11;transition:opacity .25s}
.nx-stat:hover{transform:translateY(-3px);border-color:rgba(16,28,50,.14);
  box-shadow:0 18px 40px rgba(14,26,48,.12)}
.nx-stat:hover .nx-stat-glow{opacity:.2}
.nx-stat:active{transform:translateY(-1px) scale(.99)}
.nx-stat:focus-visible{outline:2px solid rgba(37,99,235,.45);outline-offset:2px}
.nx-stat-top{display:flex;align-items:center;justify-content:space-between;gap:4px}
.nx-stat-icon{width:26px;height:26px;border-radius:9px;display:grid;place-items:center;color:var(--accent);
  background:color-mix(in srgb,var(--accent) 11%,#fff);
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--accent) 20%,transparent)}
.nx-delta{display:inline-flex;align-items:center;gap:2px;font-size:9px;font-weight:700;padding:2px 5px;
  border-radius:7px;font-variant-numeric:tabular-nums}
.nx-delta.up{color:#0a7d5f;background:rgba(16,185,129,.11)}
.nx-delta.down{color:#c2410c;background:rgba(249,115,22,.12)}
.nx-stat-value{display:block;margin-top:8px;font-size:23px;font-weight:750;letter-spacing:-1px;line-height:1;
  font-variant-numeric:tabular-nums}
.nx-stat-label{display:block;margin-top:4px;font-size:10px;line-height:1.2;font-weight:650;color:var(--ink-2);
  min-height:24px}
.nx-spark{display:block;width:100%;height:24px;margin-top:2px;opacity:.95}
.nx-stat-detail{display:block;margin-top:4px;color:var(--faint);font-size:9px;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.nx-short{display:none}

/* ---- panel / alerts ---- */
.nx-panel{border:1px solid var(--line);border-radius:var(--r-l);overflow:hidden;
  background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(255,255,255,.66));
  box-shadow:var(--shadow-m),inset 0 1px 0 rgba(255,255,255,.9);
  -webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px)}
.nx-alert{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:10px;
  padding:10px 12px;border-bottom:1px solid var(--line-2);transition:background .18s}
.nx-alert:last-child{border-bottom:0}
.nx-alert:hover{background:rgba(255,255,255,.7)}
.nx-alert-icon{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;
  box-shadow:inset 0 0 0 1px rgba(16,28,50,.05)}
.nx-alert.urgent .nx-alert-icon{color:#d8434a;background:linear-gradient(145deg,#ffeff0,#fff8f8)}
.nx-alert.amber .nx-alert-icon{color:#b96a09;background:linear-gradient(145deg,#fff5e2,#fffcf6)}
.nx-alert.blue .nx-alert-icon{color:#2563eb;background:linear-gradient(145deg,#eaf2ff,#f8fbff)}
.nx-alert.green .nx-alert-icon{color:#0a8161;background:linear-gradient(145deg,#e7f9f1,#f7fffb)}
.nx-alert-copy{min-width:0}
.nx-alert h3{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:650;margin:0 0 3px;line-height:1.2}
.nx-tag{font-style:normal;font-size:8px;font-weight:700;letter-spacing:.5px;padding:1.5px 5px;border-radius:5px;
  color:#4a5771;background:rgba(16,28,50,.06);flex:0 0 auto}
.nx-alert.urgent .nx-tag{color:#d8434a;background:rgba(216,67,74,.1)}
.nx-alert.amber .nx-tag{color:#b96a09;background:rgba(185,106,9,.1)}
.nx-alert p{font-size:9.8px;color:var(--muted);margin:0;line-height:1.35}
.nx-mini-action{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--line);
  background:rgba(255,255,255,.9);border-radius:9px;padding:5px 7px 5px 9px;font-size:9.5px;font-weight:700;
  color:#43506a;cursor:pointer;white-space:nowrap;transition:.18s}
.nx-mini-action:hover{color:var(--brand);border-color:rgba(240,115,10,.4);
  box-shadow:0 5px 14px rgba(240,115,10,.14);transform:translateY(-1px)}
.nx-mini-action:active{transform:scale(.96)}

/* ---- operations ---- */
.nx-operations{display:grid;gap:9px}
.nx-operation{position:relative;overflow:hidden;width:100%;display:grid;
  grid-template-columns:40px minmax(0,1fr) 22px;align-items:center;gap:11px;text-align:left;padding:11px;
  border:1px solid var(--line);border-radius:var(--r-m);cursor:pointer;
  background:linear-gradient(150deg,rgba(255,255,255,.92),rgba(255,255,255,.64));
  box-shadow:var(--shadow-m),inset 0 1px 0 rgba(255,255,255,.9);
  -webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  transition:transform .2s cubic-bezier(.2,.7,.3,1),box-shadow .2s,border-color .2s}
.nx-operation:after{content:"";position:absolute;left:0;top:0;bottom:0;width:2.5px;opacity:0;transition:opacity .2s}
.nx-operation.orange:after{background:linear-gradient(180deg,#f97316,transparent)}
.nx-operation.blue:after{background:linear-gradient(180deg,#2563eb,transparent)}
.nx-operation.green:after{background:linear-gradient(180deg,#0d9488,transparent)}
.nx-operation:hover{transform:translateY(-2px);border-color:rgba(16,28,50,.14);
  box-shadow:0 16px 36px rgba(14,26,48,.1)}
.nx-operation:hover:after{opacity:1}
.nx-operation:hover .nx-op-arrow{transform:translateX(3px);color:var(--ink-2)}
.nx-operation:active{transform:translateY(0) scale(.995)}
.nx-op-icon{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;
  box-shadow:inset 0 0 0 1px rgba(16,28,50,.05)}
.nx-operation.orange .nx-op-icon{color:#c2610a;background:linear-gradient(145deg,#fff0d6,#fffaf2)}
.nx-operation.blue .nx-op-icon{color:#2563eb;background:linear-gradient(145deg,#e8f1ff,#f8fbff)}
.nx-operation.green .nx-op-icon{color:#0a8161;background:linear-gradient(145deg,#e2f7ef,#f7fffb)}
.nx-op-copy{min-width:0}
.nx-operation h3{font-size:12px;font-weight:650;margin:0 0 3px;letter-spacing:-.2px}
.nx-operation p{font-size:9.8px;line-height:1.35;color:var(--muted);margin:0}
.nx-op-meta{display:inline-block;margin-top:5px;font-style:normal;font-size:8.5px;font-weight:700;
  letter-spacing:.4px;text-transform:uppercase;color:#5b6880;padding:2px 6px;border-radius:6px;
  background:rgba(16,28,50,.05)}
.nx-op-arrow{color:#a8b1c1;display:grid;place-items:center;transition:transform .2s,color .2s}

/* ---- bottom nav ---- */
.nx-bottom{position:fixed;z-index:30;bottom:12px;left:50%;transform:translateX(-50%);
  width:min(calc(100% - 22px),430px);height:60px;display:grid;grid-template-columns:repeat(3,1fr);padding:6px;
  border:1px solid rgba(16,28,50,.1);border-radius:var(--r-l);background:rgba(255,255,255,.82);
  box-shadow:0 16px 44px rgba(14,26,48,.16),inset 0 1px 0 rgba(255,255,255,.9);
  -webkit-backdrop-filter:blur(22px) saturate(1.5);backdrop-filter:blur(22px) saturate(1.5)}
.nx-nav-pill{position:absolute;left:6px;top:6px;bottom:6px;width:calc((100% - 12px)/3);border-radius:15px;
  background:linear-gradient(150deg,#fff3e2,#fffaf4);box-shadow:inset 0 0 0 1px rgba(240,115,10,.22),
  0 5px 14px rgba(240,115,10,.12);transition:transform .3s cubic-bezier(.35,1.3,.4,1)}
.nx-nav-item{position:relative;z-index:1;border:0;background:transparent;border-radius:15px;color:#7c869a;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:9px;
  font-weight:650;letter-spacing:.2px;cursor:pointer;transition:color .22s,transform .18s}
.nx-nav-item.active{color:#c05f06}
.nx-nav-item:active{transform:scale(.94)}
.nx-nav-item:focus-visible{outline:2px solid rgba(37,99,235,.45);outline-offset:-2px}

/* ---- overlays ---- */
.nx-backdrop{position:fixed;inset:0;z-index:50;background:rgba(12,22,40,.32);
  -webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);animation:nxFade .22s ease}
.nx-drawer{position:fixed;z-index:55;top:0;bottom:0;left:0;width:min(88vw,364px);max-width:100%;
  display:flex;flex-direction:column;overflow:hidden;background:#f7f9fc;
  box-shadow:26px 0 70px rgba(12,22,40,.22);animation:nxSlide .28s cubic-bezier(.2,.8,.25,1)}
.nx-drawer-head{flex:0 0 auto;padding:18px 14px 14px;display:grid;
  grid-template-columns:44px minmax(0,1fr) 38px;align-items:center;gap:11px;border-bottom:1px solid var(--line);
  background:radial-gradient(120% 130% at 0% 0%,#fff1dd,transparent 52%),
    radial-gradient(100% 120% at 100% 0%,#e9f1ff,transparent 55%),#fff}
.nx-avatar{position:relative;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;
  color:#fff;font-size:13px;font-weight:750;letter-spacing:.3px;
  background:linear-gradient(145deg,#ffb054,#e8690c);
  box-shadow:0 8px 20px rgba(232,105,12,.28),inset 0 1px 0 rgba(255,255,255,.4)}
.nx-avatar i{font-style:normal}
.nx-drawer-id{min-width:0}
.nx-drawer-head h2{font-size:14.5px;font-weight:700;margin:0 0 2px;letter-spacing:-.3px}
.nx-drawer-head p{font-size:10px;margin:0;color:var(--muted)}
.nx-role{display:inline-flex;align-items:center;gap:5px;margin-top:5px;padding:2px 7px;border-radius:20px;
  font-size:8.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#0a7d5f;
  background:rgba(16,185,129,.1)}
.nx-menu{padding:8px;overflow-y:auto;overflow-x:hidden;min-height:0;flex:1}
.nx-menu-group{margin-bottom:8px}
.nx-menu-title{display:block;padding:6px 10px 5px;font-size:8.5px;font-weight:700;letter-spacing:1px;
  text-transform:uppercase;color:#93a0b4}
.nx-menu-item{position:relative;width:100%;border:1px solid transparent;background:transparent;border-radius:12px;
  padding:8px 9px;display:grid;grid-template-columns:32px minmax(0,1fr) 14px;align-items:center;gap:10px;
  text-align:left;color:#3b4761;cursor:pointer;margin-bottom:2px;transition:.16s}
.nx-menu-item:hover{background:#fff;border-color:var(--line-2);box-shadow:var(--shadow-s)}
.nx-menu-item.active{color:#b25506;background:linear-gradient(100deg,#fff2e0,#fffaf3);
  border-color:rgba(240,115,10,.22);box-shadow:0 6px 16px rgba(240,115,10,.1)}
.nx-menu-item.logout{color:#c33f45;margin-top:2px}
.nx-menu-item.logout:hover{background:#fff5f5;border-color:rgba(195,63,69,.2)}
.nx-menu-icon{width:32px;height:32px;border-radius:10px;background:rgba(16,28,50,.05);display:grid;
  place-items:center}
.nx-menu-item.active .nx-menu-icon{background:#fff;box-shadow:inset 0 0 0 1px rgba(240,115,10,.2)}
.nx-menu-item.logout .nx-menu-icon{background:rgba(195,63,69,.08)}
.nx-menu-copy{min-width:0}
.nx-menu-copy strong{display:block;font-size:11px;font-weight:650;line-height:1.3;overflow-wrap:anywhere}
.nx-menu-copy span{display:block;font-size:9px;color:#7d879a;line-height:1.4;margin-top:2px;overflow-wrap:anywhere}
.nx-menu-arrow{color:#b9c2cf;display:grid;place-items:center}
.nx-drawer-foot{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;
  border-top:1px solid var(--line);background:#fff;font-size:9.5px;color:var(--faint)}
.nx-drawer-foot span{display:inline-flex;align-items:center;gap:6px;font-weight:600}
.nx-drawer-foot b{font-weight:700;color:var(--ink-2);font-variant-numeric:tabular-nums}

/* ---- sheet ---- */
.nx-sheet{position:fixed;z-index:55;left:50%;bottom:0;transform:translateX(-50%);width:min(100%,560px);
  max-height:min(78vh,640px);border-radius:var(--r-xl) var(--r-xl) 0 0;background:#f7f9fc;
  box-shadow:0 -22px 70px rgba(12,22,40,.2);display:flex;flex-direction:column;overflow:hidden;
  animation:nxUp .28s cubic-bezier(.2,.8,.25,1)}
.nx-sheet-grip{width:38px;height:4px;border-radius:4px;background:rgba(16,28,50,.14);margin:8px auto 0}
.nx-sheet-head{padding:10px 14px 13px;display:flex;align-items:center;justify-content:space-between;gap:10px;
  border-bottom:1px solid var(--line);background:#fff}
.nx-sheet-head h2{font-size:15px;font-weight:700;margin:0;letter-spacing:-.3px}
.nx-sheet-head p{font-size:9.5px;color:var(--muted);margin:3px 0 0}
.nx-filters{display:flex;gap:6px;padding:10px 12px 4px;flex-wrap:wrap}
.nx-filter{border:1px solid var(--line);background:#fff;border-radius:20px;padding:4px 11px;font-size:9.5px;
  font-weight:650;color:#5b6880;cursor:pointer;transition:.16s}
.nx-filter:hover{border-color:rgba(240,115,10,.35);color:var(--brand)}
.nx-filter.active{color:#fff;border-color:transparent;background:linear-gradient(140deg,#ff9a3c,#ef6f08);
  box-shadow:0 5px 14px rgba(240,115,10,.24)}
.nx-notice-list{padding:8px 8px 14px;overflow-y:auto;overflow-x:hidden}
.nx-notice{position:relative;width:100%;text-align:left;cursor:pointer;display:grid;
  grid-template-columns:34px minmax(0,1fr);gap:11px;padding:10px;border-radius:13px;margin-bottom:6px;
  border:1px solid var(--line-2);background:#fff;box-shadow:var(--shadow-s);transition:.18s}
.nx-notice:hover{transform:translateY(-1px);box-shadow:var(--shadow-m)}
.nx-notice.unread{background:linear-gradient(140deg,#fff6ea,#fffdfa);border-color:rgba(240,115,10,.22)}
.nx-notice-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#fff;
  color:#d1690c;box-shadow:inset 0 0 0 1px rgba(16,28,50,.06)}
.nx-notice-copy{min-width:0}
.nx-notice h3{font-size:11px;font-weight:650;margin:0 0 3px;line-height:1.25;padding-right:12px}
.nx-notice p{font-size:9.5px;color:var(--muted);line-height:1.4;margin:0}
.nx-unread-dot{position:absolute;right:10px;top:11px;width:6px;height:6px;border-radius:50%;
  background:var(--brand);box-shadow:0 0 0 3px rgba(240,115,10,.14)}
.nx-empty{text-align:center;font-size:10px;color:var(--faint);padding:22px 0}

/* ---- modal / toast ---- */
.nx-modal-wrap{position:fixed;z-index:60;inset:0;display:grid;place-items:center;padding:18px}
.nx-modal{width:min(100%,364px);border-radius:var(--r-l);padding:20px;
  background:linear-gradient(170deg,#fff,#fbfcfe);border:1px solid var(--line);
  box-shadow:var(--shadow-l);animation:nxPop .22s cubic-bezier(.2,1.1,.35,1)}
.nx-modal-icon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:#d8434a;
  background:linear-gradient(145deg,#ffeef0,#fff8f8);box-shadow:inset 0 0 0 1px rgba(216,67,74,.14)}
.nx-modal h2{font-size:17px;font-weight:700;margin:13px 0 6px;letter-spacing:-.4px}
.nx-modal p{font-size:11px;line-height:1.55;color:var(--muted);margin:0}
.nx-modal-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px}
.nx-btn{border-radius:11px;padding:10px;border:1px solid var(--line);background:#fff;font-size:11px;
  font-weight:700;cursor:pointer;color:var(--ink-2);transition:.16s}
.nx-btn:hover{border-color:rgba(16,28,50,.18);box-shadow:var(--shadow-s)}
.nx-btn:active{transform:scale(.97)}
.nx-btn.danger{border-color:transparent;color:#fff;background:linear-gradient(140deg,#f05a60,#d0353c);
  box-shadow:0 8px 20px rgba(208,53,60,.26)}
.nx-toast{position:fixed;z-index:80;left:50%;bottom:86px;transform:translateX(-50%);display:flex;
  align-items:center;gap:8px;max-width:calc(100% - 28px);padding:9px 14px;border-radius:12px;
  background:rgba(14,22,38,.94);color:#fff;font-size:10.5px;font-weight:600;letter-spacing:.2px;
  box-shadow:0 14px 36px rgba(12,20,36,.28);animation:nxToast .26s cubic-bezier(.2,1.1,.35,1);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.nx-toast-dot{width:6px;height:6px;border-radius:50%;background:#48e0a5;flex:0 0 6px;
  box-shadow:0 0 8px rgba(72,224,165,.8)}
.nx-spin{display:grid;place-items:center;animation:nxSpin .8s linear infinite}

/* ---- keyframes ---- */
@keyframes nxFade{from{opacity:0}}
@keyframes nxSlide{from{transform:translateX(-100%)}}
@keyframes nxUp{from{transform:translate(-50%,100%)}}
@keyframes nxPop{from{opacity:0;transform:scale(.94)}}
@keyframes nxToast{from{opacity:0;transform:translate(-50%,10px)}}
@keyframes nxSpin{to{transform:rotate(360deg)}}
@keyframes nxPulse{0%{box-shadow:0 0 0 0 rgba(18,185,129,.4)}70%{box-shadow:0 0 0 7px rgba(18,185,129,0)}
  100%{box-shadow:0 0 0 0 rgba(18,185,129,0)}}
@keyframes nxScan{0%{transform:translateY(0);opacity:0}
  10%{opacity:.9}90%{opacity:.9}100%{transform:translateY(100vh);opacity:0}}

/* ---- responsive ---- */
@media(max-width:350px){
  .nx-shell{padding:0 10px}
  .nx-stats{gap:6px}
  .nx-stat{padding:9px 7px 8px}
  .nx-stat-value{font-size:19px}
  .nx-stat-label{font-size:9px}
  .nx-spark{height:20px}
  .nx-full{display:none}
  .nx-short{display:block}
  .nx-hero h1{font-size:23px}
  .nx-hero p{font-size:11px}
  .nx-hero-meter{display:none}
  .nx-alert{gap:7px;padding:9px 8px}
  .nx-alert p{font-size:9px}
}
@media(min-width:700px){
  .nx-shell{padding:0 22px}
  .nx-header{padding-top:20px}
  .nx-content-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:15px;align-items:start}
  .nx-section{margin-top:20px}
  .nx-stats{gap:12px}
  .nx-stat{padding:14px}
  .nx-stat-value{font-size:28px}
  .nx-stat-label{font-size:11px}
  .nx-spark{height:30px}
  .nx-stat-detail{font-size:9.5px}
  .nx-alert{padding:12px 14px}
  .nx-operations{gap:11px}
  .nx-bottom{bottom:16px}
  .nx-hero h1{font-size:30px}
  .nx-hero p{font-size:12.5px}
}
@media(min-width:980px){
  .nx-content-grid{grid-template-columns:1.2fr .8fr}
  .nx-operations{grid-template-columns:1fr}
  .nx-admin{padding-bottom:96px}
  .nx-hero h1{font-size:33px}
}
@media(prefers-reduced-motion:reduce){
  .nx-admin *,.nx-field *{animation-duration:.01ms!important;animation-iteration-count:1!important;
    transition-duration:.01ms!important}
  .nx-scan{display:none}
}
`;
