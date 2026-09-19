import React, { useEffect, useMemo, useState } from "react";
import {
  Bell, ChevronRight, Clock3, Gavel, Home, Images, MapPin, Menu, Mountain,
  Navigation, PackageCheck, ShieldCheck, Truck, UserRound
} from "lucide-react";

/* StoneRate Transporter Orders Page - one-file React component */

const ORDER_IMAGES = {
  stone20: "https://cdn.jsdelivr.net/gh/shyam7291/Image-icons@main/availabletrips.png",
  stone40: "https://cdn.jsdelivr.net/gh/shyam7291/Image-icons@main/completed.png"
};

const MOCK_YOUR_ORDERS = [
  {
    id: "TR260916-625",
    placedAt: "3:20 PM",
    responseSeconds: 30 * 60,
    pickup: "Dalla",
    requestTime: "3:20 PM",
    status: "No response yet",
    statusDetail: "Waiting for both sellers to respond to the transport request.",
    orderType: "yourOrder",
    source: "Direct buyer order",
    materials: [
      { id: "m1", name: "20MM", quantity: "50 ton", vehicles: 2, pickup: "Dalla", image: ORDER_IMAGES.stone20, sellerStatus: "Pending" },
      { id: "m2", name: "40MM", quantity: "20 ton", vehicles: 1, pickup: "Ariora", image: ORDER_IMAGES.stone40, sellerStatus: "Pending" }
    ]
  },
  {
    id: "TR260916-418",
    placedAt: "2:10 PM",
    responseSeconds: 18 * 60 + 22,
    pickup: "Dalla",
    requestTime: "2:10 PM",
    status: "Accepted",
    statusDetail: "The seller accepted the transport request.",
    orderType: "yourOrder",
    source: "Direct buyer order",
    materials: [
      { id: "m3", name: "20MM", quantity: "30 ton", vehicles: 2, pickup: "Dalla", image: ORDER_IMAGES.stone20, sellerStatus: "Accepted" }
    ]
  }
];

const MOCK_STONERATE_ORDERS = [
  {
    id: "SD-260917-537",
    bidId: "BID-260916-5363",
    placedAt: "1:45 PM",
    pickup: "Dalla",
    drop: "Kuddupur, Jaunpur, Uttar Pradesh",
    distanceKm: 45,
    pickupDate: "18 Sep 2026",
    expectedTime: "10:30 AM",
    source: "Won through bidding",
    orderType: "stoneRateOrder",
    verified: true,
    materials: [
      { id: "m4", name: "Medium Stone", quantity: "10 ton", type: "stone" },
      { id: "m5", name: "Sand", quantity: "200 feet", type: "sand" }
    ],
    vehicleAllocation: [
      { type: "12 Tyre", count: 2 },
      { type: "14 Tyre", count: 1 }
    ]
  }
];

const cx = (...items) => items.filter(Boolean).join(" ");

