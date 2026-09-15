import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarClock,
  Check, CheckCircle2, ChevronRight, CircleAlert, ClipboardList, Clock3,
  Gavel, Home, Images, IndianRupee, Layers3, LoaderCircle, MapPin, Menu,
  Mountain, Navigation, PackageCheck, Phone, RefreshCw, ReceiptText,
  Route, ShieldCheck, Truck, UserRound, X, Zap,
} from "lucide-react";

/**
 * StoneRate · Transporter workspace
 * Drop-in React component. Dependencies: react (18+), lucide-react.
 * All styles are embedded and scoped to .sr-app; no CSS framework,
 * external fonts, image service, or chart package is required.
 *
 * Original data and callback props are preserved. Supplied values (including
 * null and empty arrays) always win. Set useMockFallback={false} in production.
 * Callbacks may return promises; rejecting or returning false reports failure.
 * Demo interactions are local only and are explicitly identified as previews.
 * onViewEarnings remains an accepted legacy prop, but no earnings UI is added.
 */
const MOCK_DATA = {
  transporter: {
    publicId: "TR-1048", name: "Ramesh", companyName: "Ramesh Logistics",
    phone: "+91 98765 43210", profilePhotoUrl: "", verified: true,
    city: "Bengaluru", state: "Karnataka", available: true,
  },
  summary: { availableTrips: 8, tripsToday: 3, inTransit: 1, completedTrips: 12 },
  marketRates: [
    { id: "mr-20", materialName: "Crushed Stone", category: "20mm", startingRate: 1200, unit: "ton", updatedAt: "Today, 8:45 AM", movementType: "up", movementAmount: 150, historyPoints: [16, 18, 17, 22, 20, 25, 24, 29], tone: "emerald" },
    { id: "mr-40", materialName: "Crushed Stone", category: "40mm", startingRate: 980, unit: "ton", updatedAt: "Today, 8:40 AM", movementType: "stable", movementAmount: 0, historyPoints: [20, 21, 19.8, 20.6, 19.9, 21, 20.4, 20.7], tone: "orange" },
    { id: "mr-black", materialName: "Black Stone", category: "Premium", startingRate: 1450, unit: "ton", updatedAt: "Today, 8:35 AM", movementType: "down", movementAmount: 80, historyPoints: [28, 26, 27, 23, 25, 21, 22, 19], tone: "violet" },
  ],
  routes: [
    { id: "r1", pickup: "Hosur", drop: "Bengaluru", distanceKm: 48, demand: "High", vehicle: "16 Tyre" },
    { id: "r2", pickup: "Kolar", drop: "Whitefield", distanceKm: 64, demand: "Medium", vehicle: "14 Tyre" },
    { id: "r3", pickup: "Hoskote", drop: "KR Puram", distanceKm: 26, demand: "High", vehicle: "10 Tyre" },
    { id: "r4", pickup: "Devanahalli", drop: "Yelahanka", distanceKm: 24, demand: "Low", vehicle: "6 Tyre" },
  ],
  recentOrders: [
    { id: "o1", deliveryId: "ST-DEL-24819", source: "StoneRate", status: "New", pickupName: "Shree Balaji Crusher, Hoskote", pickupAddress: "Hoskote Industrial Area", pickupPhone: "+91 98765 01010", dropName: "Ganesh Traders, Whitefield", dropAddress: "Hope Farm, Whitefield", dropPhone: "+91 98765 02020", distanceKm: 32, materialName: "20mm Crushed Stone", materialType: "Stone", quantity: 16, quantityUnit: "tons", vehicleCount: 1, pickupTime: "Today · 10:30 AM", arrivalWindow: "11:45 AM–12:15 PM", tripEarning: 3200 },
    { id: "o2", deliveryId: "ST-DEL-24802", source: "StoneRate", status: "In Transit", pickupName: "Sri Lakshmi Stone Works, Kolar", pickupAddress: "NH 75, Kolar", pickupPhone: "+91 98765 03030", dropName: "Metro Buildmart, Indiranagar", dropAddress: "100 Feet Road", dropPhone: "+91 98765 04040", distanceKm: 57, materialName: "40mm Crushed Stone", materialType: "Stone", quantity: 18, quantityUnit: "tons", vehicleCount: 1, pickupTime: "Today · 7:00 AM", arrivalWindow: "10:30–11:00 AM", tripEarning: 4100 },
    { id: "o3", deliveryId: "MAN-00941", source: "Manual", status: "Accepted", pickupName: "Kaveri Sand Yard, Hoskote", pickupAddress: "Old Madras Road", pickupPhone: "+91 98765 05050", dropName: "Ananya Constructions, KR Puram", dropAddress: "Seegehalli Main Road", dropPhone: "+91 98765 06060", distanceKm: 29, materialName: "Morang", materialType: "Sand", quantity: 50, quantityUnit: "buckets", vehicleCount: 1, pickupTime: "Tomorrow · 8:15 AM", arrivalWindow: "9:30–10:00 AM", tripEarning: 2850 },
  ],
  nextPickup: { pickupPlant: "Shree Balaji Crusher", material: "20mm", quantity: "16 tons", scheduledTime: "10:30 AM", distanceKm: 12, phone: "+91 98765 01010", orderId: "o1" },
  orderSnapshot: { totalTrucks: 18, totalQuantity: 286, quantityUnit: "tons", totalOrders: 24, thisWeek: 7, thisMonth: 19, weekBars: [38, 62, 46, 80, 68, 92, 56] },
  notifications: [
    { id: "n1", title: "New trip near Hoskote", message: "A 16-ton stone delivery is available.", type: "trip", createdAt: "4 min ago", read: false },
    { id: "n2", title: "Payment processed", message: "₹3,200 has been sent to your wallet.", type: "payment", createdAt: "2 hr ago", read: false },
    { id: "n3", title: "Pickup reminder", message: "Your pickup begins at 10:30 AM.", type: "reminder", createdAt: "Yesterday", read: true },
  ],
};

const cx = (...values) => values.filter(Boolean).join(" ");
const asArray = (value) => Array.isArray(value) ? value.filter((item) => item !== null && item !== undefined) : [];
const hasNumber = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
const display = (value) => value === null || value === undefined || value === "" ? "—" : value;
const money = (value) => hasNumber(value)
  ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value))
  : "—";
