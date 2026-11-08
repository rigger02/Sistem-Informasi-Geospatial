import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertCircle, AlertTriangle, ArrowDownRight, ArrowLeft, ArrowRight,
  Bell, Building2, Check, CheckCircle2, ChevronDown, ChevronRight, ClipboardCheck,
  Cloud, Download, FileCheck2, FileImage, FileText, Filter, Gauge, Globe2, History,
  Layers3, Link2, ListChecks, LockKeyhole, LogOut, Map, MapPin, Menu, MessageSquare,
  Pencil, Plus, Radio, RefreshCw, Search, Send, Settings, Shield, ShieldCheck,
  SlidersHorizontal, Smartphone, Thermometer, Upload, User, UserCog, Users, Wifi,
  WifiOff, X, Zap, Droplets, Mountain, Clock3, Database, ExternalLink, RotateCcw,
} from 'lucide-react';
import indonesiaMap from './assets/indonesia-map.jpg';
import {
  initialSensors, demoUsers, roleNames, packageGroups, accessByRole,
  initialAssets, initialThresholds, recommendationLibrary, initialIntegrations,
  initialEvents, initialClaims, initialAssignments, initialRecommendations,
  initialSelfSurveys, initialAudit,
} from './data';
import './styles.css';
import './jasindo-theme.css';
import LegacyDashboard, { applySimulationToSensors, getSimulationImpactMap, hazardClass, scaleConfig } from './LegacyDashboard.jsx';

const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value || 0));
const compactMoney = (value) => {
  const n = Number(value || 0);
  if (n >= 1e12) return `Rp ${(n / 1e12).toFixed(2)} T`;
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)} jt`;
  return money(n);
};
const formatThousands = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseThousands = (value) => {
  return Number(String(value ?? '').replace(/\D/g, '')) || 0;
};
const today = () => new Date().toISOString().slice(0, 10);
const stamp = () => new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'medium' });
const idFor = (prefix) => `${prefix}-${Date.now().toString().slice(-6)}`;
const riskBand = (score) => Number(score) >= 70 ? 'Tinggi' : Number(score) >= 40 ? 'Menengah' : 'Rendah';
const riskTone = (score) => Number(score) >= 70 ? 'danger' : Number(score) >= 40 ? 'warning' : 'success';
const assetById = (assets, id) => assets.find((a) => a.id === id);
function sensorForAsset(sensors, asset) {
  if (!asset) return null;
  const exact = sensors.find((sensor) => sensor.id === asset.sensorId && sensor.area === asset.province);
  return exact || sensors.find((sensor) => sensor.area === asset.province) || null;
}
const fmtDate = (date) => date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const provinceNeighbours = {
  Aceh: ['Sumatera Utara'],
  'Sumatera Utara': ['Aceh', 'Sumatera Barat', 'Riau'],
  'Sumatera Barat': ['Sumatera Utara', 'Riau', 'Jambi'],
  Riau: ['Sumatera Utara', 'Sumatera Barat', 'Jambi', 'Kepulauan Riau'],
  Jambi: ['Riau', 'Sumatera Barat', 'Sumatera Selatan'],
  'Sumatera Selatan': ['Jambi', 'Lampung', 'Kepulauan Bangka Belitung', 'Bengkulu'],
  Bengkulu: ['Sumatera Barat', 'Jambi', 'Sumatera Selatan'],
  'Kepulauan Bangka Belitung': ['Sumatera Selatan'],
  Lampung: ['Sumatera Selatan', 'Banten'],
  Banten: ['Lampung', 'DKI Jakarta', 'Jawa Barat'],
  'DKI Jakarta': ['Banten', 'Jawa Barat'],
  'Jawa Barat': ['Banten', 'DKI Jakarta', 'Jawa Tengah'],
  'Jawa Tengah': ['Jawa Barat', 'DI Yogyakarta', 'Jawa Timur'],
  'DI Yogyakarta': ['Jawa Tengah', 'Jawa Timur'],
  'Jawa Timur': ['Jawa Tengah', 'DI Yogyakarta', 'Bali'],
  Bali: ['Jawa Timur', 'Nusa Tenggara Barat'],
  'Nusa Tenggara Barat': ['Bali', 'Nusa Tenggara Timur'],
  'Nusa Tenggara Timur': ['Nusa Tenggara Barat'],
  'Kalimantan Barat': ['Kalimantan Tengah'],
  'Kalimantan Tengah': ['Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Timur'],
  'Kalimantan Selatan': ['Kalimantan Tengah', 'Kalimantan Timur'],
  'Kalimantan Timur': ['Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Utara'],
  'Kalimantan Utara': ['Kalimantan Timur'],
  'Sulawesi Utara': ['Gorontalo'],
  Gorontalo: ['Sulawesi Utara', 'Sulawesi Tengah'],
  'Sulawesi Tengah': ['Gorontalo', 'Sulawesi Selatan', 'Sulawesi Tenggara'],
  'Sulawesi Selatan': ['Sulawesi Tengah', 'Sulawesi Tenggara', 'Sulawesi Barat'],
  'Sulawesi Barat': ['Sulawesi Selatan', 'Sulawesi Tengah'],
  'Sulawesi Tenggara': ['Sulawesi Tengah', 'Sulawesi Selatan'],
  'Maluku Utara': ['Maluku'],
  Maluku: ['Maluku Utara'],
  'Papua Barat': ['Papua Barat Daya', 'Papua Tengah'],
  'Papua Barat Daya': ['Papua Barat'],
  'Papua Tengah': ['Papua Barat', 'Papua', 'Papua Pegunungan'],
  'Papua Pegunungan': ['Papua Tengah', 'Papua', 'Papua Selatan'],
  'Papua Selatan': ['Papua', 'Papua Pegunungan'],
  Papua: ['Papua Barat', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan'],
};


const demoCodeByUserId = { 'usr-re':'RE', 'usr-uw':'UW', 'usr-claim':'CO', 'usr-surveyor':'SV', 'usr-adjuster':'ADJ', 'usr-insured':'TC', 'usr-admin':'SA' };
const STORAGE_PREFIX = 'jasindo-geospatial-demo-';
const LEGACY_STORAGE_PREFIX = 'prime-prototype-';

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
      ?? localStorage.getItem(`${LEGACY_STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (key === 'users' && Array.isArray(parsed)) {
      return parsed.map((user) => ({ ...user, username: demoCodeByUserId[user.id] || user.username }));
    }
    return parsed;
  } catch {
    return fallback;
  }
}

const DEMO_BASELINE_VERSION = '2026-11-02-papua-kalteng-seed-v7';
const DEFAULT_ALERTS = [];

function migrateDemoBaseline() {
  try {
    if (localStorage.getItem('jasindo-geospatial-demo-baseline') === DEMO_BASELINE_VERSION) return;
    const keepAssetIds = new Set(['AST-001', 'AST-002', 'AST-003', 'AST-006', 'AST-009']);
    const seedEventIds = new Set(['EVT-2026-018']);
    const seedAlertIds = new Set(['ALT-2026-018']);
    const seedClaimIds = new Set(['CLM-2026-007']);
    const readArray = (key) => {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`) ?? localStorage.getItem(`${LEGACY_STORAGE_PREFIX}${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    };
    const writeArray = (key, value) => localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));

    // Keep only the five agreed demo objects, in a stable order, while preserving user edits.
    const oldAssets = readArray('assets');
    if (oldAssets) {
      const byId = new Map(oldAssets.filter((asset) => keepAssetIds.has(asset.id)).map((asset) => [asset.id, asset]));
      const migratedAssets = initialAssets.map((seed) => ({ ...seed, ...(byId.get(seed.id) || {}), id:seed.id, sensorId:seed.sensorId }));
      writeArray('assets', migratedAssets);
    }

    // Map older sensor IDs to the current province IDs without losing telemetry/history.
    const oldSensors = readArray('sensors');
    if (oldSensors) {
      const byArea = new Map(oldSensors.map((sensor) => [sensor.area, sensor]));
      const migratedSensors = initialSensors.map((seed) => {
        const old = byArea.get(seed.area) || oldSensors.find((sensor) => sensor.id === seed.id);
        return {
          ...seed,
          ...(old || {}),
          id:seed.id,
          name:seed.name,
          area:seed.area,
          x:seed.x,
          y:seed.y,
          online:['Aceh', 'DKI Jakarta'].includes(seed.area) ? false : (old?.online ?? seed.online),
        };
      });
      writeArray('sensors', migratedSensors);
    }

    const oldEvents = readArray('events');
    if (oldEvents) {
      const migratedEvents = oldEvents
        .filter((event) => !seedEventIds.has(event.id))
        .map((event) => ({ ...event, impactedAssetIds:(event.impactedAssetIds || []).filter((id) => keepAssetIds.has(id)) }));
      writeArray('events', migratedEvents);
    }

    const assetLinkedKeys = ['claims', 'assignments', 'recommendations', 'self-surveys', 'alerts', 'decisions', 'rapor'];
    assetLinkedKeys.forEach((key) => {
      const rows = readArray(key);
      if (!rows) return;
      const migratedRows = rows.filter((row) => {
        if (seedAlertIds.has(row.id) || seedClaimIds.has(row.id)) return false;
        if (row.eventId && seedEventIds.has(row.eventId)) return false;
        return !row.assetId || keepAssetIds.has(row.assetId);
      });
      writeArray(key, migratedRows);
    });

    localStorage.setItem('jasindo-geospatial-demo-baseline', DEMO_BASELINE_VERSION);
  } catch {
    // The prototype remains usable with its imported seed data if browser storage is unavailable.
  }
}

const landingPageForRole = (role) => {
  const roleCases = accessByRole[role] || [];
  return roleCases.includes('UC-05') ? 'UC-05' : (roleCases[0] || 'UC-02');
};

function useDemoState(key, fallback) {
  const [value, setValue] = useState(() => loadStored(key, fallback));
  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value)); } catch { /* storage may be unavailable */ }
  }, [key, value]);
  return [value, setValue];
}

