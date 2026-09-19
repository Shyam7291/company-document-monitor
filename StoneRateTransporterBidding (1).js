import React, { useEffect, useMemo, useState } from "react";
import StoneRateBidDetails from "./StoneRateBidDetails";
import {
  Bell, ChevronRight, Clock3, Gavel, Home, Images,
  MapPin, Menu, Mountain, Navigation, PackageCheck, Layers3,
  ShieldCheck, UserRound, UsersRound
} from "lucide-react";

/*
  StoneRate Transporter Bidding Page
  One-file React component with embedded CSS.
  Dependencies: react, lucide-react
*/

const MOCK_BIDS = [
  {
    id: "BID-260916-5363",
    materials: [
      { name: "Medium Stone", quantity: "10 ton", type: "stone" },
      { name: "Sand", quantity: "200 feet", type: "sand" }
    ],
    pickup: "Dalla",
    drop: "Kuddupur, Jaunpur, Uttar Pradesh",
    distanceKm: 45,
    applicants: 10,
    secondsLeft: 1 * 3600 + 23 * 60 + 35,
    ended: false
  },
  {
    id: "BID-260916-8147",
    materials: [
      { name: "40mm Crushed Stone", quantity: "18 ton", type: "stone" }
    ],
    pickup: "Dalla",
    drop: "Shahganj, Jaunpur, Uttar Pradesh",
    distanceKm: 52,
    applicants: 7,
    secondsLeft: 42 * 60 + 18,
    ended: false
  }
];