const slug = (value) => String(value || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-");
const NAV_ITEMS = [
  { label: "Home", title: "Overview", icon: Home },
  { label: "Samples", title: "Material samples", icon: Images },
  { label: "Bidding", title: "Bidding", icon: Gavel },
  { label: "Orders", title: "My orders", icon: ClipboardList },
  { label: "Profile", title: "My profile", icon: UserRound },
];

const styles = `
.sr-app {
  --sr-bg: #f7f9f8; --sr-paper: #fff; --sr-ink: #20352e;
  --sr-muted: #728079; --sr-line: #e5ebe7; --sr-green: #177556;
  --sr-green-dark: #125d44; --sr-mint: #eaf5ee; --sr-radius: 18px;
  color: var(--sr-ink); background: var(--sr-bg); min-height: 100vh;
  font-family: "Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased;
  position: relative; isolation: isolate; text-align: left;
}
.sr-app *, .sr-app *::before, .sr-app *::after { box-sizing: border-box; }
.sr-app button, .sr-app input, .sr-app a { font: inherit; }
.sr-app button { cursor: pointer; }
.sr-app button, .sr-app a { -webkit-tap-highlight-color: transparent; }
.sr-app button { color: inherit; }
.sr-app button:disabled { cursor: not-allowed; opacity: .55; transform: none; }
.sr-app button:focus-visible, .sr-app a:focus-visible, .sr-app [tabindex]:focus-visible {
  outline: 3px solid #76b49a; outline-offset: 4px;
}
.sr-app button { transition: background .18s, border-color .18s, box-shadow .18s, transform .18s; }
.sr-app h1, .sr-app h2, .sr-app h3, .sr-app p { margin: 0; }
.sr-app svg { flex-shrink: 0; vertical-align: middle; }
.sr-app .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.sr-app .sr-skip { position: fixed; left: 250px; top: -70px; z-index: 110; background: white; color: var(--sr-green); padding: 12px 20px; border-radius: 10px; }
.sr-app .sr-skip:focus { top: 12px; }
.sr-app .sr-sidebar { width: 224px; position: fixed; top: 0; bottom: 0; left: 0; z-index: 35; border-right: 1px solid var(--sr-line); background: var(--sr-paper); padding: 30px 18px 20px; display: flex; flex-direction: column; overflow-y: auto; }
.sr-app .sr-brand { display: flex; align-items: center; gap: 10px; letter-spacing: -1px; font-weight: 800; font-size: 24px; line-height: 1; }
.sr-app .sr-brand-mark { display: grid; place-items: center; width: 38px; height: 38px; background: var(--sr-green); color: white; border-radius: 12px 12px 12px 4px; }
.sr-app .sr-brand-word span { color: var(--sr-green); }
.sr-app .sr-workspace-label { margin: 9px 0 0 48px; font-size: 10px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--sr-muted); font-weight: 600; }
.sr-app .sr-nav-caption { font-size: 10px; letter-spacing: 1.8px; font-weight: 700; color: #88948d; margin: 44px 12px 12px; }
.sr-app .sr-side-nav { display: grid; gap: 5px; }
.sr-app .sr-nav-link { width: 100%; display: flex; align-items: center; gap: 12px; padding: 13px 14px; border: 0; border-radius: 10px; background: transparent; color: #6f7a74; font-size: 12px; font-weight: 550; text-align: left; }
.sr-app .sr-nav-link:hover { background: #f5f8f6; color: var(--sr-green); }
.sr-app .sr-nav-link.active { background: var(--sr-mint); color: var(--sr-green); font-weight: 700; }
.sr-app .sr-nav-count { margin-left: auto; background: #fff; color: var(--sr-green); font-size: 10px; font-weight: 750; padding: 1px 7px; border-radius: 6px; }
.sr-app .sr-sidebar-bottom { margin-top: auto; padding-top: 40px; }
.sr-app .sr-partner-card { background: #f5f8f4; border: 1px solid #e9eee5; padding: 16px; border-radius: 13px; margin-bottom: 22px; }
.sr-app .sr-partner-card > svg { color: var(--sr-green); margin-bottom: 10px; }
.sr-app .sr-partner-card strong { display: block; font-size: 12px; }
.sr-app .sr-partner-card p { color: var(--sr-muted); font-size: 11px; line-height: 1.7; margin-top: 6px; }
.sr-app .sr-account { width: 100%; display: flex; align-items: center; gap: 10px; border: 0; background: transparent; padding: 14px 0 0; border-top: 1px solid var(--sr-line); text-align: left; }
.sr-app .sr-avatar { width: 38px; height: 38px; flex: 0 0 auto; background: #efe7d9; color: #6d5e47; border: 3px solid white; box-shadow: 0 0 0 1px #e7e7df; border-radius: 50%; display: grid; place-items: center; font-size: 12px; font-weight: 750; overflow: hidden; }
.sr-app .sr-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sr-app .sr-account-copy { flex: 1; min-width: 0; }
.sr-app .sr-account-copy strong, .sr-app .sr-account-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sr-app .sr-account-copy strong { font-size: 12px; }
.sr-app .sr-account-copy small { color: var(--sr-muted); font-size: 10px; margin-top: 3px; }
.sr-app .sr-workspace { margin-left: 224px; min-width: 0; }
.sr-app .sr-topbar { position: sticky; top: 0; z-index: 30; height: 76px; padding: 0 36px; display: flex; align-items: center; justify-content: space-between; gap: 18px; background: rgba(255,255,255,.94); border-bottom: 1px solid var(--sr-line); backdrop-filter: blur(14px); }
.sr-app .sr-breadcrumb { display: flex; align-items: center; gap: 13px; font-size: 12px; color: var(--sr-muted); }
.sr-app .sr-breadcrumb strong { color: var(--sr-ink); font-weight: 550; }
.sr-app .sr-top-actions { display: flex; align-items: center; gap: 17px; }
.sr-app .sr-icon-button { position: relative; width: 38px; height: 38px; display: inline-grid; place-items: center; background: white; border: 1px solid var(--sr-line); border-radius: 10px; flex-shrink: 0; }
.sr-app .sr-icon-button:hover { background: #f2f6f3; border-color: #b9cfc1; }
.sr-app .sr-alert-dot { position: absolute; top: 7px; right: 8px; width: 7px; height: 7px; border: 2px solid white; border-radius: 50%; background: #df915a; }
.sr-app .sr-availability { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #536c5c; font-weight: 600; }
.sr-app .sr-switch { width: 35px; height: 21px; padding: 3px; border: 0; border-radius: 99px; background: #b3beb7; flex-shrink: 0; }
.sr-app .sr-switch.on { background: var(--sr-green); }
.sr-app .sr-switch > span { display: block; background: white; border-radius: 50%; height: 15px; width: 15px; box-shadow: 0 1px 3px #0002; transition: transform .2s; }
.sr-app .sr-switch.on > span { transform: translateX(14px); }
.sr-app .sr-mobile-brand, .sr-app .sr-mobile-menu { display: none; }
.sr-app .sr-main { max-width: 1440px; margin: 0 auto; padding: 32px 36px 28px; }
.sr-app .sr-page-head { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 26px; }
.sr-app .sr-page-head h1 { font-size: clamp(25px,2.5vw,34px); letter-spacing: -1.15px; line-height: 1.2; font-weight: 650; }
.sr-app .sr-page-head p { margin-top: 8px; font-size: 12px; color: var(--sr-muted); }
.sr-app .sr-heading-actions { display: flex; gap: 9px; align-items: center; }
.sr-app .sr-btn { min-height: 41px; padding: 10px 16px; border: 1px solid transparent; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; font-size: 11px; font-weight: 650; white-space: nowrap; }
.sr-app .sr-btn:hover:not(:disabled) { transform: translateY(-1px); }
.sr-app .sr-btn-primary { background: var(--sr-green); color: #fff; box-shadow: 0 2px 3px #164c3610; }
.sr-app .sr-btn-primary:hover:not(:disabled) { background: var(--sr-green-dark); box-shadow: 0 5px 13px #164c3620; }
.sr-app .sr-btn-secondary { background: white; color: var(--sr-ink); border-color: var(--sr-line); }
.sr-app .sr-btn-secondary:hover:not(:disabled) { border-color: #aac4b5; background: #fbfdfb; }
.sr-app .sr-btn-soft { background: var(--sr-mint); color: var(--sr-green); }
.sr-app .sr-text-btn { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--sr-green); font-size: 11px; font-weight: 650; padding: 5px 0; white-space: nowrap; }
.sr-app .sr-text-btn:hover { color: #0d4934; }
.sr-app .sr-eyebrow { font-size: 9px; font-weight: 750; letter-spacing: 1.7px; text-transform: uppercase; color: #72877a; }
.sr-app .sr-hero { position: relative; display: grid; grid-template-columns: 1.1fr 1fr; min-height: 254px; background: #edf4e9; border: 1px solid #e0eadd; border-radius: 20px; overflow: hidden; }
.sr-app .sr-hero-copy { position: relative; z-index: 2; padding: 31px 32px; }
.sr-app .sr-hero-label { display: inline-flex; align-items: center; gap: 7px; color: #437557; background: #ffffffaa; border: 1px solid #dce7d8; padding: 5px 9px; font-size: 9px; letter-spacing: 1.15px; border-radius: 5px; font-weight: 700; }
.sr-app .sr-hero h2 { margin: 14px 0 10px; font-size: clamp(29px,2.75vw,40px); line-height: 1.1; letter-spacing: -1.65px; font-weight: 650; }
.sr-app .sr-hero h2 span { color: var(--sr-green); }
.sr-app .sr-hero-copy p { color: #6c7c6e; font-size: 11px; line-height: 1.8; max-width: 300px; }
.sr-app .sr-hero-link { margin-top: 12px; }
.sr-app .sr-hero-art { position: relative; display: flex; align-items: center; justify-content: center; min-width: 0; background: radial-gradient(ellipse at center,#dfebd988,transparent 70%); }
.sr-app .sr-network-svg { width: 100%; max-width: 430px; height: auto; overflow: visible; }
.sr-app .sr-hero-location { position: absolute; bottom: 18px; right: 20px; display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #ffffffb8; border: 1px solid #e0e9db; border-radius: 7px; color: #5e7461; font-size: 9px; max-width: 90%; }
.sr-app .sr-benefits { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; padding: 20px 4px 24px; }
.sr-app .sr-benefit { display: flex; align-items: center; gap: 10px; min-width: 0; }
.sr-app .sr-benefit > svg { color: #72927c; }
.sr-app .sr-benefit strong { display: block; font-size: 11px; font-weight: 650; }
.sr-app .sr-benefit p { font-size: 10px; color: var(--sr-muted); margin-top: 2px; }
.sr-app .sr-stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 14px; margin-bottom: 30px; }
.sr-app .sr-card { background: white; border: 1px solid var(--sr-line); border-radius: var(--sr-radius); box-shadow: 0 2px 3px #263e3003; }
.sr-app .sr-stat { padding: 18px 20px; position: relative; }
.sr-app .sr-stat-label { display: flex; align-items: center; justify-content: space-between; gap: 7px; color: var(--sr-muted); font-size: 11px; }
.sr-app .sr-stat-icon { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; background: #f1f6ef; color: #6e8b67; }
.sr-app .sr-stat:nth-child(2) .sr-stat-icon { background: #f5f0e6; color: #ab884d; }
.sr-app .sr-stat:nth-child(3) .sr-stat-icon { background: #edf2fa; color: #7390b4; }
.sr-app .sr-stat:nth-child(4) .sr-stat-icon { background: #eaf6ef; color: #578c6b; }
.sr-app .sr-stat strong { font-size: 31px; font-weight: 600; letter-spacing: -1.1px; display: block; margin: 6px 0 1px; line-height: 1.2; font-variant-numeric: tabular-nums; }
.sr-app .sr-stat small { font-size: 9px; color: #849086; }
.sr-app .sr-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.sr-app .sr-section-head h2 { font-size: 17px; font-weight: 650; letter-spacing: -.4px; }
.sr-app .sr-section-head p { font-size: 10px; color: var(--sr-muted); margin-top: 4px; }
.sr-app .sr-content-grid { display: grid; grid-template-columns: minmax(0,1fr) 310px; gap: 24px; align-items: start; }
.sr-app .sr-content-grid > *, .sr-app .sr-main section { min-width: 0; }
.sr-app .sr-section { margin-top: 28px; }
.sr-app .sr-tabs { display: flex; gap: 4px; border: 1px solid var(--sr-line); padding: 4px; background: #eef2ef; border-radius: 9px; margin-bottom: 15px; width: fit-content; }
.sr-app .sr-tab { padding: 7px 11px; border: 0; background: transparent; color: var(--sr-muted); font-size: 10px; border-radius: 6px; font-weight: 550; }
.sr-app .sr-tab.active { background: white; box-shadow: 0 1px 3px #173b2310; color: var(--sr-ink); font-weight: 650; }
.sr-app .sr-order-list { display: grid; gap: 12px; }
.sr-app .sr-order { padding: 19px 20px 15px; transition: border-color .2s, box-shadow .2s; }
.sr-app .sr-order:hover { border-color: #c4d6c9; box-shadow: 0 5px 20px #18382106; }
.sr-app .sr-order-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sr-app .sr-order-identity { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; }
.sr-app .sr-order-id { font-size: 11px; font-weight: 650; padding: 0; border: 0; background: transparent; }
.sr-app .sr-order-id:hover { color: var(--sr-green); text-decoration: underline; text-underline-offset: 3px; }
.sr-app .sr-source { display: inline-flex; align-items: center; gap: 3px; font-size: 8px; color: #7b887e; }
.sr-app .sr-status { font-size: 9px; font-weight: 650; padding: 4px 8px; border-radius: 5px; background: #f1f3f1; color: #6a786e; display: inline-flex; gap: 5px; align-items: center; white-space: nowrap; }
.sr-app .sr-status::before { content: ""; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
.sr-app .sr-status-new { color: #327951; background: #edf7ef; }
.sr-app .sr-status-in-transit { color: #527dae; background: #edf3fb; }
.sr-app .sr-status-accepted, .sr-app .sr-status-at-pickup, .sr-app .sr-status-loading { color: #99763b; background: #fbf5e9; }
.sr-app .sr-status-delivered { color: #327951; background: #edf7ef; }
.sr-app .sr-status-cancelled { color: #a95a53; background: #fff1ee; }
.sr-app .sr-order-route { display: grid; grid-template-columns: minmax(0,1fr) 52px minmax(0,1fr); align-items: start; gap: 13px; margin: 19px 0 15px; }
.sr-app .sr-stop-heading { font-size: 8px; letter-spacing: 1.25px; color: #8b968e; font-weight: 650; display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.sr-app .sr-stop-point { width: 6px; height: 6px; border-radius: 50%; background: #6a9a78; }
.sr-app .sr-stop-point.drop { border-radius: 1px; background: #bba478; }
.sr-app .sr-route-stop strong { font-size: 11px; font-weight: 600; line-height: 1.6; display: block; overflow-wrap: anywhere; }
.sr-app .sr-route-distance { text-align: center; color: #8b9d8b; font-size: 8px; padding-top: 13px; white-space: nowrap; }
.sr-app .sr-route-distance span { display: block; margin-top: 2px; }
.sr-app .sr-order-material { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 9px; color: #6f7c73; }
.sr-app .sr-order-material > span { display: inline-flex; align-items: center; gap: 5px; background: #f5f7f4; padding: 4px 7px; border-radius: 5px; }
.sr-app .sr-order-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 15px; padding-top: 13px; border-top: 1px solid #edf0ec; }
.sr-app .sr-order-time { font-size: 9px; display: grid; gap: 4px; color: #7b877e; }
.sr-app .sr-order-time span { display: flex; align-items: center; gap: 5px; }
.sr-app .sr-order-footer .sr-btn { min-height: 33px; padding: 7px 11px; font-size: 9px; }
.sr-app .sr-right-column { display: grid; gap: 20px; }
.sr-app .sr-pickup { overflow: hidden; }
.sr-app .sr-pickup-top { padding: 19px 20px 0; display: flex; align-items: center; justify-content: space-between; }
.sr-app .sr-pickup-top h2 { font-size: 13px; letter-spacing: -.2px; font-weight: 650; }
.sr-app .sr-pickup-top span { background: #f9f3e8; color: #9b8053; padding: 4px 7px; font-size: 8px; border-radius: 4px; }
.sr-app .sr-pickup-map { height: 127px; margin: 15px 16px 0; border-radius: 11px; overflow: hidden; position: relative; background: #f1f5ef; border: 1px solid #e6ece3; }
.sr-app .sr-pickup-map svg { width: 100%; height: 100%; }
.sr-app .sr-map-caption { position: absolute; right: 8px; bottom: 7px; color: #637e65; background: #fffffff0; border-radius: 4px; padding: 3px 5px; font-size: 8px; }
.sr-app .sr-pickup-body { padding: 17px 20px 20px; }
.sr-app .sr-pickup-body h3 { font-size: 15px; letter-spacing: -.35px; font-weight: 650; line-height: 1.4; }
.sr-app .sr-pickup-meta { color: var(--sr-muted); font-size: 10px; margin-top: 5px; }
.sr-app .sr-pickup-time { display: flex; justify-content: space-between; gap: 10px; padding: 14px 0; margin: 12px 0; border-block: 1px dashed #dfe7df; }
.sr-app .sr-pickup-time > div { display: flex; align-items: center; gap: 8px; }
.sr-app .sr-pickup-time svg { color: #8b9b8b; }
.sr-app .sr-pickup-time small { display: block; font-size: 8px; color: var(--sr-muted); }
.sr-app .sr-pickup-time strong { display: block; font-size: 11px; font-weight: 600; }
.sr-app .sr-pickup-actions { display: grid; grid-template-columns: 1fr 1.5fr; gap: 8px; }
.sr-app .sr-pickup-actions .sr-btn { padding-inline: 8px; font-size: 10px; min-height: 37px; }
.sr-app .sr-snapshot { padding: 20px; }
.sr-app .sr-snapshot .sr-section-head { margin-bottom: 18px; }
.sr-app .sr-snapshot .sr-section-head h2 { font-size: 14px; }
.sr-app .sr-snapshot .sr-eyebrow { margin-bottom: 4px; font-size: 8px; }
.sr-app .sr-snapshot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 17px 15px; }
.sr-app .sr-snapshot-metric small { display: block; font-size: 9px; color: var(--sr-muted); }
.sr-app .sr-snapshot-metric strong { display: block; margin-top: 3px; font-size: 23px; letter-spacing: -.7px; font-weight: 600; line-height: 1.2; }
.sr-app .sr-snapshot-metric span { display: block; color: #869287; font-size: 9px; margin-top: 5px; }
.sr-app .sr-chart { margin-top: 22px; }
.sr-app .sr-bars { display: flex; align-items: end; gap: 9px; height: 73px; border-bottom: 1px solid var(--sr-line); background: repeating-linear-gradient(to top,transparent 0,transparent 23px,#f0f3ee 23px,#f0f3ee 24px); }
.sr-app .sr-bar-slot { height: 100%; flex: 1; min-width: 0; display: flex; align-items: end; }
.sr-app .sr-bar { display: block; width: 100%; max-width: 29px; margin: 0 auto; border-radius: 4px 4px 0 0; background: #cfdfcd; min-height: 0; }
.sr-app .sr-bar-slot:last-child .sr-bar { background: #428166; }
.sr-app .sr-chart-labels { display: flex; margin-top: 6px; gap: 9px; color: #8e988e; font-size: 8px; text-align: center; }
.sr-app .sr-chart-labels span { flex: 1; min-width: 0; }
.sr-app .sr-chart-caption { font-size: 8px; color: #8c988f; margin-top: 9px; }
.sr-app .sr-snapshot-link { width: 100%; margin-top: 16px; font-size: 10px; min-height: 35px; }
.sr-app .sr-rates-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 15px; }
.sr-app .sr-rate { padding: 20px; overflow: hidden; position: relative; }
.sr-app .sr-rate-top { display: flex; align-items: center; gap: 10px; }
.sr-app .sr-rate-icon { width: 37px; height: 37px; border-radius: 10px; background: var(--rate-tint); color: var(--rate-color); display: grid; place-items: center; }
.sr-app .sr-rate-top h3 { font-size: 13px; font-weight: 650; letter-spacing: -.2px; }
.sr-app .sr-rate-top p { font-size: 9px; color: var(--sr-muted); margin-top: 2px; }
.sr-app .sr-rate-pricing { display: flex; align-items: end; justify-content: space-between; gap: 8px; margin-top: 23px; }
.sr-app .sr-rate-pricing small { display: block; font-size: 8px; color: #89958b; text-transform: uppercase; letter-spacing: 1px; }
.sr-app .sr-price { font-size: 26px; font-weight: 600; letter-spacing: -.9px; line-height: 1.35; white-space: nowrap; }
.sr-app .sr-price span { font-size: 9px; font-weight: 400; color: var(--sr-muted); letter-spacing: 0; }
.sr-app .sr-movement { display: inline-flex; align-items: center; gap: 2px; font-size: 9px; font-weight: 550; color: #668273; white-space: nowrap; padding-bottom: 5px; }
.sr-app .sr-movement.down { color: #a87659; }
.sr-app .sr-movement.stable { color: #8f8c73; }
.sr-app .sr-spark { width: 100%; height: 42px; display: block; margin-top: 13px; }
.sr-app .sr-no-history { min-height: 42px; margin-top: 13px; font-size: 9px; color: #94a095; display: flex; align-items: center; }
.sr-app .sr-rate-update { font-size: 8px; color: #8c998e; margin-top: 10px; display: flex; align-items: center; gap: 4px; }
.sr-app .sr-routes-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 13px; }
.sr-app .sr-route-card { padding: 17px; }
.sr-app .sr-route-card-top { display: flex; justify-content: space-between; align-items: center; gap: 7px; margin-bottom: 13px; color: #82927f; }
.sr-app .sr-demand { font-size: 8px; font-weight: 600; padding: 3px 6px; border-radius: 4px; color: #7f8a78; background: #f1f5ed; }
.sr-app .sr-demand.high { color: #608054; background: #edf5e8; }
.sr-app .sr-demand.medium { color: #a28a56; background: #faf5e9; }
.sr-app .sr-route-card h3 { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; }
.sr-app .sr-route-card p { font-size: 9px; margin-top: 6px; color: var(--sr-muted); }
.sr-app .sr-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 9px; color: #8c988e; margin-top: 29px; padding-top: 18px; border-top: 1px solid var(--sr-line); }
.sr-app .sr-footer span { display: flex; align-items: center; gap: 5px; }
.sr-app .sr-demo-tag { color: #967d51; }
.sr-app .sr-empty { display: grid; justify-items: center; align-content: center; padding: 30px 20px; text-align: center; min-height: 180px; }
.sr-app .sr-empty-icon { width: 44px; height: 44px; background: #edf4ed; color: #648669; border-radius: 13px; display: grid; place-items: center; margin-bottom: 12px; }
.sr-app .sr-empty h3 { font-size: 14px; letter-spacing: -.3px; }
.sr-app .sr-empty p { max-width: 300px; font-size: 11px; color: var(--sr-muted); line-height: 1.8; margin: 6px 0 13px; }
.sr-app .sr-error .sr-empty-icon { color: #b7775f; background: #f9eee8; }
.sr-app .sr-skeleton { min-height: 120px; background: linear-gradient(100deg,#eaf0e9 25%,#f6f9f4 42%,#eaf0e9 58%); background-size: 300% 100%; animation: sr-shimmer 1.8s infinite; border-radius: var(--sr-radius); }
.sr-app .sr-skeleton-order { height: 239px; }
.sr-app .sr-skeleton-panel { height: 340px; }
.sr-app .sr-spin { animation: sr-spin 1s linear infinite; }
.sr-app .sr-bottom-nav { display: none; }
.sr-app .sr-dialog-layer { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 22px; background: #20382f55; backdrop-filter: blur(4px); animation: sr-fade .16s ease; }
.sr-app .sr-dialog { width: min(100%,530px); max-height: calc(100dvh - 44px); overflow: auto; background: var(--sr-bg); border: 1px solid #fff9; border-radius: 21px; box-shadow: 0 25px 100px #122f2933; padding: 24px; }
.sr-app .sr-dialog-layer.drawer { place-items: stretch end; padding: 0; }
.sr-app .sr-dialog-layer.drawer .sr-dialog { width: min(100vw,390px); border-radius: 20px 0 0 20px; max-height: 100dvh; height: 100%; }
.sr-app .sr-dialog-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 23px; }
.sr-app .sr-dialog-head h2 { font-size: 18px; font-weight: 650; letter-spacing: -.5px; }
.sr-app .sr-dialog-subtitle { color: var(--sr-muted); font-size: 10px; margin-top: 4px; }
.sr-app .sr-notes { display: grid; gap: 10px; }
.sr-app .sr-note { display: flex; align-items: start; gap: 12px; padding: 15px; text-align: left; width: 100%; }
.sr-app .sr-note.unread { border-color: #c5dccb; background: #fcfefb; }
.sr-app .sr-note-icon { display: grid; place-items: center; width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px; background: #eaf2e8; color: #6b8a66; }
.sr-app .sr-note-copy { min-width: 0; flex: 1; }
.sr-app .sr-note-copy strong, .sr-app .sr-note-copy > span, .sr-app .sr-note-copy time { display: block; }
.sr-app .sr-note-copy strong { font-size: 12px; }
.sr-app .sr-note-copy > span { font-size: 11px; margin: 5px 0; color: var(--sr-muted); line-height: 1.7; }
.sr-app .sr-note-copy time { font-size: 9px; color: #8a968b; }
.sr-app .sr-note-dot { width: 6px; height: 6px; border-radius: 50%; background: #699564; flex-shrink: 0; margin-top: 5px; }
.sr-app .sr-detail-route { padding: 18px; background: white; border: 1px solid var(--sr-line); border-radius: 12px; margin: 16px 0; }
.sr-app .sr-detail-stop + .sr-detail-stop { margin-top: 20px; padding-top: 17px; border-top: 1px dashed var(--sr-line); }
.sr-app .sr-detail-stop strong { display: block; font-size: 13px; font-weight: 600; }
.sr-app .sr-detail-stop p { font-size: 11px; color: var(--sr-muted); margin-top: 4px; }
.sr-app .sr-detail-grid { margin: 0; }
.sr-app .sr-detail-row { display: grid; grid-template-columns: 1fr 1.5fr; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--sr-line); font-size: 11px; }
.sr-app .sr-detail-row dt { color: var(--sr-muted); }
.sr-app .sr-detail-row dd { margin: 0; text-align: right; font-weight: 550; }
.sr-app .sr-detail-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 22px; }
.sr-app .sr-toast { position: fixed; z-index: 100; bottom: 25px; left: calc(50% + 112px); transform: translateX(-50%); background: #213c30; color: white; box-shadow: 0 8px 25px #20352e22; border: 1px solid #405b4a; border-radius: 12px; padding: 12px 16px; font-size: 12px; display: flex; align-items: center; gap: 9px; max-width: min(90vw,520px); animation: sr-fade .2s ease; }
@keyframes sr-shimmer { to { background-position: -150% 0; } }
@keyframes sr-spin { to { transform: rotate(360deg); } }
@keyframes sr-fade { from { opacity: 0; } to { opacity: 1; } }
@media (min-width: 1600px) {
  .sr-app .sr-main { padding-top: 40px; }
  .sr-app .sr-content-grid { grid-template-columns: minmax(0,1fr) 355px; gap: 28px; }
  .sr-app .sr-order { padding: 22px 25px; }
  .sr-app .sr-order-route { margin-block: 23px; }
}
@media (max-width: 1180px) {
  .sr-app .sr-sidebar { width: 190px; padding-inline: 13px; }
  .sr-app .sr-workspace { margin-left: 190px; }
  .sr-app .sr-topbar { padding-inline: 24px; }
  .sr-app .sr-main { padding: 26px 24px; }
  .sr-app .sr-content-grid { grid-template-columns: minmax(0,1fr) 280px; gap: 18px; }
  .sr-app .sr-brand { font-size: 21px; }
  .sr-app .sr-hero-copy { padding: 28px; }
  .sr-app .sr-hero h2 { font-size: 33px; }
  .sr-app .sr-stat { padding: 15px; }
  .sr-app .sr-rate { padding: 16px; }
  .sr-app .sr-rate-pricing { flex-wrap: wrap; }
  .sr-app .sr-routes-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .sr-app .sr-toast { left: calc(50% + 95px); }
}
@media (max-width: 1000px) {
  .sr-app .sr-sidebar { display: none; }
  .sr-app .sr-workspace { margin-left: 0; }
  .sr-app .sr-mobile-menu { display: inline-grid; }
  .sr-app .sr-mobile-brand { display: block; }
  .sr-app .sr-breadcrumb { display: none; }
  .sr-app .sr-topbar { height: 68px; }
  .sr-app .sr-topbar-start { display: flex; align-items: center; gap: 13px; }
  .sr-app .sr-brand { font-size: 21px; }
  .sr-app .sr-brand-mark { width: 32px; height: 32px; border-radius: 10px 10px 10px 3px; }
  .sr-app .sr-main { padding-bottom: 103px; max-width: 950px; }
  .sr-app .sr-bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; z-index: 40; display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); border-top: 1px solid var(--sr-line); background: #fffffffa; backdrop-filter: blur(14px); padding: 8px 14px calc(8px + env(safe-area-inset-bottom,0px)); box-shadow: 0 -5px 20px #1c412205; }
  .sr-app .sr-bottom-item { border: 0; background: transparent; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4px; min-height: 46px; border-radius: 9px; color: #87958a; font-size: 9px; }
  .sr-app .sr-bottom-item.active { color: var(--sr-green); font-weight: 700; }
  .sr-app .sr-bottom-icon { height: 25px; width: 42px; display: grid; place-items: center; border-radius: 7px; }
  .sr-app .sr-bottom-item.active .sr-bottom-icon { background: var(--sr-mint); }
  .sr-app .sr-toast { left: 50%; bottom: calc(86px + env(safe-area-inset-bottom,0px)); }
  .sr-app .sr-skip { left: 15px; }
}
@media (max-width: 740px) {
  .sr-app .sr-main { padding-inline: 20px; padding-top: 24px; }
  .sr-app .sr-topbar { padding-inline: 20px; }
  .sr-app .sr-top-actions { gap: 10px; }
  .sr-app .sr-top-avatar { display: none; }
  .sr-app .sr-page-head { align-items: start; margin-bottom: 20px; }
  .sr-app .sr-page-head h1 { font-size: 27px; }
  .sr-app .sr-page-head p { max-width: 235px; line-height: 1.7; font-size: 11px; }
  .sr-app .sr-heading-actions > .sr-btn { display: none; }
  .sr-app .sr-content-grid { grid-template-columns: minmax(0,1fr); gap: 24px; }
  .sr-app .sr-right-column { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 15px; }
  .sr-app .sr-hero { grid-template-columns: 1.15fr 1fr; min-height: 235px; }
  .sr-app .sr-hero h2 { font-size: 30px; }
  .sr-app .sr-hero-copy { padding: 25px; }
  .sr-app .sr-hero-copy p { font-size: 10px; }
  .sr-app .sr-hero-location { right: 10px; font-size: 8px; }
  .sr-app .sr-benefits { gap: 14px; }
  .sr-app .sr-benefit { gap: 7px; align-items: start; }
  .sr-app .sr-benefit > svg { width: 16px; margin-top: 2px; }
  .sr-app .sr-benefit strong { font-size: 9px; }
  .sr-app .sr-benefit p { font-size: 8px; }
  .sr-app .sr-stat-label { font-size: 9px; }
  .sr-app .sr-stat-icon { width: 25px; height: 25px; }
  .sr-app .sr-stat strong { font-size: 27px; }
  .sr-app .sr-stat small { font-size: 8px; }
  .sr-app .sr-stats { gap: 9px; }
  .sr-app .sr-rates-grid { gap: 10px; }
  .sr-app .sr-rate { padding: 14px; }
  .sr-app .sr-rate-top { align-items: start; flex-direction: column; }
  .sr-app .sr-price { font-size: 23px; }
}
@media (max-width: 480px) {
  .sr-app .sr-main { padding: 22px 16px 100px; }
  .sr-app .sr-topbar { height: 64px; padding-inline: 16px; gap: 8px; }
  .sr-app .sr-topbar-start { gap: 8px; }
  .sr-app .sr-mobile-menu { width: 32px; height: 34px; }
  .sr-app .sr-brand { font-size: 19px; gap: 7px; }
  .sr-app .sr-brand-mark { width: 29px; height: 29px; }
  .sr-app .sr-brand-mark svg { width: 19px; }
  .sr-app .sr-top-actions { gap: 8px; }
  .sr-app .sr-availability-copy { display: none; }
  .sr-app .sr-availability { gap: 0; }
  .sr-app .sr-page-head h1 { font-size: 24px; letter-spacing: -.8px; }
  .sr-app .sr-heading-actions .sr-icon-button { width: 34px; height: 34px; }
  .sr-app .sr-hero { grid-template-columns: 1fr; }
  .sr-app .sr-hero-copy { padding: 25px 24px 0; }
  .sr-app .sr-hero h2 { font-size: 37px; letter-spacing: -1.5px; }
  .sr-app .sr-hero-copy p { max-width: 245px; font-size: 11px; }
  .sr-app .sr-hero-art { height: 162px; justify-content: end; margin-top: -8px; pointer-events: none; }
  .sr-app .sr-network-svg { width: 260px; max-height: 184px; }
  .sr-app .sr-hero-location { left: 23px; right: auto; bottom: 18px; font-size: 8px; max-width: 135px; }
  .sr-app .sr-benefits { padding: 18px 2px 20px; gap: 11px; }
  .sr-app .sr-benefit { display: block; }
  .sr-app .sr-benefit > svg { width: 18px; height: 18px; margin-bottom: 6px; }
  .sr-app .sr-benefit strong { font-size: 10px; line-height: 1.45; }
  .sr-app .sr-benefit p { font-size: 9px; margin-top: 4px; line-height: 1.6; }
  .sr-app .sr-stats { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 11px; margin-bottom: 25px; }
  .sr-app .sr-stat { padding: 16px; }
  .sr-app .sr-stat-label { font-size: 11px; }
  .sr-app .sr-stat strong { font-size: 29px; }
  .sr-app .sr-stat small { font-size: 9px; }
  .sr-app .sr-section-head h2 { font-size: 17px; }
  .sr-app .sr-section-head p { font-size: 10px; }
  .sr-app .sr-order { padding: 16px; border-radius: 14px; }
  .sr-app .sr-order-route { grid-template-columns: 1fr; gap: 14px; position: relative; margin: 18px 0 14px; }
  .sr-app .sr-route-stop { padding-left: 17px; position: relative; }
  .sr-app .sr-stop-heading .sr-stop-point { position: absolute; left: 0; top: 4px; }
  .sr-app .sr-order-route .sr-route-stop:first-child::after { content: ""; width: 1px; position: absolute; left: 2px; top: 16px; bottom: -6px; border-left: 1px dashed #d0ddce; }
  .sr-app .sr-order-route .sr-route-distance { display: flex; align-items: center; gap: 5px; position: absolute; right: 0; top: 0; padding: 0; }
  .sr-app .sr-route-distance svg { display: none; }
  .sr-app .sr-route-stop strong { font-size: 12px; }
  .sr-app .sr-order-time { font-size: 8px; }
  .sr-app .sr-order-footer { gap: 6px; }
  .sr-app .sr-order-footer .sr-btn { font-size: 9px; min-height: 37px; }
  .sr-app .sr-right-column { grid-template-columns: minmax(0,1fr); gap: 18px; }
  .sr-app .sr-pickup-map { height: 140px; }
  .sr-app .sr-pickup-top h2 { font-size: 16px; }
  .sr-app .sr-snapshot .sr-section-head h2 { font-size: 16px; }
  .sr-app .sr-snapshot-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 20px; }
  .sr-app .sr-bars { height: 95px; }
  .sr-app .sr-bar { max-width: 35px; }
  .sr-app .sr-rates-grid { grid-template-columns: minmax(0,1fr); gap: 12px; }
  .sr-app .sr-rate { padding: 18px; display: grid; grid-template-columns: minmax(0,1fr) minmax(100px,.75fr); gap: 0 12px; }
  .sr-app .sr-rate-top { flex-direction: row; align-items: center; }
  .sr-app .sr-rate-top h3 { font-size: 14px; }
  .sr-app .sr-rate-pricing { grid-column: 1; grid-row: 2; margin-top: 18px; }
  .sr-app .sr-rate .sr-spark, .sr-app .sr-rate .sr-no-history { grid-column: 2; grid-row: 1 / 3; align-self: center; height: 48px; }
  .sr-app .sr-rate-update { grid-column: 1 / -1; }
  .sr-app .sr-price { font-size: 26px; }
  .sr-app .sr-routes-grid { gap: 10px; }
  .sr-app .sr-route-card { padding: 14px; }
  .sr-app .sr-route-card h3 { font-size: 10px; }
  .sr-app .sr-footer { align-items: start; font-size: 8px; }
  .sr-app .sr-footer > span { max-width: 55%; }
  .sr-app .sr-dialog-layer { padding: 12px; }
  .sr-app .sr-dialog { padding: 20px; max-height: calc(100dvh - 24px); }
  .sr-app .sr-dialog-layer.drawer .sr-dialog { border-radius: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .sr-app *, .sr-app *::before, .sr-app *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
`;

function IconButton({ label, children, className, ...props }) {
  return <button type="button" className={cx("sr-icon-button", className)} aria-label={label} title={label} {...props}>{children}</button>;
}

function Brand() {
  return <div className="sr-brand" aria-label="StoneRate"><span className="sr-brand-mark"><Mountain size={24} strokeWidth={1.8} aria-hidden="true" /></span><span className="sr-brand-word">Stone<span>Rate</span></span></div>;
}

function Avatar({ transporter }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [transporter.profilePhotoUrl]);
  const initials = String(transporter.name || "Transporter").trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  return <span className="sr-avatar" aria-hidden="true">{transporter.profilePhotoUrl && !failed ? <img src={transporter.profilePhotoUrl} alt="" onError={() => setFailed(true)} /> : initials}</span>;
}

