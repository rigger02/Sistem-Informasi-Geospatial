import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowLeft, Bell, Building2, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleDot, CloudLightning, Database, Droplets,
  Gauge, Layers3, MapPin, Mountain, Power, Radio, RefreshCw, Search,
  Settings2, ShieldCheck, SlidersHorizontal, Waves, Wifi, WifiOff, X, Zap,
} from 'lucide-react';
import indonesiaMap from './assets/indonesia-map.jpg';
import './legacy-dashboard.css';

export const scaleConfig = {
  earthquake: { label: 'Gempa Bumi', icon: Activity, unit: 'MMI', min: 1, max: 12, step: 1, defaultValue: 7 },
  tsunami: { label: 'Tsunami', icon: Waves, unit: 'm', min: 0.5, max: 12, step: 0.5, defaultValue: 3 },
  volcano: { label: 'Erupsi Gunung Api', icon: Mountain, unit: 'VEI', min: 0, max: 8, step: 1, defaultValue: 4 },
};

const DEFAULT_SUMMARY_AREAS = ['Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau'];

const DEFAULT_LAYERS = { assets: true, sensors: true, hazards: true, exposure: true, satellite: false };
const ISLAND_GROUPS = {
  Sumatera: [
    'Aceh',
    'Sumatera Utara',
    'Sumatera Barat',
    'Riau',
    'Kepulauan Riau',
    'Jambi',
    'Sumatera Selatan',
    'Kepulauan Bangka Belitung',
    'Bengkulu',
    'Lampung',
  ],

  Jawa: [
    'Banten',
    'DKI Jakarta',
    'Jawa Barat',
    'Jawa Tengah',
    'DI Yogyakarta',
    'Jawa Timur',
  ],

  Kalimantan: [
    'Kalimantan Barat',
    'Kalimantan Tengah',
    'Kalimantan Selatan',
    'Kalimantan Timur',
    'Kalimantan Utara',
  ],

  'Bali dan Nusa Tenggara': [
    'Bali',
    'Nusa Tenggara Barat',
    'Nusa Tenggara Timur',
  ],

  Sulawesi: [
    'Sulawesi Utara',
    'Gorontalo',
    'Sulawesi Tengah',
    'Sulawesi Barat',
    'Sulawesi Selatan',
    'Sulawesi Tenggara',
  ],

  Maluku: [
    'Maluku',
    'Maluku Utara',
  ],

  Papua: [
    'Papua',
    'Papua Barat',
    'Papua Barat Daya',
    'Papua Tengah',
    'Papua Pegunungan',
    'Papua Selatan',
  ],
};

export const hazardClass = (type) => ({
  earthquake: 'Gempa', tsunami: 'Tsunami', volcano: 'Erupsi',
  Gempa: 'Gempa', Tsunami: 'Tsunami', Erupsi: 'Erupsi', Sensor: 'Sensor', Bencana: 'Bencana',
}[type] || 'Bencana');

export function riskLevel(metric, value) {
  if (metric === 'mmi') {
    if (value >= 7) return 'danger';
    if (value >= 4) return 'watch';
    return 'safe';
  }
  if (metric === 'water') {
    if (value >= 2) return 'danger';
    if (value >= 0.5) return 'watch';
    return 'safe';
  }
  if (value >= 4) return 'danger';
  if (value >= 2) return 'watch';
  return 'safe';
}

function overallLevel(metrics, online = true) {
  if (!online) return 'offline';
  const levels = [riskLevel('mmi', metrics.mmi || 0), riskLevel('water', metrics.water || 0), riskLevel('vei', metrics.vei || 0)];
  return levels.includes('danger') ? 'danger' : levels.includes('watch') ? 'watch' : 'safe';
}

  function sensorDisplayLevel(sensor, impact) {
    if (!sensor.online) return 'offline';

    // Status event aktif tetap menjadi prioritas.
    if (impact === 'danger' || impact === 'watch') {
      return impact;
    }

    // Sembunyikan warna threshold dari event yang sudah selesai.
    if (sensor.suppressThresholdVisual) {
      return 'safe';
    }

    return overallLevel(sensor.base || {}, true);
  }


function getEventRadii(type, intensity) {
  if (type === 'earthquake') return { danger: 11 + intensity * 0.65, watch: 19 + intensity * 0.85 };
  if (type === 'tsunami') return { danger: 8 + intensity * 1.6, watch: 14 + intensity * 2.2 };
  return { danger: 7 + intensity * 1.2, watch: 14 + intensity * 1.8 };
}

export function getSimulationImpactMap(event, sensors) {
  if (!event) return {};
  const center = sensors.find((sensor) => sensor.id === event.sensorId);
  if (!center) return {};
  const { danger, watch } = getEventRadii(event.type, Number(event.intensity || 0));
  const impacts = {};
  sensors.forEach((sensor) => {
    const dx = sensor.x - center.x;
    const dy = sensor.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (sensor.id === center.id) {
      impacts[sensor.id] = center.online ? 'danger' : 'unknown';
      return;
    }
    if (distance <= danger) impacts[sensor.id] = 'danger';
    else if (distance <= watch) impacts[sensor.id] = 'watch';
  });
  return impacts;
}

export function applySimulationToSensors(event, sensors) {
  if (!event) return sensors;
  const impacts = getSimulationImpactMap(event, sensors);
  const at = new Date().toLocaleString('id-ID');
  return sensors.map((sensor) => {
    const impact = impacts[sensor.id];
    if (!impact || !sensor.online || impact === 'unknown') return sensor;
    const current = sensor.base || { mmi: 2, water: 0.2, vei: 0.2 };
    let next;
    if (event.type === 'earthquake') {
      const target = impact === 'danger'
        ? (sensor.id === event.sensorId ? Number(event.intensity) : Math.max(Number(event.intensity) - 0.5, 7))
        : Math.max(Number(event.intensity) - 2.5, 4.5);
      next = { ...current, mmi: Math.min(12, Math.max(current.mmi || 0, target)) };
    } else if (event.type === 'tsunami') {
      const target = impact === 'danger'
        ? (sensor.id === event.sensorId ? Number(event.intensity) : Math.max(Number(event.intensity) * 0.85, 2.1))
        : Math.max(Number(event.intensity) * 0.45, 0.7);
      next = { ...current, water: Math.min(12, Math.max(current.water || 0, target)) };
    } else {
      const target = impact === 'danger'
        ? (sensor.id === event.sensorId ? Number(event.intensity) : Math.max(Number(event.intensity) - 0.5, 4.1))
        : Math.max(Number(event.intensity) - 2, 2.2);
      next = { ...current, vei: Math.min(8, Math.max(current.vei || 0, target)) };
    }
    return {
      ...sensor,
      base: next,
      telemetryAt: at,
      dataStatus: 'Valid',
      history: [...(sensor.history || []), { at, ...next, source: 'Simulasi bencana' }].slice(-20),
    };
  });
}