const MOCK_MY_BIDS = [
  {
    ...MOCK_BIDS[0],
    id: "BID-260916-3926",
    ended: true,
    applicants: 14,
    position: 3,
    yourBid: 4850
  },
  {
    ...MOCK_BIDS[1],
    id: "BID-260916-7054",
    ended: true,
    applicants: 9,
    position: 1,
    yourBid: 6200
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
const money = value => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(Number(value) || 0);

const styles = `
:root{--ink:#10243e;--muted:#65758b;--line:#dfe8ee;--indigo:#2457e6;--violet:#6c4ee7;--cyan:#00a9c7;--green:#19a875;--orange:#f28a33;--red:#e95c69;font-family:"Plus Jakarta Sans",Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:#edf5f6}
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
*{box-sizing:border-box}html{overflow-x:hidden}body{margin:0;min-width:320px;max-width:100%;overflow-x:hidden;background:linear-gradient(180deg,#f7fcfb 0%,#edf5f6 48%,#f5f1fb 100%)}button{font:inherit;cursor:pointer}button:focus-visible{outline:3px solid rgba(91,108,255,.28);outline-offset:2px}
.bd-app{min-height:100vh;position:relative;isolation:isolate;padding-bottom:104px;overflow-x:hidden}.bd-app:before,.bd-app:after{content:"";position:fixed;z-index:-1;border-radius:50%;pointer-events:none}.bd-app:before{width:300px;height:300px;left:-160px;top:100px;background:radial-gradient(circle,rgba(91,108,255,.17),transparent 68%)}.bd-app:after{width:380px;height:380px;right:-220px;top:380px;background:radial-gradient(circle,rgba(0,169,199,.15),transparent 68%)}
.bd-main{padding-top:16px}.bd-title{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:9px 0 14px}.bd-title small{display:block;font-size:9px;letter-spacing:1.5px;font-weight:900;color:#676eaa}.bd-title h1{font-size:25px;line-height:1.06;letter-spacing:-.9px;margin:5px 0 0}.bd-title p{font-size:11px;color:var(--muted);margin:6px 0 0;line-height:1.45}.bd-title-art{width:52px;height:52px;border-radius:17px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 58%,#00a9c7);box-shadow:0 12px 24px rgba(71,80,188,.24);flex:0 0 auto}
.bd-tabs-wrap{position:sticky;top:64px;z-index:30;padding:8px 0 11px;background:linear-gradient(180deg,rgba(247,252,251,.98) 65%,rgba(247,252,251,0))}.bd-tabs{position:relative;padding:6px;border:1px solid rgba(207,216,235,.9);border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.96),rgba(244,248,255,.92));display:grid;grid-template-columns:1fr 1fr;gap:7px;box-shadow:0 12px 30px rgba(48,58,108,.11),inset 0 1px 0 #fff;overflow:hidden}.bd-tabs:before{content:"";position:absolute;width:100px;height:100px;left:-40px;top:-58px;border-radius:50%;background:radial-gradient(circle,rgba(91,108,255,.16),transparent 70%);pointer-events:none}.bd-tab{position:relative;isolation:isolate;overflow:hidden;border:1px solid transparent;border-radius:16px;padding:12px 9px;background:rgba(255,255,255,.48);color:#727b93;font-size:12px;font-weight:850;display:flex;align-items:center;justify-content:center;gap:7px;transition:transform .2s ease,box-shadow .2s ease,color .2s ease,border-color .2s ease}.bd-tab:after{content:"";position:absolute;inset:auto -25px -35px auto;width:70px;height:70px;border-radius:50%;background:rgba(108,78,231,.09);z-index:-1}.bd-tab:hover{transform:translateY(-1px);border-color:#d9ddf1;color:#5662c8;background:#fff}.bd-tab.active{color:#fff;border-color:rgba(255,255,255,.22);background:linear-gradient(125deg,#2457e6 0%,#5a55eb 52%,#7849e5 100%);box-shadow:0 10px 22px rgba(73,81,191,.28),inset 0 1px 0 rgba(255,255,255,.22)}.bd-tab.active:before{content:"";position:absolute;width:70px;height:70px;right:-28px;top:-42px;border-radius:50%;background:rgba(255,255,255,.16);z-index:-1}.bd-tab.active:after{background:rgba(0,191,219,.2)}.bd-tab-count{min-width:22px;height:22px;padding:0 6px;border-radius:99px;display:grid;place-items:center;background:#edf0f7;color:#68708a;font-size:9px;font-weight:900;box-shadow:inset 0 0 0 1px rgba(111,121,151,.06)}.bd-tab.active .bd-tab-count{background:rgba(255,255,255,.2);color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.13)}
.bd-list{display:grid;gap:14px}.bd-card{position:relative;overflow:hidden;background:rgba(255,255,255,.92);border:1px solid rgba(220,225,238,.95);border-radius:23px;box-shadow:0 13px 34px rgba(48,58,108,.09)}.bd-card:before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,#2457e6,#6c4ee7,#00a9c7)}.bd-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:15px 16px 9px}.bd-bid-id{display:flex;align-items:center;gap:7px;color:#626b84;font-size:9px;font-weight:900;letter-spacing:.7px}.bd-verified{display:inline-flex;align-items:center;gap:4px;margin-top:7px;padding:5px 7px;border-radius:8px;background:#e2f7f1;color:#0a8963;font-size:8.5px;font-weight:850}.bd-timer{min-width:116px;padding:7px 8px;border-radius:14px;color:#fff;background:linear-gradient(135deg,#ec5966,#f48a3c);box-shadow:0 8px 18px rgba(232,92,80,.22);text-align:center;align-self:flex-start}.bd-timer-label{display:flex;align-items:center;justify-content:center;gap:4px;font-size:7px;font-weight:850;letter-spacing:.65px;opacity:.9;line-height:1}.bd-time{display:flex;align-items:center;justify-content:center;gap:3px;margin-top:4px}.bd-time-box{min-width:24px;padding:4px 3px;border-radius:7px;background:rgba(255,255,255,.18);font-size:13px;font-weight:900;line-height:1}.bd-time-sep{font-size:12px;font-weight:900;line-height:1}.bd-time-units{display:none}.bd-ended{min-width:110px;padding:10px;border-radius:14px;text-align:center;color:#9b4b19;background:#fff0df;border:1px solid #ffd7b5}.bd-ended strong{display:block;font-size:11px}.bd-ended small{display:block;font-size:8px;margin-top:3px}
.bd-materials{margin:0 16px;padding:13px;border-radius:17px;background:linear-gradient(135deg,#f4f6ff,#f1fbfa);border:1px solid #e4e8f2}.bd-section-label{font-size:8px;letter-spacing:1.2px;font-weight:900;color:#7c8499}.bd-material-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:9px}.bd-material-chip{display:flex;align-items:center;gap:7px;padding:8px 10px;border-radius:12px;background:#fff;border:1px solid #e5e8f2;box-shadow:0 4px 12px rgba(55,63,105,.06);font-size:10px;font-weight:800}.bd-material-icon{width:27px;height:27px;border-radius:9px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#5b6cff,#8b63eb)}.bd-material-chip:nth-child(2) .bd-material-icon{background:linear-gradient(135deg,#ef8a34,#f5b24d)}.bd-material-chip span span{display:block;color:var(--muted);font-size:8px;margin-top:2px;font-weight:700}
.bd-route{position:relative;margin:14px 16px 0;padding:2px 0}.bd-route:before{content:"";position:absolute;left:17px;top:26px;bottom:27px;width:2px;background:linear-gradient(#1bb17d,#7860ed)}.bd-stop{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:9px;position:relative}.bd-stop+.bd-stop{margin-top:14px}.bd-stop-icon{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#e2f8f0;color:#14916a;border:4px solid #fff;box-shadow:0 0 0 1px #dfe6e9;z-index:1}.bd-stop.drop .bd-stop-icon{background:#eeebff;color:#6b50dc}.bd-stop small{display:block;color:var(--muted);font-size:8px;text-transform:uppercase;letter-spacing:.9px;font-weight:800}.bd-stop strong{display:block;font-size:11px;line-height:1.35;margin-top:2px}.bd-distance{padding:7px 9px;border-radius:10px;background:#eef5ff;color:#3275bd;font-size:10px;font-weight:900;white-space:nowrap}
.bd-competition{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;margin:15px 16px 0;padding:11px 12px;border-radius:15px;background:#fff8ef;border:1px solid #ffe5c7}.bd-people{display:flex;align-items:center;gap:9px}.bd-people-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;color:#c26620;background:#ffebd6}.bd-people strong{display:block;font-size:10.5px}.bd-people small{display:block;color:#9a7657;font-size:8.5px;margin-top:2px}.bd-position{padding:7px 9px;border-radius:10px;background:#fff;color:#6546d4;border:1px solid #e4dcff;text-align:center}.bd-position small{display:block;font-size:7px;color:#8176a8}.bd-position strong{display:block;font-size:15px;margin-top:1px}.bd-card-actions{padding:15px 16px 16px}.bd-bid-btn{width:100%;border:0;border-radius:14px;padding:13px;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 58%,#00a9c7);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 10px 22px rgba(79,87,198,.24);transition:.2s}.bd-bid-btn:hover{transform:translateY(-2px);box-shadow:0 14px 26px rgba(79,87,198,.29)}.bd-result{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border-radius:14px;background:#f5f3ff;border:1px solid #e5dfff}.bd-result span{font-size:9px;color:#70678e}.bd-result strong{display:block;font-size:14px;color:#523ac3;margin-top:2px}.bd-view-btn{border:0;border-radius:10px;padding:9px 10px;background:#fff;color:#5b4ac4;font-size:9px;font-weight:850;display:flex;align-items:center;gap:3px}
.bd-empty{text-align:center;padding:38px 18px;background:#fff;border:1px solid #e1e6ef;border-radius:22px}.bd-empty-icon{width:52px;height:52px;border-radius:17px;display:grid;place-items:center;margin:0 auto 12px;color:#6450dd;background:#eeeaff}.bd-empty h2{font-size:16px;margin:0}.bd-empty p{font-size:10px;color:var(--muted);line-height:1.5;max-width:300px;margin:6px auto 0}
.bd-toast{position:fixed;left:50%;bottom:101px;z-index:90;transform:translateX(-50%);padding:10px 14px;border-radius:12px;background:#171d3d;color:#fff;font-size:10px;font-weight:800;white-space:nowrap;box-shadow:0 10px 24px rgba(20,26,61,.25)}
@media(max-width:390px){.bd-title h1{font-size:22px}.bd-timer{min-width:104px;padding:7px 6px}.bd-card-head{padding-left:13px;padding-right:13px}.bd-materials,.bd-route,.bd-competition{margin-left:13px;margin-right:13px}}
@media(min-width:700px){.bd-main{padding-top:22px}.bd-title h1{font-size:31px}.bd-list{grid-template-columns:repeat(2,minmax(0,1fr));align-items:start}.bd-modal-wrap{place-items:center}.bd-tabs{width:430px}}
@media(min-width:980px){.bd-app{padding-bottom:35px}.bd-toast{bottom:28px}.bd-tabs-wrap{top:72px}}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

function Timer({ initialSeconds }) {
  const [seconds, setSeconds] = useState(Math.max(0, initialSeconds || 0));
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds > 0]);
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  if (!seconds) return <div className="bd-ended"><strong>Bidding ended</strong><small>This bid is now closed</small></div>;
  return <div className="bd-timer" role="timer" aria-label={`${hours} hours ${minutes} minutes ${secs} seconds left`}>
    <div className="bd-timer-label"><Clock3 size={10}/> TIME LEFT</div>
    <div className="bd-time"><span className="bd-time-box">{hours}</span><span className="bd-time-sep">:</span><span className="bd-time-box">{minutes}</span><span className="bd-time-sep">:</span><span className="bd-time-box">{secs}</span></div>
    <div className="bd-time-units"><span>HOUR</span><span>MIN</span><span>SEC</span></div>
  </div>;
}

function BidCard({ bid, isMyBid, onMakeBid, onView }) {
  return <article className="bd-card">
    <div className="bd-card-head">
      <div>
        <div className="bd-bid-id"><Gavel size={13}/>{bid.id}</div>
        <span className="bd-verified"><ShieldCheck size={10}/> VERIFIED STONERATE LOAD</span>
      </div>
      {isMyBid || bid.ended
        ? <div className="bd-ended"><strong>Bidding ended</strong><small>Final ranking available</small></div>
        : <Timer initialSeconds={bid.secondsLeft}/>
      }
    </div>

    <div className="bd-materials">
      <div className="bd-section-label">MATERIALS REQUIRED</div>
      <div className="bd-material-row">
        {bid.materials.map((material, index) => <div className="bd-material-chip" key={`${material.name}-${index}`}>
          <span className="bd-material-icon">{material.type === "sand" ? <Layers3 size={15}/> : <Mountain size={15}/>}</span>
          <span>{material.name}<span>{material.quantity}</span></span>
        </div>)}
      </div>
    </div>

    <div className="bd-route">
      <div className="bd-stop">
        <span className="bd-stop-icon"><Navigation size={15}/></span>
        <span><small>Pickup location</small><strong>{bid.pickup}</strong></span>
        <span className="bd-distance">Start</span>
      </div>
      <div className="bd-stop drop">
        <span className="bd-stop-icon"><MapPin size={15}/></span>
        <span><small>Drop location</small><strong>{bid.drop}</strong></span>
        <span className="bd-distance">{bid.distanceKm} km</span>
      </div>
    </div>

    <div className="bd-competition">
      <div className="bd-people">
        <span className="bd-people-icon"><UsersRound size={17}/></span>
        <span><strong>{bid.applicants} transporters applied</strong><small>{isMyBid ? "Final competition count" : "Competition is increasing"}</small></span>
      </div>
      {isMyBid && <span className="bd-position"><small>YOUR POSITION</small><strong>#{bid.position}</strong></span>}
    </div>

    <div className="bd-card-actions">
      {isMyBid
        ? <div className="bd-result"><span>Your submitted bid<strong>{money(bid.yourBid)}</strong></span><button className="bd-view-btn" onClick={() => onView(bid)}>View details<ChevronRight size={12}/></button></div>
        : <button type="button" className="bd-bid-btn" onClick={() => onMakeBid(bid)}><Gavel size={16}/>Make my bid<ChevronRight size={15}/></button>
      }
    </div>
  </article>;
}

export default function StoneRateTransporterBidding({
  transporter = { name: "Ramesh" },
  liveBids = MOCK_BIDS,
  myBids = MOCK_MY_BIDS,
  unreadNotifications = 2,
  onNavigation = () => {},
  onNotifications = () => {},
  onMenu = () => {},
  onOpenBidDetails = () => {}
}) {
  const [tab, setTab] = useState("live");
  const [detailsBid, setDetailsBid] = useState(null);
  const [toast, setToast] = useState("");
  const items = useMemo(() => tab === "live" ? liveBids : myBids, [tab, liveBids, myBids]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2300);
    return () => clearTimeout(timer);
  }, [toast]);

  const openDetailsPage = bid => {
    const normalizedBid = {
      ...bid,
      requirement: bid.requirement || "Jaunpur registration vehicles",
      viewMode: bid.ended || bid.position ? "myBid" : "live",
      submittedTotal: Number(bid.yourBid) || 0,
      materials: (bid.materials || []).map(item => ({
        name: item.name,
        qty: item.qty || item.quantity
      }))
    };

    setDetailsBid(normalizedBid);
    onOpenBidDetails(normalizedBid);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  if (detailsBid) {
    return (
      <StoneRateBidDetails
        bid={detailsBid}
        onBack={() => setDetailsBid(null)}
        onRefresh={() => setDetailsBid(current => current ? { ...current } : current)}
        onBidSubmitted={(payload) => console.log("Bid submitted:", payload)}
      />
    );
  }

  const navTo = label => {
    onNavigation(label);
    if (label !== "Bidding") setToast(`${label} selected`);
  };



  return <div className="bd-app"><style>{styles}</style>
    <header className="bd-header"><div className="bd-shell bd-header-inner">
      <button type="button" className="bd-icon-btn" aria-label="Open menu" onClick={onMenu}><Menu size={19}/></button>
      <div className="bd-greeting"><strong>Hi, {transporter?.name || "Transporter"}</strong><small>Find the right load and bid</small></div>
      <div className="bd-logo" aria-label="StoneRate"><span className="bd-logo-mark"><Mountain size={17}/></span><span>Stone<span className="bd-logo-rate">Rate</span></span></div>
      <nav className="bd-desktop-nav" aria-label="Desktop navigation">
        {NAV_ITEMS.map(item => <button type="button" key={item.label} className={item.label === "Bidding" ? "active" : ""} onClick={() => navTo(item.label)}>{item.label}</button>)}
      </nav>
      <button type="button" className="bd-icon-btn" aria-label={`Notifications, ${unreadNotifications} unread`} onClick={onNotifications}><Bell size={19}/>{unreadNotifications > 0 && <span className="bd-notify-dot"/>}</button>
    </div></header>

    <main className="bd-shell bd-main">
      <section className="bd-title">
        <div><small>SMART TRANSPORT BIDDING</small><h1>Win your next trip</h1><p>Review verified loads, compare distance, and submit your best transport rate.</p></div>
        <span className="bd-title-art"><Gavel size={25}/></span>
      </section>

      <div className="bd-tabs-wrap">
        <div className="bd-tabs" role="tablist" aria-label="Bidding filters">
          <button role="tab" aria-selected={tab === "live"} className={cx("bd-tab", tab === "live" && "active")} onClick={() => setTab("live")}><Clock3 size={15}/>Live Biddings<span className="bd-tab-count">{liveBids.length}</span></button>
          <button role="tab" aria-selected={tab === "mine"} className={cx("bd-tab", tab === "mine" && "active")} onClick={() => setTab("mine")}><Gavel size={15}/>My Bids<span className="bd-tab-count">{myBids.length}</span></button>
        </div>
      </div>

      <section className="bd-list" aria-live="polite">
        {items.length ? items.map(bid => <BidCard key={bid.id} bid={bid} isMyBid={tab === "mine"} onMakeBid={openDetailsPage} onView={openDetailsPage}/>) : <div className="bd-empty"><span className="bd-empty-icon"><Gavel size={24}/></span><h2>No {tab === "live" ? "live biddings" : "submitted bids"}</h2><p>{tab === "live" ? "New verified transport opportunities will appear here." : "Bids submitted by you will appear here with their position."}</p></div>}
      </section>
    </main>

    <nav className="bd-bottom" aria-label="Mobile navigation">
      {NAV_ITEMS.map(item => { const Icon = item.icon; const active = item.label === "Bidding"; const badge = ({ Bidding: liveBids.length, Orders: unreadNotifications })[item.label] || 0;
        return <button type="button" key={item.label} className={cx("bd-nav-item", active && "active")} aria-current={active ? "page" : undefined} onClick={() => navTo(item.label)}>
          {badge > 0 && <span className="bd-nav-badge">{Math.min(badge, 9)}</span>}
          {active ? <span className="bd-active-icon"><Icon size={NAV_ICON_ACTIVE}/></span> : <Icon size={NAV_ICON_SIZE}/>}
          <span>{item.label}</span>
        </button>; })}
    </nav>



    {toast && <div className="bd-toast" role="status">{toast}</div>}
  </div>;
}