function SectionHead({ title, subtitle, action, onAction, id }) {
  return <div className="sr-section-head"><div><h2 id={id}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button type="button" className="sr-text-btn" onClick={onAction}>{action}<ArrowUpRight size={13} aria-hidden="true" /></button>}</div>;
}

function EmptyState({ icon: Icon = PackageCheck, title, text, action, onAction, error = false }) {
  return <div className={cx("sr-card sr-empty", error && "sr-error")} role={error ? "alert" : undefined}><span className="sr-empty-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p>{action && <button type="button" className="sr-btn sr-btn-soft" onClick={onAction}>{action}<ArrowRight size={14} aria-hidden="true" /></button>}</div>;
}

function Skeletons({ type = "order", count = 1 }) {
  return <div className={type === "stat" ? "sr-stats" : type === "rate" ? "sr-rates-grid" : "sr-order-list"} role="status" aria-label="Loading dashboard"><span className="sr-only">Loading dashboard…</span>{Array.from({ length: count }, (_, index) => <div key={index} className={cx("sr-skeleton", type === "order" && "sr-skeleton-order", type === "panel" && "sr-skeleton-panel")} aria-hidden="true" />)}</div>;
}

/* Original vector artwork: decorative, not a live map or tracking feed. */
function NetworkIllustration() {
  return <svg className="sr-network-svg" viewBox="0 0 440 285" fill="none" aria-hidden="true" focusable="false">
    <ellipse cx="241" cy="167" rx="160" ry="87" fill="#e2ebdb" />
    <ellipse cx="241" cy="167" rx="125" ry="68" stroke="#c7d8c0" strokeDasharray="3 6" />
    <path d="M40 172L196 89L405 185L248 271L40 172Z" fill="#d2dfc9" />
    <path d="M40 165L196 82L405 178L248 264L40 165Z" fill="#f7f9f0" />
    <path d="M55 172L205 95M165 99L364 202M84 199L254 107M123 218L293 127M166 239L335 146M61 148L274 248" stroke="#e3ebdc" strokeWidth="2" />
    <path d="M83 169L165 212L235 172L307 207L365 176" stroke="#dfe8d6" strokeWidth="30" strokeLinejoin="round" />
    <path d="M83 169L165 212L235 172L307 207L365 176" stroke="#fff" strokeWidth="22" strokeLinejoin="round" />
    <path d="M83 169L165 212L235 172L307 207L365 176" stroke="#8bb78a" strokeWidth="2" strokeDasharray="5 6" strokeLinejoin="round" />
    <path d="M213 103L213 116L252 135L280 121L280 107Z" fill="#bccdb3" />
    <path d="M213 103L242 88L280 107L251 122Z" fill="#e2eacf" />
    <path d="M223 98L223 70L250 83L250 112Z" fill="#d4dfc5" />
    <path d="M223 70L252 55L279 69L250 83Z" fill="#f9f9eb" />
    <path d="M250 83L279 69L279 96L250 112Z" fill="#c4d2b3" />
    <path d="M255 86L262 83L262 100L255 104Z" fill="#a2b294" />
    <path d="M229 80L235 83L235 90L229 87Z" fill="#a6b694" />
    <path d="M86 143L111 129L135 142L111 155L86 143Z" fill="#b5c5aa" />
    <path d="M88 132L88 141L110 153L110 144Z" fill="#ccd8bc" />
    <path d="M110 144L135 131L135 142L110 154Z" fill="#aec39f" />
    <path d="M86 131L111 115L136 130L111 144Z" fill="#ecf1de" />
    <path d="M95 124L101 111L110 106L120 113L126 125L111 134Z" fill="#c9d7ba" />
    <path d="M110 106L110 133L126 125L120 113Z" fill="#adbf9c" />
    <ellipse cx="243" cy="199" rx="57" ry="22" fill="#405b3314" />
    <g transform="translate(176 133)">
      <path d="M3 31L38 12L102 44L68 65L3 31Z" fill="#9bb78e" />
      <path d="M4 28L4 43L64 76L64 60Z" fill="#3f7750" />
      <path d="M64 60L99 40L99 56L64 76Z" fill="#28613e" />
      <path d="M3 8L36 -9L78 13L45 32L3 8Z" fill="#9db78e" />
      <path d="M3 8L3 34L45 57L45 32Z" fill="#6e9863" />
      <path d="M45 32L78 13L78 40L45 57Z" fill="#4c7b4c" />
      <path d="M11 14L11 33M22 20L22 39M33 26L33 45" stroke="#85a775" strokeWidth="3" />
      <path d="M51 36L72 24M51 45L72 33" stroke="#3f6d42" strokeWidth="2" />
      <path d="M8 7L36 -6L69 12L44 26Z" fill="#d6decb" />
      <path d="M11 6L22 -3L31 3L42 -1L53 10L64 11L45 23Z" fill="#edf0e2" />
      <path d="M49 38L80 21L96 29L96 43L110 52L110 65L80 83L49 66Z" fill="#ecf0da" />
      <path d="M80 52L110 35L110 65L80 83Z" fill="#d0dcc0" />
      <path d="M80 21L96 29L110 35L80 52L49 38Z" fill="#fcfcf0" />
      <path d="M84 50L106 38L106 51L84 63Z" fill="#567565" />
      <path d="M53 42L66 49L66 61L53 54Z" fill="#6d8a74" />
      <path d="M71 52L77 55L77 67L71 64Z" fill="#8b9f85" />
      <path d="M84 70L92 66M101 60L107 57" stroke="#fdfbed" strokeWidth="3" />
      <path d="M85 76L106 64" stroke="#809879" strokeWidth="3" />
      <ellipse cx="18" cy="48" rx="7" ry="10" transform="rotate(-22 18 48)" fill="#2b4532" />
      <ellipse cx="18" cy="48" rx="3" ry="5" transform="rotate(-22 18 48)" fill="#9aaf91" />
      <ellipse cx="37" cy="58" rx="7" ry="10" transform="rotate(-22 37 58)" fill="#2b4532" />
      <ellipse cx="37" cy="58" rx="3" ry="5" transform="rotate(-22 37 58)" fill="#9aaf91" />
      <ellipse cx="70" cy="76" rx="7" ry="10" transform="rotate(-22 70 76)" fill="#2b4532" />
      <ellipse cx="70" cy="76" rx="3" ry="5" transform="rotate(-22 70 76)" fill="#9aaf91" />
    </g>
    <ellipse cx="348" cy="157" rx="14" ry="6" fill="#c4d5b8" />
    <path d="M348 152V135" stroke="#95ab84" strokeWidth="3" />
    <path d="M332 137L348 102L364 137L348 146Z" fill="#b1c79e" />
    <path d="M348 102V146L364 137Z" fill="#97b888" />
    <ellipse cx="153" cy="119" rx="11" ry="5" fill="#c4d5b8" />
    <path d="M153 117V102" stroke="#95ab84" strokeWidth="3" />
    <path d="M140 103L153 77L166 103L153 110Z" fill="#b3c9a1" />
    <path d="M153 77V110L166 103Z" fill="#98b386" />
    <path d="M321 81C321 67 341 67 341 81C341 88 331 97 331 97C331 97 321 88 321 81Z" fill="#3e805a" />
    <circle cx="331" cy="80" r="4" fill="#f0f6e8" />
    <path d="M127 73C127 62 144 62 144 73C144 79 135.5 87 135.5 87C135.5 87 127 79 127 73Z" fill="#b4c998" />
    <circle cx="135.5" cy="72" r="3" fill="#f5f8eb" />
    <g transform="translate(246 34) rotate(5)"><rect width="107" height="28" rx="7" fill="#fff" stroke="#e0e8d6" /><circle cx="15" cy="14" r="7" fill="#e6f0df" /><path d="M12 14L14 16L18 11" stroke="#608b51" strokeWidth="1.5" strokeLinecap="round" /><text x="28" y="17" fill="#62775c" fontFamily="inherit" fontSize="8" fontWeight="600">A better way to move</text></g>
  </svg>;
}