function shortArea(area) {
  const mapping = {
    'Sumatera Utara': 'Sumut',
    'Sumatera Barat': 'Sumbar',
    'Sumatera Selatan': 'Sumsel',
    'Kepulauan Riau': 'Kepri',
    'Kepulauan Bangka Belitung': 'Babel',

    'DKI Jakarta': 'DKI',
    'Jawa Barat': 'Jabar',
    'Jawa Tengah': 'Jateng',
    'Jawa Timur': 'Jatim',
    'DI Yogyakarta': 'DIY',

    'Nusa Tenggara Barat': 'NTB',
    'Nusa Tenggara Timur': 'NTT',

    'Kalimantan Barat': 'Kalbar',
    'Kalimantan Tengah': 'Kalteng',
    'Kalimantan Selatan': 'Kalsel',
    'Kalimantan Timur': 'Kaltim',
    'Kalimantan Utara': 'Kaltara',

    'Sulawesi Utara': 'Sulut',
    'Sulawesi Tengah': 'Sulteng',
    'Sulawesi Selatan': 'Sulsel',
    'Sulawesi Tenggara': 'Sultra',
    'Sulawesi Barat': 'Sulbar',

    'Maluku Utara': 'Malut',

    'Papua Barat': 'Papbar',
    'Papua Barat Daya': 'PBD',
    'Papua Tengah': 'Pateng',
    'Papua Pegunungan': 'Papeg',
    'Papua Selatan': 'Pasel',
  };

  return mapping[area] || area;
}

function sensorForAsset(allSensors, asset) {
  if (!asset) return null;
  const exact = allSensors.find((sensor) => sensor.id === asset.sensorId && sensor.area === asset.province);
  return exact || allSensors.find((sensor) => sensor.area === asset.province) || null;
}

// Rasio gambar peta Indonesia.
const MAP_ASPECT_RATIO = 1920 / 1067;

// Jarak ring penempatan objek dari sensor.
const ASSET_PIN_RING_RADII = [2.5, 3, 4, 5, 6];


// Jarak minimum antarmarker.
const ASSET_PIN_MIN_GAP = 3.0;

// Sudut penyebaran agar objek tidak selalu berada pada arah yang sama.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function mapPointDistance(a, b) {
  const dx = a.x - b.x;
  const dy = (a.y - b.y) / MAP_ASPECT_RATIO;

  return Math.hypot(dx, dy);
}

