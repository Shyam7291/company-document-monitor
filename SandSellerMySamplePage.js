import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell, Menu, X, Home, ListOrdered, ImageUp, Boxes, UserRound, Sparkles,
  Camera, Image as ImageIcon, Trash2, Pencil, IndianRupee, Clock3, CheckCircle2,
  AlertTriangle, Eye, ChevronRight, Upload, PackageOpen, Mountain, ArrowRight, Layers
} from "lucide-react";
import {
  createSellerSample,
  deleteSellerSample,
  getSellerSamples,
  updateSellerSampleDetails,
  updateSellerSampleQuantity,
  updateSellerSampleRate,
} from "../api/sellerSamplesApi";
import { getActiveMaterials } from "../api/sellerInformationApi";

/* ─── StoneRate · Sand Seller · My Samples ───────────────────────────────────
   Design matches StoneRateSandSellerHome (light theme, glass cards, pill nav)
   Unit: bucket · Sample validity: 5 days (120 hours)
   ────────────────────────────────────────────────────────────────────────── */

const SAMPLE_VALIDITY_DAYS = 5;
const SAMPLE_VALIDITY_HOURS = SAMPLE_VALIDITY_DAYS * 24;
const EXPIRING_THRESHOLD_HOURS = 24;
const UNIT = "bucket";
const UNITS = "buckets";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const REFRESH_MS = 5 * 60 * 1000;

const BLANK_FORM = {
  image: null, imageUrl: "", imageName: "", imageSize: "",
  material: "", rate: "", permitCost: "", qty: "",
  imageZoom: 1, imagePositionX: 50, imagePositionY: 50,
};

const DEMO_SELLER = { ownerName: "Ramesh Kumar", yardName: "Sri Balaji Sand Yard", sellerId: "S100241" };

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const number = value => Number(value || 0).toLocaleString("en-IN");
const money = value => `₹${number(value)}`;
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"; };
const formatDate = value => value
  ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(value)).replace(",", " at")
  : "";
const shortDate = value => (value ? value.replace(" at ", " • ") : "—");

function remainingText(hours) {
  const total = Math.max(0, Math.floor(Number(hours) || 0));
  if (total <= 0) return "Expired";
  const d = Math.floor(total / 24), h = total % 24;
  if (d > 0) return h > 0 ? `${d}d ${h}h left` : `${d}d left`;
  return `${total}h left`;
}

function readCurrentSeller() {
  try {
    const raw = window.localStorage.getItem("stonerate_current_seller") || window.localStorage.getItem("stonerate_current_user");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.role === "seller" ? parsed : null;
  } catch { return null; }
}

function hoursFromExpiry(expiresAt) {
  if (!expiresAt) return SAMPLE_VALIDITY_HOURS;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 3600000));
}

function mapApiSample(s) {
  return {
    id: s.id,
    sampleCode: s.sampleCode,
    material: s.materialName || s.material || "Sand",
    rate: Number(s.rate || 0),
    qty: Number(s.availableQuantity || 0),
    unit: s.quantityUnit || s.rateUnit || UNIT,
    permitCost: s.permitCost === null || s.permitCost === undefined ? null : Number(s.permitCost),
    uploaded: formatDate(s.uploadedAt),
    updated: s.commercialUpdatedAt ? formatDate(s.commercialUpdatedAt) : s.rateUpdatedAt ? formatDate(s.rateUpdatedAt) : "Not updated yet",
    remaining: s.hoursRemaining !== undefined && s.hoursRemaining !== null ? Number(s.hoursRemaining) : hoursFromExpiry(s.expiresAt),
    views: Number(s.viewCount || 0),
    rateUpdated: Boolean(s.rateUpdated),
    imageUrl: s.imageUrl || "",
    expiresAt: s.expiresAt,
  };
}

const statusOf = s => (Number(s.qty) === 0 ? "out" : s.remaining <= EXPIRING_THRESHOLD_HOURS ? "expiring" : "active");

/* ─── shared UI (same as home page) ────────────────────────────────────────── */
function Brand() { return <div className="brand"><i><Sparkles/></i><span>Stone</span><b>Rate</b></div>; }
function SectionTitle({ children, helper, eyebrow, aside }) {
  return <div className="section-title"><div>{eyebrow && <small>{eyebrow}</small>}<h2>{children}</h2>{helper && <p>{helper}</p>}</div>{aside}</div>;
}

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

function Sheet({ title, sub, tall = false, footer, onClose, children }) {
  return <Overlay open onClose={onClose} className="bottom-overlay">
    <section className={`sheet ${tall ? "tall" : ""}`} role="dialog" aria-modal="true">
      <i className="handle"/>
      <header><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div><div><button className="icon" onClick={onClose} aria-label="Close"><X/></button></div></header>
      <main className="sheet-body">{children}</main>
      {footer && <footer className="sheet-foot">{footer}</footer>}
    </section>
  </Overlay>;
}

function BottomNav({ callbacks }) {
  const items = [["Sample", ImageUp, callbacks.onOpenSampleUpload], ["Queue", ListOrdered, callbacks.onOpenQueue], ["Home", Home, callbacks.onOpenHome], ["My Sample", Boxes, callbacks.onOpenMySamples, true], ["Profile", UserRound, callbacks.onOpenProfile]];
  return <nav className="bottom-nav" aria-label="Primary"><div className="nav-pill">{items.map(([label, Icon, action, active]) => <button key={label} className={active ? "active" : ""} onClick={action} aria-current={active ? "page" : undefined}><span><Icon/></span><small>{label}</small></button>)}</div></nav>;
}

function Field({ label, hint, children }) {
  return <label className="field"><span className="field-label">{label}</span>{children}{hint && <small className="field-hint">{hint}</small>}</label>;
}
function Affix({ prefix, suffix, children }) {
  return <div className="affix">{prefix && <span>{prefix}</span>}{children}{suffix && <span className="suffix">{suffix}</span>}</div>;
}
function MaterialSelect({ value, onChange, materials, loading, error, onRetry, allowExisting = false }) {
  return <>
    <select value={value} disabled={loading} onChange={e => onChange(e.target.value)}>
      <option value="">{loading ? "Loading materials..." : "Select sand material"}</option>
      {allowExisting && value && !materials.includes(value) && <option value={value}>{value} (existing)</option>}
      {materials.map(name => <option key={name} value={name}>{name}</option>)}
    </select>
    {error && <small className="field-error">{error} <button type="button" onClick={onRetry}>Try again</button></small>}
  </>;
}

/* ─── overview metric (matches home MaterialCard look) ─────────────────────── */
function StatCard({ tone, icon: Icon, value, label }) {
  return <article className={`stat ${tone}`}><i><Icon/></i><strong>{number(value)}</strong><small>{label}</small><u className="glow"/></article>;
}

