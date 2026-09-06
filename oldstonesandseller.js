import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Menu, X, Home, ListOrdered, ImageUp, Inbox, SquarePen,
  Truck, PackageOpen, CheckCircle2, Clock3, ChevronRight,
  UserRound, Boxes, Mountain, RefreshCw
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

function Brand() { return <div className="brand"><span>Stone</span><b>Rate</b></div>; }
function SectionTitle({ children, helper }) { return <div className="section-title"><h2>{children}</h2>{helper && <p>{helper}</p>}</div>; }

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
    <div className="seller"><i>{seller.ownerName?.split(" ").map(x => x[0]).slice(0, 2).join("")}</i><div><b>{seller.ownerName}</b><span>{seller.yardName}</span><small>ID {seller.sellerId}</small></div></div>
    <nav>{items.map(([label, Icon, action, active]) => <button key={label} className={active ? "active" : ""} onClick={() => { close(); action?.(); }}><Icon/><span>{label}</span>{label === "Pending Requests" && pending > 0 && <b>{number(pending)}</b>}</button>)}</nav>
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
    <main>{items.length ? items.map(item => <button key={item.id} className={`note ${item.read ? "read" : "unread"}`} onClick={() => select(item)}><i>{item.type === "queue" ? <ListOrdered/> : item.type === "manual" ? <SquarePen/> : <Inbox/>}</i><span><b>{item.title}</b><em>{item.message}</em><small>{relativeTime(item.createdAt)}{item.tokenNumber ? ` · Token ${item.tokenNumber}` : ""}</small></span>{!item.read && <u/>}</button>) : <div className="empty"><Bell/><b>No notifications yet</b><span>New order and queue updates will appear here.</span></div>}</main>
  </section></Overlay>;
}

function BottomNav({ callbacks }) {
  const items = [["Sample", ImageUp, callbacks.onOpenSampleUpload], ["Queue", ListOrdered, callbacks.onOpenQueue], ["Home", Home, callbacks.onOpenHome, true], ["My Sample", Boxes, callbacks.onOpenMySamples], ["Profile", UserRound, callbacks.onOpenProfile]];
  return <nav className="bottom-nav">{items.map(([label, Icon, action, active]) => <button key={label} className={active ? "active" : ""} onClick={action}><span><Icon/></span><small>{label}</small></button>)}</nav>;
}

function MaterialCard({ item, index, onClick }) {
  return <button className={`material c${index}`} onClick={() => onClick?.(item)}><i><Mountain/></i><div><h3>{item.materialName}</h3><strong>{number(item.buckets)}</strong><small>Buckets</small><p><Truck/>{number(item.trucks)} Trucks</p></div></button>;
}

function MetricCard({ tone, icon: Icon, value, label, trucks, buckets }) {
  return <article className={`metric ${tone}`}><div className="metric-top"><i><Icon/></i><strong>{number(value)}</strong></div><b>{label}</b><div className="metric-details"><span><Truck/>{number(trucks)} Trucks</span><span><Boxes/>{number(buckets)} Buckets</span></div></article>;
}

