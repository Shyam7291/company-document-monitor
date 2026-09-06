import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Menu, X, Home, ListOrdered, ImageUp, Inbox, SquarePen,
  ChevronRight, UserRound, Boxes, Layers, Search, ShieldCheck, Eye,
  Image as ImageIcon, RefreshCw, Sparkles, Clock3
} from "lucide-react";

/* StoneRate · Sand Seller · Market Samples (samples uploaded by other sellers) */

// ─── Demo data (frontend only) ─────────────────────────────────────────────
const DEMO_SELLER = { ownerName: "Ramesh Kumar", yardName: "Sri Balaji Sand Yard", sellerId: "S100241" };

const DEMO_NOTIFICATIONS = [
  { id: "n1", title: "New StoneRate Order", message: "A new M-Sand request has been received.", type: "order", createdAt: new Date(Date.now() - 120000).toISOString(), read: false },
  { id: "n2", title: "Queue Update Required", message: "Token Q-018 is approaching its estimated loading time.", type: "queue", createdAt: new Date(Date.now() - 600000).toISOString(), read: false, tokenNumber: "Q-018" },
  { id: "n3", title: "Manual Entry Added", message: "Manual order for truck KA 01 AB 4521 was added.", type: "manual", createdAt: new Date(Date.now() - 1500000).toISOString(), read: true }
];

const hoursFromNow = h => new Date(Date.now() + h * 3600000).toISOString();

const DEMO_SAMPLES = [
  { id: "s1", sampleCode: "SMP-2041", materialName: "M-Sand", rate: 1450, rateUnit: "ton", permitCost: 320, availableQuantity: 120, quantityUnit: "ton", viewCount: 38, expiresAt: hoursFromNow(18), imageUrl: "https://sc02.alicdn.com/kf/A90a4f83cada04013a5afaa687e59f69eq.png", imagePositionX: 50, imagePositionY: 55 },
  { id: "s2", sampleCode: "SMP-2043", materialName: "River Sand", rate: 2100, rateUnit: "ton", permitCost: 450, availableQuantity: 80, quantityUnit: "ton", viewCount: 61, expiresAt: hoursFromNow(9), imageUrl: "https://sc02.alicdn.com/kf/A55eadd68b40b43f6bbee173e6c61f04dc.png", imagePositionX: 50, imagePositionY: 50 },
  { id: "s3", sampleCode: "SMP-2046", materialName: "P-Sand", rate: 1650, rateUnit: "ton", permitCost: 300, availableQuantity: 60, quantityUnit: "ton", viewCount: 22, expiresAt: hoursFromNow(22), imageUrl: "https://sc02.alicdn.com/kf/A3c725ae8094445d29bea8b37c7b946b6z.png", imagePositionX: 50, imagePositionY: 50 },
  { id: "s4", sampleCode: "SMP-2049", materialName: "M-Sand", rate: 1380, rateUnit: "ton", permitCost: 310, availableQuantity: 200, quantityUnit: "ton", viewCount: 74, expiresAt: hoursFromNow(5), imageUrl: "https://sc02.alicdn.com/kf/Af695bf11cf4c4698bf8dcd1782e8fc67E.png", imagePositionX: 50, imagePositionY: 60 },
  { id: "s5", sampleCode: "SMP-2052", materialName: "River Sand", rate: 2250, rateUnit: "ton", permitCost: 480, availableQuantity: 45, quantityUnit: "ton", viewCount: 17, expiresAt: hoursFromNow(14), imageUrl: "https://sc02.alicdn.com/kf/A5657051463404e49ba0bb58d778dfb5bo.png", imagePositionX: 50, imagePositionY: 50 },
  { id: "s6", sampleCode: "SMP-2055", materialName: "P-Sand", rate: 1590, rateUnit: "ton", permitCost: 290, availableQuantity: 95, quantityUnit: "ton", viewCount: 29, expiresAt: hoursFromNow(11), imageUrl: "https://sc02.alicdn.com/kf/A07b58a4276264638afd846e32d40425bT.png", imagePositionX: 50, imagePositionY: 45 }
];

// Default (demo) data sources – swap with real API calls via props (fetchSamples / recordView)
const demoFetchSamples = () => new Promise(resolve => setTimeout(() => resolve({ samples: DEMO_SAMPLES }), 600));
const demoRecordView = id => Promise.resolve({ viewCount: (DEMO_SAMPLES.find(s => s.id === id)?.viewCount || 0) + 1 });

const MATERIAL_FILTERS = ["All", "M-Sand", "P-Sand", "River Sand"];