/* ─── sample card ──────────────────────────────────────────────────────────── */
function SampleCard({ s, onOpen }) {
  const st = statusOf(s);
  const labels = { active: "Active", expiring: remainingText(s.remaining), out: "Out of Stock" };
  const pct = Math.max(0, Math.min(100, (s.remaining / SAMPLE_VALIDITY_HOURS) * 100));
  const bar = s.remaining > 72 ? "green" : s.remaining > 24 ? "blue" : "amber";
  return <article className={`sample ${st}`}>
    <button type="button" className="sample-photo" style={s.imageUrl ? { backgroundImage: `url("${s.imageUrl}")` } : undefined} onClick={() => onOpen("image", s)} aria-label={`Open ${s.material} sample`}>
      {!s.imageUrl && <Mountain className="photo-placeholder"/>}
      <em className={`status ${st}`}>{labels[st]}</em>
      <span className="photo-code">ID {s.sampleCode || s.id}</span>
      <span className="photo-view"><Eye/>View</span>
    </button>
    <div className="sample-body">
      <header><div><small>SAND MATERIAL</small><h3>{s.material}</h3></div><i className="verified"><CheckCircle2/></i></header>
      <div className="stats3">
        <div><span>Rate</span><b>{money(s.rate)}<small>/{UNIT}</small></b></div>
        <div><span>Permit</span><b>{s.permitCost !== null ? money(s.permitCost) : "—"}</b></div>
        <div><span>Available</span><b className={Number(s.qty) === 0 ? "zero" : ""}>{number(s.qty)}<small> {UNITS}</small></b></div>
      </div>
      <div className="validity"><div><span><Clock3/>{remainingText(s.remaining)}</span><small>{SAMPLE_VALIDITY_DAYS}-day validity</small></div><p><i className={bar} style={{ width: `${pct}%` }}/></p></div>
      <div className="times"><div><span>Uploaded</span><b>{shortDate(s.uploaded)}</b></div><div><span>Last updated</span><b>{s.updated === "Not updated yet" ? s.updated : shortDate(s.updated)}</b></div></div>
      <div className="views"><Eye/>{number(s.views)} sample views</div>
      <div className="actions">
        <button type="button" className="act primary" disabled={s.rateUpdated} onClick={() => onOpen("rate", s)} title={s.rateUpdated ? `Rate already updated once during this ${SAMPLE_VALIDITY_DAYS}-day sample` : "One rate update is available"}><IndianRupee/>{s.rateUpdated ? "Rate Updated" : "Update Rate"}</button>
        <button type="button" className="act soft" onClick={() => onOpen("stock", s)}><Boxes/>Update Qty</button>
        <button type="button" className="act more" aria-label="More actions" onClick={() => onOpen("image", s)}><ChevronRight/></button>
      </div>
      {s.rateUpdated && <p className="lock-note"><CheckCircle2/>Rate update used for this {SAMPLE_VALIDITY_DAYS}-day sample</p>}
    </div>
  </article>;
}

/* ─── upload sheet (image → details → review) ──────────────────────────────── */
function UploadSheet({ step, form, setForm, uploadMode, progress, created, error, valid, materials, loadingMaterials, materialsError, onReloadMaterials, onChooseFile, onNext, onBack, onPublish, onFinish, onClose }) {
  const cameraRef = useRef(null), fileRef = useRef(null);

  if (uploadMode === "progress") {
    return <Sheet onClose={onClose} tall title="Publishing Sample" sub="Secure StoneRate upload">
      <div className="state"><span className="state-orb pulse"><Upload/></span>
        <h3>{progress < 25 ? "Preparing image..." : progress < 55 ? "Uploading sand image..." : progress < 80 ? "Saving sample details..." : "Publishing sample..."}</h3>
        <p>Your current sand inventory is being securely published.</p>
        <div className="bar"><i style={{ width: `${progress}%` }}/></div><b>{progress}%</b>
      </div>
    </Sheet>;
  }

  if (uploadMode === "success" && created) {
    return <Sheet onClose={onClose} tall title="Upload Complete">
      <div className="state"><span className="state-orb ok"><CheckCircle2/></span>
        <h3>Sample Uploaded Successfully</h3>
        <p>Your sand sample is now visible to buyers and stays active for {SAMPLE_VALIDITY_DAYS} days.</p>
        <div className="summary">
          <label>Sample ID<b>{created.sampleCode || created.id}</b></label>
          <label>Material<b>{created.material}</b></label>
          <label>Uploaded<b>{created.uploadedAt}</b></label>
          <label>Expires<b>{created.expiresAt}</b></label>
        </div>
        <div className="state-actions"><button type="button" className="btn ghost" onClick={() => onFinish(false)}>Upload Another</button><button type="button" className="btn primary" onClick={() => onFinish(true)}>View in My Samples</button></div>
      </div>
    </Sheet>;
  }

  return <Sheet onClose={onClose} tall title="Upload Sand Sample" sub={`Step ${step} of 3`}
    footer={<><button type="button" className="btn ghost" onClick={onBack}>{step === 1 ? "Cancel" : "Back"}</button><button type="button" className="btn primary" disabled={step === 3 && !valid} onClick={step === 3 ? onPublish : onNext}>{step === 3 ? <><Upload/>Upload Sample</> : <>Continue<ArrowRight/></>}</button></>}>
    <div className="steps">{[["Image", 1], ["Details", 2], ["Review", 3]].map(([label, n], i) => <React.Fragment key={n}><div className={`step ${n <= step ? "on" : ""} ${n === step ? "now" : ""}`}><span>{n < step ? <CheckCircle2/> : n}</span><small>{label}</small></div>{i < 2 && <i className={n < step ? "on" : ""}/>}</React.Fragment>)}</div>

    {step === 1 && <div className="pane">
      <h3>Add a sand image</h3><p className="lead">Take or upload a clear photo of the sand currently available.</p>
      {!form.image ? <div className="drop">
        <span className="drop-icon"><Camera/></span><b>Current sand photo</b><small>JPG, PNG or WEBP • Maximum 15 MB</small>
        <div className="drop-actions"><button type="button" className="btn primary" onClick={() => cameraRef.current?.click()}><Camera/>Take Photo</button><button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}><ImageIcon/>Choose Gallery</button></div>
        <input hidden ref={cameraRef} type="file" capture="environment" accept="image/jpeg,image/png,image/webp" onChange={e => onChooseFile(e.target.files?.[0])}/>
        <input hidden ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => onChooseFile(e.target.files?.[0])}/>
      </div> : <div className="preview">
        <div className="preview-photo" style={{ backgroundImage: `url("${form.imageUrl}")` }}/>
        <div className="preview-meta"><div><b>{form.imageName}</b><small>{form.imageSize}</small></div><button type="button" className="btn ghost small" onClick={() => setForm(f => ({ ...f, image: null, imageUrl: "", imageName: "", imageSize: "" }))}><Trash2/>Remove</button></div>
      </div>}
      <div className="info">Use daylight, keep the sand in focus, avoid shadows, and do not overlay text or logos.</div>
    </div>}

    {step === 2 && <div className="pane">
      <h3>Sample details</h3><p className="lead">Select the sand material, then enter rate per bucket, permit rate and available buckets.</p>
      <Field label="Material"><MaterialSelect value={form.material} onChange={v => setForm(f => ({ ...f, material: v }))} materials={materials} loading={loadingMaterials} error={materialsError} onRetry={onReloadMaterials}/></Field>
      <Field label={`Rate per ${UNIT}`}><Affix prefix="₹" suffix={`/ ${UNIT}`}><input type="number" inputMode="decimal" min="0" placeholder="0" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))}/></Affix></Field>
      <Field label="Permit rate" hint="Applicable government / royalty permit cost per bucket."><Affix prefix="₹" suffix={`/ ${UNIT}`}><input type="number" inputMode="decimal" min="0" placeholder="0" value={form.permitCost} onChange={e => setForm(f => ({ ...f, permitCost: e.target.value }))}/></Affix></Field>
      <Field label="Available quantity"><Affix suffix={UNITS}><input type="number" inputMode="numeric" min="0" placeholder="0" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}/></Affix></Field>
      <div className="info">This sample remains active for {SAMPLE_VALIDITY_DAYS} days ({SAMPLE_VALIDITY_HOURS} hours) after upload.</div>
    </div>}

    {step === 3 && <div className="pane">
      <h3>Review sample</h3><p className="lead">Confirm the information before publishing.</p>
      <div className="review">
        <div className="review-photo" style={{ backgroundImage: `url("${form.imageUrl}")` }}><em>{form.material || "Sand"}</em></div>
        <div className="review-grid">
          <label>Rate<b>{money(form.rate)} / {UNIT}</b></label>
          <label>Permit rate<b>{money(form.permitCost)} / {UNIT}</b></label>
          <label>Quantity<b>{number(form.qty)} {UNITS}</b></label>
          <label>Validity<b>{SAMPLE_VALIDITY_DAYS} days</b></label>
        </div>
      </div>
    </div>}

    {error && <p className="form-error"><AlertTriangle/>{error}</p>}
  </Sheet>;
}

