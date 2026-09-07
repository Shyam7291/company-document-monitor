import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu, X, Home, ListOrdered, ImageUp, Boxes, UserRound, Sparkles,
  SquarePen, Mountain, Phone, MapPin, ShieldCheck, Clock3, CheckCircle2,
  ChevronRight, RefreshCw, Camera, LockKeyhole, Fingerprint, Building2,
  ArrowRight, LogOut, AlertCircle, TrendingUp, PackageCheck, CircleDot,
} from "lucide-react";

/**
 * Standalone test build of the sand seller profile page.
 *
 * This version intentionally uses local mock state only: there are no API
 * imports or backend requests. Parent navigation/sign-out callbacks are kept
 * compatible with the original component and may be passed by the host app.
 */

const MOCK_PROFILE = {
  name: "Rajesh Kumar",
  email: "rajesh@example.com",
  plantName: "Kumar Sand Plant",
  sellerId: "SS-2048-118",
  primaryPhone: "9876543210",
  alternatePhone: "",
  address: "NH 44, Industrial Area",
  pincode: "560001",
  city: "Bengaluru",
  state: "Karnataka",
  aadhaarVerified: false,
  adminVerified: true,
  photoUrl: "",
};

const digits = value => String(value ?? "").replace(/\D/g, "");
const cleanPhone = value => digits(value).slice(0, 10);
const maskPhone = value => {
  const phone = digits(value);
  return phone ? `+91 ••••••${phone.slice(-4)}` : "Not provided";
};
const initials = name => String(name || "").trim().split(/\s+/).filter(Boolean)
  .slice(0, 2).map(part => part[0]).join("").toUpperCase();

function Brand() {
  return <div className="ssp-brand"><i><Sparkles size={14} /><span /></i><b>Stone</b><strong>Rate</strong></div>;
}

function Badge({ verified, children }) {
  return <span className={`ssp-badge ${verified ? "is-verified" : "is-pending"}`}>
    {verified ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{children}
  </span>;
}

function Sheet({ title, subtitle, onClose, children, footer, busy = false, drawer = false }) {
  const panelRef = useRef(null);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => { document.body.style.overflow = previous; };
  }, []);
  return <div className={`ssp-overlay ${drawer ? "ssp-drawer-overlay" : ""}`} onMouseDown={event => {
    if (event.target === event.currentTarget && !busy) onClose();
  }}>
    <section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
      className={`ssp-sheet ${drawer ? "ssp-drawer" : ""}`}>
      {!drawer && <i className="ssp-handle" />}
      <header className="ssp-sheet-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="ssp-icon" onClick={onClose} disabled={busy} aria-label="Close"><X size={20} /></button>
      </header>
      <div className="ssp-sheet-body">{children}</div>
      {footer && <footer className="ssp-sheet-foot">{footer}</footer>}
    </section>
  </div>;
}

function Field({ label, children, error, full = false }) {
  return <label className={`ssp-field ${full ? "ssp-full" : ""} ${error ? "has-error" : ""}`}>
    <span>{label}</span>{children}{error && <small><AlertCircle size={12} />{error}</small>}
  </label>;
}

function Stat({ icon: Icon, label, value, tone }) {
  return <div className={`ssp-stat ${tone}`}><span className="ssp-stat-icon"><Icon size={17} /></span>
    <div><b>{value}</b><small>{label}</small></div></div>;
}

