import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell, Menu, X, Home, Gavel, Images, PackageCheck, UserRound, Sparkles,
  SquarePen, Truck, Phone, MapPin, ShieldCheck, Clock3, CheckCircle2, ChevronRight,
  Building2, LogOut, BadgeCheck, Hash, ReceiptText, Search, Trash2, Plus, Minus,
  Mountain, Camera, RefreshCw, AlertCircle, Fingerprint, CalendarDays, LockKeyhole,
  ArrowRight, Star,
} from "lucide-react";

/**
 * StoneRateTransporterProfile — FRONTEND-ONLY edition.
 *
 * Built on the SandSellerProfilePage layout (hero, details, verification,
 * edit sheet, photo upload sheet, sign-out sheet, toast) with transporter
 * fields instead of plant fields:
 *   Transporter owner name · Transport agency name · Mobile number ·
 *   Alternate mobile number · Aadhaar card · GSTIN · Address
 * plus two transporter-only sections:
 *   • Trucks you have   — e.g. "12 Tyre × 2, 14 Tyre × 1", add / adjust / remove
 *   • City registration — add and delete the cities you are registered in
 *
 * No bucket information and no backend calls. All data lives in component
 * state (seeded from INITIAL_PROFILE or the `transporter` prop). Every change
 * is reported through the optional onProfileUpdated(profile) callback so a
 * parent can persist it later.
 *
 * Header and bottom navigation are taken unchanged from the previous
 * transporter profile page (shared Samples / Bidding / Home / Orders / Profile).
 */

/* ───────────────────────── Seed data (frontend only) ───────────────────────── */
const INITIAL_PROFILE = {
  ownerName: "Ramesh Kumar",
  agencyName: "Ramesh Transport Company",
  transporterId: "TR-260916-625",
  primaryPhone: "9876543210",
  alternatePhone: "9123456780",
  aadhaarNumber: "234567891234",
  gstin: "09ABCDE1234F1Z5",
  address: "Plot 14, Transport Nagar, NH-31",
  city: "Jaunpur",
  state: "Uttar Pradesh",
  pincode: "222001",
  joinedAt: "2026-07-18",
  aadhaarVerified: true,
  adminVerified: false,
  photoUrl: "",
  photoZoom: 1,
  photoX: 50,
  photoY: 50,
  trucks: [
    { id: "t1", type: "12 Tyre", count: 2 },
    { id: "t2", type: "14 Tyre", count: 1 },
  ],
  cities: ["Jaunpur", "Sultanpur", "Lucknow", "Prayagraj", "Varanasi", "Ayodhya"],
};

const TRUCK_TYPES = ["6 Tyre", "10 Tyre", "12 Tyre", "14 Tyre", "16 Tyre", "18 Tyre", "22 Tyre"];
const MAX_TRUCKS_PER_TYPE = 999;

/* Shared transporter navigation (identical across Samples / Bidding / Home / Orders / Profile) */
const NAV_ITEMS = [
  { label: "Samples", icon: Images },
  { label: "Bidding", icon: Gavel },
  { label: "Home", icon: Home },
  { label: "Orders", icon: PackageCheck },
  { label: "Profile", icon: UserRound },
];
const NAV_ICON_SIZE = 19;
const NAV_ICON_ACTIVE = 20;

/* ───────────────────────────── Helpers ───────────────────────────── */
const cx = (...values) => values.filter(Boolean).join(" ");
const digits = value => String(value ?? "").replace(/\D/g, "");
const cleanPhone = value => digits(value).slice(0, 10);
const cleanAadhaar = value => digits(value).slice(0, 12);
const phoneValue = value => {
  const phone = digits(value);
  return phone.length === 12 && phone.startsWith("91") ? phone.slice(2) : phone;
};
const maskAadhaar = value => {
  const number = digits(value);
  return number.length === 12 ? `•••• •••• ${number.slice(-4)}` : "";
};
const formatAadhaar = value => digits(value).slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ");
const initials = name => String(name || "").trim().split(/\s+/).filter(Boolean)
  .slice(0, 2).map(part => part[0]).join("").toUpperCase();
const numberInRange = (value, fallback, min, max) => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};
const uid = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const totalTrucks = trucks => trucks.reduce((sum, truck) => sum + Number(truck.count || 0), 0);
const titleCase = value => String(value || "").trim().replace(/\s+/g, " ")
  .replace(/\w\S*/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase());

function normaliseTrucks(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map(truck => ({
      id: String(truck?.id || uid()),
      type: String(truck?.type || "").trim(),
      count: numberInRange(truck?.count, 0, 0, MAX_TRUCKS_PER_TYPE),
    }))
    .filter(truck => truck.type);
}