function PickupMap({ distanceKm }) {
  return <div className="sr-pickup-map"><svg viewBox="0 0 300 135" fill="none" aria-hidden="true" focusable="false">
    <rect width="300" height="135" fill="#eff4ec" />
    <path d="M0 32H300M0 96H300M49 0V135M114 0V135M190 0V135M263 0V135" stroke="#fff" strokeWidth="12" />
    <path d="M10 0L110 135M206 0L292 135" stroke="#dce7d4" strokeWidth="18" />
    <path d="M10 0L110 135M206 0L292 135" stroke="#fff" strokeWidth="12" />
    <rect x="130" y="45" width="40" height="37" rx="7" fill="#dde9d4" />
    <rect x="65" y="45" width="29" height="25" rx="4" fill="#e0e9d8" />
    <path d="M49 93H111V34H230" stroke="#8eb68b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M49 93H111V34H230" stroke="#f3f8ed" strokeWidth="1" strokeDasharray="2 5" />
    <circle cx="49" cy="93" r="11" fill="#dcebd7" /><circle cx="49" cy="93" r="5" fill="#659461" stroke="white" strokeWidth="2" />
    <path d="M216 22C216 5 241 5 241 22C241 31 228.5 42 228.5 42C228.5 42 216 31 216 22Z" fill="#437d52" /><circle cx="228.5" cy="21" r="4" fill="#eff7e9" />
  </svg><span className="sr-map-caption">{hasNumber(distanceKm) ? `${distanceKm} km away · ` : ""}Route illustration</span></div>;
}