function LoadingCard({ item, onOpen }) {
  const labels = { next: "Next", waiting: "Waiting", loading: "Loading Now", delayed: "Delayed" };
  return <button className="loading-card" onClick={() => onOpen?.(item.id)}><header><b><Truck/>{item.truckNumber}</b><em className={item.source}>{item.source === "stonerate" ? "By StoneRate" : "Manual"}</em></header><h3>{item.customerName}</h3><strong>{number(item.quantityBuckets)} Buckets</strong><footer><span>Token {item.tokenNumber}</span><span><Clock3/>Est. {formatTime(item.estimatedTime)}</span></footer><i className={`status ${item.status}`}>{labels[item.status] || "Waiting"}</i></button>;
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
    <header className="top"><div><button ref={menuRef} className="icon" onClick={() => setDrawerOpen(true)} aria-label="Open menu"><Menu/></button><div className="hello"><span>{greeting()},</span><b>{seller.ownerName}</b></div></div><Brand/><button ref={bellRef} className="icon bell" onClick={() => setSheetOpen(true)} aria-label={`Open notifications, ${unread} unread`}><Bell/>{unread > 0 && <b>{unread}</b>}</button></header>
    <main className="content">
      {error && <div className="error"><span>Unable to load the latest dashboard information.</span><button onClick={retry}><RefreshCw className={refreshing ? "spin" : ""}/>Retry</button></div>}
      {loading ? <div className="skeleton"><i/><div><i/><i/></div><div><i/><i/></div></div> : <>
        <section><SectionTitle>Total Orders</SectionTitle><div className="card-scroll">{totalMaterialOrders?.map((item, index) => <MaterialCard key={item.id} item={item} index={index} onClick={onOpenMaterial}/>)}</div></section>
        <section><SectionTitle>Today’s Orders</SectionTitle><div className="card-scroll">
          <MetricCard tone="blue" icon={PackageOpen} value={todaySummary?.totalOrders} label="Orders Today" trucks={todaySummary?.totalTrucks} buckets={todaySummary?.totalBuckets}/>
          <MetricCard tone="amber" icon={Clock3} value={todaySummary?.pendingToLoad} label="Pending to Load" trucks={todaySummary?.pendingTrucks} buckets={todaySummary?.pendingBuckets}/>
          <MetricCard tone="green" icon={CheckCircle2} value={todaySummary?.loadedOrders} label="Loaded" trucks={todaySummary?.loadedTrucks} buckets={todaySummary?.loadedBuckets}/>
        </div><button className="pending" disabled={!todaySummary?.pendingRequests} onClick={onOpenPendingRequests}><span>{todaySummary?.pendingRequests ? "See the pending requests" : "No pending requests"}</span>{todaySummary?.pendingRequests > 0 && <><b>{number(todaySummary.pendingRequests)}</b><ChevronRight/></>}</button></section>
        <section><SectionTitle helper="Upcoming loading schedule">Recent Loading</SectionTitle>{loadingEntries.length ? <div className="loading-grid">{loadingEntries.map(item => <LoadingCard key={item.id} item={item} onOpen={onOpenLoadingDetails}/>)}</div> : <div className="empty"><Truck/><b>No loading scheduled</b><span>New queue assignments will appear here.</span></div>}<button className="view-queue" onClick={onOpenQueue}>View Full Queue <ChevronRight/></button></section>
      </>}
    </main>
    <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} seller={seller} pending={todaySummary?.pendingRequests || 0} callbacks={callbacks} returnFocusRef={menuRef}/>
    <NotificationSheet open={sheetOpen} onClose={() => setSheetOpen(false)} items={localNotifications} setItems={setLocalNotifications} onNotificationClick={onNotificationClick} onMarkAll={onMarkAllNotificationsRead} returnFocusRef={bellRef}/>
    <BottomNav callbacks={callbacks}/>
  </div>;
}