// Shared transporter navigation (identical across Samples / Bidding / Home / Orders / Profile)
const NAV_ITEMS = [
  { label: "Samples", icon: Images },
  { label: "Bidding", icon: Gavel },
  { label: "Home", icon: Home },
  { label: "Orders", icon: PackageCheck },
  { label: "Profile", icon: UserRound }
];
const NAV_ICON_SIZE = 19;
const NAV_ICON_ACTIVE = 20;
const styles = `
:root{--ink:#10243e;--muted:#65758b;--line:#dfe8ee;--violet:#6c4ee7;--blue:#2457e6;--cyan:#00a9c7;--green:#19a875;--orange:#f28a33;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;color:var(--ink);background:#edf5f6}
/* ==== Shared StoneRate transporter navigation (reference: Bidding page) ==== */
.bd-shell{width:min(100% - 28px,1120px);max-width:100%;margin:auto}
.bd-header{position:sticky;top:0;z-index:40;border-bottom:1px solid rgba(218,222,239,.72);background:rgba(255,255,255,.82);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.bd-header-inner{min-height:64px;padding:8px 0;display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:10px}
.bd-icon-btn{width:38px;height:38px;flex:0 0 auto;border:1px solid #e4e7f1;border-radius:12px;background:rgba(255,255,255,.9);color:#10243e;display:grid;place-items:center;position:relative;padding:0;transition:border-color .2s,transform .2s}
.bd-icon-btn:hover{border-color:#cbd1ee;transform:translateY(-1px)}
.bd-icon-btn>svg{width:19px;height:19px}
.bd-greeting{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px}
.bd-greeting strong,.bd-greeting small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bd-greeting strong{font-size:clamp(14px,4.2vw,17px);line-height:1.15;letter-spacing:-.3px;color:#10243e}
.bd-greeting small{font-size:clamp(10.5px,3vw,12px);line-height:1.2;color:#65758b;font-weight:600}
.bd-logo{display:flex;align-items:center;gap:6px;font-size:clamp(17px,5vw,21px);line-height:1;font-weight:900;letter-spacing:-.6px;white-space:nowrap;color:#10243e}
.bd-logo-mark{width:30px;height:30px;flex:0 0 auto;border-radius:9px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 55%,#00a9c7);box-shadow:0 6px 16px rgba(91,108,255,.22)}
.bd-logo-mark>svg{width:17px;height:17px}
.bd-logo-rate{color:#6c4ee7}
.bd-notify-dot{position:absolute;right:7px;top:6px;width:8px;height:8px;border-radius:50%;background:#f05b68;border:2px solid #fff}
.bd-desktop-nav{display:none}
.bd-bottom{position:fixed;z-index:35;left:12px;right:12px;bottom:max(10px,env(safe-area-inset-bottom));height:72px;border:1px solid rgba(217,221,237,.9);border-radius:23px;background:rgba(255,255,255,.9);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 16px 38px rgba(32,42,91,.18);display:grid;grid-template-columns:repeat(5,1fr);padding:7px 7px 5px}
.bd-nav-item{border:0;background:transparent;color:#7a829b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:0;min-width:0;font-size:8.5px;line-height:normal;font-weight:800;position:relative;border-radius:14px;cursor:pointer}
.bd-nav-item:hover{background:#f4f5fb;color:#5260c7}
.bd-nav-item.active{color:#4f5dd4}
.bd-nav-item>svg{width:19px;height:19px;stroke-width:2;flex:0 0 auto}
.bd-nav-item>span:last-child{font-size:8.5px;line-height:normal;font-weight:800}
.bd-active-icon{width:45px;height:45px;flex:0 0 auto;margin-top:-24px;border:5px solid #eff1fa;border-radius:17px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 58%,#00a9c7);box-shadow:0 9px 21px rgba(86,94,213,.31)}
.bd-active-icon>svg{width:20px;height:20px;stroke-width:2}
.bd-nav-badge{position:absolute;top:5px;right:18%;background:#f05b68;color:#fff;border:2px solid #fff;border-radius:99px;min-width:15px;height:15px;padding:0 2px;line-height:11px;font-size:7px;font-weight:800}
@media(max-width:390px){.bd-header-inner{gap:7px}.bd-icon-btn{width:36px;height:36px}.bd-logo{gap:5px}.bd-logo-mark{width:28px;height:28px}}
@media(max-width:359px){.bd-greeting small{display:none}}
@media(min-width:700px){.bd-shell{width:min(100% - 42px,1120px)}.bd-greeting strong{font-size:18px}.bd-greeting small{font-size:12.5px}.bd-logo{font-size:22px}}
@media(min-width:980px){.bd-header-inner{min-height:72px;grid-template-columns:auto auto 1fr auto auto}.bd-desktop-nav{display:flex;align-items:center;justify-content:center;gap:4px}.bd-desktop-nav button{border:0;background:transparent;padding:9px 12px;color:#69718c;font-size:12px;font-weight:800;border-radius:10px;cursor:pointer}.bd-desktop-nav button.active,.bd-desktop-nav button:hover{color:#4f5ed4;background:#eef0ff}.bd-logo{position:absolute;left:50%;transform:translateX(-50%)}.bd-bottom{display:none}}
/* ==== end shared navigation ==== */
*{box-sizing:border-box}html,body{margin:0;min-width:320px;overflow-x:hidden;background:linear-gradient(180deg,#f7fcfb,#edf5f6 48%,#f5f1fb)}button{font:inherit;cursor:pointer}.or-app{min-height:100vh;padding-bottom:104px;position:relative;isolation:isolate;overflow-x:hidden}.or-app:before,.or-app:after{content:"";position:fixed;z-index:-1;border-radius:50%;pointer-events:none}.or-app:before{width:310px;height:310px;left:-175px;top:110px;background:radial-gradient(circle,rgba(91,108,255,.16),transparent 68%)}.or-app:after{width:390px;height:390px;right:-230px;top:430px;background:radial-gradient(circle,rgba(0,169,199,.14),transparent 68%)}.or-shell{width:min(100% - 28px,1120px);max-width:100%;margin:auto}
.or-main{padding-top:16px}.or-title{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:9px 0 14px}.or-title small{display:block;font-size:9px;letter-spacing:1.5px;font-weight:900;color:#676eaa}.or-title h1{font-size:25px;line-height:1.06;letter-spacing:-.9px;margin:5px 0 0}.or-title p{font-size:11px;color:var(--muted);margin:6px 0 0;line-height:1.45}.or-title-art{width:52px;height:52px;border-radius:17px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 58%,#00a9c7);box-shadow:0 12px 24px rgba(71,80,188,.24);flex:0 0 auto}
.or-tabs-wrap{position:sticky;top:64px;z-index:30;padding:8px 0 11px;background:linear-gradient(180deg,rgba(247,252,251,.98) 65%,transparent)}.or-tabs{position:relative;padding:6px;border:1px solid rgba(207,216,235,.9);border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.97),rgba(244,248,255,.93));display:grid;grid-template-columns:1fr 1fr;gap:7px;box-shadow:0 12px 30px rgba(48,58,108,.11),inset 0 1px 0 #fff;overflow:hidden}.or-tab{position:relative;overflow:hidden;border:1px solid transparent;border-radius:16px;padding:12px 8px;background:rgba(255,255,255,.5);color:#727b93;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:7px}.or-tab.active{color:#fff;background:linear-gradient(125deg,#2457e6,#5a55eb 52%,#7849e5);box-shadow:0 10px 22px rgba(73,81,191,.28)}.or-tab-count{min-width:22px;height:22px;padding:0 6px;border-radius:99px;display:grid;place-items:center;background:#edf0f7;color:#68708a;font-size:9px}.or-tab.active .or-tab-count{background:rgba(255,255,255,.2);color:#fff}
.or-list{display:grid;gap:14px}.or-card{position:relative;overflow:hidden;background:rgba(255,255,255,.94);border:1px solid rgba(220,225,238,.95);border-radius:23px;box-shadow:0 13px 34px rgba(48,58,108,.09)}.or-card:before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,#2457e6,#6c4ee7,#00a9c7)}.or-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:16px 16px 12px}.or-id small{display:block;color:#757e94;font-size:8px;letter-spacing:1px;font-weight:900}.or-id strong{display:block;font-size:13px;margin-top:4px}.or-time{display:flex;align-items:center;gap:5px;color:#65758b;font-size:9px;margin-top:6px}.or-response{min-width:112px;padding:8px 9px;border-radius:14px;color:#fff;text-align:center;background:linear-gradient(135deg,#ed5665,#fa8c3a);box-shadow:0 8px 18px rgba(235,89,76,.22)}.or-response small{display:flex;align-items:center;justify-content:center;gap:4px;font-size:7px;letter-spacing:.7px;font-weight:900}.or-response strong{display:block;font-size:15px;margin-top:4px;font-variant-numeric:tabular-nums}.or-source{margin:0 16px 12px;display:inline-flex;align-items:center;gap:5px;padding:6px 8px;border-radius:9px;color:#6846d4;background:#eee9ff;font-size:8px;font-weight:900}.or-source.verified{color:#087f5b;background:#def7ed}
.or-materials{margin:0 16px;padding:6px;border-radius:18px;background:linear-gradient(135deg,#f4f6ff,#f0fbfa);border:1px solid #e3e8f1}.or-material{display:grid;grid-template-columns:52px minmax(0,1fr);gap:11px;align-items:center;padding:8px}.or-material+.or-material{border-top:1px solid #e1e6ef}.or-image{width:52px;height:52px;border-radius:13px;background:#fff;border:1px solid #e1e5ee;overflow:hidden;display:grid;place-items:center}.or-image img{width:100%;height:100%;object-fit:cover}.or-material-grid{display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;gap:6px}.or-material-grid span{min-width:0}.or-material-grid small{display:block;color:#7b8498;font-size:7px;letter-spacing:.7px;font-weight:850}.or-material-grid strong{display:block;font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.or-material-grid span:last-child{text-align:right}.or-material-grid span:last-child strong{color:#5d4bd2}
.or-foot{padding:14px 16px 16px}.or-route{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border-radius:15px;background:#fff8ef;border:1px solid #ffe4c4}.or-pickup{display:flex;align-items:center;gap:9px;min-width:0}.or-pickup i{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;color:#14916a;background:#e1f8ef;flex:0 0 auto}.or-pickup small{display:block;color:#8d765f;font-size:8px}.or-pickup strong{display:block;font-size:10px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.or-nav-btn{border:0;border-radius:10px;padding:8px 9px;color:#3275bd;background:#fff;display:flex;align-items:center;gap:4px;font-size:8px;font-weight:900;white-space:nowrap}.or-detail-btn{width:100%;margin-top:11px;border:0;border-radius:14px;padding:12px;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 58%,#00a9c7);font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 9px 20px rgba(79,87,198,.22)}.or-award{position:relative;overflow:hidden;background:rgba(255,255,255,.95);border:1px solid rgba(220,225,238,.95);border-radius:23px;box-shadow:0 13px 34px rgba(48,58,108,.09)}.or-award:before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,#19a875,#00a9c7,#6c4ee7)}.or-award-head{display:flex;justify-content:space-between;gap:10px;padding:16px 16px 12px}.or-award-id small{display:block;color:#757e94;font-size:8px;letter-spacing:1px;font-weight:900}.or-award-id strong{display:block;font-size:13px;margin-top:4px}.or-bid-ref{align-self:flex-start;padding:7px 9px;border-radius:10px;color:#5e47ce;background:#eee9ff;font-size:8px;font-weight:900}.or-award-source{margin:0 16px 12px;display:inline-flex;align-items:center;gap:5px;padding:6px 8px;border-radius:9px;color:#087f5b;background:#def7ed;font-size:8px;font-weight:900}.or-award-materials{margin:0 16px;padding:13px;border-radius:18px;background:linear-gradient(135deg,#f4f6ff,#eefbfa);border:1px solid #e3e8f1}.or-award-label{font-size:8px;letter-spacing:1.1px;font-weight:900;color:#7b8498}.or-chip-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:9px}.or-mat-chip{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:13px;background:#fff;border:1px solid #e1e6ef;box-shadow:0 4px 12px rgba(48,58,108,.06)}.or-mat-icon{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#6c5cf5,#8d63eb)}.or-mat-chip:nth-child(2) .or-mat-icon{background:linear-gradient(135deg,#f28a33,#ffad4d)}.or-mat-chip b{display:block;font-size:10px}.or-mat-chip small{display:block;color:#748096;font-size:8px;margin-top:2px}.or-award-route{position:relative;margin:16px 16px 0}.or-award-route:before{content:"";position:absolute;left:17px;top:29px;bottom:29px;width:2px;background:linear-gradient(#19a875,#6c4ee7)}.or-route-stop{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:9px;position:relative}.or-route-stop+.or-route-stop{margin-top:14px}.or-route-stop i{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#e1f8ef;color:#14916a;border:4px solid #fff;box-shadow:0 0 0 1px #dce6e7;z-index:1}.or-route-stop.drop i{background:#ede9ff;color:#6b50dc}.or-route-stop small{display:block;color:#758095;font-size:8px;letter-spacing:.8px;font-weight:900}.or-route-stop b{display:block;font-size:10px;line-height:1.35;margin-top:2px}.or-route-tag{padding:7px 9px;border-radius:10px;background:#edf5ff;color:#3275bd;font-size:9px;font-weight:900;white-space:nowrap}.or-award-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:15px 16px 0}.or-meta-box{padding:11px;border-radius:14px;background:#f7f8fc;border:1px solid #e6e9f1}.or-meta-box small{display:block;color:#7b8498;font-size:8px}.or-meta-box b{display:block;font-size:10px;margin-top:3px}.or-vehicles{margin:10px 16px 0;padding:11px 12px;border-radius:15px;background:#fff8ef;border:1px solid #ffe4c4}.or-vehicles small{display:block;color:#936f51;font-size:8px;font-weight:900;letter-spacing:.7px}.or-vehicle-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.or-vehicle-chip{padding:7px 9px;border-radius:10px;background:#fff;color:#6846d4;border:1px solid #ece5ff;font-size:9px;font-weight:900}.or-award-foot{padding:14px 16px 16px}.or-empty{text-align:center;padding:38px 18px;background:#fff;border:1px solid #e1e6ef;border-radius:22px}.or-empty i{width:52px;height:52px;border-radius:17px;display:grid;place-items:center;margin:auto;color:#6450dd;background:#eeeaff}.or-empty h2{font-size:16px;margin:11px 0 0}.or-empty p{font-size:10px;color:var(--muted)}
@media(max-width:390px){.or-title h1{font-size:22px}.or-response{min-width:104px}.or-material{grid-template-columns:46px minmax(0,1fr)}.or-image{width:46px;height:46px}}
@media(min-width:700px){.or-shell{width:min(100% - 42px,1120px)}.or-main{padding-top:22px}.or-title h1{font-size:31px}.or-tabs{width:430px}.or-list{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.or-material-grid strong{font-size:11px}}
@media(min-width:980px){.or-app{padding-bottom:35px}.or-tabs-wrap{top:72px}}
`;