function clampMapPercent(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Menempatkan objek secara melingkar di sekitar sensor provinsi.
 *
 * Satu provinsi dapat memiliki banyak objek.
 * Setiap objek terhubung dengan sensor provinsi yang sama.
 * Posisi objek tidak menggunakan latitude/longitude form.
 * Posisi visual mengikuti koordinat x/y sensor.
 * Sistem menghindari titik sensor dan marker objek lainnya.
 */
function buildAssetPositions(assets, allSensors) {
  const positions = {};
  const occupied = [];

  // Sisihkan semua titik sensor agar marker objek tidak menutupinya.
  allSensors.forEach((sensor) => {
    occupied.push({
      x: Number(sensor.x),
      y: Number(sensor.y),
    });
  });

  // Kelompokkan objek berdasarkan sensor provinsi.
  const provinceGroups = new Map();

  assets.forEach((asset) => {
    const sensor = sensorForAsset(allSensors, asset);

    if (!sensor) {
      positions[asset.id] = { x: 50, y: 50 };
      return;
    }

    if (!provinceGroups.has(sensor.id)) {
      provinceGroups.set(sensor.id, {
        sensor,
        assets: [],
      });
    }

    provinceGroups.get(sensor.id).assets.push(asset);
  });

  // Tempatkan setiap objek mengelilingi sensor.
  provinceGroups.forEach(({ sensor, assets: provinceAssets }) => {
    provinceAssets.forEach((asset, index) => {
      const startAngle = (-Math.PI / 2) + (index * GOLDEN_ANGLE);

      let selected = null;
      let fallback = null;

      // Coba ring terdekat terlebih dahulu.
      for (const radius of ASSET_PIN_RING_RADII) {
        const candidates = [];

        // Uji 72 kemungkinan posisi pada setiap ring.
        for (let step = 0; step < 72; step += 1) {
          const angle = startAngle + ((step / 72) * Math.PI * 2);

          const point = {
            x: Number(sensor.x) + (Math.cos(angle) * radius),
            y: Number(sensor.y) + (
              Math.sin(angle) * radius * MAP_ASPECT_RATIO
            ),
          };

          // Hindari posisi yang terlalu dekat dengan tepi peta.
          if (
            point.x < 2.5 ||
            point.x > 97.5 ||
            point.y < 3 ||
            point.y > 97
          ) {
            continue;
          }

          // Hitung jarak terhadap seluruh marker yang sudah ada.
          const minDistance = occupied.reduce(
            (minimum, other) =>
              Math.min(minimum, mapPointDistance(point, other)),
            Infinity
          );

          const candidate = {
            ...point,
            minDistance,
            radius,
            score: minDistance - (radius * 0.035),
          };

          if (!fallback || candidate.score > fallback.score) {
            fallback = candidate;
          }

          // Posisi diterima jika jaraknya cukup dari marker lain.
          if (minDistance >= ASSET_PIN_MIN_GAP) {
            candidates.push(candidate);
          }
        }

        // Gunakan ring terdekat yang masih memiliki ruang.
        if (candidates.length) {
          candidates.sort(
            (a, b) => b.minDistance - a.minDistance || a.radius - b.radius
          );

          selected = candidates[0];
          break;
        }
      }

      // Fallback jika area sekitar sangat padat.
      const chosen = selected || fallback || {
        x: Number(sensor.x) + 5,
        y: Number(sensor.y),
      };

      const finalPoint = {
        x: clampMapPercent(chosen.x, 2.5, 97.5),
        y: clampMapPercent(chosen.y, 3, 97),
      };

      positions[asset.id] = finalPoint;

      // Simpan posisi agar objek berikutnya tidak menimpanya.
      occupied.push(finalPoint);
    });
  });

  return positions;
}


function pointToRectDistance(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

function rectanglesOverlap(a, b, padding = 0) {
  return !(
    a.right + padding <= b.left ||
    a.left - padding >= b.right ||
    a.bottom + padding <= b.top ||
    a.top - padding >= b.bottom
  );
}

/**
 * Menempatkan nama provinsi di dekat marker IoT.
 * Label berusaha menghindari marker sensor, marker objek, dan label lain.
 */
function buildProvinceLabelPositions(sensors, mapSize) {
  const mapWidth = Number(mapSize?.width) || 0;
  const mapHeight = Number(mapSize?.height) || 0;

  if (!mapWidth || !mapHeight) return [];

  return sensors.map((sensor) => {
    const name = shortArea(sensor.area || sensor.name || 'Provinsi');

    const labelWidth = Math.max(
      40,
      Math.min(90, (name.length * 5.5) + 12)
    );

    const labelHeight = 18;
    const markerHalf = 14.5;
    const gap = 1;

    const sensorX = (Number(sensor.x) / 100) * mapWidth;
    const sensorY = (Number(sensor.y) / 100) * mapHeight;

    const isLeft = [
      'Sumatera Barat',
      'Bengkulu',
      'Lampung',
    ].includes(sensor.area);

    const isBelow = [
      'Lampung',
      'DI Yogyakarta',
      'Nusa Tenggara Barat',
      'Jawa Barat',
      'Banten',
    ].includes(sensor.area);

    // Posisi default: di atas sensor.
    let left = sensorX - (labelWidth / 2);
    let top = sensorY - 28;

    // Geser ke kiri dan sejajarkan dengan bagian tengah sensor.
    if (isLeft) {
      left = sensorX - markerHalf - gap - labelWidth;
      top = sensorY - (labelHeight / 2);
    }

    // Geser ke bawah sensor.
    if (isBelow) {
      top = sensorY + markerHalf + gap;
    }

    return {
      id: sensor.id,
      name,
      left,
      top,
      width: labelWidth,
      height: labelHeight,
    };
  });
}

/**
 * Mencari posisi kartu simulasi yang tidak menutupi marker IoT,
 * objek pertanggungan, atau label nama provinsi.
 */
function buildEventBubblePosition(eventSensor, mapSize, visibleSensors, provinceLabels, assetPoints = []) {
  const mapWidth = Number(mapSize?.width) || 0;
  const mapHeight = Number(mapSize?.height) || 0;
  if (!eventSensor || mapWidth < 220 || mapHeight < 180) return null;

  const cardWidth = Math.min(270, mapWidth - 24);
  const cardHeight = 116;
  const eventX = (Number(eventSensor.x) / 100) * mapWidth;
  const eventY = (Number(eventSensor.y) / 100) * mapHeight;

  const markerPoints = visibleSensors.map((sensor) => ({
    x: (Number(sensor.x) / 100) * mapWidth,
    y: (Number(sensor.y) / 100) * mapHeight,
  }));

  // Tambahkan titik kejadian meskipun sensornya sedang tersembunyi oleh filter.
  markerPoints.push({ x: eventX, y: eventY });

  const labelRects = provinceLabels.map((label) => ({
    left: label.left,
    top: label.top,
    right: label.left + label.width,
    bottom: label.top + label.height,
  }));

  const candidates = [
    { left: eventX + 34, top: eventY - (cardHeight / 2) },
    { left: eventX - cardWidth - 34, top: eventY - (cardHeight / 2) },
    { left: eventX - (cardWidth / 2), top: eventY - cardHeight - 35 },
    { left: eventX - (cardWidth / 2), top: eventY + 35 },
    { left: 12, top: 54 },
    { left: mapWidth - cardWidth - 12, top: 54 },
    { left: 12, top: mapHeight - cardHeight - 48 },
    { left: mapWidth - cardWidth - 12, top: mapHeight - cardHeight - 48 },
    { left: (mapWidth - cardWidth) / 2, top: 54 },
    { left: (mapWidth - cardWidth) / 2, top: mapHeight - cardHeight - 48 },
  ];

  let best = null;

  candidates.forEach((candidate, index) => {
    const left = clampMapPercent(candidate.left, 8, Math.max(8, mapWidth - cardWidth - 8));
    const top = clampMapPercent(candidate.top, 48, Math.max(48, mapHeight - cardHeight - 42));
    const rect = {
      left,
      top,
      right: left + cardWidth,
      bottom: top + cardHeight,
    };

    const centerX = left + (cardWidth / 2);
    const centerY = top + (cardHeight / 2);
    let score = (Math.hypot(centerX - eventX, centerY - eventY) * 0.045) + (index * 0.02);

    markerPoints.forEach((point) => {
      const gap = pointToRectDistance(point.x, point.y, rect);
      if (gap < 25) score += (25 - gap) * 1400;
    });

    assetPoints.forEach((point) => {
      const gap = pointToRectDistance(point.x, point.y, rect);
      if (gap < 20) score += (20 - gap) * 700;
    });

    labelRects.forEach((labelRect) => {
      if (rectanglesOverlap(rect, labelRect, 4)) score += 18000;
    });

    if (!best || score < best.score) {
      best = { left, top, width: cardWidth, score };
    }
  });

  return best;
}

function Metric({ icon: Icon, label, value, unit, level }) {
  return <div className={`metric ${level}`}><div><Icon size={13} /><span>{label}</span></div><strong>{value}</strong><small>{unit}</small></div>;
}

function LayerCheckboxes({ layers, setLayers }) {
  const layerGroups = [
    {
      title: 'Data peta',
      items: [
        ['assets', 'Objek pertanggungan'],
        ['sensors', 'Perangkat sensor IoT'],
      ],
    },
    {
      title: 'Layer analisis',
      items: [
        ['hazards', 'Zona bahaya'],
        ['exposure', 'Exposure portofolio'],
        ['satellite', 'Citra satelit (demo)'],
      ],
    },
  ];

  return <div className="legacy-layer-list">
    {layerGroups.map((group) => <section className="legacy-layer-group" key={group.title}>
      <strong className="legacy-layer-group-title">{group.title}</strong>
      {group.items.map(([key, label]) => <label key={key}>
        <span><Layers3 size={14} />{label}</span>
        <input
          type="checkbox"
          checked={Boolean(layers[key])}
          onChange={(e) => setLayers((prev) => ({
            ...prev,
            [key]: e.target.checked,
          }))}
        />
      </label>)}
    </section>)}
    <p className="legacy-layer-note">
      Zona bahaya menampilkan area dampak saat simulasi atau event aktif.
      Citra satelit merupakan perubahan tampilan visual peta dasar prototype,
      bukan citra satelit aktual.
    </p>
  </div>;
}

function FilterFields({
  sensors,
  filterLine,
  setFilterLine,
  filterIsland,
  setFilterIsland,
  filterProvince,
  setFilterProvince,
}) {
  const provinces = [...new Set(sensors.map((sensor) => sensor.area))]
    .filter((province) =>
      filterIsland === 'Semua' ||
      ISLAND_GROUPS[filterIsland]?.includes(province)
    )
    .sort((a, b) => a.localeCompare(b, 'id'));

  return (
    <div className="legacy-filter-fields">
      <label>Lini produk
        <select
          value={filterLine}
          onChange={(e) => setFilterLine(e.target.value)}
        >
          <option value="Semua">Semua lini</option>
          {['Property', 'Engineering', 'Energy Onshore', 'Energy Offshore'].map((line) => (
            <option key={line}>{line}</option>
          ))}
        </select>
      </label>

      <label>Pulau
        <select
          value={filterIsland}
          onChange={(e) => {
            setFilterIsland(e.target.value);
            setFilterProvince('Semua');
          }}
        >
          <option value="Semua">Semua pulau</option>
          {Object.keys(ISLAND_GROUPS).map((island) => (
            <option key={island} value={island}>
              {island}
            </option>
          ))}
        </select>
      </label>

      <label>Wilayah / provinsi
        <select
          value={filterProvince}
          onChange={(e) => setFilterProvince(e.target.value)}
        >
          <option value="Semua">Semua wilayah</option>
          {provinces.map((province) => (
            <option key={province}>{province}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

function SimulationPanel({ sensors, onSimulate, activeEvent, onReset, mode, onSyncSystemData }) {
  const areas = useMemo(() => sensors.map((sensor) => sensor.area), [sensors]);
  const [region, setRegion] = useState('Aceh');
  const [type, setType] = useState('earthquake');
  const [intensity, setIntensity] = useState(scaleConfig.earthquake.defaultValue);
  const config = scaleConfig[type];
  const onlineCount = sensors.filter((sensor) => sensor.online).length;
  useEffect(() => setIntensity(scaleConfig[type].defaultValue), [type]);
  useEffect(() => { if (!areas.includes(region) && areas.length) setRegion(areas[0]); }, [areas, region]);
  const submit = (e) => {
    e.preventDefault();
    if (activeEvent) {
      onReset?.();
      return;
    }
    const sensor = sensors.find((item) => item.area === region) || sensors[0];
    if (!sensor) return;
    onSimulate({ region, type, intensity: Number(intensity), sensorId: sensor.id, createdAt: new Date().toISOString() });
  };

  return <div className="right-panel-content simulation-panel-content">
    <div className="side-panel-scroll">
      {mode === 'simulation' ? <>
        <div className="panel-heading"><div><span className="eyebrow">PENGUJIAN</span><h3><SlidersHorizontal size={18} /> Simulasi Bencana</h3></div><span className="demo-chip">DEMO</span></div>
        <form className="sim-form" onSubmit={submit}>
          <label>Daerah / Provinsi<div className="select-wrap"><MapPin size={15} /><select value={region} onChange={(e) => setRegion(e.target.value)}>{areas.map((area) => <option key={area}>{area}</option>)}</select><ChevronDown size={14} /></div></label>
          <label>Jenis bencana<div className="hazard-tabs">{Object.entries(scaleConfig).map(([key, item]) => { const Icon = item.icon; return <button type="button" className={type === key ? 'active' : ''} key={key} onClick={() => setType(key)}><Icon size={16} /><span>{item.label.replace(' Bumi', '').replace(' Gunung Api', '')}</span></button>; })}</div></label>
          <label>Skala simulasi <span className="unit-pill">{config.unit}</span><div className="range-row"><input type="range" min={config.min} max={config.max} step={config.step} value={intensity} onChange={(e) => setIntensity(e.target.value)} /><output>{intensity}</output></div>
            <small>{type === 'earthquake' ? 'MMI 7+ menjadi zona bahaya. Sensor online di provinsi sekitar dapat ikut terdampak.' : type === 'tsunami' ? 'Ketinggian air 2 m+ menjadi zona bahaya. Wilayah sekitar dapat masuk zona siaga.' : 'VEI 4+ menjadi zona bahaya. Sensor online di sekitar pusat erupsi dapat ikut siaga.'}</small>
          </label>
          <button className={`danger-btn ${activeEvent ? 'stop-simulation-btn' : ''}`} type="submit">
            {activeEvent ? <><RefreshCw size={17} /> Hentikan simulasi & pulihkan data</> : <><Zap size={17} /> Jalankan simulasi</>}
          </button>
        </form>
        {activeEvent && <div className="active-event-card"><div><span className="event-pulse" /><strong>Simulasi sedang aktif</strong></div><p>{hazardClass(activeEvent.type)} · {activeEvent.region} · {activeEvent.intensity} {scaleConfig[activeEvent.type]?.unit || ''}</p><small>Gunakan tombol merah di atas untuk mengakhiri simulasi dan mengembalikan kondisi sensor serta risk score.</small></div>}
        <div className="panel-note"><AlertTriangle size={15} /><p>Jika sensor di pusat kejadian offline, kondisi titik tersebut tetap tidak diketahui. Sensor online di sekitar tetap dievaluasi berdasarkan jarak titik pada peta.</p></div>
      </> : <>
        <div className="panel-heading"><div><span className="eyebrow">MONITORING</span><h3><Radio size={18} /> Data Sensor</h3></div><span className="demo-chip">LOKAL</span></div>
        <div className="system-data-summary">
          <div><span>Sensor online</span><strong>{onlineCount} / {sensors.length}</strong></div>
          <div><span>Sensor offline</span><strong>{sensors.length - onlineCount}</strong></div>
          <div><span>Menunggu sinkronisasi</span><strong>{sensors.filter((sensor) => sensor.pendingSync).length}</strong></div>
          <div><span>Payload tidak valid</span><strong>{sensors.filter((sensor) => sensor.dataStatus === 'Tidak Valid').length}</strong></div>
        </div>
        <div className="panel-note system-note"><Bell size={15} /><p>Mode Data Asli memproses payload baru yang sudah disimpan dari UC-04 / perangkat demo. Peta dan ringkasan tetap sama. Sinkronisasi tidak mengambil data langsung dari perangkat fisik atau API produksi.</p></div>
        <div className="sync-system-action"><button className="primary-sync-btn" onClick={onSyncSystemData}><RefreshCw size={16} /> Sinkronkan data sensor</button><small>Hanya payload yang berstatus menunggu sinkronisasi yang diproses. Hasil valid diteruskan ke UC-03, UC-04, dan UC-07.</small></div>
        <div className="panel-note system-note"><Check size={15} /><p>Jika payload melebihi threshold, UC-05 membentuk event dan early warning. Jika semua nilai normal, sistem hanya memperbarui histori telemetry tanpa membuat alert.</p></div>
      </>}
    </div>
  </div>;
}

function DashboardPanel({ sensors, selectedAreas, setSelectedAreas, impactMap, alerts }) {
  const [showPicker, setShowPicker] = useState(false);
  const visible = sensors.filter((sensor) => selectedAreas.includes(sensor.area));
  const toggleArea = (area) => setSelectedAreas((prev) => prev.includes(area) ? (prev.length > 1 ? prev.filter((item) => item !== area) : prev) : [...prev, area]);
  const activeAlerts = alerts.filter((alert) => alert.status !== 'Selesai').length;
  return <div className="right-panel-content dashboard-panel-content side-panel-scroll">
    <div className="panel-heading"><div><span className="eyebrow">RINGKASAN</span><h3><Gauge size={18} /> Kondisi Wilayah</h3></div><button className="icon-btn" onClick={() => setShowPicker(!showPicker)} title="Atur provinsi"><Settings2 size={17} /></button></div>
    <div className="dashboard-kpis"><div><small>Provinsi ditampilkan</small><strong>{selectedAreas.length}</strong></div><div><small>Alert aktif</small><strong>{activeAlerts}</strong></div></div>
    <button className="filter-summary" onClick={() => setShowPicker(!showPicker)}><span><CircleDot size={14} /> Pilih provinsi ringkasan</span><ChevronDown size={15} /></button>
    {showPicker && <div className="area-picker"><div className="picker-head"><span>Pilih provinsi</span><button onClick={() => setShowPicker(false)} aria-label="Tutup"><X size={14} /></button></div><div className="picker-list">{sensors.map((sensor) => <label key={sensor.id}><input type="checkbox" checked={selectedAreas.includes(sensor.area)} onChange={() => toggleArea(sensor.area)} /><span>{sensor.area}</span></label>)}</div></div>}
    <div className="dashboard-scroll">
      {visible.map((sensor) => {
        const m = sensor.base || { mmi: 0, water: 0, vei: 0 };
        const impact = impactMap[sensor.id];
        const level = sensorDisplayLevel(sensor, impact);
        return <article className="region-card" key={sensor.id}>
          <div className="region-card-head"><div><strong>{sensor.area}</strong><span>{sensor.name}</span></div><span className={`risk-pill ${level}`}>{level === 'danger' ? 'Bahaya' : level === 'watch' ? 'Siaga' : level === 'offline' ? 'Offline' : 'Aman'}</span></div>
          <div className="metric-grid"><Metric icon={Activity} label="Gempa" value={(m.mmi || 0).toFixed(1)} unit="MMI" level={sensor.online ? riskLevel('mmi', m.mmi || 0) : 'offline'} /><Metric icon={Droplets} label="Air" value={(m.water || 0).toFixed(2)} unit="m" level={sensor.online ? riskLevel('water', m.water || 0) : 'offline'} /><Metric icon={Mountain} label="Erupsi" value={(m.vei || 0).toFixed(1)} unit="VEI" level={sensor.online ? riskLevel('vei', m.vei || 0) : 'offline'} /></div>
          <div className="region-subnote">{!sensor.online ? 'Sensor offline. Kondisi detail di provinsi ini belum dapat dipastikan.' : impact === 'danger' ? 'Sensor online berada pada zona bahaya simulasi.' : impact === 'watch' ? 'Sensor online berada pada zona siaga / terdampak sekunder.' : sensor.dataStatus === 'Tidak Valid' ? 'Payload terakhir ditolak karena tidak valid.' : 'Pemantauan sensor tersedia.'}</div>
        </article>;
      })}
    </div>
  </div>;
}


function provinceImpactMap(event, assets, sensors, provinceNeighbours = {}) {
  if (!event) return {};

  // Pertahankan status sensor dari event.
  const impacts = event.impactMap && typeof event.impactMap === 'object'
    ? { ...event.impactMap }
    : {};

  const impactedSensorIds = new Set(event.impactedSensorIds || []);
  const impactedAssetIds = new Set(event.impactedAssetIds || []);

  // Wilayah utama yang terdampak.
  const primaryProvinces = new Set([
    event.region,
    event.province,
    ...sensors
      .filter((sensor) => impactedSensorIds.has(sensor.id))
      .map((sensor) => sensor.area),
    ...assets
      .filter((asset) => impactedAssetIds.has(asset.id))
      .map((asset) => asset.province),
    ...sensors
      .filter((sensor) => impacts[sensor.id] === 'danger')
      .map((sensor) => sensor.area),
  ].filter(Boolean));

  // Provinsi tetangga menjadi zona siaga (oranye).
  const secondaryProvinces = new Set(
    [...primaryProvinces].flatMap(
      (province) => provinceNeighbours[province] || []
    )
  );

  sensors.forEach((sensor) => {
    if (!sensor.online || impacts[sensor.id]) return;

    if (
      impactedSensorIds.has(sensor.id) ||
      primaryProvinces.has(sensor.area)
    ) {
      impacts[sensor.id] = 'danger';
    } else if (secondaryProvinces.has(sensor.area)) {
      impacts[sensor.id] = 'watch';
    }
  });

  return impacts;
}


function MapLayersPopover({
  open,
  sensors,
  filterLine,
  setFilterLine,
  filterIsland,
  setFilterIsland,
  filterProvince,
  setFilterProvince,
  layers,
  setLayers,
  onClose,
}) {
  if (!open) return null;
  return <div className="map-layers-popover">
    <div className="map-layers-popover-head"><b>Filter & layer peta</b><button onClick={onClose} title="Tutup"><X size={15} /></button></div>
    <FilterFields
      sensors={sensors}
      filterLine={filterLine}
      setFilterLine={setFilterLine}
      filterIsland={filterIsland}
      setFilterIsland={setFilterIsland}
      filterProvince={filterProvince}
      setFilterProvince={setFilterProvince}
    />
    <LayerCheckboxes layers={layers} setLayers={setLayers} />
  </div>;
}

function IndonesiaMap({
  sensors,
  allSensors,
  assets,
  allAssets = assets,
  activeEvent,
  impactMap,
  onSensorClick,
  onAssetClick,
  focusedSensor,
  searchQuery,
  layers,
  satellite,
}) {
  const mapInnerRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = mapInnerRef.current;
    if (!node) return undefined;

    const updateSize = () => {
      const width = node.clientWidth || 0;
      const height = node.clientHeight || 0;
      if (!width || !height) return;

      setMapSize((current) => (
        Math.abs(current.width - width) < 1 && Math.abs(current.height - height) < 1
          ? current
          : { width, height }
      ));
    };

    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const eventRegion = activeEvent?.region || activeEvent?.province;
  const eventSensor = activeEvent
    ? (allSensors.find((sensor) => sensor.id === activeEvent.sensorId)
      || allSensors.find((sensor) => sensor.area === eventRegion))
    : null;

  const scale = focusedSensor ? 1.48 : 1;
  const origin = focusedSensor ? `${focusedSensor.x}% ${focusedSensor.y}%` : '50% 50%';

  const assetGroups = Object.values(assets.reduce((acc, asset) => {
    if (!acc[asset.province]) acc[asset.province] = [];
    acc[asset.province].push(asset);
    return acc;
  }, {}));

  const heatItems = assetGroups.map((group) => {
    const province = group[0].province;
    const sensor = sensorForAsset(allSensors, group[0]);
    if (!sensor) return null;

    const exposure = group.reduce((sum, asset) => sum + Number(asset.sumInsured || 0), 0);
    let level = 'unknown';

    if (sensor.online && sensor.dataStatus !== 'Tidak Valid') {
      level = sensorDisplayLevel(sensor, impactMap[sensor.id]);
    }

    const size = Math.max(48, Math.min(118, 46 + Math.sqrt(exposure / 1e9) * 1.45));
    return { province, sensor, exposure, size, level };
  }).filter(Boolean);

  const visibleAssets = layers.assets ? assets : [];
  const visibleSensorItems = layers.sensors ? sensors : [];

  const assetPositions = useMemo(
    () => buildAssetPositions(allAssets, allSensors),
    [allAssets, allSensors],
  );

  const assetMarkerPoints = useMemo(
    () => visibleAssets.map((asset) => {
      const position = assetPositions[asset.id];
      if (!position || !mapSize.width || !mapSize.height) return null;
      return {
        x: (Number(position.x) / 100) * mapSize.width,
        y: (Number(position.y) / 100) * mapSize.height,
      };
    }).filter(Boolean),
    [visibleAssets, assetPositions, mapSize],
  );

  const provinceLabelPositions = useMemo(
    () => (layers.sensors
      ? buildProvinceLabelPositions(visibleSensorItems, mapSize, assetMarkerPoints)
      : []),
    [layers.sensors, visibleSensorItems, mapSize, assetMarkerPoints],
  );

  const eventName = activeEvent?.name || `${hazardClass(activeEvent?.type)} · ${eventRegion || ''}`;

  return <div className={`map-viewport ${satellite ? 'satellite-view' : ''}`}>
    <div className="map-grid-lines" />
    <div
      ref={mapInnerRef}
      className={`map-inner ${satellite ? 'satellite-map' : ''}`}
      style={{
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: origin,
      }}
    >
      <img className="indonesia-base-map" src={indonesiaMap} alt="Peta Indonesia" />

      {layers.exposure && heatItems.map((item) => (
        <div
          key={`heat-${item.province}`}
          className={`province-exposure-cloud ${item.level}`}
          style={{
            left: `${item.sensor.x}%`,
            top: `${item.sensor.y}%`,
            width: `${item.size}px`,
            height: `${item.size}px`,
          }}
          title={`${item.province} · exposure ${new Intl.NumberFormat('id-ID').format(item.exposure)} · ${item.level === 'unknown' ? 'telemetry belum tersedia' : item.level}`}
        />
      ))}

      {layers.hazards && activeEvent && eventSensor && (
        <div className="impact-layer" style={{ left: `${eventSensor.x}%`, top: `${eventSensor.y}%` }}>
          <span className="impact-ring tertiary" />
          <span className="impact-ring secondary" />
          <span className="impact-ring primary" />
        </div>
      )}

      {provinceLabelPositions.map((label) => (
        <div
          key={`province-label-${label.id}`}
          className="province-name-label"
          style={{
            left: `${label.left}px`,
            top: `${label.top}px`,
            width: `${label.width}px`,
            minHeight: `${label.height}px`,
          }}
          title={label.name}
        >
          {label.name}
        </div>
      ))}

      {visibleAssets.map((asset) => {
        const sensor = sensorForAsset(allSensors, asset);
        const position = assetPositions[asset.id] || {
          x: sensor?.x ?? 50,
          y: sensor?.y ?? 50,
        };

        return (
          <button
            key={asset.id}
            className={`asset-map-pin ${
              asset.locationVerified
                ? `risk-${asset.riskScore >= 70 ? 'high' : asset.riskScore >= 40 ? 'medium' : 'low'}`
                : 'unverified'
            }`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            onClick={() => onAssetClick(asset)}
            aria-label={`${asset.name}, ${asset.province}`}
          >
            <Building2 size={6} />
            <span>{asset.name}</span>
          </button>
        );
      })}

      {visibleSensorItems.map((sensor) => {
        const impact = impactMap[sensor.id];
        const status = sensorDisplayLevel(sensor, impact);
        
        const labelLeft = ['Sumatera Barat', 'Bengkulu', 'Lampung'].includes(sensor.area);
        const labelBelow = ['Lampung', 'DI Yogyakarta', 'Nusa Tenggara Barat','Jawa Barat','Banten'].includes(sensor.area);

        return <React.Fragment key={sensor.id}>
          {impact && impact !== 'unknown' && sensor.online && (
            <div
              className={`province-halo ${impact}`}
              style={{ left: `${sensor.x}%`, top: `${sensor.y}%` }}
              aria-hidden="true"
            />
          )}
          <button
            className={`iot-marker ${status} ${focusedSensor?.id === sensor.id ? 'focused' : ''} ${labelLeft ? 'label-left' : ''} ${labelBelow ? 'label-below' : ''}`}
            style={{ left: `${sensor.x}%`, top: `${sensor.y}%` }}
            onClick={() => onSensorClick(sensor)}
            aria-label={`Sensor IoT ${sensor.area} · ${status}`}
          >
            <span className="marker-ripple" />
            <Radio size={10} />
          </button>
        </React.Fragment>;
      })}

      {layers.hazards && activeEvent && eventSensor && (
      <div
        className="map-event-notification"
        role="status"
        aria-live="polite"
      >
        <div className="map-event-notification-head">
          <span className="map-event-notification-dot" />
          <strong>KEJADIAN TERDETEKSI</strong>
        </div>

        <b>{eventName}</b>

        <span>
          {activeEvent.intensity
            ? `Skala ${activeEvent.intensity} ${scaleConfig[activeEvent.type]?.unit || ''}`
            : eventSensor.area}
        </span>

        <small>
          {eventSensor.online
            ? 'Zona dampak mengikuti status sensor di titik dan wilayah sekitar.'
            : 'Sensor di titik kejadian offline. Kondisi titik tersebut tidak diketahui.'}
        </small>
      </div>
      )}
    </div>

    <div className="map-legend">
      <span><i className="legend-dot safe" /> Normal</span>
      <span><i className="legend-dot watch" /> Siaga</span>
      <span><i className="legend-dot offline" /> Offline / tidak diketahui</span>
      <span><i className="legend-dot danger" /> Bahaya</span>
      {layers.assets && <span><Building2 size={11} /> Objek</span>}
    </div>
  </div>;
}

function SensorControl({ sensor, onBack, onToggle, readOnly = false }) {
  const [connecting, setConnecting] = useState(false);
  const toggle = async () => {
    if (connecting || readOnly) return;
    setConnecting(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    onToggle(sensor.id);
    setConnecting(false);
  };
  const m = sensor.base || { mmi: 0, water: 0, vei: 0 };
  return <div className="sensor-overlay"><div className="sensor-modal">
    <div className="sensor-modal-head"><button className="back-btn" onClick={onBack}><ArrowLeft size={17} /> Kembali ke peta</button><span className={`connection-badge ${sensor.online ? 'online' : 'offline'}`}>{sensor.online ? <Wifi size={14} /> : <WifiOff size={14} />}{sensor.online ? 'Terhubung' : 'Offline'}</span></div>
    <div className="sensor-title"><div><span className="eyebrow">PERANGKAT IoT</span><h2>{sensor.area}</h2><p>{sensor.name} · Sensor ID IOT-{sensor.id.toUpperCase()}-01</p></div><div className="mini-signal"><Activity size={19} /><strong>{(m.mmi || 0).toFixed(1)}</strong><span>MMI</span></div></div>
    {!readOnly ? <div className="connection-scene"><div className={`endpoint device ${connecting ? 'active' : ''}`}><div className="endpoint-icon"><Radio size={31} /></div><strong>Sensor IoT</strong><span>{sensor.online ? 'Data tersedia' : 'Tidak ada sinyal'}</span></div><div className={`signal-path ${connecting ? 'transmitting' : ''}`}><div className="path-line"><i /><i /><i /></div><button className={`power-switch ${sensor.online ? 'on' : 'off'}`} onClick={toggle} disabled={connecting}><Power size={25} /><span>{connecting ? 'Memproses...' : sensor.online ? 'Matikan' : 'Hubungkan'}</span></button><small>{connecting ? 'Mengubah status koneksi perangkat' : 'Ubah status perangkat demo'}</small></div><div className={`endpoint center ${connecting ? 'active' : ''}`}><div className="endpoint-icon"><Building2 size={31} /></div><strong>Pusat Monitoring</strong><span>Jasindo · Geospasial</span></div></div> : <div className="readonly-sensor-note"><AlertTriangle size={15} /><span>UC-02 hanya menampilkan status dan telemetry perangkat. Perubahan status perangkat tersedia melalui dashboard UC-05 atau pengelolaan sensor UC-06.</span></div>}
    <div className="telemetry-row"><Metric icon={Activity} label="Gempa" value={(m.mmi || 0).toFixed(1)} unit="MMI" level={sensor.online ? riskLevel('mmi', m.mmi || 0) : 'offline'} /><Metric icon={Droplets} label="Air" value={(m.water || 0).toFixed(2)} unit="m" level={sensor.online ? riskLevel('water', m.water || 0) : 'offline'} /><Metric icon={Mountain} label="Erupsi" value={(m.vei || 0).toFixed(1)} unit="VEI" level={sensor.online ? riskLevel('vei', m.vei || 0) : 'offline'} /></div>
    <div className="sensor-detail-foot">Status data: {sensor.dataStatus || 'Tersedia'} · Pembaruan terakhir: {sensor.telemetryAt || 'Belum ada data'}</div>
  </div></div>;
}

function AssetDetails({ asset, sensor, onClose }) {
  if (!asset) return null;
  return <div className="sensor-overlay"><div className="sensor-modal asset-details-modal">
    <div className="sensor-modal-head"><span className="eyebrow">OBJEK PERTANGGUNGAN</span><button className="back-btn" onClick={onClose}><X size={16} /> Tutup</button></div>
    <div className="sensor-title"><div><h2>{asset.name}</h2><p>{asset.policyNo} · {asset.insured}</p></div><span className={`asset-detail-score ${asset.riskScore >= 70 ? 'high' : asset.riskScore >= 40 ? 'medium' : 'low'}`}>{asset.riskScore}/100</span></div>
    <div className="asset-detail-grid">
    <div>
      <small>Lokasi</small>
      <b>{asset.city}, {asset.province}</b>
    </div>

    <div>
      <small>Lini produk</small>
      <b>{asset.productLine}</b>
    </div>

    <div>
      <small>Nilai pertanggungan</small>
      <b>
        {new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(asset.sumInsured)}
      </b>
    </div>

    <div>
      <small>Status lokasi</small>
      <b>{asset.locationVerified ? 'Terkonfirmasi' : 'Perlu verifikasi'}</b>
    </div>

    <div>
      <small>Presisi lokasi</small>
      <b>
        {asset.locationPrecision === 'coordinate' ||
        (asset.latitude != null && asset.longitude != null)
          ? 'Koordinat manual'
          : 'Tingkat provinsi'}
      </b>
    </div>

    <div>
      <small>Sensor terkait</small>
      <b>{sensor?.name || 'Belum dihubungkan'}</b>
    </div>

    <div>
      <small>Status sensor</small>
      <b>
        {sensor
          ? sensor.online
            ? 'Online'
            : 'Offline / tidak diketahui'
          : 'Tidak tersedia'}
      </b>
    </div>
  </div>
    <div className="readonly-sensor-note">
    <Building2 size={15} />
    <span>
      Posisi visual objek mengikuti sensor pada provinsi yang sama
      dan ditempatkan otomatis mengelilingi sensor.
      Latitude/longitude, jika diisi, disimpan sebagai informasi lokasi
      tetapi tidak mengubah posisi marker prototype.
    </span>
  </div>
  </div></div>;
}

export default function LegacyDashboard({
  sensors, assets = [], activeEvent, events = [], onSimulate, onReset, onToggleSensor,
  onUseSystemData, onSyncSystemData, onCompleteEvent, provinceNeighbours = {},
  alerts = [], variant = 'dashboard',
}) {
  const isRiskMap = variant === 'risk-map';
  const [activePanel, setActivePanel] = useState('summary');
  const [mode, setMode] = useState('simulation');
  const [selectedAreas, setSelectedAreas] = useState(() => DEFAULT_SUMMARY_AREAS.filter((area) => sensors.some((sensor) => sensor.area === area)));
  const [focusedSensorId, setFocusedSensorId] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLine, setFilterLine] = useState('Semua');
  const [filterIsland, setFilterIsland] = useState('Semua');
  const [filterProvince, setFilterProvince] = useState('Semua');
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [layersOpen, setLayersOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const focusTimer = useRef(null);
  const eventTimerActions = useRef({ onReset, onCompleteEvent });
  const focusedSensor = sensors.find((sensor) => sensor.id === focusedSensorId) || null;
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) || null;
  const offlineCount = sensors.filter((sensor) => !sensor.online).length;
  const currentEvent = isRiskMap || mode === 'system'
    ? (events.find((event) => event.status !== 'Selesai') || null)
    : (mode === 'simulation' ? activeEvent : null);

  const currentEventId = currentEvent?.eventId || currentEvent?.id || null;

  const impactMap = useMemo(() => {
    if (isRiskMap || mode === 'system') {
      return provinceImpactMap(
        currentEvent,
        assets,
        sensors,
        provinceNeighbours
      );
    }

    return mode === 'simulation'
      ? getSimulationImpactMap(activeEvent, sensors)
      : {};
  }, [
    isRiskMap,
    currentEvent,
    assets,
    sensors,
    mode,
    activeEvent,
    provinceNeighbours
  ]);
  const matchingAssetProvinces = useMemo(() => assets.filter((asset) => `${asset.name} ${asset.province} ${asset.policyNo}`.toLowerCase().includes(searchQuery.toLowerCase())).map((asset) => asset.province), [assets, searchQuery]);
  const visibleSensors = sensors.filter((sensor) => {
    const islandMatch =
      filterIsland === 'Semua' ||
      ISLAND_GROUPS[filterIsland]?.includes(sensor.area);

    if (!islandMatch) return false;

    if (filterProvince !== 'Semua' && sensor.area !== filterProvince) {
      return false;
    }

    if (!searchQuery) return true;

    return `${sensor.area} ${sensor.name} ${sensor.id}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      matchingAssetProvinces.includes(sensor.area);
  });

  const visibleAssets = assets.filter((asset) => {
    const lineMatch =
      filterLine === 'Semua' ||
      asset.productLine === filterLine;

    const islandMatch =
      filterIsland === 'Semua' ||
      ISLAND_GROUPS[filterIsland]?.includes(asset.province);

    const provinceMatch =
      filterProvince === 'Semua' ||
      asset.province === filterProvince;

    const searchMatch =
      !searchQuery ||
      `${asset.name} ${asset.province} ${asset.policyNo} ${asset.insured}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return lineMatch && islandMatch && provinceMatch && searchMatch;
  });
  const impactedCount = Object.values(impactMap).filter((value) => value === 'danger' || value === 'watch').length;

  useEffect(() => { const timer = setInterval(() => setLastUpdated(new Date()), 5000); return () => clearInterval(timer); }, []);
  useEffect(() => () => clearTimeout(focusTimer.current), []);
  useEffect(() => { setSelectedAreas((prev) => prev.filter((area) => sensors.some((sensor) => sensor.area === area))); }, [sensors]);
  
  useEffect(() => {
    eventTimerActions.current = { onReset, onCompleteEvent };
  }, [onReset, onCompleteEvent]);

  // Otomatis mengakhiri event setelah 10 detik.
  useEffect(() => {
    if (isRiskMap || !currentEventId) return undefined;

    const timer = window.setTimeout(() => {
      if (mode === 'simulation') {
        eventTimerActions.current.onReset?.({
          showToast: false
        });
      } else if (mode === 'system') {
        eventTimerActions.current.onCompleteEvent?.(currentEventId);
      }
    }, 10_000);

    return () => window.clearTimeout(timer);
  }, [isRiskMap, currentEventId, mode]);


  const openSensor = (sensor) => { clearTimeout(focusTimer.current); setSelectedAssetId(null); setFocusedSensorId(sensor.id); };
  const closeSensor = () => setFocusedSensorId(null);
  const useSystemData = () => { setMode('system'); setActivePanel('testing'); setFocusedSensorId(null); onUseSystemData?.(); };
  const useSimulation = () => { setMode('simulation'); setActivePanel('testing'); setFocusedSensorId(null); if (mode !== 'simulation' && activeEvent) onReset?.(); };
  const togglePanel = (panel) => setActivePanel((current) => current === panel ? null : panel);
  const resetFilters = () => {
    setSearchQuery('');
    setFilterLine('Semua');
    setFilterIsland('Semua');
    setFilterProvince('Semua');
    setLayers(DEFAULT_LAYERS);
  };

  return <div className={`legacy-dashboard ${isRiskMap ? 'legacy-risk-map' : 'legacy-portfolio-map'} ${activePanel ? 'panel-open' : 'panel-closed'}`}>
    <div className="legacy-dashboard-bar">
      <div className="legacy-dashboard-heading"><strong>JASINDO</strong><span>Sistem Informasi Geospasial</span></div>
      {!isRiskMap ? <>
        <div className="legacy-source-tabs" role="group" aria-label="Pilih sumber data">
          <button className={mode === 'system' ? 'active' : ''} onClick={useSystemData}><Database size={14} /> Data Asli</button>
          <button className={mode === 'simulation' ? 'active' : ''} onClick={useSimulation}><Zap size={14} /> Simulasi</button>
        </div>
        <div className="legacy-live-info"><span className="legacy-live-dot" /> {mode === 'system' ? 'DATA SENSOR TERSIMPAN' : 'SIMULASI'} <b>{lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</b></div>
      </> : <div className="legacy-live-info"><span className="legacy-live-dot" /> PETA RISIKO · {assets.length} OBJEK TERPETA</div>}
    </div>
    <div className="legacy-workspace">
      <main className="map-stage">
        <div className="map-toolbar">
          <div className="search-box"><Search size={16} /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari objek, provinsi, atau sensor..." /></div>
          <button onClick={() => setLayersOpen((value) => !value)} title="Buka filter dan layer"><Layers3 size={15} /> Filter & layer</button>
          <button title="Perbarui tampilan" onClick={() => setLastUpdated(new Date())}><RefreshCw size={15} /></button>
        </div>
       <MapLayersPopover
          open={layersOpen}
          sensors={sensors}
          filterLine={filterLine}
          setFilterLine={setFilterLine}
          filterIsland={filterIsland}
          setFilterIsland={setFilterIsland}
          filterProvince={filterProvince}
          setFilterProvince={setFilterProvince}
          layers={layers}
          setLayers={setLayers}
          onClose={() => setLayersOpen(false)}
        />
        <IndonesiaMap
        sensors={visibleSensors}
        allSensors={sensors}
        assets={visibleAssets}
        allAssets={assets}
        activeEvent={currentEvent}
        impactMap={impactMap}
        onSensorClick={openSensor}
        onAssetClick={(asset) => {
          setFocusedSensorId(null);
          setSelectedAssetId(asset.id);
        }}
        focusedSensor={focusedSensor}
        searchQuery={searchQuery}
        layers={layers}
        satellite={layers.satellite}
        />
        <div className="bottom-status"><span><CloudLightning size={14} /> Multi-hazard monitoring</span><span><Wifi size={14} /> {sensors.length - offlineCount}/{sensors.length} sensor online</span><span><ShieldCheck size={14} /> {impactedCount} titik terdampak</span><span><Building2 size={14} /> {visibleAssets.length} objek tampil</span></div>
      </main>
      <div className={`right-panel-dock ${activePanel ? 'has-active-panel' : ''}`}>
        <div className="right-panel-switchers">
          {!isRiskMap && <button className={activePanel === 'testing' ? 'active' : ''} onClick={() => togglePanel('testing')} aria-label={activePanel === 'testing' ? 'Tutup panel pengujian' : 'Buka panel pengujian'} title="Pengujian"><span className="sr-only">Pengujian</span>{activePanel === 'testing' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>}
          <button className={activePanel === 'summary' ? 'active' : ''} onClick={() => togglePanel('summary')} aria-label={activePanel === 'summary' ? 'Tutup panel ringkasan' : 'Buka panel ringkasan'} title="Ringkasan"><span className="sr-only">Ringkasan</span>{activePanel === 'summary' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
        </div>
        {activePanel === 'testing' && !isRiskMap && <SimulationPanel sensors={sensors} onSimulate={(event) => { setMode('simulation'); onSimulate?.(event); }} activeEvent={activeEvent} onReset={onReset} mode={mode} onSyncSystemData={onSyncSystemData} />}
        {activePanel === 'summary' && <DashboardPanel sensors={sensors} selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas} impactMap={impactMap} alerts={alerts} />}
      </div>
    </div>
    {focusedSensor && <SensorControl sensor={focusedSensor} onBack={closeSensor} onToggle={onToggleSensor} readOnly={isRiskMap} />}
    {selectedAsset && <AssetDetails asset={selectedAsset} sensor={sensorForAsset(sensors, selectedAsset)} onClose={() => setSelectedAssetId(null)} />}
  </div>;
}
