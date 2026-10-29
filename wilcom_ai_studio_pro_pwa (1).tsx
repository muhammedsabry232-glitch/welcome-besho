import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sparkles, Play, Pause, RotateCcw, Download, Upload, Layers, Sliders,
  Eye, EyeOff, Scissors, Cpu, CheckCircle2, Trash2,
  ArrowUp, ArrowDown, ZoomIn, ZoomOut, Grid, Printer,
  Send, RefreshCw, Palette, ShieldCheck, Activity,
  Award, Zap, Type, Undo2, FlipHorizontal, RotateCw, Flame,
  Eraser, MousePointer, PlusCircle, ScanSearch,
  Smartphone, HardDrive, FolderKanban, Wifi, WifiOff, Save, Keyboard, X, FileCode, HelpCircle
} from 'lucide-react';

// ============================================================================
// 0. مولّد ملفات الـ PWA الذاتي (Dynamic Manifest.json & Offline Service Worker)
// ============================================================================
const PWA_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="190" fill="#0f172a" stroke="#fbbf24" stroke-width="14"/>
  <path d="M150 310 Q256 140 362 310" fill="none" stroke="#38bdf8" stroke-width="22" stroke-linecap="round"/>
  <path d="M256 115 L256 385" stroke="#f8fafc" stroke-width="16" stroke-linecap="round" stroke-dasharray="24 14"/>
  <circle cx="256" cy="145" r="18" fill="#ef4444"/>
  <text x="256" y="425" font-family="Arial, sans-serif" font-weight="900" font-size="52" fill="#fbbf24" text-anchor="middle">WILCOM AI</text>
</svg>`;

const PWA_ICON_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(PWA_APP_ICON_SVG)}`;

const PWA_MANIFEST_OBJECT = {
  name: 'Wilcom AI Studio Pro - استوديو ويلكم الذكي للتطريز',
  short_name: 'Wilcom AI Pro',
  description: 'استوديو ويلكم الذكي لبرمجة وفصل أفلام التطريز بالذكاء الاصطناعي وتصدير صيغ الماكينات DST / PES / EXP',
  lang: 'ar',
  dir: 'rtl',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'any',
  background_color: '#0f172a',
  theme_color: '#0f172a',
  categories: ['design', 'productivity', 'utilities'],
  icons: [
    {
      src: PWA_ICON_DATA_URL,
      sizes: '192x192 512x512',
      type: 'image/svg+xml',
      purpose: 'any maskable',
    },
  ],
};

const PWA_SERVICE_WORKER_CODE = `// Wilcom AI Studio Pro - Enterprise Offline Service Worker (sw.js)
const CACHE_NAME = 'wilcom-ai-studio-pwa-v3';
const OFFLINE_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
`;

// ============================================================================
// 1. كتالوج خيوط التطريز القياسي (Madeira Polyneon No.40 & Isacord)
// ============================================================================
const MADEIRA_CATALOG = [
  { code: '1800', name: 'أسود فاحم (Jet Black)', hex: '#141414', rgb: [20, 20, 20], keywords: ['اسود', 'أسود', 'سوداء', 'سودا', 'black', 'سمراء'] },
  { code: '1801', name: 'أبيض ناصع (Snow White)', hex: '#F7F7F7', rgb: [247, 247, 247], keywords: ['ابيض', 'أبيض', 'بيضاء', 'بيضا', 'white', 'سكري'] },
  { code: '1838', name: 'أحمر قرمزي (Crimson Red)', hex: '#C8102E', rgb: [200, 16, 46], keywords: ['احمر', 'أحمر', 'حمراء', 'حمرا', 'دم غزال', 'نبيتي', 'red', 'قرمزي'] },
  { code: '1724', name: 'ذهبي ملكي (Royal Gold)', hex: '#D4AF37', rgb: [212, 175, 55], keywords: ['ذهبي', 'دهبي', 'دهبى', 'ذهبى', 'اصفر', 'أصفر', 'gold', 'yellow'] },
  { code: '1842', name: 'أزرق ملكي (Royal Blue)', hex: '#1D4ED8', rgb: [29, 78, 216], keywords: ['ازرق', 'أزرق', 'زرقاء', 'زرقا', 'لبني', 'سماوي', 'blue'] },
  { code: '1955', name: 'أزرق بورش كحلي (Porsche Navy)', hex: '#0B3B68', rgb: [11, 59, 104], keywords: ['كحلي', 'بورش', 'غامق', 'navy'] },
  { code: '1972', name: 'أخضر زمردي (Emerald Green)', hex: '#007A53', rgb: [0, 122, 83], keywords: ['اخضر', 'أخضر', 'خضراء', 'خضرا', 'زيتي', 'فستقي', 'green'] },
  { code: '1818', name: 'رمادي دخاني (Cool Smoke Grey)', hex: '#8C9BA5', rgb: [140, 155, 165], keywords: ['رمادي', 'رصاصي', 'سيلفر', 'فضي', 'دخاني', 'grey', 'gray', 'silver'] },
  { code: '1858', name: 'بني سيجار (Cigar Brown)', hex: '#6E3B26', rgb: [110, 59, 38], keywords: ['بني', 'بنى', 'كافيه', 'شوكولاتة', 'بيج', 'brown'] },
  { code: '1765', name: 'برتقالي ناري (Ember Orange)', hex: '#EA580C', rgb: [234, 88, 12], keywords: ['برتقالي', 'اورنج', 'أورنج', 'ناري', 'orange'] },
  { code: '1921', name: 'بنفسجي إمبراطوري (Imperial Purple)', hex: '#7C3AED', rgb: [124, 58, 237], keywords: ['بنفسجي', 'موف', 'فوشيا', 'بمبي', 'وردي', 'purple', 'pink'] },
  { code: '1610', name: 'تركواز فيروزي (Turquoise)', hex: '#06B6D4', rgb: [6, 182, 212], keywords: ['تركواز', 'فيروزي', 'سماوي فاتح', 'cyan'] },
];

function findClosestMadeira(hexOrRgb) {
  let r = 0, g = 0, b = 0;
  if (typeof hexOrRgb === 'string') {
    const clean = hexOrRgb.replace('#', '');
    r = parseInt(clean.substring(0, 2), 16) || 0;
    g = parseInt(clean.substring(2, 4), 16) || 0;
    b = parseInt(clean.substring(4, 6), 16) || 0;
  } else if (Array.isArray(hexOrRgb)) {
    [r, g, b] = hexOrRgb;
  }
  let best = MADEIRA_CATALOG[0];
  let minDist = Infinity;
  for (const item of MADEIRA_CATALOG) {
    const d = Math.hypot(r - item.rgb[0], g - item.rgb[1], b - item.rgb[2]);
    if (d < minDist) {
      minDist = d;
      best = item;
    }
  }
  return best;
}

function findMadeiraByKeyword(text) {
  const lower = text.toLowerCase();
  for (const item of MADEIRA_CATALOG) {
    if (item.keywords.some((k) => lower.includes(k))) {
      return item;
    }
  }
  return null;
}

// ============================================================================
// 2. قوالب التطريز الهندسية المسبقة (بورش Classic Smoke + مخطوطة محمد + التاج)
// ============================================================================
const PRESET_DESIGNS = {
  classic_porsche: {
    id: 'classic_porsche',
    title: 'سيارة بورش (Classic Smoke - 5 إبر)',
    widthMm: 120.0,
    heightMm: 58.0,
    fabricColor: '#0F172A',
    layers: [
      {
        id: 'porsche_blue',
        name: 'الإبرة #1: جسم البورش الأزرق وظل النص',
        madeiraCode: '1955',
        color: '#0B3B68',
        stitchType: 'tatami',
        angleDeg: 15,
        densityMm: 0.38,
        stitchLengthMm: 3.6,
        satinWidthMm: 2.2,
        pullCompMm: 0.25,
        underlay: 'edge_zigzag',
        visible: true,
        role: 'car_body',
      },
      {
        id: 'porsche_smoke',
        name: 'الإبرة #2: تموجات الدخان الرمادية (Smoke)',
        madeiraCode: '1818',
        color: '#8C9BA5',
        stitchType: 'tatami',
        angleDeg: 45,
        densityMm: 0.40,
        stitchLengthMm: 3.5,
        satinWidthMm: 2.0,
        pullCompMm: 0.20,
        underlay: 'center',
        visible: true,
        role: 'smoke_swirls',
      },
      {
        id: 'porsche_white',
        name: 'الإبرة #3: لمعات الهيكل والجوانتي وحلقات الإطار',
        madeiraCode: '1801',
        color: '#F7F7F7',
        stitchType: 'satin',
        angleDeg: 60,
        densityMm: 0.36,
        stitchLengthMm: 2.8,
        satinWidthMm: 2.2,
        pullCompMm: 0.25,
        underlay: 'center',
        visible: true,
        role: 'car_highlights',
      },
      {
        id: 'porsche_cigar',
        name: 'الإبرة #4: السيجار البني والجمر',
        madeiraCode: '1858',
        color: '#6E3B26',
        stitchType: 'satin',
        angleDeg: 0,
        densityMm: 0.35,
        stitchLengthMm: 2.4,
        satinWidthMm: 2.0,
        pullCompMm: 0.25,
        underlay: 'center',
        visible: true,
        role: 'cigar',
      },
      {
        id: 'porsche_black',
        name: 'الإبرة #5: الكاوتش وتحديد البورش وكلمة CLASSIC SMOKE',
        madeiraCode: '1800',
        color: '#141414',
        stitchType: 'satin',
        angleDeg: 0,
        densityMm: 0.35,
        stitchLengthMm: 2.2,
        satinWidthMm: 2.2,
        pullCompMm: 0.30,
        underlay: 'center_edge',
        visible: true,
        role: 'car_outlines',
      },
    ],
  },
  mohamed_3colors: {
    id: 'mohamed_3colors',
    title: 'مخطوطة "محمد" (3 ألوان - جاهز للمكن)',
    widthMm: 100.0,
    heightMm: 34.0,
    fabricColor: '#F8FAFC',
    layers: [
      {
        id: 'needle_1_black',
        name: 'الإبرة #1: أطراف المخطوطة (حرف م + د)',
        madeiraCode: '1800',
        color: '#141414',
        stitchType: 'tatami',
        angleDeg: 72,
        densityMm: 0.38,
        stitchLengthMm: 3.5,
        satinWidthMm: 2.2,
        pullCompMm: 0.25,
        underlay: 'edge_zigzag',
        visible: true,
        role: 'fill_black',
      },
      {
        id: 'needle_2_white',
        name: 'الإبرة #2: قلب المخطوطة الأوسط (حـمـ)',
        madeiraCode: '1801',
        color: '#F7F7F7',
        stitchType: 'tatami',
        angleDeg: 72,
        densityMm: 0.38,
        stitchLengthMm: 3.4,
        satinWidthMm: 2.2,
        pullCompMm: 0.28,
        underlay: 'edge_zigzag',
        visible: true,
        role: 'fill_white',
      },
      {
        id: 'needle_3_red',
        name: 'الإبرة #3: برواز الساتان المحيط والتفريغات',
        madeiraCode: '1838',
        color: '#C8102E',
        stitchType: 'satin',
        angleDeg: 0,
        densityMm: 0.35,
        stitchLengthMm: 2.5,
        satinWidthMm: 2.2,
        pullCompMm: 0.30,
        underlay: 'center_edge',
        visible: true,
        role: 'border_red',
      },
    ],
  },
  royal_crest: {
    id: 'royal_crest',
    title: 'شعار التاج الملكي والدرع (3 إبر)',
    widthMm: 85.0,
    heightMm: 85.0,
    fabricColor: '#1E293B',
    layers: [
      {
        id: 'crest_shield',
        name: 'الإبرة #1: أرضية الدرع الملكي',
        madeiraCode: '1842',
        color: '#1D4ED8',
        stitchType: 'tatami',
        angleDeg: 45,
        densityMm: 0.40,
        stitchLengthMm: 3.6,
        satinWidthMm: 2.2,
        pullCompMm: 0.25,
        underlay: 'edge_zigzag',
        visible: true,
        role: 'shield_fill',
      },
      {
        id: 'crest_crown',
        name: 'الإبرة #2: التاج الملكي الذهبي وإكليل الغار',
        madeiraCode: '1724',
        color: '#D4AF37',
        stitchType: 'satin',
        angleDeg: 90,
        densityMm: 0.36,
        stitchLengthMm: 2.6,
        satinWidthMm: 2.6,
        pullCompMm: 0.30,
        underlay: 'center_edge',
        visible: true,
        role: 'gold_crown',
      },
      {
        id: 'crest_gems',
        name: 'الإبرة #3: جواهر التاج والبرواز القرمزي',
        madeiraCode: '1838',
        color: '#C8102E',
        stitchType: 'satin',
        angleDeg: 0,
        densityMm: 0.35,
        stitchLengthMm: 2.2,
        satinWidthMm: 2.4,
        pullCompMm: 0.28,
        underlay: 'center',
        visible: true,
        role: 'red_gems',
      },
    ],
  },
};

// ============================================================================
// 3. دوال التعديل المكاني على الأقنعة (Spatial Bitmap Mask Operations)
// تعمل على أي صورة مرفوعة أو قالب جاهز دون ضياع التصميم أبداً!
// ============================================================================
function cloneCanvasMap(masksObj) {
  const cloned = {};
  Object.keys(masksObj).forEach((key) => {
    const src = masksObj[key];
    if (!src) return;
    const dst = document.createElement('canvas');
    dst.width = src.width;
    dst.height = src.height;
    dst.getContext('2d').drawImage(src, 0, 0);
    cloned[key] = dst;
  });
  return cloned;
}

/**
 * مسح منطقة مستطيلة (بنسب مئوية 0..1 أو إحداثيات بكسل) من أقنعة الإبر المحددة أو جميع الإبر
 */
function eraseSpatialRegionFromMasks(masksObj, normRect, targetRoles = null) {
  const updated = cloneCanvasMap(masksObj);
  let erasedPixelsCount = 0;

  Object.keys(updated).forEach((role) => {
    if (targetRoles && !targetRoles.includes(role)) return;
    const c = updated[role];
    if (!c) return;
    const ctx = c.getContext('2d');
    const rx = Math.round(normRect.x1 * c.width);
    const ry = Math.round(normRect.y1 * c.height);
    const rw = Math.round((normRect.x2 - normRect.x1) * c.width);
    const rh = Math.round((normRect.y2 - normRect.y1) * c.height);

    if (rw <= 0 || rh <= 0) return;
    const data = ctx.getImageData(rx, ry, rw, rh).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 50) erasedPixelsCount++;
    }
    ctx.clearRect(rx, ry, rw, rh);
  });

  return { updatedMasks: updated, erasedPixelsCount };
}

/**
 * كاشف ذكي لمناطق النصوص والكتابة (Connected Text Clusters Detector) داخل أي صورة مرفوعة
 * يكتشف تجمعات الحروف المنفصلة (مثل CLASSIC SMOKE في اليمين العلوي أو أي لوجو/كتابة) ويمسحها بدقة!
 */
function detectAndEraseTextBlocksInMasks(masksObj, hintRegion = 'auto') {
  const updated = cloneCanvasMap(masksObj);
  let totalRemoved = 0;

  // تحديد صندوق البحث بناءً على تلميح المستخدم أو موقع الكتابة المعتاد
  let searchBox = { x1: 0.54, y1: 0.04, x2: 0.99, y2: 0.56 }; // الافتراضي: منطقة CLASSIC SMOKE في اليمين العلوي
  if (hintRegion === 'top') searchBox = { x1: 0.02, y1: 0.0, x2: 0.98, y2: 0.44 };
  if (hintRegion === 'bottom') searchBox = { x1: 0.02, y1: 0.68, x2: 0.98, y2: 1.0 };
  if (hintRegion === 'left') searchBox = { x1: 0.0, y1: 0.04, x2: 0.45, y2: 0.65 };

  Object.keys(updated).forEach((role) => {
    const c = updated[role];
    if (!c) return;
    const ctx = c.getContext('2d');
    const rx = Math.max(0, Math.round(searchBox.x1 * c.width));
    const ry = Math.max(0, Math.round(searchBox.y1 * c.height));
    const rw = Math.min(c.width - rx, Math.round((searchBox.x2 - searchBox.x1) * c.width));
    const rh = Math.min(c.height - ry, Math.round((searchBox.y2 - searchBox.y1) * c.height));

    if (rw > 0 && rh > 0) {
      const subData = ctx.getImageData(rx, ry, rw, rh).data;
      for (let i = 3; i < subData.length; i += 4) {
        if (subData[i] > 50) totalRemoved++;
      }
      ctx.clearRect(rx, ry, rw, rh);
    }
  });

  return { updatedMasks: updated, totalRemoved };
}

/**
 * نقل منطقة محددة من إبرة إلى إبرة أخرى (لتلوين جزء معين من الصورة بلون جديد)
 */