function ResponseTimer({initialSeconds}){
  const [seconds,setSeconds]=useState(Math.max(0,initialSeconds||0));
  useEffect(()=>{
    if(seconds<=0)return;
    const timer=setInterval(()=>setSeconds(value=>Math.max(0,value-1)),1000);
    return()=>clearInterval(timer);
  },[seconds>0]);
  const minutes=String(Math.floor(seconds/60)).padStart(2,"0");
  const secs=String(seconds%60).padStart(2,"0");
  return <div className="or-response" role="timer" aria-label={`${minutes} minutes ${secs} seconds left`}>
    <small><Clock3 size={9}/>SELLER RESPONSE IN</small>
    <strong>{minutes} : {secs}</strong>
  </div>;
}

function StoneRateOrderCard({order,onViewStoneRateDetails}){
  return <article className="or-award">
    <div className="or-award-head"><div className="or-award-id"><small>ORDER ID</small><strong>{order.id}</strong><span className="or-time"><Clock3 size={11}/>{order.placedAt}</span></div><span className="or-bid-ref">BID ID · {order.bidId}</span></div>
    <span className="or-award-source"><ShieldCheck size={11}/>By StoneRate · Bid awarded</span>
    <div className="or-award-materials"><div className="or-award-label">MATERIALS REQUIRED</div><div className="or-chip-row">{order.materials.map((material,index)=><div className="or-mat-chip" key={material.id}><i className="or-mat-icon">{index?<PackageCheck size={15}/>:<Mountain size={15}/>}</i><span><b>{material.name}</b><small>{material.quantity}</small></span></div>)}</div></div>
    <div className="or-award-route"><div className="or-route-stop"><i><Navigation size={15}/></i><span><small>PICKUP LOCATION</small><b>{order.pickup}</b></span><span className="or-route-tag">Start</span></div><div className="or-route-stop drop"><i><MapPin size={15}/></i><span><small>DROP LOCATION</small><b>{order.drop}</b></span><span className="or-route-tag">{order.distanceKm} km</span></div></div>
    <div className="or-award-meta"><div className="or-meta-box"><small>PICKUP DATE</small><b>{order.pickupDate}</b></div><div className="or-meta-box"><small>EXPECTED TIME</small><b>{order.expectedTime}</b></div></div>
    <div className="or-vehicles"><small>VEHICLES</small><div className="or-vehicle-chips">{order.vehicleAllocation.map(vehicle=><span className="or-vehicle-chip" key={vehicle.type}>{vehicle.type} · {vehicle.count}</span>)}</div></div>
    <div className="or-award-foot"><button type="button" className="or-detail-btn" onClick={()=>onViewStoneRateDetails(order)}>View details<ChevronRight size={14}/></button></div>
  </article>;
}

