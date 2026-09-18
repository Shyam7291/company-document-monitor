import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Gavel,
  Info,
  Layers3,
  MapPin,
  Mountain,
  Navigation,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Truck,
  Users,
  X
} from "lucide-react";

const BID = {
  id: "BID-260916-5363",
  secondsLeft: 5015,
  distanceKm: 45,
  pickup: "Dalla",
  drop: "Kuddupur, Jaunpur",
  requirement: "Jaunpur registration vehicles",
  materials: [
    { name: "Medium Stone", qty: "10 ton" },
    { name: "Sand", qty: "200 feet" }
  ]
};
const TOP = [
  { id: "S001", transport: 25000, permit: 2000, total: 27000 },
  { id: "S002", transport: 24000, permit: 3500, total: 27500 },
  { id: "S003", transport: 23000, permit: 5000, total: 28000 }
];
const TYPES = { "12 Tyre": 800, "14 Tyre": 1000, "16 Tyre": 1200 };
const MORE_BIDDERS = 7;

const money = n =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

const css = `
:root{--ink:#10243e;--muted:#68778c;--violet:#6c4ee7;--blue:#2457e6;--green:#17a878;--teal:#00a9c7;--line:#e3e8f1;--grad:linear-gradient(135deg,#2457e6,#6c4ee7 58%,#00a9c7);font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;color:var(--ink)}
*{box-sizing:border-box}
html,body{margin:0;min-width:320px;overflow-x:hidden;background:linear-gradient(180deg,#f8fcfb,#edf5f6 48%,#f5f1fb)}
button,input,select{font:inherit}

@keyframes dt-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes dt-fade{from{opacity:0}to{opacity:1}}
@keyframes dt-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes dt-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes dt-ping{0%,100%{box-shadow:0 0 0 0 rgba(62,230,164,.6)}70%{box-shadow:0 0 0 8px rgba(62,230,164,0)}}
@keyframes dt-urgent{0%,100%{box-shadow:0 10px 22px rgba(235,89,76,.32)}50%{box-shadow:0 10px 30px rgba(235,89,76,.6),0 0 0 4px rgba(237,86,101,.25)}}
@keyframes dt-shine{0%{transform:translateX(-120%) skewX(-18deg)}100%{transform:translateX(220%) skewX(-18deg)}}

/* ---------- App shell & header (unchanged) ---------- */
.dt-app{min-height:100vh;padding-bottom:26px;background:radial-gradient(circle at -10% 20%,rgba(91,108,255,.14),transparent 27%),radial-gradient(circle at 110% 60%,rgba(0,169,199,.13),transparent 28%)}
.dt-shell{width:min(100% - 28px,850px);margin:auto}
.dt-header{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.84);border-bottom:1px solid #dfe5ed;backdrop-filter:blur(18px)}
.dt-head{height:58px;display:grid;grid-template-columns:40px 1fr 40px;align-items:center}
.dt-icon{width:36px;height:36px;border:1px solid #e0e5ef;border-radius:12px;background:#fff;color:var(--ink);display:grid;place-items:center;cursor:pointer}
.dt-logo{justify-self:center;display:flex;align-items:center;gap:6px;font-size:16px;font-weight:900}
.dt-logo i{width:27px;height:27px;border-radius:9px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7,#00a9c7)}
.dt-logo em{font-style:normal;color:var(--violet)}
.dt-main{padding-top:15px}

/* ---------- Hero ---------- */
.dt-hero{position:relative;overflow:hidden;padding:20px 18px 18px;border-radius:26px;color:#fff;background:linear-gradient(135deg,#152b4b,#245b89 55%,#058896);box-shadow:0 22px 44px rgba(44,73,120,.24);animation:dt-rise .5s ease both}
.dt-hero:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:26px 26px;-webkit-mask-image:radial-gradient(circle at 85% 0%,#000,transparent 65%);mask-image:radial-gradient(circle at 85% 0%,#000,transparent 65%)}
.dt-hero:after{content:"";position:absolute;width:240px;height:240px;border-radius:50%;right:-100px;top:-120px;background:radial-gradient(circle,rgba(255,255,255,.22),rgba(255,255,255,.03) 70%)}
.dt-orb{position:absolute;left:-70px;bottom:-90px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(0,169,199,.5),transparent 70%);filter:blur(8px);animation:dt-float 7s ease-in-out infinite}
.dt-hero-top{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.dt-live{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.24);font-size:9px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase}
.dt-live i{width:7px;height:7px;border-radius:50%;background:#3ee6a4;animation:dt-ping 1.6s infinite}
.dt-id small{display:block;font-size:9px;letter-spacing:1.4px;font-weight:800;opacity:.72;margin-top:12px}
.dt-id strong{display:block;font-size:20px;font-weight:800;margin-top:4px;letter-spacing:.2px}
.dt-timer{flex:0 0 auto;padding:9px 11px;border-radius:16px;background:linear-gradient(135deg,#ed5665,#fa8c3a);text-align:center;border:1px solid rgba(255,255,255,.28);box-shadow:0 10px 22px rgba(235,89,76,.32)}
.dt-timer.urgent{animation:dt-urgent 1.2s ease-in-out infinite}
.dt-timer small{display:flex;align-items:center;justify-content:center;gap:4px;font-size:8px;font-weight:800;letter-spacing:1px;text-transform:uppercase;opacity:.95}
.dt-timer-digits{display:flex;align-items:center;justify-content:center;gap:3px;margin-top:6px}
.dt-timer-digits b{min-width:27px;padding:4px 0;border-radius:7px;background:rgba(0,0,0,.2);font-size:14px;font-weight:800;font-variant-numeric:tabular-nums}
.dt-timer-digits i{font-style:normal;font-weight:800;opacity:.85}
.dt-timer-digits em{display:block;font-style:normal;font-size:6px;letter-spacing:.6px;opacity:.7;margin-top:2px}
.dt-stats{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:16px}
.dt-stat{padding:10px;border-radius:14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px)}
.dt-stat small{display:flex;align-items:center;gap:4px;font-size:8px;letter-spacing:1px;text-transform:uppercase;opacity:.75;font-weight:800}
.dt-stat b{display:block;font-size:13px;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dt-mats{position:relative;z-index:1;display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.dt-mat{display:flex;align-items:center;gap:9px;padding:8px 13px 8px 8px;border-radius:14px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.22)}
.dt-mat i{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(255,255,255,.32),rgba(255,255,255,.1))}
.dt-mat b{display:block;font-size:11px;font-weight:800}
.dt-mat span{display:block;font-size:9px;opacity:.8;margin-top:2px}

/* ---------- Cards ---------- */
.dt-card{position:relative;margin-top:14px;padding:18px;border:1px solid rgba(220,225,238,.95);border-radius:24px;background:rgba(255,255,255,.94);box-shadow:0 14px 34px rgba(48,58,108,.09);animation:dt-rise .55s ease both}
.dt-card.delay-1{animation-delay:.08s}.dt-card.delay-2{animation-delay:.16s}
.dt-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px}
.dt-section-head h2{font-size:17px;margin:0;letter-spacing:-.2px}
.dt-section-head span{display:block;font-size:10px;color:var(--muted);margin-top:3px}
.dt-section-icon{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;color:#fff;background:var(--grad);box-shadow:0 8px 18px rgba(75,84,194,.28);flex:0 0 auto}

/* ---------- Route ---------- */
.dt-route{position:relative;padding:4px 0}
.dt-route:before{content:"";position:absolute;left:19px;top:34px;bottom:34px;width:0;border-left:2px dashed #b9c4d6}
.dt-stop{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:11px;position:relative}
.dt-stop+.dt-stop{margin-top:22px}
.dt-stop i{width:40px;height:40px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#d6f7e9,#e9fbf3);color:#10936a;border:3px solid #fff;box-shadow:0 0 0 1px #d8e4e0,0 6px 14px rgba(16,147,106,.16);z-index:1}
.dt-stop.drop i{color:#684ddb;background:linear-gradient(135deg,#e6e0ff,#f1edff);box-shadow:0 0 0 1px #dfd9f5,0 6px 14px rgba(104,77,219,.18)}
.dt-stop small{display:block;color:var(--muted);font-size:9px;letter-spacing:1.1px;font-weight:800;text-transform:uppercase}
.dt-stop b{display:block;font-size:14px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dt-km{display:inline-flex;align-items:center;gap:5px;padding:8px 11px;border-radius:11px;color:#3478bf;background:#edf5ff;border:1px solid #d8e7fb;font-size:10px;font-weight:800;white-space:nowrap}
.dt-km.start{color:#10936a;background:#e6f8f0;border-color:#cdeedd}
.dt-route-badge{position:absolute;left:52px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:#f3f5fb;border:1px solid #e3e8f1;color:#5b6b85;font-size:9px;font-weight:800;z-index:1}
.dt-req{display:flex;gap:11px;align-items:center;margin-top:18px;padding:12px 13px;border-radius:16px;background:linear-gradient(135deg,#fff7ed,#fff3e0);border:1px solid #ffe0bc}
.dt-req i{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#ffd9a8,#ffe9cf);color:#be621b;flex:0 0 auto}
.dt-req small{display:block;color:#936f51;font-size:9px;letter-spacing:1px;font-weight:800}
.dt-req b{display:block;font-size:12px;margin-top:3px;color:#5b3d1f}

/* ---------- Ranking ---------- */
.dt-rank-list{display:grid;gap:10px}
.dt-rank{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:12px;padding:12px 13px;border-radius:18px;border:1px solid var(--line);background:#fbfcfe;transition:transform .2s ease,box-shadow .2s ease}
.dt-rank:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(48,58,108,.1)}
.dt-rank.top{background:linear-gradient(135deg,#f4f2ff,#eefbfa);border-color:#dcd8f7}
.dt-medal{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-size:12px;font-weight:900;color:#fff;box-shadow:inset 0 -3px 0 rgba(0,0,0,.14)}
.dt-medal.m1{background:linear-gradient(135deg,#f6c453,#e69b1a)}
.dt-medal.m2{background:linear-gradient(135deg,#c9d3e0,#93a2b7)}
.dt-medal.m3{background:linear-gradient(135deg,#e0a06a,#b7663a)}
.dt-rank-info b{display:block;font-size:13px;color:#4a3bb5}
.dt-rank-info span{display:flex;flex-wrap:wrap;gap:4px 10px;margin-top:3px;font-size:9px;color:var(--muted)}
.dt-rank-info span em{font-style:normal;color:#4b5a73;font-weight:700}
.dt-rank-bar{height:5px;border-radius:99px;background:#e9edf5;margin-top:8px;overflow:hidden}
.dt-rank-bar i{display:block;height:100%;border-radius:99px;background:var(--grad)}
.dt-rank-total{text-align:right}
.dt-rank-total b{display:block;font-size:15px;color:#11825f;font-weight:900;white-space:nowrap}
.dt-rank-total small{display:inline-flex;align-items:center;gap:3px;margin-top:3px;font-size:8px;font-weight:800;color:#11825f;padding:2px 7px;border-radius:999px;background:#e1f8ef}
.dt-more{display:flex;align-items:center;justify-content:center;gap:8px;margin:14px 0 0;color:var(--muted);font-size:10px;font-weight:600}
.dt-avatars{display:flex}
.dt-avatars i{width:22px;height:22px;border-radius:50%;border:2px solid #fff;background:var(--grad);display:grid;place-items:center;color:#fff;font-size:8px;font-weight:900;margin-left:-7px}
.dt-avatars i:first-child{margin-left:0}

/* ---------- CTA (unchanged) ---------- */
.dt-cta{position:sticky;bottom:10px;margin-top:15px}
.dt-bid-btn{position:relative;overflow:hidden;width:100%;border:0;border-radius:15px;padding:14px;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 58%,#00a9c7);font-size:12px;font-weight:900;display:flex;justify-content:center;align-items:center;gap:7px;box-shadow:0 12px 25px rgba(75,84,194,.27);cursor:pointer}
.dt-bid-btn:after{content:"";position:absolute;top:0;bottom:0;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);animation:dt-shine 3s ease-in-out infinite}

/* ---------- Bottom sheet ---------- */
.dt-overlay{position:fixed;inset:0;z-index:60;background:rgba(15,20,48,.5);backdrop-filter:blur(4px);animation:dt-fade .25s ease both}
.dt-sheet{position:fixed;left:0;right:0;bottom:0;z-index:61;max-height:92vh;overflow:auto;padding:10px 16px max(20px,env(safe-area-inset-bottom));border-radius:28px 28px 0 0;background:#fff;box-shadow:0 -20px 55px rgba(24,31,70,.26);animation:dt-rise .35s cubic-bezier(.2,.8,.2,1) both}
.dt-grab{width:46px;height:5px;border-radius:9px;background:#dce1e9;margin:0 auto 12px}
.dt-sheet-inner{width:min(100%,650px);margin:auto}
.dt-sheet-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
.dt-sheet-head h2{font-size:20px;margin:0;letter-spacing:-.3px}
.dt-sheet-head p{font-size:10px;color:var(--muted);margin:4px 0 0}
.dt-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:14px}
.dt-step{display:flex;align-items:center;gap:7px;padding:8px 9px;border-radius:12px;background:#f3f5fa;border:1px solid #e6eaf2;font-size:9px;font-weight:800;color:#7a8599}
.dt-step i{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:#dfe4ee;color:#68778c;font-size:9px;font-style:normal;flex:0 0 auto}
.dt-step.done{color:#11825f;background:#e8f8f1;border-color:#cfeede}
.dt-step.done i{background:#17a878;color:#fff}
.dt-step.active{color:#4a3bb5;background:#f0edff;border-color:#dcd6f8}
.dt-step.active i{background:var(--grad);color:#fff}
.dt-panel{margin-top:14px;padding:14px;border-radius:18px;border:1px solid var(--line);background:#fafbfe}
.dt-panel-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.dt-panel-title b{display:flex;align-items:center;gap:7px;font-size:12px}
.dt-panel-title b i{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;color:#fff;background:var(--grad)}
.dt-panel-title span{font-size:9px;color:var(--muted)}
.dt-method-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.dt-method-title{display:block;margin:0;font-size:9px;letter-spacing:.9px;font-weight:800;color:#687187;white-space:nowrap}
.dt-mode{position:relative;display:grid;grid-template-columns:1fr 1fr;flex:0 0 164px;height:36px;padding:3px;border:1px solid #dfe4ee;border-radius:999px;background:linear-gradient(180deg,#e9edf4,#f1f4f8);box-shadow:inset 0 2px 4px rgba(45,57,88,.08);overflow:hidden}
.dt-mode:before{content:"";position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 3px);border-radius:999px;background:linear-gradient(135deg,#2457e6,#6c4ee7);box-shadow:0 4px 9px rgba(77,83,193,.22),inset 0 1px 0 rgba(255,255,255,.25);transform:translateX(0);transition:transform .24s cubic-bezier(.2,.8,.2,1)}
.dt-mode.perkm:before{transform:translateX(100%)}
.dt-mode button{position:relative;z-index:1;border:0;border-radius:999px;padding:5px 4px;background:transparent;color:#667188;font-size:9px;font-weight:800;transition:color .2s ease;cursor:pointer}
.dt-mode button.active{background:transparent;color:#fff;box-shadow:none}
@media(max-width:380px){.dt-method-row{align-items:flex-start;flex-direction:column;gap:7px}.dt-mode{flex-basis:auto;width:164px}}
.dt-grid{display:grid;gap:10px;margin-top:12px}
.dt-field label{display:block;font-size:9px;letter-spacing:.8px;font-weight:800;color:#687187;margin:0 0 6px}
.dt-input{display:flex;align-items:center;border:1px solid #dfe4ed;border-radius:14px;background:#fff;overflow:hidden;transition:border-color .2s ease,box-shadow .2s ease}
.dt-input:focus-within{border-color:#6c4ee7;box-shadow:0 0 0 3px rgba(108,78,231,.14)}
.dt-input span{padding-left:12px;font-weight:900;color:#5847c7}
.dt-input input,.dt-input select{width:100%;border:0;outline:0;background:transparent;padding:12px 11px;font-size:13px;font-weight:800;color:var(--ink);-webkit-appearance:none;appearance:none}
.dt-input select{padding-right:30px}
.dt-input.select{position:relative}
.dt-input.select svg{position:absolute;right:10px;pointer-events:none;color:#8a94a8}
.dt-input.readonly{background:linear-gradient(135deg,#f0f4f8,#f6f3ff);color:#4a3bb5;padding:12px;font-weight:900;font-size:13px}
.dt-vehicle-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:4px}
.dt-vehicle-title b{font-size:12px}
.dt-vehicle-title span{font-size:9px;color:var(--muted)}
.dt-alloc{display:flex;align-items:center;gap:10px;margin-top:10px;padding:9px 11px;border-radius:12px;background:#f3f5fa;border:1px solid #e6eaf2}
.dt-alloc-bar{flex:1;height:6px;border-radius:99px;background:#dfe4ee;overflow:hidden}
.dt-alloc-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#17a878,#00a9c7);transition:width .3s ease}
.dt-alloc-bar.over i{background:linear-gradient(90deg,#ed5665,#fa8c3a)}
.dt-alloc small{font-size:9px;font-weight:800;color:#4b5a73;white-space:nowrap}
.dt-alloc small.ok{color:#11825f}.dt-alloc small.bad{color:#d64c58}
.dt-vehicle{display:grid;grid-template-columns:auto 1fr 92px;align-items:center;gap:8px;margin-top:8px}
.dt-vehicle-idx{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:#eef0f8;color:#5b6b85;font-size:9px;font-weight:900}
.dt-remain{display:flex;align-items:center;gap:6px;font-size:9px;color:#d64c58;margin:8px 2px 0;font-weight:800}
.dt-summary{position:relative;overflow:hidden;margin-top:14px;padding:14px;border-radius:18px;color:#fff;background:linear-gradient(135deg,#152b4b,#245b89 55%,#058896);box-shadow:0 14px 30px rgba(44,73,120,.24)}
.dt-summary:after{content:"";position:absolute;width:140px;height:140px;border-radius:50%;right:-60px;top:-70px;background:rgba(255,255,255,.12)}
.dt-sum-row{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:10px;opacity:.85}
.dt-sum-row b{font-weight:800;opacity:1}
.dt-sum-row.total{margin-top:6px;padding-top:11px;border-top:1px solid rgba(255,255,255,.22);font-size:12px;opacity:1}
.dt-sum-row.total b{font-size:20px;font-weight:900;letter-spacing:-.3px}
.dt-submit{position:relative;overflow:hidden;width:100%;border:0;border-radius:15px;padding:14px;margin-top:14px;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7);font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 12px 25px rgba(75,84,194,.27);cursor:pointer;transition:transform .15s ease,opacity .2s ease}
.dt-submit:not(:disabled):active{transform:scale(.98)}
.dt-submit:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
.dt-note{display:flex;align-items:flex-start;justify-content:center;gap:6px;text-align:left;font-size:9px;color:#7a8495;line-height:1.5;margin:11px 5px 0}
.dt-note svg{flex:0 0 auto;margin-top:1px}

/* ---------- Confirm & success ---------- */
.dt-confirm{text-align:center;padding:12px 4px 4px;animation:dt-fade .3s ease both}
.dt-confirm i{width:72px;height:72px;border-radius:24px;display:grid;place-items:center;margin:auto;background:linear-gradient(135deg,#d6f7e9,#e9fbf3);color:#14926b;box-shadow:0 12px 26px rgba(20,146,107,.2);animation:dt-pop .5s cubic-bezier(.2,.8,.2,1) both}
.dt-confirm i.shield{background:linear-gradient(135deg,#e6e0ff,#f1edff);color:#5847c7;box-shadow:0 12px 26px rgba(88,71,199,.2)}
.dt-confirm h2{font-size:20px;margin:14px 0 6px;letter-spacing:-.3px}
.dt-confirm p{font-size:11px;color:var(--muted);line-height:1.55;margin:0 auto;max-width:360px}
.dt-confirm-amount{display:inline-block;margin-top:12px;padding:10px 18px;border-radius:14px;background:linear-gradient(135deg,#f4f3ff,#eefbfa);border:1px solid #e1e3f0;color:#4a3bb5;font-size:22px;font-weight:900;letter-spacing:-.4px}
.dt-confirm-meta{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;margin-top:12px}
.dt-confirm-meta span{display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border-radius:999px;background:#f3f5fa;border:1px solid #e6eaf2;font-size:9px;font-weight:800;color:#4b5a73}
.dt-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px}
.dt-actions button{border:0;border-radius:14px;padding:13px;font-size:11px;font-weight:850;cursor:pointer}
.dt-cancel{background:#eef1f6;color:#697287}
.dt-confirm-btn{background:linear-gradient(135deg,#2457e6,#6c4ee7);color:#fff;box-shadow:0 10px 22px rgba(75,84,194,.27)}

@media(min-width:620px){
  .dt-grid.two{grid-template-columns:1fr 1fr}
  .dt-sheet{left:50%;right:auto;bottom:16px;transform:translateX(-50%);width:min(94%,700px);border-radius:28px;animation:dt-fade .3s ease both}
  .dt-main{padding-top:20px}
  .dt-hero{padding:24px}
  .dt-card{padding:20px}
  .dt-id strong{font-size:24px}
  .dt-stat b{font-size:15px}
}
`;