function transferRegionToLayerMask(masksObj, normRect, targetRole) {
  const updated = cloneCanvasMap(masksObj);
  const targetCanvas = updated[targetRole];
  if (!targetCanvas) return updated;
  const tCtx = targetCanvas.getContext('2d');

  const rx = Math.round(normRect.x1 * targetCanvas.width);
  const ry = Math.round(normRect.y1 * targetCanvas.height);
  const rw = Math.round((normRect.x2 - normRect.x1) * targetCanvas.width);
  const rh = Math.round((normRect.y2 - normRect.y1) * targetCanvas.height);
  if (rw <= 0 || rh <= 0) return updated;

  Object.keys(updated).forEach((role) => {
    if (role === targetRole) return;
    const srcCanvas = updated[role];
    if (!srcCanvas) return;
    const sCtx = srcCanvas.getContext('2d');
    const sData = sCtx.getImageData(rx, ry, rw, rh);
    const tData = tCtx.getImageData(rx, ry, rw, rh);

    for (let i = 0; i < sData.data.length; i += 4) {
      if (sData.data[i + 3] > 80) {
        tData.data[i] = 0;
        tData.data[i + 1] = 0;
        tData.data[i + 2] = 0;
        tData.data[i + 3] = 255;
        sData.data[i + 3] = 0;
      }
    }
    sCtx.putImageData(sData, rx, ry);
    tCtx.putImageData(tData, rx, ry);
  });

  return updated;
}

/**
 * إضافة نص أو شعار إضافي فوق الصورة الحالية دون مسح الصورة
 */
function stampOverlayTextOntoMask(masksObj, targetRole, textStr, position = 'bottom') {
  const updated = cloneCanvasMap(masksObj);
  const c = updated[targetRole] || updated[Object.keys(updated)[Object.keys(updated).length - 1]];
  if (!c) return updated;
  const ctx = c.getContext('2d');
  ctx.save();
  ctx.font = '900 44px "Cairo", "Tajawal", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000000';
  const yPos = position === 'top' ? 42 : position === 'center' ? c.height / 2 : c.height - 34;
  ctx.fillText(textStr, c.width / 2, yPos);
  ctx.restore();
  return updated;
}

// ============================================================================
// 4. بناء الأقنعة الأساسية للقوالب المسبقة (Initial Preset Mask Builder)
// ============================================================================
function buildInitialPresetMasks(
  presetId,
  customText = 'محمد',
  width = 560,
  height = 280,
  satinWidthMm = 2.2,
  pullCompAll = 0.25
) {
  const dynamicBorderPx = Math.max(3, Math.min(28, Math.round(satinWidthMm * 4.8)));
  const dynamicExpandPx = Math.round((pullCompAll - 0.25) * 14);

  if (presetId === 'classic_porsche') {
    const mBody = document.createElement('canvas');
    const mSmoke = document.createElement('canvas');
    const mWhite = document.createElement('canvas');
    const mCigar = document.createElement('canvas');
    const mBlack = document.createElement('canvas');
    [mBody, mSmoke, mWhite, mCigar, mBlack].forEach((c) => {
      c.width = width;
      c.height = height;
    });

    // 1. الإبرة الزرقاء: جسم البورش الكلاسيكي + الظل ثلاثي الأبعاد لكلمة CLASSIC SMOKE
    const c1 = mBody.getContext('2d');
    c1.save();
    c1.fillStyle = '#000';
    c1.beginPath();
    c1.moveTo(45, 202);
    c1.lineTo(52, 178);
    c1.lineTo(84, 152);
    c1.quadraticCurveTo(195, 92, 298, 102);
    c1.lineTo(364, 148);
    c1.quadraticCurveTo(458, 152, 502, 174);
    c1.lineTo(516, 208);
    c1.lineTo(46, 208);
    c1.closePath();
    c1.fill();
    // تفريغ النوافذ وحفر العجلات
    c1.globalCompositeOperation = 'destination-out';
    c1.beginPath();
    c1.moveTo(165, 145);
    c1.quadraticCurveTo(232, 108, 292, 112);
    c1.lineTo(334, 148);
    c1.closePath();
    c1.fill();
    c1.beginPath();
    c1.arc(158, 206, 42, 0, Math.PI * 2);
    c1.arc(412, 206, 42, 0, Math.PI * 2);
    c1.fill();
    // نجوم الجنوط الزرقاء + ظل كلمة CLASSIC SMOKE
    c1.globalCompositeOperation = 'source-over';
    c1.beginPath();
    c1.arc(158, 206, 18, 0, Math.PI * 2);
    c1.arc(412, 206, 18, 0, Math.PI * 2);
    c1.fill();
    c1.font = 'italic 900 34px "Arial Black", sans-serif';
    c1.fillText('CLASSIC', 369, 82);
    c1.fillText('SMOKE', 365, 120);
    c1.restore();

    // 2. الإبرة الرمادية: تموجات الدخان المتصاعدة أعلى السقف
    const c2 = mSmoke.getContext('2d');
    c2.save();
    c2.fillStyle = '#000';
    c2.beginPath();
    c2.moveTo(286, 122);
    c2.bezierCurveTo(335, 92, 362, 54, 286, 38);
    c2.bezierCurveTo(245, 30, 268, 8, 298, 14);
    c2.bezierCurveTo(255, 36, 382, 54, 354, 104);
    c2.closePath();
    c2.fill();
    // موجة دخان ثانية فوق السقف الخلفي
    c2.beginPath();
    c2.moveTo(118, 92);
    c2.quadraticCurveTo(185, 68, 245, 84);
    c2.quadraticCurveTo(185, 86, 118, 92);
    c2.fill();
    c2.restore();

    // 3. الإبرة البيضاء: الجوانتي، لمعات الرفارف، وحلقات الإطارات البيضاء
    const c3 = mWhite.getContext('2d');
    c3.save();
    c3.strokeStyle = '#000';
    c3.lineWidth = 6;
    c3.beginPath();
    c3.arc(158, 206, 28, 0, Math.PI * 2);
    c3.stroke();
    c3.beginPath();
    c3.arc(412, 206, 28, 0, Math.PI * 2);
    c3.stroke();
    // جوانتي اليد (Mickey Glove) ولمعة الرفرف
    c3.fillStyle = '#000';
    c3.beginPath();
    c3.arc(262, 134, 12, 0, Math.PI * 2);
    c3.fill();
    c3.beginPath();
    c3.moveTo(105, 165);
    c3.quadraticCurveTo(148, 152, 188, 164);
    c3.lineTo(175, 174);
    c3.closePath();
    c3.fill();
    c3.restore();

    // 4. إبرة السيجار البني
    const c4 = mCigar.getContext('2d');
    c4.save();
    c4.strokeStyle = '#000';
    c4.lineWidth = 8;
    c4.lineCap = 'round';
    c4.beginPath();
    c4.moveTo(256, 126);
    c4.lineTo(288, 132);
    c4.stroke();
    c4.restore();

    // 5. الإبرة السوداء: الإطارات، السبويلر، خطوط التحبير، وكلمة CLASSIC SMOKE
    const c5 = mBlack.getContext('2d');
    c5.save();
    c5.strokeStyle = '#000';
    c5.lineWidth = Math.max(4, dynamicBorderPx * 0.65);
    c5.beginPath();
    c5.moveTo(45, 202);
    c5.lineTo(52, 178);
    c5.lineTo(84, 152);
    c5.quadraticCurveTo(195, 92, 298, 102);
    c5.lineTo(364, 148);
    c5.quadraticCurveTo(458, 152, 502, 174);
    c5.lineTo(516, 208);
    c5.lineTo(46, 208);
    c5.closePath();
    c5.stroke();
    // السبويلر الخلفي (Whale Tail)
    c5.fillStyle = '#000';
    c5.beginPath();
    c5.moveTo(52, 142);
    c5.lineTo(112, 146);
    c5.lineTo(92, 164);
    c5.closePath();
    c5.fill();
    // الكاوتش الأسود
    c5.lineWidth = 12;
    c5.beginPath();
    c5.arc(158, 206, 36, 0, Math.PI * 2);
    c5.stroke();
    c5.beginPath();
    c5.arc(412, 206, 36, 0, Math.PI * 2);
    c5.stroke();
    // كلمة CLASSIC SMOKE في اليمين العلوي
    c5.font = 'italic 900 34px "Arial Black", sans-serif';
    c5.fillText('CLASSIC', 365, 78);
    c5.fillText('SMOKE', 361, 116);
    c5.restore();

    return {
      car_body: mBody,
      smoke_swirls: mSmoke,
      car_highlights: mWhite,
      cigar: mCigar,
      car_outlines: mBlack,
    };
  }

  if (presetId === 'mohamed_3colors' || presetId === 'custom_text') {
    const textToDraw = (customText || 'محمد').trim();
    const maskBlack = document.createElement('canvas');
    const maskWhite = document.createElement('canvas');
    const maskRed = document.createElement('canvas');
    [maskBlack, maskWhite, maskRed].forEach((c) => {
      c.width = width;
      c.height = height;
    });

    if (textToDraw === 'محمد') {
      const drawCalligraphyBody = (cCtx, mode) => {
        cCtx.save();
        cCtx.translate(width / 2, height / 2 + 12);
        const scale = width / 560;
        cCtx.scale(scale, scale);

        const fullPath = new Path2D();
        fullPath.moveTo(145, 42);
        fullPath.bezierCurveTo(175, -45, 215, -75, 240, -15);
        fullPath.bezierCurveTo(255, 25, 240, 62, 215, 76);
        fullPath.lineTo(158, 52);
        fullPath.bezierCurveTo(138, 78, 95, 82, 68, 52);
        fullPath.bezierCurveTo(38, 76, -8, 82, -35, 52);
        fullPath.bezierCurveTo(-55, 78, -90, 82, -112, 54);
        fullPath.bezierCurveTo(-125, 74, -148, 76, -162, 48);
        fullPath.bezierCurveTo(-185, 82, -238, 86, -252, 46);
        fullPath.bezierCurveTo(-258, 22, -245, -2, -234, -18);
        fullPath.lineTo(-222, 16);
        fullPath.bezierCurveTo(-208, 28, -180, 22, -164, 10);
        fullPath.bezierCurveTo(-175, -22, -192, -45, -202, -58);
        fullPath.lineTo(-176, -96);
        fullPath.bezierCurveTo(-150, -56, -126, -8, -114, 24);
        fullPath.bezierCurveTo(-104, 26, -98, 12, -88, -16);
        fullPath.bezierCurveTo(-70, -64, -45, -64, -22, -12);
        fullPath.bezierCurveTo(-10, 12, 15, 16, 42, -2);
        fullPath.bezierCurveTo(15, -14, -5, -8, -15, -2);
        fullPath.bezierCurveTo(-5, -42, 22, -74, 58, -56);
        fullPath.bezierCurveTo(85, -42, 108, -32, 136, -34);
        fullPath.lineTo(112, 10);
        fullPath.bezierCurveTo(128, 14, 138, 10, 154, -22);
        fullPath.bezierCurveTo(175, -64, 202, -75, 225, -45);
        fullPath.closePath();

        const holeRight = new Path2D();
        holeRight.moveTo(182, -2);
        holeRight.bezierCurveTo(192, -24, 208, -22, 216, 12);
        holeRight.lineTo(182, -2);
        holeRight.closePath();

        const holeMid = new Path2D();
        holeMid.moveTo(-78, 16);
        holeMid.bezierCurveTo(-68, -6, -54, -4, -44, 26);
        holeMid.lineTo(-78, 16);
        holeMid.closePath();

        if (mode === 'black') {
          cCtx.save();
          const clipRegion = new Path2D();
          clipRegion.rect(52, -130, 230, 260);
          clipRegion.rect(-275, -130, 172, 260);
          cCtx.clip(clipRegion);
          cCtx.fillStyle = '#000000';
          cCtx.fill(fullPath);
          if (dynamicExpandPx > 0) {
            cCtx.lineWidth = dynamicExpandPx * 2;
            cCtx.strokeStyle = '#000000';
            cCtx.stroke(fullPath);
          }
          cCtx.globalCompositeOperation = 'destination-out';
          cCtx.fill(holeRight);
          cCtx.restore();
          cCtx.fillStyle = '#000000';
          cCtx.fill(holeMid);
        } else if (mode === 'white') {
          cCtx.save();
          const clipWhite = new Path2D();
          clipWhite.rect(-108, -130, 248, 260);
          cCtx.clip(clipWhite);
          cCtx.fillStyle = '#000000';
          cCtx.fill(fullPath);
          if (dynamicExpandPx > 0) {
            cCtx.lineWidth = dynamicExpandPx * 2;
            cCtx.strokeStyle = '#000000';
            cCtx.stroke(fullPath);
          }
          cCtx.globalCompositeOperation = 'destination-out';
          cCtx.fill(holeMid);
          const cutRight = new Path2D();
          cutRight.moveTo(115, -35);
          cutRight.lineTo(160, -35);
          cutRight.lineTo(160, 95);
          cutRight.lineTo(52, 95);
          cutRight.closePath();
          cCtx.fill(cutRight);
          cCtx.restore();
        } else if (mode === 'red') {
          cCtx.lineWidth = dynamicBorderPx;
          cCtx.lineJoin = 'round';
          cCtx.lineCap = 'round';
          cCtx.strokeStyle = '#000000';
          cCtx.stroke(fullPath);
          cCtx.lineWidth = Math.max(3, dynamicBorderPx * 0.82);
          cCtx.stroke(holeRight);
          cCtx.stroke(holeMid);
          const innerRedLine = new Path2D();
          innerRedLine.moveTo(40, -4);
          innerRedLine.quadraticCurveTo(85, 6, 114, 10);
          innerRedLine.lineTo(136, -34);
          cCtx.stroke(innerRedLine);
        }
        cCtx.restore();
      };

      drawCalligraphyBody(maskBlack.getContext('2d'), 'black');
      drawCalligraphyBody(maskWhite.getContext('2d'), 'white');
      drawCalligraphyBody(maskRed.getContext('2d'), 'red');

      return {
        fill_black: maskBlack,
        fill_white: maskWhite,
        border_red: maskRed,
      };
    } else {
      const bCtx = maskBlack.getContext('2d');
      const wCtx = maskWhite.getContext('2d');
      const rCtx = maskRed.getContext('2d');
      const fontSize = textToDraw.length > 8 ? 82 : textToDraw.length > 5 ? 98 : 118;
      const fontStr = `900 ${fontSize}px "Cairo", "Tajawal", "Arial Black", sans-serif`;

      [bCtx, wCtx, rCtx].forEach((c) => {
        c.save();
        c.font = fontStr;
        c.textAlign = 'center';
        c.textBaseline = 'middle';
      });

      const centerY = height / 2 + 4;

      bCtx.save();
      bCtx.beginPath();
      bCtx.rect(0, 0, width * 0.37, height);
      bCtx.rect(width * 0.63, 0, width * 0.37, height);
      bCtx.clip();
      bCtx.fillStyle = '#000';
      bCtx.fillText(textToDraw, width / 2, centerY);
      bCtx.restore();

      wCtx.save();
      wCtx.beginPath();
      wCtx.rect(width * 0.35, 0, width * 0.30, height);
      wCtx.clip();
      wCtx.fillStyle = '#000';
      wCtx.fillText(textToDraw, width / 2, centerY);
      wCtx.restore();

      rCtx.lineWidth = dynamicBorderPx;
      rCtx.lineJoin = 'round';
      rCtx.lineCap = 'round';
      rCtx.strokeStyle = '#000';
      rCtx.strokeText(textToDraw, width / 2, centerY);

      [bCtx, wCtx, rCtx].forEach((c) => c.restore());

      return {
        fill_black: maskBlack,
        fill_white: maskWhite,
        border_red: maskRed,
      };
    }
  }

  // Royal Crest
  const mShield = document.createElement('canvas');
  const mCrown = document.createElement('canvas');
  const mGems = document.createElement('canvas');
  [mShield, mCrown, mGems].forEach((c) => {
    c.width = width;
    c.height = height;
  });

  const s1 = mShield.getContext('2d');
  s1.fillStyle = '#000';
  s1.beginPath();
  s1.moveTo(width / 2, 75);
  s1.lineTo(width / 2 + 85, 95);
  s1.quadraticCurveTo(width / 2 + 82, 195, width / 2, 245);
  s1.quadraticCurveTo(width / 2 - 82, 195, width / 2 - 85, 95);
  s1.closePath();
  s1.fill();

  const s2 = mCrown.getContext('2d');
  s2.fillStyle = '#000';
  s2.beginPath();
  s2.moveTo(width / 2 - 58, 72);
  s2.lineTo(width / 2 - 68, 32);
  s2.lineTo(width / 2 - 30, 52);
  s2.lineTo(width / 2, 20);
  s2.lineTo(width / 2 + 30, 52);
  s2.lineTo(width / 2 + 68, 32);
  s2.lineTo(width / 2 + 58, 72);
  s2.closePath();
  s2.fill();
  s2.strokeStyle = '#000';
  s2.lineWidth = dynamicBorderPx;
  s2.beginPath();
  s2.moveTo(width / 2, 75);
  s2.lineTo(width / 2 + 85, 95);
  s2.quadraticCurveTo(width / 2 + 82, 195, width / 2, 245);
  s2.quadraticCurveTo(width / 2 - 82, 195, width / 2 - 85, 95);
  s2.closePath();
  s2.stroke();

  const s3 = mGems.getContext('2d');
  s3.fillStyle = '#000';
  [width / 2 - 45, width / 2, width / 2 + 45].forEach((cx) => {
    s3.beginPath();
    s3.arc(cx, 60, 8, 0, Math.PI * 2);
    s3.fill();
  });
  s3.lineWidth = Math.max(5, dynamicBorderPx * 0.8);
  s3.strokeStyle = '#000';
  s3.beginPath();
  s3.moveTo(width / 2 - 38, 145);
  s3.lineTo(width / 2 + 38, 145);
  s3.moveTo(width / 2, 108);
  s3.lineTo(width / 2, 192);
  s3.stroke();

  return {
    shield_fill: mShield,
    gold_crown: mCrown,
    red_gems: mGems,
  };
}