function normaliseCities(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.map(city => titleCase(city)).filter(city => {
    const key = city.toLowerCase();
    if (!city || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Merge whatever the parent passes as `transporter` on top of the seed data. */
function mapProfile(record = {}, fallback = INITIAL_PROFILE) {
  const s = record || {};
  return {
    ...INITIAL_PROFILE,
    ...fallback,
    ownerName: String(s.ownerName ?? s.transporterName ?? s.name ?? fallback.ownerName ?? ""),
    agencyName: String(s.agencyName ?? s.organisationName ?? s.companyName ?? fallback.agencyName ?? ""),
    transporterId: String(s.transporterId ?? s.publicId ?? fallback.transporterId ?? ""),
    primaryPhone: phoneValue(s.phone ?? s.primaryPhone ?? fallback.primaryPhone),
    alternatePhone: phoneValue(s.alternatePhone ?? fallback.alternatePhone),
    aadhaarNumber: cleanAadhaar(s.aadhaarNumber ?? s.aadhaar ?? fallback.aadhaarNumber),
    gstin: String(s.gstin ?? s.gstNumber ?? fallback.gstin ?? "").toUpperCase(),
    address: String(s.address ?? fallback.address ?? ""),
    city: String(s.city ?? fallback.city ?? ""),
    state: String(s.state ?? fallback.state ?? ""),
    pincode: String(s.pincode ?? fallback.pincode ?? ""),
    joinedAt: String(s.joinedAt ?? s.createdAt ?? fallback.joinedAt ?? ""),
    aadhaarVerified: typeof s.aadhaarVerified === "boolean" ? s.aadhaarVerified : fallback.aadhaarVerified === true,
    adminVerified: typeof s.adminVerified === "boolean" ? s.adminVerified : fallback.adminVerified === true,
    photoUrl: String(s.profilePhotoUrl ?? s.photoUrl ?? fallback.photoUrl ?? ""),
    photoZoom: numberInRange(s.photoZoom ?? fallback.photoZoom, 1, 1, 2.2),
    photoX: numberInRange(s.photoX ?? fallback.photoX, 50, 0, 100),
    photoY: numberInRange(s.photoY ?? fallback.photoY, 50, 0, 100),
    trucks: normaliseTrucks(s.trucks ?? fallback.trucks),
    cities: normaliseCities(s.cities ?? s.registrations ?? fallback.cities),
  };
}

function validateProfile(profile) {
  const errors = {};
  if (!profile.ownerName.trim()) errors.ownerName = "Enter the transporter owner name.";
  if (!profile.agencyName.trim()) errors.agencyName = "Enter your transport agency name.";
  if (!/^\d{10}$/.test(phoneValue(profile.primaryPhone))) {
    errors.primaryPhone = "Enter a valid 10-digit mobile number.";
  }
  if (profile.alternatePhone && !/^\d{10}$/.test(phoneValue(profile.alternatePhone))) {
    errors.alternatePhone = "Enter a valid 10-digit alternate number.";
  } else if (profile.alternatePhone && phoneValue(profile.alternatePhone) === phoneValue(profile.primaryPhone)) {
    errors.alternatePhone = "Use a number different from your primary mobile.";
  }
  if (profile.aadhaarNumber && !/^\d{12}$/.test(digits(profile.aadhaarNumber))) {
    errors.aadhaarNumber = "Aadhaar number must be exactly 12 digits.";
  }
  if (profile.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(profile.gstin.trim().toUpperCase())) {
    errors.gstin = "Enter a valid 15-character GSTIN.";
  }
  if (!profile.address.trim()) errors.address = "Enter your agency's complete address.";
  if (profile.pincode && !/^\d{6}$/.test(profile.pincode)) errors.pincode = "Enter a 6-digit PIN code.";
  return errors;
}

function formatJoiningDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function completeness(profile) {
  const checks = [
    profile.ownerName, profile.agencyName, profile.primaryPhone, profile.alternatePhone,
    profile.aadhaarNumber, profile.gstin, profile.address, profile.photoUrl,
    profile.trucks.length ? "yes" : "", profile.cities.length ? "yes" : "",
  ];
  const filled = checks.filter(value => String(value || "").trim()).length;
  return Math.round((filled / checks.length) * 100);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
}

/* ───────────────────────── Presentational pieces ───────────────────────── */
function Brand() {
  return <div className="ssp-brand"><i><Sparkles size={14}/></i><span>Stone</span><b>Rate</b></div>;
}

function Badge({ verified, children, light = false }) {
  const Icon = verified ? CheckCircle2 : Clock3;
  return <span className={`ssp-badge ${verified ? "is-verified" : "is-pending"} ${light ? "is-light" : ""}`}>
    <Icon size={13}/>{children}
  </span>;
}

function Ring({ value, size = 104, stroke = 4, light = false, children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;
  return <div className={`ssp-ring ${light ? "is-light" : ""}`} style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className="ssp-ring-track" cx={center} cy={center} r={radius} strokeWidth={stroke}/>
      <circle className="ssp-ring-fill" cx={center} cy={center} r={radius} strokeWidth={stroke} style={{ "--circ": circumference }}
        strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${center} ${center})`}/>
    </svg>
    <div className="ssp-ring-inner">{children}</div>
  </div>;
}

function Detail({ icon: Icon, label, value, hint, tone = "indigo", full = false }) {
  return <div className={`ssp-detail is-${tone} ${full ? "ssp-full" : ""} ${value ? "" : "is-empty"}`}>
    <i><Icon size={19}/></i>
    <div><dt>{label}</dt><dd>{value || "Not provided"}</dd>{hint && <small>{hint}</small>}</div>
  </div>;
}

function Stat({ icon: Icon, value, label }) {
  return <div className="ssp-stat"><i><Icon size={15}/></i><div><b>{value}</b><span>{label}</span></div></div>;
}

function Field({ name, label, error, note, full = false, children }) {
  return <div className={`ssp-field ${full ? "ssp-full" : ""} ${error ? "has-error" : ""}`}>
    <label htmlFor={`tp-${name}`}>{label}</label>{children}
    {error ? <small id={`tp-${name}-error`} className="ssp-field-error"><AlertCircle size={12}/>{error}</small>
      : note ? <small id={`tp-${name}-note`} className="ssp-field-note">{note}</small> : null}
  </div>;
}

function Sheet({ title, subtitle, onClose, busy = false, children, footer }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus?.();
    };
  }, []);
  const handleKeyDown = event => {
    if (event.key === "Escape" && !busy) {
      event.preventDefault();
      closeRef.current();
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(ref.current.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]'
    )).filter(element => element.getClientRects().length > 0);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === ref.current)) {
      event.preventDefault(); first.focus();
    }
  };
  return <div className="ssp-overlay" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section ref={ref} className="ssp-sheet" role="dialog" aria-modal="true" aria-label={title} aria-busy={busy} tabIndex={-1} onKeyDown={handleKeyDown}>
      <i className="ssp-handle"/>
      <header className="ssp-sheet-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="ssp-icon" disabled={busy} onClick={onClose} aria-label="Close dialog"><X size={20}/></button>
      </header>
      <div className="ssp-sheet-body">{children}</div>
      {footer && <footer className="ssp-sheet-foot">{footer}</footer>}
    </section>
  </div>;
}

/* ───────────────────────────── Page ───────────────────────────── */
export default function StoneRateTransporterProfile({
  transporter = null, unreadNotifications = 2,
  onNavigation = () => {}, onMenu = () => {}, onNotifications = () => {},
  onSignOut = () => {}, onProfileUpdated, onVerifyAadhaar,
}) {
  const [profile, setProfile] = useState(() => mapProfile(transporter));
  const [draft, setDraft] = useState(profile);
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoSettings, setPhotoSettings] = useState({ zoom: 1, x: 50, y: 50 });
  const [truckType, setTruckType] = useState(TRUCK_TYPES[2]);
  const [customTruckType, setCustomTruckType] = useState("");
  const [truckCount, setTruckCount] = useState("1");
  const [truckError, setTruckError] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [newCity, setNewCity] = useState("");
  const [cityError, setCityError] = useState("");
  const profileRef = useRef(profile);
  const callbackRef = useRef(onProfileUpdated);
  const mountedRef = useRef(true);
  const operationRef = useRef(false);
  const toastTimer = useRef(null);
  const photoInput = useRef(null);
  callbackRef.current = onProfileUpdated;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; clearTimeout(toastTimer.current); };
  }, []);
  useEffect(() => {
    if (!photoFile) { setPhotoPreview(""); return undefined; }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);
  const externalId = transporter?.transporterId || transporter?.publicId || "";
  useEffect(() => {
    if (!transporter) return;
    const next = mapProfile(transporter, profileRef.current);
    profileRef.current = next;
    setProfile(next);
    setDraft(next);
  }, [externalId]); // eslint-disable-line react-hooks/exhaustive-deps

  const notify = useCallback(message => {
    if (!mountedRef.current) return;
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => { if (mountedRef.current) setToast(""); }, 4000);
  }, []);
  /** Single place where the profile changes; also informs the parent. */
  const commit = useCallback((updater, message) => {
    const next = typeof updater === "function" ? updater(profileRef.current) : { ...profileRef.current, ...updater };
    profileRef.current = next;
    setProfile(next);
    setDraft(next);
    try { callbackRef.current?.(next); } catch { /* parent refresh is optional */ }
    if (message) notify(message);
    return next;
  }, [notify]);

  const beginOperation = () => {
    if (operationRef.current) return false;
    operationRef.current = true;
    setBusy(true);
    setError("");
    return true;
  };
  const endOperation = () => {
    operationRef.current = false;
    if (mountedRef.current) setBusy(false);
  };
  const closeSheet = () => {
    if (operationRef.current) return;
    setSheet(null); setError(""); setPhotoFile(null);
  };
  const openEdit = () => { setDraft(profile); setFieldErrors({}); setError(""); setSheet("edit"); };
  const updateDraft = (key, value) => {
    setDraft(previous => ({ ...previous, [key]: value }));
    setFieldErrors(previous => ({ ...previous, [key]: "" }));
    setError("");
  };

  /* ── Edit profile ── */
  const saveProfile = event => {
    event?.preventDefault();
    const errors = validateProfile(draft);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    commit(previous => ({
      ...previous,
      ownerName: draft.ownerName.trim(),
      agencyName: draft.agencyName.trim(),
      primaryPhone: phoneValue(draft.primaryPhone),
      alternatePhone: phoneValue(draft.alternatePhone),
      aadhaarNumber: cleanAadhaar(draft.aadhaarNumber),
      gstin: draft.gstin.trim().toUpperCase(),
      address: draft.address.trim(),
      city: draft.city.trim(),
      state: draft.state.trim(),
      pincode: draft.pincode.trim(),
    }), "Your transporter profile has been updated.");
    setSheet(null);
  };

  /* ── Trucks you have ── */
  const addTruck = event => {
    event?.preventDefault();
    const type = titleCase(truckType === "Other" ? customTruckType : truckType);
    const count = Number(truckCount);
    if (!type) { setTruckError("Enter the truck type, e.g. 12 Tyre."); return; }
    if (!Number.isInteger(count) || count < 1 || count > MAX_TRUCKS_PER_TYPE) {
      setTruckError(`Enter a whole number of trucks between 1 and ${MAX_TRUCKS_PER_TYPE}.`); return;
    }
    const existing = profile.trucks.find(truck => truck.type.toLowerCase() === type.toLowerCase());
    commit(previous => ({
      ...previous,
      trucks: existing
        ? previous.trucks.map(truck => truck.id === existing.id
          ? { ...truck, count: Math.min(MAX_TRUCKS_PER_TYPE, truck.count + count) } : truck)
        : [...previous.trucks, { id: uid(), type, count }],
    }), existing ? `${type} count updated.` : `${type} added to your fleet.`);
    setTruckError(""); setTruckCount("1"); setCustomTruckType("");
  };
  const changeTruckCount = (id, delta) => commit(previous => ({
    ...previous,
    trucks: previous.trucks.map(truck => truck.id === id
      ? { ...truck, count: numberInRange(truck.count + delta, 0, 0, MAX_TRUCKS_PER_TYPE) } : truck),
  }));
  const setTruckCountValue = (id, value) => commit(previous => ({
    ...previous,
    trucks: previous.trucks.map(truck => truck.id === id
      ? { ...truck, count: numberInRange(digits(value) === "" ? 0 : Number(digits(value)), 0, 0, MAX_TRUCKS_PER_TYPE) } : truck),
  }));
  const removeTruck = truck => commit(previous => ({
    ...previous, trucks: previous.trucks.filter(item => item.id !== truck.id),
  }), `${truck.type} removed from your fleet.`);

  /* ── City registration ── */
  const addCity = event => {
    event?.preventDefault();
    const city = titleCase(newCity);
    if (!city) { setCityError("Enter a city name."); return; }
    if (profile.cities.some(item => item.toLowerCase() === city.toLowerCase())) {
      setCityError(`${city} is already registered.`); return;
    }
    commit(previous => ({ ...previous, cities: [...previous.cities, city] }), `${city} added to your registrations.`);
    setNewCity(""); setCityError(""); setCitySearch("");
  };
  const deleteCity = city => commit(previous => ({
    ...previous, cities: previous.cities.filter(item => item !== city),
  }), `${city} removed from your registrations.`);

  /* ── Profile photo (stored as a data URL in state) ── */
  const choosePhoto = event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 15 * 1024 * 1024) {
      notify("Choose a JPG, PNG or WEBP image up to 15 MB."); return;
    }
    setPhotoFile(file); setPhotoSettings({ zoom: 1, x: 50, y: 50 }); setError(""); setSheet("photo");
  };
  const savePhoto = async () => {
    if (!photoFile || !beginOperation()) return;
    try {
      const dataUrl = await readFileAsDataUrl(photoFile);
      if (!mountedRef.current) return;
      commit({ photoUrl: dataUrl, photoZoom: photoSettings.zoom, photoX: photoSettings.x, photoY: photoSettings.y }, "Profile photo updated.");
      setPhotoFile(null); setSheet(null);
    } catch (photoFailure) {
      if (mountedRef.current) setError(photoFailure.message || "Unable to use this photo.");
    } finally { endOperation(); }
  };
  const removePhoto = () => {
    commit({ photoUrl: "", photoZoom: 1, photoX: 50, photoY: 50 }, "Profile photo removed.");
    setPhotoFile(null); setSheet(null);
  };

  /* ── Aadhaar verification (optional parent hook, no backend here) ── */
  const startAadhaarVerification = async () => {
    if (profile.aadhaarVerified || !beginOperation()) return;
    try {
      if (typeof onVerifyAadhaar !== "function") {
        throw new Error("Aadhaar verification is not connected yet. Your verification status has not been changed.");
      }
      const result = await onVerifyAadhaar({ transporterId: profile.transporterId, aadhaarNumber: profile.aadhaarNumber });
      if (!mountedRef.current) return;
      if (result?.aadhaarVerified === true) {
        commit({ aadhaarVerified: true }, "Aadhaar verification completed.");
        setSheet(null);
      } else {
        setSheet(null); notify("Verification status unchanged.");
      }
    } catch (verificationFailure) {
      if (mountedRef.current) setError(verificationFailure.message || "Unable to open Aadhaar verification.");
    } finally { endOperation(); }
  };

  const signOut = async () => {
    if (!beginOperation()) return;
    try {
      await onSignOut();
      if (mountedRef.current) { setSheet(null); notify("Signed out successfully."); }
    } catch (signoutFailure) {
      if (mountedRef.current) setError(signoutFailure.message || "Unable to sign out.");
    } finally { endOperation(); }
  };

  const navTo = label => onNavigation(label);
  const verified = profile.aadhaarVerified && profile.adminVerified;
  const completed = Number(profile.aadhaarVerified) + Number(profile.adminVerified);
  const percent = completeness(profile);
  const total = totalTrucks(profile.trucks);
  const location = [profile.city, profile.state, profile.pincode].filter(Boolean).join(" · ");
  const fleetSummary = profile.trucks.map(truck => `${truck.type} × ${truck.count}`).join(" · ");
  const visibleCities = profile.cities.filter(city => city.toLowerCase().includes(citySearch.trim().toLowerCase()));
  const describedBy = name => fieldErrors[name] ? `tp-${name}-error` : undefined;
  const inputProps = name => ({
    id: `tp-${name}`, name, value: draft[name], disabled: busy,
    onChange: event => updateDraft(name, event.target.value),
    "aria-invalid": Boolean(fieldErrors[name]), "aria-describedby": describedBy(name),
  });
  const sheetError = error ? <div className="ssp-alert" role="alert"><AlertCircle size={17}/><span>{error}</span></div> : null;
  const photoStyle = {
    objectPosition: `${profile.photoX}% ${profile.photoY}%`, transform: `scale(${profile.photoZoom})`,
    transformOrigin: `${profile.photoX}% ${profile.photoY}%`,
  };

  return <div className="sand-seller-profile transporter-profile">
    <style>{CSS}</style>
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs><linearGradient id="ssp-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#5b6cff"/><stop offset="55%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#22c1ee"/>
      </linearGradient></defs>
    </svg>
    <div className="ssp-orb ssp-orb-one" aria-hidden="true"/>
    <div className="ssp-orb ssp-orb-two" aria-hidden="true"/>

    {/* ─── Header (unchanged from the transporter pages) ─── */}
    <header className="bd-header"><div className="bd-shell bd-header-inner">
      <button type="button" className="bd-icon-btn" aria-label="Open menu" onClick={onMenu}><Menu size={19}/></button>
      <div className="bd-greeting"><strong>Hi, {transporter?.name || profile.ownerName || "Transporter"}</strong><small>Manage your transporter profile</small></div>
      <div className="bd-logo" aria-label="StoneRate"><span className="bd-logo-mark"><Mountain size={17}/></span><span>Stone<span className="bd-logo-rate">Rate</span></span></div>
      <nav className="bd-desktop-nav" aria-label="Desktop navigation">
        {NAV_ITEMS.map(item => <button type="button" key={item.label} className={item.label === "Profile" ? "active" : ""} onClick={() => navTo(item.label)}>{item.label}</button>)}
      </nav>
      <button type="button" className="bd-icon-btn" aria-label={`Notifications, ${unreadNotifications} unread`} onClick={onNotifications}><Bell size={19}/>{unreadNotifications > 0 && <span className="bd-notify-dot"/>}</button>
    </div></header>

    <main className="ssp-content">
      {/* ─── Hero ─── */}
      <section className="ssp-hero ssp-reveal" aria-labelledby="tp-profile-title">
        <div className="ssp-hero-mesh" aria-hidden="true"/>
        <div className="ssp-hero-glow ssp-glow-a" aria-hidden="true"/>
        <div className="ssp-hero-glow ssp-glow-b" aria-hidden="true"/>
        <div className="ssp-hero-art" aria-hidden="true"><Truck/><div className="ssp-art-ring"/><div className="ssp-art-ring ssp-art-ring-two"/></div>

        <div className="ssp-hero-top ssp-hero-in" style={{ "--d": "120ms" }}>
          <span className="ssp-eyebrow"><Star size={10} className="ssp-twinkle"/>YOUR TRANSPORTER ACCOUNT</span>
          <Badge verified={verified} light>{verified ? "Verified transporter" : "Verification pending"}</Badge>
        </div>

        <div className="ssp-identity ssp-hero-in" style={{ "--d": "220ms" }}>
          <div className="ssp-avatar-wrap">
            <span className="ssp-avatar-halo" aria-hidden="true"/>
            <Ring value={percent} size={108} stroke={3.5} light>
              <div className="ssp-avatar">
                {profile.photoUrl ? <img src={profile.photoUrl} alt="Transporter profile" style={photoStyle}/>
                  : initials(profile.ownerName) ? <span>{initials(profile.ownerName)}</span> : <UserRound size={32}/>}
              </div>
            </Ring>
            <button type="button" className="ssp-camera" onClick={() => photoInput.current?.click()} disabled={busy} aria-label="Change profile photo"><Camera size={14}/></button>
            {verified && <i className="ssp-avatar-check" aria-hidden="true"><BadgeCheck size={16}/></i>}
          </div>
          <div className="ssp-hero-name">
            <span>Transport agency</span>
            <h1 id="tp-profile-title">{profile.agencyName || "Your transport agency"}</h1>
            <p><UserRound size={14}/>{profile.ownerName || "Add the owner name"}</p>
            {profile.transporterId && <small><Hash size={10}/>Transporter ID <b>{profile.transporterId}</b></small>}
          </div>
        </div>

        <div className="ssp-stats ssp-hero-in" style={{ "--d": "340ms" }}>
          <Stat icon={Truck} value={total} label="Total trucks"/>
          <Stat icon={MapPin} value={profile.cities.length} label="Registered cities"/>
          <Stat icon={Sparkles} value={`${percent}%`} label="Profile complete"/>
        </div>

        <div className="ssp-hero-bottom ssp-hero-in" style={{ "--d": "440ms" }}>
          <p><ShieldCheck size={16}/>{verified ? "Your transporter account is fully verified." : "Complete verification to unlock a verified badge."}</p>
          <button type="button" className="ssp-hero-edit" disabled={busy} onClick={openEdit}><SquarePen size={15}/>Edit profile</button>
        </div>
      </section>
      <input ref={photoInput} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={choosePhoto}/>

      <div className="ssp-layout">
        {/* ─── Details ─── */}
        <section className="ssp-card ssp-details ssp-reveal" style={{ "--delay": "140ms" }} aria-labelledby="tp-details-title">
          <div className="ssp-section-head">
            <div><span className="ssp-kicker">THE DETAILS</span><h2 id="tp-details-title">Transporter & agency details</h2><p>Your business, all in one place.</p></div>
            <button type="button" className="ssp-edit-link" onClick={openEdit} disabled={busy} aria-label="Edit transporter and agency details"><SquarePen size={15}/><span>Edit</span></button>
          </div>
          <dl className="ssp-detail-grid">
            <Detail icon={UserRound} label="Transporter owner name" value={profile.ownerName} tone="violet" full/>
            <Detail icon={Building2} label="Transport agency name" value={profile.agencyName} tone="indigo" full/>
            <Detail icon={Phone} label="Mobile number" value={profile.primaryPhone ? `+91 ${profile.primaryPhone}` : ""} hint="Primary contact" tone="indigo"/>
            <Detail icon={Phone} label="Alternate mobile number" value={profile.alternatePhone ? `+91 ${profile.alternatePhone}` : ""} hint="Additional contact" tone="violet"/>
            <Detail icon={Fingerprint} label="Aadhaar card" value={maskAadhaar(profile.aadhaarNumber)} hint={profile.aadhaarVerified ? "Verified identity" : "Verification pending"} tone="cyan"/>
            <Detail icon={ReceiptText} label="GSTIN" value={profile.gstin} hint="Goods and Services Tax ID" tone="violet"/>
            <Detail icon={CalendarDays} label="Joining date" value={formatJoiningDate(profile.joinedAt)} hint="StoneRate registration" tone="cyan"/>
            <Detail icon={MapPin} label="Address" value={profile.address} hint={location} tone="map" full/>
          </dl>
          <div className="ssp-secure-note"><i><LockKeyhole size={15}/></i><span>Your Aadhaar number is shown masked. Only the last four digits are ever displayed on this page.</span></div>
        </section>

        {/* ─── Trucks you have ─── */}
        <section className="ssp-card tp-fleet-card ssp-reveal" style={{ "--delay": "170ms" }} aria-labelledby="tp-fleet-title">
          <div className="ssp-section-head">
            <div><span className="ssp-kicker">YOUR FLEET</span><h2 id="tp-fleet-title">Trucks you have</h2><p>{total ? `${total} truck${total === 1 ? "" : "s"} across ${profile.trucks.length} type${profile.trucks.length === 1 ? "" : "s"}` : "Add the trucks you operate."}</p></div>
            <i className="ssp-section-icon"><Truck size={22}/></i>
          </div>
          {profile.trucks.length ? <ul className="tp-truck-list">
            {profile.trucks.map(truck => <li key={truck.id} className="tp-truck-row">
              <i><Truck size={18}/></i>
              <div className="tp-truck-name"><b>{truck.type}</b><span>{truck.count} truck{truck.count === 1 ? "" : "s"}</span></div>
              <div className="tp-counter" role="group" aria-label={`${truck.type} count`}>
                <button type="button" onClick={() => changeTruckCount(truck.id, -1)} disabled={busy || truck.count <= 0} aria-label={`Decrease ${truck.type}`}><Minus size={14}/></button>
                <input type="text" inputMode="numeric" value={truck.count} disabled={busy} aria-label={`${truck.type} trucks`} onChange={event => setTruckCountValue(truck.id, event.target.value)}/>
                <button type="button" onClick={() => changeTruckCount(truck.id, 1)} disabled={busy || truck.count >= MAX_TRUCKS_PER_TYPE} aria-label={`Increase ${truck.type}`}><Plus size={14}/></button>
              </div>
              <button type="button" className="tp-remove" onClick={() => removeTruck(truck)} disabled={busy} aria-label={`Remove ${truck.type}`}><Trash2 size={15}/></button>
            </li>)}
          </ul> : <p className="tp-empty">No trucks added yet. Add your first truck type below.</p>}
          <form className="tp-add-truck" onSubmit={addTruck} noValidate>
            <div className="tp-add-truck-head"><b>Add truck type</b><span>{fleetSummary || "e.g. 12 Tyre × 2 · 14 Tyre × 1"}</span></div>
            <div className="tp-add-truck-row">
              <label className="tp-select">
                <span>Truck type</span>
                <select value={truckType} disabled={busy} onChange={event => { setTruckType(event.target.value); setTruckError(""); }}>
                  {TRUCK_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  <option value="Other">Other…</option>
                </select>
              </label>
              {truckType === "Other" && <label className="tp-custom">
                <span>Custom type</span>
                <input type="text" value={customTruckType} disabled={busy} placeholder="e.g. 10 Tyre Tipper" maxLength={32}
                  onChange={event => { setCustomTruckType(event.target.value); setTruckError(""); }}/>
              </label>}
              <label className="tp-count">
                <span>How many</span>
                <input type="text" inputMode="numeric" value={truckCount} disabled={busy} maxLength={3}
                  onChange={event => { setTruckCount(digits(event.target.value).slice(0, 3)); setTruckError(""); }}/>
              </label>
              <button type="submit" className="tp-add-button" disabled={busy}><Plus size={16}/>Add</button>
            </div>
            {truckError && <small className="ssp-field-error"><AlertCircle size={12}/>{truckError}</small>}
          </form>
        </section>

        {/* ─── City registration ─── */}
        <section className="ssp-card tp-city-card ssp-reveal" style={{ "--delay": "200ms" }} aria-labelledby="tp-city-title">
          <div className="ssp-section-head">
            <div><span className="ssp-kicker">SERVICE AREA</span><h2 id="tp-city-title">City registration</h2><p>{profile.cities.length ? `Registered in ${profile.cities.length} cit${profile.cities.length === 1 ? "y" : "ies"}` : "Add the cities you are registered in."}</p></div>
            <i className="ssp-section-icon"><MapPin size={22}/></i>
          </div>
          <form className="tp-add-city" onSubmit={addCity} noValidate>
            <MapPin size={17}/>
            <input type="text" value={newCity} disabled={busy} placeholder="Add a city, e.g. Kanpur" maxLength={48} aria-label="City to add"
              onChange={event => { setNewCity(event.target.value); setCityError(""); }}/>
            <button type="submit" disabled={busy}><Plus size={16}/>Add</button>
          </form>
          {cityError && <small className="ssp-field-error"><AlertCircle size={12}/>{cityError}</small>}
          {profile.cities.length > 4 && <div className="tp-search"><Search size={17}/>
            <input type="search" value={citySearch} onChange={event => setCitySearch(event.target.value)} placeholder="Search registered cities" aria-label="Search registered cities"/>
          </div>}
          <ul className="tp-city-list">
            {visibleCities.length ? visibleCities.map(city => <li key={city}>
              <span><MapPin size={15}/><b>{city}</b></span>
              <button type="button" onClick={() => deleteCity(city)} disabled={busy} aria-label={`Delete ${city}`}><Trash2 size={15}/></button>
            </li>) : <li className="tp-empty-row">{profile.cities.length ? "No registered city matches this search." : "No cities registered yet."}</li>}
          </ul>
          <div className="ssp-secure-note"><i><ShieldCheck size={15}/></i><span>Only cities listed here appear as your service area to sellers and buyers.</span></div>
        </section>

        {/* ─── Verification ─── */}
        <section className="ssp-card ssp-verification ssp-reveal" style={{ "--delay": "230ms" }} aria-labelledby="tp-verification-title">
          <div className="ssp-section-head">
            <div><span className="ssp-kicker">BUILD TRUST</span><h2 id="tp-verification-title">Verification</h2><p>A clear status, every step of the way.</p></div>
            <i className="ssp-section-icon"><ShieldCheck size={22}/></i>
          </div>
          <div className={`ssp-verification-progress ${verified ? "is-complete" : ""}`}>
            <Ring value={completed * 50} size={72} stroke={5}><b>{completed}<small>/2</small></b></Ring>
            <div className="ssp-progress-copy">
              <b>{verified ? "You're all verified" : "Your verification journey"}</b>
              <span>{verified ? "Both checks are complete. Sellers and buyers can trust your agency." : `${2 - completed} step${completed === 1 ? "" : "s"} remaining to earn the verified badge.`}</span>
              <div className="ssp-progress-track" role="progressbar" aria-label="Verification steps completed" aria-valuemin={0} aria-valuemax={2} aria-valuenow={completed}>
                <i style={{ width: `${completed * 50}%` }}/></div>
            </div>
          </div>
          <ol className="ssp-timeline">
            <li className={`ssp-step ${profile.aadhaarVerified ? "is-complete" : "is-active"}`}>
              <div className="ssp-step-icon"><Fingerprint size={23}/><small>{profile.aadhaarVerified ? <CheckCircle2 size={11}/> : "01"}</small></div>
              <div className="ssp-step-copy">
                <div className="ssp-step-title"><h3>Aadhaar verification</h3><Badge verified={profile.aadhaarVerified}>{profile.aadhaarVerified ? "Verified" : "Pending"}</Badge></div>
                <p>{profile.aadhaarVerified ? "Your identity has been verified securely." : "Verify your identity through the secure Aadhaar flow."}</p>
                {!profile.aadhaarVerified && <button type="button" className="ssp-verify-button" disabled={busy}
                  onClick={() => { setError(""); setSheet("aadhaar"); }}>Verify now<ArrowRight size={15}/></button>}
              </div>
            </li>
            <li className={`ssp-step ssp-step-admin ${profile.adminVerified ? "is-complete" : ""}`}>
              <div className="ssp-step-icon"><ShieldCheck size={23}/><small>{profile.adminVerified ? <CheckCircle2 size={11}/> : "02"}</small></div>
              <div className="ssp-step-copy">
                <div className="ssp-step-title"><h3>Admin verification</h3><Badge verified={profile.adminVerified}>{profile.adminVerified ? "Verified" : "Yet to verify"}</Badge></div>
                <p>{profile.adminVerified ? "Your agency has been approved by the StoneRate admin team." : "The StoneRate team reviews your agency, GSTIN, fleet and city registrations."}</p>
              </div>
            </li>
          </ol>
          <div className="ssp-admin-note"><i><LockKeyhole size={14}/></i><span>Admin verification is updated by the StoneRate team. No action is needed here.</span></div>
        </section>
      </div>

      <button type="button" className="ssp-signout ssp-reveal" style={{ "--delay": "260ms" }} onClick={() => { setError(""); setSheet("signout"); }}>
        <i><LogOut size={17}/></i><div><b>Sign out</b><span>End this transporter session securely</span></div><ChevronRight size={17}/>
      </button>
      <footer className="ssp-footer"><Brand/><span>TRANSPORTER CONSOLE</span></footer>
    </main>

    {/* ─── Bottom navigation (unchanged from the transporter pages) ─── */}
    <nav className="bd-bottom" aria-label="Mobile navigation">
      {NAV_ITEMS.map(item => { const Icon = item.icon; const active = item.label === "Profile"; const badge = ({ Orders: unreadNotifications })[item.label] || 0;
        return <button type="button" key={item.label} className={cx("bd-nav-item", active && "active")} aria-current={active ? "page" : undefined} onClick={() => navTo(item.label)}>
          {badge > 0 && <span className="bd-nav-badge">{Math.min(badge, 9)}</span>}
          {active ? <span className="bd-active-icon"><Icon size={NAV_ICON_ACTIVE}/></span> : <Icon size={NAV_ICON_SIZE}/>}
          <span>{item.label}</span>
        </button>; })}
    </nav>
    <div className={`ssp-toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>

    {sheet === "edit" && <Sheet title="Edit your profile" subtitle="Keep your agency and contact details up to date." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Cancel</button>
        <button type="submit" form="tp-edit-form" className="ssp-primary" disabled={busy}><CheckCircle2 size={16}/>Save changes</button></>}>
      <form id="tp-edit-form" onSubmit={saveProfile} noValidate><fieldset className="ssp-form-grid" disabled={busy}>
        <Field name="ownerName" label="Transporter owner name" error={fieldErrors.ownerName} full><input {...inputProps("ownerName")} autoComplete="name" required/></Field>
        <Field name="agencyName" label="Transport agency name" error={fieldErrors.agencyName} full><input {...inputProps("agencyName")} autoComplete="organization" required/></Field>
        <Field name="primaryPhone" label="Mobile number" error={fieldErrors.primaryPhone}>
          <div className="ssp-phone-input"><span>+91</span><input {...inputProps("primaryPhone")} type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" required
            onChange={event => updateDraft("primaryPhone", cleanPhone(event.target.value))}/></div></Field>
        <Field name="alternatePhone" label="Alternate mobile number" error={fieldErrors.alternatePhone}>
          <div className="ssp-phone-input"><span>+91</span><input {...inputProps("alternatePhone")} type="tel" inputMode="numeric" maxLength={10}
            onChange={event => updateDraft("alternatePhone", cleanPhone(event.target.value))}/></div></Field>
        <Field name="aadhaarNumber" label="Aadhaar card number" error={fieldErrors.aadhaarNumber} note="12-digit Aadhaar number. Shown masked on your profile." full>
          <input {...inputProps("aadhaarNumber")} value={formatAadhaar(draft.aadhaarNumber)} type="text" inputMode="numeric" maxLength={14} autoComplete="off" placeholder="0000 0000 0000"
            onChange={event => updateDraft("aadhaarNumber", cleanAadhaar(event.target.value))}/></Field>
        <Field name="gstin" label="GSTIN" error={fieldErrors.gstin} note="15-character Goods and Services Tax Identification Number." full>
          <input {...inputProps("gstin")} type="text" maxLength={15} autoComplete="off" placeholder="22AAAAA0000A1Z5" style={{ textTransform: "uppercase" }}
            onChange={event => updateDraft("gstin", event.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15))}/></Field>
        <Field name="address" label="Address" error={fieldErrors.address} full><textarea {...inputProps("address")} rows={3} autoComplete="street-address" required placeholder="Plot / building, road and locality"/></Field>
        <Field name="city" label="City (optional)"><input {...inputProps("city")} autoComplete="address-level2"/></Field>
        <Field name="state" label="State (optional)"><input {...inputProps("state")} autoComplete="address-level1"/></Field>
        <Field name="pincode" label="PIN code (optional)" error={fieldErrors.pincode} full><input {...inputProps("pincode")} inputMode="numeric" maxLength={6} autoComplete="postal-code"
          onChange={event => updateDraft("pincode", digits(event.target.value).slice(0, 6))}/></Field>
      </fieldset>{sheetError}<div className="ssp-form-note"><ShieldCheck size={15}/>Your verification status cannot be changed from this form. Trucks and cities are managed on the profile page.</div></form>
    </Sheet>}

    {sheet === "aadhaar" && <Sheet title="Aadhaar verification" subtitle="Verify your identity with the secure verification flow." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Not now</button><button type="button" className="ssp-primary" disabled={busy} onClick={startAadhaarVerification}>
        {busy ? <RefreshCw size={16} className="ssp-spin"/> : <ArrowRight size={16}/>}{busy ? "Opening…" : "Continue"}</button></>}>
      <div className="ssp-verification-intro"><i><Fingerprint size={40}/></i><h3>Your identity. Securely verified.</h3><p>Continue to the connected Aadhaar verification service. This page only keeps your Aadhaar number masked and never sends it anywhere by itself.</p></div>
      <div className="ssp-secure-note"><i><LockKeyhole size={15}/></i><span>Only a successful verification response updates your status. Admin approval is a separate step.</span></div>{sheetError}
    </Sheet>}

    {sheet === "photo" && <Sheet title="Your profile photo" subtitle="Adjust the circular preview before saving." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Cancel</button>
        {profile.photoUrl && <button type="button" className="ssp-secondary" disabled={busy} onClick={removePhoto}><Trash2 size={15}/>Remove</button>}
        <button type="button" className="ssp-primary" disabled={busy || !photoFile} onClick={savePhoto}>
        {busy ? <RefreshCw size={16} className="ssp-spin"/> : <Camera size={16}/>}{busy ? "Saving…" : "Save photo"}</button></>}>
      <div className="ssp-photo-stage"><div>{photoPreview && <img src={photoPreview} alt="Profile photo preview" style={{
        objectPosition: `${photoSettings.x}% ${photoSettings.y}%`, transform: `scale(${photoSettings.zoom})`,
        transformOrigin: `${photoSettings.x}% ${photoSettings.y}%`,
      }}/>}</div></div>
      <div className="ssp-photo-controls">{[
        { key: "zoom", label: "Zoom", min: 1, max: 2.2, step: 0.05 },
        { key: "x", label: "Horizontal position", min: 0, max: 100, step: 1 },
        { key: "y", label: "Vertical position", min: 0, max: 100, step: 1 },
      ].map(control => <label key={control.key}><span>{control.label}<b>{control.key === "zoom" ? `${photoSettings.zoom.toFixed(2)}×` : `${photoSettings[control.key]}%`}</b></span><input type="range" min={control.min} max={control.max} step={control.step}
        value={photoSettings[control.key]} disabled={busy} onChange={event => setPhotoSettings(previous => ({ ...previous, [control.key]: Number(event.target.value) }))}/></label>)}</div>
      <p className="ssp-otp-help">The photo is kept in this page only. These adjustments control its circular display.</p>{sheetError}
    </Sheet>}

    {sheet === "signout" && <Sheet title="Sign out?" subtitle="End this transporter session securely." busy={busy} onClose={closeSheet}
      footer={<><button type="button" className="ssp-secondary" disabled={busy} onClick={closeSheet}>Cancel</button>
        <button type="button" className="ssp-danger" disabled={busy} onClick={signOut}>{busy ? "Signing out…" : "Sign out"}</button></>}>
      <div className="ssp-signout-intro"><i><LogOut size={30}/></i><p className="ssp-signout-copy">You will need to sign in again to access your transporter account.</p></div>{sheetError}
    </Sheet>}
  </div>;
}