function Sparkline({ points, color }) {
  const gradientId = `sr-spark-${useId().replace(/:/g, "")}`;
  const data = asArray(points).filter(hasNumber).map(Number);
  if (data.length < 2) return <div className="sr-no-history">No trend history</div>;
  const width = 240, height = 45, pad = 4;
  const min = Math.min(...data), max = Math.max(...data), range = max - min;
  const coordinates = data.map((value, index) => [pad + index * (width - pad * 2) / (data.length - 1), range === 0 ? height / 2 : pad + (max - value) * (height - pad * 2) / range]);
  const path = coordinates.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const last = coordinates[coordinates.length - 1];
  return <svg className="sr-spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Recent material price trend"><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".14" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs><path d={`${path} L${last[0]},${height} L${pad},${height} Z`} fill={`url(#${gradientId})`} /><path d={path} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" vectorEffect="non-scaling-stroke" /><circle cx={last[0]} cy={last[1]} r="2.5" fill={color} /></svg>;
}

function MarketRateCard({ rate }) {
  const tones = { emerald: ["#6b9873", "#edf4e9"], orange: ["#b49b6a", "#f7f3e9"], violet: ["#9291b3", "#f1f0f7"], blue: ["#7b9fb1", "#eef4f7"] };
  const [color, tint] = tones[rate.tone] || tones.emerald;
  const movement = rate.movementType;
  const Move = movement === "up" ? ArrowUpRight : movement === "down" ? ArrowDownRight : ArrowRight;
  const movementLabel = movement === "stable" ? "Stable" : movement === "up" || movement === "down" ? money(rate.movementAmount) : "No change data";
  return <article className="sr-card sr-rate" style={{ "--rate-color": color, "--rate-tint": tint }}>
    <div className="sr-rate-top"><span className="sr-rate-icon"><Mountain size={21} strokeWidth={1.4} aria-hidden="true" /></span><div><h3>{display(rate.category)}</h3><p>{display(rate.materialName)}</p></div></div>
    <div className="sr-rate-pricing"><div><small>Starting at</small><div className="sr-price">{money(rate.startingRate)} <span>/{rate.unit || "unit"}</span></div></div><span className={cx("sr-movement", movement)} aria-label={`${movement || "Unknown"}: ${movementLabel} over 24 hours`}><Move size={13} aria-hidden="true" />{movementLabel}</span></div>
    <Sparkline points={rate.historyPoints} color={color} /><div className="sr-rate-update"><Clock3 size={9} aria-hidden="true" /><span>{rate.updatedAt || "Update time unavailable"} · 24h change</span></div>
  </article>;
}