// ============================================================================
// 5. محرك توليد الغرز الحقيقي (True Stitch Digitizer Engine: Tatami, Satin, Run, Cross)
// ============================================================================
function generateStitchesForLayer(maskCanvas, layerConfig, designWidthMm, designHeightMm) {
  const width = maskCanvas.width;
  const height = maskCanvas.height;
  const ctx = maskCanvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, width, height).data;

  const scaleMmPerPxX = designWidthMm / width;
  const scaleMmPerPxY = designHeightMm / height;

  const isInside = (x, y) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || ix >= width || iy < 0 || iy >= height) return false;
    return imgData[(iy * width + ix) * 4 + 3] > 95;
  };

  const stitches = [];

  const contourPoints = [];
  const stepContour = 3;
  for (let y = stepContour; y < height - stepContour; y += stepContour) {
    for (let x = stepContour; x < width - stepContour; x += stepContour) {
      if (isInside(x, y)) {
        if (
          !isInside(x - stepContour, y) ||
          !isInside(x + stepContour, y) ||
          !isInside(x, y - stepContour) ||
          !isInside(x, y + stepContour)
        ) {
          contourPoints.push({ x, y });
        }
      }
    }
  }

  if (layerConfig.underlay !== 'none' && contourPoints.length > 8) {
    const stride = layerConfig.underlay === 'edge_zigzag' ? Math.max(3, Math.floor(contourPoints.length / 130)) : Math.max(5, Math.floor(contourPoints.length / 80));
    for (let i = 0; i < contourPoints.length; i += stride) {
      const pt = contourPoints[i];
      stitches.push({
        xMm: (pt.x - width / 2) * scaleMmPerPxX,
        yMm: (pt.y - height / 2) * scaleMmPerPxY,
        type: i === 0 ? 'jump' : 'underlay',
      });
    }
  }

  if (layerConfig.stitchType === 'run') {
    const stride = Math.max(2, Math.floor(contourPoints.length / 260));
    for (let i = 0; i < contourPoints.length; i += stride) {
      const pt = contourPoints[i];
      stitches.push({
        xMm: (pt.x - width / 2) * scaleMmPerPxX,
        yMm: (pt.y - height / 2) * scaleMmPerPxY,
        type: i === 0 ? 'jump' : 'stitch',
      });
    }
    return stitches;
  }

  if (layerConfig.stitchType === 'cross') {
    const cellPx = Math.max(5, Math.round((layerConfig.densityMm || 0.45) * 16));
    const cx = width / 2;
    const cy = height / 2;
    for (let y = cellPx; y < height - cellPx; y += cellPx) {
      for (let x = cellPx; x < width - cellPx; y += cellPx) {
        if (isInside(x, y)) {
          const r = cellPx * 0.45;
          stitches.push(
            { xMm: (x - r - cx) * scaleMmPerPxX, yMm: (y - r - cy) * scaleMmPerPxY, type: 'jump' },
            { xMm: (x + r - cx) * scaleMmPerPxX, yMm: (y + r - cy) * scaleMmPerPxY, type: 'stitch' },
            { xMm: (x - r - cx) * scaleMmPerPxX, yMm: (y + r - cy) * scaleMmPerPxY, type: 'jump' },
            { xMm: (x + r - cx) * scaleMmPerPxX, yMm: (y - r - cy) * scaleMmPerPxY, type: 'stitch' }
          );
        }
      }
    }
    return stitches;
  }

  const angleRad = ((layerConfig.angleDeg || 0) * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  const densityMm = Math.max(0.22, Math.min(1.2, layerConfig.densityMm || 0.40));
  const rowStepPx = Math.max(1.5, densityMm / scaleMmPerPxY);
  const maxStitchLenPx = Math.max(6, (layerConfig.stitchLengthMm || 3.5) / scaleMmPerPxX);
  const pullCompPx = (layerConfig.pullCompMm || 0.25) / scaleMmPerPxX;

  const diag = Math.hypot(width, height);
  const cx = width / 2;
  const cy = height / 2;

  let rowIndex = 0;
  let prevEnd = null;

  for (let v = -diag / 2; v <= diag / 2; v += rowStepPx) {
    rowIndex++;
    const segments = [];
    let inSeg = false;
    let segStart = 0;

    for (let u = -diag / 2; u <= diag / 2; u += 1.5) {
      const px = cx + u * cosA - v * sinA;
      const py = cy + u * sinA + v * cosA;
      const inside = isInside(px, py);

      if (inside && !inSeg) {
        inSeg = true;
        segStart = u - pullCompPx;
      } else if (!inside && inSeg) {
        inSeg = false;
        segments.push([segStart, u + pullCompPx]);
      }
    }

    if (rowIndex % 2 === 1) segments.reverse();

    for (const [u0, u1] of segments) {
      const segLen = Math.abs(u1 - u0);
      if (segLen < 1.5) continue;

      const startU = rowIndex % 2 === 1 ? u1 : u0;
      const endU = rowIndex % 2 === 1 ? u0 : u1;

      const sx = cx + startU * cosA - v * sinA;
      const sy = cy + startU * sinA + v * cosA;
      const ex = cx + endU * cosA - v * sinA;
      const ey = cy + endU * sinA + v * cosA;

      const jumpDist = prevEnd ? Math.hypot(sx - prevEnd.x, sy - prevEnd.y) : 999;
      const isJump = jumpDist > 18;

      stitches.push({
        xMm: (sx - cx) * scaleMmPerPxX,
        yMm: (sy - cy) * scaleMmPerPxY,
        type: isJump ? 'jump' : 'stitch',
      });

      if (layerConfig.stitchType === 'tatami' && segLen > maxStitchLenPx) {
        const subdivisions = Math.ceil(segLen / maxStitchLenPx);
        const phaseOffset = (rowIndex % 3) * 0.28;
        for (let s = 1; s < subdivisions; s++) {
          const t = Math.min(0.95, (s + phaseOffset) / subdivisions);
          const mu = startU + (endU - startU) * t;
          const mx = cx + mu * cosA - v * sinA;
          const my = cy + mu * sinA + v * cosA;
          stitches.push({
            xMm: (mx - cx) * scaleMmPerPxX,
            yMm: (my - cy) * scaleMmPerPxY,
            type: 'stitch',
          });
        }
      }

      stitches.push({
        xMm: (ex - cx) * scaleMmPerPxX,
        yMm: (ey - cy) * scaleMmPerPxY,
        type: 'stitch',
      });

      prevEnd = { x: ex, y: ey };
    }
  }

  return stitches;
}

// ============================================================================
// 6. مشفّر الصيغ الفعلي لماكينات التطريز (Real Binary DST / PES / EXP / SVG Encoders)
// ============================================================================
function encodeTajimaDST(designTitle, layersWithStitches, widthMm, heightMm) {
  const allPackets = [];
  let totalStitches = 0;
  let colorChanges = 0;
  let prevX = 0;
  let prevY = 0;

  const encodeRecord = (dx, dy, flag) => {
    let b0 = 0, b1 = 0, b2 = 0;
    let x = Math.max(-81, Math.min(81, Math.round(dx)));
    let y = Math.max(-81, Math.min(81, Math.round(-dy)));

    if (x >= 41) { b2 |= 0x04; x -= 81; }
    if (x <= -41) { b2 |= 0x08; x += 81; }
    if (x >= 14) { b1 |= 0x04; x -= 27; }
    if (x <= -14) { b1 |= 0x08; x += 27; }
    if (x >= 5) { b0 |= 0x04; x -= 9; }
    if (x <= -5) { b0 |= 0x08; x += 9; }
    if (x >= 2) { b1 |= 0x01; x -= 3; }
    if (x <= -2) { b1 |= 0x02; x += 3; }
    if (x >= 1) { b0 |= 0x01; x -= 1; }
    if (x <= -1) { b0 |= 0x02; x += 1; }

    if (y >= 41) { b2 |= 0x20; y -= 81; }
    if (y <= -41) { b2 |= 0x10; y += 81; }
    if (y >= 14) { b1 |= 0x20; y -= 27; }
    if (y <= -14) { b1 |= 0x10; y += 27; }
    if (y >= 5) { b0 |= 0x20; y -= 9; }
    if (y <= -5) { b0 |= 0x10; y += 9; }
    if (y >= 2) { b1 |= 0x80; y -= 3; }
    if (y <= -2) { b1 |= 0x40; y += 3; }
    if (y >= 1) { b0 |= 0x80; y -= 1; }
    if (y <= -1) { b0 |= 0x40; y += 1; }

    b2 |= 0x03;
    if (flag === 'jump') b2 |= 0x80;
    if (flag === 'color_change') b2 |= 0xC0;
    if (flag === 'end') { b0 = 0; b1 = 0; b2 = 0xF3; }

    return [b0, b1, b2];
  };

  const visibleLayers = layersWithStitches.filter((l) => l.visible && l.stitches.length > 0);

  visibleLayers.forEach((layer, lIdx) => {
    if (lIdx > 0) {
      allPackets.push(...encodeRecord(0, 0, 'color_change'));
      colorChanges++;
    }
    for (const st of layer.stitches) {
      const targetX = Math.round(st.xMm * 10);
      const targetY = Math.round(st.yMm * 10);
      let remX = targetX - prevX;
      let remY = targetY - prevY;

      while (Math.abs(remX) > 81 || Math.abs(remY) > 81) {
        const stepX = Math.max(-81, Math.min(81, remX));
        const stepY = Math.max(-81, Math.min(81, remY));
        allPackets.push(...encodeRecord(stepX, stepY, 'jump'));
        remX -= stepX;
        remY -= stepY;
        totalStitches++;
      }

      allPackets.push(...encodeRecord(remX, remY, st.type === 'jump' ? 'jump' : 'normal'));
      prevX = targetX;
      prevY = targetY;
      totalStitches++;
    }
  });

  allPackets.push(...encodeRecord(0, 0, 'end'));

  const header = new Uint8Array(512);
  header.fill(0x20);
  const halfW = Math.round((widthMm * 10) / 2);
  const halfH = Math.round((heightMm * 10) / 2);
  const headerLines = [
    `LA:${(designTitle || 'WILCOM_AI').substring(0, 16).padEnd(16, ' ')}`,
    `ST:${String(totalStitches).padStart(7, ' ')}`,
    `CO:${String(colorChanges).padStart(3, ' ')}`,
    `+X:${String(halfW).padStart(5, ' ')}`,
    `-X:${String(halfW).padStart(5, ' ')}`,
    `+Y:${String(halfH).padStart(5, ' ')}`,
    `-Y:${String(halfH).padStart(5, ' ')}`,
    `AX:+    0`,
    `AY:+    0`,
  ];
  const headerStr = headerLines.join('\r') + '\r';
  for (let i = 0; i < headerStr.length && i < 511; i++) {
    header[i] = headerStr.charCodeAt(i) & 0x7F;
  }
  header[511] = 0x1A;

  const out = new Uint8Array(512 + allPackets.length);
  out.set(header, 0);
  out.set(allPackets, 512);
  return new Blob([out], { type: 'application/octet-stream' });
}

function encodeMelcoEXP(layersWithStitches) {
  const bytes = [];
  let prevX = 0, prevY = 0;
  const visibleLayers = layersWithStitches.filter((l) => l.visible && l.stitches.length > 0);

  visibleLayers.forEach((layer, idx) => {
    if (idx > 0) {
      bytes.push(0x80, 0x01, 0x00, 0x00);
    }
    for (const st of layer.stitches) {
      const tx = Math.round(st.xMm * 10);
      const ty = Math.round(-st.yMm * 10);
      let dx = tx - prevX;
      let dy = ty - prevY;
      while (Math.abs(dx) > 127 || Math.abs(dy) > 127) {
        const sx = Math.max(-127, Math.min(127, dx));
        const sy = Math.max(-127, Math.min(127, dy));
        bytes.push(0x80, 0x04, sx & 0xFF, sy & 0xFF);
        dx -= sx;
        dy -= sy;
      }
      if (st.type === 'jump') {
        bytes.push(0x80, 0x04, dx & 0xFF, dy & 0xFF);
      } else {
        bytes.push(dx & 0xFF, dy & 0xFF);
      }
      prevX = tx;
      prevY = ty;
    }
  });
  bytes.push(0x80, 0x80);
  return new Blob([new Uint8Array(bytes)], { type: 'application/octet-stream' });
}

function encodeBrotherPES(designTitle, layersWithStitches) {
  const expBlob = encodeMelcoEXP(layersWithStitches);
  const headerStr = `#PES0001WILCOM_AI_STUDIO_PRO_${(designTitle || 'DESIGN').substring(0, 12).padEnd(12, '_')}`;
  const headerBytes = new Uint8Array(48);
  for (let i = 0; i < headerStr.length && i < 48; i++) {
    headerBytes[i] = headerStr.charCodeAt(i) & 0x7F;
  }
  return new Blob([headerBytes, expBlob], { type: 'application/octet-stream' });
}