function OrderCard({order,onNavigate,onViewDetails}){
  return <article className="or-card">
    <div className="or-head">
      <div className="or-id"><small>ORDER ID</small><strong>{order.id}</strong><span className="or-time"><Clock3 size={11}/>{order.placedAt}</span></div>
      <ResponseTimer initialSeconds={order.responseSeconds}/>
    </div>
    <span className={cx("or-source",order.verified&&"verified")}>{order.verified?<ShieldCheck size={11}/>:<PackageCheck size={11}/>} {order.source}</span>
    <div className="or-materials">
      {order.materials.map(material=><div className="or-material" key={material.id}>
        <span className="or-image"><img src={material.image} alt="" loading="lazy"/></span>
        <div className="or-material-grid">
          <span><small>MATERIAL</small><strong>{material.name}</strong></span>
          <span><small>QUANTITY</small><strong>{material.quantity}</strong></span>
          <span><small>VEHICLES</small><strong>{material.vehicles} {material.vehicles===1?"vehicle":"vehicles"}</strong></span>
        </div>
      </div>)}
    </div>
    <div className="or-foot">
      <div className="or-route">
        <div className="or-pickup"><i><MapPin size={16}/></i><span><small>PICKUP</small><strong>{order.pickup}</strong></span></div>
        <button type="button" className="or-nav-btn" onClick={()=>onNavigate(order)}><Navigation size={13}/>Navigation</button>
      </div>
      <button type="button" className="or-detail-btn" onClick={()=>onViewDetails(order)}>View details<ChevronRight size={14}/></button>
    </div>
  </article>;
}