function Status({ status }) {
  return <span className={cx("sr-status", `sr-status-${slug(status)}`)}>{status || "Status unavailable"}</span>;
}

function OrderCard({ order, onOpen, onAccept, onNavigate, busy }) {
  const isNew = order.status === "New", inTransit = order.status === "In Transit";
  const action = isNew ? "Accept trip" : inTransit ? "Navigate" : "View details";
  return <article className="sr-card sr-order">
    <div className="sr-order-head"><div className="sr-order-identity"><button type="button" className="sr-order-id" onClick={() => onOpen(order)} aria-label={`View order ${order.deliveryId || order.id}`}>{order.deliveryId || order.id || "Order details"}</button><span className="sr-source">{order.source === "StoneRate" && <ShieldCheck size={10} aria-hidden="true" />}{order.source || "Direct order"}</span></div><Status status={order.status} /></div>
    <div className="sr-order-route"><div className="sr-route-stop"><div className="sr-stop-heading"><span className="sr-stop-point" />Pickup</div><strong>{display(order.pickupName)}</strong></div><div className="sr-route-distance"><ArrowRight size={24} strokeWidth={1} aria-hidden="true" /><span>{display(order.distanceKm)} km</span></div><div className="sr-route-stop"><div className="sr-stop-heading"><span className="sr-stop-point drop" />Drop-off</div><strong>{display(order.dropName)}</strong></div></div>
    <div className="sr-order-material"><span><Layers3 size={11} aria-hidden="true" />{display(order.materialName)}</span><span>{display(order.quantity)} {order.quantityUnit || ""}</span><span><Truck size={11} aria-hidden="true" />{order.vehicleCount ?? 1} {Number(order.vehicleCount ?? 1) === 1 ? "truck" : "trucks"}</span></div>
    <div className="sr-order-footer"><div className="sr-order-time"><span><CalendarClock size={11} aria-hidden="true" />{order.pickupTime || "Pickup time pending"}</span><span><Clock3 size={11} aria-hidden="true" />Arrival: {order.arrivalWindow || "To be confirmed"}</span></div><button type="button" className={cx("sr-btn", isNew ? "sr-btn-primary" : "sr-btn-secondary")} disabled={busy} onClick={() => isNew ? onAccept(order) : inTransit ? onNavigate(order) : onOpen(order)}>{busy ? <LoaderCircle className="sr-spin" size={13} aria-hidden="true" /> : inTransit ? <Navigation size={12} aria-hidden="true" /> : null}{busy ? "Please wait" : action}{!busy && !inTransit && <ArrowRight size={12} aria-hidden="true" />}</button></div>
  </article>;
}

function Snapshot({ snapshot, onViewOrders }) {
  const bars = asArray(snapshot.weekBars).slice(0, 7);
  return <section className="sr-card sr-snapshot" aria-label="Order snapshot">
    <div className="sr-section-head"><div><div className="sr-eyebrow">Fleet activity</div><h2>Order snapshot</h2></div><ClipboardList size={17} color="#7e927b" aria-hidden="true" /></div>
    <div className="sr-snapshot-grid"><div className="sr-snapshot-metric"><small>Total trucks</small><strong>{display(snapshot.totalTrucks)}</strong><span>{display(snapshot.totalQuantity)} {snapshot.quantityUnit || ""} transported</span></div><div className="sr-snapshot-metric"><small>Total orders</small><strong>{display(snapshot.totalOrders)}</strong><span>All recorded orders</span></div><div className="sr-snapshot-metric"><small>This week</small><strong>{display(snapshot.thisWeek)}</strong><span>Orders this week</span></div><div className="sr-snapshot-metric"><small>This month</small><strong>{display(snapshot.thisMonth)}</strong><span>Orders this month</span></div></div>
    {bars.length ? <div className="sr-chart"><div className="sr-bars" role="img" aria-label={`Relative seven-day order activity: ${bars.map((v, i) => `day ${i + 1}, ${hasNumber(v) ? `${Math.max(0, Math.min(100, Number(v)))} percent` : "unavailable"}`).join("; ")}`}>{bars.map((value, index) => <div className="sr-bar-slot" key={index}><span className="sr-bar" style={{ height: `${hasNumber(value) ? Math.max(0, Math.min(100, Number(value))) : 0}%` }} /></div>)}</div><div className="sr-chart-labels" aria-hidden="true">{bars.map((_, index) => <span key={index}>D{index + 1}</span>)}</div><p className="sr-chart-caption">Seven-day activity · relative level, not order count</p></div> : <p className="sr-no-history">No activity history available</p>}
    <button type="button" className="sr-btn sr-btn-secondary sr-snapshot-link" onClick={onViewOrders}>View all orders<ArrowUpRight size={12} aria-hidden="true" /></button>
  </section>;
}

function Dialog({ title, subtitle, onClose, children, drawer = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(ref.current?.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || []).filter((node) => node.getClientRects().length > 0);
    const focusFirst = () => (focusable()[0] || ref.current)?.focus();
    focusFirst();
    const onKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const elements = focusable(), first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); ref.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) { event.preventDefault(); first.focus(); }
    };
    const onFocusIn = (event) => { if (ref.current && !ref.current.contains(event.target)) focusFirst(); };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [onClose]);
  return <div className={cx("sr-dialog-layer", drawer && "drawer")} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="sr-dialog" ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><div className="sr-dialog-head"><div><h2 id={titleId}>{title}</h2>{subtitle && <p className="sr-dialog-subtitle">{subtitle}</p>}</div><IconButton label="Close dialog" onClick={onClose}><X size={18} /></IconButton></div>{children}</section></div>;
}