export default function SandSellerProfilePage({
  seller, sellerName = "", onProfileUpdated, onNavigate, onSignOut,
  onOpenHome, onOpenQueue, onOpenSampleUpload, onOpenMySamples, onOpenProfile,
  onRequestPhoneChange, onConfirmPhoneChange, onVerifyAadhaar,
}) {
  const [profile, setProfile] = useState(() => ({ ...MOCK_PROFILE, ...seller, name: seller?.name || sellerName || MOCK_PROFILE.name }));
  const [draft, setDraft] = useState(profile);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoInput, setPhotoInput] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [currentOtp, setCurrentOtp] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const toastTimer = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (!photoFile) return undefined;
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const notify = message => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  const closeSheet = () => {
    if (busy) return;
    setSheet(null); setErrors({}); setCurrentOtp(""); setNewOtp(""); setPhotoFile(null);
  };
  const updateDraft = (key, value) => {
    setDraft(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: "" }));
  };
  const openEdit = () => { setDraft(profile); setErrors({}); setSheet("edit"); };
  const saveProfile = event => {
    event.preventDefault();
    const nextErrors = {};
    if (!draft.plantName.trim()) nextErrors.plantName = "Plant name is required.";
    if (!draft.name.trim()) nextErrors.name = "Your name is required.";
    if (!/^\d{10}$/.test(digits(draft.primaryPhone))) nextErrors.primaryPhone = "Enter 10 digits.";
    if (!draft.address.trim()) nextErrors.address = "Address is required.";
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setBusy(true);
    window.setTimeout(() => {
      const next = { ...profile, ...draft, primaryPhone: digits(draft.primaryPhone) };
      setProfile(next); setDraft(next); setBusy(false); setSheet(null); notify("Profile updated locally for testing.");
      try { onProfileUpdated?.(next); } catch { /* Parent callback is optional in test mode. */ }
    }, 420);
  };
  const choosePhoto = event => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("Choose an image file."); return; }
    setPhotoFile(file); setSheet("photo");
  };
  const savePhoto = () => {
    if (!photoPreview) return;
    setBusy(true);
    window.setTimeout(() => {
      const next = { ...profile, photoUrl: photoPreview };
      setProfile(next); setDraft(next); setBusy(false); setSheet(null); setPhotoFile(null);
      notify("Profile photo updated locally for testing.");
    }, 350);
  };
  const verifyAadhaar = () => {
    setBusy(true);
    window.setTimeout(() => { setProfile(previous => ({ ...previous, aadhaarVerified: true })); setBusy(false); setSheet(null); notify("Aadhaar marked verified in local test mode."); }, 500);
  };
  const navigate = (target, handler) => {
    if (handler) handler(); else if (onNavigate) onNavigate(target); else notify("Connect this navigation action in your app.");
  };
  const tabs = [
    { id: "samples", label: "Sample", icon: ImageUp, action: onOpenSampleUpload },
    { id: "queue", label: "Queue", icon: ListOrdered, action: onOpenQueue },
    { id: "home", label: "Home", icon: Home, action: onOpenHome },
    { id: "mySamples", label: "My Sample", icon: Boxes, action: onOpenMySamples },
    { id: "profile", label: "Profile", icon: UserRound, action: onOpenProfile },
  ];
  const verified = profile.aadhaarVerified && profile.adminVerified;
  const completed = Number(profile.aadhaarVerified) + Number(profile.adminVerified);
  const location = [profile.city, profile.state].filter(Boolean).join(", ");
  const quickStats = useMemo(() => [
    { icon: PackageCheck, label: "Samples submitted", value: "24", tone: "blue" },
    { icon: TrendingUp, label: "Profile strength", value: `${verified ? 100 : 78}%`, tone: "violet" },
    { icon: CircleDot, label: "Verification steps", value: `${completed}/2`, tone: "cyan" },
  ], [verified, completed]);

  return <div className="sand-seller-profile">
    <style>{CSS}</style>
    <div className="ssp-orb ssp-orb-one" /><div className="ssp-orb ssp-orb-two" />
    <header className="ssp-top">
      <div className="ssp-top-left"><button type="button" className="ssp-icon" onClick={() => setSheet("menu")} aria-label="Open navigation"><Menu size={19} /></button>
        <div className="ssp-top-copy"><span>SAND SELLER</span><b>My profile</b></div></div>
      <Brand />
      <button type="button" className="ssp-icon" onClick={() => notify("Local test profile is already up to date.")} aria-label="Refresh profile"><RefreshCw size={18} /></button>
    </header>

    <main className="ssp-content">
      <section className="ssp-hero" aria-labelledby="ssp-profile-title">
        <div className="ssp-hero-art"><Mountain /><div className="ssp-art-ring" /></div>
        <div className="ssp-hero-top"><span className="ssp-eyebrow">SELLER COMMAND CENTER</span><Badge verified={verified}>{verified ? "Verified seller" : "Verification in progress"}</Badge></div>
        <div className="ssp-identity">
          <div className="ssp-avatar-wrap"><div className="ssp-avatar">
            {profile.photoUrl ? <img src={profile.photoUrl} alt="Seller profile" /> : initials(profile.name) ? <span>{initials(profile.name)}</span> : <UserRound size={32} />}
          </div><button type="button" className="ssp-camera" onClick={() => fileInput.current?.click()} aria-label="Change profile photo"><Camera size={14} /></button></div>
          <div className="ssp-hero-name"><span>WELCOME BACK</span><h1 id="ssp-profile-title">{profile.plantName || "Your sand plant"}</h1><p><UserRound size={14} />{profile.name || "Add your name"}</p>
            {profile.sellerId && <small>Seller ID <b>{profile.sellerId}</b></small>}</div>
        </div>
        <div className="ssp-hero-bottom"><div><p><ShieldCheck size={16} />{verified ? "Your account is ready to grow." : "Complete your verification journey."}</p><div className="ssp-hero-progress"><i style={{ width: `${completed * 50}%` }} /></div></div>
          <button type="button" className="ssp-hero-edit" onClick={openEdit}><SquarePen size={15} />Edit profile</button></div>
      </section>
      <input ref={fileInput} type="file" hidden accept="image/*" onChange={choosePhoto} />

      <section className="ssp-stat-row" aria-label="Profile overview">{quickStats.map(stat => <Stat key={stat.label} {...stat} />)}</section>

      <div className="ssp-layout">
        <section className="ssp-card ssp-details" aria-labelledby="ssp-details-title">
          <div className="ssp-section-head"><div><span className="ssp-kicker">YOUR FOUNDATION</span><h2 id="ssp-details-title">Plant snapshot</h2><p>Everything your buyers need to know.</p></div><button type="button" className="ssp-edit-link" onClick={openEdit}><SquarePen size={16} /><span>Edit</span></button></div>
          <div className="ssp-detail-grid">
            <article className="ssp-detail ssp-full"><i><Building2 size={20} /></i><div><small>Plant name</small><b>{profile.plantName || "Not provided"}</b><em>Primary seller location</em></div><ChevronRight size={16} /></article>
            <article className="ssp-detail"><i><UserRound size={20} /></i><div><small>Owner</small><b>{profile.name || "Not provided"}</b></div></article>
            <article className="ssp-detail"><i><Phone size={20} /></i><div><small>Mobile</small><b>{profile.primaryPhone ? `+91 ${profile.primaryPhone}` : "Not provided"}</b></div></article>
            <article className="ssp-detail ssp-full"><i><MapPin size={20} /></i><div><small>Plant address</small><b>{profile.address || "Not provided"}</b><em>{location || profile.pincode || "Add your location"}</em></div></article>
          </div>
          <div className="ssp-secure-note"><LockKeyhole size={16} /><span>Profile changes stay on this device in test mode. Secure phone verification can be connected later.</span></div>
        </section>

        <section className="ssp-card ssp-verification" aria-labelledby="ssp-verification-title">
          <div className="ssp-section-head"><div><span className="ssp-kicker">TRUST CENTER</span><h2 id="ssp-verification-title">Verification journey</h2><p>Build confidence, one step at a time.</p></div><i className="ssp-section-icon"><ShieldCheck size={23} /></i></div>
          <div className="ssp-verification-progress"><div><b>{verified ? "You're all verified" : "Keep going"}</b><span>{completed} of 2 complete</span></div><div className="ssp-progress-track"><i style={{ width: `${completed * 50}%` }} /></div></div>
          <div className="ssp-verification-list">
            <article className={`ssp-verification-step ${profile.aadhaarVerified ? "is-complete" : ""}`}><div className="ssp-step-icon"><Fingerprint size={24} /><small>01</small></div><div className="ssp-step-copy"><h3>Aadhaar verification</h3><p>{profile.aadhaarVerified ? "Your identity is verified." : "Verify your identity securely."}</p>{profile.aadhaarVerified ? <Badge verified>Verified</Badge> : <button type="button" className="ssp-verify-button" onClick={() => setSheet("aadhaar")}>Verify now<ArrowRight size={15} /></button>}</div></article>
            <article className={`ssp-verification-step ${profile.adminVerified ? "is-complete" : ""}`}><div className="ssp-step-icon ssp-admin-icon"><ShieldCheck size={24} /><small>02</small></div><div className="ssp-step-copy"><h3>Admin verification</h3><p>{profile.adminVerified ? "Your plant has been approved." : "Your plant will be reviewed by admin."}</p><Badge verified={profile.adminVerified}>{profile.adminVerified ? "Verified" : "Yet to verify"}</Badge></div></article>
          </div>
          <div className="ssp-admin-note"><LockKeyhole size={14} /><span>Admin verification is updated by the StoneRate team.</span></div>
        </section>
      </div>
      {onSignOut && <button type="button" className="ssp-signout" onClick={() => setSheet("signout")}><LogOut size={17} />Sign out of your account<ChevronRight size={16} /></button>}
      <footer className="ssp-footer"><Brand /><span>SAND SELLER CONSOLE · TEST MODE</span></footer>
    </main>

    <nav className="ssp-bottom-nav" aria-label="Primary"><div className="ssp-nav-pill">{tabs.map(({ id, label, icon: Icon, action }) => <button type="button" key={id} className={id === "profile" ? "active" : ""} onClick={() => navigate(id, action)}><span><Icon /></span><small>{label}</small></button>)}</div></nav>
    <div className={`ssp-toast ${toast ? "is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>

    {sheet === "menu" && <Sheet title="Seller navigation" subtitle="Your StoneRate workspace" drawer onClose={closeSheet}><div className="ssp-menu-seller"><i><Mountain size={25} /></i><div><b>{profile.plantName}</b><span>{profile.name}</span></div></div><nav className="ssp-menu-links">{tabs.map(({ id, label, icon: Icon, action }) => <button type="button" key={id} className={id === "profile" ? "active" : ""} onClick={() => { closeSheet(); navigate(id, action); }}><Icon size={20} /><span>{label}</span><ChevronRight size={16} /></button>)}</nav><div className="ssp-menu-brand"><Brand /><small>Sand seller console</small></div></Sheet>}

    {sheet === "edit" && <Sheet title="Edit your profile" subtitle="Keep your plant and contact details polished." busy={busy} onClose={closeSheet} footer={<><button type="button" className="ssp-secondary" onClick={closeSheet} disabled={busy}>Cancel</button><button type="submit" form="ssp-edit-form" className="ssp-primary" disabled={busy}>{busy ? <RefreshCw size={16} className="ssp-spin" /> : <CheckCircle2 size={16} />}{busy ? "Saving…" : "Save locally"}</button></>}>
      <form id="ssp-edit-form" onSubmit={saveProfile} noValidate><fieldset disabled={busy} className="ssp-form-grid"><Field label="Plant name" error={errors.plantName} full><input value={draft.plantName} onChange={event => updateDraft("plantName", event.target.value)} /></Field><Field label="Your name" error={errors.name} full><input value={draft.name} onChange={event => updateDraft("name", event.target.value)} /></Field><Field label="Mobile number" error={errors.primaryPhone}><div className="ssp-phone-input"><span>+91</span><input value={draft.primaryPhone} inputMode="numeric" maxLength={10} onChange={event => updateDraft("primaryPhone", cleanPhone(event.target.value))} /></div></Field><Field label="Email"><input type="email" value={draft.email} onChange={event => updateDraft("email", event.target.value)} /></Field><Field label="Plant address" error={errors.address} full><textarea rows={3} value={draft.address} onChange={event => updateDraft("address", event.target.value)} /></Field><Field label="City"><input value={draft.city} onChange={event => updateDraft("city", event.target.value)} /></Field><Field label="State"><input value={draft.state} onChange={event => updateDraft("state", event.target.value)} /></Field><Field label="PIN code"><input inputMode="numeric" maxLength={6} value={draft.pincode} onChange={event => updateDraft("pincode", digits(event.target.value).slice(0, 6))} /></Field></fieldset><div className="ssp-form-note"><ShieldCheck size={15} />This test build saves changes locally in memory.</div></form>
    </Sheet>}

    {sheet === "aadhaar" && <Sheet title="Aadhaar verification" subtitle="Test the verification journey without a backend." busy={busy} onClose={closeSheet} footer={<><button type="button" className="ssp-secondary" onClick={closeSheet} disabled={busy}>Not now</button><button type="button" className="ssp-primary" onClick={onVerifyAadhaar || verifyAadhaar} disabled={busy}>{busy ? <RefreshCw size={16} className="ssp-spin" /> : <ArrowRight size={16} />}{busy ? "Checking…" : "Mark as verified"}</button></>}><div className="ssp-verification-intro"><i><Fingerprint size={40} /></i><h3>Your identity. Securely verified.</h3><p>This test action simulates a successful verification locally. No Aadhaar number or identity document is collected.</p></div><div className="ssp-secure-note"><LockKeyhole size={17} /><span>Replace this local action with your secure verification flow when connecting production services.</span></div></Sheet>}

    {sheet === "photo" && <Sheet title="Your profile photo" subtitle="Preview an image before saving it locally." busy={busy} onClose={closeSheet} footer={<><button type="button" className="ssp-secondary" onClick={closeSheet} disabled={busy}>Cancel</button><button type="button" className="ssp-primary" onClick={savePhoto} disabled={busy || !photoPreview}>{busy ? <RefreshCw size={16} className="ssp-spin" /> : <Camera size={16} />}{busy ? "Saving…" : "Save photo"}</button></>}><div className="ssp-photo-stage"><div>{photoPreview && <img src={photoPreview} alt="Profile preview" />}</div></div><p className="ssp-otp-help">The preview is stored in local component state for this test build.</p></Sheet>}

    {sheet === "signout" && <Sheet title="Sign out?" subtitle="End this seller session securely." onClose={closeSheet} footer={<><button type="button" className="ssp-secondary" onClick={closeSheet}>Cancel</button><button type="button" className="ssp-danger" onClick={async () => { setSheet(null); await onSignOut?.(); }}>Sign out</button></>}><p className="ssp-signout-copy">The test page will close this dialog. Your host app controls the actual session.</p></Sheet>}
  </div>;
}

const CSS = `
.sand-seller-profile{--ssp-ink:#1b2340;--ssp-muted:#6b7590;--ssp-line:rgba(120,135,180,.16);--ssp-indigo:#5b6cff;--ssp-violet:#8b5cf6;--ssp-cyan:#22c1ee;--ssp-grad:linear-gradient(135deg,#5b6cff,#8b5cf6 55%,#22c1ee);--ssp-shadow:0 14px 35px rgba(64,84,150,.11),0 2px 7px rgba(64,84,150,.05);position:relative;isolation:isolate;min-height:100vh;min-height:100dvh;padding-bottom:calc(98px + env(safe-area-inset-bottom));background:linear-gradient(180deg,#eef0ff,#e9edfb 40%,#e6f0fa);color:var(--ssp-ink);font-family:"Plus Jakarta Sans",Inter,"Segoe UI",system-ui,sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;color-scheme:light}.sand-seller-profile *,.sand-seller-profile *:before,.sand-seller-profile *:after{box-sizing:border-box}.sand-seller-profile button,.sand-seller-profile input,.sand-seller-profile textarea{font:inherit}.sand-seller-profile button{cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .2s,box-shadow .2s,background .2s}.sand-seller-profile button:disabled{cursor:not-allowed;opacity:.55}.sand-seller-profile button:active:not(:disabled){transform:scale(.97)}.sand-seller-profile svg{flex-shrink:0}.ssp-orb{position:fixed;z-index:-1;border-radius:50%;filter:blur(70px);pointer-events:none;opacity:.7}.ssp-orb-one{width:340px;height:340px;left:-120px;top:-80px;background:radial-gradient(circle,#c3caff,transparent 70%)}.ssp-orb-two{width:280px;height:380px;right:0;top:200px;background:radial-gradient(circle,#b9ecfb,transparent 70%)}.ssp-top{position:sticky;top:0;z-index:40;max-width:1180px;margin:auto;min-height:68px;padding:12px 16px;display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.78);backdrop-filter:blur(22px) saturate(160%);border-bottom:1px solid var(--ssp-line)}.ssp-top-left{display:flex;align-items:center;gap:10px;margin-right:auto;min-width:0}.ssp-top-copy span,.ssp-top-copy b{display:block}.ssp-top-copy span{font-size:8px;letter-spacing:1.3px;color:var(--ssp-muted);font-weight:800}.ssp-top-copy b{font-size:14px;letter-spacing:-.3px}.ssp-icon{display:grid;place-items:center;width:39px;height:39px;flex:none;border:1px solid var(--ssp-line);border-radius:13px;background:rgba(255,255,255,.92);color:#3b4468;box-shadow:0 6px 16px rgba(64,84,150,.08)}.ssp-icon:hover:not(:disabled){box-shadow:0 10px 22px rgba(64,84,150,.14);transform:translateY(-1px)}.ssp-brand{display:flex;align-items:center;white-space:nowrap;font-size:18px;font-weight:900;letter-spacing:-.7px;line-height:1}.ssp-brand i{position:relative;width:24px;height:24px;margin-right:5px;display:grid;place-items:center;border-radius:8px;background:var(--ssp-grad);color:#fff;box-shadow:0 6px 14px rgba(91,108,255,.25)}.ssp-brand i span{position:absolute;width:4px;height:4px;right:3px;top:3px;border-radius:50%;background:#fff}.ssp-brand b{color:var(--ssp-ink)}.ssp-brand strong{background:var(--ssp-grad);-webkit-background-clip:text;background-clip:text;color:transparent}.ssp-content{position:relative;max-width:1060px;margin:0 auto;padding:20px 16px 0}.ssp-hero{position:relative;overflow:hidden;padding:24px;border-radius:29px;background:var(--ssp-grad);color:#fff;box-shadow:0 18px 42px rgba(91,108,255,.28);animation:ssp-rise-in .65s cubic-bezier(.2,.8,.2,1)}.ssp-hero:after{content:"";position:absolute;inset:0;border:1px solid rgba(255,255,255,.28);border-radius:inherit;background:radial-gradient(ellipse at 4% 0%,rgba(255,255,255,.23),transparent 60%);pointer-events:none}.ssp-hero-art{position:absolute;right:-25px;bottom:-35px;width:270px;height:240px;pointer-events:none;opacity:.19}.ssp-hero-art>svg{position:absolute;width:220px;height:220px;right:0;bottom:0;stroke-width:.7}.ssp-art-ring{position:absolute;width:240px;height:240px;border:1px solid rgba(255,255,255,.7);border-radius:50%;right:-70px;top:-60px;box-shadow:0 0 0 28px rgba(255,255,255,.12),0 0 0 56px rgba(255,255,255,.08)}.ssp-hero-top,.ssp-identity,.ssp-hero-bottom{position:relative;z-index:1}.ssp-hero-top{display:flex;justify-content:space-between;align-items:center;gap:10px}.ssp-eyebrow{font-size:9px;font-weight:800;letter-spacing:1.8px;color:rgba(255,255,255,.86)}.ssp-badge{display:inline-flex;width:max-content;align-items:center;gap:5px;padding:5px 10px;border:1px solid transparent;border-radius:99px;font-size:10px;font-weight:800;line-height:1.35;white-space:nowrap}.ssp-badge.is-pending{color:#936000;background:#fff5dc;border-color:rgba(245,165,36,.23)}.ssp-badge.is-verified{color:#087b56;background:#e9f9f1;border-color:rgba(34,197,143,.2)}.ssp-hero .ssp-badge.is-pending{color:#ffefc8;background:rgba(64,38,88,.3);border-color:rgba(255,233,182,.4)}.ssp-hero .ssp-badge.is-verified{color:#e0fff1;background:rgba(5,80,69,.28);border-color:rgba(199,255,229,.4)}.ssp-identity{display:flex;align-items:center;gap:17px;margin:27px 0 23px}.ssp-avatar-wrap{position:relative;flex:none}.ssp-avatar{width:82px;height:82px;display:grid;place-items:center;overflow:hidden;border:3px solid rgba(255,255,255,.75);border-radius:26px;background:rgba(255,255,255,.18);box-shadow:0 10px 24px rgba(33,33,100,.15);color:#fff;font-size:26px;font-weight:800}.ssp-avatar img{width:100%;height:100%;object-fit:cover}.ssp-camera{position:absolute;right:-5px;bottom:-6px;width:29px;height:29px;display:grid;place-items:center;padding:0;border:3px solid #8172f4;border-radius:11px;background:#fff;color:#675ae1;box-shadow:0 4px 12px rgba(27,35,64,.15)}.ssp-hero-name{min-width:0}.ssp-hero-name>span{display:block;color:rgba(255,255,255,.78);font-size:10px;font-weight:600}.ssp-hero-name h1{margin:3px 0 6px;font-size:25px;letter-spacing:-.9px;line-height:1.2;font-weight:800;overflow-wrap:anywhere}.ssp-hero-name p{display:flex;align-items:center;gap:6px;margin:0;font-size:13px;overflow-wrap:anywhere}.ssp-hero-name>small{display:block;margin-top:7px;font-size:9px;color:rgba(255,255,255,.76)}.ssp-hero-name>small b{margin-left:4px;color:#fff;letter-spacing:.5px}.ssp-hero-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding-top:16px;border-top:1px solid rgba(255,255,255,.22)}.ssp-hero-bottom>div{min-width:190px}.ssp-hero-bottom p{display:flex;align-items:center;gap:7px;margin:0;font-size:10.5px;color:rgba(255,255,255,.92)}.ssp-hero-progress{height:4px;margin-top:9px;border-radius:20px;background:rgba(255,255,255,.25);overflow:hidden}.ssp-hero-progress i{display:block;height:100%;border-radius:inherit;background:#fff;transition:width .45s}.ssp-hero-edit{display:flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:9px 13px;border:1px solid rgba(255,255,255,.7);border-radius:12px;background:#fff;color:#6256d7;font-size:11px;font-weight:800;box-shadow:0 6px 16px rgba(38,34,102,.12)}.ssp-stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin:18px 0}.ssp-stat{display:flex;align-items:center;gap:10px;min-width:0;padding:13px 12px;border:1px solid rgba(255,255,255,.94);border-radius:18px;background:rgba(255,255,255,.7);box-shadow:var(--ssp-shadow);animation:ssp-rise-in .7s both}.ssp-stat:nth-child(2){animation-delay:.08s}.ssp-stat:nth-child(3){animation-delay:.16s}.ssp-stat-icon{display:grid;place-items:center;width:35px;height:35px;flex:none;border-radius:12px}.ssp-stat.blue .ssp-stat-icon{color:#5773d9;background:#e9eeff}.ssp-stat.violet .ssp-stat-icon{color:#9061d5;background:#f1e9ff}.ssp-stat.cyan .ssp-stat-icon{color:#2b99b7;background:#e2f5fa}.ssp-stat b,.ssp-stat small{display:block}.ssp-stat b{font-size:16px;line-height:1.1}.ssp-stat small{margin-top:3px;color:var(--ssp-muted);font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ssp-layout{display:grid;gap:18px;align-items:start}.ssp-card{min-width:0;overflow:hidden;padding:21px;border:1px solid rgba(255,255,255,.95);border-radius:26px;background:rgba(255,255,255,.84);box-shadow:var(--ssp-shadow);backdrop-filter:blur(14px);animation:ssp-rise-in .7s .15s both}.ssp-verification{animation-delay:.22s}.ssp-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.ssp-kicker{display:block;margin-bottom:5px;color:#6371db;font-size:8px;font-weight:800;letter-spacing:1.6px}.ssp-section-head h2{margin:0;font-size:18px;font-weight:800;letter-spacing:-.5px;line-height:1.25}.ssp-section-head p{margin:5px 0 0;color:var(--ssp-muted);font-size:11px}.ssp-edit-link{display:flex;flex:none;align-items:center;gap:5px;padding:8px 10px;border:1px solid rgba(91,108,255,.18);border-radius:11px;background:#f1f3ff;color:#5666d4;font-size:11px;font-weight:700}.ssp-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ssp-full{grid-column:1/-1}.ssp-detail{display:flex;align-items:flex-start;gap:11px;min-width:0;padding:14px 12px;border:1px solid var(--ssp-line);border-radius:16px;background:rgba(249,250,255,.68)}.ssp-detail>i{flex:none;width:36px;height:36px;display:grid;place-items:center;border-radius:12px;color:#6873df;background:linear-gradient(135deg,#eaedff,#f0eaff)}.ssp-detail>div{min-width:0;flex:1}.ssp-detail small,.ssp-detail b,.ssp-detail em{display:block}.ssp-detail small{margin-bottom:4px;color:var(--ssp-muted);font-size:10px}.ssp-detail b{font-size:13px;line-height:1.5;overflow-wrap:anywhere}.ssp-detail em{margin-top:4px;color:var(--ssp-muted);font-size:10px;font-style:normal;overflow-wrap:anywhere}.ssp-detail>svg{margin-top:10px;color:#9ca6c2}.ssp-detail.ssp-full:first-child{background:linear-gradient(130deg,#eff0ff,#f7f3ff);border-color:rgba(91,108,255,.16)}.ssp-detail.ssp-full:last-child{background:linear-gradient(130deg,#eff9fe,#f6f6ff);border-color:rgba(34,193,238,.17)}.ssp-detail.ssp-full:last-child>i{color:#2592b8;background:#e1f3fa}.ssp-secure-note{display:flex;align-items:flex-start;gap:8px;padding:12px;margin-top:14px;border-radius:13px;background:rgba(91,108,255,.055);color:#647195;font-size:10px;line-height:1.6}.ssp-secure-note>svg{margin-top:1px;color:#7280cc}.ssp-section-icon{width:42px;height:42px;flex:none;display:grid;place-items:center;border-radius:14px;color:#6973e5;background:linear-gradient(135deg,#e9edff,#efe7ff)}.ssp-verification-progress{padding:14px;border:1px solid rgba(91,108,255,.11);border-radius:16px;background:linear-gradient(135deg,#f1f3ff,#f6f1ff)}.ssp-verification-progress>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:11px}.ssp-verification-progress b{font-size:11px}.ssp-verification-progress span{flex:none;font-size:10px;color:#6973c7}.ssp-progress-track{height:5px;border-radius:20px;background:#e0e5f6;overflow:hidden}.ssp-progress-track i{display:block;height:100%;border-radius:inherit;background:var(--ssp-grad);transition:width .35s}.ssp-verification-list{display:grid;gap:14px;margin:20px 0 16px}.ssp-verification-step{position:relative;display:flex;align-items:flex-start;gap:14px;padding:4px 0 17px}.ssp-verification-step:first-child{border-bottom:1px dashed #dce1f1}.ssp-verification-step:last-child{padding-bottom:0}.ssp-step-icon{position:relative;flex:none;width:49px;height:49px;display:grid;place-items:center;border:1px solid #e0e4ff;border-radius:17px;background:linear-gradient(140deg,#eef0ff,#f5edff);color:#7a64df}.ssp-step-icon small{position:absolute;right:-5px;bottom:-5px;width:20px;height:20px;display:grid;place-items:center;border:2px solid #fff;border-radius:50%;background:#8083dd;color:#fff;font-size:8px;font-weight:800}.ssp-admin-icon{border-color:#dcecf5;background:linear-gradient(140deg,#eef8ff,#e7f7f7);color:#3597ac}.ssp-admin-icon small{background:#62a5b7}.ssp-step-copy{min-width:0;padding-top:1px}.ssp-step-copy h3{margin:0;font-size:13px;font-weight:800}.ssp-step-copy p{margin:4px 0 10px;color:var(--ssp-muted);font-size:10.5px;line-height:1.6}.ssp-verification-step.is-complete .ssp-step-icon{color:#139c75;border-color:#ceeedd;background:#ecfaf3}.ssp-verification-step.is-complete .ssp-step-icon small{background:#22b487}.ssp-verify-button{display:inline-flex;align-items:center;gap:12px;min-height:35px;padding:8px 13px;border:0;border-radius:11px;background:var(--ssp-grad);color:#fff;font-size:10.5px;font-weight:750;box-shadow:0 7px 16px rgba(91,108,255,.23)}.ssp-admin-note{display:flex;align-items:flex-start;gap:7px;padding-top:13px;border-top:1px solid var(--ssp-line);color:#7c859d;font-size:10px;line-height:1.6}.ssp-admin-note svg{margin-top:2px}.ssp-signout{width:100%;display:flex;align-items:center;gap:9px;margin:18px 0 0;padding:14px 17px;border:1px solid rgba(219,99,120,.15);border-radius:17px;background:rgba(255,255,255,.64);color:#b5546e;font-size:12px;font-weight:650}.ssp-signout>svg:last-child{margin-left:auto}.ssp-footer{display:grid;justify-items:center;gap:10px;padding:27px 12px 7px;opacity:.65}.ssp-footer .ssp-brand{font-size:15px}.ssp-footer .ssp-brand i{width:19px;height:19px;border-radius:6px}.ssp-footer>span{font-size:8px;color:var(--ssp-muted);font-weight:700;letter-spacing:2px}.ssp-bottom-nav{position:fixed;left:0;right:0;bottom:0;z-index:45;padding:0 14px calc(8px + env(safe-area-inset-bottom));pointer-events:none}.ssp-nav-pill{pointer-events:auto;position:relative;max-width:520px;margin:auto;display:grid;grid-template-columns:repeat(5,1fr);align-items:end;padding:4px 6px 3px;border-radius:22px;background:rgba(255,255,255,.78);backdrop-filter:blur(24px) saturate(170%);border:1px solid rgba(255,255,255,.95);box-shadow:0 18px 44px rgba(64,84,150,.2),0 1px 0 rgba(255,255,255,.9) inset}.ssp-nav-pill button{position:relative;display:grid;justify-items:center;gap:1px;padding:3px 2px;border:0;background:transparent;color:#7a83a3;border-radius:16px}.ssp-nav-pill button span{width:30px;height:30px;display:grid;place-items:center;border-radius:11px}.ssp-nav-pill button svg{width:18px;height:18px}.ssp-nav-pill button small{font-size:9px;font-weight:700;line-height:1.1}.ssp-nav-pill button:hover{color:var(--ssp-indigo)}.ssp-nav-pill button:hover span{background:rgba(91,108,255,.1)}.ssp-nav-pill button.active{color:var(--ssp-indigo)}.ssp-nav-pill button.active span{width:44px;height:44px;margin-top:-22px;border-radius:16px;background:var(--ssp-grad);color:#fff;border:3px solid #eceffd;box-shadow:0 12px 24px rgba(91,108,255,.45)}.ssp-nav-pill button.active svg{width:20px;height:20px}.ssp-nav-pill button.active small{font-weight:800}.ssp-overlay{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;background:rgba(27,35,64,.4);backdrop-filter:blur(7px);animation:ssp-fade .2s ease}.ssp-sheet{display:flex;flex-direction:column;width:100%;max-width:600px;max-height:94vh;max-height:94dvh;padding:10px 20px 0;border-radius:28px 28px 0 0;background:linear-gradient(180deg,#fff,#f7f9ff);box-shadow:0 -20px 60px rgba(27,35,64,.22);outline:none;animation:ssp-rise .28s cubic-bezier(.2,.8,.2,1)}.ssp-handle{width:40px;height:4px;border-radius:9px;flex:none;margin:0 auto 15px;background:#dce1f0}.ssp-sheet-head{display:flex;flex:none;align-items:flex-start;justify-content:space-between;gap:12px;padding-bottom:16px;border-bottom:1px solid var(--ssp-line)}.ssp-sheet-head h2{margin:0;font-size:19px;font-weight:800;letter-spacing:-.5px}.ssp-sheet-head p{margin:5px 0 0;font-size:11px;color:var(--ssp-muted)}.ssp-sheet-body{min-height:0;overflow-y:auto;padding:18px 0 22px}.ssp-sheet-foot{display:flex;flex:none;gap:10px;padding:14px 0 calc(16px + env(safe-area-inset-bottom));border-top:1px solid var(--ssp-line)}.ssp-primary,.ssp-secondary,.ssp-danger{display:flex;justify-content:center;align-items:center;gap:7px;min-height:44px;padding:11px 16px;border:0;border-radius:14px;font-size:12px;font-weight:750}.ssp-primary{flex:1.5;color:#fff;background:var(--ssp-grad);box-shadow:0 10px 22px rgba(91,108,255,.23)}.ssp-secondary{flex:1;background:#edf0fa;color:#65708b}.ssp-danger{flex:1.5;background:#c84062;color:#fff}.ssp-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 12px;margin:0;padding:0;border:0}.ssp-field{display:block;min-width:0}.ssp-field>span{display:block;margin-bottom:7px;font-size:11px;color:#46516e;font-weight:750}.ssp-field input,.ssp-field textarea{display:block;width:100%;min-width:0;padding:12px;border:1px solid #dfe4f1;border-radius:12px;color:var(--ssp-ink);background:#fff;font-size:14px}.ssp-field textarea{resize:vertical;min-height:90px}.ssp-field input:focus,.ssp-field textarea:focus{outline:3px solid rgba(91,108,255,.1);border-color:#919df3}.ssp-phone-input{display:flex;align-items:center;overflow:hidden;border:1px solid #dfe4f1;border-radius:12px;background:#fff}.ssp-phone-input>span{flex:none;padding-left:11px;color:#78829b;font-size:12px}.ssp-phone-input input{border:0;border-radius:0}.ssp-field.has-error input,.ssp-field.has-error textarea,.ssp-field.has-error .ssp-phone-input{border-color:#da6881}.ssp-field small{display:flex;align-items:flex-start;gap:4px;margin-top:6px;font-size:10px;color:#b33252}.ssp-form-note{display:flex;align-items:center;gap:7px;margin:17px 0 0;color:var(--ssp-muted);font-size:10px}.ssp-verification-intro{padding:8px 8px 12px;text-align:center}.ssp-verification-intro>i{display:grid;place-items:center;width:90px;height:90px;margin:0 auto 20px;border:1px solid #e1e5ff;border-radius:29px;background:linear-gradient(135deg,#eef0ff,#eee6ff);color:#7864e0;box-shadow:0 10px 28px rgba(91,108,255,.11)}.ssp-verification-intro h3{margin:0;font-size:19px;letter-spacing:-.5px}.ssp-verification-intro p{max-width:340px;margin:12px auto 0;font-size:12px;line-height:1.8;color:var(--ssp-muted)}.ssp-photo-stage{display:grid;place-items:center;padding:10px 0 22px}.ssp-photo-stage>div{width:190px;height:190px;overflow:hidden;border:5px solid #fff;border-radius:50%;background:#eef0ff;box-shadow:0 0 0 1px #dfe4ff,0 15px 35px rgba(91,108,255,.22)}.ssp-photo-stage img{width:100%;height:100%;object-fit:cover}.ssp-otp-help{margin:10px 5px 0;color:var(--ssp-muted);text-align:center;font-size:10px;line-height:1.8}.ssp-signout-copy{font-size:13px;color:var(--ssp-muted)}.ssp-drawer-overlay{justify-content:flex-start;align-items:stretch}.ssp-sheet.ssp-drawer{width:min(86vw,340px);max-height:100%;padding:22px 18px;border-radius:0 25px 25px 0;animation:ssp-slide .25s ease}.ssp-drawer .ssp-sheet-body{display:flex;flex:1;flex-direction:column}.ssp-menu-seller{display:flex;align-items:center;gap:11px;padding:16px;border-radius:19px;background:var(--ssp-grad);color:#fff}.ssp-menu-seller>i{flex:none;display:grid;place-items:center;width:44px;height:44px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.2);border-radius:14px}.ssp-menu-seller>div{min-width:0}.ssp-menu-seller b,.ssp-menu-seller span{display:block;overflow-wrap:anywhere}.ssp-menu-seller b{font-size:13px}.ssp-menu-seller span{margin-top:4px;font-size:11px;opacity:.85}.ssp-menu-links{display:grid;gap:7px;margin-top:22px}.ssp-menu-links button{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid transparent;border-radius:14px;color:#687493;background:transparent;font-size:13px;text-align:left}.ssp-menu-links button>span{flex:1}.ssp-menu-links button.active{background:#edf0ff;border-color:#dce3ff;color:#5b6cff;font-weight:750}.ssp-menu-brand{display:grid;gap:10px;justify-items:center;margin-top:auto;padding-top:28px}.ssp-menu-brand>small{color:var(--ssp-muted);font-size:10px}.ssp-toast{position:fixed;left:50%;bottom:calc(90px + env(safe-area-inset-bottom));z-index:100;width:max-content;max-width:calc(100vw - 32px);padding:12px 18px;border:1px solid rgba(255,255,255,.2);border-radius:15px;background:#303858;color:#fff;font-size:12px;line-height:1.5;text-align:center;box-shadow:0 12px 30px rgba(27,35,64,.24);opacity:0;pointer-events:none;transform:translate(-50%,8px);transition:opacity .2s,transform .2s}.ssp-toast.is-visible{opacity:1;transform:translate(-50%,0)}.ssp-spin{animation:ssp-spin 1s linear infinite}@keyframes ssp-spin{to{transform:rotate(360deg)}}@keyframes ssp-rise{from{transform:translateY(100%)}}@keyframes ssp-slide{from{transform:translateX(-100%)}}@keyframes ssp-fade{from{opacity:0}}@keyframes ssp-rise-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@media(min-width:760px){.ssp-top{min-height:78px;padding:14px 28px}.ssp-top>.ssp-brand{margin-right:auto}.ssp-top-left{flex:1}.ssp-content{padding-top:28px}.ssp-layout{grid-template-columns:minmax(0,1.18fr) minmax(0,1fr);gap:22px}.ssp-hero{padding:29px 32px}.ssp-avatar{width:92px;height:92px;border-radius:29px}.ssp-hero-name h1{font-size:32px}.ssp-hero-name p{font-size:15px}.ssp-hero-art{width:360px;height:300px;right:25px;bottom:-10px}.ssp-hero-art>svg{width:290px;height:290px}.ssp-card{padding:24px}.ssp-sheet:not(.ssp-drawer){max-height:88dvh;margin-bottom:24px;border-radius:27px}}@media(max-width:520px){.ssp-stat-row{grid-template-columns:1fr}.ssp-stat{padding:11px}.ssp-stat small{white-space:normal}.ssp-form-grid{grid-template-columns:1fr}}@media(max-width:390px){.ssp-top{gap:10px;padding:11px 12px}.ssp-top-copy b{font-size:12px}.ssp-brand{font-size:15px}.ssp-brand i{width:21px;height:21px}.ssp-icon{width:35px;height:35px}.ssp-content{padding:15px 12px 0}.ssp-hero{padding:19px;border-radius:23px}.ssp-hero-name h1{font-size:21px}.ssp-avatar{width:65px;height:65px;border-radius:22px;font-size:23px}.ssp-identity{gap:13px}.ssp-eyebrow{font-size:8px;letter-spacing:1px}.ssp-card{padding:17px;border-radius:22px}.ssp-section-head h2{font-size:16px}.ssp-detail{padding:12px 10px}.ssp-detail b{font-size:12px}.ssp-sheet{padding-left:16px;padding-right:16px}}@media(prefers-reduced-motion:reduce){.sand-seller-profile *,.sand-seller-profile *:before,.sand-seller-profile *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