const CSS = `
:root{color-scheme:light}*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%;font-family:Inter,"Segoe UI",system-ui,sans-serif;background:#f3f5fa;color:#202432}button{font:inherit}.app{--orange:#ff6817;--navy:#18213d;min-height:100dvh;padding-bottom:86px;background:radial-gradient(circle at 7% 0,rgba(255,145,55,.15),transparent 25%),radial-gradient(circle at 94% 18%,rgba(115,92,231,.1),transparent 27%),linear-gradient(#fffaf6,#f7f7fb 43%,#f1f3f8)}.app button:focus-visible{outline:3px solid #ffc29a;outline-offset:2px}.top{position:sticky;top:0;z-index:40;height:64px;max-width:1180px;margin:auto;padding:0 11px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:7px;background:rgba(255,255,255,.86);backdrop-filter:blur(20px);border-bottom:1px solid #ede8e4;box-shadow:0 7px 23px rgba(45,37,31,.055)}.top>div{min-width:0;display:flex;align-items:center;gap:8px}.icon{width:38px;height:38px;display:grid;place-items:center;flex:none;border:1px solid #eadfd5;border-radius:12px;background:linear-gradient(145deg,#fff,#fff5eb);color:#4b4139;box-shadow:0 7px 17px rgba(90,59,30,.085);cursor:pointer}.icon svg{width:19px}.hello{min-width:0}.hello span,.hello b{display:block}.hello span{font-size:8.5px;color:#88838a}.hello b{max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--navy)}.brand{font-size:16px;font-weight:900;letter-spacing:-.6px;white-space:nowrap}.brand span{color:var(--navy)}.brand b{color:var(--orange)}.bell{position:relative;justify-self:end}.bell>b{position:absolute;right:-4px;top:-5px;min-width:17px;height:17px;display:grid;place-items:center;border:2px solid white;border-radius:99px;background:#ed5010;color:#fff;font-size:8px}.content{max-width:1180px;margin:auto;padding:15px 11px 26px;display:flex;flex-direction:column;gap:20px}.section-title{margin:0 0 8px 1px}.section-title h2{margin:0;font-size:16px;letter-spacing:-.4px}.section-title p{margin:2px 0 0;color:#7b8090;font-size:9.5px}.card-scroll{display:flex;gap:8px;overflow-x:auto;padding:2px 10px 8px 1px;scroll-snap-type:x mandatory;scrollbar-width:none}.card-scroll::-webkit-scrollbar{display:none}.material,.metric{flex:0 0 calc((100vw - 34px)/2);scroll-snap-align:start;position:relative;overflow:hidden;min-height:112px;border:1px solid #e9e8ee;border-radius:16px;background:rgba(255,255,255,.96);box-shadow:0 8px 20px rgba(42,36,65,.075)}.material{display:flex;gap:7px;padding:12px 8px;text-align:left;color:inherit;cursor:pointer}.material:before{content:"";position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,var(--a),var(--b))}.material.c0{--a:#ff7620;--b:#ffbb51;--soft:#fff0e1}.material.c1{--a:#755ce6;--b:#ac99ff;--soft:#f0ecff}.material.c2{--a:#159f7b;--b:#55d6b4;--soft:#e4f8f2}.material>i{width:31px;height:31px;display:grid;place-items:center;flex:none;border-radius:10px;color:var(--a);background:var(--soft);font-style:normal}.material>i svg{width:15px}.material h3{margin:1px 0 5px;font-size:11px;white-space:nowrap}.material strong{display:block;font-size:17px;line-height:1;color:var(--navy)}.material small{color:#7c808d;font-size:7px}.material p{display:flex;align-items:center;gap:3px;margin:7px 0 0;color:#6f7380;font-size:8px;font-weight:750}.material p svg{width:11px}.metric{padding:11px 9px}.metric:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--tone)}.metric.blue{--tone:#3d82ef;--soft:#e8f2ff;--detail:#315f9a}.metric.amber{--tone:#efa313;--soft:#fff2ce;--detail:#8a620e}.metric.green{--tone:#12a373;--soft:#e0f7ee;--detail:#27644f}.metric-top{display:flex;align-items:center;justify-content:space-between}.metric-top i{width:30px;height:30px;display:grid;place-items:center;border-radius:10px;background:var(--soft);color:var(--tone);font-style:normal}.metric-top i svg{width:15px}.metric-top strong{font-size:20px;color:var(--navy)}.metric>b{display:block;margin-top:7px;color:#6d7280;font-size:7.3px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}.metric-details{display:grid;gap:2px;margin-top:6px;padding-top:6px;border-top:1px solid #edf0f2}.metric-details span{display:flex;align-items:center;gap:3px;color:var(--detail);font-size:7.2px;font-weight:750;white-space:nowrap}.metric-details svg{width:10px;height:10px}.pending{width:100%;min-height:43px;margin-top:2px;padding:0 10px;display:flex;align-items:center;gap:7px;border:1px solid #e9e7ee;border-radius:12px;background:#fff;box-shadow:0 7px 18px rgba(40,35,60,.05);cursor:pointer}.pending span{flex:1;text-align:left;font-size:10px;font-weight:700}.pending b{min-width:21px;height:18px;display:grid;place-items:center;border-radius:99px;background:#ed5010;color:#fff;font-size:8px}.pending svg{width:15px;color:var(--orange)}.loading-grid{display:grid;gap:8px}.loading-card{position:relative;width:100%;padding:12px 11px;border:1px solid #e7e7ee;border-radius:16px;background:#fff;box-shadow:0 8px 20px rgba(39,34,59,.065);text-align:left;color:inherit;cursor:pointer;overflow:hidden}.loading-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(#ff9137,#e94e0b)}.loading-card header,.loading-card footer{display:flex;align-items:center;justify-content:space-between;gap:8px}.loading-card header b{display:flex;align-items:center;gap:4px;font-family:ui-monospace,monospace;font-size:9.5px}.loading-card header svg{width:13px}.loading-card em{padding:4px 6px;border-radius:99px;font-size:7px;font-weight:850;font-style:normal}.loading-card em.stonerate{background:#f1601c;color:#fff}.loading-card em.manual{border:1px solid #cbc8d1;background:#faf9fb;color:#65606b}.loading-card h3{margin:10px 0 3px;font-size:11.5px}.loading-card>strong{font-size:9.5px;color:#e25310}.loading-card footer{margin-top:9px;padding-top:8px;border-top:1px solid #eceef3;color:#747988;font-size:8px}.loading-card footer span{display:flex;align-items:center;gap:4px}.loading-card footer svg{width:10px}.status{display:inline-block;margin-top:8px;padding:4px 6px;border-radius:99px;font-size:7px;font-weight:850;font-style:normal}.status.next{background:#fff0c8;color:#946000}.status.waiting{background:#edf0f5;color:#596171}.status.loading{background:#dff7ed;color:#08764e}.status.delayed{background:#ffe4df;color:#a63c27}.view-queue{min-height:38px;margin:8px auto 0;padding:0 11px;display:flex;align-items:center;gap:4px;border:1px solid #ffcda8;border-radius:11px;background:#fff5ed;color:#df500d;font-size:9.5px;font-weight:800;cursor:pointer}.view-queue svg{width:14px}.empty{min-height:115px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:15px;border:1px dashed #d9d9e2;border-radius:16px;background:#fff;color:#555a68;text-align:center}.empty svg{width:20px;color:var(--orange)}.empty b{font-size:11px}.empty span{font-size:9px;color:#858996}.error{display:flex;align-items:center;gap:7px;padding:10px;border:1px solid #ffc4b3;border-radius:13px;background:#fff1ec;color:#8b341e;font-size:9.5px}.error span{flex:1}.error button{display:flex;align-items:center;gap:4px;border:0;background:#fff;padding:7px;border-radius:8px}.error svg{width:14px}.overlay{position:fixed;z-index:100;inset:0;background:rgba(25,27,40,.43);backdrop-filter:blur(6px)}.left-overlay{display:flex}.drawer{width:min(87vw,350px);height:100%;padding:20px 15px;background:linear-gradient(165deg,#fff,#f8f6ff);box-shadow:28px 0 70px rgba(25,27,40,.25);animation:drawer .3s ease}.drawer header{display:flex;justify-content:space-between}.drawer header small{display:block;font-size:8px;color:#8b8d99}.seller{display:flex;align-items:center;gap:10px;margin:20px 0;padding:12px;border:1px solid #ebe7ee;border-radius:16px;background:#fff}.seller>i{width:43px;height:43px;display:grid;place-items:center;border-radius:14px;background:#ef5d17;color:#fff;font-size:12px;font-weight:900;font-style:normal}.seller b,.seller span,.seller small{display:block}.seller b{font-size:12px}.seller span{font-size:9px;color:#737784}.seller small{font-size:8px;color:#a45d31}.drawer nav{display:flex;flex-direction:column;gap:5px}.drawer nav button{min-height:47px;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:8px;padding:5px 9px;border:0;border-radius:14px;background:transparent;text-align:left;color:#505461;cursor:pointer}.drawer nav button.active,.drawer nav button:hover{background:linear-gradient(90deg,#fff0e3,#f1edff);color:#df510e}.drawer nav svg{width:18px}.drawer nav span{font-size:10px}.drawer nav b{min-width:23px;height:19px;display:grid;place-items:center;border-radius:99px;background:#e9500f;color:#fff;font-size:8px}.bottom-overlay{display:flex;align-items:flex-end;justify-content:center}.sheet{width:100%;max-width:700px;max-height:78vh;display:flex;flex-direction:column;border-radius:24px 24px 0 0;background:#fff;animation:sheet .3s ease}.handle{width:40px;height:4px;margin:8px auto 0;border-radius:99px;background:#d4d2dc}.sheet>header{display:flex;justify-content:space-between;align-items:center;padding:10px 13px;border-bottom:1px solid #e8e7ee}.sheet h2{margin:0;font-size:16px}.sheet header p{margin:2px 0 0;color:#e45210;font-size:9px}.sheet header>div:last-child{display:flex;align-items:center;gap:5px}.sheet header>div>button:first-child{border:0;background:transparent;color:#df510e;font-size:9px;font-weight:800}.sheet main{overflow-y:auto;padding:9px 10px 20px}.note{width:100%;display:grid;grid-template-columns:38px 1fr 7px;gap:8px;margin-bottom:7px;padding:10px;border:1px solid #e7e7ee;border-radius:14px;background:#fff;text-align:left;color:inherit}.note.unread{border-color:#ffc399;background:#fff6ee}.note.read{opacity:.7}.note>i{width:36px;height:36px;display:grid;place-items:center;border-radius:11px;background:#fff0e2;color:#e6500d;font-style:normal}.note>i svg{width:16px}.note span b,.note span em,.note span small{display:block}.note span b{font-size:10px}.note span em{margin-top:2px;color:#666a77;font-size:9px;font-style:normal}.note span small{margin-top:4px;color:#9295a1;font-size:7.5px}.note u{width:7px;height:7px;margin-top:4px;border-radius:50%;background:var(--orange);text-decoration:none}.bottom-nav{position:fixed;z-index:60;left:8px;right:8px;bottom:max(6px,env(safe-area-inset-bottom));height:58px;display:grid;grid-template-columns:repeat(5,1fr);padding:4px 3px;border:1px solid #fff;border-radius:18px;background:rgba(255,255,255,.94);backdrop-filter:blur(22px);box-shadow:0 14px 35px rgba(28,28,43,.16)}.bottom-nav button{position:relative;min-width:0;border:0;background:transparent;color:#898c98;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}.bottom-nav button span{width:28px;height:25px;display:grid;place-items:center}.bottom-nav svg{width:16px}.bottom-nav small{font-size:6.8px;white-space:nowrap}.bottom-nav button.active span{position:absolute;top:-17px;width:42px;height:42px;border:4px solid #f3f5fa;border-radius:14px;background:linear-gradient(145deg,#ff963c,#e94b09);color:#fff;box-shadow:0 9px 20px rgba(233,75,9,.3)}.bottom-nav button.active span svg{width:18px}.bottom-nav button.active small{position:absolute;bottom:1px;color:#df510e;font-size:7.5px;font-weight:850}.skeleton{display:flex;flex-direction:column;gap:12px}.skeleton>i,.skeleton div i{display:block;height:112px;border-radius:14px;background:#e8e8ee}.skeleton>i{width:120px;height:24px}.skeleton>div{display:grid;grid-template-columns:1fr 1fr;gap:8px}.spin{animation:spin 1s linear infinite}
@media(min-width:700px){.app{padding-bottom:30px}.top{height:78px;padding:0 22px}.content{padding:25px 24px 40px;gap:28px}.section-title h2{font-size:20px}.card-scroll{display:grid;grid-template-columns:repeat(3,1fr);overflow:visible;gap:12px}.material,.metric{min-width:0;min-height:140px;padding:16px}.material strong{font-size:24px}.metric-top strong{font-size:27px}.metric-details{grid-template-columns:repeat(2,auto);gap:10px;margin-top:10px;padding-top:9px}.metric-details span{font-size:9px}.loading-grid{grid-template-columns:repeat(2,1fr);gap:12px}.loading-card{padding:16px}.bottom-nav{display:none}.sheet{margin-bottom:16px;border-radius:24px}}
@media(min-width:1000px){.loading-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:350px){.material,.metric{flex-basis:calc((100vw - 31px)/2)}.material{padding-left:7px;padding-right:6px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}@keyframes drawer{from{transform:translateX(-100%)}}@keyframes sheet{from{transform:translateY(100%)}}@keyframes spin{to{transform:rotate(360deg)}}`;
