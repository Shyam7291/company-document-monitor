import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Menu, X, Home, ListOrdered, ImageUp, Inbox, SquarePen,
  Truck, PackageOpen, CheckCircle2, Clock3, ChevronRight,
  UserRound, Boxes, Mountain, RefreshCw, Sparkles
} from "lucide-react";

const DEMO = {
  seller: { ownerName: "Ramesh Kumar", yardName: "Sri Balaji Sand Yard", sellerId: "S100241" },
  notifications: [
    { id: "n1", title: "New StoneRate Order", message: "A new M-Sand request has been received.", type: "order", createdAt: new Date(Date.now() - 120000).toISOString(), read: false },
    { id: "n2", title: "Queue Update Required", message: "Token Q-018 is approaching its estimated loading time.", type: "queue", createdAt: new Date(Date.now() - 600000).toISOString(), read: false, tokenNumber: "Q-018" },
    { id: "n3", title: "Manual Entry Added", message: "Manual order for truck KA 01 AB 4521 was added.", type: "manual", createdAt: new Date(Date.now() - 1500000).toISOString(), read: true }
  ],
  totalMaterialOrders: [
    { id: "m-sand", materialName: "M-Sand", buckets: 1850, trucks: 42 },
    { id: "p-sand", materialName: "P-Sand", buckets: 940, trucks: 21 },
    { id: "river-sand", materialName: "River Sand", buckets: 520, trucks: 11 }
  ],
  todaySummary: {
    totalOrders: 24, totalTrucks: 20, totalBuckets: 1080,
    pendingToLoad: 9, pendingTrucks: 8, pendingBuckets: 400,
    loadedOrders: 15, loadedTrucks: 12, loadedBuckets: 680,
    pendingRequests: 6
  },
  upcomingLoading: [
    { id: "l1", truckNumber: "KA 53 MG 4821", customerName: "Sri Ganesh Traders", quantityBuckets: 50, tokenNumber: "Q-018", estimatedTime: new Date(Date.now() + 1200000).toISOString(), source: "stonerate", status: "next" },
    { id: "l2", truckNumber: "KA 01 AB 4521", customerName: "Lakshmi Constructions", quantityBuckets: 40, tokenNumber: "Q-019", estimatedTime: new Date(Date.now() + 2700000).toISOString(), source: "manual", status: "waiting" },
    { id: "l3", truckNumber: "KA 40 MN 9087", customerName: "Venkateshwara Infra", quantityBuckets: 60, tokenNumber: "Q-020", estimatedTime: new Date(Date.now() + 4500000).toISOString(), source: "stonerate", status: "waiting" }
  ]
};