export default function StoneRateTransporterHomepage({
  transporter, summary, marketRates, recentOrders, routes, nextPickup,
  orderSnapshot, notifications, loading = false, error = null,
  useMockFallback = true, onAvailabilityChange, onRefresh, onRetry,
  onViewAllRates, onViewAllOrders, onAcceptTrip, onNavigate, onCall,
  onBrowseTrips, onNavigation, onNotificationRead,
  // onViewEarnings is a retained legacy prop, intentionally not rendered.
  ...legacyProps
} = {}) {
  void legacyProps;
  const pick = (live, key) => live !== undefined ? live : useMockFallback ? MOCK_DATA[key] : undefined;
  const t = pick(transporter, "transporter") || {};
  const s = pick(summary, "summary");
  const rates = asArray(pick(marketRates, "marketRates"));
  const originalOrders = asArray(pick(recentOrders, "recentOrders"));
  const routeData = asArray(pick(routes, "routes"));
  const pickup = pick(nextPickup, "nextPickup");
  const snapshot = pick(orderSnapshot, "orderSnapshot");
  const notes = asArray(pick(notifications, "notifications"));
  const containsDemo = useMockFallback && [transporter, summary, marketRates, recentOrders, routes, nextPickup, orderSnapshot, notifications].some((value) => value === undefined);
  const demoOrders = recentOrders === undefined && useMockFallback;
  const demoNotifications = notifications === undefined && useMockFallback;
  const demoTransporter = transporter === undefined && useMockFallback;
  const [dialog, setDialog] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All trips");
  const [toast, setToast] = useState(null);
  const [pending, setPending] = useState({});
  const [availabilityOverride, setAvailabilityOverride] = useState(null);
  const [acceptedIds, setAcceptedIds] = useState([]);
  const [readIds, setReadIds] = useState([]);
  const mounted = useRef(true);
  const inFlight = useRef(new Set());
  const ordersRef = useRef(null);
  const ratesRef = useRef(null);
  const mainId = `sr-main-${useId().replace(/:/g, "")}`;
  const orderHeadingId = `sr-orders-${useId().replace(/:/g, "")}`;
  const available = availabilityOverride === null ? Boolean(t.available) : availabilityOverride;
  const unread = notes.filter((note) => !note.read && !readIds.includes(note.id)).length;
  const recent = originalOrders.slice(0, 3).map((order) => acceptedIds.includes(order.id) ? { ...order, status: "Accepted" } : order);
  const filteredOrders = recent.filter((order) => filter === "All trips" || (filter === "New" ? order.status === "New" : ["Accepted", "At Pickup", "Loading", "In Transit"].includes(order.status)));

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { setAvailabilityOverride(null); }, [transporter, t.available]);
  useEffect(() => { setAcceptedIds([]); }, [recentOrders]);
  useEffect(() => { setReadIds([]); }, [notifications]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  const closeDialog = useCallback(() => { setDialog(null); setSelected(null); }, []);
  const notify = (message, isError = false) => { if (mounted.current) setToast({ message, isError }); };

  // Async handlers never announce success until their host callback resolves.
  const run = async (key, callback, successMessage) => {
    if (inFlight.current.has(key)) return false;
    inFlight.current.add(key);
    if (mounted.current) setPending((current) => ({ ...current, [key]: true }));
    try {
      const result = await callback();
      if (result === false) throw new Error("Action declined");
      if (successMessage) notify(successMessage);
      return true;
    } catch {
      notify("That action could not be completed. Please try again.", true);
      return false;
    } finally {
      inFlight.current.delete(key);
      if (mounted.current) setPending((current) => ({ ...current, [key]: false }));
    }
  };
  const scrollTo = (ref) => {
    if (!ref.current) return;
    const reducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    ref.current.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    ref.current.focus({ preventScroll: true });
  };
  const browseTrips = () => {
    if (typeof onBrowseTrips === "function") return run("browse", onBrowseTrips);
    setFilter("New");
    scrollTo(ordersRef);
  };
  const viewOrders = () => {
    if (typeof onViewAllOrders === "function") return run("orders", onViewAllOrders);
    setFilter("All trips");
    scrollTo(ordersRef);
  };
  const viewRates = () => {
    if (typeof onViewAllRates === "function") return run("rates", onViewAllRates);
    scrollTo(ratesRef);
    notify("Showing all market rates supplied to this page.");
  };
  const navTo = (label) => {
    closeDialog();
    if (typeof onNavigation === "function") return run(`nav-${label}`, () => onNavigation(label));
    if (label === "Home") { if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" }); return; }
    if (label === "Orders") return viewOrders();
    if (label === "Bidding") return browseTrips();
    notify(`${label} is a preview destination. Connect onNavigation to open it.`);
  };
  const refresh = () => {
    if (typeof onRefresh !== "function") { notify("Refresh is not connected. Displaying the supplied dashboard data."); return; }
    return run("refresh", onRefresh, "Dashboard refreshed.");
  };
  const retry = () => {
    if (typeof onRetry === "function") return run("retry", onRetry);
    if (typeof onRefresh === "function") return refresh();
    notify("Connect onRetry or onRefresh to reload your dashboard.", true);
  };
  const toggleAvailability = async () => {
    const next = !available;
    if (typeof onAvailabilityChange === "function") {
      const ok = await run("availability", () => onAvailabilityChange(next), next ? "You are available for trips." : "Trip availability paused.");
      if (ok && mounted.current) setAvailabilityOverride(next);
    } else if (demoTransporter) {
      setAvailabilityOverride(next);
      notify(next ? "Preview: availability enabled." : "Preview: availability paused.");
    } else notify("Connect onAvailabilityChange to update your availability.", true);
  };
  const acceptTrip = async (order) => {
    const key = `accept-${order.id}`;
    if (typeof onAcceptTrip === "function") {
      const ok = await run(key, () => onAcceptTrip(order), `Trip ${order.deliveryId || order.id} accepted.`);
      if (ok && mounted.current) setAcceptedIds((current) => current.includes(order.id) ? current : [...current, order.id]);
    } else if (demoOrders) {
      setAcceptedIds((current) => current.includes(order.id) ? current : [...current, order.id]);
      notify("Preview: trip accepted locally. No booking was submitted.");
    } else notify("Connect onAcceptTrip to accept this delivery.", true);
  };
  const navigate = (payload) => {
    if (typeof onNavigate === "function") return run(`navigate-${payload.id || payload.orderId || "pickup"}`, () => onNavigate(payload));
    notify("Connect onNavigate to open directions for this pickup.");
  };
  const call = (phone) => {
    if (!phone) { notify("No phone number is available for this pickup.", true); return; }
    if (typeof onCall === "function") return run("call", () => onCall(phone));
    const number = String(phone).replace(/[^+\d*#,;]/g, "");
    if (typeof window !== "undefined" && number && /\d/.test(number)) window.location.href = `tel:${number}`;
  };
  const readNotification = async (note) => {
    if (note.read || readIds.includes(note.id)) return;
    if (typeof onNotificationRead === "function") {
      const ok = await run(`note-${note.id}`, () => onNotificationRead(note));
      if (ok && mounted.current) setReadIds((current) => [...current, note.id]);
    } else if (demoNotifications) setReadIds((current) => [...current, note.id]);
    else notify("Connect onNotificationRead to save notification changes.");
  };
  const openOrder = (order) => { setSelected(order); setDialog("order"); };
  const stats = s ? [
    { label: "Available trips", value: s.availableTrips, caption: "Ready when you are", icon: Zap },
    { label: "Trips today", value: s.tripsToday, caption: "Your daily schedule", icon: Truck },
    { label: "In transit", value: s.inTransit, caption: "Currently on the road", icon: Navigation },
    { label: "Completed", value: s.completedTrips, caption: "Deliveries made", icon: CheckCircle2 },
  ] : [];
  const location = [t.city, t.state].filter(Boolean).join(", ");
  const sidebarNavigation = <nav className="sr-side-nav" aria-label="Main navigation">{NAV_ITEMS.map(({ label, title, icon: Icon }) => <button type="button" key={label} className={cx("sr-nav-link", label === "Home" && "active")} aria-current={label === "Home" ? "page" : undefined} onClick={() => navTo(label)}><Icon size={17} strokeWidth={1.7} aria-hidden="true" />{title}{label === "Bidding" && !loading && !error && Number(s?.availableTrips) > 0 && <span className="sr-nav-count">{s.availableTrips}</span>}</button>)}</nav>;

  return <div className="sr-app">
    <style>{styles}</style><a className="sr-skip" href={`#${mainId}`}>Skip to dashboard</a>
    <aside className="sr-sidebar"><Brand /><p className="sr-workspace-label">Transporter workspace</p><div className="sr-nav-caption">WORKSPACE</div>{sidebarNavigation}<div className="sr-sidebar-bottom"><div className="sr-partner-card"><ShieldCheck size={23} strokeWidth={1.4} aria-hidden="true" /><strong>Your next mile matters.</strong><p>Clear trip details. Trusted sources. More room to grow.</p></div><button type="button" className="sr-account" onClick={() => navTo("Profile")}><Avatar transporter={t} /><span className="sr-account-copy"><strong>{t.companyName || t.name || "Transporter"}</strong><small>{t.publicId || "Your transporter account"}</small></span><ChevronRight size={14} aria-hidden="true" /></button></div></aside>
    <div className="sr-workspace">
      <header className="sr-topbar"><div className="sr-topbar-start"><IconButton label="Open navigation menu" className="sr-mobile-menu" onClick={() => setDialog("menu")} aria-expanded={dialog === "menu"}><Menu size={17} /></IconButton><div className="sr-mobile-brand"><Brand /></div><div className="sr-breadcrumb"><Home size={14} strokeWidth={1.6} aria-hidden="true" /><span>Workspace</span><ChevronRight size={12} aria-hidden="true" /><strong>Overview</strong></div></div><div className="sr-top-actions"><div className="sr-availability"><span className="sr-availability-copy">{available ? "Available for trips" : "Availability paused"}</span><button type="button" className={cx("sr-switch", available && "on")} role="switch" aria-checked={available} aria-label="Available for trips" disabled={Boolean(pending.availability) || loading || Boolean(error)} onClick={toggleAvailability}><span /></button></div><IconButton label={`Notifications, ${unread} unread`} onClick={() => setDialog("notifications")} aria-expanded={dialog === "notifications"}><Bell size={17} strokeWidth={1.7} />{unread > 0 && <span className="sr-alert-dot" />}</IconButton><span className="sr-top-avatar"><Avatar transporter={t} /></span></div></header>
      <main className="sr-main" id={mainId} tabIndex={-1} aria-busy={loading}>
        <div className="sr-page-head"><div><h1>Hello, {t.name || "Transporter"}.</h1><p>Let’s keep your business moving forward.</p></div><div className="sr-heading-actions"><IconButton label="Refresh dashboard" onClick={refresh} disabled={Boolean(pending.refresh) || loading}><RefreshCw size={15} className={pending.refresh ? "sr-spin" : undefined} /></IconButton><button type="button" className="sr-btn sr-btn-primary" onClick={browseTrips} disabled={loading || Boolean(error) || Boolean(pending.browse)}>Find a trip<ArrowUpRight size={15} aria-hidden="true" /></button></div></div>
        {error ? <EmptyState error icon={CircleAlert} title="Your dashboard couldn’t be loaded" text="No sample figures are shown here. Check your connection and try loading your dashboard again." action={pending.retry ? "Retrying…" : "Try again"} onAction={retry} /> : <>
          <section className="sr-hero" aria-label="Transporter highlights"><div className="sr-hero-copy"><div className="sr-hero-label"><Truck size={11} strokeWidth={1.7} aria-hidden="true" />BUILT FOR YOUR NEXT MILE</div><h2>Drive. Deliver.<br /><span>Grow together.</span></h2><p>Find your next opportunity with transparent trips and a trusted plant network.</p><button type="button" className="sr-text-btn sr-hero-link" onClick={browseTrips} disabled={loading || Boolean(pending.browse)}>Explore available trips<ArrowRight size={14} aria-hidden="true" /></button></div><div className="sr-hero-art"><NetworkIllustration />{location && <span className="sr-hero-location"><MapPin size={11} aria-hidden="true" />{location}</span>}</div></section>
          <div className="sr-benefits"><div className="sr-benefit"><ReceiptText size={22} strokeWidth={1.4} aria-hidden="true" /><div><strong>No hidden margins</strong><p>Clear rates. Complete trip details.</p></div></div><div className="sr-benefit"><ShieldCheck size={22} strokeWidth={1.4} aria-hidden="true" /><div><strong>Trusted plant network</strong><p>Stone sellers & sand yards.</p></div></div><div className="sr-benefit"><PackageCheck size={22} strokeWidth={1.4} aria-hidden="true" /><div><strong>Pick, drop & complete</strong><p>Direct buyer opportunities.</p></div></div></div>
          <section aria-label="Quick business summary">{loading ? <Skeletons type="stat" count={4} /> : stats.length ? <div className="sr-stats">{stats.map(({ label, value, caption, icon: Icon }) => <article className="sr-card sr-stat" key={label}><div className="sr-stat-label"><span>{label}</span><span className="sr-stat-icon"><Icon size={15} strokeWidth={1.7} aria-hidden="true" /></span></div><strong>{display(value)}</strong><small>{caption}</small></article>)}</div> : <EmptyState icon={Truck} title="Your trip overview starts here" text="Summary figures will appear when delivery opportunities are available." action="Browse trips" onAction={browseTrips} />}</section>
          <div className="sr-content-grid">
            <section ref={ordersRef} tabIndex={-1} aria-labelledby={orderHeadingId} style={{ scrollMarginTop: 96 }}><SectionHead id={orderHeadingId} title="Recent orders" subtitle="Your latest opportunities and active deliveries." action="View all" onAction={viewOrders} /><div className="sr-tabs" role="group" aria-label="Filter recent orders">{["All trips", "New", "Active"].map((label) => <button type="button" key={label} className={cx("sr-tab", filter === label && "active")} aria-pressed={filter === label} onClick={() => setFilter(label)}>{label}</button>)}</div>{loading ? <Skeletons count={3} /> : filteredOrders.length ? <div className="sr-order-list">{filteredOrders.map((order, index) => <OrderCard key={order.id || index} order={order} onOpen={openOrder} onAccept={acceptTrip} onNavigate={navigate} busy={Boolean(pending[`accept-${order.id}`] || pending[`navigate-${order.id}`])} />)}</div> : <EmptyState icon={ClipboardList} title={filter === "All trips" ? "No recent orders yet" : `No ${filter.toLowerCase()} trips in recent orders`} text="Your delivery opportunities and active trips will appear here as they arrive." action={filter === "All trips" ? "Browse available trips" : "Show all recent trips"} onAction={filter === "All trips" ? browseTrips : () => setFilter("All trips")} />}</section>
            <aside className="sr-right-column" aria-label="Pickup and fleet overview">
              {loading ? <Skeletons type="panel" /> : pickup ? <section className="sr-card sr-pickup" aria-label="Next pickup"><div className="sr-pickup-top"><h2>Your next pickup</h2><span>Scheduled</span></div><PickupMap distanceKm={pickup.distanceKm} /><div className="sr-pickup-body"><h3>{display(pickup.pickupPlant)}</h3><p className="sr-pickup-meta">{display(pickup.material)} · {display(pickup.quantity)}</p><div className="sr-pickup-time"><div><Clock3 size={17} strokeWidth={1.5} aria-hidden="true" /><span><small>Pickup time</small><strong>{display(pickup.scheduledTime)}</strong></span></div><div><MapPin size={17} strokeWidth={1.5} aria-hidden="true" /><span><small>Distance</small><strong>{display(pickup.distanceKm)} km away</strong></span></div></div><div className="sr-pickup-actions"><button type="button" className="sr-btn sr-btn-secondary" onClick={() => call(pickup.phone)} disabled={!pickup.phone || Boolean(pending.call)}><Phone size={12} aria-hidden="true" />Call plant</button><button type="button" className="sr-btn sr-btn-primary" onClick={() => navigate(pickup)} disabled={Boolean(pending[`navigate-${pickup.id || pickup.orderId || "pickup"}`])}><Navigation size={12} aria-hidden="true" />Navigate</button></div></div></section> : <EmptyState icon={CalendarClock} title="No scheduled pickup" text="Accept a trip and your next pickup will appear here." action="Find a trip" onAction={browseTrips} />}
              {loading ? <Skeletons type="panel" /> : snapshot ? <Snapshot snapshot={snapshot} onViewOrders={viewOrders} /> : <EmptyState icon={ClipboardList} title="No order history yet" text="Your fleet totals and activity will appear once orders are recorded." />}
            </aside>
          </div>
          <section className="sr-section" ref={ratesRef} tabIndex={-1} aria-label="Today's market rates" style={{ scrollMarginTop: 96 }}><SectionHead title="Today’s market rates" subtitle="A clearer view of material prices in your market." action="All rates" onAction={viewRates} />{loading ? <Skeletons type="rate" count={3} /> : rates.length ? <div className="sr-rates-grid">{rates.map((rate, index) => <MarketRateCard rate={rate} key={rate.id || index} />)}</div> : <EmptyState icon={IndianRupee} title="Market rates aren’t available yet" text="Verified material prices will appear when they are published." action="Refresh rates" onAction={refresh} />}</section>
          <section className="sr-section" aria-label="Popular transport routes"><SectionHead title="Routes worth exploring" subtitle="Stay close to demand across your service area." action="Browse trips" onAction={browseTrips} />{loading ? <Skeletons type="rate" count={3} /> : routeData.length ? <div className="sr-routes-grid">{routeData.map((route, index) => <article className="sr-card sr-route-card" key={route.id || index}><div className="sr-route-card-top"><Route size={17} strokeWidth={1.5} aria-hidden="true" /><span className={cx("sr-demand", slug(route.demand))}>{route.demand ? `${route.demand} demand` : "Demand unavailable"}</span></div><h3>{display(route.pickup)}<ArrowRight size={11} aria-hidden="true" />{display(route.drop)}</h3><p>{display(route.distanceKm)} km · {route.vehicle || "Vehicle not specified"}</p></article>)}</div> : <EmptyState icon={Route} title="No routes to show yet" text="Relevant routes will appear as opportunities become available." />}</section>
        </>}
        <footer className="sr-footer"><span><Mountain size={13} strokeWidth={1.5} aria-hidden="true" />StoneRate · Every mile, a new opportunity.</span>{containsDemo && !error ? <span className="sr-demo-tag">Sample data preview</span> : <span>Your transporter workspace</span>}</footer>
      </main>
    </div>
    <nav className="sr-bottom-nav" aria-label="Mobile navigation">{["Samples", "Bidding", "Home", "Orders", "Profile"].map((label) => { const item = NAV_ITEMS.find((entry) => entry.label === label); const Icon = item.icon; return <button type="button" key={label} className={cx("sr-bottom-item", label === "Home" && "active")} onClick={() => navTo(label)} aria-current={label === "Home" ? "page" : undefined}><span className="sr-bottom-icon"><Icon size={18} strokeWidth={1.7} aria-hidden="true" /></span><span>{label}</span></button>; })}</nav>
    {dialog === "menu" && <Dialog drawer title="Your workspace" subtitle={t.companyName || "StoneRate Transporter"} onClose={closeDialog}>{sidebarNavigation}<div className="sr-partner-card" style={{ marginTop: 30 }}><ShieldCheck size={22} aria-hidden="true" /><strong>Built for your next mile.</strong><p>Everything you need to keep your deliveries moving.</p></div></Dialog>}
    {dialog === "notifications" && <Dialog drawer title="Notifications" subtitle={`${unread} unread ${unread === 1 ? "notification" : "notifications"}`} onClose={closeDialog}>{loading ? <Skeletons type="panel" /> : notes.length ? <div className="sr-notes">{notes.map((note, index) => { const isUnread = !note.read && !readIds.includes(note.id); const Icon = note.type === "payment" ? IndianRupee : note.type === "trip" ? Truck : Clock3; return <button type="button" className={cx("sr-card sr-note", isUnread && "unread")} key={note.id || index} onClick={() => readNotification(note)} disabled={Boolean(pending[`note-${note.id}`])} aria-label={`${note.title}${isUnread ? ", unread. Mark as read" : ", read"}`}><span className="sr-note-icon"><Icon size={17} strokeWidth={1.6} aria-hidden="true" /></span><span className="sr-note-copy"><strong>{note.title}</strong><span>{note.message}</span><time>{note.createdAt}</time></span>{isUnread && <span className="sr-note-dot" />}</button>; })}</div> : <EmptyState icon={Bell} title="You’re all caught up" text="New trip alerts, payment updates, and pickup reminders will appear here." />}</Dialog>}
    {dialog === "order" && selected && <Dialog title={selected.deliveryId || "Order details"} subtitle={selected.source === "StoneRate" ? "StoneRate delivery" : selected.source || "Delivery details"} onClose={closeDialog}><Status status={acceptedIds.includes(selected.id) ? "Accepted" : selected.status} /><div className="sr-detail-route"><div className="sr-detail-stop"><div className="sr-stop-heading"><span className="sr-stop-point" />Pickup</div><strong>{display(selected.pickupName)}</strong><p>{display(selected.pickupAddress)}</p></div><div className="sr-detail-stop"><div className="sr-stop-heading"><span className="sr-stop-point drop" />Drop-off</div><strong>{display(selected.dropName)}</strong><p>{display(selected.dropAddress)}</p></div></div><dl className="sr-detail-grid">{[["Material", selected.materialName], ["Quantity", `${display(selected.quantity)} ${selected.quantityUnit || ""}`], ["Vehicles", selected.vehicleCount ?? 1], ["Distance", `${display(selected.distanceKm)} km`], ["Pickup", selected.pickupTime], ["Arrival window", selected.arrivalWindow]].map(([label, value]) => <div className="sr-detail-row" key={label}><dt>{label}</dt><dd>{display(value)}</dd></div>)}</dl><div className="sr-detail-actions">{selected.status === "New" && !acceptedIds.includes(selected.id) && <button type="button" className="sr-btn sr-btn-primary" onClick={() => acceptTrip(selected)} disabled={Boolean(pending[`accept-${selected.id}`])}>{pending[`accept-${selected.id}`] ? "Accepting…" : "Accept trip"}<Check size={14} aria-hidden="true" /></button>}<button type="button" className="sr-btn sr-btn-secondary" onClick={() => navigate(selected)} disabled={Boolean(pending[`navigate-${selected.id}`])}><Navigation size={13} aria-hidden="true" />Navigate</button><button type="button" className="sr-btn sr-btn-secondary" onClick={() => call(selected.pickupPhone)} disabled={!selected.pickupPhone || Boolean(pending.call)}><Phone size={13} aria-hidden="true" />Call pickup</button></div></Dialog>}
    {toast && <div className="sr-toast" role={toast.isError ? "alert" : "status"}>{toast.isError ? <CircleAlert size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}<span>{toast.message}</span></div>}
  </div>;
}