/* ─── edit / view / delete sheets ──────────────────────────────────────────── */
function EditSheet({ sheet, selected, value, setValue, material, setMaterial, error, materials, loadingMaterials, materialsError, onReloadMaterials, onOpen, onSave, onRemove, onClose }) {
  if (!selected) return null;

  if (sheet === "image") {
    return <Sheet onClose={onClose} tall title={selected.material} sub={`Sample ID: ${selected.sampleCode || selected.id}`}>
      <div className="viewer">
        <div className="viewer-photo">{selected.imageUrl ? <img src={selected.imageUrl} alt={`${selected.material} sample`}/> : <Mountain className="photo-placeholder"/>}</div>
        <div className="viewer-meta"><div><b>{selected.material}</b><small>{number(selected.qty)} {UNITS} available · {remainingText(selected.remaining)}</small></div><strong>{money(selected.rate)}<small>/{UNIT}</small></strong></div>
        <div className="viewer-actions">
          <button type="button" onClick={() => onOpen("edit", selected)}><i className="indigo"><Pencil/></i><span>Edit Details</span><ChevronRight className="chev"/></button>
          <button type="button" onClick={() => onOpen("permit", selected)}><i className="violet"><IndianRupee/></i><span>Permit Rate</span><ChevronRight className="chev"/></button>
          <button type="button" className="danger" onClick={() => onOpen("delete", selected)}><i className="rose"><Trash2/></i><span>Delete Sample</span><ChevronRight className="chev"/></button>
        </div>
      </div>
    </Sheet>;
  }

  if (sheet === "delete") {
    return <Sheet onClose={onClose} title="Delete this sample?" sub="This action cannot be undone"
      footer={<><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button type="button" className="btn danger" onClick={onRemove}><Trash2/>Delete Sample</button></>}>
      <div className="delete-box"><span><Trash2/></span><p>The sand sample will be permanently removed. Previous order records will not be affected.</p><b>{selected.material}</b></div>
    </Sheet>;
  }

  if (sheet === "edit") {
    return <Sheet onClose={onClose} title="Edit Material Details" sub={selected.sampleCode || selected.id}
      footer={<><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button type="button" className="btn primary" onClick={onSave}>Save Details</button></>}>
      <Field label="Material"><MaterialSelect value={material} onChange={setMaterial} materials={materials} loading={loadingMaterials} error={materialsError} onRetry={onReloadMaterials} allowExisting/></Field>
      <Field label={`Permit rate per ${UNIT}`}><Affix prefix="₹" suffix={`/ ${UNIT}`}><input type="number" inputMode="decimal" min="0" value={value} onChange={e => setValue(e.target.value)}/></Affix></Field>
      <div className="info">Original upload and expiry time stay unchanged.</div>
      {error && <p className="form-error"><AlertTriangle/>{error}</p>}
    </Sheet>;
  }

  const meta = {
    rate: { title: "Update Rate", label: `New rate per ${UNIT}`, current: `${money(selected.rate)} / ${UNIT}` },
    stock: { title: "Update Quantity", label: "Available quantity", current: `${number(selected.qty)} ${UNITS}` },
    permit: { title: "Update Permit Rate", label: `New permit rate per ${UNIT}`, current: selected.permitCost !== null ? `${money(selected.permitCost)} / ${UNIT}` : "Not entered" },
  }[sheet] || { title: "", label: "", current: "" };

  return <Sheet onClose={onClose} title={meta.title} sub={selected.material}
    footer={<><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button type="button" className="btn primary" onClick={onSave}>{meta.title}</button></>}>
    <div className="current"><span>Current value</span><b>{meta.current}</b></div>
    <Field label={meta.label}><Affix prefix={sheet === "stock" ? null : "₹"} suffix={sheet === "stock" ? UNITS : `/ ${UNIT}`}><input type="number" inputMode={sheet === "stock" ? "numeric" : "decimal"} min="0" value={value} onChange={e => setValue(e.target.value)}/></Affix></Field>
    <div className="info">{sheet === "rate" ? `Rate can be updated only once during the ${SAMPLE_VALIDITY_DAYS}-day sample validity. This does not restart the validity.` : `Updating this does not restart the ${SAMPLE_VALIDITY_DAYS}-day validity.`}</div>
    {error && <p className="form-error"><AlertTriangle/>{error}</p>}
  </Sheet>;
}