function exportCsv(filename, rows) {
  const keys = Object.keys(rows[0] || {});
  const csv = [keys.join(','), ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function getAssetScore(asset, sensors) {
  const sensor = sensorForAsset(sensors, asset);
  const sensorRisk = sensor && !sensor.online ? 68 : sensor ? Math.min(100, Math.round(((sensor.base?.mmi || 2) * 5) + ((sensor.base?.water || 0.2) * 9) + ((sensor.base?.vei || 0) * 6))) : 48;
  const history = Number(asset.claimHistory || 0);
  const hazard = Number(asset.hazardBase || 40);
  const score = Math.round((hazard * 0.55) + (history * 0.25) + (sensorRisk * 0.2));
  return { score: Math.min(100, Math.max(0, score)), hazard, history, sensorRisk };
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const ok = onLogin(username.trim(), password);
    if (!ok) setError('Username tidak dikenal, akun tidak aktif, atau password belum diisi.');
  };
  return <main className="login-screen jasindo-login-screen">
    <section className="login-brand-panel">
      <div className="jasindo-login-brand"><span className="brand-icon"><Globe2 size={21} /></span><span><b>JASINDO</b><small>Sistem Informasi Geospasial</small></span></div>
      <div className="jasindo-login-title"><h1>JASINDO</h1><p>Sistem Informasi Geospasial</p></div>
      <div className="login-footer-note">PT Asuransi Jasa Indonesia</div>
    </section>
    <section className="login-form-panel">
      <form className="login-form" onSubmit={submit}>
        <span className="eyebrow">AKSES PENGGUNA</span>
        <h2>Masuk ke sistem</h2>
        <p className="muted">Masukkan username dan password.</p>
        <label className="field-label">Username
          <input value={username} onChange={(e) => { setUsername(e.target.value.toUpperCase()); setError(''); }} autoCapitalize="characters" autoComplete="username" placeholder="Masukan Username" required />
        </label>
        {/* <div className="actor-code-list"><span><b>RE</b> Risk Engineering</span><span><b>UW</b> Underwriter</span><span><b>CO</b> Claim Officer</span><span><b>SV</b> Surveyor</span><span><b>ADJ</b> Adjuster</span><span><b>TC</b> Tertanggung</span><span><b>SA</b> System Administrator</span></div> */}
        <label className="field-label">Password
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} autoComplete="current-password" placeholder="Masukkan password" required />
        </label>
        {error && <div className="inline-error"><AlertCircle size={15} />{error}</div>}
        <button className="btn primary wide" type="submit">Masuk</button>
      </form>
    </section>
  </main>;
}

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? 'compact' : ''}`}><span className="brand-icon"><Globe2 size={18} /></span><span><b>JASINDO</b><small>Sistem Informasi Geospasial</small></span></div>;
}

function Status({ children, tone = 'neutral', dot = false }) {
  return <span className={`status status-${tone}`}>{dot && <i />}{children}</span>;
}

function Button({ children, variant = 'secondary', size = '', onClick, type = 'button', disabled = false, title }) {
  return <button type={type} title={title} disabled={disabled} className={`btn ${variant} ${size}`} onClick={onClick}>{children}</button>;
}

function PageTitle({ eyebrow, title, description, action }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="page-title-action">{action}</div>}</div>;
}

function Kpi({ icon: Icon, label, value, hint, tone = 'blue' }) {
  return <div className="kpi-card"><span className={`kpi-icon ${tone}`}><Icon size={19} /></span><div><small>{label}</small><strong>{value}</strong>{hint && <span>{hint}</span>}</div></div>;
}

function Card({ title, subtitle, action, children, className = '' }) {
  return <section className={`card ${className}`}><div className="card-heading"><div>{title && <h3>{title}</h3>}{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}

function Modal({ title, subtitle, onClose, children, size = 'medium' }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className={`modal modal-${size}`} role="dialog" aria-modal="true"><header className="modal-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Tutup"><X size={18} /></button></header>{children}</section>
  </div>;
}

function FormField({ label, children, hint, required = false }) {
  return <label className="form-field"><span>{label}{required && <b className="required">*</b>}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Empty({ title, description }) {
  return <div className="empty-state"><span><FileText size={22} /></span><b>{title}</b><p>{description}</p></div>;
}

function DataTable({ columns, children }) {
  return <div className="table-wrap"><table><thead><tr>{columns.map((col) => <th key={col}>{col}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function PackageSidebar({ activePage, onNavigate, user, users, allowed, collapsed, setCollapsed, onSwitch, onLogout }) {
  const [accountOpen, setAccountOpen] = useState(false);
  return <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <div className="sidebar-head"><Brand compact={collapsed} /><button className="icon-button sidebar-collapse" onClick={() => setCollapsed(!collapsed)} title="Sembunyikan menu"><Menu size={17} /></button></div>
    <div className="sidebar-scroll">
      <div className="nav-section-label">WORKSPACE</div>
      {packageGroups.map((group) => {
        const cases = group.cases.filter((c) => allowed.includes(c.id));
        if (!cases.length) return null;
        return <div className="nav-group" key={group.id}>
          <div className="nav-group-title">{group.label}</div>
          {cases.map((uc) => <button key={uc.id} className={`nav-item ${activePage === uc.id ? 'active' : ''}`} onClick={() => onNavigate(uc.id)}><span className="nav-id">{uc.id.replace('UC-', '')}</span><span>{uc.label}</span></button>)}
        </div>;
      })}
    </div>
    <div className="sidebar-user-wrap">
      <button className={`sidebar-user ${accountOpen ? 'open' : ''}`} onClick={() => setAccountOpen(!accountOpen)}>
        <span className="avatar">{user.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>
        <span className="user-meta"><b>{user.name}</b><small>{user.roleLabel}</small></span><ChevronDown size={15} />
      </button>
      {accountOpen && <div className="account-menu">
        <div className="account-menu-title">Ganti akun demo</div>
        {users.filter((u) => u.active).map((u) => <button key={u.id} onClick={() => { onSwitch(u); setAccountOpen(false); }} className={u.id === user.id ? 'current' : ''}><span><b className="account-code">{u.username}</b> · {u.roleLabel}</span>{u.id === user.id && <Check size={14} />}</button>)}
        <button className="logout-menu" onClick={onLogout}><LogOut size={14} /> Keluar</button>
      </div>}
    </div>
  </aside>;
}

function MobileNav({ open, onClose, onNavigate, user, users, allowed, onSwitch, onLogout }) {
  if (!open) return null;
  return <div className="mobile-menu-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <nav className="mobile-menu-panel" aria-label="Navigasi utama">
      <div className="mobile-menu-head"><Brand /><button className="icon-button" onClick={onClose} aria-label="Tutup menu"><X size={18} /></button></div>
      <div className="mobile-menu-scroll">
        {packageGroups.map((group) => {
          const cases = group.cases.filter((c) => allowed.includes(c.id));
          if (!cases.length) return null;
          return <div className="nav-group" key={group.id}><div className="nav-group-title">{group.label}</div>{cases.map((uc) => <button className="nav-item" key={uc.id} onClick={() => { onNavigate(uc.id); onClose(); }}><span className="nav-id">{uc.id.replace('UC-','')}</span><span>{uc.label}</span></button>)}</div>;
        })}
      </div>
      <div className="mobile-account-list"><b>Ganti akun demo</b>{users.filter((u) => u.active).map((u) => <button key={u.id} className={u.id === user.id ? 'current' : ''} onClick={() => { onSwitch(u); onClose(); }}><span>{u.name}<small>{u.username} · {u.roleLabel}</small></span>{u.id === user.id && <Check size={15} />}</button>)}<button className="mobile-logout" onClick={() => { onLogout(); onClose(); }}><LogOut size={15} /> Keluar</button></div>
    </nav>
  </div>;
}

function HomePage({ user, assets, sensors, alerts, assignments, recommendations, onNavigate }) {
  const visibleAssets = user.role === 'insured' ? assets.filter((a) => a.insuredId === user.insuredId) : assets;
  const visibleTasks = user.role === 'surveyor' || user.role === 'adjuster' ? assignments.filter((t) => t.assignedTo === user.id) : assignments;
  const activeAlerts = alerts.filter((a) => a.status !== 'Selesai');
  const topAssets = [...visibleAssets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  const quickCases = packageGroups.flatMap((g) => g.cases).filter((c) => accessByRole[user.role]?.includes(c.id)).slice(0, 4);
  return <>
    <PageTitle eyebrow="WORKSPACE / RINGKASAN" title={`Selamat datang, ${user.name.split(' ')[0]}`} description="Ringkasan pekerjaan dan kondisi portofolio sesuai peran akses Anda." action={<Status tone="success" dot>Prototype aktif</Status>} />
    <div className="kpi-grid">
      <Kpi icon={Building2} label={user.role === 'insured' ? 'Objek pertanggungan saya' : 'Objek pertanggungan'} value={visibleAssets.length} hint="Data demo polis Property, Engineering, Energy" />
      <Kpi icon={Activity} label="Risiko tinggi" value={visibleAssets.filter((a) => a.riskScore >= 70).length} hint="Perlu ditinjau" tone="red" />
      <Kpi icon={Bell} label="Alert aktif" value={user.role === 'insured' ? activeAlerts.filter((a) => visibleAssets.some((x) => x.id === a.assetId)).length : activeAlerts.length} hint="Menunggu tindak lanjut" tone="orange" />
      <Kpi icon={ClipboardCheck} label="Penugasan / pekerjaan" value={visibleTasks.length} hint="Survei dan adjustment" tone="green" />
    </div>
    <div className="home-grid">
      <Card title="Akses cepat" subtitle="Use case yang tersedia untuk role Anda.">
        <div className="quick-grid">{quickCases.map((c) => <button className="quick-link" key={c.id} onClick={() => onNavigate(c.id)}><span className="quick-uc">{c.id}</span><b>{c.label}</b><small>{c.description}</small><ArrowRight size={16} /></button>)}</div>
      </Card>
      <Card title="Perlu perhatian" subtitle="Objek dengan skor risiko tertinggi.">
        <div className="attention-list">{topAssets.map((asset) => <button key={asset.id} className="attention-item" onClick={() => onNavigate('UC-03')}><span className={`risk-score-mini ${riskTone(asset.riskScore)}`}>{asset.riskScore}</span><span><b>{asset.name}</b><small>{asset.province} · {asset.policyNo}</small></span><Status tone={riskTone(asset.riskScore)}>{riskBand(asset.riskScore)}</Status></button>)}</div>
      </Card>
    </div>
    <div className="home-grid lower">
      <Card title="Status perangkat IoT" subtitle="Ringkasan koneksi perangkat simulasi." action={<Button onClick={() => onNavigate('UC-06')}>Kelola sensor <ArrowRight size={14} /></Button>}>
        <div className="device-summary"><div><b>{sensors.filter((s) => s.online).length}</b><small>Online</small></div><div><b>{sensors.filter((s) => !s.online).length}</b><small>Offline</small></div><div><b>{sensors.length}</b><small>Terdaftar</small></div></div>
        <div className="progress-track"><i style={{ width: `${(sensors.filter((s) => s.online).length / Math.max(sensors.length, 1)) * 100}%` }} /></div>
      </Card>
      <Card title="Rekomendasi mitigasi" subtitle="Tindak lanjut dari Risk Engineering." action={<Button onClick={() => onNavigate('UC-09')}>Buka modul <ArrowRight size={14} /></Button>}>
        {recommendations.filter((r) => r.status !== 'Selesai').slice(0, 3).map((r) => <div className="simple-row" key={r.id}><span className="simple-icon"><Shield size={15} /></span><span><b>{r.title}</b><small>{assetById(assets, r.assetId)?.name || r.assetId}</small></span><Status tone="warning">{r.status}</Status></div>)}
        {!recommendations.some((r) => r.status !== 'Selesai') && <Empty title="Tidak ada rekomendasi aktif" description="Rekomendasi mitigasi yang ditetapkan akan muncul di sini." />}
      </Card>
    </div>
  </>;
}

function UC01Page({ assets, sensors, users, onSaveAsset, onUploadDataset, datasetLogs, onSyncCore }) {
  const insuredUsers = (users || []).filter((u, index, list) => {
    const insuredId = String(u.insuredId || '').trim();
    return u.role === 'insured' && u.active !== false && insuredId &&
      list.findIndex((item) => item.role === 'insured' && String(item.insuredId || '').trim() === insuredId) === index;
  });
  const [search, setSearch] = useState('');
  const [line, setLine] = useState('Semua');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [datasetName, setDatasetName] = useState('');
  const [geoChecked, setGeoChecked] = useState(false);
  const [geoAttempted, setGeoAttempted] = useState(false);
  const [geoMessage, setGeoMessage] = useState(
  'Proses alamat terlebih dahulu. Latitude dan longitude bersifat opsional; posisi marker mengikuti sensor provinsi.'
);
  const [form, setForm] = useState({ name:'', policyNo:'', insured:'', insuredId:'', productLine:'Property', province:'Jawa Barat', city:'', address:'', sumInsured:'', sensorId:'', latitude:'', longitude:'', notes:'' });
  const filtered = assets.filter((a) => (line === 'Semua' || a.productLine === line) && `${a.name} ${a.policyNo} ${a.insured} ${a.province}`.toLowerCase().includes(search.toLowerCase()));
  const openEdit = (asset = null) => {
    setEditing(asset);
    setGeoChecked(Boolean(asset?.locationVerified));
    setGeoAttempted(Boolean(asset?.locationVerified || (asset?.latitude != null && asset?.longitude != null)));
    setGeoMessage(asset?.locationVerified ? 'Lokasi sudah berstatus terverifikasi. Perubahan alamat memerlukan verifikasi ulang.' : 'Alamat perlu diproses dan koordinat perlu dikonfirmasi.');
    setForm(asset ? { ...asset, latitude:asset.latitude == null ? '' : String(asset.latitude), longitude:asset.longitude == null ? '' : String(asset.longitude), sumInsured:String(asset.sumInsured) } : { name:'', policyNo:'', insured:'', insuredId:'', productLine:'Property', province:'Jawa Barat', city:'', address:'', sumInsured:'', sensorId:'', latitude:'', longitude:'', notes:'' });
    setModal(true);
  };
  
  const submit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.policyNo.trim() ||
      !String(form.insuredId || '').trim() ||
      !String(form.insured || '').trim() ||
      !form.address.trim() ||
      !form.sumInsured
    ) {
      return;
    }

    const hasLatitude = String(form.latitude).trim() !== '';
    const hasLongitude = String(form.longitude).trim() !== '';

    // Latitude dan longitude harus diisi berpasangan.
    if (hasLatitude !== hasLongitude) {
      setGeoChecked(false);
      setGeoMessage(
        'Isi latitude dan longitude sekaligus, atau kosongkan keduanya karena koordinat manual bersifat opsional.'
      );
      return;
    }

    const provinceSensor = sensors.find(
      (sensor) => sensor.area === form.province
    );

    const linkedSensor = sensors.find(
      (sensor) =>
        sensor.id === form.sensorId &&
        sensor.area === form.province
    );

    const hasManualCoordinates = hasLatitude && hasLongitude;

    onSaveAsset({
      ...form,
      id: editing?.id || idFor('AST'),

      // Koordinat boleh kosong.
      latitude: hasManualCoordinates ? Number(form.latitude) : null,
      longitude: hasManualCoordinates ? Number(form.longitude) : null,

      // Catat tingkat presisi lokasi.
      locationPrecision: hasManualCoordinates
        ? 'coordinate'
        : 'province',

      sumInsured: parseThousands(form.sumInsured),

      locationVerified: geoChecked,
      status: geoChecked ? 'Aktif' : 'Perlu Verifikasi',

      riskScore: editing?.riskScore ?? 45,
      hazardBase: editing?.hazardBase ?? 48,
      claimHistory: editing?.claimHistory ?? 12,

      // Sensor otomatis mengikuti provinsi objek.
      sensorId: linkedSensor?.id || provinceSensor?.id || '',

      lastAssessment: editing?.lastAssessment || today(),
    });

    setModal(false);
  };


  const geo = () => {
    const ok = form.address.trim().length >= 10;

    setGeoAttempted(ok);
    setGeoChecked(false);

    setGeoMessage(
      ok
        ? 'Alamat berhasil diproses pada simulasi. Isi kedua koordinat jika tersedia, atau biarkan kosong lalu konfirmasi lokasi berdasarkan provinsi.'
        : 'Geocoding simulasi gagal: alamat terlalu singkat. Lengkapi alamat minimal 10 karakter.'
    );
  };


  const confirmCoordinates = () => {
    if (form.address.trim().length < 10) {
      setGeoAttempted(false);
      setGeoChecked(false);

      setGeoMessage(
        'Lengkapi alamat minimal 10 karakter, lalu klik Proses alamat terlebih dahulu.'
      );

      return;
    }

    const hasLatitude = String(form.latitude).trim() !== '';
    const hasLongitude = String(form.longitude).trim() !== '';

    if (hasLatitude !== hasLongitude) {
      setGeoChecked(false);

      setGeoMessage(
        'Isi latitude dan longitude sekaligus, atau kosongkan keduanya.'
      );

      return;
    }

    // Jika koordinat kosong, konfirmasi lokasi menggunakan provinsi.
    if (!hasLatitude && !hasLongitude) {
      setGeoAttempted(true);
      setGeoChecked(true);

      setGeoMessage(
        `Lokasi dikonfirmasi pada tingkat provinsi ${form.province}. Marker peta akan ditempatkan otomatis mengelilingi sensor ${form.province}.`
      );

      return;
    }

    const lat = Number(form.latitude);
    const lon = Number(form.longitude);

    const valid =
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180;

    if (!valid) {
      setGeoChecked(false);

      setGeoMessage(
        'Koordinat tidak valid. Lintang harus −90 sampai 90 dan bujur −180 sampai 180.'
      );

      return;
    }

    setGeoAttempted(true);
    setGeoChecked(true);

    setGeoMessage(
      'Koordinat manual berhasil dikonfirmasi dan disimpan sebagai informasi lokasi. Posisi marker pada peta prototype tetap mengikuti sensor provinsi.'
    );
  };

  return <>
    <PageTitle eyebrow="UC-01 · DATA & PEMETAAN GEOSPASIAL" title="Data Objek & Lokasi Pertanggungan" description="Pemeliharaan data polis, objek pertanggungan, multi-lokasi, koordinat, geocoding, dan dataset geospasial." action={<div className="page-action-group"><Button onClick={onSyncCore}><RefreshCw size={14} /> Tarik data sistem inti</Button><Button variant="primary" onClick={() => openEdit()}><Plus size={15} /> Tambah objek</Button></div>} />
    <div className="kpi-grid compact-kpis"><Kpi icon={Building2} label="Objek terdaftar" value={assets.length} /><Kpi icon={ShieldCheck} label="Lokasi terverifikasi" value={assets.filter((a) => a.locationVerified).length} tone="green" /><Kpi icon={AlertTriangle} label="Perlu verifikasi" value={assets.filter((a) => !a.locationVerified).length} tone="orange" /><Kpi icon={Layers3} label="Polis unik" value={new Set(assets.map((a) => a.policyNo)).size} tone="purple" /></div>
    <div className="note-box uc01-example-note"><Building2 size={16} /><span>Data demo awal dibatasi menjadi 5 objek: Hotel Banda Aceh, Gudang Logistik Medan, Pabrik Semen Padang, PLTGU Cilegon, dan Pusat Distribusi Bekasi. Sensor otomatis mengikuti provinsi objek; contoh pengisian objek baru tersedia di panduan demo.</span></div>
    <Card title="Daftar objek pertanggungan" subtitle="Satu nomor polis dapat memiliki lebih dari satu lokasi objek.">
      <div className="toolbar-row"><div className="search-control"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari objek, polis, tertanggung, wilayah..." /></div><select className="toolbar-select" value={line} onChange={(e) => setLine(e.target.value)}><option>Semua</option>{['Property','Engineering','Energy Onshore','Energy Offshore'].map((x) => <option key={x}>{x}</option>)}</select><Button onClick={() => exportCsv('data-objek-jasindo.csv', filtered.map(({ id,name,policyNo,insured,productLine,province,city,sumInsured,riskScore,locationVerified }) => ({id,name,policyNo,insured,productLine,province,city,sumInsured,riskScore,locationVerified}))) }><Download size={14} /> Ekspor CSV</Button></div>
      <DataTable columns={['Objek / Polis','Tertanggung','Lini Produk','Lokasi','Nilai Pertanggungan','Status Lokasi','Aksi']}>
        {filtered.map((a) => <tr key={a.id}><td><b>{a.name}</b><small className="cell-sub">{a.id} · {a.policyNo}</small></td><td>{a.insured}</td><td>{a.productLine}</td><td>{a.city}, {a.province}<small className="cell-sub">{a.address}</small></td><td>{compactMoney(a.sumInsured)}</td><td><Status tone={a.locationVerified ? 'success' : 'warning'} dot>{a.locationVerified ? 'Terverifikasi' : 'Perlu Verifikasi'}</Status></td><td><Button size="small" onClick={() => openEdit(a)}><Pencil size={13} /> Ubah</Button></td></tr>)}
      </DataTable>
      {!filtered.length && <Empty title="Objek tidak ditemukan" description="Ubah kata kunci atau filter lini produk." />}
    </Card>
    <div className="two-col-grid">
      <Card title="Dataset geospasial" subtitle="Unggah dataset pendukung sebagai layer peta.">
        <div className="upload-box"><Upload size={22} /><b>Pilih dataset</b><small>Format demo yang diterima: GeoJSON, JSON, CSV, ZIP.</small><input type="file" accept=".geojson,.json,.csv,.zip" onChange={(e) => setDatasetName(e.target.files?.[0]?.name || '')} /><Button variant="primary" disabled={!datasetName} onClick={() => { onUploadDataset(datasetName); setDatasetName(''); }}>Validasi & simpan dataset</Button>{datasetName && <span className="file-selected">{datasetName}</span>}</div>
        {datasetLogs.slice(0, 4).map((d) => <div className="simple-row" key={d.id}><span className="simple-icon"><FileImage size={15} /></span><span><b>{d.name}</b><small>{d.detail}</small></span><Status tone={d.ok ? 'success' : 'danger'}>{d.ok ? 'Valid' : 'Ditolak'}</Status></div>)}
      </Card>
      <Card title="Alur geocoding & verifikasi" subtitle="Langkah yang harus dilakukan sebelum objek digunakan untuk analisis risiko.">
        <ol className="process-list"><li><b>Cari objek</b><small>Gunakan nomor polis, tertanggung, atau wilayah.</small></li><li><b>Lengkapi alamat lokasi</b><small>Alamat diproses melalui simulasi geocoding.</small></li><li><b>Verifikasi koordinat</b><small>Risk Engineering mengonfirmasi titik lokasi pada peta.</small></li><li><b>Simpan objek</b><small>Objek berstatus terverifikasi tersedia untuk analisis risiko.</small></li></ol>
      </Card>
    </div>
    {modal && <Modal title={editing ? 'Perbarui objek pertanggungan' : 'Tambah objek pertanggungan'} subtitle="Lengkapi identitas polis dan alamat lokasi objek." onClose={() => setModal(false)} size="large"><form className="form-grid" onSubmit={submit}>
      <FormField label="Nama objek" required><input value={form.name} onChange={(e) => setForm({ ...form, name:e.target.value })} required /></FormField>
      <FormField label="Nomor polis" required><input value={form.policyNo} onChange={(e) => setForm({ ...form, policyNo:e.target.value })} required /></FormField>
      <FormField label="Pilih akun tertanggung" required>
        <select
          value={form.insuredId}
          onChange={(e) => {
            const selectedId = e.target.value;
            const selectedUser = insuredUsers.find(
              (u) => String(u.insuredId || '').trim() === selectedId
            );

            setForm({
              ...form,
              insuredId: selectedId,
              insured: selectedUser
                ? (selectedUser.department || selectedUser.name)
                : form.insured,
            });
          }}
          required
        >
          <option value="">Pilih akun tertanggung</option>
          {insuredUsers.map((u) => (
            <option key={u.id} value={String(u.insuredId).trim()}>
              {u.name} · {u.department || 'Perusahaan belum dicantumkan'} ({String(u.insuredId).trim()})
            </option>
          ))}
          {editing && form.insuredId && !insuredUsers.some(
            (u) => String(u.insuredId || '').trim() === String(form.insuredId).trim()
          ) && (
            <option value={String(form.insuredId).trim()}>
              {form.insured || 'Tertanggung sebelumnya'} ({String(form.insuredId).trim()}) · data tersimpan
            </option>
          )}
        </select>
      </FormField>
      <FormField label="Nama perusahaan tertanggung" required>
        <input value={form.insured} readOnly placeholder="Otomatis mengikuti akun tertanggung" />
      </FormField>
      <FormField label="ID tertanggung">
        <input value={form.insuredId} readOnly placeholder="Otomatis mengikuti akun tertanggung" />
      </FormField>
      <FormField label="Lini produk"><select value={form.productLine} onChange={(e) => setForm({ ...form, productLine:e.target.value })}>{['Property','Engineering','Energy Onshore','Energy Offshore'].map((x) => <option key={x}>{x}</option>)}</select></FormField>
      <FormField label="Provinsi">
    <select
      value={form.province}
      onChange={(e) => {
        const province = e.target.value;

        setForm({
          ...form,
          province,
          sensorId: sensors.find(
            (sensor) => sensor.area === province
          )?.id || '',
          latitude: '',
          longitude: '',
        });

        setGeoChecked(false);
        setGeoAttempted(false);

        setGeoMessage(
          `Provinsi berubah menjadi ${province}. Proses ulang alamat lalu konfirmasi lokasi; koordinat manual opsional.`
        );
      }}
    >
      {initialSensors.map((s) => (
        <option key={s.area}>{s.area}</option>
      ))}
    </select>
  </FormField>
      <FormField label="Kota / Kabupaten"><input value={form.city} onChange={(e) => setForm({ ...form, city:e.target.value })} required /></FormField>
      <FormField
        label="Nilai pertanggungan (Rp)"
        required
        hint="Contoh: 1.000.000.000"
      >
        <input
          type="text"
          inputMode="numeric"
          value={formatThousands(form.sumInsured)}
          onChange={(e) =>
            setForm({
              ...form,
              sumInsured: e.target.value.replace(/\D/g, '')
            })
          }
          placeholder="Masukkan nilai pertanggungan"
          required
        />
      </FormField>
      <FormField label="Alamat lokasi" required hint="Minimal 10 karakter untuk melewati pemeriksaan alamat simulasi."><input value={form.address} onChange={(e) => { setForm({ ...form, address:e.target.value }); setGeoChecked(false); setGeoAttempted(false); setGeoMessage('Alamat berubah. Proses ulang dan konfirmasi koordinat.'); }} required /></FormField>
      <div className="coordinate-entry">
    <FormField
      label="Lintang (latitude) · Opsional"
      hint="Boleh dikosongkan. Jika diisi, harus berpasangan dengan longitude."
    >
      <input
        type="number"
        step="any"
        min="-90"
        max="90"
        value={form.latitude}
        onChange={(e) => {
          setForm({ ...form, latitude: e.target.value });
          setGeoChecked(false);
          setGeoAttempted(true);
        }}
        placeholder="Contoh: -6.2000 (opsional)"
      />
    </FormField>

    <FormField
      label="Bujur (longitude) · Opsional"
      hint="Boleh dikosongkan. Tidak mengubah posisi marker peta prototype."
    >
      <input
        type="number"
        step="any"
        min="-180"
        max="180"
        value={form.longitude}
        onChange={(e) => {
          setForm({ ...form, longitude: e.target.value });
          setGeoChecked(false);
          setGeoAttempted(true);
        }}
        placeholder="Contoh: 106.8166 (opsional)"
      />
    </FormField>
  </div>
      <FormField label="Sensor terkait" hint="Pilihan dibatasi ke provinsi objek agar data Banten tidak memakai sensor Jakarta."><select value={form.sensorId} onChange={(e) => setForm({ ...form, sensorId:e.target.value })}><option value="">Pilih otomatis berdasarkan provinsi</option>{sensors.filter((sensor) => sensor.area === form.province).map((sensor) => <option key={sensor.id} value={sensor.id}>{sensor.area} · {sensor.name}</option>)}</select></FormField>
      <FormField label="Catatan"><textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes:e.target.value })} /></FormField>
      <div className="geocode-status">
    <div>
      <MapPin size={17} />

      <span>
        <b>
          {geoChecked
            ? 'Lokasi terkonfirmasi'
            : geoAttempted
              ? 'Menunggu konfirmasi lokasi'
              : 'Lokasi belum diverifikasi'}
        </b>

        <small>{geoMessage}</small>
      </span>
    </div>

    <div className="geocode-actions">
      <Button onClick={geo}>
        Proses alamat (simulasi)
      </Button>

      <Button
        variant="primary"
        disabled={!geoAttempted}
        onClick={confirmCoordinates}
      >
        Konfirmasi lokasi
      </Button>
    </div>
  </div>
      <div className="modal-actions"><Button onClick={() => setModal(false)}>Batal</Button><Button variant="primary" type="submit">Simpan objek</Button></div>
    </form></Modal>}
  </>;
}

function MapCanvas({ assets, sensors, selectedAssetId, setSelectedAssetId, layers, activeEvent }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x:0, y:0 });
  const mapPoints = assets.map((asset, index) => {
    const sensor = sensors.find((s) => s.area === asset.province) || sensors[index % sensors.length];
    const sameProvinceBefore = assets.slice(0, index).filter((a) => a.province === asset.province).length;
    return { ...asset, x: Math.min(94, Math.max(5, sensor.x + sameProvinceBefore * 2.1)), y: Math.min(91, Math.max(7, sensor.y + sameProvinceBefore * 2.1)) };
  });
  const exposures = [...new Set(assets.map((a) => a.province))].map((province) => {
    const sensor = sensors.find((s) => s.area === province);
    const total = assets.filter((a) => a.province === province).reduce((sum, a) => sum + a.sumInsured, 0);
    return sensor ? { province, x:sensor.x, y:sensor.y, total } : null;
  }).filter(Boolean);
  const resetView = () => { setZoom(1); setPan({ x:0, y:0 }); };
  return <div className={`map-canvas ${layers.satellite ? 'satellite-view' : ''}`}>
    <div className="map-viewport" style={{ transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
      <div className="map-grid" /><img src={indonesiaMap} alt={layers.satellite ? 'Peta dasar dengan mode citra satelit simulasi' : 'Peta dasar Indonesia'} className="map-image" />
      {layers.exposure && exposures.map((x) => <span key={x.province} className="map-exposure-bubble" style={{ left:`${x.x}%`, top:`${x.y}%`, width:`${Math.max(24,Math.min(76,24 + x.total / 1.3e10))}px`, height:`${Math.max(24,Math.min(76,24 + x.total / 1.3e10))}px` }} title={`${x.province} · exposure ${compactMoney(x.total)}`} />)}
      {layers.assets && mapPoints.map((a) => <button key={a.id} className={`asset-pin ${riskTone(a.riskScore)} ${selectedAssetId === a.id ? 'selected' : ''}`} style={{ left:`${a.x}%`, top:`${a.y}%` }} title={`${a.name} · ${a.province}`} onClick={() => setSelectedAssetId(a.id)}><MapPin size={17} /><span>{a.name}</span></button>)}
      {layers.sensors && sensors.map((s) => <span key={s.id} className={`sensor-pin ${s.online ? 'online' : 'offline'}`} style={{ left:`${s.x}%`, top:`${s.y}%` }} title={`${s.area} sensor ${s.online ? 'online' : 'offline'}`} />)}
      {layers.hazards && activeEvent && <div className="map-event-zone" style={{ left:`${(sensors.find((s) => s.area === activeEvent.province) || sensors[0]).x}%`, top:`${(sensors.find((s) => s.area === activeEvent.province) || sensors[0]).y}%` }}><span /><b>{activeEvent.name}</b></div>}
    </div>
    <div className="map-controls" aria-label="Kontrol peta">
      <div className="map-zoom-controls"><button type="button" onClick={() => setZoom((z) => Math.max(.85, Number((z-.15).toFixed(2))))} title="Perkecil">−</button><span>{Math.round(zoom*100)}%</span><button type="button" onClick={() => setZoom((z) => Math.min(1.9, Number((z+.15).toFixed(2))))} title="Perbesar">+</button></div>
      <div className="map-pan-controls"><button type="button" onClick={() => setPan((v) => ({...v,y:v.y+24}))} title="Geser ke atas">↑</button><div><button type="button" onClick={() => setPan((v) => ({...v,x:v.x+24}))} title="Geser ke kiri">←</button><button type="button" onClick={() => setPan((v) => ({...v,x:v.x-24}))} title="Geser ke kanan">→</button></div><button type="button" onClick={() => setPan((v) => ({...v,y:v.y-24}))} title="Geser ke bawah">↓</button></div>
      <button className="map-reset-view" type="button" onClick={resetView}>Reset tampilan</button>
    </div>
    <div className="map-attribution">Peta dasar ilustratif · posisi objek untuk demonstrasi prototype</div>
  </div>;
}

function UC02Page({ assets, sensors, events, alerts }) {
  const activeEvent = events.find((event) => event.status !== 'Selesai') || null;
  const exposureRows = [...new Set(assets.map((asset) => asset.province))].map((province) => {
    const rows = assets.filter((asset) => asset.province === province);
    const sensor = sensors.find((item) => item.area === province);
    return {
      province,
      count: rows.length,
      exposure: rows.reduce((sum, asset) => sum + Number(asset.sumInsured || 0), 0),
      highestRisk: Math.max(...rows.map((asset) => Number(asset.riskScore || 0))),
      sensorStatus: !sensor ? 'Tidak terhubung' : sensor.online ? (sensor.dataStatus === 'Tidak Valid' ? 'Payload tidak valid' : 'Online') : 'Offline / tidak diketahui',
    };
  }).sort((a, b) => b.exposure - a.exposure);
  return <>
    <PageTitle eyebrow="UC-02 · DATA & PEMETAAN GEOSPASIAL" title="Peta Risiko Geospasial" description="Jelajahi objek pertanggungan, kondisi sensor, layer bahaya, dan konsentrasi exposure. Peta ini bersifat eksplorasi; pengubahan status perangkat dan simulasi dilakukan pada UC-05." action={<div className="page-action-group"><Button onClick={() => exportCsv('peta-risiko-aset.csv', assets.map((a) => ({ id:a.id, objek:a.name, polis:a.policyNo, lokasi:`${a.city}, ${a.province}`, sumInsured:a.sumInsured, riskScore:a.riskScore }))) }><Download size={14} /> Ekspor CSV</Button><Button onClick={() => window.print()}><FileText size={14} /> Cetak peta / PDF</Button></div>} />
    <div className="uc02-map-wrap"><LegacyDashboard variant="risk-map" assets={assets} sensors={sensors} events={events} alerts={alerts} activeEvent={activeEvent} /></div>
    <section className="uc02-exposure-section">
      <div className="uc05-subheading"><span>UC-02 · VISUALISASI EXPOSURE</span><b>Exposure wilayah</b><small>Nilai pertanggungan hanya dihitung dari objek yang berada di provinsi terkait. Status sensor ditampilkan dari sensor provinsi yang sama.</small></div>
      <div className="two-col-grid">
        <Card title="Exposure per provinsi" subtitle="Distribusi nilai pertanggungan berdasarkan lokasi objek.">
          <DataTable columns={['Provinsi','Objek','Total exposure','Risk score tertinggi','Status sensor']}>
            {exposureRows.map((row) => <tr key={row.province}><td><b>{row.province}</b></td><td>{row.count}</td><td>{compactMoney(row.exposure)}</td><td><Status tone={riskTone(row.highestRisk)}>{row.highestRisk}/100</Status></td><td><Status tone={row.sensorStatus === 'Online' ? 'success' : row.sensorStatus === 'Offline / tidak diketahui' ? 'warning' : 'danger'}>{row.sensorStatus}</Status></td></tr>)}
          </DataTable>
        </Card>
        <Card title="Objek pertanggungan pada peta" subtitle="Klik marker objek pada peta untuk membuka rincian nilai dan status sensor.">
          <div className="priority-list">{assets.map((asset) => { const sensor = sensorForAsset(sensors, asset); return <div key={asset.id} className="priority-item"><span className="priority-number"><Building2 size={14} /></span><span><b>{asset.name}</b><small>{asset.city}, {asset.province} · {compactMoney(asset.sumInsured)}</small></span><Status tone={!sensor ? 'neutral' : sensor.online ? 'success' : 'warning'}>{!sensor ? 'Tanpa sensor' : sensor.online ? 'Sensor online' : 'Sensor offline'}</Status></div>; })}</div>
        </Card>
      </div>
    </section>
  </>;
}

function WalletIcon(props) { return <Database {...props} />; }

function UC03Page({ assets, sensors, onSaveScore }) {
  const [selectedId, setSelectedId] = useState(assets[0]?.id || '');
  const [scenarioProvince, setScenarioProvince] = useState('Sumatera Barat');
  const [scenarioType, setScenarioType] = useState('Gempa');
  const [intensity, setIntensity] = useState(6.5);
  const [scenarioResults, setScenarioResults] = useState(null);
  const asset = assetById(assets, selectedId);
  const score = asset ? getAssetScore(asset, sensors) : null;
  const affected = scenarioResults || [];
  const calculate = () => { if (asset && !asset.locationVerified) return; if (asset && score) onSaveScore(asset.id, score.score, score); };
  const runScenario = () => {
    const target = [scenarioProvince, ...(provinceNeighbours[scenarioProvince] || [])];
    const multipliers = scenarioType === 'Banjir' ? { main:0.055, secondary:0.025 } : scenarioType === 'Erupsi' ? { main:0.045, secondary:0.018 } : { main:0.035, secondary:0.014 };
    setScenarioResults(assets.filter((a) => target.includes(a.province)).map((a) => ({ ...a, impact: a.province === scenarioProvince ? 'Zona utama' : 'Zona sekunder', estimate: Math.round(a.sumInsured * (a.province === scenarioProvince ? multipliers.main : multipliers.secondary) * Number(intensity || 0)) })));
  };
  return <>
    <PageTitle eyebrow="UC-03 · ANALISIS & MONITORING RISIKO" title="Analisis Risiko & Risk Scoring" description="Perhitungan skor risiko per objek dan jenis bencana, penilaian ulang, exposure, serta simulasi skenario." />
    <div className="two-col-grid analysis-top">
      <Card title="Penilaian risk score" subtitle="Pilih objek dengan lokasi terverifikasi untuk menghitung ulang skor.">
        <FormField label="Objek pertanggungan"><select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>{assets.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.name}</option>)}</select></FormField>
        {asset && <><div className="score-feature"><div className={`score-circle ${riskTone(asset.riskScore)}`}><strong>{asset.riskScore}</strong><small>/ 100</small></div><div><Status tone={riskTone(asset.riskScore)}>{riskBand(asset.riskScore)}</Status><h3>{asset.name}</h3><p>{asset.province} · {asset.productLine}</p><small>Skor tersimpan terakhir: {fmtDate(asset.lastAssessment)}</small></div></div>
          {!asset.locationVerified && <div className="inline-warning"><AlertTriangle size={15} /> Skor tidak dapat diperbarui sebelum koordinat objek diverifikasi pada UC-01.</div>}
          <div className="score-breakdown">{[['Bahaya lokasi : ',score.hazard,55],['Histori klaim : ',score.history,25],['Kondisi sensor : ',score.sensorRisk,20]].map(([label,value,weight]) => <div key={label}><span>{label}<small>Bobot {weight}%</small></span><b>{value}/100</b><i><em style={{ width:`${value}%` }} /></i></div>)}</div>
          <div className="card-actions"><Button variant="primary" onClick={calculate} disabled={!asset.locationVerified}><RefreshCw size={14} /> Hitung ulang skor</Button></div>
        </>}
      </Card>
      <Card title="Hasil analisis per jenis bahaya" subtitle="Skor gabungan mengacu pada bahaya lokasi, histori klaim, dan kondisi sensor.">
        {asset && <div className="hazard-score-list">{[['Gempa bumi',Math.min(100,Math.round(asset.hazardBase * 0.92)),Activity],['Banjir / hidrologi',Math.min(100,Math.round(asset.hazardBase * 0.78)),Droplets],['Erupsi gunung api',Math.min(100,Math.round(asset.hazardBase * 0.62)),Mountain]].map(([label,value,Icon]) => <div key={label} className="hazard-score-row"><span className="hazard-icon"><Icon size={17} /></span><span><b>{label}</b><small>Indeks bahaya lokasi</small></span><b>{value}</b><Status tone={riskTone(value)}>{riskBand(value)}</Status></div>)}</div>}
        <div className="note-box"><AlertCircle size={16} /><span>Apabila data bahaya eksternal atau sensor belum tersedia, skor prototype menggunakan data historis internal dan diberi label sebagai estimasi parsial.</span></div>
      </Card>
    </div>
    <Card title="Simulasi skenario bencana" subtitle="Simulasi ini menampilkan estimasi objek terdampak tanpa mengubah risk score tersimpan.">
      <div className="scenario-controls"><FormField label="Wilayah kejadian"><select value={scenarioProvince} onChange={(e) => { setScenarioProvince(e.target.value); setScenarioResults(null); }}>{initialSensors.map((s) => <option key={s.area}>{s.area}</option>)}</select></FormField><FormField label="Jenis bencana"><select value={scenarioType} onChange={(e) => { setScenarioType(e.target.value); setIntensity(e.target.value === 'Gempa' ? 6.5 : e.target.value === 'Banjir' ? 2.5 : 4); }}><option>Gempa</option><option>Banjir</option><option>Erupsi</option></select></FormField><FormField label={scenarioType === 'Gempa' ? 'Intensitas (MMI)' : scenarioType === 'Banjir' ? 'Ketinggian air (m)' : 'Skala (VEI)'}><input type="number" min="1" max={scenarioType === 'Gempa' ? '12' : scenarioType === 'Banjir' ? '12' : '8'} step="0.5" value={intensity} onChange={(e) => setIntensity(e.target.value)} /></FormField><Button variant="primary" onClick={runScenario}><Zap size={15} /> Jalankan simulasi</Button></div>
      {scenarioResults && <div className="scenario-output"><div className="scenario-summary"><b>{affected.length} objek masuk area analisis</b><small>{scenarioType} di {scenarioProvince} · {intensity}</small></div><DataTable columns={['Objek','Lokasi','Zona','Estimasi dampak']}>{affected.map((a) => <tr key={a.id}><td><b>{a.name}</b><small className="cell-sub">{a.policyNo}</small></td><td>{a.province}</td><td><Status tone={a.impact === 'Zona utama' ? 'danger' : 'warning'}>{a.impact}</Status></td><td>{money(a.estimate)}</td></tr>)}</DataTable>{!affected.length && <Empty title="Tidak ada objek teridentifikasi" description="Tidak ada objek demo di wilayah terpilih atau wilayah yang berdekatan." />}</div>}
    </Card>
  </>;
}

function UC04Page({ user, assets, sensors, alerts, onCreateAlert, onUpdateAlert, onTelemetry, onNormalTelemetry }) {
  
  const insuredId = String(user.insuredId || '').trim();

  // RE melihat seluruh objek, sedangkan TC hanya melihat objek miliknya.
  const ownAssets = user.role === 'insured'
    ? assets.filter(
        (a) => String(a.insuredId || '').trim() === insuredId
      )
    : assets;

  // Objek default saat halaman dibuka.
  const preferredAsset = user.role === 'insured'
    ? (ownAssets[0] || null)
    : (assets.find((a) => a.id === 'AST-001') || assets[0] || null);

  const [selectedId, setSelectedId] = useState(preferredAsset?.id || '');

  // Sesuaikan objek terpilih ketika akun berganti.
  useEffect(() => {
    const selectedIsVisible = ownAssets.some(
      (a) => a.id === selectedId
    );

    if (!selectedIsVisible) {
      setSelectedId(preferredAsset?.id || ownAssets[0]?.id || '');
    }
  }, [user.id, user.role, user.insuredId, assets, selectedId]);

  // Identifikasi sensor yang terhubung dengan aset yang boleh dilihat.
  const visibleSensorIds = new Set(
    ownAssets
      .map((asset) => sensorForAsset(sensors, asset)?.id)
      .filter(Boolean)
  );

  const visibleSensors = user.role === 'insured'
    ? sensors.filter((sensor) => visibleSensorIds.has(sensor.id))
    : sensors;

  // Alert hanya menampilkan alert dari aset milik tertanggung.
  const visibleAlerts = user.role === 'insured'
    ? alerts.filter((alert) =>
        ownAssets.some((asset) => asset.id === alert.assetId)
      )
    : alerts;

  const [followup, setFollowup] = useState({});
  const [filter, setFilter] = useState('Semua');
  const [hazardSource, setHazardSource] = useState('BMKG');

  // Pastikan objek yang ditampilkan selalu termasuk aset yang boleh dilihat.
  const current =
    ownAssets.find((a) => a.id === selectedId) ||
    preferredAsset ||
    null;

  return <>
    <PageTitle eyebrow="UC-04 · ANALISIS & MONITORING RISIKO" title="Monitoring Risiko & Early Warning" description="Pemantauan kondisi aset, evaluasi threshold, pembentukan alert, acknowledgement, tindak lanjut, dan eskalasi." />
    <div className="kpi-grid compact-kpis">
      <Kpi
        icon={Radio}
        label="Sensor online"
        value={visibleSensors.filter((s) => s.online).length}
      />
      <Kpi icon={Bell} label="Alert belum selesai" value={visibleAlerts.filter((a) => a.status !== 'Selesai').length} tone="red" /><Kpi icon={CheckCircle2} label="Acknowledged" value={visibleAlerts.filter((a) => a.acknowledged).length} tone="green" /><Kpi icon={AlertTriangle} label="Alert dieskalasi" value={visibleAlerts.filter((a) => a.escalated).length} tone="orange" /></div>
    <div className="two-col-grid">
      
    <Card
      title="Kondisi aset terpantau"
      subtitle={
        user.role === 'insured'
          ? 'Hanya objek milik Anda yang ditampilkan.'
          : 'Pilih aset untuk melihat kondisi dan mengirim telemetry uji.'
      }
    >
      <FormField label="Objek pertanggungan">
        <select
          value={current?.id || ''}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          {ownAssets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.province}
            </option>
          ))}
        </select>
      </FormField>

      {current && (
        <>
          <div className="monitor-asset">
            <span className="monitor-icon">
              <Activity size={20} />
            </span>

            <span>
              <b>{current.name}</b>
              <small>{current.province} · {current.policyNo}</small>
            </span>

            <Status tone={riskTone(current.riskScore)}>
              {riskBand(current.riskScore)}
            </Status>
          </div>

          {(() => {
            const sensor = sensorForAsset(sensors, current);

            if (!sensor) return null;

            // Payload sementara ditampilkan tanpa mengubah data utama.
            const telemetry =
              sensor.pendingSync && sensor.pendingPayload
                ? sensor.pendingPayload
                : (sensor.base || {});

            return (
              <>
                <div className="telemetry-grid">
                  <div>
                    <small>MMI / getaran</small>
                    <b>{Number(telemetry.mmi || 0).toFixed(1)}</b>
                    <span>MMI</span>
                  </div>

                  <div>
                    <small>Ketinggian air</small>
                    <b>{Number(telemetry.water || 0).toFixed(2)}</b>
                    <span>meter</span>
                  </div>

                  <div>
                    <small>Indeks erupsi</small>
                    <b>{Number(telemetry.vei || 0).toFixed(1)}</b>
                    <span>VEI</span>
                  </div>
                </div>

                <div className="sensor-meta-line">
                  <span>
                    <i className={sensor.online ? 'online-dot' : 'offline-dot'} />
                    {sensor.online
                      ? 'Sensor mengirim data'
                      : 'Sensor tidak aktif'}
                  </span>

                  <small>
                    Terakhir diterima: {
                      sensor.online
                        ? (
                            sensor.pendingTelemetryAt ||
                            sensor.telemetryAt ||
                            'Belum ada data'
                          )
                        : 'Tidak tersedia'
                    }
                  </small>
                </div>

                <div className="telemetry-queue-status">
                  <Status
                    tone={
                      sensor.pendingSync
                        ? 'info'
                        : sensor.dataStatus === 'Tidak Valid'
                          ? 'danger'
                          : 'neutral'
                    }
                  >
                    {sensor.pendingSync
                      ? 'Menunggu sinkronisasi UC-05'
                      : sensor.dataStatus === 'Tidak Valid'
                        ? 'Payload ditolak'
                        : 'Tidak ada payload baru'}
                  </Status>
                </div>
              </>
            );
          })()}

          {user.role !== 'insured' && (
            <>
              <div className="row-actions">
                <Button onClick={() => onNormalTelemetry(current)}>
                  Kirim data normal
                </Button>

                <Button
                  variant="primary"
                  onClick={() => onTelemetry(current)}
                >
                  <Zap size={14} />
                  Kirim payload melewati threshold
                </Button>
              </div>

              <div className="note-box telemetry-queue-note">
                <Database size={15} />
                <span>
                  Payload disimpan pada sensor terlebih dahulu.
                  Buka UC-05 → Data Asli → Sinkronkan data sensor
                  untuk menjalankan validasi threshold dan meneruskan
                  event/alert ke modul terkait.
                </span>
              </div>
            </>
          )}
        </>
      )}
    </Card>

      <Card title="Alur alert" subtitle="Status alert diperbarui saat aksi dilakukan."><ol className="process-list compact"><li><b>Deteksi event</b><small>Data sensor atau kejadian kebencanaan melewati threshold.</small></li><li><b>Pembaruan risk score</b><small>Sistem menjalankan UC-03 untuk objek terkait.</small></li><li><b>Notifikasi dikirim</b><small>Risk Engineering dan tertanggung menerima informasi.</small></li><li><b>Acknowledgement & tindak lanjut</b><small>Alert dikonfirmasi, dicatat, dan dapat dieskalasi.</small></li></ol></Card>
    </div>
    {user.role === 'risk' && <Card title="Terima event kebencanaan eksternal" subtitle="Simulasikan data kejadian dari BMKG, PVMBG, atau BNPB sebagai pemicu monitoring dan daftar potensi klaim."><div className="scenario-controls"><FormField label="Sumber data"><select value={hazardSource} onChange={(e) => setHazardSource(e.target.value)}><option>BMKG</option><option>PVMBG</option><option>BNPB</option></select></FormField><Button variant="primary" onClick={() => onCreateAlert(current, `Kejadian bencana diterima di ${current?.province || 'wilayah terpilih'}`, `Sistem Data Kebencanaan (${hazardSource})`)} disabled={!current}><Globe2 size={14} /> Simulasikan event eksternal</Button></div><small className="muted">Event akan dicatat di UC-04, tampil pada peta UC-02, dan dapat diidentifikasi menjadi potensi klaim pada UC-07.</small></Card>}
    <Card title="Daftar early warning" subtitle="Riwayat event, status penerimaan, dan tindak lanjut.">
      <div className="toolbar-row"><div className="filter-tabs">{['Semua','Belum Dibaca','Acknowledged','Dieskalasi','Selesai'].map((x) => <button key={x} className={filter === x ? 'active' : ''} onClick={() => setFilter(x)}>{x}</button>)}</div></div>
      <div className="alert-list">{visibleAlerts.filter((a) => filter === 'Semua' || (filter === 'Belum Dibaca' && !a.acknowledged) || (filter === 'Acknowledged' && a.acknowledged) || (filter === 'Dieskalasi' && a.escalated) || (filter === 'Selesai' && a.status === 'Selesai')).map((alert) => <article className="alert-item" key={alert.id}><span className="alert-symbol"><AlertTriangle size={18} /></span><div className="alert-body"><div className="alert-title-row"><b>{alert.title}</b><Status tone={alert.status === 'Selesai' ? 'success' : alert.escalated ? 'danger' : alert.acknowledged ? 'info' : 'warning'}>{alert.status}</Status></div><p>{assetById(assets, alert.assetId)?.name || alert.assetId} · {alert.province} · {alert.source}</p><small>{alert.createdAt} · Kanal: {alert.channel || 'In-app'}</small>{alert.followup && <div className="alert-followup">Tindak lanjut: {alert.followup}</div>}</div><div className="alert-actions">{user.role !== 'insured' && !alert.acknowledged && <Button size="small" onClick={() => onUpdateAlert(alert.id, { acknowledged:true, status:'Acknowledged' })}><Check size={13} /> Ack</Button>}{user.role !== 'insured' && alert.acknowledged && alert.status !== 'Selesai' && <><input placeholder="Catatan tindak lanjut" value={followup[alert.id] || ''} onChange={(e) => setFollowup({ ...followup, [alert.id]:e.target.value })} /><Button size="small" onClick={() => { onUpdateAlert(alert.id, { followup:followup[alert.id] || 'Tindak lanjut dilakukan', status:'Selesai' }); }}><CheckCircle2 size={13} /> Selesai</Button><Button size="small" onClick={() => onUpdateAlert(alert.id, { escalated:true, status:'Dieskalasi' })}>Eskalasi</Button></>}</div></article>)}
        {!visibleAlerts.length && <Empty title="Belum ada alert" description="Event atau anomali sensor yang terdeteksi akan muncul di sini." />}
      </div>
    </Card>
  </>;
}

function UC05Page({
  user, assets, sensors, events, decisions, onDecision,
  activeEvent, simulationEvent, thresholds, assignments,
  recommendations, rapor, onSimulate, onReset,
  onToggleSensor, onUseSystemData, onSyncSystemData,
  onCompleteEvent, alerts, gatewayStatus
}) {
  const [compareA, setCompareA] = useState(assets[0]?.id || '');
  const [compareB, setCompareB] = useState(assets[1]?.id || '');
  const [decisionNote, setDecisionNote] = useState({});
  useEffect(() => {
    if (!assets.length) { setCompareA(''); setCompareB(''); return; }
    const validA = assets.some((asset) => asset.id === compareA) ? compareA : assets[0].id;
    const validB = assets.some((asset) => asset.id === compareB && asset.id !== validA)
      ? compareB
      : (assets.find((asset) => asset.id !== validA)?.id || '');
    if (validA !== compareA) setCompareA(validA);
    if (validB !== compareB) setCompareB(validB);
  }, [assets, compareA, compareB]);
  const total = assets.reduce((sum, asset) => sum + Number(asset.sumInsured || 0), 0);
  const risky = assets.filter((asset) => asset.riskScore >= 70);
  const byProvince = [...new Set(assets.map((asset) => asset.province))].map((province) => ({
    province,
    value: assets.filter((asset) => asset.province === province).reduce((sum, asset) => sum + Number(asset.sumInsured || 0), 0),
  })).sort((a, b) => b.value - a.value);
  const exposureLimit = Number(thresholds?.exposureLimit || 0);
  const overLimit = exposureLimit > 0 ? byProvince.filter((row) => row.value >= exposureLimit) : [];
  const a = assetById(assets, compareA);
  const b = assetById(assets, compareB);
  const comparePair = (a && b && a.id !== b.id ? [a, b] : [a].filter(Boolean)).slice(0, 2);
  const activeEventProvince = activeEvent?.region || activeEvent?.province;
  const makeDecision = (id, kind) => { if (!kind) return; onDecision(id, kind, decisionNote[id] || 'Keputusan demo berdasarkan profil risiko dan exposure.'); };
  const changeCompareA = (id) => { if (id === compareB) setCompareB(compareA); setCompareA(id); };
  const changeCompareB = (id) => { if (id === compareA) setCompareA(compareB); setCompareB(id); };

  return <>
    <PageTitle eyebrow="UC-05 · ANALISIS & MONITORING RISIKO" title="Dashboard Geospasial & Portofolio" description="Pemantauan geospasial, simulasi dan sinkronisasi sensor, serta ringkasan exposure dan keputusan portofolio." />
    <section className="uc05-geospatial-section">
      <div className="uc05-subheading"><span>PEMANTAUAN GEOSPASIAL</span><b>Peta Indonesia & kondisi sensor</b><small>Pilih Data Asli untuk memproses telemetry tersimpan, atau Simulasi untuk menguji skenario bencana.</small></div>
      <div className="uc05-map-wrap"><LegacyDashboard
      variant="dashboard"
      assets={assets}
      sensors={sensors}
      events={events}
      alerts={alerts}
      activeEvent={simulationEvent}
      onSimulate={onSimulate}
      onReset={onReset}
      onToggleSensor={onToggleSensor}
      onUseSystemData={onUseSystemData}
      onSyncSystemData={onSyncSystemData}
      onCompleteEvent={onCompleteEvent}
      provinceNeighbours={provinceNeighbours}
      gatewayStatus={gatewayStatus}
    />
    </div>
    </section>

    <section className="uc05-portfolio-section">
      <div className="uc05-subheading"><span>UC-05 · DASHBOARD PORTOFOLIO</span><b>Ringkasan portofolio & keputusan</b><small>Bagian ini berada di bawah peta. Gulir ke bawah untuk melihat exposure, prioritas, dokumen, dan keputusan.</small></div>
      <div className="kpi-grid"><Kpi icon={Building2} label="Total objek" value={assets.length} /><Kpi icon={WalletIcon} label="Total exposure" value={compactMoney(total)} /><Kpi icon={AlertTriangle} label="Risiko tinggi" value={risky.length} tone="red" /><Kpi icon={ShieldCheck} label="Moratorium aktif" value={activeEventProvince ? 1 : 0} hint={activeEventProvince || 'Tidak ada'} tone="orange" /></div>
      <div className="two-col-grid">
        <Card title="Distribusi exposure wilayah" subtitle="Akumulasi nilai pertanggungan berdasarkan lokasi objek.">
          {overLimit.length > 0 && <div className="inline-warning"><AlertTriangle size={14} /> {overLimit.length} wilayah mendekati atau melampaui batas akumulasi ({compactMoney(exposureLimit)}): {overLimit.map((row) => row.province).join(', ')}.</div>}
          <div className="bar-chart">{byProvince.map((item) => <div key={item.province} className="bar-row"><span>{item.province}</span><i><em style={{ width:`${item.value / (byProvince[0]?.value || 1) * 100}%` }} /></i><b>{compactMoney(item.value)}</b></div>)}</div>
        </Card>
        <Card title="Prioritas assessment / survei / mitigasi" subtitle="Objek diurutkan berdasarkan risk score saat ini.">
          <div className="priority-list">{[...assets].sort((x, y) => y.riskScore - x.riskScore).slice(0, 5).map((asset, index) => <div key={asset.id} className="priority-item"><span className="priority-number">{index + 1}</span><span><b>{asset.name}</b><small>{asset.province} · {money(asset.sumInsured)}</small></span><Status tone={riskTone(asset.riskScore)}>{asset.riskScore}/100</Status></div>)}</div>
        </Card>
      </div>
      <Card title="Dokumen pendukung keputusan" subtitle="Survey report, rekomendasi mitigasi, dan rapor aset yang ditautkan ke objek pertanggungan.">
        <DataTable columns={['Objek / Polis', 'Survey report terakhir', 'Rekomendasi mitigasi', 'Rapor aset']}>
          {assets.map((asset) => {
            const survey = (assignments || []).filter((task) => task.kind === 'survey' && task.assetId === asset.id && ['Dikirim', 'Final', 'Verified', 'Revisi'].includes(task.status)).slice(0, 1)[0];
            const recommendation = (recommendations || []).find((item) => item.assetId === asset.id);
            const report = (rapor || []).find((item) => item.assetId === asset.id);
            return <tr key={asset.id}><td><b>{asset.name}</b><small className="cell-sub">{asset.policyNo}</small></td><td>{survey ? <><Status tone={survey.status === 'Final' || survey.status === 'Verified' ? 'success' : 'warning'}>{survey.status}</Status><small className="cell-sub">{survey.findings || 'Menunggu catatan temuan lengkap'}</small></> : <span className="muted">Belum tersedia</span>}</td><td>{recommendation ? <><b>{recommendation.title}</b><small className="cell-sub">{recommendation.status} · Prioritas {recommendation.priority || '-'}</small></> : <span className="muted">Belum tersedia</span>}</td><td>{report ? <small>{report.text}</small> : <span className="muted">Belum ada rapor mitigasi</span>}</td></tr>;
          })}
        </DataTable>
      </Card>
      <Card title="Perbandingan profil risiko" subtitle="Pilih dua objek untuk membandingkan skor, exposure, dan histori klaim.">
        <div className="compare-selects"><FormField label="Objek A"><select value={compareA} onChange={(e) => changeCompareA(e.target.value)}>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></FormField><span>vs.</span><FormField label="Objek B"><select value={compareB} onChange={(e) => changeCompareB(e.target.value)}>{assets.filter((asset) => asset.id !== compareA).map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></FormField></div>
        <div className="compare-grid compare-grid-exact-two" data-compare-count={comparePair.length}>{comparePair.map((asset) => <div className="compare-card" key={asset.id}><b>{asset.name}</b><div className="compare-score"><strong>{asset.riskScore}</strong><span>/100 · {riskBand(asset.riskScore)}</span></div><div className="detail-pair"><span>Exposure</span><b>{compactMoney(asset.sumInsured)}</b></div><div className="detail-pair"><span>Histori klaim</span><b>{asset.claimHistory}/100</b></div><div className="detail-pair"><span>Wilayah</span><b>{asset.province}</b></div></div>)}{comparePair.length < 2 && <div className="compare-empty">Pilih dua objek yang berbeda untuk dibandingkan.</div>}</div>
      </Card>
      {user.role === 'underwriter' && <Card title="Rekomendasi akseptasi" subtitle="Catat keputusan beserta alasan untuk setiap pengajuan yang ditinjau.">
        <DataTable columns={['Objek / Polis', 'Risk Score', 'Exposure wilayah', 'Rekomendasi sistem', 'Keputusan Underwriter']}>
          {assets.map((asset) => { const isMoratorium = Boolean(activeEventProvince && [activeEventProvince, ...(provinceNeighbours[activeEventProvince] || [])].includes(asset.province)); const decision = decisions.find((item) => item.assetId === asset.id); return <tr key={asset.id}><td><b>{asset.name}</b><small className="cell-sub">{asset.policyNo}</small></td><td><Status tone={riskTone(asset.riskScore)}>{asset.riskScore} · {riskBand(asset.riskScore)}</Status></td><td>{compactMoney(asset.sumInsured)}</td><td>{isMoratorium ? <Status tone="danger">Moratorium</Status> : asset.riskScore >= 70 ? <Status tone="warning">Perlu assessment</Status> : <Status tone="success">Dapat dipertimbangkan</Status>}</td><td><div className="decision-cell"><input value={decisionNote[asset.id] ?? decision?.note ?? ''} onChange={(e) => setDecisionNote({ ...decisionNote, [asset.id]:e.target.value })} placeholder="Alasan keputusan" /><select value={decision?.kind || ''} onChange={(e) => makeDecision(asset.id, e.target.value)}><option value="">Pilih keputusan</option><option value="Diterima" disabled={isMoratorium}>Terima</option><option value="Ditolak">Tolak</option><option value="Moratorium">Moratorium</option><option value="Perlu Assessment">Minta assessment</option></select></div>{decision && <small className="cell-sub">Tercatat: {decision.kind}</small>}</td></tr>; })}
        </DataTable>
      </Card>}
      {user.role === 'risk' && <Card title="Penetapan prioritas" subtitle="Daftar ini menjadi acuan UC-03, UC-08, dan UC-09."><div className="priority-actions">{risky.map((asset) => <div key={asset.id}><span><b>{asset.name}</b><small>{asset.province} · Risk score {asset.riskScore}</small></span><Button size="small" onClick={() => onDecision(asset.id, 'Prioritas Assessment', 'Prioritas ditetapkan oleh Risk Engineering.')}>Tandai prioritas</Button></div>)}</div></Card>}
    </section>
  </>;
}

function UC06Page({ sensors, assets, thresholds, onToggleSensor, onUpdateThresholds, onRegisterSensor, onTestGateway, onInvalidTelemetry, gatewayStatus }) {
  const [editingThresholds, setEditingThresholds] = useState(thresholds);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ area:'Jawa Barat', deviceType:'Water Level', name:'', assetId:'' });
  const assetsInSelectedArea = assets.filter((asset) => asset.province === form.area);
  const online = sensors.filter((s) => s.online).length;
  return <>
    <PageTitle eyebrow="UC-06 · ANALISIS & MONITORING RISIKO" title="Pengelolaan Perangkat Sensor IoT" description="Registrasi perangkat, pengaitan aset, koneksi gateway, threshold, validasi telemetry, dan pemantauan status." action={<Button variant="primary" onClick={() => setShowForm(true)} disabled={!gatewayStatus}><Plus size={15} /> Registrasi sensor</Button>} />
    <div className="kpi-grid compact-kpis"><Kpi icon={Radio} label="Sensor terdaftar" value={sensors.length} /><Kpi icon={Wifi} label="Perangkat online" value={online} tone="green" /><Kpi icon={WifiOff} label="Tidak aktif" value={sensors.length - online} tone="orange" /><Kpi icon={Link2} label="Gateway IoT" value={gatewayStatus ? 'Terhubung' : 'Terputus'} tone={gatewayStatus ? 'green' : 'red'} /></div>
    <div className="two-col-grid">
      <Card title="Koneksi platform / gateway" subtitle="Uji koneksi dan sinkronisasi perangkat simulasi."><div className="gateway-card"><span className={`gateway-icon ${gatewayStatus ? 'connected' : ''}`}><Radio size={25} /></span><div><b>Gateway IoT Jasindo</b><small>Gateway demo · MQTT/HTTPS (simulasi)</small><Status tone={gatewayStatus ? 'success' : 'danger'} dot>{gatewayStatus ? 'Terhubung' : 'Terputus'}</Status></div><Button onClick={onTestGateway}><RefreshCw size={14} /> Uji koneksi</Button></div><div className="note-box"><AlertCircle size={15} /><span>Pengujian gateway ini tidak menghubungkan perangkat fisik; fungsinya untuk mendemonstrasikan alur koneksi dan penanganan gagal.</span></div></Card>
      <Card title="Konfigurasi threshold" subtitle="Batas nilai berikut digunakan oleh modul UC-04 untuk membuat alert."><div className="threshold-form"><FormField label="Ketinggian air (meter)"><input type="number" step="0.1" value={editingThresholds.water} onChange={(e) => setEditingThresholds({ ...editingThresholds, water:Number(e.target.value) })} /></FormField><FormField label="Getaran (MMI) "><input type="number" step="0.1" value={editingThresholds.mmi} onChange={(e) => setEditingThresholds({ ...editingThresholds, mmi:Number(e.target.value) })} /></FormField><FormField label="Suhu (°C)"><input type="number" step="1" value={editingThresholds.temperature} onChange={(e) => setEditingThresholds({ ...editingThresholds, temperature:Number(e.target.value) })} /></FormField><FormField label="Timeout sensor (menit)"><input type="number" min="1" value={editingThresholds.telemetryTimeoutMinutes} onChange={(e) => setEditingThresholds({ ...editingThresholds, telemetryTimeoutMinutes:Number(e.target.value) })} /></FormField><Button variant="primary" onClick={() => onUpdateThresholds(editingThresholds)}><Check size={14} /> Simpan threshold</Button></div></Card>
    </div>
    <Card title="Daftar perangkat sensor" subtitle="Perangkat dihubungkan dengan objek pertanggungan dan lokasi pemasangan.">
      <DataTable columns={['Sensor / Lokasi','Jenis perangkat','Objek terkait','Threshold','Status','Aksi']}>
        {sensors.slice(0,45).map((s) => { const asset = assets.find((a) => sensorForAsset(sensors, a)?.id === s.id); return <tr key={s.id}><td><b>{s.id.toUpperCase()}</b><small className="cell-sub">{s.area} · {s.name}</small></td><td>{s.deviceType || 'Multi-hazard node'}</td><td>{asset?.name || <span className="muted">Belum dikaitkan</span>}</td><td>Air {thresholds.water} m · MMI {thresholds.mmi}</td><td><Status tone={s.online ? 'success' : 'warning'} dot>{s.online ? 'Aktif' : 'Tidak aktif'}</Status>{s.pendingSync && <small className="cell-sub">Menunggu sinkronisasi UC-05</small>}{s.dataStatus === 'Tidak Valid' && <small className="cell-sub">Payload tidak valid</small>}</td><td><div className="row-actions"><Button size="small" onClick={() => onToggleSensor(s.id)}>{s.online ? 'Matikan' : 'Aktifkan'}</Button><Button size="small" onClick={() => onInvalidTelemetry(s.id)}>Uji data invalid</Button></div></td></tr>; })}
      </DataTable>
    </Card>
    {showForm && <Modal title="Registrasi perangkat sensor" subtitle="Daftarkan identitas sensor dan hubungkan ke objek pertanggungan." onClose={() => setShowForm(false)}><form className="form-stack" onSubmit={(e) => { e.preventDefault(); onRegisterSensor(form); setShowForm(false); }}><FormField label="Nama perangkat" required><input value={form.name} onChange={(e) => setForm({ ...form, name:e.target.value })} required /></FormField><FormField label="Provinsi"><select value={form.area} onChange={(e) => setForm({ ...form, area:e.target.value, assetId:'' })}>{initialSensors.map((s) => <option key={s.area}>{s.area}</option>)}</select></FormField><FormField label="Jenis sensor"><select value={form.deviceType} onChange={(e) => setForm({ ...form, deviceType:e.target.value })}>{['Water Level','Vibration','Temperature','Multi-hazard node'].map((x) => <option key={x}>{x}</option>)}</select></FormField>
    <FormField label="Objek pertanggungan">
      <select
        value={form.assetId}
        onChange={(e) => setForm({ ...form, assetId: e.target.value })}
      >
        {assetsInSelectedArea.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} · {a.province} · Risk {a.riskScore}
          </option>
        ))}
      </select>
    </FormField>
    <small className="muted">Daftar objek dibatasi pada provinsi sensor yang dipilih agar titik sensor tidak tertaut ke aset di provinsi lain.</small><div className="modal-actions"><Button onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" type="submit">Simpan perangkat</Button></div></form></Modal>}
  </>;
}

function UC07Page({ user, users, assets, claims, events, assignments, onCreateClaims, onAssessClaim, onAssignAdjuster, onSubmitAdjustment, onReviewAdjustment, onNavigate }) {
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || '');
  const [manualProvince, setManualProvince] = useState('Sumatera Barat');
  const [assessment, setAssessment] = useState({});
  const [assigning, setAssigning] = useState(null);
  const [adjuster, setAdjuster] = useState(users.find((u) => u.role === 'adjuster' && u.active)?.id || '');
  const [adjustment, setAdjustment] = useState({});
  const visibleClaims = user.role === 'adjuster' ? claims.filter((c) => c.assignedAdjusterId === user.id && c.status !== 'Selesai') : claims;
  const claimsTotalLow = visibleClaims.reduce((s, c) => s + c.estimateLow, 0);
  const claimsTotalHigh = visibleClaims.reduce((s, c) => s + c.estimateHigh, 0);
  return <>
    <PageTitle eyebrow="UC-07 · PENILAIAN DAMPAK & KLAIM" title="Identifikasi Aset Terdampak & Estimasi Kerugian" description="Identifikasi aset dan polis terdampak, daftar potensi klaim, assessment klaim, serta verifikasi adjustment." />
    <div className="kpi-grid compact-kpis"><Kpi icon={FileCheck2} label="Potensi klaim" value={visibleClaims.length} /><Kpi icon={WalletIcon} label="Estimasi bawah" value={compactMoney(claimsTotalLow)} /><Kpi icon={WalletIcon} label="Estimasi atas" value={compactMoney(claimsTotalHigh)} tone="orange" /><Kpi icon={ClipboardCheck} label="Adjustment ditugaskan" value={visibleClaims.filter((c) => c.assignedAdjusterId).length} tone="purple" /></div>
    {user.role === 'claim' && <Card title="Identifikasi aset terdampak" subtitle="Gunakan event dari data kebencanaan atau tandai wilayah secara manual jika jejak kejadian belum tersedia.">
      <div className="scenario-controls"><FormField label="Event kebencanaan"><select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}><option value="">Tidak tersedia · input manual</option>{events.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.province}</option>)}</select></FormField><FormField label="Wilayah manual"><select value={manualProvince} onChange={(e) => setManualProvince(e.target.value)}>{initialSensors.map((s) => <option key={s.area}>{s.area}</option>)}</select></FormField><Button variant="primary" onClick={() => onCreateClaims(selectedEvent, manualProvince)}><MapPin size={14} /> Identifikasi aset</Button></div>
    </Card>}
    <Card title={user.role === 'adjuster' ? 'Penugasan adjustment saya' : 'Daftar potensi klaim'} subtitle={user.role === 'adjuster' ? 'Adjuster hanya dapat mengakses aset yang ditugaskan kepadanya.' : 'Rentang estimasi awal digunakan sebagai dasar pencadangan klaim.'}>
      <DataTable columns={['Klaim / Objek','Event / Lokasi','Rentang estimasi kerugian','Status','Proses']}>
        {visibleClaims.map((c) => { const asset = assetById(assets,c.assetId); const task = assignments.find((x) => x.kind === 'adjuster' && x.claimId === c.id); return <tr key={c.id}><td><b>{c.id}</b><small className="cell-sub">{asset?.name || c.assetId} · {asset?.policyNo}</small></td><td>{events.find((e) => e.id === c.eventId)?.name || c.province}<small className="cell-sub">{asset?.province}</small></td><td><b>{compactMoney(c.estimateLow)} - {compactMoney(c.estimateHigh)}</b>{c.assessed > 0 && <small className="cell-sub">Assessment: {money(c.assessed)}</small>}</td><td><Status tone={c.status === 'Selesai' ? 'success' : c.assignedAdjusterId ? 'info' : 'warning'}>{c.status}</Status></td><td>
          {user.role === 'claim' && <div className="row-actions"><input className="small-inline-input" placeholder="Nilai assessment" type="number" value={assessment[c.id] ?? c.assessed ?? ''} onChange={(e) => setAssessment({ ...assessment, [c.id]:e.target.value })} /><Button size="small" onClick={() => onAssessClaim(c.id, Number(assessment[c.id] || c.estimateLow))}>Simpan assessment</Button><Button size="small" onClick={() => setAssigning(c)}>Tugaskan adjuster</Button></div>}
          {user.role === 'adjuster' && <div className="row-actions"><Button size="small" variant="primary" onClick={() => onNavigate('UC-08')}>Buka penugasan adjustment</Button></div>}
          {user.role === 'claim' && task && <small className="cell-sub">Adjuster: {users.find((u) => u.id === c.assignedAdjusterId)?.name}</small>}
          {user.role === 'claim' && c.adjustmentStatus === 'Menunggu Review' && <div className="row-actions"><Button size="small" onClick={() => onReviewAdjustment(c.id,true)}>Terima adjustment</Button><Button size="small" onClick={() => onReviewAdjustment(c.id,false)}>Kembalikan</Button></div>}
        </td></tr>; })}
      </DataTable>
      {!visibleClaims.length && <Empty title="Belum ada klaim untuk akun ini" description="Penugasan klaim dari Claim Officer akan tampil di halaman ini." />}
    </Card>
    {assigning && <Modal title="Penugasan adjuster" subtitle={`Penilaian lapangan untuk ${assetById(assets, assigning.assetId)?.name || assigning.assetId}.`} onClose={() => setAssigning(null)}><form className="form-stack" onSubmit={(e) => { e.preventDefault(); onAssignAdjuster(assigning.id, adjuster); setAssigning(null); }}><FormField label="Adjuster eksternal"><select value={adjuster} onChange={(e) => setAdjuster(e.target.value)}><option value="">Pilih adjuster aktif</option>{users.filter((u) => u.role === 'adjuster' && u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></FormField><div className="note-box"><LockKeyhole size={15} /><span>Akses adjuster dibatasi pada objek dan klaim yang ditugaskan ini.</span></div><div className="modal-actions"><Button onClick={() => setAssigning(null)}>Batal</Button><Button variant="primary" type="submit" disabled={!users.some((u) => u.id === adjuster && u.role === 'adjuster' && u.active)}>Kirim penugasan</Button></div></form></Modal>}
  </>;
}

function UC08Page({ user, users, assets, assignments, decisions, onCreateAssignment, onUpdateAssignment, onInviteSelfSurvey, onNavigate }) 
{
  const assetsForAssessment = assets.filter((asset) =>
    decisions.some(
      (d) => d.assetId === asset.id && d.kind === 'Perlu Assessment'
    )
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    assetId: assetsForAssessment[0]?.id || '',
    assignee: users.find((u) => u.role === 'surveyor' && u.active)?.id || '',
    dueDate: '2026-12-31',
    selfSurvey: false
  });
  const [submissions, setSubmissions] = useState({});
  const [revisionNotes, setRevisionNotes] = useState({});
  const isExternal = ['surveyor','adjuster'].includes(user.role);
  const visible = user.role === 'surveyor' || user.role === 'adjuster' ? assignments.filter((a) => a.assignedTo === user.id && a.status !== 'Final') : user.role === 'claim' ? assignments.filter((a) => a.kind === 'adjuster') : assignments;
  const recommendedSurveyor = users.find((u) => u.role === 'surveyor' && u.active);
  const startTask = (task) => onUpdateAssignment(task.id, { status:'Sedang Disurvei' });
  return <>
    <PageTitle eyebrow="UC-08 · SURVEI & MITIGASI RISIKO" title="Survei & Penugasan" description="Permintaan survei, rekomendasi surveyor berdasarkan wilayah dan keahlian, akses terbatas, evidence, review, dan finalisasi." action={user.role === 'risk' && <Button variant="primary" onClick={() => setShowForm(true)}><Plus size={15} /> Buat penugasan</Button>} />
    <div className="kpi-grid compact-kpis"><Kpi icon={ClipboardCheck} label="Total penugasan" value={visible.length} /><Kpi icon={Clock3} label="Sedang berjalan" value={visible.filter((a) => a.status === 'Sedang Disurvei').length} tone="orange" /><Kpi icon={FileCheck2} label="Menunggu review" value={visible.filter((a) => a.status === 'Dikirim').length} tone="purple" /><Kpi icon={CheckCircle2} label="Final" value={visible.filter((a) => a.status === 'Final').length} tone="green" /></div>
    {user.role === 'risk' && <Card title="Rekomendasi penugasan" subtitle={recommendedSurveyor ? `Sistem demo merekomendasikan ${recommendedSurveyor.name} berdasarkan cakupan wilayah dan keahlian.` : 'Belum ada akun surveyor aktif untuk menerima penugasan.'}><div className="recommended-user"><span className="avatar">BS</span><span><b>{recommendedSurveyor?.name || 'Belum ada surveyor aktif'}</b><small>Surveyor Eksternal · Property & Engineering</small></span><Status tone={recommendedSurveyor ? 'success' : 'warning'}>{recommendedSurveyor ? 'Direkomendasikan' : 'Perlu akun aktif'}</Status></div></Card>}
    <Card title={isExternal ? 'Daftar penugasan saya' : 'Daftar penugasan survei & adjuster'} subtitle={isExternal ? 'Akses terbatas hanya pada aset yang ditugaskan ke akun Anda.' : 'Risk Engineering mengelola survei risiko; Claim Officer dapat menugaskan adjuster dari UC-07.'}>
      {visible.map((task) => { const asset = assetById(assets, task.assetId); const assigned = users.find((u) => u.id === task.assignedTo); return <article className="task-card" key={task.id}><div className="task-main"><div className="task-id">{task.kind === 'adjuster' ? 'ADJ' : 'SUR'} · {task.id}</div><h3>{asset?.name || task.assetId}</h3><p>{asset?.province} · {asset?.policyNo} · Tenggat {fmtDate(task.dueDate)}</p><div className="task-meta"><Status tone={task.status === 'Final' ? 'success' : task.status === 'Dikirim' ? 'info' : task.status === 'Revisi' ? 'danger' : 'warning'}>{task.status}</Status><span>Ditugaskan ke: {assigned?.name || '-'}</span></div></div>
          <div className="task-actions">
            {user.role === 'surveyor' && task.kind === 'survey' && task.status === 'Ditugaskan' && <Button size="small" onClick={() => startTask(task)}>Mulai survei</Button>}
            {user.role === 'surveyor' && task.kind === 'survey' && ['Ditugaskan','Sedang Disurvei','Revisi'].includes(task.status) && <div className="task-submit"><select value={submissions[task.id]?.condition || task.condition || 'Baik'} onChange={(e) => setSubmissions({ ...submissions, [task.id]:{ ...(submissions[task.id] || {}), condition:e.target.value } })}><option>Baik</option><option>Perlu Perhatian</option><option>Buruk</option></select><textarea placeholder="Temuan dan kondisi objek" value={submissions[task.id]?.findings ?? task.findings ?? ''} onChange={(e) => setSubmissions({ ...submissions, [task.id]:{ ...(submissions[task.id] || {}), findings:e.target.value } })} /><input type="file" accept="image/*,.pdf" multiple onChange={(e) => setSubmissions({ ...submissions, [task.id]:{ ...(submissions[task.id] || {}), evidence:Array.from(e.target.files || []).map((f) => f.name) } })} /><Button size="small" variant="primary" onClick={() => onUpdateAssignment(task.id, { status:'Dikirim', condition:submissions[task.id]?.condition || task.condition || 'Baik', findings:submissions[task.id]?.findings || 'Hasil pemeriksaan lapangan telah diisi.', evidence:submissions[task.id]?.evidence?.length ? submissions[task.id].evidence : ['Evidence foto lapangan (mock)'], submittedAt:today() })}>Kirim hasil & evidence</Button></div>}
            {user.role === 'adjuster' && task.kind === 'adjuster' && ['Ditugaskan','Sedang Disurvei','Revisi'].includes(task.status) && <div className="task-submit"><input type="number" placeholder="Nilai kerugian hasil adjustment" value={submissions[task.id]?.amount || ''} onChange={(e) => setSubmissions({ ...submissions, [task.id]:{ ...(submissions[task.id] || {}), amount:e.target.value } })} /><textarea placeholder="Catatan adjustment dan evidence" value={submissions[task.id]?.findings || ''} onChange={(e) => setSubmissions({ ...submissions, [task.id]:{ ...(submissions[task.id] || {}), findings:e.target.value } })} /><input type="file" accept="image/*,.pdf" multiple onChange={(e) => setSubmissions({ ...submissions, [task.id]:{ ...(submissions[task.id] || {}), evidence:Array.from(e.target.files || []).map((f) => f.name) } })} /><Button size="small" variant="primary" disabled={!submissions[task.id]?.amount} onClick={() => onUpdateAssignment(task.id, { status:'Dikirim', adjustmentAmount:Number(submissions[task.id].amount), findings:submissions[task.id].findings, evidence:submissions[task.id]?.evidence?.length ? submissions[task.id].evidence : ['Dokumen adjustment (mock)'], submittedAt:today() })}>Kirim adjustment</Button></div>}
            {user.role === 'risk' && task.kind === 'survey' && task.status === 'Dikirim' && <><input className="small-inline-input" placeholder="Catatan review" value={revisionNotes[task.id] || ''} onChange={(e) => setRevisionNotes({ ...revisionNotes, [task.id]:e.target.value })} /><Button size="small" onClick={() => onUpdateAssignment(task.id, { status:'Final', reviewNote:'Hasil survei difinalisasi.' })}>Finalisasi</Button><Button size="small" onClick={() => onUpdateAssignment(task.id, { status:'Revisi', reviewNote:revisionNotes[task.id] || 'Mohon lengkapi evidence.' })}>Kembalikan</Button><Button size="small" onClick={() => onNavigate('UC-10')}>Verifikasi UC-10</Button></>}
            {user.role === 'claim' && task.kind === 'adjuster' && task.status === 'Dikirim' && <><Button size="small" onClick={() => onUpdateAssignment(task.id, { status:'Final', reviewNote:'Hasil adjustment disetujui oleh Claim Officer.' })}>Terima hasil</Button><Button size="small" onClick={() => onUpdateAssignment(task.id, { status:'Revisi', reviewNote:'Hasil adjustment perlu dilengkapi.' })}>Kembalikan</Button></>}
            {task.status === 'Final' && <Status tone="success">Akses penugasan ditutup</Status>}
          </div>
        </article>; })}
      {!visible.length && <Empty title="Tidak ada penugasan" description="Penugasan baru akan tampil setelah dibuat oleh Risk Engineering atau Claim Officer." />}
    </Card>
    {showForm && <Modal title="Buat penugasan survei" subtitle="Pilih jalur pemeriksaan berdasarkan profil risiko objek." onClose={() => setShowForm(false)}><form className="form-stack" onSubmit={(e) => { e.preventDefault(); if (form.selfSurvey) onInviteSelfSurvey(form.assetId, user.id); else onCreateAssignment({ kind:'survey', ...form, createdBy:user.id }); setShowForm(false); }}>
      <FormField label="Objek pertanggungan">
        <select
          value={form.assetId}
          onChange={(e) => setForm({
            ...form,
            assetId: e.target.value,
            selfSurvey: false
          })}
          required
        >
          {assetsForAssessment.length === 0 ? (
            <option value="">Belum ada objek berstatus Minta assessment</option>
          ) : (
            assetsForAssessment.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {a.province} · Risk {a.riskScore}
              </option>
            ))
          )}
        </select>
      </FormField>
      {(() => { const selectedAsset = assetById(assets, form.assetId); const eligibleForSelfSurvey = Number(selectedAsset?.riskScore) < 40; return <><label className={`choice-row ${!eligibleForSelfSurvey ? 'disabled' : ''}`}><input type="checkbox" checked={Boolean(form.selfSurvey)} disabled={!eligibleForSelfSurvey} onChange={(e) => setForm({ ...form, selfSurvey:e.target.checked })} /><span><b>Gunakan self-survey</b><small>{eligibleForSelfSurvey ? 'Objek berisiko rendah (risk score di bawah 40) memenuhi syarat untuk undangan mandiri.' : 'Self-survey hanya tersedia untuk objek dengan risk score di bawah 40.'}</small></span></label>{!form.selfSurvey && <><FormField label="Surveyor eksternal"><select value={form.assignee} onChange={(e) => setForm({ ...form, assignee:e.target.value })}>{users.filter((u) => u.role === 'surveyor' && u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></FormField><FormField label="Tenggat"><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate:e.target.value })} required /></FormField><div className="note-box"><LockKeyhole size={15} /><span>Surveyor hanya dapat melihat objek yang terhubung ke penugasan ini. Akses akan ditutup setelah finalisasi.</span></div></>}{form.selfSurvey && <div className="note-box"><ClipboardCheck size={15} /><span>Sistem akan mengirim undangan ke akun tertanggung pemilik objek. Tertanggung mengisi formulir di UC-11 dan Risk Engineering meninjau hasilnya.</span></div>}</>; })()}<div className="modal-actions"><Button onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" type="submit" disabled={form.selfSurvey ? !assetById(assets,form.assetId) || Number(assetById(assets,form.assetId)?.riskScore) >= 40 : !users.some((u) => u.role === 'surveyor' && u.active)}> {form.selfSurvey ? 'Kirim undangan' : 'Buat penugasan'} </Button></div></form></Modal>}
  </>;
}

function UC09Page({ user, assets, recommendations, onCreateRecommendation, onUpdateRecommendation, rapor }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ assetId:assets[0]?.id || '', standardId:recommendationLibrary[0].id, priority:'Tinggi', dueDate:'2026-11-12' });
  const [action, setAction] = useState({});
  const [review, setReview] = useState({});
  const ownIds = assets.filter((a) => a.insuredId === user.insuredId).map((a) => a.id);
  const visible = user.role === 'insured' ? recommendations.filter((r) => ownIds.includes(r.assetId)) : recommendations;
  return <>
    <PageTitle eyebrow="UC-09 · SURVEI & MITIGASI RISIKO" title="Rekomendasi Mitigasi & Rapor Aset" description="Pilih rekomendasi standar, tetapkan prioritas dan tenggat, catat tindak lanjut tertanggung, lalu verifikasi penyelesaian." action={user.role === 'risk' && <Button variant="primary" onClick={() => setShowForm(true)}><Plus size={15} /> Buat rekomendasi</Button>} />
    <div className="kpi-grid compact-kpis"><Kpi icon={Shield} label="Rekomendasi aktif" value={visible.filter((r) => r.status !== 'Selesai').length} /><Kpi icon={Clock3} label="Menunggu tindak lanjut" value={visible.filter((r) => r.status === 'Menunggu Tindak Lanjut').length} tone="orange" /><Kpi icon={FileCheck2} label="Menunggu verifikasi" value={visible.filter((r) => r.status === 'Menunggu Verifikasi').length} tone="purple" /><Kpi icon={CheckCircle2} label="Selesai" value={visible.filter((r) => r.status === 'Selesai').length} tone="green" /></div>
    <Card title="Siklus rekomendasi mitigasi" subtitle="Rekomendasi bersumber dari library standar dan ditindaklanjuti oleh tertanggung.">
      {visible.map((r) => { const asset = assetById(assets,r.assetId); const standard = recommendationLibrary.find((x) => x.id === r.standardId); return <article className="recommendation-card" key={r.id}><div className="recommendation-main"><div className="task-id">{r.id} · {standard?.category || 'Mitigasi'}</div><h3>{r.title}</h3><p>{asset?.name} · {asset?.province} · Prioritas {r.priority} · Tenggat {fmtDate(r.dueDate)}</p><small>{standard?.description}</small><Status tone={r.status === 'Selesai' ? 'success' : r.status === 'Menunggu Verifikasi' ? 'info' : r.status === 'Ditolak' ? 'danger' : 'warning'}>{r.status}</Status>{r.actionNote && <div className="alert-followup">Tindakan tertanggung: {r.actionNote}</div>}{r.reviewNote && <div className="alert-followup">Review: {r.reviewNote}</div>}</div><div className="recommendation-actions">
        {user.role === 'insured' && r.status === 'Menunggu Tindak Lanjut' && <><textarea placeholder="Jelaskan tindakan perbaikan" value={action[r.id] ?? ''} onChange={(e) => setAction({ ...action, [r.id]:e.target.value })} /><Button size="small" variant="primary" disabled={!action[r.id]?.trim()} onClick={() => onUpdateRecommendation(r.id,{ status:'Menunggu Verifikasi', actionNote:action[r.id], evidence:['Foto perbaikan (mock)'] })}><Upload size={13} /> Kirim bukti perbaikan</Button></>}
        {user.role === 'risk' && r.status === 'Menunggu Verifikasi' && <><textarea placeholder="Catatan verifikasi" value={review[r.id] || ''} onChange={(e) => setReview({ ...review, [r.id]:e.target.value })} /><Button size="small" onClick={() => onUpdateRecommendation(r.id,{ status:'Selesai', reviewNote:review[r.id] || 'Bukti perbaikan diterima.' })}><CheckCircle2 size={13} /> Verifikasi selesai</Button><Button size="small" onClick={() => onUpdateRecommendation(r.id,{ status:'Menunggu Tindak Lanjut', reviewNote:review[r.id] || 'Bukti perbaikan belum memadai.' })}>Minta perbaikan</Button></>}
      </div></article>; })}
      {!visible.length && <Empty title="Belum ada rekomendasi" description="Rekomendasi dari Risk Engineering akan muncul di sini." />}
    </Card>
    <Card title="Rapor aset" subtitle="Ringkasan kondisi risiko dan riwayat mitigasi yang dapat menjadi input underwriting.">
      <DataTable columns={['Objek','Risk Score','Status mitigasi','Riwayat rapor']}>
        {assets.filter((a) => user.role !== 'insured' || a.insuredId === user.insuredId).map((a) => <tr key={a.id}><td><b>{a.name}</b><small className="cell-sub">{a.province} · {a.policyNo}</small></td><td><Status tone={riskTone(a.riskScore)}>{a.riskScore} · {riskBand(a.riskScore)}</Status></td><td>{recommendations.filter((r) => r.assetId === a.id).map((r) => <div key={r.id}><Status tone={r.status === 'Selesai' ? 'success' : 'warning'}>{r.status}</Status></div>)}{!recommendations.some((r) => r.assetId === a.id) && 'Belum ada'}</td><td>{rapor.filter((r) => r.assetId === a.id).slice(-2).map((r) => <small key={r.id} className="history-line">{r.date} · {r.text}</small>)}</td></tr>)}
      </DataTable>
    </Card>
    {showForm && <Modal title="Tetapkan rekomendasi mitigasi" subtitle="Pilih library standar, objek, prioritas, dan tenggat." onClose={() => setShowForm(false)}><form className="form-stack" onSubmit={(e) => { e.preventDefault(); const standard = recommendationLibrary.find((x) => x.id === form.standardId); onCreateRecommendation({ ...form, title:standard.title, ownerId:assetById(assets,form.assetId)?.insuredId }); setShowForm(false); }}><FormField label="Objek pertanggungan"><select value={form.assetId} onChange={(e) => setForm({ ...form, assetId:e.target.value })}>{assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></FormField><FormField label="Library rekomendasi"><select value={form.standardId} onChange={(e) => setForm({ ...form, standardId:e.target.value })}>{recommendationLibrary.map((r) => <option key={r.id} value={r.id}>{r.title} · {r.category}</option>)}</select></FormField><FormField label="Prioritas"><select value={form.priority} onChange={(e) => setForm({ ...form, priority:e.target.value })}><option>Tinggi</option><option>Menengah</option><option>Rendah</option></select></FormField><FormField label="Tenggat tindak lanjut"><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate:e.target.value })} /></FormField><div className="modal-actions"><Button onClick={() => setShowForm(false)}>Batal</Button><Button variant="primary" type="submit">Tetapkan rekomendasi</Button></div></form></Modal>}
  </>;
}

function UC10Page({ user, users, assets, sensors, thresholds, assignments, onUpdateAssignment, performance }) {
  const pending = assignments.filter((a) => a.kind === 'survey' && a.status === 'Dikirim');
  const [notes, setNotes] = useState({});
  const [selectedSurveyor, setSelectedSurveyor] = useState('usr-surveyor');
  const completed = assignments.filter((a) => a.kind === 'survey' && ['Final','Verified'].includes(a.status));
  return <>
    <PageTitle eyebrow="UC-10 · SURVEI & MITIGASI RISIKO" title="Verifikasi Hasil Survei & Kinerja Surveyor" description="Bandingkan laporan surveyor dengan data spasial, risk score, dan histori sensor; tetapkan verifikasi serta rekam kinerja." />
    <div className="kpi-grid compact-kpis"><Kpi icon={FileCheck2} label="Menunggu verifikasi" value={pending.length} tone="orange" /><Kpi icon={CheckCircle2} label="Laporan diverifikasi" value={completed.length} tone="green" /><Kpi icon={Users} label="Surveyor terdaftar" value={users.filter((u) => u.role === 'surveyor' && u.active).length} /><Kpi icon={Clock3} label="Tingkat ketepatan waktu" value="92%" tone="purple" /></div>
    <Card title="Antrian verifikasi hasil survei" subtitle="Sistem menandai perbedaan temuan dengan data risiko sebagai bahan review Risk Engineering.">
      {pending.map((task) => { const asset = assetById(assets,task.assetId); const sensor = sensorForAsset(sensors, asset); const sensorAnomaly = Boolean(sensor && (!sensor.online || (sensor.base?.mmi || 0) >= (thresholds?.mmi || 6) || (sensor.base?.water || 0) >= (thresholds?.water || 1.5) || (sensor.base?.temperature || 0) >= (thresholds?.temperature || 65))); const discrepancy = task.condition === 'Baik' && ((asset?.riskScore || 0) >= 70 || sensorAnomaly); return <article className="verification-card" key={task.id}><div><div className="task-id">{task.id} · {asset?.policyNo}</div><h3>{asset?.name}</h3><p>{asset?.province} · Surveyor: {users.find((u) => u.id === task.assignedTo)?.name}</p><div className="comparison-grid"><div><small>Temuan surveyor</small><b>{task.condition || 'Belum diisi'}</b><p>{task.findings || '-'}</p></div><div><small>Data sistem (spasial, risiko & sensor)</small><b>Risk score {asset?.riskScore}/100 · {riskBand(asset?.riskScore || 0)}</b><p>Histori klaim {asset?.claimHistory}/100 · Koordinat {asset?.locationVerified ? 'terverifikasi' : 'perlu verifikasi'}</p><p>Sensor: {sensor ? `${sensor.area} · ${sensor.online ? 'Online' : 'Offline'} · MMI ${sensor.base?.mmi ?? '-'} · Air ${sensor.base?.water ?? '-'} m · ${sensor.telemetryAt || 'Belum ada telemetry'}` : 'Tidak ada sensor terhubung'}</p><p>Histori sensor: {sensor?.history?.slice(-3).reverse().map((h) => `${h.at}: MMI ${h.mmi ?? '-'}, air ${h.water ?? '-'} m`).join(' | ') || 'Belum ada histori telemetry tersimpan.'}</p></div></div>{discrepancy && <div className="inline-warning"><AlertTriangle size={14} /> Perbedaan signifikan: temuan surveyor perlu dibandingkan ulang dengan risk score dan histori sensor.</div>}{task.evidence?.map((x) => <span className="evidence-pill" key={x}><FileImage size={13} /> {x}</span>)}</div><div className="verification-actions"><textarea placeholder="Catatan verifikasi" value={notes[task.id] || ''} onChange={(e) => setNotes({ ...notes, [task.id]:e.target.value })} /><Button size="small" variant="primary" onClick={() => onUpdateAssignment(task.id,{ status:'Final', verification:'Sesuai', reviewNote:notes[task.id] || 'Hasil survei sesuai.' })}>Tetapkan sesuai</Button><Button size="small" onClick={() => onUpdateAssignment(task.id,{ status:'Revisi', verification:'Perlu Revisi', reviewNote:notes[task.id] || 'Mohon klarifikasi perbedaan temuan.' })}>Minta revisi</Button></div></article>; })}
      {!pending.length && <Empty title="Antrian verifikasi kosong" description="Hasil survei eksternal yang dikirim melalui UC-08 akan muncul di sini." />}
    </Card>
    <Card title="Rekam kinerja surveyor" subtitle="Riwayat verifikasi dan ketepatan waktu penyerahan.">
      <div className="toolbar-row"><FormField label="Surveyor"><select value={selectedSurveyor} onChange={(e) => setSelectedSurveyor(e.target.value)}>{users.filter((u) => u.role === 'surveyor').map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></FormField></div>
      {(() => { const rows = assignments.filter((t) => t.assignedTo === selectedSurveyor && t.kind === 'survey'); const verifiedRows = rows.filter((t) => t.status === 'Verified' || t.status === 'Final'); const onTime = rows.filter((t) => t.submittedAt && t.dueDate && t.submittedAt <= t.dueDate).length; return <div className="performance-grid"><div><strong>{verifiedRows.length}</strong><small>Hasil diverifikasi</small></div><div><strong>{rows.length ? Math.round(onTime / rows.length * 100) : 0}%</strong><small>Ketepatan waktu</small></div><div><strong>{verifiedRows.filter((t) => t.verification === 'Sesuai').length}</strong><small>Hasil sesuai</small></div></div>; })()}
      <DataTable columns={['Penugasan','Objek','Hasil verifikasi','Tenggat / Kirim']}>{assignments.filter((t) => t.assignedTo === selectedSurveyor && t.kind === 'survey').map((t) => <tr key={t.id}><td>{t.id}</td><td>{assetById(assets,t.assetId)?.name}</td><td><Status tone={t.verification === 'Sesuai' ? 'success' : t.verification === 'Perlu Revisi' ? 'danger' : 'neutral'}>{t.verification || 'Belum diverifikasi'}</Status></td><td>{fmtDate(t.dueDate)} / {fmtDate(t.submittedAt)}</td></tr>)}</DataTable>
    </Card>
  </>;
}

function UC11Page({ user, assets, selfSurveys, onCreateSelfSurvey, onUpdateSelfSurvey, onReviewSelfSurvey, onNavigate }) {
  const [selectedAsset, setSelectedAsset] = useState('');
  const [answers, setAnswers] = useState({ structure:'', fire:'', water:'', maintenance:'' });
  const [notes, setNotes] = useState('');
  const [reviewNotes, setReviewNotes] = useState({});
  const ownAssets = assets.filter((a) => user.role !== 'insured' ? a.riskScore < 40 : a.insuredId === user.insuredId);
  const visibleSurveys = user.role === 'insured' ? selfSurveys.filter((s) => ownAssets.some((a) => a.id === s.assetId)) : selfSurveys;
  const eligible = ownAssets.filter((a) => a.riskScore < 40);
  const invitedAssetIds = new Set(visibleSurveys.filter((s) => s.status === 'Undangan Terkirim').map((s) => s.assetId));
  const eligibleForForm = user.role === 'insured' ? eligible.filter((a) => invitedAssetIds.has(a.id)) : eligible;
  const submitSurvey = (e) => { e.preventDefault(); if (Object.values(answers).some((x) => !x)) return; const assetId = eligibleForForm.some((a) => a.id === selectedAsset) ? selectedAsset : eligibleForForm[0]?.id; if (!assetId) return; onCreateSelfSurvey(assetId, answers, notes); setAnswers({ structure:'', fire:'', water:'', maintenance:'' }); setNotes(''); };
  return <>
    <PageTitle eyebrow="UC-11 · SURVEI & MITIGASI RISIKO" title="Self-Survey Tertanggung" description="Survei mandiri terpandu untuk objek berisiko rendah, termasuk pengisian formulir, evidence foto, pemeriksaan kelengkapan, dan review." />
    <div className="note-box"><InfoIcon /><span>Self-survey hanya tersedia untuk objek dengan risk score rendah (di bawah 40) yang ditetapkan Risk Engineering. Hasil tetap harus ditinjau Risk Engineering.</span></div>
    {user.role === 'insured' && <Card title="Formulir self-survey" subtitle="Isi kondisi objek yang sudah menerima undangan dari Risk Engineering, kemudian kirim untuk ditinjau.">
      {eligibleForForm.length ? <form onSubmit={submitSurvey} className="form-stack"><FormField label="Objek milik Anda"><select value={selectedAsset && eligibleForForm.some((a) => a.id === selectedAsset) ? selectedAsset : eligibleForForm[0].id} onChange={(e) => setSelectedAsset(e.target.value)}>{eligibleForForm.map((a) => <option key={a.id} value={a.id}>{a.name} · Risk score {a.riskScore}</option>)}</select></FormField><div className="survey-questions">{[['structure','Kondisi struktur bangunan'],['fire','Kondisi proteksi kebakaran'],['water','Kondisi drainase / genangan'],['maintenance','Pemeliharaan fasilitas']].map(([key,label]) => <FormField key={key} label={label}><select value={answers[key]} onChange={(e) => setAnswers({ ...answers, [key]:e.target.value })}><option value="">Pilih kondisi</option><option>Baik</option><option>Perlu Perhatian</option><option>Buruk</option></select></FormField>)}</div><FormField label="Catatan kondisi objek"><textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Jelaskan kondisi yang perlu diketahui Risk Engineering." /></FormField><FormField label="Evidence foto"><input type="file" accept="image/*" multiple onChange={(e) => setNotes((prev) => `${prev}${prev ? '\n' : ''}Evidence: ${Array.from(e.target.files || []).map((f) => f.name).join(', ')}`)} /><small>Untuk prototype, nama file dicatat sebagai metadata demo.</small></FormField><Button variant="primary" type="submit" disabled={Object.values(answers).some((x) => !x)}><Send size={14} /> Kirim self-survey</Button></form> : <Empty title="Belum ada undangan self-survey" description="Risk Engineering perlu memilih objek berisiko rendah dan mengirim undangan melalui UC-08." />}
    </Card>}
    <Card title={user.role === 'insured' ? 'Status self-survey saya' : 'Antrian review self-survey'} subtitle={user.role === 'insured' ? 'Pantau undangan dan hasil pengiriman.' : 'Risk Engineering meninjau kelengkapan serta kondisi objek.'}>
      {visibleSurveys.map((s) => { const a = assetById(assets,s.assetId); return <article className="self-survey-row" key={s.id}><div><b>{a?.name}</b><small>{s.id} · {a?.province} · Risk score {a?.riskScore}</small><Status tone={s.status === 'Disetujui' ? 'success' : s.status === 'Perlu Surveyor' ? 'danger' : 'warning'}>{s.status}</Status><div className="survey-answer-preview">{Object.entries(s.answers || {}).map(([k,v]) => <span key={k}>{k}: <b>{v || 'Belum diisi'}</b></span>)}</div>{s.notes && <small>{s.notes}</small>}{user.role === 'insured' && s.status === 'Undangan Terkirim' && <Button size="small" variant="primary" onClick={() => setSelectedAsset(s.assetId)}>Pilih undangan ini di formulir</Button>}</div>{user.role === 'risk' && s.status === 'Menunggu Review' && <div className="review-actions"><textarea value={reviewNotes[s.id] || ''} onChange={(e) => setReviewNotes({ ...reviewNotes, [s.id]:e.target.value })} placeholder="Catatan review" /><Button size="small" onClick={() => onReviewSelfSurvey(s.id,'Disetujui',reviewNotes[s.id] || 'Self-survey disetujui.')}>Setujui</Button><Button size="small" onClick={() => { onReviewSelfSurvey(s.id,'Perlu Surveyor',reviewNotes[s.id] || 'Kondisi perlu pemeriksaan lapangan.'); onNavigate('UC-08'); }}>Tugaskan surveyor</Button></div>}</article>; })}
      {!visibleSurveys.length && <Empty title="Belum ada self-survey" description="Undangan yang dibuat untuk objek berisiko rendah akan ditampilkan di sini." />}
    </Card>
  </>;
}

function InfoIcon() { return <AlertCircle size={16} />; }

function UC12Page({ users, onUpdateUser, onAddUser, thresholds, onUpdateThresholds, audit, onResetData }) {
  const [tab, setTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);
  const [thresholdDraft, setThresholdDraft] = useState(thresholds);
  const [newUser, setNewUser] = useState({ username:'', name:'', role:'underwriter', department:'', email:'' });
  const [showNew, setShowNew] = useState(false);
  const matrix = [
    ['Risk Engineering','UC-01, 02, 03, 04, 05, 07, 08, 09, 10, 11'],
    ['Underwriter','UC-02, 03, 05'],['Claim Officer','UC-02, 07, 08'],['Surveyor Eksternal','UC-08'],['Adjuster Eksternal','UC-07, 08'],['Tertanggung','UC-04, 09, 11'],['System Administrator','UC-06, 12, 13'],
  ];
  return <>
    <PageTitle eyebrow="UC-12 · ADMINISTRASI & INTEGRASI" title="Pengguna, Konfigurasi & Keamanan" description="Kelola akun demo, role dan hak akses, master/parameter sistem, pengaturan notifikasi, serta audit trail." action={<Button variant="primary" onClick={() => setShowNew(true)}><Plus size={15} /> Tambah pengguna</Button>} />
    <div className="subnav-tabs">{[['users','Pengguna'],['roles','Role & akses'],['config','Konfigurasi'],['audit','Audit trail']].map(([key,label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === 'users' && <Card title="Daftar pengguna" subtitle="Pengguna eksternal memerlukan MFA dan akses terbatas terhadap objek penugasan."><DataTable columns={['Pengguna','Username','Role','Departemen','MFA','Status','Aksi']}>{users.map((u) => <tr key={u.id}><td><b>{u.name}</b><small className="cell-sub">{u.email}</small></td><td>{u.username}</td><td>{u.roleLabel}</td><td>{u.department}</td><td><Status tone={u.mfa ? 'success' : 'warning'}>{u.mfa ? 'Aktif' : 'Belum aktif'}</Status></td><td><Status tone={u.active ? 'success' : 'danger'}>{u.active ? 'Aktif' : 'Nonaktif'}</Status></td><td><Button size="small" onClick={() => setSelectedUser(u)}><Pencil size={13} /> Ubah</Button></td></tr>)}</DataTable></Card>}
    {tab === 'roles' && <Card title="Matriks role dan hak akses" subtitle="Akses menu disesuaikan dengan aktor pada use case diagram."><DataTable columns={['Role / Aktor','Use case yang diizinkan']}>{matrix.map(([role,cases]) => <tr key={role}><td><b>{role}</b></td><td>{cases}</td></tr>)}</DataTable><div className="note-box"><LockKeyhole size={15} /><span>Sistem Inti Asuransi Jasindo, Sistem Data Kebencanaan, serta IoT/Sensor System adalah aktor sistem eksternal, bukan akun login manusia.</span></div></Card>}
    {tab === 'config' && <div className="two-col-grid"><Card title="Parameter risiko & perangkat" subtitle="Pengaturan berikut dibaca oleh monitoring UC-04."><div className="threshold-form"><FormField label="Threshold ketinggian air (m)"><input type="number" step="0.1" value={thresholdDraft.water} onChange={(e) => setThresholdDraft({ ...thresholdDraft, water:Number(e.target.value) })} /></FormField><FormField label="Threshold getaran / MMI"><input type="number" step="0.1" value={thresholdDraft.mmi} onChange={(e) => setThresholdDraft({ ...thresholdDraft, mmi:Number(e.target.value) })} /></FormField><FormField label="Threshold suhu (°C)"><input type="number" value={thresholdDraft.temperature} onChange={(e) => setThresholdDraft({ ...thresholdDraft, temperature:Number(e.target.value) })} /></FormField><FormField label="Batas akumulasi exposure (Rp)"><input type="number" value={thresholdDraft.exposureLimit} onChange={(e) => setThresholdDraft({ ...thresholdDraft, exposureLimit:Number(e.target.value) })} /></FormField><Button variant="primary" onClick={() => onUpdateThresholds(thresholdDraft)}>Simpan parameter</Button></div></Card><Card title="Notifikasi & keamanan" subtitle="Konfigurasi mock untuk demonstrasi role-based access."><div className="settings-list"><div><span><Bell size={16} /> Notifikasi alert</span><Status tone="success">In-app aktif</Status></div><div><span><MessageSquare size={16} /> Email / SMS</span><Status tone="info">Simulasi</Status></div><div><span><ShieldCheck size={16} /> MFA untuk eksternal</span><Status tone="success">Wajib</Status></div><div><span><LockKeyhole size={16} /> Akses berdasarkan objek</span><Status tone="success">Aktif</Status></div></div></Card></div>}
    {tab === 'audit' && <Card title="Audit trail" subtitle="Catatan aktivitas pengguna dan perubahan data yang dilakukan pada prototype."><DataTable columns={['Waktu','Aktor','Aktivitas','Detail']}>{[...audit].reverse().map((a) => <tr key={a.id}><td>{a.at}</td><td>{a.actor}</td><td><b>{a.action}</b></td><td>{a.detail}</td></tr>)}</DataTable><div className="card-footer-actions"><Button variant="danger" onClick={onResetData}><RotateCcw size={14} /> Reset seluruh data demo</Button></div></Card>}
    {selectedUser && <Modal title="Perbarui pengguna" subtitle="Atur status akun dan cakupan role demo." onClose={() => setSelectedUser(null)}><div className="form-stack"><div className="user-profile-line"><span className="avatar">{selectedUser.name.split(' ').map((x) => x[0]).slice(0,2).join('')}</span><span><b>{selectedUser.name}</b><small>{selectedUser.roleLabel}</small></span></div><FormField label="Role"><select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role:e.target.value, roleLabel:roleNames[e.target.value] })}>{Object.entries(roleNames).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></FormField><FormField label="Departemen"><input value={selectedUser.department} onChange={(e) => setSelectedUser({ ...selectedUser, department:e.target.value })} /></FormField><div className="checkbox-line"><label><input type="checkbox" checked={selectedUser.active} onChange={(e) => setSelectedUser({ ...selectedUser, active:e.target.checked })} /> Akun aktif</label><label><input type="checkbox" checked={selectedUser.mfa} onChange={(e) => setSelectedUser({ ...selectedUser, mfa:e.target.checked })} /> MFA aktif</label></div><div className="modal-actions"><Button onClick={() => setSelectedUser(null)}>Batal</Button><Button variant="primary" onClick={() => { onUpdateUser(selectedUser); setSelectedUser(null); }}>Simpan perubahan</Button></div></div></Modal>}
    {showNew && <Modal title="Tambah pengguna demo" subtitle="Buat akun baru untuk kebutuhan uji coba role." onClose={() => setShowNew(false)}><form className="form-stack" onSubmit={(e) => { e.preventDefault(); onAddUser(newUser); setShowNew(false); setNewUser({ username:'', name:'', role:'underwriter', department:'', email:'' }); }}><FormField label="Nama lengkap"><input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name:e.target.value })} required /></FormField><FormField label="Username"><input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username:e.target.value })} required /></FormField><FormField label="Email"><input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email:e.target.value })} required /></FormField><FormField label="Role"><select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role:e.target.value })}>{Object.entries(roleNames).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></FormField><FormField label="Departemen"><input value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department:e.target.value })} /></FormField><div className="note-box"><LockKeyhole size={15} /><span>Akun eksternal diberi penanda MFA dan akses dibatasi sesuai role.</span></div><div className="modal-actions"><Button onClick={() => setShowNew(false)}>Batal</Button><Button variant="primary" type="submit">Tambah akun</Button></div></form></Modal>}
  </>;
}

function UC13Page({ integrations, logs, onSync, onFailIntegration, onInvalidIntegrationData, onUpdateSchedule }) {
  const [details, setDetails] = useState(null);
  return <>
    <PageTitle eyebrow="UC-13 · ADMINISTRASI & INTEGRASI" title="Integrasi Data Eksternal" description="Pantau sinkronisasi data polis, underwriting, klaim, serta sumber data kebencanaan dan telemetry IoT." action={<Button variant="primary" onClick={() => onSync('all')}><RefreshCw size={15} /> Sinkronkan semua</Button>} />
    <div className="integration-grid">{integrations.map((item) => <article className="integration-card" key={item.id}><div className="integration-top"><span className={`integration-icon ${item.type === 'Internal' ? 'internal' : ''}`}>{item.id === 'core' ? <Building2 size={19} /> : item.id === 'iot-gateway' ? <Radio size={19} /> : <Globe2 size={19} />}</span><Status tone={item.status === 'Terhubung' ? 'success' : item.status === 'Gagal' ? 'danger' : 'warning'} dot>{item.status}</Status></div><h3>{item.name}</h3><p>{item.scope}</p><div className="detail-pair"><span>Jenis</span><b>{item.type}</b></div><div className="detail-pair"><span>Arah data</span><b>{item.mode}</b></div><div className="detail-pair"><span>Sinkron terakhir</span><b>{item.lastSync}</b></div><div className="integration-schedule"><label htmlFor={`schedule-${item.id}`}>Jadwal sinkronisasi</label><select id={`schedule-${item.id}`} value={item.schedule || 'Manual'} onChange={(e) => onUpdateSchedule(item.id,e.target.value)}><option>Real-time (simulasi)</option><option>Setiap 5 menit</option><option>Setiap 15 menit</option><option>Setiap 1 jam</option><option>Setiap hari</option><option>Manual</option></select></div><div className="integration-actions"><Button size="small" onClick={() => onSync(item.id)}><RefreshCw size={13} /> Sinkronkan</Button><Button size="small" onClick={() => onFailIntegration(item.id)}>Simulasikan gagal</Button><Button size="small" onClick={() => onInvalidIntegrationData(item.id)}>Uji data invalid</Button><Button size="small" onClick={() => setDetails(details === item.id ? null : item.id)}>Log</Button></div></article>)}</div>
    {details && <Card title={`Riwayat · ${integrations.find((x) => x.id === details)?.name || 'Sumber data'}`} subtitle="Log hanya menampilkan aktivitas sumber integrasi yang dipilih."><DataTable columns={['Waktu','Aktivitas','Status','Detail']}>{logs.filter((log) => log.source === integrations.find((x) => x.id === details)?.name).slice().reverse().map((log) => <tr key={log.id}><td>{log.at}</td><td>{log.action}</td><td><Status tone={log.ok ? 'success' : 'danger'}>{log.ok ? 'Berhasil' : 'Gagal'}</Status></td><td>{log.detail}</td></tr>)}</DataTable><div className="card-footer-actions"><Button onClick={() => setDetails(null)}>Tutup riwayat</Button></div></Card>}
    <Card title="Log integrasi" subtitle="Setiap proses mencatat validasi, status, dan upaya ulang koneksi."><DataTable columns={['Waktu','Sumber','Aktivitas','Status','Detail']}>{[...logs].reverse().map((log) => <tr key={log.id}><td>{log.at}</td><td>{log.source}</td><td>{log.action}</td><td><Status tone={log.ok ? 'success' : 'danger'}>{log.ok ? 'Berhasil' : 'Gagal'}</Status></td><td>{log.detail}</td></tr>)}</DataTable></Card>
    <Card title="Alur integrasi" subtitle="Aktor sistem eksternal dan peran sinkronisasinya."><div className="integration-flow"><div><Building2 size={18} /><b>Sistem Inti Jasindo</b><small>Polis · Underwriting · Klaim</small></div><ArrowRight size={20} /><div><ShieldCheck size={18} /><b>JASINDO</b><small>Validasi · Risk score · Log</small></div><ArrowLeft size={20} /><div><Globe2 size={18} /><b>BMKG · PVMBG · BNPB</b><small>Bahaya · Kejadian · Peringatan</small></div></div><div className="note-box"><AlertCircle size={15} /><span>Seluruh koneksi pada layar ini adalah simulasi antarmuka. Belum ada API atau endpoint produksi yang dihubungkan.</span></div></Card>
  </>;
}

function App() {
  useState(() => { migrateDemoBaseline(); return true; });
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('UC-05');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assets, setAssets] = useDemoState('assets', initialAssets);
  const [sensors, setSensors] = useDemoState('sensors', initialSensors.map((s) => ({ ...s, deviceType:'Multi-hazard node', telemetryAt:stamp(), history:[{ at:'2026-10-31 17:40', ...s.base }] })));
  const [thresholds, setThresholds] = useDemoState('thresholds', initialThresholds);
  const [events, setEvents] = useDemoState('events', initialEvents);
  const [claims, setClaims] = useDemoState('claims', initialClaims);
  const [assignments, setAssignments] = useDemoState('assignments', initialAssignments);
  const [recommendations, setRecommendations] = useDemoState('recommendations', initialRecommendations);
  const [selfSurveys, setSelfSurveys] = useDemoState('self-surveys', initialSelfSurveys);
  const [integrations, setIntegrations] = useDemoState('integrations', initialIntegrations);
  const [audit, setAudit] = useDemoState('audit', initialAudit);
  const [alerts, setAlerts] = useDemoState('alerts', DEFAULT_ALERTS);
  const [decisions, setDecisions] = useDemoState('decisions', []);
  const [rapor, setRapor] = useDemoState('rapor', []);
  const [datasetLogs, setDatasetLogs] = useDemoState('datasets', []);
  const [integrationLogs, setIntegrationLogs] = useDemoState('integration-logs', [{ id:'LOG-001', source:'Sistem Inti Asuransi Jasindo', action:'Sinkronisasi awal', ok:true, at:'2026-10-31 17:40', detail:'Data polis dan objek demo berhasil divalidasi.' }]);
  const [users, setUsers] = useDemoState('users', demoUsers);
  const [gatewayStatus, setGatewayStatus] = useState(true);
  const [activeMapEvent, setActiveMapEvent] = useState(null);
  const [mapSnapshot, setMapSnapshot] = useState(null);
  const [toast, setToast] = useState(null);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const allowed = accessByRole[user?.role] || [];
  const currentGroup = packageGroups.find((g) => g.cases.some((c) => c.id === page));
  const currentCase = packageGroups.flatMap((g) => g.cases).find((c) => c.id === page);

  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 4200); return () => clearTimeout(timer); }, [toast]);

  const notify = (title, message, tone = 'success') => setToast({ title, message, tone });
  const log = (action, detail) => setAudit((prev) => [...prev.slice(-149), { id:idFor('AUD'), actor:user?.name || 'System', action, detail, at:stamp() }]);
  const go = (target) => { setPage(target); setNoticeOpen(false); };
  const login = (username, password) => {
    const code = String(username || '').trim().toUpperCase();
    const found = users.find((u) => (u.username || '').toUpperCase() === code && u.active);
    if (!found || !String(password || '').trim()) return false;
    setUser(found); setPage(landingPageForRole(found.role)); notify('Berhasil masuk', `Pengguna aktif sebagai ${found.roleLabel}.`); return true;
  };
  const switchUser = (nextUser) => { setUser(nextUser); setPage(landingPageForRole(nextUser.role)); notify('Akun demo diganti', `Sekarang menggunakan role ${nextUser.roleLabel}.`); };
  const logout = () => { setUser(null); setPage('UC-05'); };
  const authorizedGo = (target) => { const destination = target === 'home' ? landingPageForRole(user?.role) : target; if (allowed.includes(destination)) go(destination); else notify('Akses dibatasi', `Role ${user.roleLabel} tidak memiliki hak akses ke ${destination}.`, 'error'); };

  const restoreMapSimulation = ({ showToast = true } = {}) => {
    if (mapSnapshot) {
      setSensors((prev) => prev.map((sensor) => {
        const previous = mapSnapshot.sensorStates[sensor.id];
        return previous ? { ...sensor, ...previous, base: { ...(previous.base || {}) }, history: [...(previous.history || [])] } : sensor;
      }));
      setAssets((prev) => prev.map((asset) => {
        const previous = mapSnapshot.assetStates[asset.id];
        return previous ? { ...asset, ...previous } : asset;
      }));
    }
    if (activeMapEvent?.eventId) {
      const eventId = activeMapEvent.eventId;
      setEvents((prev) => prev.map((event) => event.id === eventId ? { ...event, status: 'Selesai' } : event));
      setAlerts((prev) => prev.map((alert) => alert.eventId === eventId ? { ...alert, status: 'Selesai' } : alert));
    }
    const hadSimulation = Boolean(mapSnapshot || activeMapEvent);
    setMapSnapshot(null);
    setActiveMapEvent(null);
    if (hadSimulation) {
      log('Reset simulasi peta', 'Nilai sensor dan risk score dipulihkan; event simulasi ditandai selesai dan tetap tersimpan sebagai histori.');
      if (showToast) notify('Simulasi dihentikan', 'Nilai sensor dan risk score kembali ke kondisi sebelum simulasi. Event tetap tersimpan sebagai histori.', 'success');
    }
  };

  const resetMapSimulation = (options = {}) => restoreMapSimulation(options);

  const runMapSimulation = (event) => {
    if (activeMapEvent?.eventId) {
      const previousEventId = activeMapEvent.eventId;
      setEvents((prev) => prev.map((item) => item.id === previousEventId ? { ...item, status:'Selesai' } : item));
      setAlerts((prev) => prev.map((item) => item.eventId === previousEventId ? { ...item, status:'Selesai' } : item));
    }
    const impacts = getSimulationImpactMap(event, sensors);
    setMapSnapshot((previous) => previous || {
      sensorStates: Object.fromEntries(sensors.map((sensor) => [sensor.id, { base: { ...(sensor.base || {}) }, dataStatus: sensor.dataStatus, telemetryAt: sensor.telemetryAt, pendingSync: Boolean(sensor.pendingSync), history: [...(sensor.history || [])] }])),
      assetStates: Object.fromEntries(assets.map((asset) => [asset.id, { riskScore: asset.riskScore, lastAssessment: asset.lastAssessment, scoreHistory: [...(asset.scoreHistory || [])] }])),
    });
    const nextSensors = applySimulationToSensors(event, sensors);
    setSensors(nextSensors);
    const impactedSensorIds = Object.keys(impacts).filter((id) => ['danger', 'watch'].includes(impacts[id]) && sensors.some((sensor) => sensor.id === id && sensor.online));
    const impactedAssets = assets.filter((asset) => {
      const linked = sensorForAsset(sensors, asset);
      return linked && impactedSensorIds.includes(linked.id) && asset.locationVerified;
    });
    const eventId = idFor('EVT');
    const eventName = `${hazardClass(event.type)} ${event.intensity} ${scaleConfig[event.type].unit} di ${event.region}`;
    const mapEvent = { ...event, eventId, name: eventName };
    setActiveMapEvent(mapEvent);
    const createdEvent = {
      id:eventId, name:eventName, type:hazardClass(event.type), province:event.region, sensorId:event.sensorId, intensity:event.intensity,
      source:'Simulasi peta IoT', occurredAt:stamp(), severity:'Tinggi', status:'Dipantau',
      impactedAssetIds:impactedAssets.map((asset) => asset.id),
      impactedSensorIds, impactMap:impacts, note:'Dampak spasial simulasi dihitung dari jarak titik sensor pada peta prototype. Data ini bukan hasil pengukuran lapangan.',
    };
    setEvents((prev) => [createdEvent, ...prev]);
    if (impactedAssets.length) {
      const newAlerts = impactedAssets.map((asset) => ({
        id:idFor('ALT'), title:`Early warning ${hazardClass(event.type)} · ${asset.province}`,
        assetId:asset.id, province:asset.province, source:'Simulasi peta IoT',
        status:'Belum Dibaca', acknowledged:false, escalated:false,
        channel:'In-app (simulasi)', createdAt:stamp(), followup:'', eventId,
      }));
      setAlerts((prev) => [...newAlerts, ...prev]);
      setAssets((prev) => prev.map((asset) => impactedAssets.some((affected) => affected.id === asset.id)
        ? { ...asset, riskScore:Math.min(100, asset.riskScore + (impacts[sensorForAsset(sensors, asset)?.id] === 'danger' ? 12 : 6)), lastAssessment:today() }
        : asset));
    }
    log('Simulasi risiko geospasial', `${eventName}; ${impactedSensorIds.length} sensor online masuk zona dampak dan ${impactedAssets.length} aset terpetakan.`);
    notify('Simulasi dijalankan', `${impactedSensorIds.length} sensor online dianalisis. ${impactedAssets.length} aset diteruskan ke monitoring dan daftar event.`, impactedAssets.length ? 'warning' : 'success');
  };

  const useSystemData = () => {
    restoreMapSimulation({ showToast: false });
    log('Mode Data Asli dipilih', 'Dashboard menggunakan telemetry terakhir yang tersimpan pada prototype.');
    notify('Mode Data Asli dipilih', 'Tekan “Sinkronkan data sensor” untuk memvalidasi telemetry dan meneruskan hasilnya ke modul terkait.', 'success');
  };

  
  
  const completeSystemMapEvent = (eventId) => {
    const completedEvent = events.find(
      (event) => event.id === eventId
    );

    if (!completedEvent || completedEvent.status === 'Selesai') return;

    // Kelompokkan event yang berasal dari satu sinkronisasi.
    const sameBatch = events.filter((event) =>
      event.id !== eventId &&
      event.status !== 'Selesai' &&
      event.source === completedEvent.source &&
      event.occurredAt === completedEvent.occurredAt &&
      completedEvent.source === 'IoT / Sensor System (data tersimpan)'
    );

    const eventsToComplete = [completedEvent, ...sameBatch];
    const completedIds = new Set(eventsToComplete.map((event) => event.id));

    // Identifikasi provinsi utama dan provinsi sekitar.
    const affectedProvinces = new Set();

    eventsToComplete.forEach((event) => {
      [
        event.province,
        ...(provinceNeighbours[event.province] || [])
      ].filter(Boolean).forEach((province) => {
        affectedProvinces.add(province);
      });
    });

    // Identifikasi sensor yang harus dikembalikan tampilannya.
    const affectedSensorIds = new Set();

    eventsToComplete.forEach((event) => {
      (event.impactedSensorIds || []).forEach((id) => {
        affectedSensorIds.add(id);
      });

      if (event.sensorId) {
        affectedSensorIds.add(event.sensorId);
      }
    });

    sensors
      .filter((sensor) => affectedProvinces.has(sensor.area))
      .forEach((sensor) => affectedSensorIds.add(sensor.id));

    // Hentikan efek threshold pada peta tanpa menghapus telemetry.
    setSensors((prev) => prev.map((sensor) =>
      affectedSensorIds.has(sensor.id)
        ? { ...sensor, suppressThresholdVisual: true }
        : sensor
    ));

    // Tutup semua event dalam batch yang sama.
    setEvents((prev) => prev.map((event) =>
      completedIds.has(event.id)
        ? { ...event, status: 'Selesai', completedAt: stamp() }
        : event
    ));

    setAlerts((prev) => prev.map((alert) =>
      completedIds.has(alert.eventId)
        ? { ...alert, status: 'Selesai' }
        : alert
    ));

    log(
      'Event Data Asli selesai',
      `${eventsToComplete.length} event selesai. Visualisasi dampak dikembalikan ke normal.`
    );

    notify(
      'Kejadian selesai',
      'Zona dampak telah dinonaktifkan. Riwayat telemetry tetap tersimpan.',
      'success'
    );
  };



  const syncSystemData = () => {
    if (!gatewayStatus) {
      notify('Sinkronisasi tertunda', 'Gateway IoT sedang terputus. Periksa koneksi pada UC-06.', 'error');
      log('Sinkronisasi data sensor', 'Gagal: gateway IoT tidak terhubung.');
      return;
    }

    const pendingSensors = sensors.filter((sensor) => sensor.pendingSync);
    if (!pendingSensors.length) {
      log('Sinkronisasi data sensor', 'Tidak ada payload baru yang menunggu sinkronisasi.');
      notify('Tidak ada payload baru', 'Kirim payload dari UC-04 terlebih dahulu, lalu kembali ke UC-05 → Data Asli → Sinkronkan data sensor.', 'info');
      return;
    }

    const at = stamp();
    const invalidSensors = pendingSensors.filter((sensor) => sensor.dataStatus === 'Tidak Valid');
    const offlinePending = pendingSensors.filter((sensor) => !sensor.online && sensor.dataStatus !== 'Tidak Valid');
    const validSensors = pendingSensors.filter((sensor) => sensor.online && sensor.dataStatus !== 'Tidak Valid');
    const breached = [];
    const activeIoTEventAreas = new Set(events.filter((event) => event.type === 'Sensor' && event.status !== 'Selesai').map((event) => event.province));

    validSensors.forEach((sensor) => {
      // Periksa payload yang belum disinkronkan.
      const m = sensor.pendingPayload || sensor.base || {};

      const overThreshold =
        (m.mmi || 0) >= thresholds.mmi ||
        (m.water || 0) >= thresholds.water ||
        (m.temperature || 0) >= thresholds.temperature;

      if (overThreshold && !activeIoTEventAreas.has(sensor.area)) {
        breached.push(sensor);
      }
    });

    
    const validIds = new Set(validSensors.map((sensor) => sensor.id));
    const invalidIds = new Set(invalidSensors.map((sensor) => sensor.id));

    // Terapkan payload ke data utama hanya saat sinkronisasi.
    const committedSensors = sensors.map((sensor) => {
      if (validIds.has(sensor.id)) {
        const payload = sensor.pendingPayload || sensor.base || {};

        return {
          ...sensor,
          base: { ...payload },
          pendingPayload: null,
          pendingTelemetryAt: null,
          pendingSync: false,
          telemetryAt: at,
          dataStatus: 'Valid',
          suppressThresholdVisual: false,
          history: [
            ...(sensor.history || []),
            {
              at,
              ...payload,
              source: 'Sinkronisasi Data Asli'
            }
          ].slice(-20),
        };
      }

      if (invalidIds.has(sensor.id)) {
        return {
          ...sensor,
          pendingPayload: null,
          pendingTelemetryAt: null,
          pendingSync: false,
        };
      }

      // Payload sensor offline tetap menunggu.
      return sensor;
    });

    setSensors(committedSensors);

    // Perbarui risk score menggunakan data yang sudah disinkronkan.
    setAssets((prev) => prev.map((asset) => {
      const sensor = sensorForAsset(committedSensors, asset);

      if (!sensor || !validIds.has(sensor.id) || !asset.locationVerified) {
        return asset;
      }

      const score = getAssetScore(asset, committedSensors).score;

      return {
        ...asset,
        riskScore: score,
        lastAssessment: today(),
      };
    }));


    if (breached.length) {
      const createdEvents = [];
      const createdAlerts = [];
      breached.forEach((sensor) => {
        const linkedAssets = assets.filter((asset) => sensorForAsset(sensors, asset)?.id === sensor.id && asset.locationVerified);
        const eventId = idFor('EVT');
        createdEvents.push({ id:eventId, name:`Threshold sensor terlampaui · ${sensor.area}`, type:'Sensor', province:sensor.area, sensorId:sensor.id, source:'IoT / Sensor System (data tersimpan)', occurredAt:at, severity:'Tinggi', status:'Dipantau', impactedAssetIds:linkedAssets.map((asset) => asset.id), impactedSensorIds:[sensor.id], impactMap:{ [sensor.id]:'danger' }, note:'Data sensor dari sumber tersimpan melewati threshold konfigurasi.' });
        linkedAssets.forEach((asset) => createdAlerts.push({ id:idFor('ALT'), title:`Threshold sensor terlampaui · ${sensor.area}`, assetId:asset.id, province:asset.province, source:'IoT / Sensor System', status:'Belum Dibaca', acknowledged:false, escalated:false, channel:'In-app (simulasi)', createdAt:at, followup:'', eventId }));
      });
      setEvents((prev) => [...createdEvents, ...prev]);
      setAlerts((prev) => [...createdAlerts, ...prev]);
    }

    setIntegrations((prev) => prev.map((item) => item.id === 'iot-gateway' ? { ...item, status:invalidSensors.length ? 'Perlu Pemeriksaan' : 'Terhubung', lastSync:at, retryCount:0 } : item));
    const entry = { id:idFor('LOG'), source:'IoT / Sensor System', action:'Sinkronisasi data sensor ke modul', ok:invalidSensors.length === 0, at, detail:`${validSensors.length} payload valid diproses; ${breached.length} melewati threshold; ${invalidSensors.length} ditolak; ${offlinePending.length} menunggu sensor online.` };
    setIntegrationLogs((prev) => [...prev, entry]);
    log('Sinkronisasi Data Asli', entry.detail);
    const tone = invalidSensors.length ? 'warning' : breached.length ? 'warning' : 'success';
    notify('Sinkronisasi selesai', `${validSensors.length} payload valid diproses, ${breached.length} melewati threshold, ${invalidSensors.length} ditolak, ${offlinePending.length} menunggu sensor kembali online. Hasil tersedia pada UC-03, UC-04, UC-05, dan UC-07.`, tone);
  };

  const saveAsset = (asset) => { setAssets((prev) => { const exists = prev.some((x) => x.id === asset.id); return exists ? prev.map((x) => x.id === asset.id ? { ...x, ...asset } : x) : [...prev, asset]; }); log('Kelola objek pertanggungan', `${asset.name} (${asset.policyNo}) disimpan dengan status ${asset.status}.`); notify('Data objek tersimpan', `${asset.name} berhasil diperbarui.`); };
  const uploadDataset = (name) => { const ok = /\.(geojson|json|csv|zip)$/i.test(name); const entry = { id:idFor('GEO'), name, ok, detail:ok ? 'Format file diterima dan metadata dataset tersimpan (mock).' : 'Format file tidak didukung. Gunakan GeoJSON, JSON, CSV, atau ZIP.' }; setDatasetLogs((prev) => [entry, ...prev]); log('Validasi dataset geospasial', `${name}: ${ok ? 'valid' : 'ditolak'}.`); notify(ok ? 'Dataset tervalidasi' : 'Dataset ditolak', entry.detail, ok ? 'success' : 'error'); };
  const saveScore = (assetId, score, breakdown) => { const asset = assetById(assets, assetId); setAssets((prev) => prev.map((x) => x.id === assetId ? { ...x, riskScore:score, lastAssessment:today(), scoreHistory:[...(x.scoreHistory || []), { score, date:today(), breakdown }] } : x)); log('Risk scoring', `Risk score ${asset?.name} diperbarui menjadi ${score}.`); notify('Risk score diperbarui', `Skor baru ${asset?.name}: ${score}/100.`); };
  const createAlert = (asset, title, source = 'IoT / Sensor System') => { const alert = { id:idFor('ALT'), title, assetId:asset.id, province:asset.province, source, status:'Belum Dibaca', acknowledged:false, escalated:false, channel:'In-app + email (mock)', createdAt:stamp(), followup:'' }; setAlerts((prev) => [alert, ...prev]); setEvents((prev) => [{ id:idFor('EVT'), name:title, type:source.includes('IoT') ? 'Sensor' : 'Bencana', province:asset.province, source, occurredAt:stamp(), severity:'Tinggi', status:'Dipantau', impactedAssetIds:[asset.id], note:'Dihasilkan dari simulasi telemetry.' }, ...prev]); const result = getAssetScore({ ...asset, hazardBase:Math.min(100,(asset.hazardBase || 40) + 8) }, sensors); setAssets((prev) => prev.map((x) => x.id === asset.id ? { ...x, riskScore:result.score, lastAssessment:today() } : x)); log('Early warning dibentuk', `${title} untuk ${asset.name}.`); notify('Early warning terkirim', `${asset.name} masuk daftar alert.`, 'warning'); };
  const updateAlert = (id, patch) => { const existing = alerts.find((a) => a.id === id); setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a)); if (existing && (patch.status === 'Selesai' || patch.status === 'Dieskalasi')) setEvents((prev) => prev.map((e) => (e.impactedAssetIds || []).includes(existing.assetId) ? { ...e, status:patch.status } : e)); log('Tindak lanjut alert', `${id}: ${Object.keys(patch).join(', ')}.`); notify('Status alert diperbarui', patch.status === 'Selesai' ? 'Alert ditutup dan event terkait tidak lagi dihitung sebagai moratorium aktif.' : 'Perubahan status dan catatan sudah dicatat.'); };
  const sendTelemetry = (asset) => {
    if (!gatewayStatus) { notify('Gateway terputus', 'Data telemetry belum dapat diterima sampai koneksi gateway dipulihkan pada UC-06.', 'error'); return; }
    const sensor = sensorForAsset(sensors, asset);
    if (!sensor || !sensor.online) { notify('Telemetry gagal diterima', 'Sensor tidak aktif. Periksa perangkat pada UC-06.', 'error'); return; }
    const at = stamp();
    const nextValue = { ...sensor.base, water:Math.max(sensor.base.water || 0, thresholds.water + 0.6), mmi:Math.max(sensor.base.mmi || 0, thresholds.mmi + 0.4), temperature:Math.max(sensor.base.temperature || 30, thresholds.temperature + 5) };
    setSensors((prev) => prev.map((s) => s.id === sensor.id
      ? {
          ...s,
          pendingPayload: nextValue,
          pendingTelemetryAt: at,
          dataStatus: 'Valid',
          pendingSync: true,
        }
      : s
    ));
    log('Payload telemetry uji diterima', `${sensor.area}: payload disimpan di sensor; menunggu sinkronisasi UC-05.`);
    notify('Payload telemetry tersimpan', `Nilai ${sensor.area} melewati threshold. Buka UC-05 → Data Asli → Sinkronkan data sensor untuk membentuk early warning.`, 'warning');
  };
  
  const sendNormalTelemetry = (asset) => {
    if (!gatewayStatus) {
      notify('Gateway terputus', 'Data telemetry belum dapat diterima sampai koneksi gateway dipulihkan pada UC-06.', 'error');
      return;
    }

    const sensor = sensorForAsset(sensors, asset);

    if (!sensor || !sensor.online) {
      notify('Telemetry gagal diterima', 'Sensor tidak aktif. Periksa perangkat pada UC-06.', 'error');
      return;
    }

    const at = stamp();

    // Gunakan payload terakhir jika masih menunggu sinkronisasi.
    const currentValue = sensor.pendingPayload || sensor.base || {};

    const nextValue = {
      ...currentValue,
      water: Math.min(currentValue.water || 0.2, Math.max(0.1, thresholds.water - 0.8)),
      mmi: Math.min(currentValue.mmi || 2, Math.max(1, thresholds.mmi - 1.5)),
      temperature: Math.min(currentValue.temperature || 30, Math.max(15, thresholds.temperature - 10)),
    };

    setSensors((prev) => prev.map((s) => s.id === sensor.id
      ? {
          ...s,
          pendingPayload: nextValue,
          pendingTelemetryAt: at,
          dataStatus: 'Valid',
          pendingSync: true,
        }
      : s
    ));

    log('Payload telemetry normal diterima', `${sensor.area}: payload berada di bawah threshold; menunggu sinkronisasi UC-05.`);

    notify(
      'Payload normal tersimpan',
      'Nilai berada di bawah threshold. Sinkronkan untuk memperbarui histori telemetry.',
      'success'
    );
  };

  const toggleSensor = (id) => { setSensors((prev) => prev.map((s) => s.id === id ? { ...s, online:!s.online, telemetryAt:stamp() } : s)); const sensor = sensors.find((s) => s.id === id); log('Status perangkat IoT', `${sensor?.area} diubah menjadi ${sensor?.online ? 'offline' : 'online'}.`); notify('Status sensor diperbarui', `${sensor?.area} sekarang ${sensor?.online ? 'offline' : 'online'}.`, sensor?.online ? 'warning' : 'success'); };
  const invalidTelemetry = (id) => { const sensor = sensors.find((s) => s.id === id); if (!sensor) return; setSensors((prev) => prev.map((s) => s.id === id ? { ...s, dataStatus:'Tidak Valid', pendingSync:true, lastValidation:'Payload di luar rentang parameter (simulasi).' } : s)); log('Validasi data sensor', `${sensor.area}: payload ditolak karena tidak sesuai format/rentang.`); notify('Data sensor ditolak', 'Payload tidak valid dicatat dan tidak digunakan dalam perhitungan monitoring.', 'error'); };
  const updateThresholds = (next) => { setThresholds(next); log('Konfigurasi threshold', 'Parameter risiko dan sensor diperbarui.'); notify('Konfigurasi tersimpan', 'Threshold baru akan digunakan pada monitoring.'); };
  const registerSensor = (form) => {
    if (!gatewayStatus) { notify('Registrasi diblokir', 'Hubungkan gateway sebelum mendaftarkan sensor baru.', 'error'); return; }
    const linkedAsset = form.assetId ? assets.find((asset) => asset.id === form.assetId) : null;
    if (linkedAsset && linkedAsset.province !== form.area) { notify('Pengaitan sensor ditolak', 'Sensor dan objek pertanggungan harus berada di provinsi yang sama.', 'error'); return; }
    const baseSensor = initialSensors.find((sensor) => sensor.area === form.area) || initialSensors[0];
    const at = stamp();
    const sensor = { ...baseSensor, id:idFor('iot').toLowerCase(), name:form.name, area:form.area, online:true, deviceType:form.deviceType, base:{ mmi:2.1, water:0.2, vei:0.3, temperature:30 }, telemetryAt:at, history:[{ at, mmi:2.1, water:0.2, vei:0.3, temperature:30 }] };
    setSensors((prev) => [sensor, ...prev]);
    if (linkedAsset) setAssets((prev) => prev.map((asset) => asset.id === linkedAsset.id ? { ...asset, sensorId:sensor.id } : asset));
    log('Registrasi perangkat IoT', `${sensor.name} didaftarkan di ${form.area}${linkedAsset ? ` dan ditautkan ke ${linkedAsset.name}` : ''}.`);
    notify('Sensor berhasil didaftarkan', `${sensor.name} siap dipantau${linkedAsset ? ` untuk ${linkedAsset.name}` : ''}.`);
  };
  const testGateway = () => { setGatewayStatus((prev) => !prev); log('Uji koneksi gateway', `Gateway demo berubah menjadi ${gatewayStatus ? 'terputus' : 'terhubung'}.`); notify('Uji koneksi gateway', gatewayStatus ? 'Koneksi gateway disimulasikan terputus.' : 'Gateway kembali terhubung.', gatewayStatus ? 'warning' : 'success'); };
  const createClaims = (eventId, manualProvince) => {
    const evt = events.find((e) => e.id === eventId);
    const province = evt?.province || manualProvince;
    const eventKey = evt?.id || `MANUAL-${province}`;
    const impactedProvinces = [province, ...(provinceNeighbours[province] || [])];
    const impacted = evt?.impactedAssetIds?.length
      ? assets.filter((asset) => evt.impactedAssetIds.includes(asset.id))
      : assets.filter((asset) => impactedProvinces.includes(asset.province));
    if (!impacted.length) {
      notify('Tidak ada aset terdampak', `Tidak ada objek demo di ${province} dan wilayah sekitar.`, 'warning');
      return;
    }
    const existing = new Set(claims.filter((c) => c.eventId === eventKey).map((c) => c.assetId));
    const newClaims = impacted.filter((asset) => !existing.has(asset.id)).map((asset) => {
      const ratio = asset.province === province ? 0.065 : 0.03;
      return {
        id:idFor('CLM'), eventId:eventKey, province, assetId:asset.id, status:'Potensi Klaim',
        estimateLow:Math.round(asset.sumInsured * ratio * 0.6),
        estimateHigh:Math.round(asset.sumInsured * ratio * 1.4), assessed:0,
        assignedAdjusterId:null, adjustmentStatus:'', adjustmentAmount:0, adjustmentNote:'', createdAt:today(),
      };
    });
    if (newClaims.length) setClaims((prev) => [...newClaims.filter((candidate) => !prev.some((c) => c.eventId === eventKey && c.assetId === candidate.assetId)), ...prev]);
    log('Identifikasi aset terdampak', `${newClaims.length} potensi klaim dibuat untuk wilayah ${province}.`);
    notify('Identifikasi selesai', `${newClaims.length} objek baru berpotensi terdampak di ${province} dan wilayah sekitar.`);
  };
  const assessClaim = (id, amount) => { setClaims((prev) => prev.map((c) => c.id === id ? { ...c, assessed:amount, status:'Assessment Berjalan' } : c)); log('Assessment klaim', `${id} dinilai sebesar ${money(amount)}.`); notify('Assessment disimpan', 'Estimasi assessment klaim berhasil diperbarui.'); };
  const assignAdjuster = (claimId, assignee) => { const claim = claims.find((c) => c.id === claimId); if (!claim) return; const task = { id:idFor('ADJ'), kind:'adjuster', assetId:claim.assetId, claimId, assignedTo:assignee, createdBy:user.id, dueDate:'2026-11-10', status:'Ditugaskan', findings:'', condition:'', evidence:[], submittedAt:null, reviewNote:'', verification:'Menunggu', createdAt:today() }; setAssignments((prev) => [task, ...prev]); setClaims((prev) => prev.map((c) => c.id === claimId ? { ...c, assignedAdjusterId:assignee, status:'Menunggu Adjustment' } : c)); log('Penugasan adjuster', `${claimId} ditugaskan ke ${users.find((u) => u.id === assignee)?.name}.`); notify('Adjuster ditugaskan', 'Akses adjuster dibatasi pada aset yang dipilih.'); };
  const submitAdjustment = (claimId, amount) => { setClaims((prev) => prev.map((c) => c.id === claimId ? { ...c, adjustmentAmount:amount, adjustmentStatus:'Menunggu Review', status:'Menunggu Review' } : c)); log('Adjustment dikirim', `${claimId}: ${money(amount)}.`); notify('Hasil adjustment dikirim', 'Claim Officer dapat meninjau hasil pada UC-07.'); };
  const reviewAdjustment = (claimId, accepted) => { setClaims((prev) => prev.map((c) => c.id === claimId ? { ...c, status:accepted ? 'Selesai' : 'Adjustment Revisi', adjustmentStatus:accepted ? 'Disetujui' : 'Revisi', assessed:accepted ? c.adjustmentAmount : c.assessed } : c)); log('Review adjustment', `${claimId}: ${accepted ? 'disetujui' : 'dikembalikan'}.`); notify('Review adjustment disimpan', accepted ? 'Klaim ditandai selesai.' : 'Adjustment dikembalikan kepada adjuster.', accepted ? 'success' : 'warning'); };
  const createAssignment = ({ kind='survey', assetId, assignee, dueDate, createdBy }) => { const task = { id:idFor(kind === 'adjuster' ? 'ADJ' : 'SUR'), kind, assetId, assignedTo:assignee, createdBy, dueDate, status:'Ditugaskan', findings:'', condition:'', evidence:[], submittedAt:null, reviewNote:'', verification:'Menunggu', createdAt:today() }; setAssignments((prev) => [task, ...prev]); log('Penugasan dibuat', `${task.id} untuk ${assetById(assets,assetId)?.name || assetId}.`); notify('Penugasan dibuat', 'Akses diberikan hanya pada objek yang ditugaskan.'); };
  const updateAssignment = (id, patch) => { const task = assignments.find((x) => x.id === id); setAssignments((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x)); if (task?.kind === 'adjuster' && task.claimId && ['Final','Revisi','Dikirim'].includes(patch.status)) { setClaims((prev) => prev.map((c) => c.id === task.claimId ? { ...c, status:patch.status === 'Final' ? 'Selesai' : patch.status === 'Revisi' ? 'Adjustment Revisi' : 'Menunggu Review', adjustmentStatus:patch.status === 'Final' ? 'Disetujui' : patch.status === 'Revisi' ? 'Revisi' : 'Menunggu Review', adjustmentAmount:patch.adjustmentAmount ?? c.adjustmentAmount, adjustmentNote:patch.findings ?? c.adjustmentNote, assessed:patch.status === 'Final' ? (patch.adjustmentAmount ?? c.assessed) : c.assessed } : c)); } log('Pembaruan penugasan', `${id}: ${patch.status || 'data diperbarui'}.`); notify(patch.status === 'Final' ? 'Penugasan difinalisasi' : patch.status === 'Dikirim' ? 'Hasil berhasil dikirim' : 'Penugasan diperbarui', `${task?.id || id} · ${patch.status || 'perubahan disimpan'}.`); };
  const createRecommendation = (item) => { const rec = { id:idFor('MIT'), ...item, status:'Menunggu Tindak Lanjut', actionNote:'', evidence:[], reviewNote:'', createdAt:today() }; setRecommendations((prev) => [rec, ...prev]); log('Rekomendasi mitigasi ditetapkan', `${rec.title} untuk ${assetById(assets,rec.assetId)?.name}.`); notify('Rekomendasi dikirim', 'Tertanggung dapat melihat rekomendasi pada akunnya.'); };
  const updateRecommendation = (id, patch) => { const existing = recommendations.find((x) => x.id === id); setRecommendations((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x)); if (patch.status === 'Selesai') { const asset = assetById(assets,existing.assetId); const nextScore = Math.max(5, asset.riskScore - 8); setAssets((prev) => prev.map((x) => x.id === asset.id ? { ...x, riskScore:nextScore, lastAssessment:today() } : x)); setRapor((prev) => [...prev, { id:idFor('RAP'), assetId:asset.id, date:today(), text:`Mitigasi ${existing.title} selesai; risk score ${asset.riskScore} → ${nextScore}.` }]); } log('Tindak lanjut mitigasi', `${id}: ${patch.status}.`); notify('Status mitigasi diperbarui', `${id} · ${patch.status}.`); };
  const inviteSelfSurvey = (assetId, createdBy) => {
    const asset = assetById(assets, assetId);
    if (!asset || asset.riskScore >= 40) { notify('Self-survey tidak memenuhi syarat', 'Objek harus memiliki risk score di bawah 40.', 'error'); return; }
    if (selfSurveys.some((s) => s.assetId === assetId && s.status === 'Undangan Terkirim')) { notify('Undangan sudah tersedia', 'Tertanggung sudah memiliki undangan self-survey yang belum diisi.', 'warning'); return; }
    const invitation = { id:idFor('SS'), assetId, ownerId:asset.insuredId, createdBy, status:'Undangan Terkirim', answers:{ structure:'', fire:'', water:'', maintenance:'' }, notes:'', evidence:[], reviewNote:'', createdAt:today() };
    setSelfSurveys((prev) => [invitation, ...prev]);
    log('Undangan self-survey dikirim', `${invitation.id} untuk ${asset.name}.`);
    notify('Undangan self-survey dikirim', `Tertanggung ${asset.insured} dapat mengisi formulir pada UC-11.`);
  };
  const createSelfSurvey = (assetId, answers, notes) => {
    const asset = assetById(assets, assetId);
    if (!asset) return;
    const invitation = selfSurveys.find((s) => s.assetId === assetId && s.ownerId === asset.insuredId && s.status === 'Undangan Terkirim');
    if (invitation) {
      setSelfSurveys((prev) => prev.map((s) => s.id === invitation.id ? { ...s, status:'Menunggu Review', answers, notes, evidence:['Foto kondisi objek (mock)'], submittedAt:today() } : s));
      log('Self-survey dikirim', `${invitation.id} untuk ${asset.name}.`);
      notify('Self-survey terkirim', 'Undangan telah dilengkapi dan hasilnya menunggu review Risk Engineering.');
      return;
    }
    const row = { id:idFor('SS'), assetId, ownerId:asset.insuredId, status:'Menunggu Review', answers, notes, evidence:['Foto kondisi objek (mock)'], reviewNote:'', createdAt:today() };
    setSelfSurveys((prev) => [row, ...prev]);
    log('Self-survey dikirim', `${row.id} untuk ${asset.name}.`);
    notify('Self-survey terkirim', 'Risk Engineering akan meninjau kelengkapan jawaban.');
  };
  const reviewSelfSurvey = (id, status, note) => { setSelfSurveys((prev) => prev.map((s) => s.id === id ? { ...s, status, reviewNote:note } : s)); log('Review self-survey', `${id}: ${status}.`); notify('Review self-survey selesai', note, status === 'Disetujui' ? 'success' : 'warning'); };
  const decision = (assetId, kind, note) => { setDecisions((prev) => [...prev.filter((d) => d.assetId !== assetId), { id:idFor('DEC'), assetId, kind, note, date:today(), actor:user?.name }]); log('Keputusan underwriting / prioritas', `${assetById(assets,assetId)?.name}: ${kind}.`); notify('Keputusan tersimpan', `${kind} telah dicatat.`); };
  const updateUser = (next) => { const saved = { ...next, username: demoCodeByUserId[next.id] || next.username }; setUsers((prev) => prev.map((u) => u.id === next.id ? saved : u)); if (user?.id === next.id) { if (!saved.active) { setUser(null); setPage('UC-05'); } else { setUser(saved); if (saved.role !== user.role) setPage(landingPageForRole(saved.role)); } } log('Administrasi pengguna', `${saved.username}: role ${saved.roleLabel}, status ${saved.active ? 'aktif' : 'nonaktif'}.`); notify('Pengguna diperbarui', `${saved.name} berhasil diperbarui.`); };
  const addUser = (newUser) => {
    const username = String(newUser.username || '').trim();

    if (users.some((u) => String(u.username || '').trim().toLowerCase() === username.toLowerCase())) {
      notify('Username sudah digunakan', 'Gunakan username lain.', 'error');
      return;
    }

    let insuredId = '';

    if (newUser.role === 'insured') {
      const departmentKey = String(newUser.department || '').trim().toLowerCase();

      // Akun dari perusahaan yang sama menggunakan ID tertanggung yang sama.
      const matchingUser = departmentKey
        ? users.find((u) =>
            u.role === 'insured' &&
            String(u.department || '').trim().toLowerCase() === departmentKey &&
            String(u.insuredId || '').trim()
          )
        : null;

      // Hubungkan akun baru ke objek lama milik perusahaan yang sama, bila ada.
      const matchingAsset = departmentKey
        ? assets.find((asset) =>
            String(asset.insured || '').trim().toLowerCase() === departmentKey &&
            String(asset.insuredId || '').trim()
          )
        : null;

      if (matchingUser || matchingAsset) {
        insuredId = String(matchingUser?.insuredId || matchingAsset?.insuredId || '').trim();
      } else {
        // Cari ID berikutnya yang belum digunakan oleh akun maupun objek.
        const usedIds = new Set([
          ...users.map((u) => String(u.insuredId || '').trim()),
          ...assets.map((asset) => String(asset.insuredId || '').trim()),
        ].filter(Boolean));

        let nextNumber = 1;
        do {
          insuredId = `ins-${String(nextNumber).padStart(3, '0')}`;
          nextNumber += 1;
        } while (usedIds.has(insuredId));
      }
    }

    const item = {
      ...newUser,
      username,
      id: idFor('usr'),
      roleLabel: roleNames[newUser.role],
      active: true,
      mfa: ['surveyor', 'adjuster', 'insured'].includes(newUser.role),
      ...(newUser.role === 'insured' ? { insuredId } : {}),
    };

    setUsers((prev) => [...prev, item]);
    log('Administrasi pengguna', `Akun ${username} dibuat${insuredId ? ` dengan ID tertanggung ${insuredId}` : ''}.`);
    notify(
      'Pengguna demo ditambahkan',
      insuredId
        ? `Akun tersimpan dengan ID tertanggung ${insuredId}.`
        : 'Akun tersimpan. Gunakan username yang dibuat dan password non-kosong untuk masuk pada prototype.'
    );
  };
  const syncIntegration = (id) => { const targets = id === 'all' ? integrations.map((x) => x.id) : [id]; setIntegrations((prev) => prev.map((item) => targets.includes(item.id) ? { ...item, status:'Terhubung', lastSync:stamp(), retryCount:0 } : item)); const logs = targets.map((key) => { const item = integrations.find((x) => x.id === key); return { id:idFor('LOG'), source:item?.name || key, action:'Sinkronisasi dan validasi data', ok:true, at:stamp(), detail:'Data simulasi diterima, divalidasi, dan dicatat ke log integrasi.' }; }); setIntegrationLogs((prev) => [...prev,...logs]); log('Sinkronisasi integrasi', `${targets.join(', ')} berhasil disinkronkan.`); notify('Sinkronisasi selesai', `${targets.length} sumber data berhasil diproses (mock).`); };
  const updateIntegrationSchedule = (id, schedule) => { const item = integrations.find((x) => x.id === id); setIntegrations((prev) => prev.map((x) => x.id === id ? { ...x, schedule } : x)); log('Jadwal integrasi diperbarui', `${item?.name || id}: ${schedule}.`); notify('Jadwal tersimpan', `${item?.name || id} · ${schedule}. Jadwal hanya disimpan sebagai konfigurasi demo.`); };
  const failIntegration = (id) => { const item = integrations.find((x) => x.id === id); setIntegrations((prev) => prev.map((x) => x.id === id ? { ...x, status:'Gagal', retryCount:(x.retryCount || 0) + 1 } : x)); setIntegrationLogs((prev) => [...prev,{ id:idFor('LOG'), source:item?.name || id, action:'Simulasi kegagalan koneksi', ok:false, at:stamp(), detail:'Sumber data tidak dapat dihubungi. Administrator perlu memperbaiki konfigurasi atau menjalankan ulang.' }]); log('Kegagalan integrasi', `${item?.name || id} gagal dihubungi.`); notify('Integrasi gagal', 'Sistem mencatat error dan menyiapkan opsi sinkronisasi ulang.', 'error'); };
  const invalidIntegrationData = (id) => { const item = integrations.find((x) => x.id === id); setIntegrations((prev) => prev.map((x) => x.id === id ? { ...x, status:'Perlu Pemeriksaan' } : x)); setIntegrationLogs((prev) => [...prev,{ id:idFor('LOG'), source:item?.name || id, action:'Validasi payload integrasi', ok:false, at:stamp(), detail:'Data diterima tetapi ditolak karena format atau rentang nilai tidak sesuai. Periksa mapping dan jalankan sinkronisasi ulang.' }]); log('Validasi integrasi gagal', `${item?.name || id}: payload tidak valid.`); notify('Data integrasi ditolak', 'Periksa format/mapping sumber data, lalu jalankan sinkronisasi ulang.', 'error'); };
  const resetDemo = () => { if (!window.confirm('Reset seluruh perubahan dan kembalikan data prototype ke kondisi awal?')) return; ['assets','sensors','thresholds','events','claims','assignments','recommendations','self-surveys','integrations','audit','alerts','decisions','rapor','datasets','integration-logs','users'].forEach((k) => { localStorage.removeItem(`${STORAGE_PREFIX}${k}`); localStorage.removeItem(`${LEGACY_STORAGE_PREFIX}${k}`); }); window.location.reload(); };

  if (!user) return <LoginScreen onLogin={login} users={users} />;

  const renderPage = () => {
    const props = { user, assets, sensors, alerts, assignments, recommendations, thresholds };
    switch (page) {
      case 'UC-01': return <UC01Page assets={assets} sensors={sensors} users={users} onSaveAsset={saveAsset} onUploadDataset={uploadDataset} datasetLogs={datasetLogs} onSyncCore={() => syncIntegration('core')} />;
      case 'UC-02': return <UC02Page assets={assets} sensors={sensors} events={events} alerts={alerts} />;
      case 'UC-03': return <UC03Page assets={assets} sensors={sensors} onSaveScore={saveScore} />;
      case 'UC-04': return <UC04Page user={user} assets={assets} sensors={sensors} alerts={alerts} onCreateAlert={createAlert} onUpdateAlert={updateAlert} onTelemetry={sendTelemetry} onNormalTelemetry={sendNormalTelemetry} />;
      case 'UC-05': return <UC05Page user={user} assets={assets} sensors={sensors} events={events} decisions={decisions} onDecision={decision} activeEvent={events.find((e) => e.status !== 'Selesai')} simulationEvent={activeMapEvent} thresholds={thresholds} assignments={assignments} recommendations={recommendations} rapor={rapor} onSimulate={runMapSimulation} onReset={resetMapSimulation} onToggleSensor={toggleSensor} onUseSystemData={useSystemData} onSyncSystemData={syncSystemData} onCompleteEvent={completeSystemMapEvent} alerts={alerts} gatewayStatus={gatewayStatus} />;
      case 'UC-06': return <UC06Page sensors={sensors} assets={assets} thresholds={thresholds} onToggleSensor={toggleSensor} onUpdateThresholds={updateThresholds} onRegisterSensor={registerSensor} onTestGateway={testGateway} onInvalidTelemetry={invalidTelemetry} gatewayStatus={gatewayStatus} />;
      case 'UC-07': return <UC07Page user={user} users={users} assets={assets} claims={claims} events={events} assignments={assignments} onCreateClaims={createClaims} onAssessClaim={assessClaim} onAssignAdjuster={assignAdjuster} onSubmitAdjustment={submitAdjustment} onReviewAdjustment={reviewAdjustment} onNavigate={authorizedGo} />;
      case 'UC-08': return <UC08Page
        user={user}
        users={users}
        assets={assets}
        assignments={assignments}
        decisions={decisions}
        onCreateAssignment={createAssignment}
        onUpdateAssignment={updateAssignment}
        onInviteSelfSurvey={inviteSelfSurvey}
        onNavigate={authorizedGo}
      />;
      case 'UC-09': return <UC09Page user={user} assets={assets} recommendations={recommendations} onCreateRecommendation={createRecommendation} onUpdateRecommendation={updateRecommendation} rapor={rapor} />;
      case 'UC-10': return <UC10Page user={user} users={users} assets={assets} sensors={sensors} thresholds={thresholds} assignments={assignments} onUpdateAssignment={updateAssignment} />;
      case 'UC-11': return <UC11Page user={user} assets={assets} selfSurveys={selfSurveys} onCreateSelfSurvey={createSelfSurvey} onUpdateSelfSurvey={reviewSelfSurvey} onReviewSelfSurvey={reviewSelfSurvey} onNavigate={authorizedGo} />;
      case 'UC-12': return <UC12Page users={users} onUpdateUser={updateUser} onAddUser={addUser} thresholds={thresholds} onUpdateThresholds={updateThresholds} audit={audit} onResetData={resetDemo} />;
      case 'UC-13': return <UC13Page integrations={integrations} logs={integrationLogs} onSync={syncIntegration} onFailIntegration={failIntegration} onInvalidIntegrationData={invalidIntegrationData} onUpdateSchedule={updateIntegrationSchedule} />;
      default: return <UC05Page user={user} assets={assets} sensors={sensors} events={events} decisions={decisions} onDecision={decision} onCompleteEvent={completeSystemMapEvent} activeEvent={events.find((e) => e.status !== 'Selesai')} simulationEvent={activeMapEvent} thresholds={thresholds} assignments={assignments} recommendations={recommendations} rapor={rapor} onSimulate={runMapSimulation} onReset={resetMapSimulation} onToggleSensor={toggleSensor} onUseSystemData={useSystemData} onSyncSystemData={syncSystemData} alerts={alerts} gatewayStatus={gatewayStatus} />;
    }
  };

  return <div className={`app-shell ${sidebarCollapsed ? 'workspace-nav-collapsed' : ''}`}>
    <PackageSidebar activePage={page} onNavigate={authorizedGo} user={user} users={users} allowed={allowed} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onSwitch={switchUser} onLogout={logout} />
    <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onNavigate={authorizedGo} user={user} users={users} allowed={allowed} onSwitch={switchUser} onLogout={logout} />
    <div className="app-main">
      <header className="app-header"><div className="header-left"><div className="mobile-brand"><button className="mobile-menu-trigger" onClick={() => setMobileMenuOpen(true)} aria-label="Buka navigasi"><Menu size={19} /></button><Brand compact /></div><div className="breadcrumb"><span>JASINDO</span><ChevronRight size={13} /><b>{`${page} · ${currentCase?.label || 'Modul'}`}</b></div></div><div className="header-actions"><Status tone="success" dot>Prototype</Status><button className="notification-button" onClick={() => setNoticeOpen(!noticeOpen)} title="Notifikasi"><Bell size={17} />{alerts.filter((a) => !a.acknowledged && a.status !== 'Selesai').length > 0 && <i>{alerts.filter((a) => !a.acknowledged && a.status !== 'Selesai').length}</i>}</button><div className="header-user"><span className="avatar small-avatar">{user.name.split(' ').map((x) => x[0]).slice(0,2).join('')}</span><span><b>{user.name}</b><small>{user.roleLabel}</small></span></div><button className="logout-icon" onClick={logout} title="Keluar"><LogOut size={16} /></button></div>
        {noticeOpen && <div className="notification-popover"><b>Notifikasi terbaru</b>{alerts.slice(0,4).map((a) => <div key={a.id}><AlertTriangle size={14} /><span>{a.title}<small>{a.status} · {a.createdAt}</small></span></div>)}{!alerts.length && <small>Tidak ada notifikasi.</small>}<button onClick={() => authorizedGo('UC-04')}>Buka monitoring</button></div>}
      </header>
      <main className="page-content">{renderPage()}<footer className="page-footer"><span>JASINDO · Sistem Informasi Geospasial</span><span>Data demonstrasi · Integrasi eksternal belum aktif</span></footer></main>
    </div>
    {toast && <div className={`toast toast-${toast.tone}`}><span className="toast-symbol">{toast.tone === 'error' ? <AlertCircle size={18} /> : toast.tone === 'warning' ? <AlertTriangle size={18} /> : toast.tone === 'info' ? <InfoIcon /> : <CheckCircle2 size={18} />}</span><span><b>{toast.title}</b><small>{toast.message}</small></span><button onClick={() => setToast(null)}><X size={15} /></button></div>}
  </div>;
}

export default App;