const CSS = `
.sand-seller-profile {
  --ssp-ink:#1b2340; --ssp-muted:#6b7590; --ssp-line:rgba(120,135,180,.16);
  --ssp-indigo:#5b6cff; --ssp-violet:#8b5cf6; --ssp-cyan:#22c1ee; --ssp-green:#16b981;
  --ssp-grad:linear-gradient(135deg,#5b6cff 0%,#8b5cf6 55%,#22c1ee 100%);
  --ssp-grad-soft:linear-gradient(135deg,rgba(91,108,255,.12),rgba(139,92,246,.10) 55%,rgba(34,193,238,.12));
  --ssp-glass:rgba(255,255,255,.80);
  --ssp-shadow:0 14px 40px rgba(64,84,150,.11),0 2px 6px rgba(64,84,150,.05);
  --ssp-shadow-hover:0 22px 52px rgba(64,84,150,.17),0 4px 10px rgba(64,84,150,.06);
  position:relative; isolation:isolate; min-height:100vh; min-height:100dvh;
  padding-bottom:calc(96px + env(safe-area-inset-bottom,0px));
  background:
    radial-gradient(1200px 500px at 50% -180px,rgba(139,92,246,.10),transparent 60%),
    linear-gradient(180deg,#eef0ff 0%,#e9edfb 40%,#e6f0fa 100%);
  color:var(--ssp-ink); font-family:"Plus Jakarta Sans",Inter,"Segoe UI",system-ui,sans-serif;
  font-size:14px; line-height:1.5; -webkit-font-smoothing:antialiased; color-scheme:light;
}
.sand-seller-profile *, .sand-seller-profile *::before, .sand-seller-profile *::after { box-sizing:border-box; }
.sand-seller-profile button,.sand-seller-profile input,.sand-seller-profile textarea { font:inherit; }
.sand-seller-profile button { cursor:pointer; -webkit-tap-highlight-color:transparent; }
.sand-seller-profile button:disabled { cursor:not-allowed; opacity:.55; }
.sand-seller-profile button:focus-visible,.sand-seller-profile input:focus-visible,.sand-seller-profile textarea:focus-visible { outline:3px solid rgba(91,108,255,.4); outline-offset:3px; }
.sand-seller-profile svg { flex-shrink:0; }
.sand-seller-profile button { transition:transform .22s cubic-bezier(.2,.8,.2,1),box-shadow .22s,background .22s,color .22s,border-color .22s; }
.sand-seller-profile button:active:not(:disabled) { transform:scale(.97); }

/* Ambient orbs */
.ssp-orb { position:fixed; z-index:-1; border-radius:50%; filter:blur(70px); pointer-events:none; opacity:.75; animation:ssp-float 14s ease-in-out infinite; }
.ssp-orb-one { width:360px; height:360px; left:-130px; top:-90px; background:radial-gradient(circle,#c3caff,transparent 70%); }
.ssp-orb-two { width:300px; height:400px; right:-40px; top:220px; background:radial-gradient(circle,#b9ecfb,transparent 70%); animation-delay:-5s; }
.ssp-orb-three { width:280px; height:280px; left:30%; bottom:-80px; background:radial-gradient(circle,#e3d4ff,transparent 70%); animation-delay:-9s; }

/* Reveal animation */
.ssp-reveal { animation:ssp-up .55s cubic-bezier(.2,.8,.2,1) both; animation-delay:var(--delay,0ms); }

/* Top bar */
.ssp-top { position:sticky; top:0; z-index:40; max-width:1180px; margin:auto; min-height:68px; padding:12px 16px; display:flex; align-items:center; gap:14px; background:rgba(255,255,255,.72); backdrop-filter:blur(22px) saturate(160%); -webkit-backdrop-filter:blur(22px) saturate(160%); border-bottom:1px solid var(--ssp-line); }
.ssp-top::after { content:""; position:absolute; left:0; right:0; bottom:-1px; height:2px; background:var(--ssp-grad); opacity:.55; mask:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent); -webkit-mask:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent); }
.ssp-top-left { display:flex; align-items:center; gap:10px; margin-right:auto; min-width:0; }
.ssp-top-copy span,.ssp-top-copy b { display:block; }
.ssp-top-copy span { font-size:8px; letter-spacing:1.3px; color:var(--ssp-muted); font-weight:800; }
.ssp-top-copy b { font-size:14px; letter-spacing:-.3px; }
.ssp-icon { display:grid; place-items:center; width:39px; height:39px; flex:none; border:1px solid var(--ssp-line); border-radius:13px; background:rgba(255,255,255,.92); color:#3b4468; box-shadow:0 6px 16px rgba(64,84,150,.08); }
.ssp-icon:hover:not(:disabled) { box-shadow:0 10px 22px rgba(64,84,150,.14); transform:translateY(-1px); color:var(--ssp-indigo); border-color:rgba(91,108,255,.3); }
.ssp-brand { display:flex; align-items:center; white-space:nowrap; font-size:18px; font-weight:900; letter-spacing:-.7px; line-height:1; }
.ssp-brand i { width:24px; height:24px; margin-right:5px; display:grid; place-items:center; border-radius:8px; background:var(--ssp-grad); color:#fff; box-shadow:0 6px 14px rgba(91,108,255,.25); }
.ssp-brand span { color:var(--ssp-ink); }
.ssp-brand b { background:var(--ssp-grad); -webkit-background-clip:text; background-clip:text; color:transparent; }
.ssp-content { position:relative; max-width:1060px; margin:0 auto; padding:20px 16px 0; }
.ssp-loading { display:inline-flex; align-items:center; gap:9px; margin-bottom:14px; padding:8px 14px 8px 8px; border-radius:99px; border:1px solid rgba(91,108,255,.14); background:rgba(255,255,255,.7); color:#4958bf; font-size:11.5px; font-weight:600; box-shadow:0 6px 18px rgba(64,84,150,.08); }
.ssp-loading i { display:grid; place-items:center; width:26px; height:26px; border-radius:50%; background:var(--ssp-grad-soft); color:var(--ssp-indigo); }

/* Hero */
.ssp-hero { position:relative; overflow:hidden; padding:23px; border-radius:30px; background:var(--ssp-grad); color:#fff; box-shadow:0 24px 54px rgba(91,108,255,.32),0 1px 0 rgba(255,255,255,.35) inset; }
.ssp-hero::after { content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit; border:1px solid rgba(255,255,255,.3); background:radial-gradient(ellipse at 4% 0%,rgba(255,255,255,.22),transparent 60%); }
.ssp-hero-mesh { position:absolute; inset:0; pointer-events:none; opacity:.14; background-image:linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px); background-size:34px 34px; mask:radial-gradient(ellipse at 70% 40%,#000 20%,transparent 75%); -webkit-mask:radial-gradient(ellipse at 70% 40%,#000 20%,transparent 75%); }
.ssp-hero-glow { position:absolute; border-radius:50%; filter:blur(40px); pointer-events:none; }
.ssp-glow-a { width:260px; height:260px; right:-60px; top:-100px; background:rgba(255,255,255,.28); animation:ssp-float 12s ease-in-out infinite; }
.ssp-glow-b { width:220px; height:220px; left:-80px; bottom:-120px; background:rgba(34,193,238,.45); animation:ssp-float 16s ease-in-out infinite reverse; }
/* Hero motion layer */
.ssp-hero { background-size:220% 220%; animation:ssp-up .55s cubic-bezier(.2,.8,.2,1) both,ssp-hue 14s ease-in-out infinite; }
.ssp-hero-sheen { position:absolute; inset:-40% -60%; pointer-events:none; background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.22) 50%,transparent 58%); animation:ssp-sheen 6.5s cubic-bezier(.4,0,.2,1) infinite; animation-delay:1.2s; }
.ssp-hero-particles { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
.ssp-hero-particles i { position:absolute; bottom:-10px; left:calc(8% + var(--i) * 10.5%); width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.85); box-shadow:0 0 10px rgba(255,255,255,.9); opacity:0; animation:ssp-rise-dot calc(7s + var(--i) * .7s) linear infinite; animation-delay:calc(var(--i) * -1.3s); }
.ssp-hero-particles i:nth-child(even) { width:3px; height:3px; }
.ssp-hero-particles i:nth-child(3n) { background:rgba(200,240,255,.9); }
.ssp-hero-in { animation:ssp-hero-in .7s cubic-bezier(.2,.8,.2,1) both; animation-delay:var(--d,0ms); }
.ssp-twinkle { animation:ssp-twinkle 2.4s ease-in-out infinite; }
.ssp-avatar-halo { position:absolute; inset:-10px; border-radius:50%; pointer-events:none; background:conic-gradient(from 0deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0) 60%); filter:blur(6px); animation:ssp-spin 5s linear infinite; opacity:.8; }
.ssp-avatar-wrap .ssp-ring-fill { animation:ssp-draw 1.4s cubic-bezier(.2,.8,.2,1) both; animation-delay:.5s; }
.ssp-avatar { animation:ssp-breathe 4.5s ease-in-out infinite; }
.ssp-hero-art>svg { animation:ssp-drift 9s ease-in-out infinite; }
.ssp-stat { animation:ssp-stat-in .6s cubic-bezier(.2,.8,.2,1) both; }
.ssp-stat:nth-child(1) { animation-delay:.45s; } .ssp-stat:nth-child(2) { animation-delay:.55s; } .ssp-stat:nth-child(3) { animation-delay:.65s; }
.ssp-hero-edit { position:relative; overflow:hidden; }
.ssp-hero-edit::after { content:""; position:absolute; inset:0; background:linear-gradient(115deg,transparent 40%,rgba(98,86,215,.14) 50%,transparent 60%); transform:translateX(-120%); animation:ssp-btn-sheen 4s ease-in-out infinite; animation-delay:2s; }
.ssp-hero-art { position:absolute; right:-25px; bottom:-35px; width:270px; height:240px; pointer-events:none; opacity:.2; }
.ssp-hero-art>svg { position:absolute; width:220px; height:220px; stroke-width:.7; right:0; bottom:0; }
.ssp-art-ring { position:absolute; width:240px; height:240px; border:1px solid rgba(255,255,255,.7); border-radius:50%; right:-70px; top:-60px; box-shadow:0 0 0 28px rgba(255,255,255,.12),0 0 0 56px rgba(255,255,255,.08); animation:ssp-spin 60s linear infinite; }
.ssp-art-ring-two { width:160px; height:160px; right:-10px; top:20px; border-style:dashed; box-shadow:none; animation-direction:reverse; animation-duration:45s; }
.ssp-hero-top,.ssp-identity,.ssp-hero-bottom,.ssp-stats { position:relative; z-index:1; }
.ssp-hero-top { display:flex; justify-content:space-between; align-items:center; gap:10px; }
.ssp-eyebrow { display:inline-flex; align-items:center; gap:5px; font-size:9px; font-weight:800; letter-spacing:1.8px; color:rgba(255,255,255,.88); }
.ssp-badge { display:inline-flex; width:max-content; max-width:100%; align-items:center; gap:5px; padding:5px 10px; border:1px solid transparent; border-radius:99px; font-size:10px; font-weight:800; line-height:1.35; white-space:nowrap; }
.ssp-badge.is-pending { color:#936000; background:#fff5dc; border-color:rgba(245,165,36,.23); }
.ssp-badge.is-verified { color:#087b56; background:#e9f9f1; border-color:rgba(34,197,143,.2); }
.ssp-badge.is-light.is-pending { color:#ffefc8; background:rgba(64,38,88,.3); border-color:rgba(255,233,182,.4); backdrop-filter:blur(8px); }
.ssp-badge.is-light.is-verified { color:#e0fff1; background:rgba(5,80,69,.28); border-color:rgba(199,255,229,.4); backdrop-filter:blur(8px); }
.ssp-identity { display:flex; align-items:center; gap:18px; margin:24px 0 20px; }
.ssp-avatar-wrap { position:relative; flex:none; }
.ssp-ring { position:relative; display:grid; place-items:center; }
.ssp-ring svg { position:absolute; inset:0; overflow:visible; }
.ssp-ring-track { fill:none; stroke:#e0e5f6; }
.ssp-ring-fill { fill:none; stroke:url(#ssp-ring-grad); stroke-linecap:round; transition:stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1); }
.ssp-ring.is-light .ssp-ring-track { stroke:rgba(255,255,255,.28); }
.ssp-ring.is-light .ssp-ring-fill { stroke:#fff; filter:drop-shadow(0 0 6px rgba(255,255,255,.7)); }
.ssp-ring-inner { position:relative; z-index:1; display:grid; place-items:center; }
.ssp-avatar { width:88px; height:88px; display:grid; place-items:center; overflow:hidden; border:3px solid rgba(255,255,255,.85); border-radius:50%; background:rgba(255,255,255,.18); box-shadow:0 10px 26px rgba(33,33,100,.2); color:#fff; font-size:28px; font-weight:800; }
.ssp-avatar img { width:100%; height:100%; object-fit:cover; }
.ssp-camera { position:absolute; right:-2px; bottom:-2px; z-index:2; width:31px; height:31px; display:grid; place-items:center; padding:0; border:3px solid #8172f4; border-radius:50%; background:#fff; color:#675ae1; box-shadow:0 4px 14px rgba(27,35,64,.2); }
.ssp-camera:hover:not(:disabled) { transform:translateY(-1px) scale(1.05); }
.ssp-avatar-check { position:absolute; left:-2px; top:-2px; z-index:2; display:grid; place-items:center; width:28px; height:28px; border-radius:50%; background:#fff; color:#12a874; box-shadow:0 4px 14px rgba(27,35,64,.18); }
.ssp-hero-name { min-width:0; }
.ssp-hero-name>span { display:block; color:rgba(255,255,255,.78); font-size:10px; font-weight:600; letter-spacing:.3px; }
.ssp-hero-name h1 { margin:3px 0 6px; font-size:25px; letter-spacing:-.9px; line-height:1.15; font-weight:800; overflow-wrap:anywhere; text-shadow:0 2px 12px rgba(27,35,64,.15); }
.ssp-hero-name p { display:flex; align-items:center; gap:6px; margin:0; font-size:13px; overflow-wrap:anywhere; color:rgba(255,255,255,.95); }
.ssp-hero-name>small { display:inline-flex; align-items:center; gap:4px; margin-top:9px; padding:4px 9px; border-radius:99px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.22); font-size:9px; color:rgba(255,255,255,.85); }
.ssp-hero-name>small b { margin-left:2px; color:#fff; font-weight:700; letter-spacing:.5px; }
.ssp-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:18px; }
.ssp-stat { display:flex; align-items:center; gap:9px; min-width:0; padding:10px 11px; border-radius:16px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.26); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); transition:background .2s; }
.ssp-stat:hover { background:rgba(255,255,255,.24); }
.ssp-stat i { flex:none; display:grid; place-items:center; width:30px; height:30px; border-radius:10px; background:rgba(255,255,255,.22); color:#fff; }
.ssp-stat>div { min-width:0; }
.ssp-stat b { display:block; font-size:15px; font-weight:800; letter-spacing:-.4px; line-height:1.1; }
.ssp-stat span { display:block; margin-top:2px; font-size:9px; color:rgba(255,255,255,.8); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ssp-hero-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; padding-top:16px; border-top:1px solid rgba(255,255,255,.22); }
.ssp-hero-bottom p { display:flex; align-items:center; gap:7px; margin:0; font-size:10.5px; color:rgba(255,255,255,.92); }
.ssp-hero-edit { display:flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:9px 14px; border:1px solid rgba(255,255,255,.7); border-radius:12px; background:#fff; color:#6256d7; font-size:11px!important; font-weight:800!important; box-shadow:0 8px 20px rgba(38,34,102,.16); }
.ssp-hero-edit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 26px rgba(38,34,102,.22); }

/* Cards */
.ssp-layout { display:grid; gap:18px; margin-top:18px; align-items:start; }
.ssp-card { position:relative; min-width:0; overflow:hidden; padding:21px; border:1px solid rgba(255,255,255,.95); border-radius:26px; background:var(--ssp-glass); box-shadow:var(--ssp-shadow); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); transition:box-shadow .3s,transform .3s; }
.ssp-card::before { content:""; position:absolute; left:0; right:0; top:0; height:3px; background:var(--ssp-grad); opacity:.9; }
.ssp-card:hover { box-shadow:var(--ssp-shadow-hover); }
.ssp-section-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
.ssp-kicker { display:block; margin-bottom:5px; color:#6371db; font-size:8px; font-weight:800; letter-spacing:1.6px; }
.ssp-section-head h2 { margin:0; font-size:18px; font-weight:800; letter-spacing:-.5px; line-height:1.25; }
.ssp-section-head p { margin:5px 0 0; color:var(--ssp-muted); font-size:11px; }
.ssp-edit-link { display:flex; flex:none; align-items:center; gap:5px; padding:8px 11px; border:1px solid rgba(91,108,255,.18); border-radius:11px; background:#f1f3ff; color:#5666d4; font-size:11px!important; font-weight:700!important; }
.ssp-edit-link:hover:not(:disabled) { background:var(--ssp-grad); color:#fff; border-color:transparent; box-shadow:0 8px 18px rgba(91,108,255,.25); }
.ssp-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:0; }
.ssp-full { grid-column:1/-1; }
.ssp-detail { position:relative; display:flex; align-items:flex-start; gap:11px; min-width:0; padding:13px 12px; border:1px solid var(--ssp-line); border-radius:17px; background:rgba(249,250,255,.72); transition:transform .22s,box-shadow .22s,border-color .22s; }
.ssp-detail:hover { transform:translateY(-2px); box-shadow:0 10px 24px rgba(64,84,150,.10); border-color:rgba(91,108,255,.22); }
.ssp-detail>i { flex:none; width:38px; height:38px; display:grid; place-items:center; border-radius:12px; color:#6873df; background:linear-gradient(135deg,#eaedff,#f0eaff); box-shadow:0 4px 10px rgba(91,108,255,.10) inset; }
.ssp-detail.is-violet>i { color:#7c5cf0; background:linear-gradient(135deg,#efe8ff,#f6efff); }
.ssp-detail.is-cyan>i { color:#1f9ec4; background:linear-gradient(135deg,#e3f6fc,#eefaff); }
.ssp-detail>div { min-width:0; flex:1; }
.ssp-detail dt { margin:0 0 4px; font-size:10px; color:var(--ssp-muted); font-weight:600; letter-spacing:.2px; }
.ssp-detail dd { margin:0; font-size:13px; font-weight:750; line-height:1.5; overflow-wrap:anywhere; white-space:pre-line; }
.ssp-detail.is-empty dd { color:#a4acc6; font-weight:600; font-style:italic; }
.ssp-detail small { display:block; margin-top:4px; font-size:10px; color:var(--ssp-muted); overflow-wrap:anywhere; }
.ssp-detail.is-map { background:linear-gradient(130deg,#eef9fe,#f6f6ff); border-color:rgba(34,193,238,.2); }
.ssp-detail.is-map>i { color:#fff; background:linear-gradient(135deg,#22c1ee,#5b6cff); box-shadow:0 8px 16px rgba(34,193,238,.3); }
.ssp-detail:not(.ssp-full) { flex-direction:column; gap:9px; }
.ssp-secure-note,.ssp-admin-note { display:flex; align-items:flex-start; gap:9px; padding:11px 12px; margin-top:14px; border-radius:14px; background:rgba(91,108,255,.055); color:#647195; font-size:10px; line-height:1.6; }
.ssp-secure-note>i,.ssp-admin-note>i { flex:none; display:grid; place-items:center; width:26px; height:26px; border-radius:9px; background:#fff; color:#7280cc; box-shadow:0 3px 8px rgba(64,84,150,.08); }
.ssp-admin-note { margin-top:16px; background:rgba(120,135,180,.06); }
.ssp-section-icon { width:42px; height:42px; flex:none; display:grid; place-items:center; border-radius:14px; color:#fff; background:var(--ssp-grad); box-shadow:0 10px 22px rgba(91,108,255,.28); }

/* Verification */
.ssp-verification-progress { display:flex; align-items:center; gap:14px; padding:14px; border:1px solid rgba(91,108,255,.12); border-radius:20px; background:linear-gradient(135deg,#f1f3ff,#f6f1ff); }
.ssp-verification-progress.is-complete { background:linear-gradient(135deg,#eafaf3,#f0fbf6); border-color:rgba(22,185,129,.2); }
.ssp-verification-progress .ssp-ring-inner b { display:flex; align-items:baseline; font-size:19px; font-weight:800; letter-spacing:-.6px; color:var(--ssp-ink); }
.ssp-verification-progress .ssp-ring-inner small { font-size:10px; color:var(--ssp-muted); font-weight:700; margin-left:1px; }
.ssp-progress-copy { flex:1; min-width:0; }
.ssp-progress-copy b { display:block; font-size:12.5px; font-weight:800; letter-spacing:-.2px; }
.ssp-progress-copy>span { display:block; margin-top:3px; font-size:10px; color:#6973c7; line-height:1.5; }
.ssp-progress-track { height:6px; margin-top:10px; border-radius:20px; background:#e0e5f6; overflow:hidden; }
.ssp-progress-track i { position:relative; display:block; height:100%; border-radius:inherit; background:var(--ssp-grad); transition:width .6s cubic-bezier(.2,.8,.2,1); overflow:hidden; }
.ssp-progress-track i::after { content:""; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent); animation:ssp-shimmer 2.2s linear infinite; }
.ssp-timeline { position:relative; display:grid; gap:0; margin:18px 0 0; padding:0; list-style:none; }
.ssp-step { position:relative; display:flex; align-items:flex-start; gap:14px; padding:0 0 20px; }
.ssp-step:last-child { padding-bottom:0; }
.ssp-step::before { content:""; position:absolute; left:24px; top:52px; bottom:2px; width:2px; border-radius:2px; background:linear-gradient(180deg,#d9def2,#e8ebf7); }
.ssp-step.is-complete::before { background:linear-gradient(180deg,#22b487,#a6e9d1); }
.ssp-step:last-child::before { display:none; }
.ssp-step-icon { position:relative; flex:none; width:50px; height:50px; display:grid; place-items:center; border:1px solid #e0e4ff; border-radius:17px; background:linear-gradient(140deg,#eef0ff,#f5edff); color:#7a64df; transition:transform .25s,box-shadow .25s; }
.ssp-step:hover .ssp-step-icon { transform:translateY(-2px); box-shadow:0 10px 22px rgba(91,108,255,.14); }
.ssp-step-icon small { position:absolute; right:-5px; bottom:-5px; width:21px; height:21px; display:grid; place-items:center; border:2px solid #fff; border-radius:50%; background:#8083dd; color:#fff; font-size:8px; font-weight:800; }
.ssp-step.is-active .ssp-step-icon { box-shadow:0 0 0 4px rgba(91,108,255,.12); animation:ssp-pulse 2.4s ease-in-out infinite; }
.ssp-step-admin .ssp-step-icon { border-color:#dcecf5; background:linear-gradient(140deg,#eef8ff,#e7f7f7); color:#3597ac; }
.ssp-step-admin .ssp-step-icon small { background:#62a5b7; }
.ssp-step.is-complete .ssp-step-icon { color:#139c75; border-color:#ceeedd; background:linear-gradient(140deg,#ecfaf3,#e2f7ef); animation:none; box-shadow:none; }
.ssp-step.is-complete .ssp-step-icon small { background:#22b487; }
.ssp-step-copy { min-width:0; flex:1; padding-top:2px; }
.ssp-step-title { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px 10px; }
.ssp-step-copy h3 { margin:0; font-size:13px; font-weight:800; letter-spacing:-.2px; }
.ssp-step-copy p { margin:5px 0 0; color:var(--ssp-muted); font-size:10.5px; line-height:1.6; }
.ssp-verify-button { display:inline-flex; align-items:center; gap:10px; min-height:36px; margin-top:11px; padding:8px 14px; border:0; border-radius:12px; background:var(--ssp-grad); color:#fff; font-size:10.5px!important; font-weight:750!important; box-shadow:0 8px 18px rgba(91,108,255,.26); }
.ssp-verify-button:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 24px rgba(91,108,255,.34); }
.ssp-verify-button svg { transition:transform .25s; }
.ssp-verify-button:hover:not(:disabled) svg { transform:translateX(3px); }

/* Sign out & footer */
.ssp-signout { width:100%; display:flex; align-items:center; gap:12px; margin:18px 0 0; padding:13px 15px; border:1px solid rgba(219,99,120,.16); border-radius:20px; background:rgba(255,255,255,.7); color:#b5546e; text-align:left; backdrop-filter:blur(10px); box-shadow:0 8px 22px rgba(181,84,110,.07); }
.ssp-signout:hover { border-color:rgba(219,99,120,.32); box-shadow:0 12px 28px rgba(181,84,110,.14); transform:translateY(-2px); }
.ssp-signout>i { flex:none; display:grid; place-items:center; width:40px; height:40px; border-radius:13px; background:linear-gradient(135deg,#fff0f4,#ffe6ec); color:#c84062; }
.ssp-signout>div { flex:1; min-width:0; }
.ssp-signout b { display:block; font-size:12.5px; font-weight:750; }
.ssp-signout span { display:block; margin-top:2px; font-size:10px; color:#a0728a; }
.ssp-footer { display:grid; justify-items:center; gap:10px; padding:28px 12px 7px; opacity:.65; }
.ssp-footer .ssp-brand { font-size:15px; }
.ssp-footer .ssp-brand i { width:19px; height:19px; border-radius:6px; }
.ssp-footer>span { font-size:8px; color:var(--ssp-muted); font-weight:700; letter-spacing:2.2px; }

/* Sheets & forms */
.ssp-overlay { position:fixed; inset:0; z-index:80; display:flex; align-items:flex-end; justify-content:center; background:rgba(27,35,64,.42); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); animation:ssp-fade .2s ease; }
.ssp-sheet { position:relative; display:flex; flex-direction:column; width:100%; max-width:600px; max-height:94vh; max-height:94dvh; padding:10px 20px 0; border-radius:30px 30px 0 0; background:linear-gradient(180deg,#fff,#f7f9ff); box-shadow:0 -20px 60px rgba(27,35,64,.24); outline:none; animation:ssp-rise .3s cubic-bezier(.2,.8,.2,1); }
.ssp-sheet::before { content:""; position:absolute; left:0; right:0; top:0; height:3px; border-radius:30px 30px 0 0; background:var(--ssp-grad); opacity:.8; }
.ssp-handle { width:40px; height:4px; border-radius:9px; flex:none; margin:6px auto 15px; background:#dce1f0; }
.ssp-sheet-head { display:flex; flex:none; align-items:flex-start; justify-content:space-between; gap:12px; padding-bottom:16px; border-bottom:1px solid var(--ssp-line); }
.ssp-sheet-head h2 { margin:0; font-size:19px; font-weight:800; letter-spacing:-.5px; }
.ssp-sheet-head p { margin:5px 0 0; font-size:11px; color:var(--ssp-muted); }
.ssp-sheet-body { min-height:0; overflow-y:auto; overscroll-behavior:contain; padding:18px 0 22px; }
.ssp-sheet-foot { display:flex; flex:none; gap:10px; padding:14px 0 calc(16px + env(safe-area-inset-bottom,0px)); border-top:1px solid var(--ssp-line); }
.ssp-primary,.ssp-secondary,.ssp-danger { display:flex; justify-content:center; align-items:center; gap:7px; min-height:46px; padding:11px 16px; border:0; border-radius:15px; font-size:12px!important; font-weight:750!important; }
.ssp-primary { flex:1.5; color:#fff; background:var(--ssp-grad); box-shadow:0 10px 24px rgba(91,108,255,.26); }
.ssp-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 30px rgba(91,108,255,.34); }
.ssp-secondary { flex:1; background:#edf0fa; color:#65708b; }
.ssp-secondary:hover:not(:disabled) { background:#e3e8f7; }
.ssp-danger { flex:1.5; background:linear-gradient(135deg,#c84062,#e0567a); color:#fff; box-shadow:0 10px 24px rgba(200,64,98,.26); }
.ssp-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px 12px; min-width:0; margin:0; padding:0; border:0; }
.ssp-field { min-width:0; }
.ssp-field>label { display:block; margin-bottom:7px; font-size:11px; color:#46516e; font-weight:750; }
.ssp-field input,.ssp-field textarea { display:block; width:100%; min-width:0; padding:12px 13px; border:1px solid #dfe4f1; border-radius:13px; color:var(--ssp-ink); background:#fff; font-size:14px; transition:border-color .2s,box-shadow .2s; }
.ssp-field textarea { resize:vertical; min-height:90px; }
.ssp-field input:focus,.ssp-field textarea:focus { border-color:#919df3; box-shadow:0 0 0 4px rgba(91,108,255,.10); }
.ssp-phone-input { display:flex; align-items:center; overflow:hidden; border:1px solid #dfe4f1; border-radius:13px; background:#fff; transition:border-color .2s,box-shadow .2s; }
.ssp-phone-input>span { flex:none; padding-left:12px; color:#78829b; font-size:12px; font-weight:700; }
.ssp-phone-input input { border:0; padding-left:7px; border-radius:0; }
.ssp-phone-input input:focus { box-shadow:none; }
.ssp-phone-input:focus-within { border-color:#919df3; box-shadow:0 0 0 4px rgba(91,108,255,.10); }
.ssp-field.has-error>input,.ssp-field.has-error>textarea,.ssp-field.has-error .ssp-phone-input { border-color:#da6881; }
.ssp-field-error { display:flex; align-items:flex-start; gap:4px; margin-top:6px; font-size:10px; color:#b33252; }
.ssp-field-error svg { margin-top:2px; }
.ssp-field-note { display:block; margin-top:6px; color:var(--ssp-muted); font-size:10px; }
.ssp-phone-warning { position:relative; overflow:hidden; display:flex; align-items:flex-start; gap:12px; padding:14px; border:1px solid rgba(139,92,246,.22); border-radius:16px; background:linear-gradient(135deg,#f3efff,#eef3ff 60%,#eafaff); color:#4a4a8a; animation:ssp-up .4s cubic-bezier(.2,.8,.2,1) both; }
.ssp-phone-warning::after { content:""; position:absolute; right:-30px; top:-30px; width:90px; height:90px; border-radius:50%; background:rgba(139,92,246,.10); }
.ssp-phone-warning>i { flex:none; display:grid; place-items:center; width:38px; height:38px; border-radius:12px; background:var(--ssp-grad); color:#fff; box-shadow:0 8px 18px rgba(91,108,255,.28); animation:ssp-breathe 3s ease-in-out infinite; }
.ssp-phone-warning b { display:block; font-size:11.5px; color:#2f3470; }
.ssp-phone-warning p { margin:4px 0 0; font-size:10px; line-height:1.65; color:#5c648f; }
.ssp-phone-warning strong { color:var(--ssp-indigo); font-weight:800; }
.ssp-form-note { display:flex; align-items:center; gap:7px; margin:17px 0 0; color:var(--ssp-muted); font-size:10px; }
.ssp-alert { display:flex; align-items:flex-start; gap:9px; padding:12px 14px; border:1px solid rgba(212,79,113,.23); border-radius:15px; background:#fff0f4; color:#a43351; font-size:12px; line-height:1.6; overflow-wrap:anywhere; }
.ssp-content>.ssp-alert { margin-bottom:15px; }
.ssp-sheet .ssp-alert { margin-top:15px; }
.ssp-alert>svg { margin-top:2px; }
.ssp-alert>span { flex:1; min-width:0; }
.ssp-alert button { flex:none; border:0; border-radius:8px; background:#fff; color:#a43351; padding:4px 9px; font-size:11px; font-weight:700; }

/* OTP — double verification */
.ssp-otp-hero { position:relative; overflow:hidden; padding:20px 16px 16px; margin-bottom:16px; border-radius:22px; background:var(--ssp-grad); background-size:220% 220%; color:#fff; text-align:center; box-shadow:0 16px 36px rgba(91,108,255,.28); animation:ssp-hue 12s ease-in-out infinite; }
.ssp-otp-hero::before { content:""; position:absolute; inset:0; background:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px); background-size:26px 26px; opacity:.1; mask:radial-gradient(ellipse at 50% 0%,#000,transparent 80%); -webkit-mask:radial-gradient(ellipse at 50% 0%,#000,transparent 80%); }
.ssp-otp-hero-glow { position:absolute; width:220px; height:220px; right:-80px; top:-110px; border-radius:50%; background:rgba(255,255,255,.22); filter:blur(30px); animation:ssp-float 10s ease-in-out infinite; }
.ssp-otp-hero>* { position:relative; z-index:1; }
.ssp-otp-shield { position:relative; display:grid; place-items:center; width:56px; height:56px; margin:0 auto 12px; border-radius:18px; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.35); backdrop-filter:blur(8px); }
.ssp-otp-pulse { position:absolute; inset:-6px; border-radius:22px; border:2px solid rgba(255,255,255,.5); animation:ssp-ring-pulse 2.2s ease-out infinite; }
.ssp-otp-hero b { display:block; font-size:15px; font-weight:800; letter-spacing:-.4px; }
.ssp-otp-hero p { margin:6px auto 0; max-width:300px; font-size:11px; line-height:1.6; color:rgba(255,255,255,.88); }
.ssp-otp-route { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:16px; }
.ssp-otp-route span { display:inline-flex; align-items:center; gap:5px; padding:6px 10px; border-radius:99px; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); font-size:10px; font-weight:700; letter-spacing:.4px; transition:background .3s,border-color .3s; }
.ssp-otp-route span.is-done { background:rgba(22,185,129,.85); border-color:rgba(255,255,255,.6); }
.ssp-otp-route-line { position:relative; flex:1; max-width:60px; height:2px; border-radius:2px; background:rgba(255,255,255,.3); overflow:hidden; }
.ssp-otp-route-line i { position:absolute; inset:0; width:40%; background:#fff; border-radius:2px; animation:ssp-travel 1.6s ease-in-out infinite; }
.ssp-otp-card { position:relative; padding:15px; margin-top:12px; border:1px solid var(--ssp-line); border-radius:20px; background:#fff; box-shadow:0 6px 18px rgba(64,84,150,.05); transition:border-color .3s,box-shadow .3s,transform .3s; animation:ssp-up .45s cubic-bezier(.2,.8,.2,1) both; }
.ssp-otp-card.is-new { animation-delay:.1s; }
.ssp-otp-card::before { content:""; position:absolute; left:0; top:16px; bottom:16px; width:3px; border-radius:3px; background:var(--ssp-grad); opacity:.7; }
.ssp-otp-card.is-new::before { background:linear-gradient(180deg,#22c1ee,#5b6cff); }
.ssp-otp-card.is-complete { border-color:rgba(22,185,129,.35); box-shadow:0 10px 26px rgba(22,185,129,.12); }
.ssp-otp-card.is-complete::before { background:var(--ssp-green); }
.ssp-otp-label { display:flex; align-items:center; gap:10px; }
.ssp-otp-label>i { position:relative; flex:none; width:40px; height:40px; display:grid; place-items:center; border-radius:13px; color:#7880d9; background:linear-gradient(135deg,#eef0ff,#f4efff); transition:background .3s,color .3s; }
.ssp-otp-card.is-new .ssp-otp-label>i { color:#1f9ec4; background:linear-gradient(135deg,#e3f6fc,#eef6ff); }
.ssp-otp-card.is-complete .ssp-otp-label>i { color:#fff; background:linear-gradient(135deg,#16b981,#3dd39d); box-shadow:0 8px 18px rgba(22,185,129,.3); }
.ssp-otp-label>i small { position:absolute; right:-5px; top:-5px; width:17px; height:17px; display:grid; place-items:center; border-radius:50%; border:2px solid #fff; background:#8083dd; color:#fff; font-size:8px; font-weight:800; }
.ssp-otp-card.is-new .ssp-otp-label>i small { background:#3aaccc; }
.ssp-otp-card.is-complete .ssp-otp-label>i small { background:#16b981; }
.ssp-otp-label>div { flex:1; min-width:0; }
.ssp-otp-label span,.ssp-otp-label b { display:block; }
.ssp-otp-label span { font-size:10px; color:var(--ssp-muted); font-weight:600; }
.ssp-otp-label b { margin-top:2px; font-size:13px; letter-spacing:.6px; }
.ssp-otp-status { flex:none; padding:4px 9px; border-radius:99px; background:#f1f3ff; color:#6873df; font-size:9.5px; font-weight:800; font-style:normal; letter-spacing:.3px; transition:background .3s,color .3s; }
.ssp-otp-card.is-complete .ssp-otp-status { background:#e9f9f1; color:#087b56; }
.ssp-otp-boxes { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-top:14px; }
.ssp-otp-boxes input { width:100%; aspect-ratio:.86; min-height:48px; padding:0; border:1.5px solid #dfe5f5; border-radius:13px; background:#f9faff; color:#3b44a0; text-align:center; font-size:22px!important; font-weight:800; caret-color:var(--ssp-indigo); transition:border-color .2s,box-shadow .2s,background .2s,transform .2s; }
.ssp-otp-boxes input:focus { outline:none; border-color:var(--ssp-indigo); background:#fff; box-shadow:0 0 0 4px rgba(91,108,255,.14),0 6px 16px rgba(91,108,255,.12); transform:translateY(-2px); }
.ssp-otp-boxes input.is-filled { border-color:#b9c1f5; background:linear-gradient(180deg,#fff,#f3f5ff); animation:ssp-pop .25s cubic-bezier(.2,.8,.2,1); }
.ssp-otp-card.is-new .ssp-otp-boxes input:focus { border-color:var(--ssp-cyan); box-shadow:0 0 0 4px rgba(34,193,238,.16),0 6px 16px rgba(34,193,238,.12); }
.ssp-otp-card.is-complete .ssp-otp-boxes input.is-filled { border-color:rgba(22,185,129,.45); background:linear-gradient(180deg,#fff,#effbf5); color:#0d8a62; }
.ssp-resend { display:flex; justify-content:center; align-items:center; gap:7px; width:100%; padding:12px; margin-top:12px; border:0; background:transparent; color:#6875d8; font-size:11px!important; font-weight:700!important; }
.ssp-resend-ready { animation:ssp-wiggle 2.5s ease-in-out infinite; }
.ssp-demo-chip { display:flex; align-items:center; justify-content:center; gap:6px; width:max-content; max-width:100%; margin:6px auto 0; padding:6px 12px; border-radius:99px; border:1px dashed rgba(139,92,246,.4); background:#f6f1ff; color:#6b4fc9; font-size:10px; font-weight:600; }
.ssp-demo-chip b { font-weight:900; letter-spacing:1.5px; color:#4b32a8; }
.ssp-otp-help { margin:10px 5px 0; color:var(--ssp-muted); text-align:center; font-size:10px; line-height:1.8; }
.ssp-verification-intro { padding:8px 8px 12px; text-align:center; }
.ssp-verification-intro>i { display:grid; place-items:center; width:92px; height:92px; margin:0 auto 20px; border:1px solid #e1e5ff; border-radius:30px; background:linear-gradient(135deg,#eef0ff,#eee6ff); color:#7864e0; box-shadow:0 14px 32px rgba(91,108,255,.14); animation:ssp-pulse 2.8s ease-in-out infinite; }
.ssp-verification-intro h3 { margin:0; font-size:19px; letter-spacing:-.5px; }
.ssp-verification-intro p { max-width:340px; margin:12px auto 0; font-size:12px; line-height:1.8; color:var(--ssp-muted); }

/* Photo */
.ssp-photo-stage { display:grid; place-items:center; padding:10px 0 22px; }
.ssp-photo-stage>div { width:190px; height:190px; overflow:hidden; border:5px solid #fff; border-radius:50%; background:#eef0ff; box-shadow:0 0 0 2px #dfe4ff,0 0 0 8px rgba(91,108,255,.08),0 18px 40px rgba(91,108,255,.24); }
.ssp-photo-stage img { width:100%; height:100%; object-fit:cover; }
.ssp-photo-controls { display:grid; gap:12px; }
.ssp-photo-controls label { display:grid; gap:8px; padding:11px 13px; border:1px solid var(--ssp-line); border-radius:13px; background:#fff; }
.ssp-photo-controls label>span { display:flex; justify-content:space-between; font-size:11px; font-weight:650; color:#636f90; }
.ssp-photo-controls label>span b { color:var(--ssp-indigo); font-weight:800; }
.ssp-photo-controls input { width:100%; accent-color:#7c6bf1; }
.ssp-signout-intro { display:grid; justify-items:center; gap:14px; text-align:center; padding:6px 0; }
.ssp-signout-intro>i { display:grid; place-items:center; width:70px; height:70px; border-radius:24px; background:linear-gradient(135deg,#fff0f4,#ffe6ec); color:#c84062; }
.ssp-signout-copy { margin:0; font-size:13px; color:var(--ssp-muted); }

/* Drawer */
.ssp-drawer-overlay { justify-content:flex-start; align-items:stretch; }
.ssp-sheet.ssp-drawer { width:min(86vw,340px); max-height:100%; padding:22px 18px; border-radius:0 28px 28px 0; animation:ssp-slide .25s ease; }
.ssp-sheet.ssp-drawer::before { display:none; }
.ssp-drawer .ssp-sheet-body { display:flex; flex:1; flex-direction:column; }
.ssp-menu-seller { position:relative; overflow:hidden; display:flex; align-items:center; gap:11px; padding:16px; border-radius:20px; background:var(--ssp-grad); color:#fff; box-shadow:0 14px 30px rgba(91,108,255,.28); }
.ssp-menu-seller::after { content:""; position:absolute; right:-30px; top:-30px; width:110px; height:110px; border-radius:50%; background:rgba(255,255,255,.14); }
.ssp-menu-seller>i { flex:none; display:grid; place-items:center; width:44px; height:44px; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.22); border-radius:14px; }
.ssp-menu-seller>div { min-width:0; position:relative; z-index:1; }
.ssp-menu-seller b { display:block; font-size:13px; overflow-wrap:anywhere; }
.ssp-menu-seller span { display:block; margin-top:4px; font-size:11px; opacity:.85; }
.ssp-menu-links { display:grid; gap:7px; margin-top:22px; }
.ssp-menu-links button { display:flex; align-items:center; gap:12px; padding:11px 12px; border:1px solid transparent; border-radius:15px; color:#687493; background:transparent; font-size:13px; text-align:left; }
.ssp-menu-links button>i { display:grid; place-items:center; width:34px; height:34px; border-radius:11px; background:#f1f3ff; color:#6873df; transition:background .2s,color .2s; }
.ssp-menu-links button:hover { background:#f5f6ff; }
.ssp-menu-links button>span { flex:1; }
.ssp-menu-links button.active { background:#edf0ff; border-color:#dce3ff; color:#5b6cff; font-weight:750; }
.ssp-menu-links button.active>i { background:var(--ssp-grad); color:#fff; box-shadow:0 6px 14px rgba(91,108,255,.28); }
.ssp-menu-brand { display:grid; gap:10px; justify-items:center; margin-top:auto; padding-top:28px; }
.ssp-menu-brand>small { color:var(--ssp-muted); font-size:10px; }

/* Toast */
.ssp-toast { position:fixed; left:50%; bottom:calc(90px + env(safe-area-inset-bottom,0px)); z-index:100; width:max-content; max-width:calc(100vw - 32px); padding:12px 18px; border:1px solid rgba(255,255,255,.2); border-radius:16px; background:#303858; color:#fff; font-size:12px; line-height:1.5; text-align:center; box-shadow:0 12px 30px rgba(27,35,64,.28); opacity:0; pointer-events:none; transform:translate(-50%,8px); transition:opacity .25s,transform .25s; }
.ssp-toast.is-visible { opacity:1; transform:translate(-50%,0); }
.ssp-spin { animation:ssp-spin 1s linear infinite; }

@media(min-width:760px) {
  .ssp-top { min-height:78px; padding:14px 28px; }
  .ssp-top>.ssp-brand { margin-right:auto; }
  .ssp-top-left { flex:1; }
  .ssp-top>.ssp-icon { margin-left:100px; }
  .ssp-content { padding-top:28px; }
  .ssp-layout { grid-template-columns:minmax(0,1.18fr) minmax(0,1fr); gap:22px; margin-top:22px; }
  .ssp-hero { padding:30px 32px; border-radius:32px; }
  .ssp-identity { margin:24px 0 22px; gap:24px; }
  .ssp-avatar { width:100px; height:100px; font-size:32px; }
  .ssp-hero-name h1 { font-size:34px; }
  .ssp-hero-name p { font-size:15px; }
  .ssp-eyebrow { font-size:10px; }
  .ssp-hero-bottom p { font-size:12px; }
  .ssp-hero-art { width:360px; height:300px; right:25px; bottom:-10px; }
  .ssp-hero-art>svg { width:290px; height:290px; }
  .ssp-stats { max-width:520px; gap:10px; }
  .ssp-stat { padding:12px 14px; }
  .ssp-stat b { font-size:17px; }
  .ssp-stat span { font-size:10px; }
  .ssp-card { padding:24px; }
  .ssp-sheet:not(.ssp-drawer) { max-height:88dvh; margin-bottom:24px; border-radius:28px; }
  .ssp-sheet::before { border-radius:28px 28px 0 0; }
  .ssp-sheet-foot { padding-bottom:18px; }
}
@media(max-width:390px) {
  .ssp-top { gap:10px; padding:11px 12px; }
  .ssp-top-left { gap:8px; }
  .ssp-top-copy b { font-size:12px; }
  .ssp-brand { font-size:15px; }
  .ssp-brand i { width:21px; height:21px; }
  .ssp-icon { width:35px; height:35px; }
  .ssp-content { padding:15px 12px 0; }
  .ssp-hero { padding:19px; border-radius:24px; }
  .ssp-hero-name h1 { font-size:21px; }
  .ssp-avatar { width:72px; height:72px; font-size:23px; }
  .ssp-identity { gap:13px; }
  .ssp-eyebrow { font-size:8px; letter-spacing:1px; }
  .ssp-stat { padding:9px; gap:7px; }
  .ssp-stat i { width:26px; height:26px; }
  .ssp-stat b { font-size:13px; }
  .ssp-card { padding:17px; border-radius:22px; }
  .ssp-section-head h2 { font-size:16px; }
  .ssp-detail { padding:12px 10px; }
  .ssp-detail dd { font-size:12px; }
  .ssp-sheet { padding-left:16px; padding-right:16px; }
  .ssp-form-grid { grid-template-columns:1fr; }
  .ssp-hero-bottom p { font-size:10px; }
}
@media(prefers-reduced-motion:reduce) {
  .sand-seller-profile *, .sand-seller-profile *::before, .sand-seller-profile *::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; }
}
@keyframes ssp-spin { to { transform:rotate(360deg); } }
@keyframes ssp-rise { from { transform:translateY(100%); } }
@keyframes ssp-slide { from { transform:translateX(-100%); } }
@keyframes ssp-fade { from { opacity:0; } }
@keyframes ssp-up { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes ssp-float { 0%,100% { transform:translate(0,0); } 50% { transform:translate(14px,-18px); } }
@keyframes ssp-shimmer { from { transform:translateX(-100%); } to { transform:translateX(100%); } }
@keyframes ssp-pulse { 0%,100% { box-shadow:0 0 0 4px rgba(91,108,255,.12); } 50% { box-shadow:0 0 0 9px rgba(91,108,255,.05); } }
@keyframes ssp-hue { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
@keyframes ssp-sheen { 0% { transform:translateX(-70%) rotate(0.001deg); } 45%,100% { transform:translateX(70%) rotate(0.001deg); } }
@keyframes ssp-rise-dot { 0% { transform:translateY(0) scale(.6); opacity:0; } 12% { opacity:.9; } 85% { opacity:.5; } 100% { transform:translateY(-260px) translateX(18px) scale(1.1); opacity:0; } }
@keyframes ssp-hero-in { from { opacity:0; transform:translateY(14px) scale(.98); filter:blur(4px); } to { opacity:1; transform:none; filter:blur(0); } }
@keyframes ssp-twinkle { 0%,100% { opacity:1; transform:scale(1) rotate(0deg); } 50% { opacity:.5; transform:scale(1.35) rotate(25deg); } }
@keyframes ssp-draw { from { stroke-dashoffset:var(--circ,999); } }
@keyframes ssp-breathe { 0%,100% { transform:scale(1); } 50% { transform:scale(1.03); } }
@keyframes ssp-drift { 0%,100% { transform:translate(0,0) rotate(0deg); } 50% { transform:translate(-8px,-10px) rotate(-1.5deg); } }
@keyframes ssp-stat-in { from { opacity:0; transform:translateY(12px) scale(.94); } to { opacity:1; transform:none; } }
@keyframes ssp-btn-sheen { 0%,60% { transform:translateX(-120%); } 100% { transform:translateX(120%); } }
@keyframes ssp-ring-pulse { 0% { transform:scale(.9); opacity:.9; } 100% { transform:scale(1.35); opacity:0; } }
@keyframes ssp-travel { 0% { left:-40%; } 100% { left:100%; } }
@keyframes ssp-pop { 0% { transform:scale(.85); } 60% { transform:scale(1.08); } 100% { transform:scale(1); } }
@keyframes ssp-wiggle { 0%,80%,100% { transform:rotate(0); } 85% { transform:rotate(-20deg); } 90% { transform:rotate(20deg); } 95% { transform:rotate(-10deg); } }

/* Definitive OTP hero fix: the generic .ssp-otp-hero>* rule was changing the
   decorative 220px glow from absolute positioning into a normal flow element,
   which created the large empty purple area. */
.ssp-otp-hero > .ssp-otp-hero-glow {
  position:absolute!important;
  display:none!important;
  width:0!important;
  height:0!important;
  inset:auto!important;
}
.ssp-otp-hero {
  display:block!important;
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
}
.ssp-otp-hero > .ssp-otp-shield,
.ssp-otp-hero > b,
.ssp-otp-hero > p,
.ssp-otp-hero > .ssp-otp-route {
  position:relative;
  z-index:1;
}

/* Performance and requested layout corrections */
.sand-seller-profile { overflow-x:hidden; }
.ssp-stats { grid-template-columns:repeat(2,minmax(0,1fr)); }
.ssp-phone-input>span {
  width:52px;
  min-width:52px;
  padding:0 9px 0 12px;
  text-align:center;
  white-space:nowrap;
  border-right:1px solid #e3e7f2;
  line-height:46px;
}
.ssp-phone-input input { padding-left:12px; }
.ssp-otp-hero {
  padding:13px 14px 12px;
  margin-bottom:10px;
  border-radius:18px;
  box-shadow:0 10px 24px rgba(91,108,255,.22);
}
.ssp-otp-shield { width:42px; height:42px; margin:0 auto 7px; border-radius:14px; }
.ssp-otp-pulse { display:none; }
.ssp-otp-hero b { font-size:13px; }
.ssp-otp-hero p { margin-top:3px; max-width:360px; font-size:10px; line-height:1.4; }
.ssp-otp-route { margin-top:9px; gap:6px; }
.ssp-otp-route span { padding:4px 7px; font-size:8.5px; }
.ssp-sheet-body { -webkit-overflow-scrolling:touch; scrollbar-gutter:stable; }

/* Continuous blurred animations caused scroll jank on mobile. Keep only short entry transitions. */
.ssp-orb,.ssp-glow-a,.ssp-glow-b,.ssp-hero,.ssp-hero-sheen,
.ssp-hero-particles i,.ssp-twinkle,.ssp-avatar-halo,.ssp-avatar,
.ssp-hero-art>svg,.ssp-art-ring,.ssp-stat,.ssp-hero-edit::after,
.ssp-progress-track i::after,.ssp-step.is-active .ssp-step-icon,
.ssp-phone-warning>i,.ssp-otp-hero,.ssp-otp-hero-glow,
.ssp-otp-route-line i,.ssp-resend-ready,.ssp-verification-intro>i {
  animation:none!important;
}
.ssp-orb,.ssp-hero-glow,.ssp-otp-hero-glow { filter:none; }

@media(max-width:759px) {
  .ssp-top,.ssp-card,.ssp-overlay,.ssp-badge.is-light.is-pending,
  .ssp-badge.is-light.is-verified,.ssp-signout,.ssp-otp-shield {
    backdrop-filter:none;
    -webkit-backdrop-filter:none;
  }
  .ssp-top { background:rgba(255,255,255,.94); }
  .ssp-card { background:rgba(255,255,255,.94); }
  .ssp-overlay { background:rgba(27,35,64,.48); }
  .ssp-orb { display:none; }
  .ssp-hero { box-shadow:0 12px 28px rgba(91,108,255,.24); }
  .ssp-card { box-shadow:0 8px 22px rgba(64,84,150,.09); }
  .ssp-detail:hover,.ssp-card:hover { transform:none; }
  .ssp-sheet-body { padding-top:12px; padding-bottom:14px; }
  .ssp-otp-card { margin-top:9px; padding:12px; }
  .ssp-otp-boxes { margin-top:10px; gap:6px; }
}

/* ==== Transporter-only additions ==== */
.transporter-profile .ssp-hero-art>svg{width:190px;height:190px;right:18px;bottom:25px;stroke-width:.9}
.transporter-profile .ssp-stats{grid-template-columns:repeat(3,minmax(0,1fr))}
.transporter-profile .ssp-phone-input>span{line-height:46px}
.tp-fleet-card,.tp-city-card{grid-column:1/-1}
.tp-empty{margin:0;padding:14px;border:1px dashed var(--ssp-line);border-radius:14px;text-align:center;color:var(--ssp-muted);font-size:11px}
.tp-truck-list{display:grid;gap:9px;margin:0;padding:0;list-style:none}
.tp-truck-row{display:flex;align-items:center;gap:11px;padding:11px 12px;border:1px solid var(--ssp-line);border-radius:16px;background:rgba(249,250,255,.85);transition:border-color .22s,box-shadow .22s}
.tp-truck-row:hover{border-color:rgba(91,108,255,.22);box-shadow:0 8px 20px rgba(64,84,150,.08)}
.tp-truck-row>i{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:12px;color:#fff;background:var(--ssp-grad);box-shadow:0 8px 16px rgba(91,108,255,.24)}
.tp-truck-name{flex:1;min-width:0}
.tp-truck-name b,.tp-truck-name span{display:block}
.tp-truck-name b{font-size:13px;font-weight:800;letter-spacing:-.2px}
.tp-truck-name span{margin-top:2px;font-size:10px;color:var(--ssp-muted);font-weight:600}
.tp-counter{display:flex;align-items:center;flex:none;overflow:hidden;border:1px solid #dfe4f1;border-radius:11px;background:#fff}
.tp-counter button{width:32px;height:36px;display:grid;place-items:center;border:0;background:#f4f6fd;color:#5666d4}
.tp-counter button:hover:not(:disabled){background:var(--ssp-grad);color:#fff}
.tp-counter input{width:46px;height:36px;padding:0;border:0;outline:0;text-align:center;font-size:13px;font-weight:800;color:var(--ssp-ink);background:#fff}
.tp-remove,.tp-city-list li>button{flex:none;width:36px;height:36px;display:grid;place-items:center;padding:0;border:0;border-radius:11px;background:#ffecef;color:#c84062}
.tp-remove:hover:not(:disabled),.tp-city-list li>button:hover:not(:disabled){background:#c84062;color:#fff}
.tp-add-truck{display:grid;gap:10px;margin-top:14px;padding:13px;border:1px dashed rgba(91,108,255,.28);border-radius:16px;background:linear-gradient(135deg,#f5f6ff,#f7f3ff)}
.tp-add-truck-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.tp-add-truck-head b{font-size:12px;font-weight:800}
.tp-add-truck-head span{font-size:9.5px;color:var(--ssp-muted);font-weight:700;overflow-wrap:anywhere}
.tp-add-truck-row{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,.8fr) auto;gap:8px;align-items:end}
.tp-add-truck-row label{display:grid;gap:5px;min-width:0;font-size:10px;font-weight:750;color:#46516e}
.tp-add-truck-row select,.tp-add-truck-row input{width:100%;min-width:0;height:42px;padding:0 11px;border:1px solid #dfe4f1;border-radius:12px;background:#fff;color:var(--ssp-ink);font-size:13px;font-weight:700}
.tp-add-truck-row select:focus,.tp-add-truck-row input:focus{outline:none;border-color:#919df3;box-shadow:0 0 0 4px rgba(91,108,255,.10)}
.tp-add-truck-row .tp-custom{grid-column:1/-1}
.tp-add-button,.tp-add-city>button{display:flex;align-items:center;justify-content:center;gap:5px;height:42px;padding:0 14px;border:0;border-radius:12px;background:var(--ssp-grad);color:#fff;font-size:11px!important;font-weight:800!important;box-shadow:0 8px 18px rgba(91,108,255,.26);white-space:nowrap}
.tp-add-button:hover:not(:disabled),.tp-add-city>button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 24px rgba(91,108,255,.34)}
.tp-add-city,.tp-search{display:flex;align-items:center;gap:8px;padding:0 5px 0 12px;border:1px solid #dfe4f1;border-radius:13px;background:#fff;color:var(--ssp-muted);transition:border-color .2s,box-shadow .2s}
.tp-add-city:focus-within,.tp-search:focus-within{border-color:#919df3;box-shadow:0 0 0 4px rgba(91,108,255,.10)}
.tp-add-city input,.tp-search input{flex:1;min-width:0;height:46px;padding:0;border:0;outline:0;background:transparent;color:var(--ssp-ink);font-size:13px;font-weight:600}
.tp-add-city>button{height:36px;padding:0 12px;border-radius:10px}
.tp-search{margin-top:10px;padding-right:12px}
.tp-city-card .ssp-field-error,.tp-fleet-card .ssp-field-error{margin-top:8px}
.tp-city-list{display:grid;gap:8px;margin:14px 0 0;padding:0;list-style:none}
.tp-city-list li{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 9px 9px 12px;border:1px solid var(--ssp-line);border-radius:14px;background:rgba(249,250,255,.85);transition:border-color .22s,box-shadow .22s}
.tp-city-list li:hover{border-color:rgba(34,193,238,.3);box-shadow:0 8px 20px rgba(64,84,150,.08)}
.tp-city-list li>span{display:flex;align-items:center;gap:8px;min-width:0;color:#1f9ec4}
.tp-city-list li b{font-size:12.5px;font-weight:800;color:var(--ssp-ink);overflow-wrap:anywhere}
.tp-city-list li.tp-empty-row{justify-content:center;border-style:dashed;color:var(--ssp-muted);font-size:11px;background:transparent}
@media(min-width:760px){.tp-city-list{grid-template-columns:1fr 1fr}.tp-city-list li.tp-empty-row{grid-column:1/-1}}
@media(max-width:540px){.tp-add-truck-row{grid-template-columns:minmax(0,1fr) 84px}.tp-add-button{grid-column:1/-1;width:100%}.tp-truck-row{flex-wrap:wrap}.tp-truck-name{flex-basis:calc(100% - 50px)}.tp-counter{margin-left:auto}}

/* ==== Shared StoneRate transporter navigation (reference: Bidding page) ==== */
.transporter-profile .bd-shell{width:min(100% - 28px,1120px);max-width:100%;margin:auto}
.transporter-profile .bd-header{position:sticky;top:0;z-index:40;border-bottom:1px solid rgba(218,222,239,.72);background:rgba(255,255,255,.82);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.transporter-profile .bd-header-inner{min-height:64px;padding:8px 0;display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:10px}
.transporter-profile .bd-icon-btn{width:38px;height:38px;flex:0 0 auto;border:1px solid #e4e7f1;border-radius:12px;background:rgba(255,255,255,.9);color:#10243e;display:grid;place-items:center;position:relative;padding:0;transition:border-color .2s,transform .2s}
.transporter-profile .bd-icon-btn:hover{border-color:#cbd1ee;transform:translateY(-1px)}
.transporter-profile .bd-icon-btn>svg{width:19px;height:19px}
.transporter-profile .bd-greeting{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:2px}
.transporter-profile .bd-greeting strong,.transporter-profile .bd-greeting small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.transporter-profile .bd-greeting strong{font-size:clamp(14px,4.2vw,17px);line-height:1.15;letter-spacing:-.3px;color:#10243e}
.transporter-profile .bd-greeting small{font-size:clamp(10.5px,3vw,12px);line-height:1.2;color:#65758b;font-weight:600}
.transporter-profile .bd-logo{display:flex;align-items:center;gap:6px;font-size:clamp(17px,5vw,21px);line-height:1;font-weight:900;letter-spacing:-.6px;white-space:nowrap;color:#10243e}
.transporter-profile .bd-logo-mark{width:30px;height:30px;flex:0 0 auto;border-radius:9px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 55%,#00a9c7);box-shadow:0 6px 16px rgba(91,108,255,.22)}
.transporter-profile .bd-logo-mark>svg{width:17px;height:17px}
.transporter-profile .bd-logo-rate{color:#6c4ee7}
.transporter-profile .bd-notify-dot{position:absolute;right:7px;top:6px;width:8px;height:8px;border-radius:50%;background:#f05b68;border:2px solid #fff}
.transporter-profile .bd-desktop-nav{display:none}
.transporter-profile .bd-bottom{position:fixed;z-index:35;left:12px;right:12px;bottom:max(10px,env(safe-area-inset-bottom));height:72px;border:1px solid rgba(217,221,237,.9);border-radius:23px;background:rgba(255,255,255,.9);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 16px 38px rgba(32,42,91,.18);display:grid;grid-template-columns:repeat(5,1fr);padding:7px 7px 5px}
.transporter-profile .bd-nav-item{border:0;background:transparent;color:#7a829b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:0;min-width:0;font-size:8.5px;line-height:normal;font-weight:800;position:relative;border-radius:14px;cursor:pointer}
.transporter-profile .bd-nav-item:hover{background:#f4f5fb;color:#5260c7}
.transporter-profile .bd-nav-item.active{color:#4f5dd4}
.transporter-profile .bd-nav-item>svg{width:19px;height:19px;stroke-width:2;flex:0 0 auto}
.transporter-profile .bd-nav-item>span:last-child{font-size:8.5px;line-height:normal;font-weight:800}
.transporter-profile .bd-active-icon{width:45px;height:45px;flex:0 0 auto;margin-top:-24px;border:5px solid #eff1fa;border-radius:17px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#2457e6,#6c4ee7 58%,#00a9c7);box-shadow:0 9px 21px rgba(86,94,213,.31)}
.transporter-profile .bd-active-icon>svg{width:20px;height:20px;stroke-width:2}
.transporter-profile .bd-nav-badge{position:absolute;top:5px;right:18%;background:#f05b68;color:#fff;border:2px solid #fff;border-radius:99px;min-width:15px;height:15px;padding:0 2px;line-height:11px;font-size:7px;font-weight:800}
@media(max-width:390px){.transporter-profile .bd-header-inner{gap:7px}.transporter-profile .bd-icon-btn{width:36px;height:36px}.transporter-profile .bd-logo{gap:5px}.transporter-profile .bd-logo-mark{width:28px;height:28px}}
@media(max-width:359px){.transporter-profile .bd-greeting small{display:none}}
@media(min-width:700px){.transporter-profile .bd-shell{width:min(100% - 42px,1120px)}.transporter-profile .bd-greeting strong{font-size:18px}.transporter-profile .bd-greeting small{font-size:12.5px}.transporter-profile .bd-logo{font-size:22px}}
@media(min-width:980px){.transporter-profile .bd-header-inner{min-height:72px;grid-template-columns:auto auto 1fr auto auto}.transporter-profile .bd-desktop-nav{display:flex;align-items:center;justify-content:center;gap:4px}.transporter-profile .bd-desktop-nav button{border:0;background:transparent;padding:9px 12px;color:#69718c;font-size:12px;font-weight:800;border-radius:10px;cursor:pointer}.transporter-profile .bd-desktop-nav button.active,.transporter-profile .bd-desktop-nav button:hover{color:#4f5ed4;background:#eef0ff}.transporter-profile .bd-logo{position:absolute;left:50%;transform:translateX(-50%)}.transporter-profile .bd-bottom{display:none}}
/* ==== end shared navigation ==== */
@media(min-width:980px){.transporter-profile{padding-bottom:35px}}
`;
