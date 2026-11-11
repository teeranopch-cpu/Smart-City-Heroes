// =====================================================================
// shared.js — โค้ดส่วนกลางที่ใช้ร่วมกันระหว่าง index.html (ประชาชน) และ admin.html (เจ้าหน้าที่)
// ไม่มีข้อมูลล็อกอินหรือฟังก์ชันของแอดมินอยู่ในไฟล์นี้
// =====================================================================

tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['Prompt', 'sans-serif'] },
      colors: { brand: { 50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b' } }
    }
  }
};

// ====================== Constants ======================
const CATEGORIES = [
  'ถนน/ทางเท้าชำรุด',
  'ไฟฟ้าส่องสว่างดับ',
  'ท่อระบายน้ำตัน/น้ำท่วม',
  'โครงสร้างอาคาร/สะพานชำรุด',
  'สายไฟ/สายสื่อสารรกรุงรัง',
  'อื่นๆ'
];
const STATUSES = ['รอดำเนินการ', 'กำลังดำเนินการ', 'แก้ไขเสร็จสิ้น'];
const STATUS_STYLE = {
  'รอดำเนินการ': 'bg-orange-100 text-orange-700 border-orange-200',
  'กำลังดำเนินการ': 'bg-sky-100 text-sky-700 border-sky-200',
  'แก้ไขเสร็จสิ้น': 'bg-green-100 text-green-700 border-green-200'
};
const STATUS_COLOR = { 'รอดำเนินการ':'#f97316', 'กำลังดำเนินการ':'#0ea5e9', 'แก้ไขเสร็จสิ้น':'#16a34a' };
const STATUS_DOT = { 'รอดำเนินการ':'bg-orange-500', 'กำลังดำเนินการ':'bg-sky-500', 'แก้ไขเสร็จสิ้น':'bg-green-600' };
const URGENCIES = ['ปกติ', 'ด่วน', 'อันตราย'];
const URGENCY_RANK = { 'ปกติ':0, 'ด่วน':1, 'อันตราย':2 };
const URGENCY_STYLE = {
  'ปกติ': 'bg-gray-100 text-gray-600 border-gray-200',
  'ด่วน': 'bg-amber-100 text-amber-700 border-amber-200',
  'อันตราย': 'bg-red-100 text-red-700 border-red-200'
};
const BKK = [13.7563, 100.5018];
const TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const DB_KEY = 'infra_issues_v1';
const VOTE_KEY = 'infra_voted_v1';
const MINE_KEY = 'infra_mine_v1';
const LAST_KEY = 'infra_last_submit';
const THEME_KEY = 'infra_theme';

// ====================== Utilities ======================
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hasLeaflet = () => typeof L !== 'undefined';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function loadSet(k) { try { return new Set(JSON.parse(lsGet(k) || '[]')); } catch (e) { return new Set(); } }
function saveSet(k, s) { lsSet(k, JSON.stringify([...s])); }
function opt(v, t) { return `<option value="${esc(v)}">${esc(t ?? v)}</option>`; }