// ─── Helpers ───────────────────────────────────────────────────────────────
const number = value => Number(value || 0).toLocaleString("en-IN");
const money = value => `₹${number(value)}`;
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"; };
const relativeTime = value => { const m = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000)); return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} hr ago`; };
const expiresIn = value => { if (!value) return "—"; const m = Math.max(0, Math.round((new Date(value).getTime() - Date.now()) / 60000)); return m < 60 ? `${m} min` : `${Math.round(m / 60)} hr`; };
const initials = name => (name || "").split(" ").filter(Boolean).map(x => x[0]).slice(0, 2).join("").toUpperCase();

const mapApiSample = sample => ({
  id: sample.id,
  sampleCode: sample.sampleCode,
  material: sample.materialName || sample.material,
  category: sample.category || sample.materialName,
  rate: Number(sample.rate || 0),
  rateUnit: sample.rateUnit || "ton",
  permitCost: Number(sample.permitCost || 0),
  quantity: Number(sample.availableQuantity || 0),
  quantityUnit: sample.quantityUnit || "ton",
  imageUrl: sample.imageUrl || "",
  imageZoom: Number(sample.imageZoom || 1),
  imagePositionX: Number(sample.imagePositionX ?? 50),
  imagePositionY: Number(sample.imagePositionY ?? 50),
  viewCount: Number(sample.viewCount || 0),
  expiresAt: sample.expiresAt,
  tag: MATERIAL_FILTERS.find(f => f !== "All" && (sample.materialName || "").toLowerCase().includes(f.toLowerCase())) || sample.materialName || "Other"
});

// ─── Shared UI (theme from StoneRateSandSellerHome) ────────────────────────
function Brand() { return <div className="brand"><i><Sparkles/></i><span>Stone</span><b>Rate</b></div>; }
function SectionTitle({ children, helper, eyebrow, right }) { return <div className="section-title"><div>{eyebrow && <small>{eyebrow}</small>}<h2>{children}</h2>{helper && <p>{helper}</p>}</div>{right}</div>; }

function Overlay({ open, onClose, className = "", children }) {
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = event => event.key === "Escape" && onClose();
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = old; document.removeEventListener("keydown", escape); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className={`overlay ${className}`} onMouseDown={e => e.target === e.currentTarget && onClose()}>{children}</div>;
}

function SideDrawer({ open, onClose, seller, pending, callbacks, returnFocusRef }) {
  const closeRef = useRef(null);
  useEffect(() => { if (open) setTimeout(() => closeRef.current?.focus(), 0); }, [open]);
  const close = () => { onClose(); setTimeout(() => returnFocusRef.current?.focus(), 0); };
  const items = [
    ["Home", Home, callbacks.onOpenHome], ["Queue", ListOrdered, callbacks.onOpenQueue],
    ["Market Samples", Layers, callbacks.onOpenSamples, true], ["Sample Upload", ImageUp, callbacks.onOpenSampleUpload],
    ["Pending Requests", Inbox, callbacks.onOpenPendingRequests], ["Manual Entry", SquarePen, callbacks.onOpenManualEntry]
  ];
  return <Overlay open={open} onClose={close} className="left-overlay"><aside className="drawer" role="dialog" aria-modal="true" aria-label="Seller navigation">
    <header><div><Brand/><small>SAND SELLER</small></div><button ref={closeRef} className="icon" onClick={close} aria-label="Close menu"><X/></button></header>
    <div className="seller"><i>{initials(seller.ownerName)}</i><div><b>{seller.ownerName}</b><span>{seller.yardName}</span><small>ID {seller.sellerId}</small></div></div>
    <nav>{items.map(([label, Icon, action, active]) => <button key={label} className={active ? "active" : ""} onClick={() => { close(); action?.(); }}><Icon/><span>{label}</span>{label === "Pending Requests" && pending > 0 && <b>{number(pending)}</b>}<ChevronRight className="chev"/></button>)}</nav>
    <footer className="drawer-foot"><span>StoneRate Seller Console</span><small>v2.0 · Light</small></footer>
  </aside></Overlay>;
}

function NotificationSheet({ open, onClose, items, setItems, onNotificationClick, onMarkAll, returnFocusRef }) {
  const closeRef = useRef(null);
  const unread = items.filter(x => !x.read).length;
  useEffect(() => { if (open) setTimeout(() => closeRef.current?.focus(), 0); }, [open]);
  const close = () => { onClose(); setTimeout(() => returnFocusRef.current?.focus(), 0); };
  const markAll = () => { setItems(list => list.map(x => ({ ...x, read: true }))); onMarkAll?.(); };
  const select = item => { setItems(list => list.map(x => x.id === item.id ? { ...x, read: true } : x)); onNotificationClick?.(item); };
  return <Overlay open={open} onClose={close} className="bottom-overlay"><section className="sheet" role="dialog" aria-modal="true">
    <i className="handle"/><header><div><h2>Notifications</h2><p>{unread} unread updates</p></div><div><button onClick={markAll} disabled={!unread}>Mark all as read</button><button ref={closeRef} className="icon" onClick={close} aria-label="Close notifications"><X/></button></div></header>
    <main>{items.length ? items.map(item => <button key={item.id} className={`note ${item.type} ${item.read ? "read" : "unread"}`} onClick={() => select(item)}><i>{item.type === "queue" ? <ListOrdered/> : item.type === "manual" ? <SquarePen/> : <Inbox/>}</i><span><b>{item.title}</b><em>{item.message}</em><small>{relativeTime(item.createdAt)}{item.tokenNumber ? ` · Token ${item.tokenNumber}` : ""}</small></span>{!item.read && <u/>}</button>) : <div className="empty"><Bell/><b>No notifications yet</b><span>New order and queue updates will appear here.</span></div>}</main>
  </section></Overlay>;
}

function BottomNav({ callbacks }) {
  const items = [["Samples", Layers, callbacks.onOpenSamples, true], ["Queue", ListOrdered, callbacks.onOpenQueue], ["Home", Home, callbacks.onOpenHome], ["My Sample", Boxes, callbacks.onOpenMySamples], ["Profile", UserRound, callbacks.onOpenProfile]];
  return <nav className="bottom-nav" aria-label="Primary"><div className="nav-pill">{items.map(([label, Icon, action, active]) => <button key={label} className={active ? "active" : ""} onClick={action} aria-current={active ? "page" : undefined}><span><Icon/></span><small>{label}</small></button>)}</div></nav>;
}

// ─── Sample card (ratio & content from SellerSamplesPage) ──────────────────
function SampleCard({ sample, onOpen }) {
  return <article className="sample-card">
    <button type="button" className="sample-photo" onClick={() => onOpen(sample)} aria-label={`View ${sample.material} sample image`}
      style={sample.imageUrl ? { backgroundImage: `url("${sample.imageUrl}")`, backgroundSize: `${sample.imageZoom * 100}%`, backgroundPosition: `${sample.imagePositionX}% ${sample.imagePositionY}%` } : undefined}>
      <span className="scan"/>
      <span className="anonymous-badge"><ShieldCheck/>Verified sample</span>
      <span className="views-badge"><Eye/>{number(sample.viewCount)}</span>
      <span className="view-image"><ImageIcon/>View image</span>
    </button>
    <div className="sample-content">
      <div className="material-title"><div><small>MATERIAL SAMPLE</small><h3>{sample.material}</h3></div><span><Layers/></span></div>
      <div className="price-panel">
        <div><span>CURRENT RATE</span><b>{money(sample.rate)} <small>/ {sample.rateUnit}</small></b></div>
        <div><span>PERMIT COST</span><b>{money(sample.permitCost)}</b></div>
      </div>
      <footer className="sample-meta"><span><Boxes/>{number(sample.quantity)} {sample.quantityUnit} available</span><span><Clock3/>Expires in {expiresIn(sample.expiresAt)}</span></footer>
    </div>
  </article>;
}

function ImagePreviewSheet({ sample, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => { if (sample) setTimeout(() => closeRef.current?.focus(), 0); }, [sample]);
  return <Overlay open={!!sample} onClose={onClose} className="bottom-overlay">{sample && <section className="sheet preview-sheet" role="dialog" aria-modal="true" aria-label={`${sample.material} sample preview`}>
    <i className="handle"/>
    <header><div><small className="eyebrow">ANONYMOUS MATERIAL SAMPLE</small><h2>{sample.material}</h2><p><Eye/>{number(sample.viewCount)} views · {sample.sampleCode}</p></div><div><button ref={closeRef} className="icon" onClick={onClose} aria-label="Close image preview"><X/></button></div></header>
    <div className="full-photo">{sample.imageUrl ? <img src={sample.imageUrl} alt={`${sample.material} original sample`}/> : <span><ImageIcon/>Material image unavailable</span>}</div>
    <div className="sheet-pricing">
      <article><span>CURRENT RATE</span><b>{money(sample.rate)} <small>/ {sample.rateUnit}</small></b></article>
      <article><span>PERMIT COST</span><b>{money(sample.permitCost)}</b></article>
      <article><span>AVAILABLE</span><b>{number(sample.quantity)} <small>{sample.quantityUnit}</small></b></article>
      <article><span>EXPIRES IN</span><b>{expiresIn(sample.expiresAt)}</b></article>
    </div>
    <p className="sheet-privacy"><ShieldCheck/>Seller identity and operational details are protected.</p>
  </section>}</Overlay>;
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function SandSellerSamplePage({
  seller = DEMO_SELLER, notifications = DEMO_NOTIFICATIONS, pendingRequests = 6,
  fetchSamples = demoFetchSamples, recordView = demoRecordView,
  onOpenHome, onOpenQueue, onOpenSamples, onOpenSampleUpload, onOpenPendingRequests, onOpenManualEntry,
  onOpenMySamples, onOpenProfile, onNotificationClick, onMarkAllNotificationsRead
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedSample, setSelectedSample] = useState(null);
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const menuRef = useRef(null), bellRef = useRef(null);

  useEffect(() => setLocalNotifications(notifications), [notifications]);
  const unread = localNotifications.filter(x => !x.read).length;
  const callbacks = { onOpenHome, onOpenQueue, onOpenSamples, onOpenSampleUpload, onOpenPendingRequests, onOpenManualEntry, onOpenMySamples, onOpenProfile };

  const loadSamples = async () => {
    try {
      setLoading(true); setLoadError("");
      const result = await fetchSamples();
      setSamples((result?.samples || []).map(mapApiSample));
    } catch (error) {
      setLoadError(error?.message || "Unable to load active samples.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadSamples(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Drop expired samples every minute (24-hour visibility window)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSamples(current => current.filter(s => !s.expiresAt || new Date(s.expiresAt).getTime() > Date.now()));
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const openSample = async sample => {
    setSelectedSample(sample);
    try {
      const result = await recordView(sample.id);
      const viewCount = Number(result?.viewCount || sample.viewCount);
      setSamples(current => current.map(item => item.id === sample.id ? { ...item, viewCount } : item));
      setSelectedSample(current => current?.id === sample.id ? { ...current, viewCount } : current);
    } catch (error) {
      console.error("Unable to record sample view:", error);
    }
  };

  const visibleSamples = useMemo(() => {
    const q = query.trim().toLowerCase();
    return samples.filter(s => (activeFilter === "All" || s.tag === activeFilter) && (!q || s.material.toLowerCase().includes(q)));
  }, [activeFilter, query, samples]);

  const marketSummary = useMemo(() => {
    if (!visibleSamples.length) return { lowest: 0, average: 0 };
    const rates = visibleSamples.map(s => s.rate);
    return { lowest: Math.min(...rates), average: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) };
  }, [visibleSamples]);

  return <div className="app"><style>{CSS}</style>
    <div className="bg-orb o1"/><div className="bg-orb o2"/><div className="bg-orb o3"/>
    <header className="top"><div><button ref={menuRef} className="icon" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu/></button><div className="hello"><span>{greeting()},</span><b>{seller.ownerName}</b></div></div><Brand/><button ref={bellRef} className="icon bell" onClick={() => setSheetOpen(true)} aria-label={`Open notifications, ${unread} unread`}><Bell/>{unread > 0 && <b>{unread}</b>}</button></header>

    <main className="content">
      <section className="hero"><div className="hero-card samples-hero"><span className="hero-glow"/><div className="hero-text"><small>Private market view</small><h1>Compare nearby material samples</h1><p>Review anonymous sample images, rates and permit costs before updating your own offer.</p><span className="privacy-chip"><ShieldCheck/>Identity protected</span></div></div></section>

      <section className="market-strip" aria-label="Market summary">
        <article><span>VISIBLE SAMPLES</span><b className="green">{number(visibleSamples.length)}</b></article>
        <article><span>LOWEST RATE</span><b>{money(marketSummary.lowest)} <small>/ ton</small></b></article>
        <article><span>AVERAGE RATE</span><b>{money(marketSummary.average)} <small>/ ton</small></b></article>
      </section>

      <section className="discovery-tools">
        <label className="search-box"><Search/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search material" aria-label="Search material samples"/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X/></button>}</label>
        <div className="filter-row" aria-label="Material filters">{MATERIAL_FILTERS.map(item => <button type="button" key={item} className={activeFilter === item ? "active" : ""} onClick={() => setActiveFilter(item)}>{item}</button>)}</div>
      </section>

      <section>
        <SectionTitle eyebrow="Active samples" helper="Samples uploaded by nearby sellers in the last 24 hours" right={<span className="live"><i/>LIVE</span>}>Current market view</SectionTitle>
        {loading && <div className="skeleton"><i/><i/></div>}
        {!loading && loadError && <div className="error"><span>{loadError}</span><button onClick={loadSamples}><RefreshCw/>Retry</button></div>}
        {!loading && !loadError && visibleSamples.length > 0 && <div className="sample-grid">{visibleSamples.map(sample => <SampleCard key={sample.id} sample={sample} onOpen={openSample}/>)}</div>}
        {!loading && !loadError && !visibleSamples.length && <div className="empty"><Search/><b>No matching samples</b><span>Try another material name or select a different filter.</span><button className="clear" type="button" onClick={() => { setQuery(""); setActiveFilter("All"); }}>Clear Filters</button></div>}
      </section>

      <div className="privacy-note"><ShieldCheck/><p><b>Protected comparison</b><span>Seller identity, contact information and exact operational location are hidden.</span></p></div>
    </main>

    <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} seller={seller} pending={pendingRequests} callbacks={callbacks} returnFocusRef={menuRef}/>
    <NotificationSheet open={sheetOpen} onClose={() => setSheetOpen(false)} items={localNotifications} setItems={setLocalNotifications} onNotificationClick={onNotificationClick} onMarkAll={onMarkAllNotificationsRead} returnFocusRef={bellRef}/>
    <ImagePreviewSheet sample={selectedSample} onClose={() => setSelectedSample(null)}/>
    <BottomNav callbacks={callbacks}/>
  </div>;
}

// ─── Styles (theme tokens from StoneRateSandSellerHome) ────────────────────
const CSS_PART_1 = `
:root{color-scheme:light}
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;font-family:"Plus Jakarta Sans",Inter,"Segoe UI",system-ui,sans-serif;background:#eceffd;color:#1b2340;-webkit-font-smoothing:antialiased}
button,input{font:inherit}
button{cursor:pointer}
.app{--ink:#1b2340;--muted:#6b7590;--line:rgba(120,135,180,.16);--indigo:#5b6cff;--violet:#8b5cf6;--cyan:#22c1ee;--mint:#22c58f;--amber:#f5a524;--rose:#ff6b8a;--grad:linear-gradient(135deg,#5b6cff 0%,#8b5cf6 55%,#22c1ee 100%);--card:rgba(255,255,255,.82);--shadow:0 12px 34px rgba(64,84,150,.10),0 2px 6px rgba(64,84,150,.05);position:relative;min-height:100dvh;padding-bottom:84px;overflow-x:hidden;background:linear-gradient(180deg,#eef0ff 0%,#e9edfb 40%,#e6f0fa 100%)}
.bg-orb{position:fixed;border-radius:50%;filter:blur(70px);opacity:.7;pointer-events:none;z-index:0;animation:float 14s ease-in-out infinite alternate}
.o1{width:340px;height:340px;left:-120px;top:-80px;background:radial-gradient(circle,#c3caff,transparent 70%)}
.o2{width:380px;height:380px;right:-140px;top:180px;background:radial-gradient(circle,#b9ecfb,transparent 70%);animation-delay:-5s}
.o3{width:320px;height:320px;left:30%;bottom:-120px;background:radial-gradient(circle,#dcd2ff,transparent 70%);animation-delay:-9s}
.app button:focus-visible,.app input:focus-visible{outline:3px solid rgba(91,108,255,.35);outline-offset:2px}
.top{position:sticky;top:0;z-index:40;height:64px;max-width:1180px;margin:auto;padding:0 12px;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.72);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);border-bottom:1px solid var(--line)}
.top>div{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:8px}
.top>.brand,.top>.bell{flex:none}
.icon{width:40px;height:40px;display:grid;place-items:center;flex:none;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.9);color:#3b4468;box-shadow:0 6px 16px rgba(64,84,150,.08);transition:transform .2s,box-shadow .2s,border-color .2s}
.icon:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(64,84,150,.14);border-color:rgba(91,108,255,.35)}
.icon:active{transform:scale(.95)}
.icon svg{width:19px;height:19px}
.hello{flex:1;min-width:0}.hello span,.hello b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hello span{font-size:9.5px;color:var(--muted);letter-spacing:.2px;line-height:1.2}
.hello b{font-size:12px;color:var(--ink);font-weight:800;line-height:1.25}
.brand{display:flex;align-items:center;gap:0;font-size:16px;font-weight:900;letter-spacing:-.6px;white-space:nowrap;line-height:1}
.brand i{width:22px;height:22px;margin-right:5px;display:grid;place-items:center;border-radius:7px;background:var(--grad);color:#fff;box-shadow:0 6px 14px rgba(91,108,255,.35)}
.brand i svg{width:13px;height:13px}
.brand span{color:var(--ink)}
.brand b{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.bell{position:relative;justify-self:end}
.bell>b{position:absolute;right:-5px;top:-6px;min-width:18px;height:18px;padding:0 4px;display:grid;place-items:center;border:2px solid #fff;border-radius:99px;background:linear-gradient(135deg,#ff6b8a,#ff8e53);color:#fff;font-size:9px;font-weight:800;box-shadow:0 4px 10px rgba(255,107,138,.45);animation:pop .5s cubic-bezier(.2,1.4,.4,1)}
.content{position:relative;z-index:1;max-width:1180px;margin:auto;padding:16px 12px 28px;display:flex;flex-direction:column;gap:22px}
.section-title{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:0 0 10px 2px}
.section-title small{display:inline-block;margin-bottom:4px;padding:3px 9px;border-radius:99px;background:rgba(91,108,255,.10);color:var(--indigo);font-size:9.5px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}
.section-title h2{margin:0;font-size:17px;font-weight:800;letter-spacing:-.4px;color:var(--ink)}
.section-title p{margin:3px 0 0;color:var(--muted);font-size:11.5px}
.live{display:flex;align-items:center;gap:5px;flex:none;margin-bottom:4px;padding:4px 9px;border-radius:99px;border:1px solid rgba(34,197,143,.35);background:rgba(34,197,143,.12);color:#0f8a63;font-size:8.5px;font-weight:800;letter-spacing:.4px}
.live i{width:6px;height:6px;border-radius:50%;background:#22c58f;box-shadow:0 0 8px #22c58f}
.hero-card{position:relative;overflow:hidden;display:flex;align-items:stretch;min-height:150px;padding:18px 18px 16px;border-radius:24px;background:var(--grad);color:#fff;box-shadow:0 18px 40px rgba(91,108,255,.30)}
.hero-glow{position:absolute;inset:0;z-index:2;pointer-events:none;border-radius:inherit;background:radial-gradient(circle at 0% 0%,rgba(255,255,255,.22),transparent 45%),radial-gradient(circle at 100% 100%,rgba(255,255,255,.16),transparent 40%),linear-gradient(180deg,rgba(24,28,62,0) 55%,rgba(24,28,62,.22) 100%)}
.hero-card:after{content:"";position:absolute;inset:0;z-index:2;border-radius:inherit;pointer-events:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 0 0 1px rgba(255,255,255,.14)}
.hero-text{position:relative;z-index:3;display:flex;flex-direction:column;align-items:flex-start;width:100%;max-width:520px;min-width:0}
.hero-card small{display:block;font-size:10.5px;opacity:.9;letter-spacing:.8px;text-transform:uppercase;font-weight:800;text-shadow:0 1px 8px rgba(30,30,80,.35)}
.hero-card h1{margin:5px 0 4px;font-size:19px;font-weight:800;letter-spacing:-.5px;line-height:1.15;text-shadow:0 2px 12px rgba(30,30,80,.35)}
.hero-card p{margin:0 0 12px;font-size:12px;opacity:.92;line-height:1.45;text-shadow:0 1px 8px rgba(30,30,80,.3)}
.privacy-chip{margin-top:auto;display:inline-flex;align-items:center;gap:6px;padding:7px 11px;border-radius:99px;background:rgba(255,255,255,.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.4);font-size:10.5px;font-weight:800;box-shadow:0 8px 22px rgba(27,35,64,.22)}
.privacy-chip svg{width:14px;height:14px}
.market-strip{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:1px;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--line);box-shadow:var(--shadow)}
.market-strip article{min-width:0;padding:12px 10px;background:var(--card);backdrop-filter:blur(14px)}
.market-strip span,.market-strip b{display:block}
.market-strip span{font-size:8px;letter-spacing:.06em;color:var(--muted);font-weight:800;white-space:nowrap}
.market-strip b{margin-top:6px;color:var(--indigo);font-size:15px;line-height:1;font-weight:900;letter-spacing:-.3px;white-space:nowrap}
.market-strip b.green{color:#12a877;font-size:22px}
.market-strip small{font-size:9px;font-weight:800;letter-spacing:0;color:var(--muted)}
.discovery-tools{display:grid;gap:9px}
.search-box{height:44px;display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.9);color:#7a83a3;box-shadow:0 8px 20px rgba(64,84,150,.08)}
.search-box>svg{width:18px;height:18px;flex:none}
.search-box input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--ink);font-size:12px}
.search-box button{width:28px;height:28px;border:0;border-radius:9px;background:rgba(91,108,255,.10);color:var(--indigo);display:grid;place-items:center}
.search-box button svg{width:14px;height:14px}
.filter-row{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.filter-row::-webkit-scrollbar{display:none}
.filter-row button{flex:0 0 auto;height:32px;padding:0 13px;border:1px solid rgba(91,108,255,.18);border-radius:999px;background:rgba(255,255,255,.88);color:#5a6383;font-size:10px;font-weight:700;transition:transform .2s,box-shadow .2s}
.filter-row button:hover{transform:translateY(-1px)}
.filter-row button.active{border-color:transparent;color:#fff;background:var(--grad);box-shadow:0 8px 18px rgba(91,108,255,.30)}
`;

const CSS_PART_2 = `
.sample-grid{display:grid;grid-template-columns:1fr;gap:15px}
.sample-card{overflow:hidden;border:1px solid rgba(255,255,255,.9);border-radius:22px;background:var(--card);backdrop-filter:blur(14px);box-shadow:var(--shadow);transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s}
.sample-card:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(64,84,150,.16)}
.sample-photo{position:relative;display:block;width:100%;aspect-ratio:1.72/1;border:0;padding:0;background-color:#dfe3f4;background-size:cover;background-position:center;background-repeat:no-repeat;overflow:hidden}
.sample-photo:after{content:"";position:absolute;inset:45% 0 0;background:linear-gradient(transparent,rgba(15,18,31,.72))}
.scan{position:absolute;z-index:2;left:0;right:0;height:32px;background:linear-gradient(transparent,rgba(34,193,238,.22),transparent);animation:scan 5s linear infinite}
.anonymous-badge,.views-badge,.view-image{position:absolute;z-index:3;display:flex;align-items:center;gap:4px;border-radius:999px;color:#fff;font-size:8.5px;font-weight:800}
.anonymous-badge svg,.views-badge svg,.view-image svg{width:12px;height:12px}
.anonymous-badge{left:11px;top:11px;padding:6px 9px;background:linear-gradient(135deg,#22c58f,#10b981);box-shadow:0 6px 14px rgba(34,197,143,.35)}
.views-badge{right:11px;top:11px;padding:5px 8px;border:1px solid rgba(255,255,255,.34);background:rgba(24,22,40,.58);backdrop-filter:blur(8px)}
.view-image{right:11px;bottom:10px;padding:5px 9px;border:1px solid rgba(255,255,255,.34);background:rgba(24,22,40,.58);backdrop-filter:blur(8px)}
.sample-content{padding:13px}
.material-title{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.material-title small{display:block;color:var(--muted);font-size:7.5px;letter-spacing:.13em;font-weight:800}
.material-title h3{margin:3px 0 0;font-size:15px;font-weight:800;letter-spacing:-.3px;color:var(--ink)}
.material-title>span{width:30px;height:30px;flex:none;display:grid;place-items:center;border-radius:10px;color:#fff;background:var(--grad);box-shadow:0 6px 14px rgba(91,108,255,.30)}
.material-title>span svg{width:15px;height:15px}
.price-panel{display:grid;grid-template-columns:1fr 1fr;margin-top:12px;border:1px solid var(--line);border-radius:14px;background:rgba(248,249,255,.9);overflow:hidden}
.price-panel>div{padding:11px}
.price-panel>div+div{border-left:1px solid var(--line)}
.price-panel span,.price-panel b{display:block}
.price-panel span{font-size:7.5px;color:var(--muted);letter-spacing:.08em;font-weight:800}
.price-panel b{margin-top:4px;font-size:14px;font-weight:900;letter-spacing:-.3px;color:#e0891a}
.price-panel>div:last-child b{color:var(--indigo)}
.price-panel small{font-size:8.5px;font-weight:700;color:var(--muted);letter-spacing:0}
.sample-meta{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)}
.sample-meta span{display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:700;color:#3b4468}
.sample-meta svg{width:12px;height:12px;color:var(--muted)}
.empty{display:grid;place-items:center;gap:6px;padding:28px 16px;border:1.5px dashed rgba(91,108,255,.25);border-radius:22px;background:rgba(255,255,255,.6);text-align:center;color:var(--muted)}
.empty svg{width:30px;height:30px;color:var(--indigo)}
.empty b{color:var(--ink);font-size:13px}
.empty span{font-size:11px}
.empty .clear{margin-top:8px;padding:10px 16px;border:0;border-radius:12px;background:var(--grad);color:#fff;font-weight:800;font-size:11px;box-shadow:0 10px 22px rgba(91,108,255,.28)}
.error{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid rgba(255,107,138,.3);border-radius:16px;background:rgba(255,107,138,.08);color:#a8203f;font-size:12px;font-weight:600}
.error button{display:flex;align-items:center;gap:6px;padding:8px 12px;border:0;border-radius:12px;background:#ff6b8a;color:#fff;font-weight:700;font-size:12px}
.error svg{width:14px;height:14px}
.skeleton{display:grid;gap:15px}
.skeleton i{display:block;height:260px;border-radius:22px;background:linear-gradient(90deg,#eef1fa 25%,#f8faff 50%,#eef1fa 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
.privacy-note{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border:1px solid rgba(34,193,238,.30);border-radius:16px;color:#2c5f7c;background:rgba(34,193,238,.08)}
.privacy-note>svg{width:18px;height:18px;flex:none;color:#1a9bc4}
.privacy-note p{margin:0}
.privacy-note b,.privacy-note span{display:block}
.privacy-note b{font-size:11px;font-weight:800}
.privacy-note span{margin-top:3px;font-size:10px;line-height:1.45}
.bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:45;padding:0 14px calc(8px + env(safe-area-inset-bottom));pointer-events:none}
.nav-pill{pointer-events:auto;position:relative;max-width:520px;margin:auto;display:grid;grid-template-columns:repeat(5,1fr);align-items:end;padding:4px 6px 3px;border-radius:22px;background:rgba(255,255,255,.78);backdrop-filter:blur(24px) saturate(170%);-webkit-backdrop-filter:blur(24px) saturate(170%);border:1px solid rgba(255,255,255,.95);box-shadow:0 18px 44px rgba(64,84,150,.20),0 1px 0 rgba(255,255,255,.9) inset}
.nav-pill button{position:relative;display:grid;justify-items:center;gap:1px;padding:3px 2px 3px;border:0;background:transparent;color:#7a83a3;border-radius:16px;transition:color .2s,transform .2s}
.nav-pill button span{width:30px;height:30px;display:grid;place-items:center;border-radius:11px;transition:background .25s,transform .25s,box-shadow .25s}
.nav-pill button svg{width:18px;height:18px}
.nav-pill button small{font-size:9px;font-weight:700;letter-spacing:.2px;line-height:1.1}
.nav-pill button:hover{color:var(--indigo)}
.nav-pill button:hover span{background:rgba(91,108,255,.10)}
.nav-pill button:active span{transform:scale(.92)}
.nav-pill button.active{color:var(--indigo)}
.nav-pill button.active span{width:44px;height:44px;margin-top:-22px;border-radius:16px;background:var(--grad);color:#fff;border:3px solid #eceffd;box-shadow:0 12px 24px rgba(91,108,255,.45)}
.nav-pill button.active svg{width:20px;height:20px}
.nav-pill button.active small{font-weight:800}
.nav-pill button.active:after{content:"";position:absolute;bottom:-1px;width:16px;height:3px;border-radius:99px;background:var(--grad)}
.overlay{position:fixed;inset:0;z-index:60;display:flex;background:rgba(27,35,64,.38);backdrop-filter:blur(6px);animation:fade .25s}
.left-overlay{justify-content:flex-start}
.bottom-overlay{align-items:flex-end;justify-content:center}
.drawer{display:flex;flex-direction:column;width:min(86vw,330px);height:100%;padding:18px 16px;background:linear-gradient(180deg,#ffffff,#f6f8ff);box-shadow:24px 0 60px rgba(27,35,64,.22);animation:drawer .32s cubic-bezier(.2,.8,.2,1)}
.drawer header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.drawer header small{display:block;margin-top:2px;font-size:9.5px;font-weight:800;letter-spacing:1.2px;color:var(--muted)}
.seller{display:flex;align-items:center;gap:12px;margin:20px 0 16px;padding:14px;border-radius:20px;background:var(--grad);color:#fff;box-shadow:0 14px 30px rgba(91,108,255,.30)}
.seller i{width:46px;height:46px;flex:none;display:grid;place-items:center;border-radius:15px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.4);font-style:normal;font-weight:900;font-size:15px}
.seller div{min-width:0}
.seller b,.seller span,.seller small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.seller b{font-size:14px;font-weight:800}
.seller span{font-size:11px;opacity:.92}
.seller small{margin-top:3px;font-size:9.5px;opacity:.8;letter-spacing:.4px}
.drawer nav{display:grid;gap:6px}
.drawer nav button{display:flex;align-items:center;gap:12px;padding:12px 12px;border:1px solid transparent;border-radius:16px;background:transparent;color:#3b4468;font-weight:700;font-size:13.5px;text-align:left;transition:background .2s,transform .2s,border-color .2s}
.drawer nav button svg{width:19px;height:19px;color:#7a83a3}
.drawer nav button span{flex:1}
.drawer nav button .chev{width:16px;height:16px;opacity:.5}
.drawer nav button:hover{background:rgba(91,108,255,.08);border-color:rgba(91,108,255,.15)}
.drawer nav button.active{background:linear-gradient(135deg,rgba(91,108,255,.14),rgba(34,193,238,.12));border-color:rgba(91,108,255,.25);color:var(--indigo)}
.drawer nav button.active svg{color:var(--indigo)}
.drawer nav button b{min-width:22px;height:22px;padding:0 7px;display:grid;place-items:center;border-radius:99px;background:linear-gradient(135deg,#ff6b8a,#ff8e53);color:#fff;font-size:10px}
.drawer-foot{margin-top:auto;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);font-weight:600}
.sheet{width:100%;max-width:640px;max-height:88dvh;display:flex;flex-direction:column;padding:10px 16px 20px;border-radius:28px 28px 0 0;background:linear-gradient(180deg,#ffffff,#f7f9ff);box-shadow:0 -20px 60px rgba(27,35,64,.22);animation:sheet .32s cubic-bezier(.2,.8,.2,1)}
.handle{display:block;width:44px;height:5px;margin:0 auto 12px;border-radius:99px;background:#d8dded}
.sheet header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.sheet header h2{margin:0;font-size:17px;font-weight:800;letter-spacing:-.3px}
.sheet header p{display:flex;align-items:center;gap:5px;margin:2px 0 0;font-size:11px;color:var(--muted);font-weight:600}
.sheet header p svg{width:13px;height:13px}
.sheet header .eyebrow{display:block;margin-bottom:2px;font-size:7.5px;letter-spacing:.13em;color:var(--muted);font-weight:800}
.sheet header div{display:flex;align-items:center;gap:8px}
.sheet header>div:first-child{display:block;min-width:0}
.sheet header button:not(.icon){padding:8px 12px;border:1px solid rgba(91,108,255,.25);border-radius:12px;background:rgba(91,108,255,.08);color:var(--indigo);font-weight:700;font-size:11px}
.sheet header button:not(.icon):disabled{opacity:.45;cursor:default}
.sheet main{overflow-y:auto;display:grid;gap:8px;padding-top:12px}
.note{position:relative;display:flex;align-items:flex-start;gap:12px;padding:12px;border:1px solid var(--line);border-radius:18px;background:#fff;text-align:left;color:var(--ink);transition:transform .2s,box-shadow .2s}
.note:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(64,84,150,.12)}
.note.unread{background:linear-gradient(135deg,rgba(91,108,255,.07),rgba(34,193,238,.06));border-color:rgba(91,108,255,.22)}
.note i{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:13px;color:#fff;background:var(--grad)}
.note.queue i{background:linear-gradient(135deg,#f5a524,#ff7a59)}
.note.manual i{background:linear-gradient(135deg,#8b5cf6,#c084fc)}
.note i svg{width:18px;height:18px}
.note span{flex:1;min-width:0;display:grid;gap:2px}
.note b{font-size:13px;font-weight:800}
.note em{font-size:11.5px;font-style:normal;color:#4e5876;line-height:1.4}
.note small{font-size:10px;color:var(--muted);font-weight:600}
.note u{position:absolute;right:14px;top:14px;width:9px;height:9px;border-radius:50%;background:var(--indigo);box-shadow:0 0 0 4px rgba(91,108,255,.18)}
.preview-sheet{overflow-y:auto}
.full-photo{position:relative;width:100%;min-height:240px;max-height:56dvh;margin-top:14px;display:grid;place-items:center;overflow:hidden;border-radius:18px;background:#0b0d15;box-shadow:0 14px 30px rgba(27,35,64,.22)}
.full-photo>img{display:block;width:100%;height:auto;max-height:56dvh;object-fit:contain;object-position:center}
.full-photo>span{display:flex;align-items:center;gap:6px;color:#fff;font-size:10px;font-weight:700}
.full-photo>span svg{width:16px;height:16px}
.sheet-pricing{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}
.sheet-pricing article{padding:11px;border:1px solid var(--line);border-radius:14px;background:#fff}
.sheet-pricing span,.sheet-pricing b{display:block}
.sheet-pricing span{font-size:7.5px;color:var(--muted);letter-spacing:.08em;font-weight:800}
.sheet-pricing b{margin-top:4px;font-size:14px;font-weight:900;color:var(--indigo)}
.sheet-pricing article:first-child b{color:#e0891a}
.sheet-pricing small{font-size:8.5px;font-weight:700;color:var(--muted)}
.sheet-privacy{display:flex;align-items:center;gap:6px;margin:12px 0 0;padding:10px;border-radius:12px;color:#2c5f7c;background:rgba(34,193,238,.08);font-size:10px;font-weight:600}
.sheet-privacy svg{width:14px;height:14px;color:#1a9bc4}
@media(min-width:700px){.app{padding-bottom:36px}.top{height:80px;padding:0 24px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}.top>.bell{justify-self:end}.hello span{font-size:11px}.hello b{font-size:14px;max-width:220px}.brand{font-size:20px}.brand i{width:26px;height:26px}.content{padding:28px 24px 44px;gap:30px}.section-title h2{font-size:21px}.hero-card{min-height:190px;padding:28px 26px 24px;border-radius:28px}.hero-card h1{font-size:26px}.hero-card p{font-size:14px;margin-bottom:16px}.market-strip article{padding:16px 18px}.market-strip b{font-size:20px}.market-strip b.green{font-size:28px}.discovery-tools{grid-template-columns:minmax(0,360px) 1fr;align-items:center;gap:14px}.filter-row button{height:36px;padding:0 16px;font-size:11px}.sample-grid{grid-template-columns:repeat(2,1fr);gap:16px}.skeleton{grid-template-columns:repeat(2,1fr)}.bottom-nav{display:none}.sheet{margin-bottom:20px;border-radius:28px}}
@media(min-width:1000px){.sample-grid{grid-template-columns:repeat(3,1fr)}.skeleton{grid-template-columns:repeat(3,1fr)}}
@media(max-width:370px){.market-strip b{font-size:13px}.market-strip b.green{font-size:19px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@keyframes drawer{from{transform:translateX(-100%)}}
@keyframes sheet{from{transform:translateY(100%)}}
@keyframes fade{from{opacity:0}}
@keyframes pop{from{transform:scale(0)}}
@keyframes shimmer{to{background-position:-200% 0}}
@keyframes float{to{transform:translate(30px,40px) scale(1.08)}}
@keyframes scan{from{top:-32px}to{top:100%}}
`;

const CSS = CSS_PART_1 + CSS_PART_2;