export default function StoneRateTransporterOrders({
  transporter={name:"Ramesh"},
  yourOrders=MOCK_YOUR_ORDERS,
  stoneRateOrders=MOCK_STONERATE_ORDERS,
  unreadNotifications=2,
  onNavigation=()=>{},
  onNavigate=()=>{},
  onViewDetails=()=>{},
  onViewStoneRateDetails=()=>{},
  onRefresh=()=>{},
  onNotifications=()=>{},
  onMenu=()=>{}
}){
  const [tab,setTab]=useState("yours");
  const orders=useMemo(()=>tab==="yours"?yourOrders:stoneRateOrders,[tab,yourOrders,stoneRateOrders]);
  const navTo=label=>onNavigation(label);
  return <div className="or-app"><style>{styles}</style>
    <header className="bd-header"><div className="bd-shell bd-header-inner">
      <button type="button" className="bd-icon-btn" aria-label="Open menu" onClick={onMenu}><Menu size={19}/></button>
      <div className="bd-greeting"><strong>Hi, {transporter?.name||"Transporter"}</strong><small>Track and manage your orders</small></div>
      <div className="bd-logo" aria-label="StoneRate"><span className="bd-logo-mark"><Mountain size={17}/></span><span>Stone<span className="bd-logo-rate">Rate</span></span></div>
      <nav className="bd-desktop-nav" aria-label="Desktop navigation">
        {NAV_ITEMS.map(item => <button type="button" key={item.label} className={item.label === "Orders" ? "active" : ""} onClick={() => navTo(item.label)}>{item.label}</button>)}
      </nav>
      <button type="button" className="bd-icon-btn" aria-label={`Notifications, ${unreadNotifications} unread`} onClick={onNotifications}><Bell size={19}/>{unreadNotifications > 0 && <span className="bd-notify-dot"/>}</button>
    </div></header>
    <main className="or-shell or-main">
      <section className="or-title"><div><small>TRANSPORT ORDER DESK</small><h1>Your delivery orders</h1><p>Review direct buyer orders and trips awarded through StoneRate bidding.</p></div><span className="or-title-art"><PackageCheck size={25}/></span></section>
      <div className="or-tabs-wrap"><div className="or-tabs" role="tablist" aria-label="Order filters">
        <button type="button" role="tab" aria-selected={tab==="yours"} className={cx("or-tab",tab==="yours"&&"active")} onClick={()=>setTab("yours")}><Truck size={15}/>Your Orders<span className="or-tab-count">{yourOrders.length}</span></button>
        <button type="button" role="tab" aria-selected={tab==="stoneRate"} className={cx("or-tab",tab==="stoneRate"&&"active")} onClick={()=>setTab("stoneRate")}><ShieldCheck size={15}/>By StoneRate<span className="or-tab-count">{stoneRateOrders.length}</span></button>
      </div></div>
      <section className="or-list" aria-live="polite">
        {orders.length?orders.map(order=>tab==="stoneRate"?<StoneRateOrderCard key={order.id} order={order} onViewStoneRateDetails={onViewStoneRateDetails}/>:<OrderCard key={order.id} order={order} onNavigate={onNavigate} onViewDetails={onViewDetails}/>):<div className="or-empty"><i><PackageCheck size={24}/></i><h2>No orders available</h2><p>New transporter orders will appear here.</p></div>}
      </section>
    </main>
    <nav className="bd-bottom" aria-label="Mobile navigation">
      {NAV_ITEMS.map(item => { const Icon = item.icon; const active = item.label === "Orders"; const badge = ({ Orders: orders.length })[item.label] || 0;
        return <button type="button" key={item.label} className={cx("bd-nav-item", active && "active")} aria-current={active ? "page" : undefined} onClick={() => navTo(item.label)}>
          {badge > 0 && <span className="bd-nav-badge">{Math.min(badge, 9)}</span>}
          {active ? <span className="bd-active-icon"><Icon size={NAV_ICON_ACTIVE}/></span> : <Icon size={NAV_ICON_SIZE}/>}
          <span>{item.label}</span>
        </button>; })}
    </nav>
  </div>;
}