const number = value => Number(value || 0).toLocaleString("en-IN");
const formatTime = value => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(value));
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"; };
const relativeTime = value => { const m = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000)); return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} hr ago`; };
const initials = name => (name || "").split(" ").filter(Boolean).map(x => x[0]).slice(0, 2).join("").toUpperCase();

function Brand() { return <div className="brand"><i><Sparkles/></i><span>Stone</span><b>Rate</b></div>; }
function SectionTitle({ children, helper, eyebrow }) { return <div className="section-title">{eyebrow && <small>{eyebrow}</small>}<h2>{children}</h2>{helper && <p>{helper}</p>}</div>; }

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
    ["Home", Home, callbacks.onOpenHome, true], ["Queue", ListOrdered, callbacks.onOpenQueue],
    ["Sample Upload", ImageUp, callbacks.onOpenSampleUpload], ["Pending Requests", Inbox, callbacks.onOpenPendingRequests],
    ["Manual Entry", SquarePen, callbacks.onOpenManualEntry]
  ];
  return <Overlay open={open} onClose={close} className="left-overlay"><aside className="drawer" role="dialog" aria-modal="true" aria-label="Seller navigation">
    <header><div><Brand/><small>SAND SELLER</small></div><button ref={closeRef} className="icon" onClick={close} aria-label="Close menu"><X/></button></header>
    <div className="seller"><i>{initials(seller.ownerName)}</i><div><b>{seller.ownerName}</b><span>{seller.yardName}</span><small>ID {seller.sellerId}</small></div></div>
    <nav>{items.map(([label, Icon, action, active]) => <button key={label} className={active ? "active" : ""} onClick={() => { close(); action?.(); }}><Icon/><span>{label}</span>{label === "Pending Requests" && pending > 0 && <b>{number(pending)}</b>}<ChevronRight className="chev"/></button>)}</nav>
    <footer className="drawer-foot"><span>StoneRate Seller Console</span><small>v2.0 · Sunset</small></footer>
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
  const items = [["Sample", ImageUp, callbacks.onOpenSampleUpload], ["Queue", ListOrdered, callbacks.onOpenQueue], ["Home", Home, callbacks.onOpenHome, true], ["My Sample", Boxes, callbacks.onOpenMySamples], ["Profile", UserRound, callbacks.onOpenProfile]];
  return <nav className="bottom-nav" aria-label="Primary"><div className="nav-pill">{items.map(([label, Icon, action, active]) => <button key={label} className={active ? "active" : ""} onClick={action} aria-current={active ? "page" : undefined}><span><Icon/></span><small>{label}</small></button>)}</div></nav>;
}

function MaterialCard({ item, index, onClick }) {
  return <button className={`material c${index}`} onClick={() => onClick?.(item)}><i><Mountain/></i><div><h3>{item.materialName}</h3><strong>{number(item.buckets)}</strong><small>Buckets</small><p><Truck/>{number(item.trucks)} Trucks</p></div><u className="glow"/></button>;
}

function MetricCard({ tone, icon: Icon, value, label, trucks, buckets }) {
  return <article className={`metric ${tone}`}><div className="metric-top"><i><Icon/></i><strong>{number(value)}</strong></div><b>{label}</b><div className="metric-details"><span><Truck/>{number(trucks)} Trucks</span><span><Boxes/>{number(buckets)} Buckets</span></div></article>;
}

function LoadingCard({ item, onOpen }) {
  const labels = { next: "Next", waiting: "Waiting", loading: "Loading Now", delayed: "Delayed" };
  return <button className={`loading-card ${item.status}`} onClick={() => onOpen?.(item.id)}><header><b><Truck/>{item.truckNumber}</b><em className={item.source}>{item.source === "stonerate" ? "By StoneRate" : "Manual"}</em></header><h3>{item.customerName}</h3><strong>{number(item.quantityBuckets)} <small>Buckets</small></strong><footer><span>Token {item.tokenNumber}</span><span><Clock3/>Est. {formatTime(item.estimatedTime)}</span></footer><i className={`status ${item.status}`}>{labels[item.status] || "Waiting"}</i></button>;
}

export default function StoneRateSandSellerHome({
  seller = DEMO.seller, notifications = DEMO.notifications,
  totalMaterialOrders = DEMO.totalMaterialOrders, todaySummary = DEMO.todaySummary,
  upcomingLoading = DEMO.upcomingLoading, loading = false, error = "",
  onOpenHome, onOpenQueue, onOpenSampleUpload, onOpenPendingRequests, onOpenManualEntry,
  onOpenLoadingDetails, onNotificationClick, onMarkAllNotificationsRead, onRefresh,
  onOpenMySamples, onOpenProfile, onOpenMaterial
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [refreshing, setRefreshing] = useState(false);
  const menuRef = useRef(null), bellRef = useRef(null);
  useEffect(() => setLocalNotifications(notifications), [notifications]);
  const unread = localNotifications.filter(x => !x.read).length;
  const loadingEntries = useMemo(() => [...(upcomingLoading || [])].sort((a, b) => new Date(a.estimatedTime) - new Date(b.estimatedTime)).slice(0, 3), [upcomingLoading]);
  const callbacks = { onOpenHome, onOpenQueue, onOpenSampleUpload, onOpenPendingRequests, onOpenManualEntry, onOpenMySamples, onOpenProfile };
  const retry = async () => { setRefreshing(true); try { await onRefresh?.(); } finally { setRefreshing(false); } };

  return <div className="app"><style>{CSS}</style>
    <div className="bg-orb o1"/><div className="bg-orb o2"/><div className="bg-orb o3"/>
    <header className="top"><div><button ref={menuRef} className="icon" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu/></button><div className="hello"><span>{greeting()},</span><b>{seller.ownerName}</b></div></div><Brand/><button ref={bellRef} className="icon bell" onClick={() => setSheetOpen(true)} aria-label={`Open notifications, ${unread} unread`}><Bell/>{unread > 0 && <b>{unread}</b>}</button></header>
    <main className="content">
      {error && <div className="error"><span>Unable to load the latest dashboard information.</span><button onClick={retry}><RefreshCw className={refreshing ? "spin" : ""}/>Retry</button></div>}
      {loading ? <div className="skeleton"><i/><div><i/><i/></div><div><i/><i/></div></div> : <>
        <section className="hero"><div className="hero-card"><div><small>{seller.yardName}</small><h1>Your yard at a glance</h1><p>Track orders, queue and loading in real time.</p></div><div className="hero-stat"><strong>{number(todaySummary?.totalOrders)}</strong><span>orders today</span></div></div></section>
        <section><SectionTitle eyebrow="Materials">Total Orders</SectionTitle><div className="card-scroll">{totalMaterialOrders?.map((item, index) => <MaterialCard key={item.id} item={item} index={index} onClick={onOpenMaterial}/>)}</div></section>
        <section><SectionTitle eyebrow="Today">Today’s Orders</SectionTitle><div className="card-scroll">
          <MetricCard tone="blue" icon={PackageOpen} value={todaySummary?.totalOrders} label="Orders Today" trucks={todaySummary?.totalTrucks} buckets={todaySummary?.totalBuckets}/>
          <MetricCard tone="amber" icon={Clock3} value={todaySummary?.pendingToLoad} label="Pending to Load" trucks={todaySummary?.pendingTrucks} buckets={todaySummary?.pendingBuckets}/>
          <MetricCard tone="green" icon={CheckCircle2} value={todaySummary?.loadedOrders} label="Loaded" trucks={todaySummary?.loadedTrucks} buckets={todaySummary?.loadedBuckets}/>
        </div><button className="pending" disabled={!todaySummary?.pendingRequests} onClick={onOpenPendingRequests}><i><Inbox/></i><span>{todaySummary?.pendingRequests ? "See the pending requests" : "No pending requests"}</span>{todaySummary?.pendingRequests > 0 && <><b>{number(todaySummary.pendingRequests)}</b><ChevronRight/></>}</button></section>
        <section><SectionTitle eyebrow="Queue" helper="Upcoming loading schedule">Recent Loading</SectionTitle>{loadingEntries.length ? <div className="loading-grid">{loadingEntries.map(item => <LoadingCard key={item.id} item={item} onOpen={onOpenLoadingDetails}/>)}</div> : <div className="empty"><Truck/><b>No loading scheduled</b><span>New queue assignments will appear here.</span></div>}<button className="view-queue" onClick={onOpenQueue}>View Full Queue <ChevronRight/></button></section>
      </>}
    </main>
    <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} seller={seller} pending={todaySummary?.pendingRequests || 0} callbacks={callbacks} returnFocusRef={menuRef}/>
    <NotificationSheet open={sheetOpen} onClose={() => setSheetOpen(false)} items={localNotifications} setItems={setLocalNotifications} onNotificationClick={onNotificationClick} onMarkAll={onMarkAllNotificationsRead} returnFocusRef={bellRef}/>
    <BottomNav callbacks={callbacks}/>
  </div>;
}

const CSS = `
:root{color-scheme:light}
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;font-family:"Plus Jakarta Sans",Inter,"Segoe UI",system-ui,sans-serif;background:#fdf0eb;color:#2a1f2e;-webkit-font-smoothing:antialiased}
button{font:inherit;cursor:pointer}
.app{--ink:#2a1f2e;--muted:#8a7080;--line:rgba(210,140,130,.2);--coral:#ff6a5c;--pink:#ff8fb1;--peach:#ffb347;--mint:#22c58f;--amber:#f5a524;--rose:#e0355f;--grad:linear-gradient(135deg,#ff6a5c 0%,#ff8fb1 55%,#ffb347 100%);--card:rgba(255,255,255,.82);--shadow:0 12px 34px rgba(170,90,80,.10),0 2px 6px rgba(170,90,80,.05);position:relative;min-height:100dvh;padding-bottom:84px;overflow-x:hidden;background:linear-gradient(180deg,#fff3ec 0%,#fde8e2 45%,#fbe3e7 100%)}
.bg-orb{position:fixed;border-radius:50%;filter:blur(70px);opacity:.7;pointer-events:none;z-index:0;animation:float 14s ease-in-out infinite alternate}
.o1{width:320px;height:320px;left:-120px;top:-80px;background:radial-gradient(circle,#ffc9b8,transparent 70%)}
.o2{width:360px;height:360px;right:-140px;top:180px;background:radial-gradient(circle,#ffdca8,transparent 70%);animation-delay:-5s}
.o3{width:300px;height:300px;left:30%;bottom:-120px;background:radial-gradient(circle,#ffc3d6,transparent 70%);animation-delay:-9s}
.app button:focus-visible{outline:3px solid rgba(255,106,92,.35);outline-offset:2px}
.top{position:sticky;top:0;z-index:40;height:64px;max-width:1180px;margin:auto;padding:0 12px;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.72);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);border-bottom:1px solid var(--line)}
.top>div{flex:1 1 0;min-width:0;display:flex;align-items:center;gap:8px}
.top>.brand,.top>.bell{flex:none}
.icon{width:40px;height:40px;display:grid;place-items:center;flex:none;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.9);color:#4a3a45;box-shadow:0 6px 16px rgba(170,90,80,.08);transition:transform .2s,box-shadow .2s,border-color .2s}
.icon:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(170,90,80,.14);border-color:rgba(255,106,92,.35)}
.icon:active{transform:scale(.95)}
.icon svg{width:19px;height:19px}
.hello{flex:1;min-width:0}.hello span,.hello b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hello span{font-size:9.5px;color:var(--muted);letter-spacing:.2px;line-height:1.2}
.hello b{font-size:12px;color:var(--ink);font-weight:800;line-height:1.25}
.brand{display:flex;align-items:center;gap:0;font-size:16px;font-weight:900;letter-spacing:-.6px;white-space:nowrap;line-height:1}
.brand i{width:22px;height:22px;margin-right:5px;display:grid;place-items:center;border-radius:7px;background:var(--grad);color:#fff;box-shadow:0 6px 14px rgba(255,106,92,.35)}
.brand i svg{width:13px;height:13px}
.brand span{color:var(--ink)}
.brand b{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.bell{position:relative;justify-self:end}
.bell>b{position:absolute;right:-5px;top:-6px;min-width:18px;height:18px;padding:0 4px;display:grid;place-items:center;border:2px solid #fff;border-radius:99px;background:linear-gradient(135deg,#d6336c,#ff5c7a);color:#fff;font-size:9px;font-weight:800;box-shadow:0 4px 10px rgba(214,51,108,.45);animation:pop .5s cubic-bezier(.2,1.4,.4,1)}
.content{position:relative;z-index:1;max-width:1180px;margin:auto;padding:16px 12px 28px;display:flex;flex-direction:column;gap:24px}
.section-title{margin:0 0 10px 2px}
.section-title small{display:inline-block;margin-bottom:4px;padding:3px 9px;border-radius:99px;background:rgba(255,106,92,.10);color:var(--coral);font-size:9.5px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}
.section-title h2{margin:0;font-size:17px;font-weight:800;letter-spacing:-.4px;color:var(--ink)}
.section-title p{margin:3px 0 0;color:var(--muted);font-size:11.5px}
.hero-card{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 18px;border-radius:24px;background:var(--grad);color:#fff;box-shadow:0 18px 40px rgba(255,106,92,.30)}
.hero-card:before{content:"";position:absolute;inset:-40% -10% auto auto;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.18);filter:blur(10px)}
.hero-card:after{content:"";position:absolute;left:-30px;bottom:-70px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.12)}
.hero-card>div{position:relative;z-index:1}
.hero-card small{display:block;font-size:10.5px;opacity:.85;letter-spacing:.6px;text-transform:uppercase;font-weight:700}
.hero-card h1{margin:4px 0 4px;font-size:19px;font-weight:800;letter-spacing:-.5px;line-height:1.15}
.hero-card p{margin:0;font-size:12px;opacity:.9}
.hero-stat{flex:none;text-align:center;padding:12px 14px;border-radius:18px;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35)}
.hero-stat strong{display:block;font-size:28px;font-weight:900;letter-spacing:-1px;line-height:1}
.hero-stat span{font-size:10px;opacity:.9;font-weight:600}
.card-scroll{display:flex;gap:12px;overflow-x:auto;padding:4px 2px 10px;scroll-snap-type:x mandatory;scrollbar-width:none}
.card-scroll::-webkit-scrollbar{display:none}
.material,.metric{position:relative;flex:0 0 calc((100vw - 36px)/2.35);min-height:150px;padding:14px;border:1px solid rgba(255,255,255,.9);border-radius:22px;background:var(--card);backdrop-filter:blur(14px);box-shadow:var(--shadow);scroll-snap-align:start;text-align:left;color:var(--ink);overflow:hidden;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s}
.material:hover,.metric:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(170,90,80,.16)}
.material:active{transform:scale(.97)}
.material i{width:42px;height:42px;display:grid;place-items:center;border-radius:14px;color:#fff;margin-bottom:12px;box-shadow:0 8px 18px rgba(0,0,0,.12)}
.material i svg{width:20px;height:20px}
.material h3{margin:0;font-size:12.5px;font-weight:700;color:var(--muted)}
.material strong{display:block;margin-top:2px;font-size:24px;font-weight:900;letter-spacing:-.8px}
.material small{display:block;font-size:10px;color:var(--muted);font-weight:600}
.material p{display:flex;align-items:center;gap:5px;margin:10px 0 0;padding:5px 9px;width:max-content;border-radius:99px;font-size:10px;font-weight:700;background:rgba(75,35,45,.05);color:#4a3a45}
.material p svg{width:12px;height:12px}
.material .glow{position:absolute;right:-30px;top:-30px;width:110px;height:110px;border-radius:50%;opacity:.35;filter:blur(20px);pointer-events:none}
.material.c0 i{background:linear-gradient(135deg,#ff6a5c,#ff8fb1)}.material.c0 .glow{background:#ff8fb1}
.material.c1 i{background:linear-gradient(135deg,#ffb347,#ff7e3e)}.material.c1 .glow{background:#ffb347}
.material.c2 i{background:linear-gradient(135deg,#f472b6,#c453f0)}.material.c2 .glow{background:#f472b6}
.metric-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.metric-top i{width:40px;height:40px;display:grid;place-items:center;border-radius:13px;color:#fff;box-shadow:0 8px 18px rgba(0,0,0,.12)}
.metric-top i svg{width:19px;height:19px}
.metric-top strong{font-size:28px;font-weight:900;letter-spacing:-1px}
.metric>b{display:block;margin-top:10px;font-size:12.5px;font-weight:700;color:var(--muted)}
.metric-details{display:grid;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)}
.metric-details span{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:#4a3a45}
.metric-details svg{width:12px;height:12px;color:var(--muted)}
.metric.blue .metric-top i{background:linear-gradient(135deg,#ff6a5c,#ffb347)}.metric.blue .metric-top strong{color:#f0543f}
.metric.amber .metric-top i{background:linear-gradient(135deg,#f5a524,#ff7a59)}.metric.amber .metric-top strong{color:#e0891a}
.metric.green .metric-top i{background:linear-gradient(135deg,#22c58f,#10b981)}.metric.green .metric-top strong{color:#12a877}
.pending{display:flex;align-items:center;gap:10px;width:100%;margin-top:6px;padding:12px 14px;border:1px solid rgba(255,106,92,.18);border-radius:18px;background:linear-gradient(135deg,rgba(255,106,92,.08),rgba(255,179,71,.08));color:var(--ink);font-weight:700;font-size:12.5px;text-align:left;transition:transform .2s,box-shadow .2s}
.pending:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(255,106,92,.18)}
.pending:disabled{opacity:.55;cursor:default}
.pending i{width:34px;height:34px;flex:none;display:grid;place-items:center;border-radius:11px;background:var(--grad);color:#fff}
.pending i svg{width:16px;height:16px}
.pending span{flex:1}
.pending b{min-width:26px;height:26px;padding:0 8px;display:grid;place-items:center;border-radius:99px;background:var(--coral);color:#fff;font-size:11px}
.pending>svg{width:18px;height:18px;color:var(--coral)}
.loading-grid{display:grid;gap:12px}
.loading-card{position:relative;padding:15px;border:1px solid rgba(255,255,255,.9);border-radius:22px;background:var(--card);backdrop-filter:blur(14px);box-shadow:var(--shadow);text-align:left;color:var(--ink);overflow:hidden;transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s}
.loading-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--grad)}
.loading-card.next:before{background:linear-gradient(180deg,#f5a524,#ff7a59)}
.loading-card.loading:before{background:linear-gradient(180deg,#22c58f,#10b981)}
.loading-card.delayed:before{background:linear-gradient(180deg,#ff6b8a,#ff8e53)}
.loading-card:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(170,90,80,.16)}
.loading-card header{display:flex;align-items:center;justify-content:space-between;gap:8px}
.loading-card header b{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.2px}
.loading-card header b svg{width:15px;height:15px;color:var(--coral)}
.loading-card em{padding:3px 8px;border-radius:99px;font-size:8px;font-weight:800;font-style:normal;letter-spacing:.3px}
.loading-card em.stonerate{background:rgba(255,106,92,.12);color:var(--coral)}
.loading-card em.manual{background:rgba(196,83,240,.12);color:#a21caf}
.loading-card h3{margin:8px 0 2px;font-size:12.5px;font-weight:800;letter-spacing:-.2px}
.loading-card strong{display:block;font-size:17px;font-weight:900;letter-spacing:-.5px;color:var(--ink)}
.loading-card strong small{font-size:10px;font-weight:700;color:var(--muted);letter-spacing:0}
.loading-card footer{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line)}
.loading-card footer span{display:flex;align-items:center;gap:5px;font-size:9.5px;font-weight:700;color:#4a3a45}
.loading-card footer svg{width:12px;height:12px;color:var(--muted)}
.status{position:absolute;right:14px;bottom:14px;padding:4px 9px;border-radius:99px;font-size:8px;font-weight:800;font-style:normal;letter-spacing:.4px;text-transform:uppercase}
.status.next{background:rgba(245,165,36,.16);color:#b26a00}
.status.waiting{background:rgba(107,117,144,.12);color:#6b5560}
.status.loading{background:rgba(34,197,143,.16);color:#0f8a63}
.status.delayed{background:rgba(255,107,138,.16);color:#c2274b}
.view-queue{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:12px;padding:13px;border:0;border-radius:18px;background:var(--grad);color:#fff;font-weight:800;font-size:13px;box-shadow:0 14px 30px rgba(255,106,92,.30);transition:transform .2s,box-shadow .2s}
.view-queue:hover{transform:translateY(-2px);box-shadow:0 18px 36px rgba(255,106,92,.38)}
.view-queue:active{transform:scale(.98)}
.view-queue svg{width:17px;height:17px}
.empty{display:grid;place-items:center;gap:6px;padding:28px 16px;border:1.5px dashed rgba(255,106,92,.25);border-radius:22px;background:rgba(255,255,255,.6);text-align:center;color:var(--muted)}
.empty svg{width:30px;height:30px;color:var(--coral)}
.empty b{color:var(--ink);font-size:13px}
.empty span{font-size:11px}
.error{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid rgba(255,107,138,.3);border-radius:16px;background:rgba(255,107,138,.08);color:#a8203f;font-size:12px;font-weight:600}
.error button{display:flex;align-items:center;gap:6px;padding:8px 12px;border:0;border-radius:12px;background:#ff6b8a;color:#fff;font-weight:700;font-size:12px}
.error svg{width:14px;height:14px}
.spin{animation:spin 1s linear infinite}
.skeleton{display:grid;gap:14px}
.skeleton>div{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.skeleton i{display:block;height:130px;border-radius:22px;background:linear-gradient(90deg,#fbe9e4 25%,#fff6f2 50%,#fbe9e4 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
.skeleton>i{height:110px}
.bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:45;padding:0 14px calc(8px + env(safe-area-inset-bottom));pointer-events:none}
.nav-pill{pointer-events:auto;position:relative;max-width:520px;margin:auto;display:grid;grid-template-columns:repeat(5,1fr);align-items:end;padding:4px 6px 3px;border-radius:22px;background:rgba(255,255,255,.78);backdrop-filter:blur(24px) saturate(170%);-webkit-backdrop-filter:blur(24px) saturate(170%);border:1px solid rgba(255,255,255,.95);box-shadow:0 18px 44px rgba(170,90,80,.20),0 1px 0 rgba(255,255,255,.9) inset}
.nav-pill button{position:relative;display:grid;justify-items:center;gap:1px;padding:3px 2px 3px;border:0;background:transparent;color:#a08a94;border-radius:16px;transition:color .2s,transform .2s}
.nav-pill button span{width:30px;height:30px;display:grid;place-items:center;border-radius:11px;transition:background .25s,transform .25s,box-shadow .25s}
.nav-pill button svg{width:18px;height:18px}
.nav-pill button small{font-size:9px;font-weight:700;letter-spacing:.2px;line-height:1.1}
.nav-pill button:hover{color:var(--coral)}
.nav-pill button:hover span{background:rgba(255,106,92,.10)}
.nav-pill button:active span{transform:scale(.92)}
.nav-pill button.active{color:var(--coral)}
.nav-pill button.active span{width:44px;height:44px;margin-top:-22px;border-radius:16px;background:var(--grad);color:#fff;border:3px solid #fdf0eb;box-shadow:0 12px 24px rgba(255,106,92,.45)}
.nav-pill button.active svg{width:20px;height:20px}
.nav-pill button.active small{font-weight:800}
.nav-pill button.active:after{content:"";position:absolute;bottom:-1px;width:16px;height:3px;border-radius:99px;background:var(--grad)}
.overlay{position:fixed;inset:0;z-index:60;display:flex;background:rgba(75,35,45,.38);backdrop-filter:blur(6px);animation:fade .25s}
.left-overlay{justify-content:flex-start}
.bottom-overlay{align-items:flex-end;justify-content:center}
.drawer{display:flex;flex-direction:column;width:min(86vw,330px);height:100%;padding:18px 16px;background:linear-gradient(180deg,#fffaf7,#fdefe9);box-shadow:24px 0 60px rgba(75,35,45,.22);animation:drawer .32s cubic-bezier(.2,.8,.2,1)}
.drawer header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.drawer header small{display:block;margin-top:2px;font-size:9.5px;font-weight:800;letter-spacing:1.2px;color:var(--muted)}
.seller{display:flex;align-items:center;gap:12px;margin:20px 0 16px;padding:14px;border-radius:20px;background:var(--grad);color:#fff;box-shadow:0 14px 30px rgba(255,106,92,.30)}
.seller i{width:46px;height:46px;flex:none;display:grid;place-items:center;border-radius:15px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.4);font-style:normal;font-weight:900;font-size:15px}
.seller div{min-width:0}
.seller b,.seller span,.seller small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.seller b{font-size:14px;font-weight:800}
.seller span{font-size:11px;opacity:.92}
.seller small{margin-top:3px;font-size:9.5px;opacity:.8;letter-spacing:.4px}
.drawer nav{display:grid;gap:6px}
.drawer nav button{display:flex;align-items:center;gap:12px;padding:12px 12px;border:1px solid transparent;border-radius:16px;background:transparent;color:#4a3a45;font-weight:700;font-size:13.5px;text-align:left;transition:background .2s,transform .2s,border-color .2s}
.drawer nav button svg{width:19px;height:19px;color:#a08a94}
.drawer nav button span{flex:1}
.drawer nav button .chev{width:16px;height:16px;opacity:.5}
.drawer nav button:hover{background:rgba(255,106,92,.08);border-color:rgba(255,106,92,.15)}
.drawer nav button.active{background:linear-gradient(135deg,rgba(255,106,92,.14),rgba(255,179,71,.12));border-color:rgba(255,106,92,.25);color:var(--coral)}
.drawer nav button.active svg{color:var(--coral)}
.drawer nav button b{min-width:22px;height:22px;padding:0 7px;display:grid;place-items:center;border-radius:99px;background:linear-gradient(135deg,#d6336c,#ff5c7a);color:#fff;font-size:10px}
.drawer-foot{margin-top:auto;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);font-weight:600}
.sheet{width:100%;max-width:640px;max-height:82dvh;display:flex;flex-direction:column;padding:10px 16px 20px;border-radius:28px 28px 0 0;background:linear-gradient(180deg,#fffaf7,#fdefe9);box-shadow:0 -20px 60px rgba(75,35,45,.22);animation:sheet .32s cubic-bezier(.2,.8,.2,1)}
.handle{display:block;width:44px;height:5px;margin:0 auto 12px;border-radius:99px;background:#f2d9d2}
.sheet header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.sheet header h2{margin:0;font-size:17px;font-weight:800;letter-spacing:-.3px}
.sheet header p{margin:2px 0 0;font-size:11px;color:var(--muted);font-weight:600}
.sheet header div{display:flex;align-items:center;gap:8px}
.sheet header button:not(.icon){padding:8px 12px;border:1px solid rgba(255,106,92,.25);border-radius:12px;background:rgba(255,106,92,.08);color:var(--coral);font-weight:700;font-size:11px}
.sheet header button:not(.icon):disabled{opacity:.45;cursor:default}
.sheet main{overflow-y:auto;display:grid;gap:8px;padding-top:12px}
.note{position:relative;display:flex;align-items:flex-start;gap:12px;padding:12px;border:1px solid var(--line);border-radius:18px;background:#fff;text-align:left;color:var(--ink);transition:transform .2s,box-shadow .2s}
.note:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(170,90,80,.12)}
.note.unread{background:linear-gradient(135deg,rgba(255,106,92,.07),rgba(255,179,71,.06));border-color:rgba(255,106,92,.22)}
.note i{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:13px;color:#fff;background:var(--grad)}
.note.queue i{background:linear-gradient(135deg,#f5a524,#ff7a59)}
.note.manual i{background:linear-gradient(135deg,#c453f0,#f472b6)}
.note i svg{width:18px;height:18px}
.note span{flex:1;min-width:0;display:grid;gap:2px}
.note b{font-size:13px;font-weight:800}
.note em{font-size:11.5px;font-style:normal;color:#6b5560;line-height:1.4}
.note small{font-size:10px;color:var(--muted);font-weight:600}
.note u{position:absolute;right:14px;top:14px;width:9px;height:9px;border-radius:50%;background:var(--coral);box-shadow:0 0 0 4px rgba(255,106,92,.18)}
@media(min-width:700px){.app{padding-bottom:36px}.top{height:80px;padding:0 24px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}.top>.bell{justify-self:end}.hello span{font-size:11px}.hello b{font-size:14px;max-width:220px}.brand{font-size:20px}.brand i{width:26px;height:26px}.content{padding:28px 24px 44px;gap:32px}.section-title h2{font-size:21px}.hero-card{padding:28px 26px;border-radius:28px}.hero-card h1{font-size:26px}.hero-card p{font-size:14px}.hero-stat strong{font-size:38px}.card-scroll{display:grid;grid-template-columns:repeat(3,1fr);overflow:visible;gap:14px;padding:4px 0}.material,.metric{flex:none;min-height:160px;padding:18px}.material strong{font-size:28px}.metric-top strong{font-size:32px}.metric-details{grid-template-columns:repeat(2,auto);gap:12px;margin-top:12px;padding-top:11px}.metric-details span{font-size:11px}.loading-grid{grid-template-columns:repeat(2,1fr);gap:14px}.loading-card{padding:18px}.view-queue{width:auto;margin-left:auto;padding:13px 22px}.bottom-nav{display:none}.sheet{margin-bottom:20px;border-radius:28px}}
@media(min-width:1000px){.loading-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:350px){.material,.metric{flex-basis:calc((100vw - 34px)/2)}.material{padding-left:10px;padding-right:8px}.nav-pill button.active span{width:48px;height:48px;margin-top:-26px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@keyframes drawer{from{transform:translateX(-100%)}}
@keyframes sheet{from{transform:translateY(100%)}}
@keyframes fade{from{opacity:0}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{from{transform:scale(0)}}
@keyframes shimmer{to{background-position:-200% 0}}
@keyframes float{to{transform:translate(30px,40px) scale(1.08)}}
`;