/* ─── page ─────────────────────────────────────────────────────────────────── */
export default function SandSellerMySamplePage({
  seller = DEMO_SELLER, openUploadOnLoad = false, onUploadOpened = () => {},
  onOpenHome, onOpenQueue, onOpenSampleUpload, onOpenMySamples, onOpenProfile, onOpenMenu, onOpenNotifications,
  unreadNotifications = 2,
}) {
  const [samples, setSamples] = useState([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState("");
  const [sheet, setSheet] = useState(null);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(BLANK_FORM);
  const [uploadMode, setUploadMode] = useState("form");
  const [progress, setProgress] = useState(0);
  const [created, setCreated] = useState(null);
  const [value, setValue] = useState("");
  const [material, setMaterial] = useState("");
  const [error, setError] = useState("");
  const toastRef = useRef(null), progressRef = useRef(null);

  const currentSeller = useMemo(() => readCurrentSeller(), []);
  const sellerPublicId = currentSeller?.publicId || "";
  const ownerName = currentSeller?.ownerName || currentSeller?.name || seller.ownerName;
  const callbacks = { onOpenHome, onOpenQueue, onOpenSampleUpload, onOpenMySamples, onOpenProfile };

  const notify = useCallback((message, type = "success") => {
    clearTimeout(toastRef.current);
    setToast({ message, type });
    toastRef.current = setTimeout(() => setToast(null), 2600);
  }, []);
  useEffect(() => () => { clearTimeout(toastRef.current); clearInterval(progressRef.current); }, []);

  const loadMaterials = useCallback(async () => {
    try {
      setLoadingMaterials(true); setMaterialsError("");
      const result = await getActiveMaterials();
      setMaterials((Array.isArray(result?.materials) ? result.materials : []).map(x => String(x.name || "").trim()).filter(Boolean));
    } catch (e) { const m = e.message || "Unable to load materials"; setMaterialsError(m); notify(m, "error"); }
    finally { setLoadingMaterials(false); }
  }, [notify]);

  const loadSamples = useCallback(async ({ showLoading = false } = {}) => {
    if (!sellerPublicId) { setSamples([]); setLoadingSamples(false); return; }
    try {
      if (showLoading) setLoadingSamples(true);
      const result = await getSellerSamples(sellerPublicId);
      const fresh = (result.samples || []).map(mapApiSample);
      setSamples(fresh);
      setSelected(cur => (cur ? fresh.find(x => x.id === cur.id) || cur : cur));
    } catch (e) { notify(e.message || "Unable to load your sand samples", "error"); }
    finally { if (showLoading) setLoadingSamples(false); }
  }, [sellerPublicId, notify]);

  useEffect(() => { loadMaterials(); }, [loadMaterials]);
  useEffect(() => { loadSamples({ showLoading: true }); }, [loadSamples]);
  useEffect(() => {
    if (!sellerPublicId) return undefined;
    const t = window.setInterval(() => loadSamples({ showLoading: false }), REFRESH_MS);
    return () => window.clearInterval(t);
  }, [sellerPublicId, loadSamples]);
  useEffect(() => {
    const t = window.setInterval(() => setSamples(cur => cur.filter(x => !x.expiresAt || new Date(x.expiresAt).getTime() > Date.now())), 60000);
    return () => window.clearInterval(t);
  }, []);

  const sorted = useMemo(() => { const p = { expiring: 0, out: 1, active: 2 }; return [...samples].filter(s => s.remaining > 0).sort((a, b) => p[statusOf(a)] - p[statusOf(b)]); }, [samples]);
  const metric = useMemo(() => ({
    total: samples.length,
    active: samples.filter(s => statusOf(s) === "active").length,
    expiring: samples.filter(s => statusOf(s) === "expiring").length,
    out: samples.filter(s => statusOf(s) === "out").length,
  }), [samples]);
  const valid = !!(form.image && form.material && Number(form.rate) > 0 && form.permitCost !== "" && Number(form.permitCost) >= 0 && form.qty !== "" && Number(form.qty) >= 0);

  const resetUpload = useCallback(() => { clearInterval(progressRef.current); setForm(BLANK_FORM); setStep(1); setUploadMode("form"); setProgress(0); setCreated(null); setError(""); }, []);

  const open = useCallback((type, s = null) => {
    if (type === "rate" && s?.rateUpdated) { notify(`Rate can be updated only once during the ${SAMPLE_VALIDITY_DAYS}-day sample validity.`, "error"); return; }
    setSelected(s); setError("");
    if (type === "rate") setValue(String(s.rate));
    if (type === "stock") setValue(String(s.qty));
    if (type === "permit") setValue(s.permitCost === null ? "" : String(s.permitCost));
    if (type === "edit") { setMaterial(s.material); setValue(s.permitCost === null ? "" : String(s.permitCost)); }
    if (type === "upload") resetUpload();
    setSheet(type);
  }, [notify, resetUpload]);

  const close = useCallback(() => {
    if (sheet === "upload" && uploadMode === "progress") return;
    setSheet(null); setSelected(null); setError("");
  }, [sheet, uploadMode]);

  useEffect(() => { if (!openUploadOnLoad) return; resetUpload(); setSheet("upload"); onUploadOpened(); }, [openUploadOnLoad, onUploadOpened, resetUpload]);

  const chooseFile = useCallback(file => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) { notify("Use JPG, PNG or WEBP up to 15 MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = () => { setForm(f => ({ ...f, image: file, imageUrl: String(reader.result || ""), imageName: file.name, imageSize: `${(file.size / 1048576).toFixed(2)} MB` })); setError(""); };
    reader.onerror = () => notify("Unable to read the selected image", "error");
    reader.readAsDataURL(file);
  }, [notify]);

  const next = useCallback(() => {
    if (step === 1 && !form.image) { setError("Take or select a clear sand image to continue."); return; }
    if (step === 2) {
      if (!form.material) { setError("Select the sand material."); return; }
      if (!(Number(form.rate) > 0)) { setError("Rate per bucket must be greater than zero."); return; }
      if (form.permitCost === "" || Number(form.permitCost) < 0) { setError("Enter a valid permit rate (0 or more)."); return; }
      if (form.qty === "" || Number(form.qty) < 0) { setError("Enter the available quantity in buckets."); return; }
    }
    setError(""); setStep(s => Math.min(3, s + 1));
  }, [step, form]);

  const back = useCallback(() => { setError(""); if (step === 1) close(); else setStep(s => Math.max(1, s - 1)); }, [step, close]);

  const publishSample = useCallback(async () => {
    if (!valid || uploadMode === "progress") return;
    if (!sellerPublicId) { setError("Seller session not found. Please sign in again."); return; }
    setUploadMode("progress"); setProgress(12); setError("");
    clearInterval(progressRef.current);
    progressRef.current = window.setInterval(() => setProgress(p => (p < 88 ? p + 4 : p)), 220);
    try {
      const result = await createSellerSample({
        sellerPublicId, imageFile: form.image, materialName: form.material, category: form.material,
        rate: form.rate, rateUnit: UNIT, permitCost: form.permitCost, availableQuantity: form.qty, quantityUnit: UNIT,
        validityHours: SAMPLE_VALIDITY_HOURS, imageZoom: form.imageZoom, imagePositionX: form.imagePositionX, imagePositionY: form.imagePositionY,
      });
      clearInterval(progressRef.current); setProgress(100);
      const mapped = mapApiSample(result.sample);
      setCreated({ ...mapped, uploadedAt: formatDate(result.sample.uploadedAt), expiresAt: formatDate(result.sample.expiresAt) });
      setSamples(cur => [mapped, ...cur.filter(x => x.id !== mapped.id)]);
      setUploadMode("success"); notify("Sand sample uploaded successfully");
    } catch (e) {
      clearInterval(progressRef.current); setUploadMode("form"); setProgress(0);
      const m = e.message || "Unable to upload sample"; setError(m); notify(m, "error");
    }
  }, [valid, uploadMode, sellerPublicId, form, notify]);

  const finish = useCallback(closeAfter => { if (closeAfter) { setSheet(null); setCreated(null); } else resetUpload(); }, [resetUpload]);

  const save = useCallback(async () => {
    if (!selected || !sellerPublicId) return;
    try {
      let result;
      if (sheet === "rate") {
        if (selected.rateUpdated) { setError(`Rate has already been updated once for this ${SAMPLE_VALIDITY_DAYS}-day sample.`); return; }
        if (!(Number(value) > 0)) { setError("Rate must be greater than zero."); return; }
        result = await updateSellerSampleRate(selected.id, sellerPublicId, Number(value));
      } else if (sheet === "stock") {
        if (value === "" || Number(value) < 0) { setError("Quantity cannot be negative."); return; }
        result = await updateSellerSampleQuantity(selected.id, sellerPublicId, Number(value), UNIT);
      } else if (sheet === "permit" || sheet === "edit") {
        const nextMaterial = sheet === "edit" ? material : selected.material;
        if (!nextMaterial) { setError("Material is required."); return; }
        if (value === "" || Number(value) < 0) { setError("Permit rate is required and cannot be negative."); return; }
        result = await updateSellerSampleDetails(selected.id, sellerPublicId, { materialName: nextMaterial, category: nextMaterial, permitCost: Number(value), unit: UNIT });
      }
      if (result?.sample) { const mapped = mapApiSample(result.sample); setSamples(cur => cur.map(x => (x.id === mapped.id ? mapped : x))); notify(result.message || "Sample updated successfully"); }
      setSheet(null); setSelected(null);
    } catch (e) { const m = e.message || "Unable to update sample"; setError(m); notify(m, "error"); }
  }, [selected, sellerPublicId, sheet, value, material, notify]);

  const remove = useCallback(async () => {
    if (!selected || !sellerPublicId) return;
    try { await deleteSellerSample(selected.id, sellerPublicId); setSamples(cur => cur.filter(x => x.id !== selected.id)); setSheet(null); setSelected(null); notify("Sample deleted successfully"); }
    catch (e) { notify(e.message || "Unable to delete sample", "error"); }
  }, [selected, sellerPublicId, notify]);

  return <div className="app"><style>{CSS}</style>
    <div className="bg-orb o1"/><div className="bg-orb o2"/><div className="bg-orb o3"/>

    <header className="top">
      <div><button className="icon" onClick={onOpenMenu} aria-label="Open menu"><Menu/></button><div className="hello"><span>{greeting()},</span><b>{ownerName}</b></div></div>
      <Brand/>
      <button className="icon bell" onClick={onOpenNotifications} aria-label={`Open notifications, ${unreadNotifications} unread`}><Bell/>{unreadNotifications > 0 && <b>{unreadNotifications}</b>}</button>
    </header>

    <main className="content">
      {/* hero / upload CTA */}
      <section className="hero">
        <button type="button" className="hero-card" onClick={() => open("upload")}>
          <span className="hero-glow"/>
          <div className="hero-text">
            <small>{seller.yardName}</small>
            <h1>Upload a sand sample</h1>
            <p>Photo → material → rate / bucket → permit rate → buckets available.</p>
            <div className="hero-cta"><Upload/><span>Upload Sample</span><ArrowRight/></div>
          </div>
          <div className="hero-art" aria-hidden="true"><i><Camera/></i><i><Layers/></i><i><IndianRupee/></i></div>
        </button>
      </section>

      {/* overview */}
      <section>
        <SectionTitle eyebrow="Overview" aside={<span className="live"><i/>Live</span>}>Sample Summary</SectionTitle>
        <div className="stat-grid">
          <StatCard tone="c0" icon={PackageOpen} value={metric.total} label="Total"/>
          <StatCard tone="c1" icon={CheckCircle2} value={metric.active} label="Active"/>
          <StatCard tone="c2" icon={Clock3} value={metric.expiring} label="Expiring"/>
          <StatCard tone="c3" icon={AlertTriangle} value={metric.out} label="Out of Stock"/>
        </div>
      </section>

      {/* list */}
      <section>
        <SectionTitle eyebrow="My Samples" helper={`Each sample stays active for ${SAMPLE_VALIDITY_DAYS} days`} aside={<span className="count">{number(samples.length)} {samples.length === 1 ? "sample" : "samples"}</span>}>Your sand inventory</SectionTitle>
        {loadingSamples ? <div className="skeleton"><i/><i/></div>
          : sorted.length ? <div className="sample-grid">{sorted.map(s => <SampleCard key={s.id} s={s} onOpen={open}/>)}</div>
          : <div className="empty"><Boxes/><b>No samples uploaded</b><span>Take a photo of your sand, choose the material, enter rate per bucket, permit rate and available buckets.</span><button type="button" className="btn primary" onClick={() => open("upload")}><Upload/>Upload First Sample</button></div>}
      </section>
    </main>

    {toast && <div className={`toast ${toast.type}`} role="status">{toast.type === "error" ? <AlertTriangle/> : <CheckCircle2/>}{toast.message}</div>}

    {sheet === "upload" && <UploadSheet step={step} form={form} setForm={setForm} uploadMode={uploadMode} progress={progress} created={created} error={error} valid={valid} materials={materials} loadingMaterials={loadingMaterials} materialsError={materialsError} onReloadMaterials={loadMaterials} onChooseFile={chooseFile} onNext={next} onBack={back} onPublish={publishSample} onFinish={finish} onClose={close}/>}
    {sheet && sheet !== "upload" && <EditSheet sheet={sheet} selected={selected} value={value} setValue={setValue} material={material} setMaterial={setMaterial} error={error} materials={materials} loadingMaterials={loadingMaterials} materialsError={materialsError} onReloadMaterials={loadMaterials} onOpen={open} onSave={save} onRemove={remove} onClose={close}/>}

    <BottomNav callbacks={callbacks}/>
  </div>;
}

/* ─── styles (same design tokens as StoneRateSandSellerHome) ───────────────── */
const CSS_BASE = `
:root{color-scheme:light}
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;font-family:"Plus Jakarta Sans",Inter,"Segoe UI",system-ui,sans-serif;background:#eceffd;color:#1b2340;-webkit-font-smoothing:antialiased}
button,input,select{font:inherit}button{cursor:pointer}
.app{--ink:#1b2340;--muted:#6b7590;--line:rgba(120,135,180,.16);--indigo:#5b6cff;--violet:#8b5cf6;--cyan:#22c1ee;--mint:#22c58f;--amber:#f5a524;--rose:#ff6b8a;--grad:linear-gradient(135deg,#5b6cff 0%,#8b5cf6 55%,#22c1ee 100%);--card:rgba(255,255,255,.82);--shadow:0 12px 34px rgba(64,84,150,.10),0 2px 6px rgba(64,84,150,.05);position:relative;min-height:100dvh;padding-bottom:84px;overflow-x:hidden;background:linear-gradient(180deg,#eef0ff 0%,#e9edfb 40%,#e6f0fa 100%)}
.bg-orb{position:fixed;border-radius:50%;filter:blur(70px);opacity:.7;pointer-events:none;z-index:0;animation:float 14s ease-in-out infinite alternate}
.o1{width:340px;height:340px;left:-120px;top:-80px;background:radial-gradient(circle,#c3caff,transparent 70%)}
.o2{width:380px;height:380px;right:-140px;top:180px;background:radial-gradient(circle,#b9ecfb,transparent 70%);animation-delay:-5s}
.o3{width:320px;height:320px;left:30%;bottom:-120px;background:radial-gradient(circle,#dcd2ff,transparent 70%);animation-delay:-9s}
.app button:focus-visible{outline:3px solid rgba(91,108,255,.35);outline-offset:2px}

/* header (identical to home) */
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
.bell{position:relative}
.bell>b{position:absolute;right:-5px;top:-6px;min-width:18px;height:18px;padding:0 4px;display:grid;place-items:center;border:2px solid #fff;border-radius:99px;background:linear-gradient(135deg,#ff6b8a,#ff8e53);color:#fff;font-size:9px;font-weight:800;box-shadow:0 4px 10px rgba(255,107,138,.45);animation:pop .5s cubic-bezier(.2,1.4,.4,1)}

/* content + section titles */
.content{position:relative;z-index:1;max-width:1180px;margin:auto;padding:16px 12px 28px;display:flex;flex-direction:column;gap:24px}
.section-title{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:0 0 10px 2px}
.section-title small{display:inline-block;margin-bottom:4px;padding:3px 9px;border-radius:99px;background:rgba(91,108,255,.10);color:var(--indigo);font-size:9.5px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}
.section-title h2{margin:0;font-size:17px;font-weight:800;letter-spacing:-.4px;color:var(--ink)}
.section-title p{margin:3px 0 0;color:var(--muted);font-size:11.5px}
.live{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;background:rgba(34,197,143,.12);color:#0f8a63;font-size:10px;font-weight:800}
.live i{width:6px;height:6px;border-radius:50%;background:#22c58f;box-shadow:0 0 0 3px rgba(34,197,143,.2);animation:blink 1.8s ease-in-out infinite}
.count{padding:4px 10px;border-radius:99px;background:rgba(27,35,64,.06);color:#3b4468;font-size:10px;font-weight:800;white-space:nowrap}

/* hero upload card (same look as home hero) */
.hero-card{position:relative;overflow:hidden;display:flex;align-items:stretch;width:100%;min-height:160px;padding:18px 18px 16px;border:0;border-radius:24px;background:var(--grad);color:#fff;text-align:left;box-shadow:0 18px 40px rgba(91,108,255,.30);transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s}
.hero-card:hover{transform:translateY(-3px);box-shadow:0 24px 48px rgba(91,108,255,.36)}
.hero-card:active{transform:scale(.985)}
.hero-glow{position:absolute;inset:0;z-index:2;pointer-events:none;border-radius:inherit;background:radial-gradient(circle at 0% 0%,rgba(255,255,255,.22),transparent 45%),linear-gradient(180deg,rgba(24,28,62,0) 55%,rgba(24,28,62,.22) 100%)}
.hero-card:after{content:"";position:absolute;inset:0;z-index:2;border-radius:inherit;pointer-events:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 0 0 1px rgba(255,255,255,.14)}
.hero-text{position:relative;z-index:3;display:flex;flex-direction:column;align-items:flex-start;width:66%;min-width:0}
.hero-card small{display:block;font-size:10.5px;opacity:.9;letter-spacing:.8px;text-transform:uppercase;font-weight:800;text-shadow:0 1px 8px rgba(30,30,80,.35)}
.hero-card h1{margin:5px 0 4px;font-size:19px;font-weight:800;letter-spacing:-.5px;line-height:1.15;text-shadow:0 2px 12px rgba(30,30,80,.35)}
.hero-card p{margin:0 0 12px;font-size:11.5px;opacity:.92;text-shadow:0 1px 8px rgba(30,30,80,.3)}
.hero-cta{margin-top:auto;display:inline-flex;align-items:center;gap:7px;padding:9px 13px;border-radius:15px;background:rgba(255,255,255,.18);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.4);box-shadow:0 8px 22px rgba(27,35,64,.22);font-size:12px;font-weight:800}
.hero-cta svg{width:15px;height:15px}
.hero-art{position:absolute;right:14px;top:50%;z-index:3;transform:translateY(-50%);display:grid;gap:8px;pointer-events:none}
.hero-art i{width:38px;height:38px;display:grid;place-items:center;border-radius:13px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.4);backdrop-filter:blur(8px);animation:bob 4s ease-in-out infinite}
.hero-art i:nth-child(2){margin-left:22px;animation-delay:-1.3s}.hero-art i:nth-child(3){animation-delay:-2.6s}
.hero-art svg{width:17px;height:17px}

/* overview stat cards (material-card style) */
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}
.stat{position:relative;overflow:hidden;padding:12px 8px 11px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;border:1px solid rgba(255,255,255,.9);border-radius:18px;background:var(--card);backdrop-filter:blur(14px);box-shadow:var(--shadow);transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s}
.stat:hover{transform:translateY(-3px);box-shadow:0 20px 44px rgba(64,84,150,.16)}
.stat i{width:34px;height:34px;display:grid;place-items:center;border-radius:11px;color:#fff;margin-bottom:3px;box-shadow:0 8px 18px rgba(0,0,0,.12)}
.stat i svg{width:16px;height:16px}
.stat strong{font-size:19px;font-weight:900;letter-spacing:-.6px;line-height:1}
.stat small{font-size:9px;font-weight:700;color:var(--muted)}
.stat .glow{position:absolute;right:-26px;top:-26px;width:90px;height:90px;border-radius:50%;opacity:.35;filter:blur(20px);pointer-events:none}
.stat.c0 i{background:linear-gradient(135deg,#5b6cff,#8b5cf6)}.stat.c0 .glow{background:#8b5cf6}
.stat.c1 i{background:linear-gradient(135deg,#22c58f,#10b981)}.stat.c1 .glow{background:#22c58f}
.stat.c2 i{background:linear-gradient(135deg,#f5a524,#ff7a59)}.stat.c2 .glow{background:#f5a524}
.stat.c3 i{background:linear-gradient(135deg,#ff6b8a,#ff8e53)}.stat.c3 .glow{background:#ff6b8a}
`;

const CSS_CARDS = `
/* sample cards (loading-card style, photo on top) */
.sample-grid{display:grid;gap:12px}
.sample{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.9);border-radius:22px;background:var(--card);backdrop-filter:blur(14px);box-shadow:var(--shadow);transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s}
.sample:hover{transform:translateY(-4px);box-shadow:0 20px 44px rgba(64,84,150,.16)}
.sample:before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;z-index:3;background:var(--grad)}
.sample.expiring:before{background:linear-gradient(180deg,#f5a524,#ff7a59)}
.sample.out:before{background:linear-gradient(180deg,#ff6b8a,#ff8e53)}
.sample-photo{position:relative;display:block;width:100%;height:150px;padding:0;border:0;color:#fff;background:linear-gradient(135deg,#dfe4ff,#e9f6ff);background-size:cover;background-position:center;cursor:pointer}
.sample-photo:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(27,35,64,.05),transparent 40%,rgba(27,35,64,.55))}
.photo-placeholder{position:absolute;left:50%;top:50%;width:40px;height:40px;transform:translate(-50%,-50%);color:#8b96c4}
.sample-photo .status{position:absolute;z-index:2;left:14px;top:12px;padding:4px 9px;border-radius:99px;font-size:8.5px;font-weight:800;font-style:normal;letter-spacing:.4px;text-transform:uppercase;backdrop-filter:blur(8px)}
.status.active{background:rgba(34,197,143,.9);color:#fff}
.status.expiring{background:rgba(245,165,36,.92);color:#fff}
.status.out{background:rgba(255,107,138,.92);color:#fff}
.photo-code{position:absolute;z-index:2;right:12px;top:12px;padding:4px 8px;border-radius:99px;background:rgba(255,255,255,.85);color:#3b4468;font-size:8.5px;font-weight:800;letter-spacing:.3px}
.photo-view{position:absolute;z-index:2;right:12px;bottom:12px;display:inline-flex;align-items:center;gap:4px;padding:5px 9px;border-radius:99px;background:rgba(255,255,255,.9);color:var(--indigo);font-size:9.5px;font-weight:800}
.photo-view svg{width:12px;height:12px}
.sample-body{padding:13px 14px 14px 16px;display:grid;gap:11px}
.sample-body>header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.sample-body header small{display:block;font-size:9px;font-weight:800;letter-spacing:.8px;color:var(--muted)}
.sample-body header h3{margin:2px 0 0;font-size:15px;font-weight:800;letter-spacing:-.3px}
.verified{width:26px;height:26px;display:grid;place-items:center;border-radius:9px;background:rgba(34,197,143,.14);color:#0f8a63}
.verified svg{width:15px;height:15px}
.stats3{display:grid;grid-template-columns:1.1fr 1fr 1.1fr;gap:7px}
.stats3>div{padding:8px 9px;border-radius:13px;background:rgba(27,35,64,.045);border:1px solid rgba(255,255,255,.9)}
.stats3 span{display:block;font-size:8.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--muted)}
.stats3 b{display:block;margin-top:3px;font-size:13px;font-weight:900;letter-spacing:-.4px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stats3 b small{font-size:9px;font-weight:700;color:var(--muted);letter-spacing:0}
.stats3>div:nth-child(1) b{color:#4a5bff}.stats3>div:nth-child(2) b{color:#7c3aed}.stats3>div:nth-child(3) b{color:#0f8a63}
.stats3 b.zero{color:#c2274b}
.validity>div{display:flex;align-items:center;justify-content:space-between;gap:8px}
.validity span{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;color:#3b4468}
.validity span svg{width:13px;height:13px;color:var(--indigo)}
.validity small{font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--muted)}
.validity p{margin:6px 0 0;height:6px;border-radius:99px;background:rgba(27,35,64,.08);overflow:hidden}
.validity p i{display:block;height:100%;border-radius:99px;transition:width .6s ease}
.validity p i.green{background:linear-gradient(90deg,#22c58f,#10b981)}
.validity p i.blue{background:var(--grad)}
.validity p i.amber{background:linear-gradient(90deg,#f5a524,#ff7a59)}
.times{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:10px;border-top:1px dashed var(--line)}
.times span{display:block;font-size:8.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--muted)}
.times b{display:block;margin-top:2px;font-size:10px;font-weight:700;color:#3b4468}
.views{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:var(--muted)}
.views svg{width:13px;height:13px}
.actions{display:grid;grid-template-columns:1fr 1fr auto;gap:7px}
.act{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:38px;padding:0 10px;border:0;border-radius:13px;font-size:11px;font-weight:800;transition:transform .2s,box-shadow .2s,opacity .2s}
.act svg{width:14px;height:14px}
.act:active:not(:disabled){transform:scale(.97)}
.act.primary{background:var(--grad);color:#fff;box-shadow:0 10px 22px rgba(91,108,255,.28)}
.act.primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 28px rgba(91,108,255,.36)}
.act.primary:disabled{background:rgba(27,35,64,.08);color:#7a83a3;box-shadow:none;cursor:not-allowed}
.act.soft{background:rgba(91,108,255,.10);color:var(--indigo);border:1px solid rgba(91,108,255,.18)}
.act.soft:hover{background:rgba(91,108,255,.16)}
.act.more{width:38px;padding:0;background:rgba(27,35,64,.05);color:#3b4468;border:1px solid var(--line)}
.act.more svg{width:16px;height:16px}
.lock-note{display:inline-flex;align-items:center;gap:5px;margin:-3px 0 0;font-size:9.5px;font-weight:700;color:#0f8a63}
.lock-note svg{width:12px;height:12px}

/* empty / skeleton / toast */
.empty{display:grid;place-items:center;gap:6px;padding:28px 16px;border:1.5px dashed rgba(91,108,255,.25);border-radius:22px;background:rgba(255,255,255,.6);text-align:center;color:var(--muted)}
.empty>svg{width:30px;height:30px;color:var(--indigo)}
.empty b{color:var(--ink);font-size:13px}
.empty span{font-size:11px;max-width:300px;line-height:1.5}
.empty .btn{margin-top:8px}
.skeleton{display:grid;gap:12px}
.skeleton i{display:block;height:300px;border-radius:22px;background:linear-gradient(90deg,#eef1fa 25%,#f8faff 50%,#eef1fa 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
.toast{position:fixed;left:14px;right:14px;bottom:calc(92px + env(safe-area-inset-bottom));z-index:70;max-width:520px;margin:auto;display:flex;align-items:center;gap:8px;padding:12px 14px;border-radius:16px;background:#fff;border:1px solid var(--line);box-shadow:0 18px 44px rgba(64,84,150,.22);font-size:12px;font-weight:700;color:var(--ink);animation:sheet .3s cubic-bezier(.2,.8,.2,1)}
.toast svg{width:16px;height:16px;flex:none}
.toast.success{border-color:rgba(34,197,143,.35);color:#0f8a63}
.toast.error{border-color:rgba(255,107,138,.35);color:#c2274b}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:42px;padding:0 16px;border:0;border-radius:14px;font-size:12.5px;font-weight:800;transition:transform .2s,box-shadow .2s,opacity .2s}
.btn svg{width:15px;height:15px}
.btn:active:not(:disabled){transform:scale(.97)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn.small{height:32px;padding:0 10px;font-size:11px;border-radius:10px}
.btn.small svg{width:13px;height:13px}
.btn.primary{background:var(--grad);color:#fff;box-shadow:0 14px 30px rgba(91,108,255,.30)}
.btn.primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 18px 36px rgba(91,108,255,.38)}
.btn.ghost{background:rgba(91,108,255,.08);color:var(--indigo);border:1px solid rgba(91,108,255,.22)}
.btn.ghost:hover{background:rgba(91,108,255,.14)}
.btn.danger{background:linear-gradient(135deg,#ff6b8a,#ff8e53);color:#fff;box-shadow:0 12px 26px rgba(255,107,138,.32)}

/* bottom nav (identical to home) */
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
`;

const CSS_SHEETS = `
/* overlay + sheet (same as home notification sheet) */
.overlay{position:fixed;inset:0;z-index:60;display:flex;background:rgba(27,35,64,.38);backdrop-filter:blur(6px);animation:fade .25s}
.bottom-overlay{align-items:flex-end;justify-content:center}
.sheet{width:100%;max-width:640px;max-height:82dvh;display:flex;flex-direction:column;padding:10px 16px 16px;border-radius:28px 28px 0 0;background:linear-gradient(180deg,#ffffff,#f7f9ff);box-shadow:0 -20px 60px rgba(27,35,64,.22);animation:sheet .32s cubic-bezier(.2,.8,.2,1)}
.sheet.tall{height:92dvh;max-height:92dvh}
.handle{display:block;width:44px;height:5px;margin:0 auto 12px;border-radius:99px;background:#d8dded;flex:none}
.sheet>header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:12px;border-bottom:1px solid var(--line);flex:none}
.sheet>header h2{margin:0;font-size:17px;font-weight:800;letter-spacing:-.3px}
.sheet>header p{margin:2px 0 0;font-size:11px;color:var(--muted);font-weight:600}
.sheet>header div{display:flex;align-items:center;gap:8px;min-width:0}
.sheet-body{flex:1;min-height:0;overflow-y:auto;display:grid;gap:12px;padding:14px 2px 6px;align-content:start;scrollbar-width:none}
.sheet-body::-webkit-scrollbar{display:none}
.sheet-foot{flex:none;display:grid;grid-template-columns:1fr 1.4fr;gap:9px;padding-top:12px;border-top:1px solid var(--line)}

/* steps */
.steps{display:flex;align-items:flex-start;gap:6px}
.step{display:grid;justify-items:center;gap:4px;flex:none}
.step span{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;border:1px solid var(--line);background:#fff;color:#7a83a3;font-size:11px;font-weight:800;transition:background .3s,color .3s,box-shadow .3s}
.step span svg{width:14px;height:14px}
.step.on span{border-color:transparent;background:var(--grad);color:#fff;box-shadow:0 8px 18px rgba(91,108,255,.35)}
.step small{font-size:9px;font-weight:800;letter-spacing:.4px;color:var(--muted);text-transform:uppercase}
.step.now small{color:var(--indigo)}
.steps>i{flex:1;height:2px;margin-top:13px;border-radius:99px;background:rgba(27,35,64,.10);transition:background .3s}
.steps>i.on{background:var(--grad)}
.pane{display:grid;gap:12px}
.pane h3{margin:0;font-size:15px;font-weight:800;letter-spacing:-.3px}
.pane .lead{margin:-7px 0 0;font-size:11.5px;color:var(--muted);line-height:1.5}

/* drop / preview */
.drop{display:grid;justify-items:center;gap:5px;padding:24px 16px 18px;text-align:center;border:1.5px dashed rgba(91,108,255,.3);border-radius:22px;background:linear-gradient(135deg,rgba(91,108,255,.06),rgba(34,193,238,.06))}
.drop-icon{width:62px;height:62px;display:grid;place-items:center;border-radius:20px;background:var(--grad);color:#fff;box-shadow:0 14px 30px rgba(91,108,255,.30);animation:bob 4s ease-in-out infinite}
.drop-icon svg{width:26px;height:26px}
.drop b{margin-top:6px;font-size:13px;font-weight:800}
.drop small{font-size:10px;color:var(--muted);font-weight:600}
.drop-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;margin-top:10px}
.preview{overflow:hidden;border:1px solid rgba(255,255,255,.9);border-radius:22px;background:var(--card);box-shadow:var(--shadow)}
.preview-photo{aspect-ratio:1.6/1;background-size:cover;background-position:center}
.preview-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px}
.preview-meta b{display:block;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px;font-weight:800}
.preview-meta small{display:block;margin-top:2px;font-size:10px;color:var(--muted);font-weight:600}
.info{padding:10px 12px;border-radius:14px;background:rgba(91,108,255,.08);border:1px solid rgba(91,108,255,.15);color:#3b4468;font-size:10.5px;font-weight:600;line-height:1.5}

/* fields */
.field{display:grid;gap:6px}
.field-label{font-size:11px;font-weight:800;color:#3b4468}
.field-hint{font-size:9.5px;color:var(--muted);font-weight:600}
.field-error{font-size:10px;color:#c2274b;font-weight:600}
.field-error button{margin-left:4px;padding:2px 8px;border:1px solid rgba(255,107,138,.4);border-radius:99px;background:transparent;color:#c2274b;font-size:9.5px;font-weight:800}
.field input,.field select{width:100%;height:46px;padding:0 13px;border:1px solid #d8dded;border-radius:14px;background:#fff;color:var(--ink);outline:none;font-size:16px;font-weight:700;-webkit-appearance:none;appearance:none;transition:border-color .2s,box-shadow .2s}
.field select{background-image:linear-gradient(45deg,transparent 50%,#7a83a3 50%),linear-gradient(135deg,#7a83a3 50%,transparent 50%);background-position:calc(100% - 19px) 50%,calc(100% - 14px) 50%;background-size:5px 5px,5px 5px;background-repeat:no-repeat;padding-right:36px}
.field input:focus,.field select:focus{border-color:var(--indigo);box-shadow:0 0 0 3px rgba(91,108,255,.16)}
.field input::placeholder{color:#a9b0c8}
.field input[type=number]::-webkit-inner-spin-button,.field input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
.affix{display:flex;align-items:stretch;overflow:hidden;border:1px solid #d8dded;border-radius:14px;background:#fff;transition:border-color .2s,box-shadow .2s}
.affix:focus-within{border-color:var(--indigo);box-shadow:0 0 0 3px rgba(91,108,255,.16)}
.affix input{flex:1;min-width:0;border:0!important;border-radius:0!important;box-shadow:none!important}
.affix>span{display:grid;place-items:center;padding:0 13px;background:#f3f5fc;color:#3b4468;font-size:12.5px;font-weight:800;border-right:1px solid #e6e9f5}
.affix>span.suffix{border-right:0;border-left:1px solid #e6e9f5;font-size:10.5px;letter-spacing:.2px;color:var(--muted)}

/* review / summary */
.review{overflow:hidden;border:1px solid rgba(255,255,255,.9);border-radius:22px;background:var(--card);box-shadow:var(--shadow)}
.review-photo{position:relative;aspect-ratio:1.7/1;background-size:cover;background-position:center}
.review-photo em{position:absolute;left:12px;bottom:12px;padding:5px 11px;border-radius:99px;background:rgba(255,255,255,.92);color:var(--indigo);font-size:11.5px;font-weight:800;font-style:normal}
.review-grid,.summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px}
.review-grid label,.summary label{display:block;padding:9px 10px;border-radius:13px;background:rgba(27,35,64,.045);color:var(--muted);font-size:8.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;text-align:left}
.review-grid b,.summary b{display:block;margin-top:4px;color:var(--ink);font-size:12px;font-weight:800;letter-spacing:-.1px;text-transform:none;overflow:hidden;text-overflow:ellipsis}
.summary{width:100%;padding:0;margin-top:16px}

/* state boxes */
.state{display:grid;justify-items:center;text-align:center;padding:34px 6px 8px}
.state-orb{width:84px;height:84px;display:grid;place-items:center;border-radius:50%;background:var(--grad);color:#fff;box-shadow:0 0 0 12px rgba(91,108,255,.08),0 16px 36px rgba(91,108,255,.35)}
.state-orb svg{width:34px;height:34px}
.state-orb.ok{background:linear-gradient(135deg,#22c58f,#10b981);box-shadow:0 0 0 12px rgba(34,197,143,.10),0 16px 36px rgba(34,197,143,.35)}
.state-orb.pulse{animation:pulse 1.4s ease-in-out infinite}
.state h3{margin:18px 0 6px;font-size:16px;font-weight:800;letter-spacing:-.3px}
.state p{margin:0;max-width:290px;font-size:11.5px;color:var(--muted);line-height:1.55}
.state .bar{width:100%;height:7px;margin-top:22px;border-radius:99px;background:rgba(27,35,64,.08);overflow:hidden}
.state .bar i{display:block;height:100%;border-radius:99px;background:var(--grad);transition:width .3s ease}
.state>b{margin-top:8px;color:var(--indigo);font-size:12.5px;font-weight:800}
.state-actions{display:grid;grid-template-columns:1fr 1.3fr;gap:9px;width:100%;margin-top:18px}

/* viewer / current / delete */
.viewer{display:grid;gap:12px}
.viewer-photo{display:grid;place-items:center;aspect-ratio:1.25/1;overflow:hidden;border-radius:22px;background:linear-gradient(135deg,#dfe4ff,#e9f6ff);border:1px solid rgba(255,255,255,.9);box-shadow:var(--shadow);position:relative}
.viewer-photo img{width:100%;height:100%;object-fit:contain;display:block}
.viewer-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 13px;border-radius:18px;background:var(--card);border:1px solid rgba(255,255,255,.9);box-shadow:var(--shadow)}
.viewer-meta b{display:block;font-size:13.5px;font-weight:800}
.viewer-meta small{display:block;margin-top:2px;font-size:10px;color:var(--muted);font-weight:600}
.viewer-meta strong{font-size:17px;font-weight:900;letter-spacing:-.5px;color:#4a5bff;white-space:nowrap}
.viewer-meta strong small{display:inline;margin:0 0 0 1px;font-size:9.5px;color:var(--muted)}
.viewer-actions{display:grid;gap:8px}
.viewer-actions button{display:flex;align-items:center;gap:12px;width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:16px;background:#fff;color:#3b4468;font-weight:700;font-size:13px;text-align:left;transition:background .2s,transform .2s,border-color .2s}
.viewer-actions button:hover{background:rgba(91,108,255,.06);border-color:rgba(91,108,255,.2)}
.viewer-actions button span{flex:1}
.viewer-actions button i{width:36px;height:36px;flex:none;display:grid;place-items:center;border-radius:12px;color:#fff}
.viewer-actions button i svg{width:16px;height:16px}
.viewer-actions i.indigo{background:linear-gradient(135deg,#5b6cff,#22c1ee)}
.viewer-actions i.violet{background:linear-gradient(135deg,#8b5cf6,#c084fc)}
.viewer-actions i.rose{background:linear-gradient(135deg,#ff6b8a,#ff8e53)}
.viewer-actions .chev{width:16px;height:16px;opacity:.5}
.viewer-actions button.danger{color:#c2274b}
.current{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 13px;border-radius:16px;background:linear-gradient(135deg,rgba(91,108,255,.08),rgba(34,193,238,.08));border:1px solid rgba(91,108,255,.18)}
.current span{font-size:9px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--muted)}
.current b{font-size:14px;font-weight:900;letter-spacing:-.3px;color:#4a5bff}
.delete-box{display:grid;justify-items:center;gap:10px;padding:14px 8px 4px;text-align:center}
.delete-box span{width:62px;height:62px;display:grid;place-items:center;border-radius:20px;background:rgba(255,107,138,.14);color:#c2274b}
.delete-box span svg{width:26px;height:26px}
.delete-box p{margin:0;max-width:290px;font-size:11.5px;color:var(--muted);line-height:1.55}
.delete-box b{padding:6px 12px;border-radius:99px;background:rgba(255,107,138,.12);color:#c2274b;font-size:11.5px;font-weight:800}
.form-error{display:flex;align-items:center;gap:6px;margin:0;padding:10px 12px;border:1px solid rgba(255,107,138,.3);border-radius:14px;background:rgba(255,107,138,.08);color:#a8203f;font-size:11px;font-weight:600}
.form-error svg{width:14px;height:14px;flex:none}

/* responsive + motion */
@media(min-width:700px){.app{padding-bottom:36px}.top{height:80px;padding:0 24px;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}.top>.bell{justify-self:end}.hello span{font-size:11px}.hello b{font-size:14px;max-width:220px}.brand{font-size:20px}.brand i{width:26px;height:26px}.content{padding:28px 24px 44px;gap:32px}.section-title h2{font-size:21px}.hero-card{min-height:200px;padding:28px 26px 24px;border-radius:28px}.hero-text{width:60%}.hero-card h1{font-size:26px}.hero-card p{font-size:14px;margin-bottom:16px}.hero-art{right:28px}.hero-art i{width:46px;height:46px}.stat{padding:16px 12px}.stat strong{font-size:24px}.stat small{font-size:10.5px}.sample-grid{grid-template-columns:repeat(2,1fr);gap:14px}.bottom-nav{display:none}.sheet{margin-bottom:20px;border-radius:28px}.sheet.tall{height:auto;max-height:88dvh}}
@media(min-width:1000px){.sample-grid{grid-template-columns:repeat(3,1fr)}}
@media(max-width:350px){.stat-grid{grid-template-columns:repeat(2,1fr)}.stats3{grid-template-columns:1fr 1fr}.stats3>div:nth-child(3){grid-column:1/-1}.actions{grid-template-columns:1fr 1fr}.act.more{display:none}.hero-art{display:none}.hero-text{width:100%}.nav-pill button.active span{width:48px;height:48px;margin-top:-26px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@keyframes sheet{from{transform:translateY(100%)}}
@keyframes fade{from{opacity:0}}
@keyframes pop{from{transform:scale(0)}}
@keyframes shimmer{to{background-position:-200% 0}}
@keyframes float{to{transform:translate(30px,40px) scale(1.08)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes blink{0%,100%{opacity:.6}50%{opacity:1}}
`;

const CSS = CSS_BASE + CSS_CARDS + CSS_SHEETS;