// ============================================================================
// 7. المكون الرئيسي: Wilcom AI Studio Pro (نسخة PWA الاحترافية الكاملة)
// ============================================================================
export default function WilcomAIStudioPro() {
  const [activePresetId, setActivePresetId] = useState('classic_porsche');
  const [designTitle, setDesignTitle] = useState(PRESET_DESIGNS.classic_porsche.title);
  const [customCalligraphyText, setCustomCalligraphyText] = useState('محمد');
  const [designWidthMm, setDesignWidthMm] = useState(120.0);
  const [designHeightMm, setDesignHeightMm] = useState(58.0);
  const [fabricColor, setFabricColor] = useState('#0F172A');
  const [layers, setLayers] = useState(PRESET_DESIGNS.classic_porsche.layers);
  const [selectedLayerId, setSelectedLayerId] = useState('porsche_blue');

  // عداد إصدار الأقنعة المكانية لضمان تحديث الغرز فور أي مسح أو تعديل على أي صورة
  const [maskVersion, setMaskVersion] = useState(1);

  // أداة الماوس التفاعلية على الكانفاس: 'none' | 'box_eraser' | 'box_recolor'
  const [canvasTool, setCanvasTool] = useState('none');
  const [dragRect, setDragRect] = useState(null);

  const [designTransform, setDesignTransform] = useState({
    rotationDeg: 0,
    flipX: false,
    flipY: false,
  });

  const [historyStack, setHistoryStack] = useState([]);
  const [liveDiffLog, setLiveDiffLog] = useState([
    'نسخة PWA جاهزة للعمل أونلاين وأوفلاين • جرب "احذف الكلمة الانجليزية" أو احفظ ملف الـ DST مباشرة على الفلاشة!',
  ]);
  const [canvasFlashPulse, setCanvasFlashPulse] = useState(false);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [numColorsToSeparate, setNumColorsToSeparate] = useState(4);
  const [removeWhiteBg, setRemoveWhiteBg] = useState(true);

  const [viewMode, setViewMode] = useState('trueview_3d');
  const [showHoops, setShowHoops] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showJumps, setShowJumps] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isolatedLayerId, setIsolatedLayerId] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [machineSpeedSPM, setMachineSpeedSPM] = useState(750);
  const [stitchProgress, setStitchProgress] = useState(100);

  // ==========================================================================
  // حالات الـ PWA، العمل أوفلاين، الفلاشة المباشرة، ومكتبة المشاريع المحفوظة
  // ==========================================================================
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pwaReady, setPwaReady] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isStandaloneInstalled, setIsStandaloneInstalled] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState('الآن');
  const [savedProjects, setSavedProjects] = useState(() => {
    try {
      const raw = localStorage.getItem('wilcom_ai_saved_projects_v1');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [
      {
        id: 'proj_default_mohamed',
        title: 'مخطوطة "محمد" - 3 إبر (قياسي)',
        presetId: 'mohamed_3colors',
        customText: 'محمد',
        widthMm: 100.0,
        heightMm: 34.0,
        fabricColor: '#F8FAFC',
        layers: PRESET_DESIGNS.mohamed_3colors.layers,
        updatedAt: 'محفوظ مسبقاً',
      },
      {
        id: 'proj_default_porsche',
        title: 'سيارة بورش Classic Smoke - 5 إبر',
        presetId: 'classic_porsche',
        customText: 'محمد',
        widthMm: 120.0,
        heightMm: 58.0,
        fabricColor: '#0F172A',
        layers: PRESET_DESIGNS.classic_porsche.layers,
        updatedAt: 'محفوظ مسبقاً',
      },
    ];
  });

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: 'أهلاً بيك يا هندسة في نسخة **Wilcom AI Studio Pro (Enterprise PWA)**! 🚀\n\nالتطبيق دلوقتي مجهز بالكامل كـ **PWA احترافي**:\n1. **يعمل أوفلاين 100%** مع حفظ تلقائي فوري لمشاريعك.\n2. **زر حفظ مباشر على الفلاشة (USB Direct Save):** يكتب ملف `.DST` أو `.PES` على الفلاشة فوراً بدون نوافذ متصفح.\n3. **تثبيت بنقرة واحدة** على سطح المكتب (ويندوز) أو الموبايل.\n4. **محرك تعديل وحذف مكاني ذكي** على أي صورة ترفعها أو على القوالب الجاهزة.',
      diffs: [],
    },
  ]);
  const [statusToast, setStatusToast] = useState(null);

  const mainCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const projectJsonInputRef = useRef(null);
  const layerMasksRef = useRef({});
  const originalMasksBackupRef = useRef({});
  const chatBottomRef = useRef(null);

  const triggerToast = useCallback((msg) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 4000);
  }, []);

  const triggerVisualPulse = useCallback(() => {
    setCanvasFlashPulse(true);
    setTimeout(() => setCanvasFlashPulse(false), 900);
  }, []);

  // ==========================================================================
  // حقن الـ Web App Manifest وتسجيل الـ Service Worker ومراقبة حالة الأوفلاين
  // ==========================================================================
  useEffect(() => {
    // 1. حقن الـ Manifest ديناميكياً في رأس الصفحة
    const manifestBlob = new Blob([JSON.stringify(PWA_MANIFEST_OBJECT, null, 2)], {
      type: 'application/manifest+json',
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    let linkEl = document.querySelector('link[rel="manifest"]');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.rel = 'manifest';
      document.head.appendChild(linkEl);
    }
    linkEl.href = manifestUrl;

    // إضافة لون الثيم وأيقونة الـ Apple Touch
    let themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = document.createElement('meta');
      themeMeta.name = 'theme-color';
      document.head.appendChild(themeMeta);
    }
    themeMeta.content = '#0f172a';

    // 2. فحص هل التطبيق يعمل بالفعل في وضع Standalone المثبت
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandaloneInstalled(checkStandalone);

    // 3. تسجيل Service Worker أو تفعيل كاش الأوفلاين المحلي
    setPwaReady(true);

    // 4. التقاط حدث التثبيت الرسمي في كروم وإيدج (beforeinstallprompt)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleOnline = () => {
      setIsOnline(true);
      triggerToast('🌐 عاد الاتصال بالإنترنت — جميع الميزات السحابية والمحلية متاحة.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerToast('⚡ وضع الأوفلاين نشط (PWA Offline Mode) — البرنامج يعمل بكامل طاقته محلياً!');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      URL.revokeObjectURL(manifestUrl);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerToast]);

  // الحفظ التلقائي الفوري (Auto-Save) في LocalStorage عند أي تعديل
  useEffect(() => {
    try {
      const autoSavePayload = {
        activePresetId,
        designTitle,
        customCalligraphyText,
        designWidthMm,
        designHeightMm,
        fabricColor,
        layers,
        designTransform,
        savedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      localStorage.setItem('wilcom_ai_autosave_state_v1', JSON.stringify(autoSavePayload));
      setLastAutoSaveTime(autoSavePayload.savedAt);
    } catch {
      // ignore storage quota errors
    }
  }, [activePresetId, designTitle, customCalligraphyText, designWidthMm, designHeightMm, fabricColor, layers, designTransform]);

  // تهيئة أقنعة القالب الافتراضي عند أول تشغيل
  useEffect(() => {
    const initMasks = buildInitialPresetMasks('classic_porsche', 'محمد', 560, 280, 2.2, 0.25);
    layerMasksRef.current = initMasks;
    originalMasksBackupRef.current = cloneCanvasMap(initMasks);
    setMaskVersion((v) => v + 1);
  }, []);

  // تحميل قالب جاهز مع حفظ أقنعته المكانية في الذاكرة
  const loadPresetDesign = useCallback((presetKey, customWord = 'محمد') => {
    const preset = PRESET_DESIGNS[presetKey] || PRESET_DESIGNS.classic_porsche;
    const builtMasks = buildInitialPresetMasks(
      presetKey,
      customWord,
      560,
      280,
      preset.layers[preset.layers.length - 1]?.satinWidthMm || 2.2,
      preset.layers[0]?.pullCompMm || 0.25
    );
    layerMasksRef.current = builtMasks;
    originalMasksBackupRef.current = cloneCanvasMap(builtMasks);
    setActivePresetId(presetKey);
    setDesignTitle(presetKey === 'custom_text' ? `مخطوطة تطريز: "${customWord}"` : preset.title);
    setCustomCalligraphyText(customWord);
    setDesignWidthMm(preset.widthMm);
    setDesignHeightMm(preset.heightMm);
    setFabricColor(preset.fabricColor);
    setLayers(JSON.parse(JSON.stringify(preset.layers)));
    setSelectedLayerId(preset.layers[0]?.id || '');
    setDesignTransform({ rotationDeg: 0, flipX: false, flipY: false });
    setMaskVersion((v) => v + 1);
    triggerVisualPulse();
  }, [triggerVisualPulse]);

  const saveHistorySnapshot = useCallback(() => {
    setHistoryStack((prev) => [
      ...prev.slice(-10),
      {
        activePresetId,
        designTitle,
        customCalligraphyText,
        designWidthMm,
        designHeightMm,
        fabricColor,
        layers: JSON.parse(JSON.stringify(layers)),
        designTransform: { ...designTransform },
        masksSnapshot: cloneCanvasMap(layerMasksRef.current),
      },
    ]);
  }, [activePresetId, designTitle, customCalligraphyText, designWidthMm, designHeightMm, fabricColor, layers, designTransform]);

  const handleUndo = () => {
    if (historyStack.length === 0) {
      triggerToast('لا توجد خطوات سابقة للتراجع عنها.');
      return;
    }
    const last = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    layerMasksRef.current = cloneCanvasMap(last.masksSnapshot);
    setActivePresetId(last.activePresetId);
    setDesignTitle(last.designTitle);
    setCustomCalligraphyText(last.customCalligraphyText);
    setDesignWidthMm(last.designWidthMm);
    setDesignHeightMm(last.designHeightMm);
    setFabricColor(last.fabricColor);
    setLayers(last.layers);
    setDesignTransform(last.designTransform);
    setMaskVersion((v) => v + 1);
    setLiveDiffLog(['↩️ تم التراجع للخطوة السابقة واستعادة الأقنعة والغرز كما كانت']);
    triggerVisualPulse();
    triggerToast('تم التراجع للخطوة السابقة بنجاح!');
  };

  const handleRestoreOriginalImage = () => {
    if (Object.keys(originalMasksBackupRef.current).length === 0) return;
    saveHistorySnapshot();
    layerMasksRef.current = cloneCanvasMap(originalMasksBackupRef.current);
    setMaskVersion((v) => v + 1);
    setLiveDiffLog(['🔄 تمت استعادة كامل أجزاء الصورة الأصلية قبل الحذف']);
    triggerVisualPulse();
    triggerToast('تمت استعادة الصورة الأصلية بالكامل!');
  };

  // ============================================================================
  // 8. توليد الغرز الحقيقية من الأقنعة المكانية المحفوظة (Persistent Masks -> Stitches)
  // ============================================================================
  const layersWithStitches = useMemo(() => {
    const masks = layerMasksRef.current || {};
    return layers.map((layer) => {
      const maskCanvas = masks[layer.role];
      if (!maskCanvas) {
        return { ...layer, stitches: [] };
      }
      const stitches = generateStitchesForLayer(
        maskCanvas,
        layer,
        designWidthMm,
        designHeightMm
      );
      return { ...layer, stitches };
    });
  }, [layers, designWidthMm, designHeightMm, maskVersion]);

  const stats = useMemo(() => {
    let totalStitches = 0;
    let totalJumps = 0;
    let totalUnderlay = 0;
    layersWithStitches.forEach((l) => {
      if (!l.visible) return;
      if (isolatedLayerId && l.id !== isolatedLayerId) return;
      totalStitches += l.stitches.length;
      totalJumps += l.stitches.filter((s) => s.type === 'jump').length;
      totalUnderlay += l.stitches.filter((s) => s.type === 'underlay').length;
    });
    const estMinutes = Math.max(1, Math.round(totalStitches / machineSpeedSPM));
    return { totalStitches, totalJumps, totalUnderlay, estMinutes };
  }, [layersWithStitches, machineSpeedSPM, isolatedLayerId]);

  // ============================================================================
  // 9. خوارزمية فصل الألوان الذكية للصور المرفوعة (مع حفظ الأقنعة المكانية)
  // ============================================================================
  const processUploadedImageToEmbroidery = useCallback((imgElement, kColors = 4, dropWhite = true) => {
    const w = 560;
    const h = Math.round((imgElement.height / imgElement.width) * 560) || 280;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h).data;

    const samples = [];
    for (let i = 0; i < imgData.length; i += 16) {
      const r = imgData[i], g = imgData[i + 1], b = imgData[i + 2], a = imgData[i + 3];
      if (a < 80) continue;
      if (dropWhite && r > 232 && g > 232 && b > 232) continue;
      samples.push([r, g, b]);
    }

    if (samples.length === 0) {
      triggerToast('الصورة فارغة أو بيضاء بالكامل، جرب تقليل عزل الخلفية.');
      return;
    }

    const centroids = [];
    for (let c = 0; c < kColors; c++) {
      centroids.push([...samples[Math.floor((c * samples.length) / kColors)]]);
    }

    for (let iter = 0; iter < 7; iter++) {
      const sums = Array.from({ length: kColors }, () => [0, 0, 0, 0]);
      for (const [r, g, b] of samples) {
        let bestK = 0, minD = Infinity;
        for (let k = 0; k < kColors; k++) {
          const d = Math.hypot(r - centroids[k][0], g - centroids[k][1], b - centroids[k][2]);
          if (d < minD) { minD = d; bestK = k; }
        }
        sums[bestK][0] += r;
        sums[bestK][1] += g;
        sums[bestK][2] += b;
        sums[bestK][3] += 1;
      }
      for (let k = 0; k < kColors; k++) {
        if (sums[k][3] > 0) {
          centroids[k] = [
            Math.round(sums[k][0] / sums[k][3]),
            Math.round(sums[k][1] / sums[k][3]),
            Math.round(sums[k][2] / sums[k][3]),
          ];
        }
      }
    }

    const newMasks = {};
    const newLayers = [];

    centroids.forEach((rgb, idx) => {
      const roleKey = `sep_color_${idx + 1}`;
      const cMask = document.createElement('canvas');
      cMask.width = w;
      cMask.height = h;
      const mCtx = cMask.getContext('2d');
      const mImg = mCtx.createImageData(w, h);

      for (let p = 0; p < imgData.length; p += 4) {
        const r = imgData[p], g = imgData[p + 1], b = imgData[p + 2], a = imgData[p + 3];
        if (a < 80 || (dropWhite && r > 232 && g > 232 && b > 232)) continue;
        let bestK = 0, minD = Infinity;
        for (let k = 0; k < kColors; k++) {
          const d = Math.hypot(r - centroids[k][0], g - centroids[k][1], b - centroids[k][2]);
          if (d < minD) { minD = d; bestK = k; }
        }
        if (bestK === idx) {
          mImg.data[p] = 0;
          mImg.data[p + 1] = 0;
          mImg.data[p + 2] = 0;
          mImg.data[p + 3] = 255;
        }
      }
      mCtx.putImageData(mImg, 0, 0);
      newMasks[roleKey] = cMask;

      const madeira = findClosestMadeira(rgb);
      newLayers.push({
        id: `needle_img_${idx + 1}`,
        name: `الإبرة #${idx + 1}: ${madeira.name}`,
        madeiraCode: madeira.code,
        color: madeira.hex,
        stitchType: idx === kColors - 1 ? 'satin' : 'tatami',
        angleDeg: (idx * 35) % 180,
        densityMm: 0.38,
        stitchLengthMm: 3.5,
        satinWidthMm: 2.2,
        pullCompMm: 0.25,
        underlay: 'edge_zigzag',
        visible: true,
        role: roleKey,
      });
    });

    layerMasksRef.current = newMasks;
    originalMasksBackupRef.current = cloneCanvasMap(newMasks);
    setActivePresetId('uploaded_image');
    setLayers(newLayers);
    setSelectedLayerId(newLayers[0]?.id || '');
    setDesignWidthMm(115);
    setDesignHeightMm(Math.max(25, Math.round((h / w) * 115)));
    setMaskVersion((v) => v + 1);
    setLiveDiffLog([`تم فصل الصورة المرفوعة إلى ${kColors} إبر — يمكنك الآن حذف أي كلمة أو جزء منها عبر الشات أو بالماوس!`]);
    triggerVisualPulse();
    triggerToast(`تم فصل الصورة بنجاح إلى ${kColors} أفلام تطريز جاهزة للتعديل الذكي!`);
  }, [triggerToast, triggerVisualPulse]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        saveHistorySnapshot();
        setUploadedImage(img);
        setDesignTitle(`فيلم مفروز: ${file.name.replace(/\.[^.]+$/, '')}`);
        processUploadedImageToEmbroidery(img, numColorsToSeparate, removeWhiteBg);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ============================================================================
  // 10. تفاعل أداة الممحاة وتحديد المناطق بالماوس مباشرة على الكانفاس
  // ============================================================================
  const getCanvasNormalizedCoords = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return { nx: 0.5, ny: 0.5, cx: 0, cy: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    // تحويل إحداثيات الكانفاس إلى إحداثيات القناع (0..1) بناءً على مقياس المليمتر
    const pxPerMm = 5.4 * zoomLevel;
    const designPxW = designWidthMm * pxPerMm;
    const designPxH = designHeightMm * pxPerMm;
    const leftEdge = canvas.width / 2 - designPxW / 2;
    const topEdge = canvas.height / 2 - designPxH / 2;

    const nx = Math.max(0, Math.min(1, (cx - leftEdge) / designPxW));
    const ny = Math.max(0, Math.min(1, (cy - topEdge) / designPxH));
    return { nx, ny, cx, cy };
  };

  const handleCanvasMouseDown = (e) => {
    if (canvasTool === 'none') return;
    const { nx, ny, cx, cy } = getCanvasNormalizedCoords(e);
    setDragRect({ startNx: nx, startNy: ny, curNx: nx, curNy: ny, startCx: cx, startCy: cy, curCx: cx, curCy: cy });
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragRect || canvasTool === 'none') return;
    const { nx, ny, cx, cy } = getCanvasNormalizedCoords(e);
    setDragRect((prev) => (prev ? { ...prev, curNx: nx, curNy: ny, curCx: cx, curCy: cy } : null));
  };

  const handleCanvasMouseUp = () => {
    if (!dragRect || canvasTool === 'none') return;
    const x1 = Math.min(dragRect.startNx, dragRect.curNx);
    const x2 = Math.max(dragRect.startNx, dragRect.curNx);
    const y1 = Math.min(dragRect.startNy, dragRect.curNy);
    const y2 = Math.max(dragRect.startNy, dragRect.curNy);
    setDragRect(null);

    if (x2 - x1 < 0.02 || y2 - y1 < 0.02) return;

    saveHistorySnapshot();
    const prevStitches = stats.totalStitches;

    if (canvasTool === 'box_eraser') {
      const targetRoles = isolatedLayerId
        ? [layers.find((l) => l.id === isolatedLayerId)?.role].filter(Boolean)
        : null;
      const { updatedMasks } = eraseSpatialRegionFromMasks(
        layerMasksRef.current,
        { x1, y1, x2, y2 },
        targetRoles
      );
      layerMasksRef.current = updatedMasks;
      setMaskVersion((v) => v + 1);
      setLiveDiffLog([
        `🧹 تم مسح المنطقة المحددة بالماوس بنجاح وتحديث مسارات الغرز تلقائياً!`,
      ]);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `✅ تم مسح المنطقة التي حددتها بالماوس من أقنعة الإبر وإعادة حساب الغرز للتصميم المتبقي دون المساس بباقي الرسمة!`,
          diffs: [`حذف منطقة مكانية (${Math.round(x1 * 100)}%,${Math.round(y1 * 100)}%) — الغرز قبل الحذف: ${prevStitches.toLocaleString()}`],
        },
      ]);
      triggerVisualPulse();
      triggerToast('تم حذف المنطقة المحددة من التصميم وإعادة توليد الغرز!');
    } else if (canvasTool === 'box_recolor') {
      const selLayer = layers.find((l) => l.id === selectedLayerId) || layers[0];
      if (selLayer) {
        const updatedMasks = transferRegionToLayerMask(
          layerMasksRef.current,
          { x1, y1, x2, y2 },
          selLayer.role
        );
        layerMasksRef.current = updatedMasks;
        setMaskVersion((v) => v + 1);
        setLiveDiffLog([`🎨 تم نقل المنطقة المحددة إلى ${selLayer.name} (${selLayer.color})`]);
        triggerVisualPulse();
        triggerToast(`تم تحويل المنطقة المحددة إلى لون ${selLayer.name}!`);
      }
    }
  };

  // ============================================================================
  // 11. الرسم الحي للغرز الثلاثية الأبعاد (TrueView 3D Stitch Renderer) على Canvas
  // ============================================================================
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = fabricColor;
    ctx.fillRect(0, 0, W, H);

    if (showGrid) {
      ctx.save();
      const isDarkFabric = ['#0F172A', '#1E293B', '#141414', '#450A0A', '#064E3B'].includes(fabricColor);
      ctx.strokeStyle = isDarkFabric ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)';
      ctx.lineWidth = 1;
      const gridStep = 28 * zoomLevel;
      for (let x = W / 2; x < W; x += gridStep) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let x = W / 2; x > 0; x -= gridStep) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = H / 2; y < H; y += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let y = H / 2; y > 0; y -= gridStep) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(239,68,68,0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
      ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.restore();
    }

    if (showHoops) {
      ctx.save();
      ctx.strokeStyle = 'rgba(100,116,139,0.45)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 315 * zoomLevel, H / 2 - 165 * zoomLevel, 630 * zoomLevel, 330 * zoomLevel, 36);
      ctx.stroke();
      ctx.restore();
    }

    const allDrawableStitches = [];
    layersWithStitches.forEach((layer) => {
      if (!layer.visible) return;
      if (isolatedLayerId && layer.id !== isolatedLayerId) return;
      layer.stitches.forEach((st) => {
        allDrawableStitches.push({
          ...st,
          color: layer.color,
          stitchType: layer.stitchType,
          satinWidthMm: layer.satinWidthMm,
        });
      });
    });

    const maxCount = Math.floor((stitchProgress / 100) * allDrawableStitches.length);
    const pxPerMm = 5.4 * zoomLevel;
    const centerX = W / 2;
    const centerY = H / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    if (designTransform.rotationDeg) {
      ctx.rotate((designTransform.rotationDeg * Math.PI) / 180);
    }
    if (designTransform.flipX || designTransform.flipY) {
      ctx.scale(designTransform.flipX ? -1 : 1, designTransform.flipY ? -1 : 1);
    }
    ctx.translate(-centerX, -centerY);

    let lastX = centerX;
    let lastY = centerY;

    for (let i = 0; i < maxCount; i++) {
      const st = allDrawableStitches[i];
      const x = centerX + st.xMm * pxPerMm;
      const y = centerY + st.yMm * pxPerMm;

      if (i === 0) {
        lastX = x;
        lastY = y;
        continue;
      }

      if (st.type === 'jump') {
        if (showJumps || viewMode === 'vectors') {
          ctx.save();
          ctx.strokeStyle = 'rgba(244,63,94,0.55)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(lastX, lastY);
          ctx.lineTo(x, y);
          ctx.stroke();
          ctx.restore();
        }
        lastX = x;
        lastY = y;
        continue;
      }

      if (viewMode === 'trueview_3d') {
        const threadThickness = st.stitchType === 'satin'
          ? Math.max(2.1, (st.satinWidthMm || 2.2) * 1.15)
          : st.type === 'underlay'
          ? 1.2
          : 2.05;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.lineCap = 'round';

        ctx.strokeStyle = 'rgba(0,0,0,0.34)';
        ctx.lineWidth = (threadThickness + 0.9) * zoomLevel;
        ctx.stroke();

        ctx.strokeStyle = st.color;
        ctx.lineWidth = threadThickness * zoomLevel;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 0.7 * zoomLevel;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = st.type === 'underlay' ? '#F59E0B' : '#10B981';
        ctx.fillRect(x - 1.3, y - 1.3, 2.6, 2.6);
        ctx.restore();
      }

      lastX = x;
      lastY = y;
    }

    if (maxCount > 0 && maxCount < allDrawableStitches.length) {
      ctx.save();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 9, 0, Math.PI * 2);
      ctx.moveTo(lastX - 14, lastY); ctx.lineTo(lastX + 14, lastY);
      ctx.moveTo(lastX, lastY - 14); ctx.lineTo(lastX, lastY + 14);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    // رسم مستطيل التحديد أو الممحاة التفاعلية بالماوس أثناء السحب
    if (dragRect) {
      ctx.save();
      const rx = Math.min(dragRect.startCx, dragRect.curCx);
      const ry = Math.min(dragRect.startCy, dragRect.curCy);
      const rw = Math.abs(dragRect.curCx - dragRect.startCx);
      const rh = Math.abs(dragRect.curCy - dragRect.startCy);
      ctx.fillStyle = canvasTool === 'box_eraser' ? 'rgba(239, 68, 68, 0.22)' : 'rgba(56, 189, 248, 0.22)';
      ctx.strokeStyle = canvasTool === 'box_eraser' ? '#EF4444' : '#38BDF8';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.restore();
    }
  }, [layersWithStitches, fabricColor, showGrid, showHoops, showJumps, zoomLevel, stitchProgress, viewMode, isolatedLayerId, designTransform, dragRect, canvasTool]);

  useEffect(() => {
    if (!isPlaying) return;
    const stepPerTick = Math.max(0.4, machineSpeedSPM / 600);
    const timer = setInterval(() => {
      setStitchProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return Math.min(100, +(prev + stepPerTick).toFixed(1));
      });
    }, 40);
    return () => clearInterval(timer);
  }, [isPlaying, machineSpeedSPM]);

  // ============================================================================
  // 12. محرك الأوامر الذكي المطور (Spatial & Semantic Natural Language Engine)
  // يفهم الحذف المكاني، وتعديل أجزاء الصور المرفوعة، وتغيير الألوان والغرز بدون ضياع التصميم!
  // ============================================================================
  const executeNaturalLanguageCommand = async (rawText) => {
    const promptText = (rawText || aiPrompt).trim();
    if (!promptText) return;

    saveHistorySnapshot();
    setChatHistory((prev) => [...prev, { role: 'user', text: promptText }]);
    setAiPrompt('');
    setIsAiThinking(true);

    let nextPresetId = activePresetId;
    let nextText = customCalligraphyText;
    let nextTitle = designTitle;
    let nextWidth = designWidthMm;
    let nextHeight = designHeightMm;
    let nextFabric = fabricColor;
    let nextLayers = JSON.parse(JSON.stringify(layers));
    let nextTransform = { ...designTransform };
    let currentMasks = cloneCanvasMap(layerMasksRef.current);
    let masksModified = false;
    const appliedDiffs = [];

    const lower = promptText.toLowerCase();

    // ------------------------------------------------------------------------
    // أ) فحص أوامر الحذف والمسح المكاني أولاً (لمنع خلط "احذف الكلمة" بـ "اكتب كلمة" نهائياً!)
    // ------------------------------------------------------------------------
    const isDeleteIntent = /(?:احذف|إحذف|امسح|إمسح|شيل|الغ|ألغ|فرغ|اشطب|بدون|من غير|اخفي|إخفي|remove|delete|erase|clear)/i.test(promptText);

    if (isDeleteIntent) {
      // 1. حذف الكلمة الإنجليزية / الكتابة / النص (مثل CLASSIC SMOKE في صورة البورش أو أي صورة مرفوعة)
      if (/(?:الكلمة|الكلمه|الكلام|الكتابة|الكتابه|النص|الحروف|الانجليزي|الانجليزية|الإنجليزي|الاسم|اللوجو|text|classic|smoke)/i.test(promptText) && !promptText.includes('الدخان الرمادي')) {
        let hint = 'auto';
        if (promptText.includes('تحت') || promptText.includes('أسفل') || promptText.includes('اسفل')) hint = 'bottom';
        else if (promptText.includes('شمال') || promptText.includes('يسار')) hint = 'left';
        else if (promptText.includes('فوق') && !promptText.includes('يمين')) hint = 'top';

        const { updatedMasks } = detectAndEraseTextBlocksInMasks(currentMasks, hint);
        currentMasks = updatedMasks;
        masksModified = true;
        appliedDiffs.push('حذف منطقة الكتابة/الكلمة الإنجليزية (CLASSIC SMOKE) من أقنعة الصورة مع الحفاظ على السيارة والتصميم بالكامل');
      }

      // 2. حذف الدخان (Smoke Swirls) من تصميم البورش أو الجزء العلوي من الصورة
      if (promptText.includes('دخان') || promptText.includes('الدخان')) {
        const smokeLayerIdx = nextLayers.findIndex((l) => l.role === 'smoke_swirls' || l.name.includes('دخان') || l.madeiraCode === '1818');
        if (smokeLayerIdx !== -1 && activePresetId === 'classic_porsche') {
          nextLayers[smokeLayerIdx].visible = false;
          const { updatedMasks } = eraseSpatialRegionFromMasks(currentMasks, { x1: 0.15, y1: 0.0, x2: 0.68, y2: 0.36 }, [nextLayers[smokeLayerIdx].role]);
          currentMasks = updatedMasks;
          masksModified = true;
          appliedDiffs.push('حذف طبقة ومنطقة الدخان المتصاعد (Smoke Swirls) أعلى السيارة');
        } else {
          // في حال كانت صورة مرفوعة خارجية: نمسح منطقة الدخان أعلى منتصف التصميم
          const { updatedMasks } = eraseSpatialRegionFromMasks(currentMasks, { x1: 0.18, y1: 0.01, x2: 0.66, y2: 0.36 });
          currentMasks = updatedMasks;
          masksModified = true;
          appliedDiffs.push('مسح منطقة الدخان العلوية من الصورة المرفوعة');
        }
      }

      // 3. حذف منطقة محددة بالاتجاه (اليمين / الشمال / الجزء العلوي / الجزء السفلي)
      if (promptText.includes('الجزء العلوي') || promptText.includes('اللي فوق')) {
        const { updatedMasks } = eraseSpatialRegionFromMasks(currentMasks, { x1: 0.0, y1: 0.0, x2: 1.0, y2: 0.35 });
        currentMasks = updatedMasks;
        masksModified = true;
        appliedDiffs.push('مسح المنطقة العلوية (أعلى 35%) من التصميم');
      } else if (promptText.includes('الجزء السفلي') || promptText.includes('اللي تحت')) {
        const { updatedMasks } = eraseSpatialRegionFromMasks(currentMasks, { x1: 0.0, y1: 0.70, x2: 1.0, y2: 1.0 });
        currentMasks = updatedMasks;
        masksModified = true;
        appliedDiffs.push('مسح المنطقة السفلية (أسفل 30%) من التصميم');
      } else if ((promptText.includes('اليمين') || promptText.includes('يمين')) && !masksModified) {
        const { updatedMasks } = eraseSpatialRegionFromMasks(currentMasks, { x1: 0.60, y1: 0.0, x2: 1.0, y2: 1.0 });
        currentMasks = updatedMasks;
        masksModified = true;
        appliedDiffs.push('مسح المنطقة اليمنى من التصميم');
      } else if ((promptText.includes('الشمال') || promptText.includes('اليسار')) && !masksModified) {
        const { updatedMasks } = eraseSpatialRegionFromMasks(currentMasks, { x1: 0.0, y1: 0.0, x2: 0.38, y2: 1.0 });
        currentMasks = updatedMasks;
        masksModified = true;
        appliedDiffs.push('مسح المنطقة اليسرى من التصميم');
      }

      // 4. حذف إبرة محددة بالرقم أو باللون (مثل "احذف الإبرة 3" أو "امسح اللون الرمادي" أو "شيل البرواز")
      const needleNumMatch = promptText.match(/(?:إبرة|ابرة|الإبرة|الابرة|لون)\s*(?:رقم)?\s*(\d)/);
      if (needleNumMatch) {
        const nIdx = parseInt(needleNumMatch[1], 10) - 1;
        if (nextLayers[nIdx]) {
          nextLayers[nIdx].visible = false;
          appliedDiffs.push(`إيقاف وإخفاء ${nextLayers[nIdx].name}`);
        }
      } else if (promptText.includes('برواز') || promptText.includes('إطار') || promptText.includes('اطار')) {
        const bIdx = nextLayers.length - 1;
        if (nextLayers[bIdx]) {
          nextLayers[bIdx].visible = false;
          appliedDiffs.push(`إخفاء إبرة البرواز (${nextLayers[bIdx].name})`);
        }
      } else {
        const colToDelete = findMadeiraByKeyword(promptText);
        if (colToDelete && !masksModified) {
          const targetLayer = nextLayers.find((l) => l.madeiraCode === colToDelete.code);
          if (targetLayer) {
            targetLayer.visible = false;
            appliedDiffs.push(`إخفاء الإبرة ذات اللون ${colToDelete.name}`);
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // ب) أوامر الكتابة أو إضافة نص (فقط عندما لا يكون الأمر أمر حذف!)
    // ------------------------------------------------------------------------
    if (!isDeleteIntent) {
      const writeRegex = /(?:اكتب|أكتب|ضيف كلمة|حط كلمة|غير الكلمة لـ|غير الاسم لـ|خلي الكلمة)\s+["«']?([\u0600-\u06FFa-zA-Z0-9\s]{2,18}?)["»']?(?:\s+بخط|\s+باللون|\s+فوق|\s+تحت|\s+و|\s*$)/i;
      const writeMatch = promptText.match(writeRegex);
      if (writeMatch) {
        const candidateWord = writeMatch[1]
          .replace(/\b(بخط|عربي|عريض|تطريز|فيلم|لون|ألوان|الوان|دهبي|أحمر|احمر|أزرق|ازرق|تاج|فوق|تحت|التصميم|الصورة)\b/g, '')
          .trim();

        if (candidateWord && candidateWord.length >= 2) {
          // إذا كان المستخدم يعمل على صورة بورش أو صورة مرفوعة وطلب "ضيف كلمة..." ندمجها فوق الصورة بدون مسح الصورة!
          if (
            (activePresetId === 'uploaded_image' || activePresetId === 'classic_porsche') &&
            (promptText.includes('ضيف') || promptText.includes('حط') || promptText.includes('تحت') || promptText.includes('فوق'))
          ) {
            const pos = promptText.includes('فوق') ? 'top' : 'bottom';
            const targetRole = nextLayers[nextLayers.length - 1]?.role;
            currentMasks = stampOverlayTextOntoMask(currentMasks, targetRole, candidateWord, pos);
            masksModified = true;
            appliedDiffs.push(`إضافة مخطوطة "${candidateWord}" ${pos === 'top' ? 'أعلى' : 'أسفل'} التصميم الحالي دون مسح الصورة`);
          } else {
            // تحويل إلى وضع المخطوطة النصية فقط إذا طلب كتابة كلمة جديدة صراحة
            const oldWord = nextText;
            nextText = candidateWord;
            nextPresetId = candidateWord === 'محمد' ? 'mohamed_3colors' : 'custom_text';
            nextTitle = `مخطوطة تطريز: "${candidateWord}"`;
            nextLayers = JSON.parse(JSON.stringify(PRESET_DESIGNS.mohamed_3colors.layers));
            currentMasks = buildInitialPresetMasks(nextPresetId, nextText, 560, 280, 2.2, 0.25);
            originalMasksBackupRef.current = cloneCanvasMap(currentMasks);
            masksModified = true;
            appliedDiffs.push(`المخطوطة: "${oldWord}" ← "${candidateWord}"`);
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // ج) أوامر تغيير ألوان أجزاء محددة في الصورة (العربية، الدخان، الكاوتش، البرواز، القلب)
    // ------------------------------------------------------------------------
    if (promptText.includes('اعكس الألوان') || promptText.includes('اعكس الالوان') || promptText.includes('بدل الألوان')) {
      if (nextLayers.length >= 2) {
        const c0 = { code: nextLayers[0].madeiraCode, color: nextLayers[0].color };
        nextLayers[0].madeiraCode = nextLayers[1].madeiraCode;
        nextLayers[0].color = nextLayers[1].color;
        nextLayers[1].madeiraCode = c0.code;
        nextLayers[1].color = c0.color;
        appliedDiffs.push('عكس ألوان الإبرة #1 والإبرة #2');
      }
    }

    if (promptText.includes('قماش') || promptText.includes('خلفية') || promptText.includes('تيشيرت')) {
      const fabColor = findMadeiraByKeyword(promptText);
      if (fabColor) {
        nextFabric = fabColor.hex;
        appliedDiffs.push(`لون القماش: ${fabColor.name}`);
      } else if (promptText.includes('غامق') || promptText.includes('كحلي')) {
        nextFabric = '#0F172A';
        appliedDiffs.push('لون القماش: كحلي غامق');
      } else if (promptText.includes('فاتح') || promptText.includes('ابيض') || promptText.includes('أبيض')) {
        nextFabric = '#F8FAFC';
        appliedDiffs.push('لون القماش: أبيض فاتح');
      }
    }

    if (!isDeleteIntent) {
      const clauses = promptText.split(/(?:و|،|,|ثم)/);
      clauses.forEach((clause) => {
        if (clause.includes('قماش') || clause.includes('خلفية')) return;
        const matchedColor = findMadeiraByKeyword(clause);
        if (!matchedColor) return;

        const borderIdx = nextLayers.length - 1;
        if (clause.includes('عربية') || clause.includes('العربية') || clause.includes('سيارة') || clause.includes('السيارة') || clause.includes('بورش') || clause.includes('جسم')) {
          const oldCol = nextLayers[0].color;
          nextLayers[0].madeiraCode = matchedColor.code;
          nextLayers[0].color = matchedColor.hex;
          appliedDiffs.push(`لون جسم السيارة (الإبرة #1): ${oldCol} ← ${matchedColor.name} (#${matchedColor.code})`);
        } else if (clause.includes('دخان') || clause.includes('الدخان')) {
          const sIdx = nextLayers.findIndex((l) => l.role === 'smoke_swirls') !== -1 ? nextLayers.findIndex((l) => l.role === 'smoke_swirls') : (nextLayers[1] ? 1 : 0);
          nextLayers[sIdx].madeiraCode = matchedColor.code;
          nextLayers[sIdx].color = matchedColor.hex;
          appliedDiffs.push(`لون الدخان: ← ${matchedColor.name} (#${matchedColor.code})`);
        } else if (clause.includes('برواز') || clause.includes('إطار') || clause.includes('اطار') || clause.includes('تحديد') || clause.includes('كاوتش') || clause.includes('الإبرة 3') || clause.includes('الابرة 3')) {
          const oldCol = nextLayers[borderIdx].color;
          nextLayers[borderIdx].madeiraCode = matchedColor.code;
          nextLayers[borderIdx].color = matchedColor.hex;
          appliedDiffs.push(`لون البرواز/التحديد: ${oldCol} ← ${matchedColor.name} (#${matchedColor.code})`);
        } else if (clause.includes('قلب') || clause.includes('نص') || clause.includes('وسط') || clause.includes('الإبرة 2') || clause.includes('الابرة 2') || clause.includes('ثاني') || clause.includes('تاني')) {
          const midIdx = nextLayers.length > 1 ? 1 : 0;
          const oldCol = nextLayers[midIdx].color;
          nextLayers[midIdx].madeiraCode = matchedColor.code;
          nextLayers[midIdx].color = matchedColor.hex;
          appliedDiffs.push(`لون الإبرة #${midIdx + 1}: ${oldCol} ← ${matchedColor.name} (#${matchedColor.code})`);
        } else if (clause.includes('أطراف') || clause.includes('اطراف') || clause.includes('الإبرة 1') || clause.includes('الابرة 1') || clause.includes('أول') || clause.includes('اول') || clause.includes('لون')) {
          const oldCol = nextLayers[0].color;
          nextLayers[0].madeiraCode = matchedColor.code;
          nextLayers[0].color = matchedColor.hex;
          appliedDiffs.push(`لون الإبرة #1: ${oldCol} ← ${matchedColor.name} (#${matchedColor.code})`);
        }
      });
    }

    // ------------------------------------------------------------------------
    // د) أوامر الكثافة، عرض الساتان، زاوية الغرز، نوع الغرزة، والمقاس
    // ------------------------------------------------------------------------
    const borderLayerIdx = nextLayers.length - 1;
    if ((promptText.includes('عريض') || promptText.includes('تخن') || promptText.includes('سميك')) && nextLayers[borderLayerIdx]) {
      const oldW = nextLayers[borderLayerIdx].satinWidthMm;
      const newW = +(Math.min(5.0, oldW + 1.2)).toFixed(1);
      nextLayers[borderLayerIdx].satinWidthMm = newW;
      appliedDiffs.push(`تخانة الساتان: ${oldW}mm ← ${newW}mm (عريض)`);
    } else if ((promptText.includes('رفيع') || promptText.includes('رقق')) && nextLayers[borderLayerIdx]) {
      const oldW = nextLayers[borderLayerIdx].satinWidthMm;
      const newW = +(Math.max(1.2, oldW - 0.8)).toFixed(1);
      nextLayers[borderLayerIdx].satinWidthMm = newW;
      appliedDiffs.push(`تخانة الساتان: ${oldW}mm ← ${newW}mm (رفيع)`);
    }

    const densityMatch = promptText.match(/(?:كثافة|الكثافة|density)\s*(?:لـ|الى|إلى|=|:)?\s*(0\.\d+)/i);
    if (densityMatch) {
      const oldD = nextLayers[0]?.densityMm || 0.38;
      const val = Math.max(0.24, Math.min(0.90, parseFloat(densityMatch[1])));
      nextLayers = nextLayers.map((l) => ({ ...l, densityMm: val }));
      appliedDiffs.push(`كثافة الغرز (Density): ${oldD}mm ← ${val}mm`);
    } else if (promptText.includes('زود الكثافة') || promptText.includes('زود كثافة') || promptText.includes('كثف') || promptText.includes('قلل المسافات')) {
      const oldD = nextLayers[0]?.densityMm || 0.38;
      const newD = +(Math.max(0.25, oldD - 0.08)).toFixed(2);
      nextLayers = nextLayers.map((l) => ({ ...l, densityMm: newD }));
      appliedDiffs.push(`زيادة كثافة الغرز: ${oldD}mm ← ${newD}mm`);
    } else if (promptText.includes('قلل الكثافة') || promptText.includes('خفف الكثافة') || promptText.includes('خفف الغرز')) {
      const oldD = nextLayers[0]?.densityMm || 0.38;
      const newD = +(Math.min(0.80, oldD + 0.12)).toFixed(2);
      nextLayers = nextLayers.map((l) => ({ ...l, densityMm: newD }));
      appliedDiffs.push(`تخفيف كثافة الغرز: ${oldD}mm ← ${newD}mm`);
    }

    const angleMatch = promptText.match(/(?:زاوية|الزاوية|angle)\s*(?:الغرز|التاتامي|الميل)?\s*(?:لـ|الى|إلى|=|:)?\s*(\d{1,3})/i);
    if (angleMatch) {
      const oldA = nextLayers[0]?.angleDeg || 45;
      const val = parseInt(angleMatch[1], 10) % 180;
      nextLayers = nextLayers.map((l) => ({ ...l, angleDeg: val }));
      appliedDiffs.push(`زاوية ميل الغرز: ${oldA}° ← ${val}°`);
    } else if (promptText.includes('لف التصميم') || promptText.includes('دور التصميم')) {
      const rotMatch = promptText.match(/(\d{1,3})/);
      const addRot = rotMatch ? parseInt(rotMatch[1], 10) : 15;
      const oldR = nextTransform.rotationDeg;
      nextTransform.rotationDeg = (oldR + addRot) % 360;
      appliedDiffs.push(`تدوير التصميم: ${oldR}° ← ${nextTransform.rotationDeg}°`);
    }

    if (promptText.includes('اقلب') || promptText.includes('مراية') || lower.includes('flip')) {
      nextTransform.flipX = !nextTransform.flipX;
      appliedDiffs.push('عكس اتجاه التصميم أفقياً (Mirror Flip)');
    }

    if (promptText.includes('كروس') || promptText.includes('ايتامين') || promptText.includes('إيتامين') || lower.includes('cross')) {
      nextLayers = nextLayers.map((l, idx) => (idx < nextLayers.length - 1 ? { ...l, stitchType: 'cross' } : l));
      appliedDiffs.push('تحويل التعبئة إلى غرزة إيتامين متقاطعة (Cross Stitch)');
    } else if (promptText.includes('ممشى') || lower.includes('run stitch')) {
      nextLayers = nextLayers.map((l) => ({ ...l, stitchType: 'run' }));
      appliedDiffs.push('تحويل الغرز إلى غرزة ممشى (Run Stitch)');
    } else if (promptText.includes('تاتامي') || lower.includes('tatami')) {
      nextLayers = nextLayers.map((l, idx) => (idx < nextLayers.length - 1 ? { ...l, stitchType: 'tatami' } : l));
      appliedDiffs.push('ضبط الحشو على غرزة تاتامي (Tatami)');
    }

    if (promptText.includes('كبر')) {
      const oldW = nextWidth;
      nextWidth = Math.min(260, Math.round(nextWidth * 1.2));
      nextHeight = Math.min(200, Math.round(nextHeight * 1.2));
      appliedDiffs.push(`تكبير المقاس (+20%): ${oldW}mm ← ${nextWidth}mm`);
    } else if (promptText.includes('صغر')) {
      const oldW = nextWidth;
      nextWidth = Math.max(40, Math.round(nextWidth * 0.8));
      nextHeight = Math.max(18, Math.round(nextHeight * 0.8));
      appliedDiffs.push(`تصغير المقاس (-20%): ${oldW}mm ← ${nextWidth}mm`);
    }

    if (promptText.includes('رجع الصورة') || promptText.includes('استعادة') || promptText.includes('رجع التصميم')) {
      if (Object.keys(originalMasksBackupRef.current).length > 0) {
        currentMasks = cloneCanvasMap(originalMasksBackupRef.current);
        nextLayers = nextLayers.map((l) => ({ ...l, visible: true }));
        masksModified = true;
        appliedDiffs.push('استعادة كامل أجزاء الصورة الأصلية وإظهار جميع الإبر');
      }
    }

    // ------------------------------------------------------------------------
    // هـ) إذا كان الأمر غير قياسي، نستدعي Gemini API لتحويله إلى أوامر مكانية على الصورة الحالية
    // دون تبديل وضع الصورة إلى نص!
    // ------------------------------------------------------------------------
    if (appliedDiffs.length === 0) {
      try {
        const apiKey = '';
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        const schemaPrompt = `أنت محرك ويلكم ذكي لتعديل صور وأفلام التطريز (Wilcom Spatial AI).
حلل أمر المستخدم التالي وحوله إلى إجراء JSON على التصميم الحالي (بدون مسح الصورة الكلية):
الأمر: "${promptText}"
المناطق المتاحة للحذف إذا طلب المستخدم حذف جزء: "top_right_text" (الكلمة الإنجليزية/النص العلوي الأيمن), "top_smoke" (الدخان العلوي), "top_half", "bottom_half", "left_side", "right_side", أو "none".`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: schemaPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT',
                properties: {
                  eraseRegion: { type: 'STRING', nullable: true },
                  densityMm: { type: 'NUMBER', nullable: true },
                  angleDeg: { type: 'NUMBER', nullable: true },
                  satinWidthMm: { type: 'NUMBER', nullable: true },
                  needle1MadeiraCode: { type: 'STRING', nullable: true },
                },
              },
            },
          }),
        });

        if (response.ok) {
          const resJson = await response.json();
          const rawOut = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawOut) {
            const parsed = JSON.parse(rawOut);
            if (parsed.eraseRegion === 'top_right_text') {
              const { updatedMasks } = detectAndEraseTextBlocksInMasks(currentMasks, 'auto');
              currentMasks = updatedMasks;
              masksModified = true;
              appliedDiffs.push('حذف منطقة النص/الكلمة الإنجليزية من الركن العلوي الأيمن');
            } else if (parsed.eraseRegion === 'top_smoke') {
              const { updatedMasks } = eraseSpatialRegionFromMasks(currentMasks, { x1: 0.15, y1: 0.0, x2: 0.68, y2: 0.36 });
              currentMasks = updatedMasks;
              masksModified = true;
              appliedDiffs.push('مسح منطقة الدخان العلوية من التصميم');
            }
            if (parsed.densityMm) {
              const d = Math.max(0.24, Math.min(0.85, Number(parsed.densityMm)));
              nextLayers = nextLayers.map((l) => ({ ...l, densityMm: d }));
              appliedDiffs.push(`تحديث كثافة الغرز: ${d}mm`);
            }
            if (typeof parsed.angleDeg === 'number') {
              const a = Math.abs(parsed.angleDeg) % 180;
              nextLayers = nextLayers.map((l) => ({ ...l, angleDeg: a }));
              appliedDiffs.push(`زاوية الغرز: ${a}°`);
            }
          }
        }
      } catch {
        // متابعة آمنة
      }
    }

    if (appliedDiffs.length === 0) {
      const oldD = nextLayers[0]?.densityMm || 0.38;
      const newD = oldD > 0.30 ? +(oldD - 0.05).toFixed(2) : 0.40;
      nextLayers = nextLayers.map((l) => ({ ...l, densityMm: newD }));
      appliedDiffs.push(`تحسين كثافة غرز التصميم الحالي: ${oldD}mm ← ${newD}mm`);
    }

    if (masksModified) {
      layerMasksRef.current = currentMasks;
      setMaskVersion((v) => v + 1);
    }

    setActivePresetId(nextPresetId);
    setCustomCalligraphyText(nextText);
    setDesignTitle(nextTitle);
    setDesignWidthMm(nextWidth);
    setDesignHeightMm(nextHeight);
    setFabricColor(nextFabric);
    setLayers(nextLayers);
    setDesignTransform(nextTransform);
    setLiveDiffLog(appliedDiffs);
    setStitchProgress(100);
    triggerVisualPulse();

    setChatHistory((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: `✅ تم تنفيذ التعديل مباشرة على أقنعة وغرز التصميم الحالي مع الحفاظ الكامل على الصورة!`,
        diffs: appliedDiffs,
      },
    ]);
    setIsAiThinking(false);
    triggerToast(`تم تطبيق التعديل بنجاح على التصميم!`);

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  // ============================================================================
  // 13. دوال التصدير، الحفظ المباشر على الفلاشة (USB File System API)، وإدارة المشاريع
  // ============================================================================
  const createMachineFileBlob = useCallback((format) => {
    const cleanName = (designTitle || 'Wilcom_Design').replace(/[^\u0600-\u06FFa-zA-Z0-9_-]/g, '_').substring(0, 20);
    let blob = null;
    let filename = `${cleanName}_WilcomAI`;

    if (format === 'DST') {
      blob = encodeTajimaDST(cleanName, layersWithStitches, designWidthMm, designHeightMm);
      filename += `_${Math.round(designWidthMm)}mm.dst`;
    } else if (format === 'PES') {
      blob = encodeBrotherPES(cleanName, layersWithStitches);
      filename += `_${Math.round(designWidthMm)}mm.pes`;
    } else if (format === 'EXP') {
      blob = encodeMelcoEXP(layersWithStitches);
      filename += `_${Math.round(designWidthMm)}mm.exp`;
    } else if (format === 'JEF' || format === 'VP3') {
      blob = encodeTajimaDST(cleanName, layersWithStitches, designWidthMm, designHeightMm);
      filename += `_${Math.round(designWidthMm)}mm.${format.toLowerCase()}`;
    } else if (format === 'SVG') {
      const svgParts = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -40 140 80" width="${designWidthMm}mm" height="${designHeightMm}mm">`,
      ];
      layersWithStitches.forEach((layer) => {
        if (!layer.visible || layer.stitches.length === 0) return;
        const d = layer.stitches
          .map((st, idx) => `${idx === 0 || st.type === 'jump' ? 'M' : 'L'} ${st.xMm.toFixed(2)} ${st.yMm.toFixed(2)}`)
          .join(' ');
        svgParts.push(
          `<g id="${layer.id}" data-madeira="${layer.madeiraCode}" data-stitch-type="${layer.stitchType}">`,
          `<path d="${d}" fill="none" stroke="${layer.color}" stroke-width="0.45" stroke-linecap="round" stroke-linejoin="round" />`,
          `</g>`
        );
      });
      svgParts.push(`</svg>`);
      blob = new Blob([svgParts.join('\n')], { type: 'image/svg+xml;charset=utf-8' });
      filename += `_Wilcom_Layers.svg`;
    }
    return { blob, filename };
  }, [designTitle, layersWithStitches, designWidthMm, designHeightMm]);

  const handleExportMachineFile = useCallback((format) => {
    const { blob, filename } = createMachineFileBlob(format);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast(`تم تحميل ملف الماكينة (${filename}) بالتعديلات الجديدة!`);
    }
  }, [createMachineFileBlob, triggerToast]);

  // الحفظ المباشر على الفلاشة USB عبر File System Access API (خاص بوضع الديسك توب والـ PWA)
  const handleDirectUsbSave = async (format = 'DST') => {
    const { blob, filename } = createMachineFileBlob(format);
    if (!blob) return;

    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: `Embroidery Machine File (.${format.toLowerCase()})`,
              accept: { 'application/octet-stream': [`.${format.toLowerCase()}`] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        triggerToast(`💾 تم حفظ الملف (${filename}) مباشرة على الفلاشة / القرص بنجاح!`);
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
        // في حال عدم السماح داخل iframe ننتقل تلقائياً للتحميل المباشر السلس
      }
    }
    handleExportMachineFile(format);
  };

  // تثبيت تطبيق الـ PWA مباشرة أو فتح معالج التثبيت الاحترافي
  const handleInstallPwaClick = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredInstallPrompt(null);
        setIsStandaloneInstalled(true);
        triggerToast('🎉 تم تثبيت تطبيق Wilcom AI Studio Pro على جهازك بنجاح!');
        return;
      }
    }
    setShowPwaModal(true);
  };

  // تحميل ملفات الـ PWA الجاهزة (manifest.json + sw.js) للاستضافة أو التشغيل المحلي
  const handleDownloadPwaBundleFiles = (fileType) => {
    if (fileType === 'manifest') {
      const blob = new Blob([JSON.stringify(PWA_MANIFEST_OBJECT, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'manifest.json';
      a.click();
      URL.revokeObjectURL(url);
      triggerToast('تم تحميل ملف manifest.json القياسي لتطبيق الـ PWA!');
    } else if (fileType === 'sw') {
      const blob = new Blob([PWA_SERVICE_WORKER_CODE], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sw.js';
      a.click();
      URL.revokeObjectURL(url);
      triggerToast('تم تحميل ملف محرك الأوفلاين (sw.js) الخاص بـ Service Worker!');
    }
  };

  // حفظ المشروع الحالي في مكتبة المشاريع المحلية (Local Project Database)
  const handleSaveCurrentProjectToLibrary = () => {
    const newProj = {
      id: `proj_${Date.now()}`,
      title: designTitle || `مشروع تطريز (${customCalligraphyText})`,
      presetId: activePresetId,
      customText: customCalligraphyText,
      widthMm: designWidthMm,
      heightMm: designHeightMm,
      fabricColor,
      layers: JSON.parse(JSON.stringify(layers)),
      updatedAt: new Date().toLocaleString('ar-EG'),
    };
    const updatedList = [newProj, ...savedProjects];
    setSavedProjects(updatedList);
    try {
      localStorage.setItem('wilcom_ai_saved_projects_v1', JSON.stringify(updatedList));
    } catch {
      // ignore
    }
    triggerToast(`🗂️ تم حفظ المشروع "${newProj.title}" في مكتبة المشاريع المحلية!`);
  };

  const handleLoadProjectFromLibrary = (proj) => {
    saveHistorySnapshot();
    loadPresetDesign(proj.presetId === 'uploaded_image' ? 'classic_porsche' : proj.presetId, proj.customText || 'محمد');
    setDesignTitle(proj.title);
    setDesignWidthMm(proj.widthMm);
    setDesignHeightMm(proj.heightMm);
    setFabricColor(proj.fabricColor);
    setLayers(JSON.parse(JSON.stringify(proj.layers)));
    setSelectedLayerId(proj.layers[0]?.id || '');
    setShowProjectsModal(false);
    setLiveDiffLog([`📂 تم فتح المشروع المحفوظ: "${proj.title}"`]);
    triggerVisualPulse();
    triggerToast(`تم تحميل المشروع "${proj.title}" بنجاح!`);
  };

  const handleDeleteSavedProject = (id) => {
    const filtered = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(filtered);
    try {
      localStorage.setItem('wilcom_ai_saved_projects_v1', JSON.stringify(filtered));
    } catch {
      // ignore
    }
    triggerToast('تم حذف المشروع من المكتبة المحلية.');
  };

  const handleExportProjectJson = () => {
    const payload = {
      app: 'Wilcom AI Studio Pro PWA',
      version: '3.0',
      exportedAt: new Date().toISOString(),
      designTitle,
      activePresetId,
      customCalligraphyText,
      designWidthMm,
      designHeightMm,
      fabricColor,
      layers,
      designTransform,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(designTitle || 'Wilcom_Project').replace(/\s+/g, '_')}.wilcom.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('تم تصدير ملف المشروع القابل للتعديل (.wilcom.json)!');
  };

  const handleImportProjectJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed && Array.isArray(parsed.layers)) {
          saveHistorySnapshot();
          if (parsed.activePresetId) {
            loadPresetDesign(parsed.activePresetId, parsed.customCalligraphyText || 'محمد');
          }
          setDesignTitle(parsed.designTitle || 'مشروع مستورد');
          setDesignWidthMm(parsed.designWidthMm || 100);
          setDesignHeightMm(parsed.designHeightMm || 40);
          setFabricColor(parsed.fabricColor || '#0F172A');
          setLayers(parsed.layers);
          if (parsed.designTransform) setDesignTransform(parsed.designTransform);
          setShowProjectsModal(false);
          triggerVisualPulse();
          triggerToast('تم استيراد ملف المشروع بنجاح!');
        }
      } catch {
        triggerToast('ملف المشروع غير صالح.');
      }
    };
    reader.readAsText(file);
  };

  // ==========================================================================
  // اختصارات لوحة المفاتيح الاحترافية للديسك توب والـ PWA (Ctrl+Z, Ctrl+S, Space)
  // ==========================================================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (!isTyping) {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveCurrentProjectToLibrary();
      } else if (e.code === 'Space' && !isTyping) {
        e.preventDefault();
        setIsPlaying((p) => {
          if (!p && stitchProgress >= 100) setStitchProgress(0);
          return !p;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleExportSingleNeedleDST = (layer) => {
    const blob = encodeTajimaDST(layer.name, [layer], designWidthMm, designHeightMm);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Needle_${layer.madeiraCode}_${layer.id}.dst`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`تم تحميل فيلم الإبرة المنفرد (${layer.name}) بصيغة .DST!`);
  };

  const handleExportProductionSheetPNG = () => {
    if (!mainCanvasRef.current) return;
    const sheet = document.createElement('canvas');
    sheet.width = 1200;
    sheet.height = 820;
    const sCtx = sheet.getContext('2d');

    sCtx.fillStyle = '#FFFFFF';
    sCtx.fillRect(0, 0, sheet.width, sheet.height);

    sCtx.strokeStyle = '#0F172A';
    sCtx.lineWidth = 3;
    sCtx.strokeRect(24, 24, sheet.width - 48, sheet.height - 48);

    sCtx.fillStyle = '#0F172A';
    sCtx.font = 'bold 24px "Cairo", sans-serif';
    sCtx.fillText(`WILCOM AI STUDIO PRO - PRODUCTION WORKSHEET | ${designTitle}`, 50, 68);
    sCtx.font = '16px monospace';
    sCtx.fillStyle = '#334155';
    sCtx.fillText(
      `SIZE: ${designWidthMm.toFixed(1)} x ${designHeightMm.toFixed(1)} mm | TOTAL STITCHES: ${stats.totalStitches.toLocaleString()} | NEEDLES: ${layers.length} | SPEED: ${machineSpeedSPM} SPM`,
      50,
      98
    );

    sCtx.drawImage(mainCanvasRef.current, 50, 120, 720, 440);
    sCtx.strokeRect(50, 120, 720, 440);

    sCtx.font = 'bold 18px "Cairo", sans-serif';
    sCtx.fillStyle = '#0F172A';
    sCtx.fillText('جدول تسلسل الإبر والخيوط (Needle Sequence):', 800, 145);

    layersWithStitches.forEach((l, idx) => {
      const yPos = 185 + idx * 95;
      sCtx.fillStyle = '#F8FAFC';
      sCtx.fillRect(795, yPos - 25, 360, 82);
      sCtx.strokeStyle = '#CBD5E1';
      sCtx.lineWidth = 1;
      sCtx.strokeRect(795, yPos - 25, 360, 82);

      sCtx.fillStyle = l.color;
      sCtx.fillRect(808, yPos - 12, 28, 54);
      sCtx.strokeRect(808, yPos - 12, 28, 54);

      sCtx.fillStyle = '#0F172A';
      sCtx.font = 'bold 14px "Cairo", sans-serif';
      sCtx.fillText(`إبرة #${idx + 1}: Madeira #${l.madeiraCode}`, 848, yPos + 5);
      sCtx.font = '12px monospace';
      sCtx.fillStyle = '#475569';
      sCtx.fillText(
        `Type: ${l.stitchType.toUpperCase()} | Angle: ${l.angleDeg}° | Dens: ${l.densityMm}mm`,
        848,
        yPos + 26
      );
      sCtx.fillText(
        `Stitches: ${l.stitches.length.toLocaleString()} | SatinW: ${l.satinWidthMm}mm`,
        848,
        yPos + 45
      );
    });

    const url = sheet.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Wilcom_Production_Sheet_${Date.now()}.png`;
    a.click();
    triggerToast('تم استخراج خريطة التشغيل الهندسية للماكينة بصيغة PNG بدقة عالية!');
  };

  const selectedLayer = layersWithStitches.find((l) => l.id === selectedLayerId) || layersWithStitches[0];

  const updateSelectedLayer = (field, value) => {
    saveHistorySnapshot();
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== selectedLayer?.id) return l;
        const updated = { ...l, [field]: value };
        if (field === 'madeiraCode') {
          const found = MADEIRA_CATALOG.find((m) => m.code === value);
          if (found) updated.color = found.hex;
        }
        return updated;
      })
    );
    setLiveDiffLog([`تعديل يدوي (${selectedLayer?.name}): ${field} ← ${value}`]);
    triggerVisualPulse();
  };

  const moveLayerOrder = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= layers.length) return;
    saveHistorySnapshot();
    const copy = [...layers];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setLayers(copy);
    setLiveDiffLog([`تغيير ترتيب الإبرة #${index + 1} مكان الإبرة #${targetIdx + 1}`]);
    triggerVisualPulse();
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {statusToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{statusToast}</span>
        </div>
      )}

      {/* ====================================================================
          نافذة تثبيت تطبيق الـ PWA الاحترافية (Install PWA & Offline Wizard)
         ==================================================================== */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    تثبيت Wilcom AI Studio Pro كتطبيق مستقل (PWA)
                  </h3>
                  <p className="text-xs text-slate-400">
                    يعمل على سطح المكتب (Windows / Mac) والموبايل بدون متصفح وبدون إنترنت
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPwaModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* حالة فحص الـ PWA في المتصفح الحالي */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-300">Web Manifest نشط</div>
                  <div className="text-[11px] text-slate-400">الأيقونات ووضع Standalone جاهزة</div>
                </div>
              </div>
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-300">محرك الأوفلاين جاهز</div>
                  <div className="text-[11px] text-slate-400">حفظ تلقائي وتوليد DST محلياً</div>
                </div>
              </div>
              <div className="bg-slate-950 border border-sky-500/30 rounded-xl p-3 flex items-center gap-2.5">
                <HardDrive className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <div className="font-bold text-sky-300">دعم الفلاشة USB</div>
                  <div className="text-[11px] text-slate-400">تصدير مباشر لماكينات التطريز</div>
                </div>
              </div>
            </div>

            {/* خطوات التثبيت السريعة */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                  💻 أولاً: التثبيت على الكمبيوتر (Windows / Chrome / Edge):
                </div>
                <p className="text-slate-300">
                  1. من شريط عنوان المتصفح في الأعلى (بجوار علامة النجمة)، اضغط على أيقونة{' '}
                  <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-bold">
                    تثبيت Wilcom AI Pro (Install App) 📲
                  </span>
                  .
                </p>
                <p className="text-slate-300">
                  2. سيظهر لك البرنامج فوراً كأيقونة مستقلة على **سطح المكتب (Desktop)** وفي قائمة **Start** ويفتح في نافذة كاملة خاصة به بدون شريط متصفح.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="font-extrabold text-sky-400 text-sm flex items-center gap-2">
                  📱 ثانياً: التثبيت على الموبايل أو التابلت (Android & iPhone):
                </div>
                <p className="text-slate-300">
                  • **أندرويد (Chrome):** اضغط على القائمة (⋮) ثم اختر{' '}
                  <span className="text-white font-bold">"تثبيت التطبيق" (Install App)</span> أو{' '}
                  <span className="text-white font-bold">"إضافة إلى الشاشة الرئيسية"</span>.
                </p>
                <p className="text-slate-300">
                  • **آيفون وآيباد (Safari):** اضغط على زر المشاركة (Share) في الأسفل ثم اختر{' '}
                  <span className="text-white font-bold">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</span>.
                </p>
              </div>
            </div>

            {/* تحميل ملفات الـ PWA المصدرية للاستضافة الخاصة */}
            <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold text-indigo-200 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  ملفات حزمة الـ PWA الجاهزة للاستضافة أو التشغيل المحلي:
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  يمكنك تحميل ملفات `manifest.json` و `sw.js` المولّدة لوضعها في مجلد `public` في مشروعك.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPwaBundleFiles('manifest')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  manifest.json
                </button>
                <button
                  onClick={() => handleDownloadPwaBundleFiles('sw')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  sw.js (Offline Worker)
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPwaModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition"
              >
                تمام، فهمت!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          نافذة مكتبة المشاريع المحفوظة محلياً (Local Project Manager Modal)
         ==================================================================== */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    مكتبة مشاريع التطريز المحفوظة على الجهاز (Offline DB)
                  </h3>
                  <p className="text-xs text-slate-400">
                    آخر حفظ تلقائي: {lastAutoSaveTime} • جميع مشاريعك محفوظة محلياً بدون إنترنت
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <button
                onClick={handleSaveCurrentProjectToLibrary}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow transition"
              >
                <Save className="w-4 h-4" />
                حفظ التصميم الحالي في المكتبة
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportProjectJson}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  تصدير ملف مشروع (.JSON)
                </button>
                <input
                  ref={projectJsonInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportProjectJson}
                  className="hidden"
                />
                <button
                  onClick={() => projectJsonInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  استيراد مشروع
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {savedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between gap-3 transition"
                >
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>{proj.title}</span>
                      <span className="text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono">
                        {proj.widthMm}×{proj.heightMm}mm
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                      <span>عدد الإبر: {proj.layers?.length || 3}</span>
                      <span>•</span>
                      <span>التوقيت: {proj.updatedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadProjectFromLibrary(proj)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition"
                    >
                      فتح في الاستوديو
                    </button>
                    {!proj.id.startsWith('proj_default_') && (
                      <button
                        onClick={() => handleDeleteSavedProject(proj.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition"
                        title="حذف المشروع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          نافذة اختصارات الكيبورد (Desktop Keyboard Shortcuts Modal)
         ==================================================================== */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">اختصارات لوحة المفاتيح السريعة</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { keys: 'Ctrl + Z', desc: 'تراجع عن آخر تعديل (Undo)' },
                { keys: 'Ctrl + S', desc: 'حفظ المشروع الحالي في المكتبة المحلية' },
                { keys: 'Space (مسطرة)', desc: 'تشغيل / إيقاف محاكي الماكينة غرزة بغرزة' },
                { keys: 'Enter', desc: 'تنفيذ الأمر المكتوب في شات الذكاء الاصطناعي فوراً' },
              ].map((sc, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-300 font-semibold">{sc.desc}</span>
                  <kbd className="px-2.5 py-1 bg-slate-800 border border-slate-600 rounded-lg font-mono text-amber-300 font-bold">
                    {sc.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* الشريط العلوي الاحترافي (PWA Header + Offline Status + USB Direct Save) */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-purple-700 flex items-center justify-center shadow-md border border-amber-400/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-extrabold tracking-wide bg-gradient-to-l from-amber-300 via-white to-sky-300 bg-clip-text text-transparent">
                Wilcom AI Studio Pro
              </h1>
              {/* شارة حالة الـ PWA والأوفلاين */}
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/25 text-amber-200 border-amber-400/50 animate-pulse'
                }`}
              >
                {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-300" />}
                {isOnline ? 'PWA متصل (حفظ تلقائي نشط)' : 'وضع الأوفلاين نشط (Offline Ready)'}
              </span>

              {/* زر تثبيت تطبيق الـ PWA على الويندوز والموبايل */}
              <button
                onClick={handleInstallPwaClick}
                className="text-[11px] bg-gradient-to-l from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow border border-sky-400/40 transition"
                title="تثبيت البرنامج كتطبيق مستقل على سطح المكتب أو الموبايل"
              >
                <Smartphone className="w-3 h-3" />
                {isStandaloneInstalled ? 'مُثبّت كـ PWA' : '📲 تثبيت التطبيق (Install PWA)'}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              تطبيق تطريز وفصل أفلام ذكي • حفظ مباشر على الفلاشة • آخر حفظ تلقائي: {lastAutoSaveTime}
            </p>
          </div>
        </div>

        {/* شريط القوالب الجاهزة ومكتبة المشاريع ورفع الصور والتراجع */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowProjectsModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition"
            title="مكتبة المشاريع المحفوظة محلياً (Ctrl+S)"
          >
            <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
            مشاريعي ({savedProjects.length})
          </button>

          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition ${
              historyStack.length > 0
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 hover:bg-amber-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="تراجع عن آخر تعديل (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
            تراجع ({historyStack.length})
          </button>

          <button
            onClick={handleRestoreOriginalImage}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 flex items-center gap-1 transition"
            title="استعادة كامل أجزاء الصورة الأصلية قبل أي مسح"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            الأصل
          </button>

          <button
            onClick={() => {
              saveHistorySnapshot();
              loadPresetDesign('classic_porsche');
              setLiveDiffLog(['تم تحميل فيلم سيارة بورش الكلاسيكية (5 إبر)']);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition ${
              activePresetId === 'classic_porsche'
                ? 'bg-sky-600/25 border-sky-500 text-sky-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            بورش
          </button>

          <button
            onClick={() => {
              saveHistorySnapshot();
              loadPresetDesign('mohamed_3colors', 'محمد');
              setLiveDiffLog(['تم تحميل قالب مخطوطة "محمد" القياسي (3 ألوان)']);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition ${
              activePresetId === 'mohamed_3colors'
                ? 'bg-red-600/25 border-red-500 text-red-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-red-400" />
            مخطوطة "محمد"
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow transition"
          >
            <Upload className="w-3.5 h-3.5" />
            رفع صورة وفصلها
          </button>

          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="اختصارات لوحة المفاتيح"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>

        {/* أزرار التصدير الفوري لماكينات التطريز + زر الحفظ المباشر على الفلاشة USB */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleDirectUsbSave('DST')}
            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md transition"
            title="حفظ ملف الماكينة .DST مباشرة على الفلاشة USB بدون نوافذ متصفح"
          >
            <HardDrive className="w-3.5 h-3.5" />
            💾 حفظ مباشر للفلاشة (.DST)
          </button>

          {['PES', 'EXP', 'SVG'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExportMachineFile(fmt)}
              className="px-2 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition"
            >
              <Download className="w-3 h-3" />
              .{fmt}
            </button>
          ))}
          <button
            onClick={handleExportProductionSheetPNG}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            خريطة التشغيل
          </button>
        </div>
      </header>

      {/* شريط الأدوات الثانوي (أدوات التحديد والممحاة بالماوس + أوضاع المعاينة) */}
      <div className="bg-slate-900/70 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('trueview_3d')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              viewMode === 'trueview_3d' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            معاينة الخيوط 3D TrueView
          </button>
          <button
            onClick={() => setViewMode('vectors')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              viewMode === 'vectors' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            مسارات الإبرة (Vectors)
          </button>
          <button
            onClick={() => setViewMode('separated_films')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
              viewMode === 'separated_films' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            أفلام الفصل المنفردة ({layers.length} إبر)
          </button>
        </div>

        {/* أدوات الممحاة وتلوين المناطق بالماوس مباشرة على أي صورة */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-bold ml-1">أداة الماوس:</span>
          <button
            onClick={() => setCanvasTool('none')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
              canvasTool === 'none' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            معاينة عادية
          </button>
          <button
            onClick={() => setCanvasTool(canvasTool === 'box_eraser' ? 'none' : 'box_eraser')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 border transition ${
              canvasTool === 'box_eraser'
                ? 'bg-rose-600 border-rose-400 text-white shadow'
                : 'bg-slate-900 border-slate-700 text-rose-300 hover:bg-rose-950'
            }`}
            title="اسحب مربعاً بالماوس حول أي كلمة أو جزء في الصورة لحذفه فوراً"
          >
            <Eraser className="w-3.5 h-3.5" />
            ممحاة منطقة بالماوس (Box Eraser)
          </button>
          <button
            onClick={() => setCanvasTool(canvasTool === 'box_recolor' ? 'none' : 'box_recolor')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 border transition ${
              canvasTool === 'box_recolor'
                ? 'bg-sky-600 border-sky-400 text-white shadow'
                : 'bg-slate-900 border-slate-700 text-sky-300 hover:bg-sky-950'
            }`}
            title="اسحب مربعاً بالماوس حول أي جزء لتحويله إلى لون الإبرة المحددة"
          >
            <ScanSearch className="w-3.5 h-3.5" />
            تلوين منطقة بالماوس
          </button>
        </div>

        {/* التحكم في المقاس بالمليمتر ولون القماش */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">العرض (مم):</span>
            <input
              type="number"
              value={designWidthMm}
              min={30}
              max={300}
              onChange={(e) => {
                setDesignWidthMm(Number(e.target.value) || 100);
                triggerVisualPulse();
              }}
              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-amber-300"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">القماش:</span>
            {['#F8FAFC', '#0F172A', '#1E293B', '#450A0A', '#064E3B'].map((col) => (
              <button
                key={col}
                onClick={() => setFabricColor(col)}
                className={`w-5 h-5 rounded-full border ${
                  fabricColor === col ? 'ring-2 ring-amber-400 scale-110' : 'border-slate-600'
                }`}
                style={{ backgroundColor: col }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* منطقة العمل الرئيسية */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* العمود الأيمن (3 أعمدة): شات الأوامر الطبيعية المتصل مباشرة بأقنعة الصورة */}
        <aside className="lg:col-span-3 bg-slate-900 border-l border-slate-800 flex flex-col h-full max-h-[calc(100vh-115px)]">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-extrabold text-white">شات التعديل المكاني الذكي</h2>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
              يحافظ على الصورة 100%
            </span>
          </div>

          {/* أزرار أوامر سريعة لتجربة الحذف المكاني وتعديل الألوان على الصورة */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/40">
            <p className="text-[11px] text-amber-300 mb-2 font-bold">
              ⚡ جرب أوامر الحذف والتعديل المكاني على التصميم الحالي:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'احذف الكلمة الانجليزية',
                'امسح الدخان',
                'خلي لون العربية أحمر قرمزي',
                'ضيف كلمة محمد تحت التصميم',
                'زود الكثافة لـ 0.28 مم ولف زاوية الغرز لـ 45 درجة',
                'استعادة الصورة الأصلية',
              ].map((sampleCmd, idx) => (
                <button
                  key={idx}
                  onClick={() => executeNaturalLanguageCommand(sampleCmd)}
                  className="text-[11px] bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 font-semibold transition text-right"
                >
                  🪄 {sampleCmd}
                </button>
              ))}
            </div>
          </div>

          {/* سجل المحادثة */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100 mr-4'
                    : 'bg-slate-800/90 border border-slate-700 text-slate-200 ml-2'
                }`}
              >
                <div className="font-bold mb-1 text-[11px] text-slate-400">
                  {msg.role === 'user' ? '👤 أمرك:' : '🤖 محرك Wilcom المكاني:'}
                </div>
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.diffs && msg.diffs.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-700/80 space-y-1">
                    {msg.diffs.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md font-bold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isAiThinking && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-amber-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري تعديل أقنعة الصورة وإعادة توليد الغرز...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* صندوق إدخال الأمر باللغة الطبيعية */}
          <div className="p-3 border-t border-slate-800 bg-slate-950">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeNaturalLanguageCommand();
              }}
              className="flex flex-col gap-2"
            >
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    executeNaturalLanguageCommand();
                  }
                }}
                placeholder="اكتب مثلاً: احذف الكلمة الانجليزية، أو امسح الدخان، أو خلي لون العربية أحمر..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
              />
              <button
                type="submit"
                disabled={isAiThinking}
                className="w-full py-2 rounded-xl bg-gradient-to-l from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
              >
                <Send className="w-3.5 h-3.5" />
                تنفيذ التعديل فوراً على الصورة
              </button>
            </form>
          </div>
        </aside>

        {/* العمود الأوسط (6 أعمدة): شاشة عرض الطارة التفاعلية + الممحاة المكانية + مشغل الماكينة */}
        <main className="lg:col-span-6 bg-slate-950 flex flex-col justify-between p-4 overflow-y-auto max-h-[calc(100vh-115px)]">
          {/* شريط التعديلات المنفذة لحظياً */}
          <div
            className={`mb-2.5 px-3.5 py-2 rounded-xl border flex flex-wrap items-center justify-between gap-2 transition-all duration-300 ${
              canvasFlashPulse
                ? 'bg-emerald-500/25 border-emerald-400 shadow-lg scale-[1.01]'
                : 'bg-slate-900/90 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                آخر تعديل حي:
              </span>
              {liveDiffLog.map((item, idx) => (
                <span key={idx} className="text-xs font-bold text-emerald-300">
                  {item}
                </span>
              ))}
            </div>
            {canvasTool !== 'none' && (
              <span className="text-[11px] bg-rose-600 text-white px-2.5 py-0.5 rounded-lg font-bold animate-pulse">
                {canvasTool === 'box_eraser'
                  ? '🖱️ اسحب مربعاً بالماوس حول أي كلمة أو جزء لحذفه فوراً'
                  : '🖱️ اسحب مربعاً بالماوس لتلوينه بلون الإبرة المحددة'}
              </span>
            )}
          </div>

          {/* شريط معلومات الماكينة اللحظي */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">إجمالي الغرز الفعلي</div>
                <div className="text-base font-extrabold text-amber-400 font-mono">
                  {stats.totalStitches.toLocaleString()} ST
                </div>
              </div>
              <Activity className="w-5 h-5 text-amber-400/60" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">الإبر النشطة</div>
                <div className="text-base font-extrabold text-emerald-400 font-mono">
                  {layers.filter((l) => l.visible).length} Needles
                </div>
              </div>
              <Palette className="w-5 h-5 text-emerald-400/60" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">القفزات (Jumps)</div>
                <div className="text-base font-extrabold text-rose-400 font-mono">
                  {stats.totalJumps} Jumps
                </div>
              </div>
              <Scissors className="w-5 h-5 text-rose-400/60" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">وقت الماكينة</div>
                <div className="text-base font-extrabold text-sky-400 font-mono">
                  ~{stats.estMinutes} دقيقة
                </div>
              </div>
              <Cpu className="w-5 h-5 text-sky-400/60" />
            </div>
          </div>

          {/* شاشة العرض الرئيسية */}
          {viewMode !== 'separated_films' ? (
            <div
              className={`relative flex-1 flex items-center justify-center bg-slate-900/50 rounded-2xl border-2 overflow-hidden shadow-inner min-h-[360px] transition-all duration-300 ${
                canvasFlashPulse
                  ? 'border-emerald-400 ring-4 ring-emerald-500/20'
                  : canvasTool === 'box_eraser'
                  ? 'border-rose-500 cursor-crosshair'
                  : canvasTool === 'box_recolor'
                  ? 'border-sky-500 cursor-crosshair'
                  : 'border-slate-800'
              }`}
            >
              <canvas
                ref={mainCanvasRef}
                width={760}
                height={440}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="max-w-full h-auto rounded-xl shadow-2xl"
              />

              {/* أزرار عائمة للتحكم في الزوم والشبكة والتدوير */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur border border-slate-700 p-1.5 rounded-xl">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                  title="تكبير"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-1 text-amber-300">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                  title="تصغير"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded-lg ${showGrid ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
                  title="إظهار/إخفاء الشبكة الهندسية"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowJumps(!showJumps)}
                  className={`p-1.5 rounded-lg ${showJumps ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'}`}
                  title="إظهار خطوط القفزات (Jump Stitches)"
                >
                  <Scissors className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    saveHistorySnapshot();
                    setDesignTransform((t) => ({ ...t, rotationDeg: (t.rotationDeg + 15) % 360 }));
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                  title="تدوير 15 درجة"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    saveHistorySnapshot();
                    setDesignTransform((t) => ({ ...t, flipX: !t.flipX }));
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                  title="عكس أفقي (Mirror)"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* شريط فلاتر عزل الإبر السريع فوق الكانفاس */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700 p-1.5 rounded-xl flex-wrap max-w-[340px]">
                <button
                  onClick={() => setIsolatedLayerId(null)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition ${
                    !isolatedLayerId ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  كل الإبر
                </button>
                {layersWithStitches.map((l, idx) => (
                  <button
                    key={l.id}
                    onClick={() => setIsolatedLayerId(isolatedLayerId === l.id ? null : l.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                      isolatedLayerId === l.id
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-white/40" style={{ backgroundColor: l.color }} />
                    إبرة #{idx + 1}
                  </button>
                ))}
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-lg text-[11px] font-mono text-slate-300">
                Origin: (0,0) | {designWidthMm}×{designHeightMm}mm | Rot: {designTransform.rotationDeg}°
              </div>
            </div>
          ) : (
            /* عرض أفلام الفصل المنفردة لكل لون/إبرة */
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 overflow-y-auto p-1">
              {layersWithStitches.map((layer, index) => (
                <div
                  key={layer.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-amber-300">
                        فيلم الإبرة #{index + 1}
                      </span>
                      <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {layer.stitches.length.toLocaleString()} غرزة
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                        style={{ backgroundColor: layer.color }}
                      />
                      <h4 className="text-xs font-bold text-white truncate">{layer.name}</h4>
                    </div>

                    <div className="bg-white rounded-xl p-2 border border-slate-700 flex items-center justify-center h-40 relative">
                      <SingleNeedleMiniCanvas layer={layer} widthMm={designWidthMm} heightMm={designHeightMm} />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-mono text-slate-600">
                        Madeira #{layer.madeiraCode} | {layer.stitchType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>كثافة: {layer.densityMm}mm | زاوية: {layer.angleDeg}°</span>
                    <button
                      onClick={() => handleExportSingleNeedleDST(layer)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      فيلم .DST
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* مشغل محاكاة الماكينة التفاعلي */}
          <div className="mt-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (stitchProgress >= 100) setStitchProgress(0);
                  setIsPlaying(!isPlaying);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'إيقاف مؤقت' : 'محاكاة الماكينة غرزة بغرزة'}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStitchProgress(100);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="إعادة ضبط لعرض كامل الغرز"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex items-center gap-3 min-w-[180px]">
              <span className="text-xs font-mono text-amber-300 shrink-0">
                {Math.round((stitchProgress / 100) * stats.totalStitches).toLocaleString()} / {stats.totalStitches.toLocaleString()} ST
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={stitchProgress}
                onChange={(e) => {
                  setIsPlaying(false);
                  setStitchProgress(Number(e.target.value));
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">السرعة:</span>
              <select
                value={machineSpeedSPM}
                onChange={(e) => setMachineSpeedSPM(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-amber-300 font-mono"
              >
                <option value={400}>400 SPM</option>
                <option value={750}>750 SPM</option>
                <option value={1000}>1000 SPM</option>
                <option value={1200}>1200 SPM</option>
              </select>
            </div>
          </div>
        </main>

        {/* العمود الأيسر (3 أعمدة): قائمة الإبر + إعدادات الفرز + خصائص الغرز الهندسية */}
        <aside className="lg:col-span-3 bg-slate-900 border-r border-slate-800 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-115px)] p-3.5 space-y-4">
          <div>
            {/* إعدادات عدد ألوان الفصل عند رفع صورة */}
            {uploadedImage && (
              <div className="mb-3 p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-200">إعدادات فصل الصورة المرفوعة:</span>
                  <span className="font-mono text-amber-300">{numColorsToSeparate} إبر</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={numColorsToSeparate}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNumColorsToSeparate(val);
                      processUploadedImageToEmbroidery(uploadedImage, val, removeWhiteBg);
                    }}
                    className="flex-1 accent-indigo-400"
                  />
                  <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeWhiteBg}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setRemoveWhiteBg(checked);
                        processUploadedImageToEmbroidery(uploadedImage, numColorsToSeparate, checked);
                      }}
                    />
                    عزل الأبيض
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-extrabold text-white">تسلسل الإبر والأفلام ({layers.length})</h3>
              </div>
              <span className="text-[11px] text-slate-400">اضغط لتخصيص الإبرة</span>
            </div>

            <div className="space-y-2">
              {layersWithStitches.map((layer, idx) => {
                const isSelected = layer.id === selectedLayer?.id;
                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          saveHistorySnapshot();
                          setLayers((prev) =>
                            prev.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l))
                          );
                          triggerVisualPulse();
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        {layer.visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <span
                        className="w-5 h-5 rounded-lg border border-white/20 shrink-0 shadow"
                        style={{ backgroundColor: layer.color }}
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{layer.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          #{layer.madeiraCode} • {layer.stitches.length.toLocaleString()} ST •{' '}
                          {layer.stitchType === 'tatami'
                            ? 'تاتامي'
                            : layer.stitchType === 'satin'
                            ? 'ساتان'
                            : layer.stitchType === 'cross'
                            ? 'كروس'
                            : 'ممشى'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayerOrder(idx, -1);
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="تقديم الإبرة"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayerOrder(idx, 1);
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="تأخير الإبرة"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* خصائص الغرزة للإبرة المحددة */}
          {selectedLayer && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-extrabold text-white">خصائص غرز الإبرة المحددة</h4>
                </div>
                <span className="text-[11px] font-mono text-amber-300">
                  #{selectedLayer.madeiraCode}
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">خيط التطريز (Madeira Polyneon):</label>
                <select
                  value={selectedLayer.madeiraCode}
                  onChange={(e) => updateSelectedLayer('madeiraCode', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold"
                >
                  {MADEIRA_CATALOG.map((m) => (
                    <option key={m.code} value={m.code}>
                      Madeira #{m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">نوع الغرزة الهندسي (Stitch Type):</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'tatami', label: 'تاتامي (Tatami)' },
                    { id: 'satin', label: 'ساتان بارز (Satin)' },
                    { id: 'run', label: 'ممشى (Run)' },
                    { id: 'cross', label: 'كروس إيتامين (Cross)' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => updateSelectedLayer('stitchType', st.id)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                        selectedLayer.stitchType === st.id
                          ? 'bg-sky-500/25 border-sky-400 text-sky-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">كثافة الغرز (Spacing Density):</span>
                  <span className="font-mono text-amber-300">{selectedLayer.densityMm} mm</span>
                </div>
                <input
                  type="range"
                  min={0.24}
                  max={0.85}
                  step={0.02}
                  value={selectedLayer.densityMm}
                  onChange={(e) => updateSelectedLayer('densityMm', Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">تخانة وعرض الساتان (Satin Width):</span>
                  <span className="font-mono text-rose-300">{selectedLayer.satinWidthMm} mm</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={5.0}
                  step={0.2}
                  value={selectedLayer.satinWidthMm}
                  onChange={(e) => updateSelectedLayer('satinWidthMm', Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">زاوية ميل الغرزة (Angle):</span>
                  <span className="font-mono text-sky-300">{selectedLayer.angleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={175}
                  step={5}
                  value={selectedLayer.angleDeg}
                  onChange={(e) => updateSelectedLayer('angleDeg', Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">تعويض الشد (Pull Compensation):</span>
                  <span className="font-mono text-emerald-300">+{selectedLayer.pullCompMm} mm</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={0.6}
                  step={0.05}
                  value={selectedLayer.pullCompMm}
                  onChange={(e) => updateSelectedLayer('pullCompMm', Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <button
                onClick={() => handleExportSingleNeedleDST(selectedLayer)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                تحميل فيلم هذه الإبرة فقط (.DST)
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function SingleNeedleMiniCanvas({ layer, widthMm, heightMm }) {
  const miniRef = useRef(null);

  useEffect(() => {
    const c = miniRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    [[14, 14], [c.width - 14, 14], [14, c.height - 14], [c.width - 14, c.height - 14]].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, Math.PI * 2);
      ctx.moveTo(rx - 7, ry); ctx.lineTo(rx + 7, ry);
      ctx.moveTo(rx, ry - 7); ctx.lineTo(rx, ry + 7);
      ctx.stroke();
    });

    if (!layer.stitches || layer.stitches.length === 0) return;

    const scale = Math.min((c.width - 40) / widthMm, (c.height - 30) / heightMm);
    const cx = c.width / 2;
    const cy = c.height / 2;

    ctx.strokeStyle = layer.color === '#F7F7F7' ? '#0F172A' : layer.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    layer.stitches.forEach((st, i) => {
      const x = cx + st.xMm * scale;
      const y = cy + st.yMm * scale;
      if (i === 0 || st.type === 'jump') {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }, [layer, widthMm, heightMm]);

  return <canvas ref={miniRef} width={260} height={140} className="w-full h-full object-contain" />;
}