function placeholderImg(emoji, c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><text x="300" y="240" font-size="140" text-anchor="middle">${emoji}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
function fmtDate(iso) {
  return new Date(iso).toLocaleString('th-TH', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function toast(msg) {
  const t = $('toast'); if (!t) return;
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), 2800);
}
function genTicketId(list) {
  const d = new Date();
  const base = `TF-${String(d.getFullYear()).slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  let id;
  do { id = `${base}-${Math.floor(1000 + Math.random()*9000)}`; } while (list.some(i => i.id === id));
  return id;
}
function badge(status) {
  return `<span class="inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLE[status]}">${esc(status)}</span>`;
}
function urgencyBadge(u) {
  if (!u || u === 'ปกติ') return '';
  const icon = u === 'อันตราย' ? '⚠️' : '⏰';
  return `<span class="inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${URGENCY_STYLE[u]}">${icon} ${esc(u)}</span>`;
}
// Resize image to keep LocalStorage small, output Base64
function fileToBase64(file, maxW = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ====================== Data layer (LocalStorage) ======================
function normalize(i) {
  i.urgency = i.urgency || 'ปกติ';
  i.votes = Number(i.votes) || 0;
  i.afterImage = i.afterImage || '';
  if (i.lat === undefined) i.lat = null;
  if (i.lng === undefined) i.lng = null;
  if (!Array.isArray(i.history) || !i.history.length) {
    i.history = [{ status:'รอดำเนินการ', note:'รับเรื่องแล้ว', at:i.createdAt }];
    if (i.status !== 'รอดำเนินการ') i.history.push({ status:i.status, note:i.note || '', at:i.updatedAt || i.createdAt });
  }
  return i;
}
function seedData() {
  const now = Date.now();
  const h = n => new Date(now - n * 3600 * 1000).toISOString();
  return [
    { id:'TF-261108-1024', name:'สมชาย ใจดี', phone:'081-234-5678', category:CATEGORIES[0],
      description:'ผิวถนนเป็นหลุมลึกขนาดใหญ่ รถจักรยานยนต์เสี่ยงล้ม โดยเฉพาะตอนกลางคืน',
      location:'ถนนลาดพร้าว ซอย 71 ใกล้ทางเข้าตลาด', lat:13.7956, lng:100.6101,
      image: placeholderImg('🕳️','#d1d5db','#9ca3af'), afterImage:'', status:'รอดำเนินการ', urgency:'ด่วน', votes:7, note:'',
      history:[{status:'รอดำเนินการ', note:'รับเรื่องแล้ว', at:h(52)}], createdAt:h(52), updatedAt:h(52) },
    { id:'TF-261109-2381', name:'', phone:'', category:CATEGORIES[1],
      description:'ไฟถนนดับต่อเนื่องกัน 5 ต้น ทำให้ซอยมืดมาก เสี่ยงต่อความปลอดภัย',
      location:'ซอยสุขุมวิท 101/1 ช่วงหน้าโรงเรียน', lat:13.6903, lng:100.6063,
      image: placeholderImg('💡','#fde68a','#92400e'), afterImage:'', status:'กำลังดำเนินการ', urgency:'ปกติ', votes:12,
      note:'ช่างไฟฟ้าลงพื้นที่ตรวจสอบแล้ว รอเปลี่ยนหลอดและตรวจสอบสายไฟ คาดว่าเสร็จภายใน 2 วัน',
      history:[{status:'รอดำเนินการ', note:'รับเรื่องแล้ว', at:h(30)}, {status:'กำลังดำเนินการ', note:'ช่างไฟฟ้าลงพื้นที่ตรวจสอบแล้ว รอเปลี่ยนหลอดและตรวจสอบสายไฟ คาดว่าเสร็จภายใน 2 วัน', at:h(8)}],
      createdAt:h(30), updatedAt:h(8) },
    { id:'TF-261105-7712', name:'วิภา รักษ์ถิ่น', phone:'089-876-5432', category:CATEGORIES[2],
      description:'ท่อระบายน้ำอุดตัน น้ำท่วมขังหลังฝนตกทุกครั้ง ส่งกลิ่นเหม็น',
      location:'ถนนเพชรเกษม หน้าซอย 48', lat:13.7160, lng:100.4580,
      image: placeholderImg('🌊','#bae6fd','#0369a1'), afterImage: placeholderImg('✅','#bbf7d0','#166534'),
      status:'แก้ไขเสร็จสิ้น', urgency:'ปกติ', votes:4, note:'เจ้าหน้าที่ดูดสิ่งอุดตันและล้างท่อระบายน้ำเรียบร้อยแล้ว',
      history:[{status:'รอดำเนินการ', note:'รับเรื่องแล้ว', at:h(110)}, {status:'กำลังดำเนินการ', note:'ส่งรถดูดสิ่งอุดตันเข้าพื้นที่', at:h(84)}, {status:'แก้ไขเสร็จสิ้น', note:'เจ้าหน้าที่ดูดสิ่งอุดตันและล้างท่อระบายน้ำเรียบร้อยแล้ว', at:h(60)}],
      createdAt:h(110), updatedAt:h(60) },
    { id:'TF-261110-5590', name:'ประเสริฐ มั่นคง', phone:'', category:CATEGORIES[4],
      description:'สายสื่อสารห้อยต่ำเกือบถึงพื้น เสี่ยงอันตรายต่อรถบรรทุกและคนเดินเท้า',
      location:'ถนนจรัญสนิทวงศ์ หน้าปั๊มน้ำมัน', lat:13.7640, lng:100.4760,
      image: placeholderImg('🔌','#d9f99d','#3f6212'), afterImage:'', status:'รอดำเนินการ', urgency:'อันตราย', votes:3, note:'',
      history:[{status:'รอดำเนินการ', note:'รับเรื่องแล้ว', at:h(5)}], createdAt:h(5), updatedAt:h(5) }
  ];
}
function loadIssues() {
  try {
    const raw = lsGet(DB_KEY);
    if (raw) return JSON.parse(raw).map(normalize);
  } catch (e) {}
  const seeded = seedData().map(normalize);
  saveIssues(seeded);
  return seeded;
}
function saveIssues(list) {
  if (!lsSet(DB_KEY, JSON.stringify(list))) { toast('บันทึกไม่สำเร็จ: พื้นที่จัดเก็บเต็ม'); return false; }
  return true;
}
let issues = loadIssues();

// ====================== Theme ======================
function applyTheme(t) {
  document.documentElement.classList.toggle('dark', t === 'dark');
}
function toggleTheme() {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  lsSet(THEME_KEY, next);
  applyTheme(next);
  if (typeof renderHeader === 'function') renderHeader();
}
function themeButton() {
  const dark = document.documentElement.classList.contains('dark');
  return `<button onclick="toggleTheme()" title="สลับโหมดมืด/สว่าง" class="text-base border border-gray-300 w-9 h-9 rounded-lg hover:bg-gray-50">${dark ? '☀️' : '🌙'}</button>`;
}
applyTheme(lsGet(THEME_KEY) || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

// ====================== Map helpers (shared) ======================
let miniMap = null;
function pinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>`,
    iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24]
  });
}
function addTiles(map) {
  L.tileLayer(TILE, { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
}
function mapUnavailable(id) {
  const el = $(id);
  if (el) el.innerHTML = '<p class="text-xs text-gray-400 p-4">ไม่สามารถโหลดแผนที่ได้ (ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต)</p>';
}
function destroyMini() {
  if (miniMap) { try { miniMap.remove(); } catch (e) {} miniMap = null; }
}
function showMiniMap(containerId, i) {
  destroyMini();
  if (!hasLeaflet() || i.lat == null || i.lng == null || !$(containerId)) return;
  miniMap = L.map(containerId, { scrollWheelZoom: false }).setView([i.lat, i.lng], 16);
  addTiles(miniMap);
  L.marker([i.lat, i.lng], { icon: pinIcon(STATUS_COLOR[i.status]) }).addTo(miniMap);
  setTimeout(() => miniMap && miniMap.invalidateSize(), 80);
}

// ====================== Timeline ======================
function timelineHTML(i) {
  const items = [...i.history].reverse().map(h => `
    <li class="relative ml-4 pb-1">
      <span class="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full ${STATUS_DOT[h.status] || 'bg-gray-400'}"></span>
      <div class="flex flex-wrap items-center gap-2">${badge(h.status)}<span class="text-xs text-gray-400">${fmtDate(h.at)}</span></div>
      ${h.note ? `<p class="text-sm text-gray-600 mt-1">${esc(h.note)}</p>` : ''}
    </li>`).join('');
  return `<ol class="border-l-2 border-gray-200 ml-2 space-y-3">${items}</ol>`;
}