function Timer({ seconds }) {
  const [s, setS] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setS(v => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const x = String(s % 60).padStart(2, "0");
  const urgent = s > 0 && s <= 600;
  return (
    <div className={`dt-timer${urgent ? " urgent" : ""}`} aria-live="polite">
      <small>
        <Clock3 size={10} /> {s === 0 ? "Closed" : "Time left"}
      </small>
      <div className="dt-timer-digits">
        <b>{h}<em>HRS</em></b>
        <i>:</i>
        <b>{m}<em>MIN</em></b>
        <i>:</i>
        <b>{x}<em>SEC</em></b>
      </div>
    </div>
  );
}

function RankRow({ row, index, best, worst }) {
  const range = Math.max(1, worst - best);
  const width = Math.round(100 - ((row.total - best) / range) * 55);
  return (
    <div className={`dt-rank${index === 0 ? " top" : ""}`}>
      <div className={`dt-medal m${index + 1}`}>#{index + 1}</div>
      <div className="dt-rank-info">
        <b>{row.id}</b>
        <span>
          <em>Transport {money(row.transport)}</em>
          <em>Permit {money(row.permit)}</em>
        </span>
        <div className="dt-rank-bar"><i style={{ width: `${width}%` }} /></div>
      </div>
      <div className="dt-rank-total">
        <b>{money(row.total)}</b>
        {index === 0 && <small><TrendingDown size={9} /> Lowest</small>}
      </div>
    </div>
  );
}

export default function StoneRateBidDetails({ bid = BID, onBack = () => {}, onRefresh = () => {}, onBidSubmitted = () => {} }) {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState("form");
  const [mode, setMode] = useState("total");
  const [rate, setRate] = useState("");
  const [count, setCount] = useState("1");
  const [countTouched, setCountTouched] = useState(false);
  const [vehicles, setVehicles] = useState([{ type: "12 Tyre", number: 1 }]);

  const transport = mode === "total" ? Number(rate) || 0 : (Number(rate) || 0) * bid.distanceKm;
  const assigned = vehicles.reduce((a, v) => a + (Number(v.number) || 0), 0);
  const vehicleCount = Number(count) || 0;
  const remaining = Math.max(0, vehicleCount - assigned);

  const normalizeVehicles = (rows, target) => {
    const wanted = Math.max(1, Number(target) || 1);
    const clean = rows.map(v => ({ ...v, number: Math.max(1, Number(v.number) || 1) }));
    const result = [];
    let used = 0;
    for (const row of clean) {
      if (used >= wanted) break;
      const take = Math.min(row.number, wanted - used);
      if (take > 0) {
        result.push({ ...row, number: take });
        used += take;
      }
    }
    while (used < wanted) {
      result.push({ type: "12 Tyre", number: 1 });
      used += 1;
    }
    return result;
  };

  const changeVehicleCount = value => {
    setCountTouched(true);
    if (value === "") {
      setCount("");
      setVehicles([]);
      return;
    }
    const next = Math.max(1, Number(value) || 1);
    setCount(String(next));
    setVehicles(rows => normalizeVehicles(rows, next));
  };

  const finishVehicleCount = () => {
    if (count === "") return;
    const next = Math.max(1, Number(count) || 1);
    setCount(String(next));
    setVehicles(rows => normalizeVehicles(rows, next));
  };

  const changeCostMethod = nextMode => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setRate("");
  };

  const update = (i, key, value) => {
    setVehicles(rows => {
      if (key !== "number") {
        return rows.map((row, index) => (index === i ? { ...row, [key]: value } : row));
      }
      // Allow the allocation quantity to be temporarily blank while editing on mobile.
      if (value === "") {
        return rows.map((row, index) => (index === i ? { ...row, number: "" } : row));
      }
      // Keep an entered zero visible so the user can see and correct the warning.
      if (Number(value) === 0) {
        return rows.map((row, index) => (index === i ? { ...row, number: "0" } : row));
      }
      const next = rows.map((row, index) => (index === i ? { ...row, number: Number(value) } : row));
      return normalizeVehicles(next, vehicleCount);
    });
  };

  const permit = useMemo(() => vehicles.reduce((a, v) => a + (TYPES[v.type] || 0) * (Number(v.number) || 0), 0), [vehicles]);
  const hasZeroAllocation = vehicles.some(v => v.number !== "" && Number(v.number) === 0);
  const hasBlankAllocation = vehicles.some(v => v.number === "");
  const allocationOk = vehicleCount > 0 && !hasZeroAllocation && !hasBlankAllocation && assigned === vehicleCount;
  const valid = transport > 0 && allocationOk;
  const allocPct = vehicleCount > 0 ? Math.min(100, Math.round((assigned / vehicleCount) * 100)) : 0;
  const best = Math.min(...TOP.map(r => r.total));
  const worst = Math.max(...TOP.map(r => r.total));

  const finalSubmit = () => {
    onBidSubmitted({ bid, transportationCost: transport, permitCost: permit, total: transport + permit, vehicles });
    setStage("success");
  };
  const openSheet = () => {
    setStage("form");
    setOpen(true);
  };

  return (
    <div className="dt-app">
      <style>{css}</style>

      {/* Top navigation (unchanged) */}
      <header className="dt-header">
        <div className="dt-shell dt-head">
          <button className="dt-icon" onClick={onBack} aria-label="Back"><ArrowLeft size={18} /></button>
          <div className="dt-logo"><i><Mountain size={15} /></i><span>Stone<em>Rate</em></span></div>
          <button className="dt-icon" onClick={onRefresh} aria-label="Refresh"><RefreshCw size={17} /></button>
        </div>
      </header>

      <main className="dt-shell dt-main">
        {/* Hero */}
        <section className="dt-hero">
          <div className="dt-orb" />
          <div className="dt-hero-top">
            <div className="dt-id">
              <span className="dt-live"><i />Live bidding</span>
              <small>BID NUMBER</small>
              <strong>{bid.id}</strong>
            </div>
            <Timer seconds={bid.secondsLeft} />
          </div>
          <div className="dt-stats">
            <div className="dt-stat"><small><Route size={9} /> Distance</small><b>{bid.distanceKm} km</b></div>
            <div className="dt-stat"><small><Users size={9} /> Bidders</small><b>{TOP.length + MORE_BIDDERS}</b></div>
            <div className="dt-stat"><small><Layers3 size={9} /> Materials</small><b>{bid.materials.length} items</b></div>
          </div>
          <div className="dt-mats">
            {bid.materials.map((m, i) => (
              <div className="dt-mat" key={m.name}>
                <i>{i ? <Layers3 size={15} /> : <Mountain size={15} />}</i>
                <span><b>{m.name}</b><span>{m.qty}</span></span>
              </div>
            ))}
          </div>
        </section>

        {/* Route */}
        <section className="dt-card delay-1">
          <div className="dt-section-head">
            <div><h2>Route details</h2><span>Pickup to drop location</span></div>
            <div className="dt-section-icon"><Route size={18} /></div>
          </div>
          <div className="dt-route">
            <div className="dt-stop">
              <i><Navigation size={16} /></i>
              <span><small>Pickup</small><b>{bid.pickup}</b></span>
              <span className="dt-km start"><Sparkles size={10} /> Start</span>
            </div>
            <div className="dt-stop drop">
              <i><MapPin size={16} /></i>
              <span><small>Drop</small><b>{bid.drop}</b></span>
              <span className="dt-km"><Route size={10} /> {bid.distanceKm} km</span>
            </div>
          </div>
          <div className="dt-req">
            <i><Truck size={17} /></i>
            <span><small>VEHICLE REQUIREMENT</small><b>{bid.requirement}</b></span>
          </div>
        </section>

        {/* Top biddings */}
        <section className="dt-card delay-2">
          <div className="dt-section-head">
            <div><h2>Top 3 Biddings</h2><span>Lowest transportation offers so far</span></div>
            <div className="dt-section-icon"><Gavel size={18} /></div>
          </div>
          <div className="dt-rank-list">
            {TOP.map((r, i) => <RankRow key={r.id} row={r} index={i} best={best} worst={worst} />)}
          </div>
          <p className="dt-more">
            <span className="dt-avatars"><i>S</i><i>T</i><i>+{MORE_BIDDERS}</i></span>
            {MORE_BIDDERS} more transporters have submitted bids
          </p>
        </section>

        {/* CTA (unchanged) */}
        <div className="dt-cta">
          <button className="dt-bid-btn" onClick={openSheet}><Gavel size={16} />Make your bid</button>
        </div>
      </main>

      {open && (
        <>
          <div className="dt-overlay" onClick={() => setOpen(false)} />
          <section className="dt-sheet" role="dialog" aria-modal="true">
            <div className="dt-grab" />
            <div className="dt-sheet-inner">
              {stage === "form" && (
                <>
                  <div className="dt-sheet-head">
                    <div><h2>Build your bid</h2><p>Enter cost and allocate all vehicles.</p></div>
                    <button className="dt-icon" onClick={() => setOpen(false)} aria-label="Close"><X size={17} /></button>
                  </div>

                  <div className="dt-steps">
                    <div className={`dt-step ${transport > 0 ? "done" : "active"}`}><i>{transport > 0 ? "✓" : "1"}</i>Cost</div>
                    <div className={`dt-step ${allocationOk ? "done" : transport > 0 ? "active" : ""}`}><i>{allocationOk ? "✓" : "2"}</i>Vehicles</div>
                    <div className={`dt-step ${valid ? "active" : ""}`}><i>3</i>Submit</div>
                  </div>

                  <div className="dt-panel">
                    <div className="dt-method-row">
                      <span className="dt-method-title">TRANSPORTATION COST METHOD</span>
                      <div className={`dt-mode ${mode === "perkm" ? "perkm" : "total"}`} role="switch" aria-checked={mode === "perkm"} aria-label="Transportation cost method">
                        <button type="button" className={mode === "total" ? "active" : ""} onClick={() => changeCostMethod("total")}>Total</button>
                        <button type="button" className={mode === "perkm" ? "active" : ""} onClick={() => changeCostMethod("perkm")}>Per km</button>
                      </div>
                    </div>
                    <div className="dt-grid two">
                      <div className="dt-field">
                        <label>{mode === "total" ? "TRANSPORTATION AMOUNT" : "RATE PER KM"}</label>
                        <div className="dt-input">
                          <span>₹</span>
                          <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Enter amount" />
                        </div>
                      </div>
                      {mode === "perkm" && (
                        <div className="dt-field">
                          <label>FULL AMOUNT · {bid.distanceKm} KM</label>
                          <div className="dt-input readonly">{money(transport)}</div>
                        </div>
                      )}
                      <div className="dt-field">
                        <label>NUMBER OF VEHICLES</label>
                        <div className="dt-input">
                          <span><Truck size={15} /></span>
                          <input type="number" min="1" inputMode="numeric" value={count} onChange={e => changeVehicleCount(e.target.value)} onBlur={finishVehicleCount} placeholder="Enter vehicle count" />
                        </div>
                      </div>
                    </div>
                    {countTouched && count === "" && <div className="dt-remain"><Info size={11} /> Number of vehicles cannot be blank or zero.</div>}
                  </div>

                  <div className="dt-panel">
                    <div className="dt-vehicle-title">
                      <b>Vehicle allocation</b>
                      <span>Permit calculated automatically</span>
                    </div>
                    <div className="dt-alloc">
                      <div className={`dt-alloc-bar${assigned > vehicleCount ? " over" : ""}`}><i style={{ width: `${allocPct}%` }} /></div>
                      <small className={allocationOk ? "ok" : vehicleCount > 0 && assigned !== vehicleCount ? "bad" : ""}>
                        {assigned}/{vehicleCount || 0} assigned{remaining > 0 ? ` · ${remaining} left` : ""}
                      </small>
                    </div>
                    {vehicles.map((v, i) => (
                      <div className="dt-vehicle" key={i}>
                        <div className="dt-vehicle-idx">{i + 1}</div>
                        <div className="dt-input select">
                          <select value={v.type} onChange={e => update(i, "type", e.target.value)} aria-label={`Vehicle ${i + 1} type`}>
                            {Object.keys(TYPES).map(t => <option key={t} value={t}>{t} · ₹{TYPES[t]} permit</option>)}
                          </select>
                          <ChevronDown size={15} />
                        </div>
                        <div className="dt-input">
                          <input type="number" min="0" inputMode="numeric" value={v.number} onChange={e => update(i, "number", e.target.value)} placeholder="0" aria-label={`Vehicle ${i + 1} quantity`} />
                        </div>
                      </div>
                    ))}
                    {hasZeroAllocation && <div className="dt-remain"><Info size={11} /> Vehicle quantity cannot be zero.</div>}
                  </div>

                  <div className="dt-summary">
                    <div className="dt-sum-row"><span>Transportation cost</span><b>{money(transport)}</b></div>
                    <div className="dt-sum-row"><span>Permit cost · {assigned} vehicle{assigned === 1 ? "" : "s"}</span><b>{money(permit)}</b></div>
                    <div className="dt-sum-row total"><span>Total bid</span><b>{money(transport + permit)}</b></div>
                  </div>

                  <button className="dt-submit" disabled={!valid} onClick={() => setStage("confirm")}>
                    Submit my bid <ArrowRight size={16} />
                  </button>
                  <p className="dt-note"><Info size={11} /> This bid does not guarantee transportation. Final acceptance depends upon the buyer.</p>
                </>
              )}

              {stage === "confirm" && (
                <div className="dt-confirm">
                  <i className="shield"><ShieldCheck size={32} /></i>
                  <h2>Confirm your bid</h2>
                  <p>You are submitting a total bid for {vehicleCount} vehicle{vehicleCount > 1 ? "s" : ""}. This is your final confirmation.</p>
                  <div className="dt-confirm-amount">{money(transport + permit)}</div>
                  <div className="dt-confirm-meta">
                    <span><Truck size={10} /> Transport {money(transport)}</span>
                    <span><BadgeCheck size={10} /> Permit {money(permit)}</span>
                    <span><Route size={10} /> {bid.distanceKm} km</span>
                  </div>
                  <div className="dt-actions">
                    <button className="dt-cancel" onClick={() => setStage("form")}>Review again</button>
                    <button className="dt-confirm-btn" onClick={finalSubmit}>Yes, submit bid</button>
                  </div>
                </div>
              )}

              {stage === "success" && (
                <div className="dt-confirm">
                  <i><CheckCircle2 size={34} /></i>
                  <h2>Bid submitted</h2>
                  <p>Your bid for <b>{bid.id}</b> has been submitted successfully. You will be notified once the buyer responds.</p>
                  <div className="dt-confirm-amount">{money(transport + permit)}</div>
                  <button className="dt-submit" onClick={() => setOpen(false)}>Done <CheckCircle2 size={16} /></button>
                  <p className="dt-note"><Info size={11} /> This bid does not guarantee transportation. Final acceptance depends upon the buyer.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
