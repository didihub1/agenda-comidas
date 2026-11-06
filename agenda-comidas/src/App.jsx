import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  Camera,
  AlertCircle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit3,
  FileSpreadsheet,
  FileJson,
  Activity,
  Utensils,
  Coffee,
  Soup,
  Cookie,
  Sandwich,
  CheckCircle2,
  RotateCcw,
  Filter,
  Stethoscope,
  Ban,
  Minus,
  TrendingUp,
  Smartphone,
  Share
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN DE BLOQUES Y SÍNTOMAS
// ==========================================
const MEAL_BLOCKS = [
  {
    id: 'desayuno',
    name: 'Desayuno',
    defaultTime: '08:30',
    icon: Coffee,
    color: '#f59e0b', // Ámbar cálido distintivo
    placeholder: 'Ej: Pan tostado con palta, té de manzanilla sin azúcar...'
  },
  {
    id: 'media_manana',
    name: 'Media Mañana',
    defaultTime: '11:00',
    icon: Cookie,
    color: '#06b6d4', // Cian / Celeste distintivo
    placeholder: 'Ej: 1 manzana cocida, puñado de almendras, agua...'
  },
  {
    id: 'almuerzo',
    name: 'Almuerzo',
    defaultTime: '14:00',
    icon: Soup,
    color: '#10b981', // Esmeralda distintivo
    placeholder: 'Ej: Pollo a la plancha con arroz blanco y ensalada...'
  },
  {
    id: 'post_almuerzo',
    name: 'Post Almuerzo',
    defaultTime: '17:00',
    icon: Utensils,
    color: '#a855f7', // Violeta distintivo
    placeholder: 'Ej: Infusión de hierbas, galletas de agua, yogur sin lactosa...'
  },
  {
    id: 'cena',
    name: 'Cena / Once',
    defaultTime: '20:30',
    icon: Sandwich,
    color: '#ec4899', // Rosa / Coral distintivo
    placeholder: 'Ej: Sopa de verduras casera, 1 rebanada de pan de molde...'
  }
];

const SYMPTOM_TAGS = [
  'Dolor esófago/estómago',
  'Acidez / Reflujo',
  'Hinchazón',
  'Vómitos',
  'Náuseas',
  'Pesadez',
  'Gases',
  'Cólicos',
  'Diarrea',
  'Estreñimiento'
];

const ONSET_OPTIONS = [
  'Inmediatamente al comer',
  '30 min después',
  '1 hora después',
  '2+ horas después',
  'Por ayuno / horas sin comer'
];

// ==========================================
// UTILIDADES DE FECHAS Y FOTOS DE EJEMPLO
// ==========================================
const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Generador de ícono SVG en Base64 para el Manifiesto PWA y Apple Touch Icon
const generateAppIconDataUrl = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="115" fill="#1f1f1f"/>
    <rect x="28" y="28" width="456" height="456" rx="95" fill="url(#grad)"/>
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="100%" stop-color="#16a34a"/>
      </linearGradient>
    </defs>
    <text x="256" y="315" font-size="220" text-anchor="middle">🍽️</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Generador de SVG en Base64 para simular fotos de comidas en los datos de ejemplo
const createSamplePhotoSvg = (title, subtitle, bg1, bg2, emoji) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
    </defs>
    <rect width="600" height="450" rx="24" fill="url(#g)" />
    <circle cx="300" cy="190" r="95" fill="rgba(255,255,255,0.15)" />
    <text x="300" y="218" font-size="88" text-anchor="middle">${emoji}</text>
    <text x="300" y="340" font-family="sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="300" y="378" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.85)" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Genera datos de demostración realistas para los últimos 35 días
const generateInitialDemoData = () => {
  const today = new Date();
  const data = {};

  const sampleMeals = {
    desayuno: [
      'Té de manzanilla y 2 tostadas con palta',
      'Avena cocida con agua, canela y media manzana',
      'Café con leche entera y pan con queso derretido',
      'Huevos revueltos suaves, pan blanco y té verde',
      'Yogur sin lactosa con semillas de chía y plátano'
    ],
    media_manana: [
      'Compota de pera tibia sin azúcar',
      'Puñado de nueces y agua mineral sin gas',
      'Galletas de salvado con jamón de pavo',
      '1 plátano maduro e infusión de menta'
    ],
    almuerzo: [
      'Pechuga de pollo a la plancha con arroz blanco y zanahoria',
      'Pastel de papas con carne molida y ensalada chilena (tomate y cebolla)',
      'Merluza al vapor con puré de zapallo camote',
      'Lentejas guisadas con arroz y ensalada de betarraga',
      'Fideos con salsa boloñesa de tomate y queso rallado'
    ],
    post_almuerzo: [
      'Agüita de hierbas (manzanilla con anís)',
      '1 trozo pequeño de queque casero y té rojo',
      'Gelatina de frambuesa y agua tibia',
      'Galletas de agua con mermelada de durazno'
    ],
    cena: [
      'Crema de zapallo y verduras licuadas con crutones',
      'Once: Pan marraqueta con palta, jamón de pavo y té suave',
      'Sopa de pollo con fideos cabello de ángel',
      'Once: Empanada de queso calentada en horno y té'
    ]
  };

  for (let i = 34; i >= 0; i--) {
    const d = addDays(today, -i);
    const key = formatDateKey(d);

    if ([4, 11, 18, 25, 26].includes(i)) continue;

    data[key] = {};

    if (i === 0) {
      data[key].desayuno = {
        time: '08:30',
        food: 'Té de manzanilla tibio y 2 tostadas de pan molde con palta',
        skipped: false,
        photo: createSamplePhotoSvg('Desayuno de Hoy', 'Tostadas con palta y té de manzanilla', '#134e4a', '#0f766e', '🥑'),
        hasSymptom: false,
        symptoms: [],
        severity: 'Leve',
        onset: '',
        symptomNotes: ''
      };
      data[key].media_manana = {
        time: '11:15',
        food: '',
        skipped: true,
        photo: '',
        hasSymptom: false,
        symptoms: [],
        severity: 'Leve',
        onset: '',
        symptomNotes: ''
      };
      data[key].almuerzo = {
        time: '14:30',
        food: 'Pastel de papas con pino de carne, cebolla y ensalada de tomate',
        skipped: false,
        photo: createSamplePhotoSvg('Almuerzo - 14:30 hrs', 'Pastel de papas y ensalada de tomate', '#7c2d12', '#9a3412', '🥘'),
        hasSymptom: true,
        symptoms: ['Dolor esófago/estómago', 'Acidez / Reflujo', 'Hinchazón'],
        severity: 'Moderado',
        onset: '30 min después',
        symptomNotes: 'Pasó 6 horas sin comer por saltar la media mañana y luego el pino con cebolla le dio dolor en la boca del estómago.'
      };
      continue;
    }

    if (i === 1) {
      data[key].desayuno = {
        time: '08:45',
        food: 'Avena cocida en agua con manzana rallada y té',
        skipped: false,
        photo: createSamplePhotoSvg('Desayuno de Ayer', 'Porridge de avena y manzana', '#1e3a8a', '#1d4ed8', '🥣'),
        hasSymptom: false,
        symptoms: [],
        severity: 'Leve',
        onset: '',
        symptomNotes: ''
      };
      data[key].media_manana = {
        time: '11:00',
        food: 'Puñado de almendras peladas y agua tibia',
        skipped: false,
        photo: '',
        hasSymptom: false,
        symptoms: [],
        severity: 'Leve',
        onset: '',
        symptomNotes: ''
      };
      data[key].almuerzo = {
        time: '13:50',
        food: 'Pechuga de pollo a la plancha con arroz blanco y zapallo italiano',
        skipped: false,
        photo: '',
        hasSymptom: false,
        symptoms: [],
        severity: 'Leve',
        onset: '',
        symptomNotes: ''
      };
      data[key].post_almuerzo = {
        time: '17:15',
        food: 'Infusión de menta con 3 galletas de agua',
        skipped: false,
        photo: '',
        hasSymptom: false,
        symptoms: [],
        severity: 'Leve',
        onset: '',
        symptomNotes: ''
      };
      data[key].cena = {
        time: '20:15',
        food: 'Crema de verduras casera (zapallo, zanahoria y acelga)',
        skipped: false,
        photo: '',
        hasSymptom: false,
        symptoms: [],
        severity: 'Leve',
        onset: '',
        symptomNotes: ''
      };
      continue;
    }

    const hadSymptomDay = [2, 5, 6, 9, 14, 21, 29].includes(i);

    MEAL_BLOCKS.forEach((b, idx) => {
      const isSkippedMeal =
        (i === 5 && b.id === 'post_almuerzo') ||
        (i === 9 && b.id === 'media_manana') ||
        (i % 7 === 0 && b.id === 'media_manana');

      if (isSkippedMeal) {
        const fastingSymptom = i === 5 && b.id === 'post_almuerzo';
        data[key][b.id] = {
          time: b.defaultTime,
          food: '',
          skipped: true,
          photo: '',
          hasSymptom: fastingSymptom,
          symptoms: fastingSymptom ? ['Dolor esófago/estómago', 'Acidez / Reflujo'] : [],
          severity: fastingSymptom ? 'Moderado' : 'Leve',
          onset: fastingSymptom ? 'Por ayuno / horas sin comer' : '',
          symptomNotes: fastingSymptom
            ? 'Saltó la colación de la tarde; a las 18:30 empezó ardor en el esófago por tener el estómago vacío.'
            : ''
        };
        return;
      }

      if (b.id === 'post_almuerzo' && i % 4 === 0) return;

      const list = sampleMeals[b.id];
      let foodText = list[(i + idx) % list.length];
      let hasSymptom = false;
      let symptoms = [];
      let severity = 'Leve';
      let onset = '';
      let symptomNotes = '';

      if (hadSymptomDay) {
        if (i === 2 && b.id === 'desayuno') {
          foodText = 'Café con leche entera y pan caliente con queso derretido';
          hasSymptom = true;
          symptoms = ['Dolor esófago/estómago', 'Náuseas', 'Pesadez'];
          severity = 'Fuerte';
          onset = '1 hora después';
          symptomNotes = 'El café con leche entera y queso le provocó dolor fuerte en el esófago y náuseas.';
        } else if (i === 6 && b.id === 'cena') {
          foodText = 'Once: Empanada de queso calentada y té cargado';
          hasSymptom = true;
          symptoms = ['Acidez / Reflujo', 'Vómitos', 'Dolor esófago/estómago'];
          severity = 'Fuerte';
          onset = '2+ horas después';
          symptomNotes = 'Mucho reflujo nocturno y episodio de vómito tras comer queso derretido en la noche.';
        } else if (i === 9 && b.id === 'almuerzo') {
          foodText = 'Fideos con salsa boloñesa de tomate y queso rallado';
          hasSymptom = true;
          symptoms = ['Acidez / Reflujo', 'Dolor esófago/estómago', 'Hinchazón'];
          severity = 'Moderado';
          onset = '30 min después';
          symptomNotes = 'Venía de saltar la media mañana y la salsa de tomate le dio acidez inmediata.';
        } else if (i > 10 && b.id === 'almuerzo') {
          hasSymptom = true;
          symptoms = ['Hinchazón', 'Gases', 'Pesadez'];
          severity = 'Leve';
          onset = '1 hora después';
          symptomNotes = 'Molestia e inflamación abdominal después de almorzar.';
        }
      }

      data[key][b.id] = {
        time: b.defaultTime,
        food: foodText,
        skipped: false,
        photo: (i === 2 && b.id === 'desayuno')
          ? createSamplePhotoSvg('Desayuno', 'Café con leche y pan con queso', '#78350f', '#92400e', '☕')
          : '',
        hasSymptom,
        symptoms,
        severity,
        onset,
        symptomNotes
      };
    });
  }

  return data;
};

// Función para comprimir imágenes subidas desde el celular/PC antes de guardar en LocalStorage
const compressImageToBase64 = (file, maxWidth = 800, quality = 0.72) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  // Tema por defecto: Oscuro (#1f1f1f)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mama_journal_theme');
    return saved ? saved === 'dark' : true;
  });

  // Pestaña activa inferior: 'agenda' (Home) | 'cascada' | 'patrones'
  const [activeTab, setActiveTab] = useState('agenda');

  // Sub-vista en Agenda: 'diaria' (por defecto) | '3dias' | 'mensual'
  const [agendaView, setAgendaView] = useState('diaria');

  // Sub-vista en Cascada: 'cascada' | 'semanal'
  const [habitSubView, setHabitSubView] = useState('cascada');

  // Fecha seleccionada actualmente (por defecto Hoy)
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(new Date()));

  // Mes visible en vista mensual
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  // Datos de registros diarios
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('mama_journal_records_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error cargando registros:', e);
    }
    return generateInitialDemoData();
  });

  // Configuración del Recordatorio Nocturno
  const [reminderConfig, setReminderConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('mama_journal_reminder_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      enabled: true,
      time: '21:00',
      lastNotifiedDate: ''
    };
  });

  // Estados para Instalación PWA (WebApp instalable en Celular y PC)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Estados de Modales
  const [editingBlock, setEditingBlock] = useState(null);
  const [photoModalData, setPhotoModalData] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [reminderBannerDismissed, setReminderBannerDismissed] = useState(false);

  // Configurar PWA automáticamente (Manifest dinámico, Meta tags iOS/Android y evento beforeinstallprompt)
  useEffect(() => {
    document.title = 'Agenda Comidas';

    const iconUrl = generateAppIconDataUrl();

    // Meta tags para que al agregar a pantalla de inicio se abra a pantalla completa como App nativa
    const setOrUpdateMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setOrUpdateMeta('theme-color', darkMode ? '#1f1f1f' : '#f3f6f3');
    setOrUpdateMeta('apple-mobile-web-app-capable', 'yes');
    setOrUpdateMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setOrUpdateMeta('apple-mobile-web-app-title', 'Agenda Comidas');
    setOrUpdateMeta('mobile-web-app-capable', 'yes');

    // Apple Touch Icon
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      document.head.appendChild(appleIcon);
    }
    appleIcon.setAttribute('href', iconUrl);

    // Web App Manifest dinámico si no hay uno externo
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestObj = {
        name: 'Agenda Comidas - Registro y Síntomas',
        short_name: 'Agenda Comidas',
        description: 'Registro diario de comidas, fotos y síntomas digestivos.',
        start_url: '.',
        display: 'standalone',
        background_color: '#1f1f1f',
        theme_color: '#1f1f1f',
        orientation: 'portrait-primary',
        icons: [
          {
            src: iconUrl,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      };
      const blob = new Blob([JSON.stringify(manifestObj)], { type: 'application/manifest+json' });
      const manifestURL = URL.createObjectURL(blob);
      const linkManifest = document.createElement('link');
      linkManifest.setAttribute('rel', 'manifest');
      linkManifest.setAttribute('href', manifestURL);
      document.head.appendChild(linkManifest);
    }

    // Capturar evento de instalación nativa en Chrome / Edge / Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [darkMode]);

  // Guardar en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mama_journal_records_v2', JSON.stringify(records));
    } catch (e) {
      showToast('El almacenamiento está casi lleno. Te sugerimos exportar un respaldo.', 'error');
    }
  }, [records]);

  useEffect(() => {
    localStorage.setItem('mama_journal_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('mama_journal_reminder_v1', JSON.stringify(reminderConfig));
  }, [reminderConfig]);

  // Mostrar notificación tipo Toast
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3200);
  };

  // Instalar WebApp cuando el navegador lo soporta directamente
  const handleTriggerNativeInstall = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredInstallPrompt(null);
        setShowInstallModal(false);
        showToast('¡Aplicación instalada en tu dispositivo!');
      }
    } else {
      setShowInstallModal(true);
    }
  };

  // Verificación periódica del recordatorio al final del día
  useEffect(() => {
    if (!reminderConfig.enabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayKey = formatDateKey(now);

      const todayData = records[todayKey] || {};
      const accountedCount = MEAL_BLOCKS.filter(
        (b) => todayData[b.id]?.food?.trim() || todayData[b.id]?.skipped
      ).length;

      if (currentHM >= reminderConfig.time && accountedCount < 5 && reminderConfig.lastNotifiedDate !== todayKey) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Agenda Comidas', {
            body: `Tienes ${5 - accountedCount} bloque(s) sin anotar hoy. ¡Recuerda registrar tus comidas o si saltaste alguna!`
          });
        }
        setReminderConfig((prev) => ({ ...prev, lastNotifiedDate: todayKey }));
        setReminderBannerDismissed(false);
      }
    };

    const timer = setInterval(checkReminder, 30000);
    return () => clearInterval(timer);
  }, [reminderConfig, records]);

  // ==========================================
  // FUNCIONES DE DATOS Y ESTADÍSTICAS
  // ==========================================
  const getDaySummary = (dateKey) => {
    const dayObj = records[dateKey] || {};
    let mealsLogged = 0;
    let skippedCount = 0;
    let symptomCount = 0;
    let photosCount = 0;
    const blockStates = {};

    MEAL_BLOCKS.forEach((b) => {
      const entry = dayObj[b.id];
      const hasFood = Boolean(entry?.food && entry.food.trim().length > 0);
      const isSkipped = Boolean(entry?.skipped);
      const hasSymptom = Boolean(entry?.hasSymptom);
      const hasPhoto = Boolean(entry?.photo);

      if (hasFood || hasSymptom || isSkipped) mealsLogged++;
      if (isSkipped) skippedCount++;
      if (hasSymptom) symptomCount++;
      if (hasPhoto) photosCount++;

      blockStates[b.id] = {
        logged: hasFood || hasSymptom,
        hasFood,
        isSkipped,
        hasSymptom,
        hasPhoto,
        entry
      };
    });

    return {
      mealsLogged,
      skippedCount,
      symptomCount,
      hasAnySymptom: symptomCount > 0,
      hasAnyMeal: mealsLogged > 0,
      photosCount,
      blockStates
    };
  };

  // Calcular los 7 días de la semana (Lunes a Domingo) para la fecha seleccionada
  const currentWeekDays = useMemo(() => {
    const selected = parseDateKey(selectedDateKey);
    const dayOfWeek = selected.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(selected, diffToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(monday, i);
      const key = formatDateKey(d);
      return {
        date: d,
        key,
        dayName: DAY_NAMES_SHORT[d.getDay()],
        dayNumber: d.getDate(),
        isToday: key === formatDateKey(new Date()),
        isSelected: key === selectedDateKey,
        summary: getDaySummary(key)
      };
    });
  }, [selectedDateKey, records]);

  // Calcular los 3 días para la vista "Cada 3 días"
  const threeDaysList = useMemo(() => {
    const centerDate = parseDateKey(selectedDateKey);
    return [0, 1, 2].map((offset) => {
      const d = addDays(centerDate, offset);
      const key = formatDateKey(d);
      return {
        date: d,
        key,
        dayName: DAY_NAMES_FULL[d.getDay()],
        dayShort: DAY_NAMES_SHORT[d.getDay()],
        dayNumber: d.getDate(),
        monthShort: MONTH_NAMES[d.getMonth()].slice(0, 3),
        isToday: key === formatDateKey(new Date()),
        summary: getDaySummary(key)
      };
    });
  }, [selectedDateKey, records]);

  // Calcular los días del calendario mensual
  const monthCalendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const leadingEmpty = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const cells = [];
    for (let i = 0; i < leadingEmpty; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const dateObj = new Date(year, month, d);
      const key = formatDateKey(dateObj);
      cells.push({
        date: dateObj,
        key,
        dayNumber: d,
        isToday: key === formatDateKey(new Date()),
        isSelected: key === selectedDateKey,
        summary: getDaySummary(key)
      });
    }
    return cells;
  }, [currentMonthDate, selectedDateKey, records]);

  // Guardar un bloque de comida + síntomas
  const handleSaveBlock = (dateKey, blockId, blockData) => {
    setRecords((prev) => {
      const dayRecords = { ...(prev[dateKey] || {}) };
      const isEmpty =
        (!blockData.food || !blockData.food.trim()) &&
        !blockData.skipped &&
        !blockData.photo &&
        !blockData.hasSymptom;

      if (isEmpty) {
        delete dayRecords[blockId];
      } else {
        dayRecords[blockId] = blockData;
      }

      return {
        ...prev,
        [dateKey]: dayRecords
      };
    });
    setEditingBlock(null);
    showToast('Registro actualizado');
  };

  // Marcar / Desmarcar rápidamente un bloque como "Comida saltada" directamente desde la Agenda
  const handleToggleSkipBlock = (dateKey, block) => {
    setRecords((prev) => {
      const dayRecords = { ...(prev[dateKey] || {}) };
      const existing = dayRecords[block.id];
      const nextSkipped = !existing?.skipped;

      if (!nextSkipped && !existing?.food?.trim() && !existing?.hasSymptom && !existing?.photo) {
        delete dayRecords[block.id];
      } else {
        dayRecords[block.id] = {
          time: existing?.time || block.defaultTime,
          food: nextSkipped ? '' : existing?.food || '',
          skipped: nextSkipped,
          photo: nextSkipped ? '' : existing?.photo || '',
          hasSymptom: Boolean(existing?.hasSymptom),
          symptoms: existing?.symptoms || [],
          severity: existing?.severity || 'Leve',
          onset: existing?.onset || '',
          symptomNotes: existing?.symptomNotes || ''
        };
      }

      return {
        ...prev,
        [dateKey]: dayRecords
      };
    });
    showToast('Estado de comida actualizado');
  };

  // Eliminar un bloque específico
  const handleDeleteBlock = (dateKey, blockId) => {
    setRecords((prev) => {
      const dayRecords = { ...(prev[dateKey] || {}) };
      delete dayRecords[blockId];
      return {
        ...prev,
        [dateKey]: dayRecords
      };
    });
    setEditingBlock(null);
    showToast('Registro eliminado');
  };

  // ==========================================
  // EXPORTACIÓN E IMPORTACIÓN (EXCEL CSV & JSON)
  // ==========================================
  const exportToExcelCSV = () => {
    const headers = [
      'Fecha',
      'Día de la Semana',
      'Bloque de Comida',
      'Hora',
      'Estado del Bloque',
      'Comidas / Bebidas Registradas',
      '¿Tuvo Síntomas?',
      'Síntomas Reportados',
      'Severidad',
      'Aparición del Síntoma',
      'Notas del Síntoma',
      '¿Tiene Foto?'
    ];

    const sortedDates = Object.keys(records).sort((a, b) => b.localeCompare(a));
    const rows = [];

    sortedDates.forEach((dateKey) => {
      const dayObj = records[dateKey];
      if (!dayObj) return;
      const dateObj = parseDateKey(dateKey);
      const dayName = DAY_NAMES_FULL[dateObj.getDay()];

      MEAL_BLOCKS.forEach((b) => {
        const entry = dayObj[b.id];
        if (!entry || (!entry.food && !entry.skipped && !entry.hasSymptom && !entry.photo)) return;

        rows.push([
          dateKey,
          dayName,
          b.name,
          entry.time || b.defaultTime,
          entry.skipped ? 'Comida Saltada (Ayuno)' : 'Comida Registrada',
          entry.skipped ? '[COMIDA SALTADA]' : entry.food || '',
          entry.hasSymptom ? 'SÍ (X)' : 'No',
          entry.hasSymptom && entry.symptoms?.length ? entry.symptoms.join(', ') : '',
          entry.hasSymptom ? entry.severity || '' : '',
          entry.hasSymptom ? entry.onset || '' : '',
          entry.hasSymptom ? entry.symptomNotes || '' : '',
          entry.photo ? 'Sí' : 'No'
        ]);
      });
    });

    const escapeCsvCell = (cell) => {
      const str = String(cell ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsvCell).join(';'), ...rows.map((r) => r.map(escapeCsvCell).join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agenda_Comidas_${formatDateKey(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo Excel (.csv) descargado con éxito');
  };

  // Exportar tabla HTML compatible con Excel (.xls) con colores para lectura médica rápida
  const exportToFormattedExcelTable = () => {
    const sortedDates = Object.keys(records).sort((a, b) => b.localeCompare(a));
    let tableRows = '';

    sortedDates.forEach((dateKey) => {
      const dayObj = records[dateKey];
      if (!dayObj) return;
      const dateObj = parseDateKey(dateKey);
      const dayName = DAY_NAMES_FULL[dateObj.getDay()];

      MEAL_BLOCKS.forEach((b) => {
        const entry = dayObj[b.id];
        if (!entry || (!entry.food && !entry.skipped && !entry.hasSymptom && !entry.photo)) return;
        const bgRow = entry.hasSymptom ? '#fee2e2' : entry.skipped ? '#fef3c7' : '#ffffff';
        const symptomBadge = entry.hasSymptom ? 'SÍ (Malestar)' : 'Sin síntomas';
        const mealDesc = entry.skipped ? '— COMIDA SALTADA (Muchas horas sin comer) —' : entry.food || '-';

        tableRows += `
          <tr style="background-color: ${bgRow};">
            <td style="padding:8px; border:1px solid #cbd5e1;">${dateKey}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${dayName}</td>
            <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold;">${b.name}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${entry.time || b.defaultTime}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${mealDesc}</td>
            <td style="padding:8px; border:1px solid #cbd5e1; font-weight:bold; color:${entry.hasSymptom ? '#b91c1c' : '#15803d'};">${symptomBadge}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${entry.hasSymptom ? (entry.symptoms || []).join(', ') : '-'}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${entry.hasSymptom ? entry.severity || '-' : '-'}</td>
            <td style="padding:8px; border:1px solid #cbd5e1;">${entry.hasSymptom ? `${entry.onset ? `[${entry.onset}] ` : ''}${entry.symptomNotes || ''}` : '-'}</td>
          </tr>
        `;
      });
    });

    const htmlExcel = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2>Agenda Comidas - Reporte Clínico de Alimentación y Síntomas</h2>
        <table border="1" style="border-collapse:collapse; font-family:Arial, sans-serif; font-size:13px;">
          <thead>
            <tr style="background-color:#1f2937; color:#ffffff;">
              <th style="padding:10px;">Fecha</th>
              <th style="padding:10px;">Día</th>
              <th style="padding:10px;">Bloque</th>
              <th style="padding:10px;">Hora</th>
              <th style="padding:10px;">Comida / Estado</th>
              <th style="padding:10px;">¿Tuvo Síntomas?</th>
              <th style="padding:10px;">Síntomas</th>
              <th style="padding:10px;">Severidad</th>
              <th style="padding:10px;">Cronología y Notas</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlExcel], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Clinico_Agenda_Comidas_${formatDateKey(new Date())}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Reporte Excel (.xls) con colores descargado');
  };

  // Exportar JSON completo (incluye fotos en base64)
  const exportFullBackupJSON = () => {
    const payload = {
      appName: 'AgendaComidas',
      exportedAt: new Date().toISOString(),
      reminderConfig,
      records
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Agenda_Comidas_${formatDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Respaldo completo (.json) descargado');
  };

  // Importar archivo JSON o CSV
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          const importedRecords = parsed.records || parsed;
          if (typeof importedRecords === 'object') {
            setRecords(importedRecords);
            if (parsed.reminderConfig) setReminderConfig(parsed.reminderConfig);
            showToast('Respaldo restaurado exitosamente');
            setShowBackupModal(false);
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split(/\r?\n/).filter((l) => l.trim());
          const newRecords = { ...records };
          const blockByName = {};
          MEAL_BLOCKS.forEach((b) => {
            blockByName[b.name.toLowerCase()] = b.id;
          });

          for (let i = 1; i < lines.length; i++) {
            const sep = lines[i].includes(';') ? ';' : ',';
            const cols = lines[i]
              .split(sep)
              .map((c) => c.replace(/^"|"$/g, '').replace(/""/g, '"'));
            if (cols.length >= 5) {
              const [dateKey, , blockName, time, statusOrFood, maybeFood, hadSymp, sympList, sev, onset, notes] = cols;
              const blockId = blockByName[blockName?.toLowerCase()] || 'almuerzo';
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
                if (!newRecords[dateKey]) newRecords[dateKey] = {};
                const isSkipped = statusOrFood?.toLowerCase().includes('saltada');
                newRecords[dateKey][blockId] = {
                  time: time || '12:00',
                  skipped: isSkipped,
                  food: isSkipped ? '' : maybeFood || statusOrFood || '',
                  photo: newRecords[dateKey]?.[blockId]?.photo || '',
                  hasSymptom: hadSymp?.toLowerCase().includes('sí') || hadSymp?.toLowerCase().includes('si'),
                  symptoms: sympList ? sympList.split(',').map((s) => s.trim()).filter(Boolean) : [],
                  severity: sev || 'Leve',
                  onset: onset || '',
                  symptomNotes: notes || ''
                };
              }
            }
          }
          setRecords(newRecords);
          showToast('Datos CSV importados correctamente');
          setShowBackupModal(false);
        }
      } catch (err) {
        showToast('No se pudo leer el archivo seleccionado', 'error');
      }
    };
    reader.readAsText(file);
  };

  // ==========================================
  // CLASES DE TEMA (OSCURO #1f1f1f / CLARO)
  // ==========================================
  const theme = {
    bgMain: darkMode ? 'bg-[#1f1f1f] text-[#f3f4f6]' : 'bg-[#f3f6f3] text-[#1e2923]',
    bgCard: darkMode
      ? 'bg-[#282828] border-[#383838] text-[#f3f4f6]'
      : 'bg-white border-[#dce5dc] text-[#1e2923] shadow-sm',
    bgCardSubtle: darkMode
      ? 'bg-[#232323] border-[#333333]'
      : 'bg-[#f8faf8] border-[#e2ebe2]',
    bgHeader: darkMode
      ? 'bg-[#1f1f1f]/95 border-[#323232]'
      : 'bg-[#f3f6f3]/95 border-[#dce5dc]',
    textMuted: darkMode ? 'text-[#9ca3af]' : 'text-[#5c6f63]',
    border: darkMode ? 'border-[#363636]' : 'border-[#dce5dc]',
    pillBg: darkMode ? 'bg-[#323232] hover:bg-[#3c3c3c]' : 'bg-[#e6ede6] hover:bg-[#d8e3d8]'
  };

  const todayKey = formatDateKey(new Date());
  const todaySummary = getDaySummary(todayKey);
  const selectedDateObj = parseDateKey(selectedDateKey);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme.bgMain} pb-28 font-sans`}>
      {/* ========================================== */}
      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {/* ========================================== */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium border ${
              toastMessage.type === 'error'
                ? 'bg-[#ef4444] text-white border-red-400'
                : 'bg-[#4ade80] text-[#0f291a] border-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* BARRA SUPERIOR LIMPIA ("Agenda Comidas") */}
      {/* ========================================== */}
      <header className={`sticky top-0 z-40 h-16 backdrop-blur-md border-b ${theme.bgHeader}`}>
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between gap-2">
          {/* Título corto y genérico: Agenda Comidas */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4ade80] to-[#16a34a] flex items-center justify-center text-[#092214] shadow-md">
              <Utensils className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight leading-tight">
                Agenda Comidas
              </h1>
              <p className={`text-xs ${theme.textMuted} capitalize`}>
                {DAY_NAMES_FULL[selectedDateObj.getDay()]}, {selectedDateObj.getDate()} de{' '}
                {MONTH_NAMES[selectedDateObj.getMonth()]}
              </p>
            </div>
          </div>

          {/* Botones de Acción Rápida: Instalar App, Recordatorio, Backup y Tema */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Botón Instalar en Celular / PC (PWA) */}
            <button
              onClick={handleTriggerNativeInstall}
              title="Instalar como aplicación en el celular o computador"
              className={`px-2.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${theme.bgCard} hover:border-[#4ade80]`}
            >
              <Smartphone className="w-4 h-4 text-[#4ade80]" />
              <span className="hidden md:inline">Instalar App</span>
            </button>

            {/* Botón Recordatorio */}
            <button
              onClick={() => setShowReminderModal(true)}
              title="Configurar recordatorio nocturno"
              className={`relative p-2.5 rounded-xl border transition-all ${theme.bgCard} hover:border-[#4ade80]`}
            >
              <Bell className={`w-4 h-4 ${reminderConfig.enabled ? 'text-[#4ade80]' : theme.textMuted}`} />
              {reminderConfig.enabled && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4ade80]" />
              )}
            </button>

            {/* Botón Backup / Excel */}
            <button
              onClick={() => setShowBackupModal(true)}
              title="Respaldo y Exportar a Excel"
              className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${theme.bgCard} hover:border-[#4ade80]`}
            >
              <Download className="w-4 h-4 text-[#4ade80]" />
              <span className="hidden sm:inline">Backup / Excel</span>
            </button>

            {/* Botón Tema Oscuro / Claro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro (#1f1f1f)'}
              className={`p-2.5 rounded-xl border transition-all ${theme.bgCard} hover:border-[#4ade80]`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================== */}
      {/* BANNER RECORDATORIO SI FALTAN COMIDAS HOY */}
      {/* ========================================== */}
      {!reminderBannerDismissed && reminderConfig.enabled && todaySummary.mealsLogged < 5 && (
        <div className="max-w-5xl mx-auto px-4 pt-3">
          <div
            className={`rounded-2xl p-2.5 sm:px-4 border flex items-center justify-between gap-3 ${
              darkMode
                ? 'bg-[#262f28] border-[#38523f] text-emerald-100'
                : 'bg-[#e6f4ea] border-[#b7dfc2] text-emerald-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#4ade80]/20 text-[#4ade80] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-semibold">Recordatorio ({reminderConfig.time}):</span> Hoy llevas{' '}
                <span className="font-bold underline">{todaySummary.mealsLogged} de 5</span> bloques registrados.
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {selectedDateKey !== todayKey && (
                <button
                  onClick={() => setSelectedDateKey(todayKey)}
                  className="px-2.5 py-1 rounded-lg bg-[#4ade80] text-[#092214] text-xs font-bold"
                >
                  Ir a Hoy
                </button>
              )}
              <button
                onClick={() => setReminderBannerDismissed(true)}
                className="p-1 rounded-lg opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA INFERIOR */}
      {/* ========================================== */}
      <main className="max-w-5xl mx-auto px-4 pt-3">
        {activeTab === 'agenda' && (
          <AgendaSection
            darkMode={darkMode}
            theme={theme}
            agendaView={agendaView}
            setAgendaView={setAgendaView}
            selectedDateKey={selectedDateKey}
            setSelectedDateKey={setSelectedDateKey}
            currentWeekDays={currentWeekDays}
            threeDaysList={threeDaysList}
            currentMonthDate={currentMonthDate}
            setCurrentMonthDate={setCurrentMonthDate}
            monthCalendarDays={monthCalendarDays}
            records={records}
            getDaySummary={getDaySummary}
            onEditBlock={(dateKey, blockId, openWithSymptom = false) =>
              setEditingBlock({ dateKey, blockId, openWithSymptom })
            }
            onToggleSkipBlock={handleToggleSkipBlock}
            onOpenPhoto={(data) => setPhotoModalData(data)}
          />
        )}

        {activeTab === 'cascada' && (
          <CascadeHabitsSection
            darkMode={darkMode}
            theme={theme}
            habitSubView={habitSubView}
            setHabitSubView={setHabitSubView}
            records={records}
            getDaySummary={getDaySummary}
            selectedDateKey={selectedDateKey}
            onSelectDayFromGrid={(dateKey) => {
              setSelectedDateKey(dateKey);
              setActiveTab('agenda');
              setAgendaView('diaria');
            }}
          />
        )}

        {activeTab === 'patrones' && (
          <PatternsMedicalSection
            darkMode={darkMode}
            theme={theme}
            records={records}
            getDaySummary={getDaySummary}
            onSelectDay={(dateKey) => {
              setSelectedDateKey(dateKey);
              setActiveTab('agenda');
              setAgendaView('diaria');
            }}
            onOpenPhoto={(data) => setPhotoModalData(data)}
            onExportExcel={exportToFormattedExcelTable}
          />
        )}
      </main>

      {/* ========================================== */}
      {/* BARRA DE NAVEGACIÓN INFERIOR (SIEMPRE VISIBLE) */}
      {/* Agenda - Cascada - Patrones */}
      {/* ========================================== */}
      <nav
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 p-1.5 rounded-full border shadow-2xl flex items-center gap-1 sm:gap-2 ${
          darkMode
            ? 'bg-[#252525]/95 border-[#3f3f3f] backdrop-blur-md shadow-black/60'
            : 'bg-white/95 border-[#cbd5cb] backdrop-blur-md shadow-emerald-950/10'
        }`}
      >
        <button
          onClick={() => setActiveTab('agenda')}
          className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'agenda'
              ? 'bg-[#4ade80] text-[#092214] shadow-md'
              : `${theme.textMuted} hover:opacity-100`
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda</span>
        </button>

        <button
          onClick={() => setActiveTab('cascada')}
          className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'cascada'
              ? 'bg-[#4ade80] text-[#092214] shadow-md'
              : `${theme.textMuted} hover:opacity-100`
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Cascada</span>
        </button>

        <button
          onClick={() => setActiveTab('patrones')}
          className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'patrones'
              ? 'bg-[#4ade80] text-[#092214] shadow-md'
              : `${theme.textMuted} hover:opacity-100`
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Patrones</span>
        </button>
      </nav>

      {/* ========================================== */}
      {/* MODAL DE EDICIÓN DE BLOQUE Y SÍNTOMAS */}
      {/* ========================================== */}
      {editingBlock && (
        <BlockEditorModal
          darkMode={darkMode}
          theme={theme}
          dateKey={editingBlock.dateKey}
          blockId={editingBlock.blockId}
          openWithSymptom={editingBlock.openWithSymptom}
          existingData={records[editingBlock.dateKey]?.[editingBlock.blockId]}
          onClose={() => setEditingBlock(null)}
          onSave={handleSaveBlock}
          onDelete={handleDeleteBlock}
        />
      )}

      {/* ========================================== */}
      {/* MODAL PARA VER FOTO ADJUNTA */}
      {/* ========================================== */}
      {photoModalData && (
        <PhotoLightboxModal
          darkMode={darkMode}
          theme={theme}
          data={photoModalData}
          onClose={() => setPhotoModalData(null)}
          onEditBlock={() => {
            const { dateKey, blockId } = photoModalData;
            setPhotoModalData(null);
            setEditingBlock({ dateKey, blockId, openWithSymptom: false });
          }}
        />
      )}

      {/* ========================================== */}
      {/* MODAL DE RECORDATORIO NOCTURNO */}
      {/* ========================================== */}
      {showReminderModal && (
        <ReminderSettingsModal
          darkMode={darkMode}
          theme={theme}
          reminderConfig={reminderConfig}
          setReminderConfig={setReminderConfig}
          onClose={() => setShowReminderModal(false)}
          showToast={showToast}
        />
      )}

      {/* ========================================== */}
      {/* MODAL DE INSTRUCCIONES DE INSTALACIÓN PWA */}
      {/* ========================================== */}
      {showInstallModal && (
        <InstallPwaModal
          darkMode={darkMode}
          theme={theme}
          deferredInstallPrompt={deferredInstallPrompt}
          onInstallClick={handleTriggerNativeInstall}
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* ========================================== */}
      {/* MODAL DE BACKUP Y EXPORTACIÓN EXCEL */}
      {/* ========================================== */}
      {showBackupModal && (
        <BackupModal
          darkMode={darkMode}
          theme={theme}
          onClose={() => setShowBackupModal(false)}
          onExportCSV={exportToExcelCSV}
          onExportXLS={exportToFormattedExcelTable}
          onExportJSON={exportFullBackupJSON}
          onImportFile={handleImportBackup}
          onResetDemo={() => {
            setRecords(generateInitialDemoData());
            setShowBackupModal(false);
            showToast('Datos de demostración restaurados');
          }}
          onClearAll={() => {
            setRecords({});
            setShowBackupModal(false);
            showToast('Se limpiaron todos los registros');
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// SECCIÓN 1: VISTA DE AGENDA (CON BARRA DE DÍAS SIEMPRE VISIBLE)
// ==========================================
function AgendaSection({
  darkMode,
  theme,
  agendaView,
  setAgendaView,
  selectedDateKey,
  setSelectedDateKey,
  currentWeekDays,
  threeDaysList,
  currentMonthDate,
  setCurrentMonthDate,
  monthCalendarDays,
  records,
  getDaySummary,
  onEditBlock,
  onToggleSkipBlock,
  onOpenPhoto
}) {
  const todayKey = formatDateKey(new Date());
  const selectedDaySummary = getDaySummary(selectedDateKey);
  const selectedDateObj = parseDateKey(selectedDateKey);

  const handleNavigatePrev = () => {
    if (agendaView === 'diaria') {
      setSelectedDateKey(formatDateKey(addDays(selectedDateObj, -7)));
    } else if (agendaView === '3dias') {
      setSelectedDateKey(formatDateKey(addDays(selectedDateObj, -3)));
    } else {
      setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    }
  };

  const handleNavigateNext = () => {
    if (agendaView === 'diaria') {
      setSelectedDateKey(formatDateKey(addDays(selectedDateObj, 7)));
    } else if (agendaView === '3dias') {
      setSelectedDateKey(formatDateKey(addDays(selectedDateObj, 3)));
    } else {
      setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
    }
  };

  return (
    <div className="space-y-4">
      {/* ===================================================== */}
      {/* BARRA STICKY SIEMPRE A LA VISTA (CONTROLES + SEMANA) */}
      {/* ===================================================== */}
      <div
        className={`sticky top-16 z-30 pt-1 pb-2.5 -mx-4 px-4 backdrop-blur-md border-b transition-all ${
          darkMode ? 'bg-[#1f1f1f]/95 border-[#333333]' : 'bg-[#f3f6f3]/95 border-[#dce5dc]'
        }`}
      >
        <div className="space-y-2.5">
          {/* Controles de navegación de fecha y selector Diaria / 3 Días / Mensual */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleNavigatePrev}
                className={`p-1.5 sm:p-2 rounded-xl border ${theme.bgCard} hover:border-[#4ade80] transition-colors`}
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const now = new Date();
                  setSelectedDateKey(formatDateKey(now));
                  setCurrentMonthDate(now);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedDateKey === todayKey
                    ? 'bg-[#4ade80]/15 text-[#4ade80] border-[#4ade80]/40'
                    : `${theme.bgCard} hover:border-[#4ade80]`
                }`}
              >
                Hoy
              </button>

              <button
                onClick={handleNavigateNext}
                className={`p-1.5 sm:p-2 rounded-xl border ${theme.bgCard} hover:border-[#4ade80] transition-colors`}
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="ml-1 text-xs sm:text-sm font-extrabold">
                {agendaView === 'mensual'
                  ? `${MONTH_NAMES[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`
                  : `${selectedDateObj.getDate()} de ${MONTH_NAMES[selectedDateObj.getMonth()]}`}
              </span>
            </div>

            {/* Selector de modo de visualización de la Agenda */}
            <div
              className={`flex items-center p-1 rounded-xl border ${
                darkMode ? 'bg-[#262626] border-[#383838]' : 'bg-[#e6ede6] border-[#d2dfd2]'
              }`}
            >
              {[
                { id: 'diaria', label: 'Diaria' },
                { id: '3dias', label: '3 Días' },
                { id: 'mensual', label: 'Mensual' }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setAgendaView(v.id)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    agendaView === v.id
                      ? 'bg-[#4ade80] text-[#092214] shadow-sm'
                      : `${theme.textMuted} hover:opacity-90`
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tira de los 7 días de la semana SIEMPRE VISIBLE en vista Diaria y 3 Días */}
          {agendaView !== 'mensual' && (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {currentWeekDays.map((day) => {
                const isSelected = day.isSelected;
                const { hasAnySymptom, blockStates } = day.summary;

                return (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDateKey(day.key)}
                    className={`group relative py-2 px-1 rounded-2xl border transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? darkMode
                          ? 'bg-[#303832] border-[#4ade80] shadow-md'
                          : 'bg-[#e2f5e8] border-[#16a34a] shadow-sm'
                        : day.isToday
                        ? darkMode
                          ? 'bg-[#262626] border-[#4ade80]/40'
                          : 'bg-white border-[#4ade80]'
                        : `${theme.bgCard} hover:border-[#4ade80]/50`
                    }`}
                  >
                    {hasAnySymptom && (
                      <span
                        title="Día con síntomas registrados"
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#f87171] text-[#280909] text-[9px] font-black flex items-center justify-center shadow"
                      >
                        ✕
                      </span>
                    )}

                    <span
                      className={`text-[10px] sm:text-xs font-medium ${
                        isSelected ? 'text-[#4ade80] font-bold' : theme.textMuted
                      }`}
                    >
                      {day.dayName}
                    </span>

                    <span
                      className={`text-sm sm:text-lg font-extrabold leading-tight my-0.5 ${
                        isSelected ? (darkMode ? 'text-white' : 'text-[#0b2617]') : ''
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {/* 5 Puntos inferiores que representan los 5 bloques del día */}
                    <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                      {MEAL_BLOCKS.map((b) => {
                        const st = blockStates[b.id];
                        if (st?.hasSymptom) {
                          return (
                            <span
                              key={b.id}
                              className="w-1.5 h-1.5 rounded-full bg-[#f87171]"
                            />
                          );
                        }
                        if (st?.isSkipped) {
                          return (
                            <span
                              key={b.id}
                              className="w-1.5 h-1.5 rounded-full bg-amber-400"
                              title="Comida saltada"
                            />
                          );
                        }
                        if (st?.logged) {
                          return (
                            <span
                              key={b.id}
                              className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"
                            />
                          );
                        }
                        return (
                          <span
                            key={b.id}
                            className={`w-1.5 h-1.5 rounded-full border ${
                              darkMode ? 'border-[#525252]' : 'border-[#b8c9b8]'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* SUB-VISTA 1: VISTA DIARIA (DEFAULT HOME) */}
      {/* ===================================================== */}
      {agendaView === 'diaria' && (
        <div className="space-y-4">
          {/* Resumen rápido del día seleccionado */}
          <div className={`px-4 py-2.5 rounded-2xl border ${theme.bgCard} flex flex-wrap items-center justify-between gap-2 text-xs`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
                {selectedDaySummary.mealsLogged}/5 bloques registrados
              </span>
              {selectedDaySummary.skippedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                  — {selectedDaySummary.skippedCount} comida(s) saltada(s)
                </span>
              )}
              {selectedDaySummary.hasAnySymptom ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {selectedDaySummary.symptomCount} con malestar
                </span>
              ) : selectedDaySummary.hasAnyMeal ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#4ade80]/15 text-[#4ade80] font-semibold">
                  ✓ Sin malestares
                </span>
              ) : null}
            </div>
          </div>

          {/* Línea de tiempo vertical hora por hora de los 5 bloques */}
          <div className="space-y-3.5 relative">
            {MEAL_BLOCKS.map((block, index) => {
              const entry = records[selectedDateKey]?.[block.id];
              const hasFood = Boolean(entry?.food && entry.food.trim());
              const isSkipped = Boolean(entry?.skipped);
              const hasSymptom = Boolean(entry?.hasSymptom);
              const hasPhoto = Boolean(entry?.photo);
              const isLogged = hasFood || hasSymptom || hasPhoto || isSkipped;
              const IconComp = block.icon;

              return (
                <div key={block.id} className="relative flex gap-3 sm:gap-4 items-stretch">
                  {/* Columna izquierda: Hora y Cápsula estilo HabitTick */}
                  <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center">
                    <span className={`text-xs font-bold mb-1.5 ${theme.textMuted}`}>
                      {entry?.time || block.defaultTime}
                    </span>

                    <button
                      onClick={() => onEditBlock(selectedDateKey, block.id, false)}
                      className={`w-12 sm:w-14 flex-1 min-h-[72px] rounded-3xl flex flex-col items-center justify-center transition-all border ${
                        hasSymptom
                          ? 'bg-[#f87171] text-[#2b0909] border-[#fca5a5] shadow-lg shadow-[#f87171]/20'
                          : isSkipped
                          ? darkMode
                            ? 'bg-[#2c2618] text-amber-400 border-amber-500/50'
                            : 'bg-amber-50 text-amber-700 border-amber-400'
                          : isLogged
                          ? 'bg-[#4ade80] text-[#092214] border-[#86efac] shadow-lg shadow-[#4ade80]/15'
                          : darkMode
                          ? 'bg-[#2a2a2a] text-[#9ca3af] border-[#3d3d3d] hover:border-[#4ade80]'
                          : 'bg-white text-[#5c6f63] border-[#cfe0cf] hover:border-[#16a34a]'
                      }`}
                    >
                      <IconComp className="w-5 h-5 stroke-[2.2]" />
                      {hasSymptom && (
                        <span className="mt-1 text-[10px] font-black uppercase tracking-wider bg-black/20 text-white px-1.5 rounded-full">
                          ✕
                        </span>
                      )}
                      {!hasSymptom && isSkipped && (
                        <span className="mt-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 px-1.5 rounded-full">
                          —
                        </span>
                      )}
                    </button>

                    {index < MEAL_BLOCKS.length - 1 && (
                      <div
                        className={`w-0.5 h-3 mt-1 border-l-2 border-dashed ${
                          isLogged ? 'border-[#4ade80]/60' : darkMode ? 'border-[#404040]' : 'border-[#c5d6c5]'
                        }`}
                      />
                    )}
                  </div>

                  {/* Tarjeta derecha del bloque de comida y síntomas */}
                  <div
                    className={`flex-1 rounded-3xl border p-4 transition-all ${
                      hasSymptom
                        ? darkMode
                          ? 'bg-[#2d2222] border-[#f87171]/60'
                          : 'bg-[#fff5f5] border-[#f87171]'
                        : isSkipped
                        ? darkMode
                          ? 'bg-[#26231c] border-amber-500/40'
                          : 'bg-[#fffbeb] border-amber-300'
                        : theme.bgCard
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: block.color }}
                        />
                        <h3 className="text-base sm:text-lg font-bold">{block.name}</h3>
                        {isSkipped ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Ban className="w-3 h-3" /> Comida saltada
                          </span>
                        ) : hasFood ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#4ade80]/15 text-[#4ade80] flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Anotado
                          </span>
                        ) : (
                          <span className={`text-xs ${theme.textMuted}`}>Sin anotar</span>
                        )}
                      </div>

                      {/* Acciones del bloque: Saltar comida y Editar/Anotar */}
                      <div className="flex items-center gap-1.5">
                        {!hasFood && (
                          <button
                            type="button"
                            onClick={() => onToggleSkipBlock(selectedDateKey, block)}
                            title="Marcar que no comió en este bloque para diferenciarlo de un olvido"
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                              isSkipped
                                ? 'bg-amber-500 text-[#241600] border-amber-400'
                                : `${theme.bgCardSubtle} ${theme.textMuted} hover:border-amber-400 hover:text-amber-400`
                            }`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>{isSkipped ? 'Saltada' : 'Saltar'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => onEditBlock(selectedDateKey, block.id, false)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            hasFood || isSkipped
                              ? `${theme.pillBg}`
                              : 'bg-[#4ade80] text-[#092214] shadow-sm hover:opacity-95'
                          }`}
                        >
                          {hasFood || isSkipped ? (
                            <>
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Anotar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Contenido de la comida o aviso de comida saltada */}
                    {isSkipped ? (
                      <p className="mt-2 text-xs sm:text-sm font-medium text-amber-400/90 flex items-center gap-1.5">
                        <span>— No comió en este horario (pasó estas horas en ayuno).</span>
                      </p>
                    ) : hasFood ? (
                      <p className="mt-2 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {entry.food}
                      </p>
                    ) : (
                      <p
                        onClick={() => onEditBlock(selectedDateKey, block.id, false)}
                        className={`mt-2 text-xs sm:text-sm italic cursor-pointer ${theme.textMuted}`}
                      >
                        {block.placeholder}
                      </p>
                    )}

                    {/* Botón compacto de foto cargada */}
                    {hasPhoto && (
                      <div className="mt-2.5">
                        <button
                          onClick={() =>
                            onOpenPhoto({
                              dateKey: selectedDateKey,
                              blockId: block.id,
                              blockName: block.name,
                              photo: entry.photo,
                              food: entry.food,
                              time: entry.time || block.defaultTime
                            })
                          }
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all inline-flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>📷 Ver foto adjunta</span>
                        </button>
                      </div>
                    )}

                    {/* Tarjeta de Síntomas: Si no tiene síntomas, muestra barra con botón "+" a la derecha */}
                    {!hasSymptom ? (
                      <div
                        onClick={() => onEditBlock(selectedDateKey, block.id, true)}
                        className={`mt-3 p-2.5 sm:px-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          darkMode
                            ? 'bg-[#222222] border-[#383838] hover:border-[#f87171]/60'
                            : 'bg-[#f8faf8] border-[#d8e3d8] hover:border-[#f87171]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                              darkMode ? 'bg-[#303030] text-gray-400' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            ✕
                          </span>
                          <div>
                            <p className="text-xs sm:text-sm font-bold">
                              ¿Tuvo algún síntoma o malestar estomacal?
                            </p>
                            <p className={`text-[11px] ${theme.textMuted}`}>
                              Aprieta el signo + para anotar síntomas de este bloque
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditBlock(selectedDateKey, block.id, true);
                          }}
                          title="Agregar síntoma"
                          className={`w-9 h-9 rounded-xl font-black text-lg flex items-center justify-center transition-all shrink-0 border ${
                            darkMode
                              ? 'bg-[#333333] hover:bg-[#f87171] text-white hover:text-[#2b0909] border-[#484848]'
                              : 'bg-[#e6ede6] hover:bg-[#f87171] text-[#1e2923] hover:text-white border-[#cbd8cb]'
                          }`}
                        >
                          <Plus className="w-5 h-5 stroke-[2.8]" />
                        </button>
                      </div>
                    ) : (
                      /* Bloque visual cuando SÍ reportó malestar en esta comida */
                      <div
                        onClick={() => onEditBlock(selectedDateKey, block.id, true)}
                        className={`mt-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          darkMode
                            ? 'bg-[#3a2020]/90 border-[#f87171]/50 text-red-100'
                            : 'bg-[#fee2e2] border-[#f87171] text-red-950'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#f87171]">
                            <span className="w-5 h-5 rounded-md bg-[#f87171] text-[#280909] flex items-center justify-center font-black">
                              ✕
                            </span>
                            <span>SÍNTOMA EN {block.name.toUpperCase()}</span>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f87171]/25 text-[#f87171]">
                            Severidad: {entry.severity || 'Moderado'}
                          </span>
                        </div>

                        {entry.symptoms?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 my-1.5">
                            {entry.symptoms.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-black/25 text-white"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {(entry.onset || entry.symptomNotes) && (
                          <p className="text-xs sm:text-sm mt-1 opacity-95">
                            {entry.onset && <strong className="mr-1">[{entry.onset}]</strong>}
                            {entry.symptomNotes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* SUB-VISTA 2: VISTA CADA 3 DÍAS (COMPARATIVA) */}
      {/* ===================================================== */}
      {agendaView === '3dias' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {threeDaysList.map((dayItem) => {
              const dayRecords = records[dayItem.key] || {};
              return (
                <div
                  key={dayItem.key}
                  className={`rounded-3xl border p-4 flex flex-col justify-between ${theme.bgCard}`}
                >
                  <div>
                    <div className={`pb-3 mb-3 border-b ${theme.border} flex items-center justify-between`}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#4ade80]">
                          {dayItem.dayName}
                        </span>
                        <h3 className="text-lg font-extrabold">
                          {dayItem.dayNumber} {dayItem.monthShort}
                          {dayItem.isToday && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#4ade80] text-[#092214]">
                              Hoy
                            </span>
                          )}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1">
                        {MEAL_BLOCKS.map((b) => {
                          const st = dayItem.summary.blockStates[b.id];
                          return (
                            <div
                              key={b.id}
                              title={`${b.name}`}
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black border ${
                                st?.hasSymptom
                                  ? 'bg-[#f87171] text-[#2b0909] border-[#fca5a5]'
                                  : st?.isSkipped
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-400/50'
                                  : st?.logged
                                  ? 'bg-[#4ade80] text-[#092214] border-[#86efac]'
                                  : darkMode
                                  ? 'bg-[#222222] border-[#3d3d3d]'
                                  : 'bg-[#edf2ed] border-[#cbd8cb]'
                              }`}
                            >
                              {st?.hasSymptom ? '✕' : st?.isSkipped ? '—' : st?.logged ? '✓' : ''}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {MEAL_BLOCKS.map((b) => {
                        const entry = dayRecords[b.id];
                        const hasFood = Boolean(entry?.food?.trim());
                        const isSkipped = Boolean(entry?.skipped);
                        const hasSymptom = Boolean(entry?.hasSymptom);
                        const hasPhoto = Boolean(entry?.photo);
                        const isLogged = hasFood || hasSymptom || hasPhoto || isSkipped;

                        return (
                          <div
                            key={b.id}
                            onClick={() => onEditBlock(dayItem.key, b.id, false)}
                            className={`p-2.5 rounded-2xl border cursor-pointer transition-all ${
                              hasSymptom
                                ? darkMode
                                  ? 'bg-[#362020] border-[#f87171]/60'
                                  : 'bg-[#fee2e2] border-[#f87171]'
                                : isSkipped
                                ? darkMode
                                  ? 'bg-[#2b2519] border-amber-500/40'
                                  : 'bg-amber-50 border-amber-300'
                                : isLogged
                                ? `${theme.bgCardSubtle} border-[#4ade80]/40`
                                : `${theme.bgCardSubtle} opacity-75 hover:opacity-100`
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: b.color }}
                                />
                                {b.name}
                              </span>
                              <span className={`text-[11px] ${theme.textMuted}`}>
                                {entry?.time || b.defaultTime}
                              </span>
                            </div>

                            {isSkipped ? (
                              <p className="text-xs mt-1 font-semibold text-amber-400">
                                — Comida saltada
                              </p>
                            ) : hasFood ? (
                              <p className="text-xs mt-1 line-clamp-2">{entry.food}</p>
                            ) : (
                              <p className={`text-[11px] italic mt-0.5 ${theme.textMuted}`}>
                                Sin anotar (+ Toca para agregar)
                              </p>
                            )}

                            {(hasPhoto || hasSymptom) && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {hasPhoto && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenPhoto({
                                        dateKey: dayItem.key,
                                        blockId: b.id,
                                        blockName: b.name,
                                        photo: entry.photo,
                                        food: entry.food,
                                        time: entry.time || b.defaultTime
                                      });
                                    }}
                                    className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-[11px] font-bold"
                                  >
                                    📷 Hay foto
                                  </button>
                                )}
                                {hasSymptom && (
                                  <span className="px-2 py-0.5 rounded-md bg-[#f87171] text-[#2b0909] text-[11px] font-extrabold">
                                    ✕ {entry.symptoms?.slice(0, 2).join(', ') || 'Síntoma'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDateKey(dayItem.key);
                      setAgendaView('diaria');
                    }}
                    className={`mt-3 w-full py-2 rounded-xl text-xs font-bold border ${theme.bgCardSubtle} hover:border-[#4ade80]`}
                  >
                    Ver detalle del día →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* SUB-VISTA 3: CALENDARIO MENSUAL */}
      {/* ===================================================== */}
      {agendaView === 'mensual' && (
        <div className={`p-4 sm:p-5 rounded-3xl border ${theme.bgCard}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-extrabold">
              {MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#4ade80] inline-block" /> Comida anotada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Saltada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#f87171] text-[#2b0909] font-black text-[9px] flex items-center justify-center">
                  ✕
                </span>{' '}
                Síntomas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className={`text-xs font-bold py-1 ${theme.textMuted}`}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthCalendarDays.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-2xl opacity-20" />;
              }

              const { hasAnySymptom, hasAnyMeal, blockStates } = cell.summary;

              return (
                <button
                  key={cell.key}
                  onClick={() => {
                    setSelectedDateKey(cell.key);
                    setAgendaView('diaria');
                  }}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                    cell.isSelected
                      ? 'border-[#4ade80] ring-2 ring-[#4ade80]/30'
                      : cell.isToday
                      ? 'border-[#4ade80]/70'
                      : theme.border
                  } ${
                    hasAnySymptom
                      ? darkMode
                        ? 'bg-[#332020] hover:bg-[#3d2525]'
                        : 'bg-[#fff1f2] hover:bg-[#ffe4e6]'
                      : hasAnyMeal
                      ? darkMode
                        ? 'bg-[#232c26] hover:bg-[#29352d]'
                        : 'bg-[#f0fdf4] hover:bg-[#dcfce7]'
                      : `${theme.bgCardSubtle} hover:border-[#4ade80]/50`
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-extrabold ${
                        cell.isToday
                          ? 'w-6 h-6 rounded-full bg-[#4ade80] text-[#092214] flex items-center justify-center'
                          : ''
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasAnySymptom && (
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-[#f87171] text-[#2b0909] text-[10px] font-black flex items-center justify-center">
                        ✕
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="grid grid-cols-5 gap-0.5 sm:gap-1">
                      {MEAL_BLOCKS.map((b) => {
                        const st = blockStates[b.id];
                        return (
                          <div
                            key={b.id}
                            title={b.name}
                            className={`h-2 sm:h-2.5 rounded-sm ${
                              st?.hasSymptom
                                ? 'bg-[#f87171]'
                                : st?.isSkipped
                                ? 'bg-amber-400'
                                : st?.logged
                                ? 'bg-[#4ade80]'
                                : darkMode
                                ? 'bg-[#383838]'
                                : 'bg-[#d5e0d5]'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className={`text-[10px] truncate hidden sm:block ${theme.textMuted}`}>
                      {cell.summary.mealsLogged > 0 ? `${cell.summary.mealsLogged}/5 bloques` : 'Vacío'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SECCIÓN 2: CUADROS EN CASCADA (CON COLORES DISTINTIVOS POR BLOQUE)
// ==========================================
function CascadeHabitsSection({
  darkMode,
  theme,
  habitSubView,
  setHabitSubView,
  records,
  getDaySummary,
  onSelectDayFromGrid
}) {
  const [weeksToShow] = useState(12);

  const cascadeWeeks = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const endOfCurrentWeek = addDays(today, diffToSunday);

    const totalDays = weeksToShow * 7;
    const startDay = addDays(endOfCurrentWeek, -(totalDays - 1));

    const weeks = [];
    for (let w = 0; w < weeksToShow; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const current = addDays(startDay, w * 7 + d);
        const key = formatDateKey(current);
        const isFuture = current > today;
        weekDays.push({
          date: current,
          key,
          isFuture,
          isToday: key === formatDateKey(today),
          monthName: MONTH_NAMES[current.getMonth()].slice(0, 3),
          summary: getDaySummary(key)
        });
      }
      weeks.push(weekDays);
    }
    return weeks;
  }, [weeksToShow, records]);

  return (
    <div className="space-y-5">
      {/* Sub-barra de vista Cascada / Semanal y Leyenda */}
      <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${theme.bgCard}`}>
        <div
          className={`flex items-center p-1 rounded-xl border ${
            darkMode ? 'bg-[#1f1f1f] border-[#363636]' : 'bg-[#eaf0ea] border-[#d2dfd2]'
          }`}
        >
          {[
            { id: 'cascada', label: 'Cuadros en Cascada' },
            { id: 'semanal', label: 'Vista Semanal por Bloque' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setHabitSubView(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                habitSubView === tab.id
                  ? 'bg-[#4ade80] text-[#092214] shadow-sm'
                  : `${theme.textMuted} hover:opacity-90`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3.5 h-3.5 rounded-[5px] bg-[#4ade80] inline-block" />
            Comida anotada
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3.5 h-3.5 rounded-[5px] bg-[#f87171] text-[#2b0909] font-black text-[10px] flex items-center justify-center">
              ✕
            </span>
            Tuvo síntomas
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3.5 h-3.5 rounded-[5px] bg-amber-500/20 border border-amber-400 text-amber-400 font-black text-[10px] flex items-center justify-center">
              —
            </span>
            Saltada
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-3.5 h-3.5 rounded-[5px] border ${
                darkMode ? 'bg-[#222222] border-[#3d3d3d]' : 'bg-[#ebefeb] border-[#cbd5cb]'
              }`}
            />
            Vacío
          </span>
        </div>
      </div>

      {/* ===================================================== */}
      {/* VISTA 1: MATRICES DE CUADROS EN CASCADA */}
      {/* ===================================================== */}
      {habitSubView === 'cascada' && (
        <div className="space-y-4">
          <CascadeCard
            darkMode={darkMode}
            theme={theme}
            title="Resumen General Diario (Todas las comidas)"
            subtitle="Verde = Día registrado sin malestar · Rojo con X = Día con síntomas · Vacío = Sin registro"
            icon={Activity}
            accentColor="#4ade80"
            cascadeWeeks={cascadeWeeks}
            getStatusForDay={(day) => {
              if (day.isFuture) return 'future';
              if (day.summary.hasAnySymptom) return 'symptom';
              if (day.summary.hasAnyMeal) return 'logged';
              return 'empty';
            }}
            onSelectDay={onSelectDayFromGrid}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MEAL_BLOCKS.map((block) => (
              <CascadeCard
                key={block.id}
                darkMode={darkMode}
                theme={theme}
                title={block.name}
                subtitle={`Horario habitual: ${block.defaultTime} hrs · Color propio del bloque`}
                icon={block.icon}
                accentColor={block.color}
                cascadeWeeks={cascadeWeeks}
                getStatusForDay={(day) => {
                  if (day.isFuture) return 'future';
                  const st = day.summary.blockStates[block.id];
                  if (st?.hasSymptom) return 'symptom';
                  if (st?.isSkipped) return 'skipped';
                  if (st?.logged) return 'logged';
                  return 'empty';
                }}
                onSelectDay={onSelectDayFromGrid}
              />
            ))}
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* VISTA 2: RUTINA SEMANAL POR BLOQUES CON SU COLOR */}
      {/* ===================================================== */}
      {habitSubView === 'semanal' && (
        <div className="space-y-3">
          {MEAL_BLOCKS.map((block) => {
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const d = addDays(new Date(), -(6 - i));
              const key = formatDateKey(d);
              const st = getDaySummary(key).blockStates[block.id];
              return {
                date: d,
                key,
                dayShort: DAY_NAMES_SHORT[d.getDay()],
                dayNum: d.getDate(),
                isToday: i === 6,
                st
              };
            });

            const completedWeek = last7Days.filter((d) => d.st?.logged).length;
            const skippedWeek = last7Days.filter((d) => d.st?.isSkipped).length;
            const symptomWeek = last7Days.filter((d) => d.st?.hasSymptom).length;
            const IconComp = block.icon;

            return (
              <div key={block.id} className={`p-4 rounded-3xl border ${theme.bgCard}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${block.color}25`, color: block.color }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{block.name}</h3>
                      <p className={`text-xs ${theme.textMuted}`}>
                        Últimos 7 días: <strong>{completedWeek}/7 anotados</strong>
                        {skippedWeek > 0 && (
                          <span className="ml-2 text-amber-400 font-bold">
                            · {skippedWeek} saltada(s)
                          </span>
                        )}
                        {symptomWeek > 0 && (
                          <span className="ml-2 text-[#f87171] font-bold">
                            · {symptomWeek} con síntomas (✕)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {last7Days.map((d) => {
                    const isLoggedNoSymptom = d.st?.logged && !d.st?.hasSymptom && !d.st?.isSkipped;
                    return (
                      <button
                        key={d.key}
                        onClick={() => onSelectDayFromGrid(d.key)}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span className={`text-[11px] font-semibold ${theme.textMuted}`}>
                          {d.dayShort} {d.dayNum}
                        </span>
                        <div
                          style={
                            isLoggedNoSymptom
                              ? { backgroundColor: block.color, borderColor: block.color, color: '#091912' }
                              : undefined
                          }
                          className={`w-full h-11 sm:h-12 rounded-2xl border flex items-center justify-center text-base font-black transition-all ${
                            d.st?.hasSymptom
                              ? 'bg-[#f87171] text-[#2b0909] border-[#fca5a5] shadow-md'
                              : d.st?.isSkipped
                              ? 'bg-amber-500/15 text-amber-400 border-amber-400/50'
                              : isLoggedNoSymptom
                              ? 'shadow-sm'
                              : darkMode
                              ? 'bg-[#222222] border-[#3a3a3a]'
                              : 'bg-[#eef3ee] border-[#cbd8cb]'
                          } ${d.isToday ? 'ring-2 ring-white/50' : ''}`}
                        >
                          {d.st?.hasSymptom ? '✕' : d.st?.isSkipped ? '—' : d.st?.logged ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// TARJETA INDIVIDUAL DE CUADROS EN CASCADA
// ==========================================
function CascadeCard({
  darkMode,
  theme,
  title,
  subtitle,
  icon: IconComp,
  accentColor = '#4ade80',
  cascadeWeeks,
  getStatusForDay,
  onSelectDay
}) {
  let totalLogged = 0;
  let totalSkipped = 0;
  let totalSymptoms = 0;

  cascadeWeeks.forEach((week) => {
    week.forEach((day) => {
      const status = getStatusForDay(day);
      if (status === 'logged') totalLogged++;
      if (status === 'skipped') totalSkipped++;
      if (status === 'symptom') {
        totalLogged++;
        totalSymptoms++;
      }
    });
  });

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border ${theme.bgCard}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            <IconComp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">{title}</h3>
            <p className={`text-xs ${theme.textMuted}`}>{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <span
            className="px-2.5 py-1 rounded-xl"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            ✓ {totalLogged} días
          </span>
          {totalSkipped > 0 && (
            <span className="px-2 py-1 rounded-xl bg-amber-500/20 text-amber-400">
              — {totalSkipped} saltada(s)
            </span>
          )}
          {totalSymptoms > 0 && (
            <span className="px-2.5 py-1 rounded-xl bg-[#f87171]/20 text-[#f87171]">
              ✕ {totalSymptoms} síntomas
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex items-start gap-1.5 min-w-full">
          <div className="grid grid-rows-7 gap-1.5 pr-1 text-[10px] font-bold opacity-60 pt-5">
            <span className="h-5 flex items-center">L</span>
            <span className="h-5 flex items-center">M</span>
            <span className="h-5 flex items-center">M</span>
            <span className="h-5 flex items-center">J</span>
            <span className="h-5 flex items-center">V</span>
            <span className="h-5 flex items-center">S</span>
            <span className="h-5 flex items-center">D</span>
          </div>

          <div className="flex gap-1.5 flex-1 justify-between">
            {cascadeWeeks.map((week, wIdx) => {
              const firstDay = week[0];
              const showMonthLabel = wIdx === 0 || firstDay.date.getDate() <= 7;

              return (
                <div key={wIdx} className="flex flex-col items-center">
                  <div className={`h-4 text-[10px] font-semibold mb-1 ${theme.textMuted}`}>
                    {showMonthLabel ? firstDay.monthName : ''}
                  </div>
                  <div className="grid grid-rows-7 gap-1.5">
                    {week.map((day) => {
                      const status = getStatusForDay(day);
                      const formattedLabel = `${day.date.getDate()} ${day.monthName}`;

                      if (status === 'future') {
                        return (
                          <div
                            key={day.key}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-[6px] opacity-15 border border-dashed border-gray-500"
                          />
                        );
                      }

                      return (
                        <button
                          key={day.key}
                          onClick={() => onSelectDay(day.key)}
                          style={
                            status === 'logged'
                              ? { backgroundColor: accentColor, color: '#091810' }
                              : undefined
                          }
                          title={`${formattedLabel}: ${
                            status === 'symptom'
                              ? 'Tuvo síntomas (Click para ver)'
                              : status === 'skipped'
                              ? 'Comida saltada (Ayuno)'
                              : status === 'logged'
                              ? 'Comida registrada'
                              : 'Sin registro'
                          }`}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-[6px] flex items-center justify-center text-[11px] font-black transition-transform hover:scale-125 ${
                            status === 'symptom'
                              ? 'bg-[#f87171] text-[#2b0909] shadow-sm'
                              : status === 'skipped'
                              ? 'bg-amber-500/20 border border-amber-400 text-amber-400'
                              : status === 'logged'
                              ? 'shadow-sm'
                              : darkMode
                              ? 'bg-[#222222] border border-[#383838] hover:border-[#4ade80]'
                              : 'bg-[#e9efe9] border border-[#cbd8cb] hover:border-[#16a34a]'
                          } ${day.isToday ? 'ring-2 ring-white' : ''}`}
                        >
                          {status === 'symptom' ? '✕' : status === 'skipped' ? '—' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SECCIÓN 3: PATRONES Y RESUMEN CLÍNICO PARA EL DOCTOR
// ==========================================
function PatternsMedicalSection({
  darkMode,
  theme,
  records,
  getDaySummary,
  onSelectDay,
  onOpenPhoto,
  onExportExcel
}) {
  const [filterSymptom, setFilterSymptom] = useState('TODOS');

  const clinicalInsights = useMemo(() => {
    const sortedDates = Object.keys(records).sort((a, b) => b.localeCompare(a));
    let totalDaysLogged = 0;
    let daysWithSymptoms = 0;
    let totalSymptomEpisodes = 0;
    let totalSkippedBlocks = 0;
    let symptomsRelatedToSkipping = 0;

    const symptomFreq = {};
    const blockSymptomCounts = {};
    MEAL_BLOCKS.forEach((b) => {
      blockSymptomCounts[b.id] = { name: b.name, count: 0, color: b.color };
    });

    const foodTriggerWords = {};
    const stopWords = new Set([
      'con', 'sin', 'del', 'las', 'los', 'una', 'uno', 'para', 'por', 'media', 'taza', 'vaso', 'pan', 'agua', 'comida', 'once'
    ]);

    const timelineEpisodes = [];

    sortedDates.forEach((dateKey) => {
      const summary = getDaySummary(dateKey);
      if (summary.hasAnyMeal) totalDaysLogged++;
      if (summary.hasAnySymptom) daysWithSymptoms++;
      totalSkippedBlocks += summary.skippedCount;

      const dayObj = records[dateKey];
      if (!dayObj) return;

      MEAL_BLOCKS.forEach((block, idx) => {
        const entry = dayObj[block.id];
        if (!entry?.hasSymptom) return;

        totalSymptomEpisodes++;
        blockSymptomCounts[block.id].count++;

        (entry.symptoms || []).forEach((sym) => {
          symptomFreq[sym] = (symptomFreq[sym] || 0) + 1;
        });

        const prevBlock = idx > 0 ? MEAL_BLOCKS[idx - 1] : null;
        const prevEntry = prevBlock ? dayObj[prevBlock.id] : null;
        const cameFromSkippedMeal = Boolean(entry.skipped || prevEntry?.skipped);
        if (cameFromSkippedMeal) {
          symptomsRelatedToSkipping++;
        }

        let previousMealInfo = null;
        if (prevBlock && prevEntry) {
          previousMealInfo = {
            blockName: prevBlock.name,
            time: prevEntry.time || prevBlock.defaultTime,
            skipped: Boolean(prevEntry.skipped),
            food: prevEntry.food || ''
          };
        }

        const rawText = `${entry.food || ''} ${prevEntry?.food || ''}`.toLowerCase();
        const words = rawText
          .replace(/[.,()/;:]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length >= 4 && !stopWords.has(w));

        const uniqueWordsInEpisode = new Set(words);
        uniqueWordsInEpisode.forEach((w) => {
          foodTriggerWords[w] = (foodTriggerWords[w] || 0) + 1;
        });

        timelineEpisodes.push({
          dateKey,
          dateObj: parseDateKey(dateKey),
          block,
          entry,
          cameFromSkippedMeal,
          previousMealInfo
        });
      });
    });

    const topSymptoms = Object.entries(symptomFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        pct: totalSymptomEpisodes > 0 ? Math.round((count / totalSymptomEpisodes) * 100) : 0
      }));

    const topBlocks = Object.values(blockSymptomCounts).sort((a, b) => b.count - a.count);

    const suspectedFoods = Object.entries(foodTriggerWords)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      totalDaysLogged,
      daysWithSymptoms,
      pctDaysWithSymptoms: totalDaysLogged > 0 ? Math.round((daysWithSymptoms / totalDaysLogged) * 100) : 0,
      totalSymptomEpisodes,
      totalSkippedBlocks,
      symptomsRelatedToSkipping,
      topSymptoms,
      topBlocks,
      suspectedFoods,
      timelineEpisodes
    };
  }, [records]);

  const filteredEpisodes = useMemo(() => {
    if (filterSymptom === 'TODOS') return clinicalInsights.timelineEpisodes;
    return clinicalInsights.timelineEpisodes.filter((ep) =>
      ep.entry.symptoms?.includes(filterSymptom)
    );
  }, [clinicalInsights, filterSymptom]);

  return (
    <div className="space-y-5">
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-3 ${theme.bgCard}`}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#4ade80]/15 text-[#4ade80] flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold">
              Patrones Clínicos y Resumen para el Médico
            </h2>
            <p className={`text-xs ${theme.textMuted}`}>
              Correlación automática entre comidas, horas de ayuno (comidas saltadas) y síntomas digestivos
            </p>
          </div>
        </div>

        <button
          onClick={onExportExcel}
          className="px-4 py-2 rounded-2xl bg-[#4ade80] text-[#092214] text-xs font-extrabold flex items-center gap-2 shadow-sm hover:opacity-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Reporte Médico (.xls)</span>
        </button>
      </div>

      {/* 4 KPIs Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`p-4 rounded-3xl border ${theme.bgCard}`}>
          <span className={`text-xs font-bold ${theme.textMuted}`}>Días Registrados</span>
          <p className="text-2xl sm:text-3xl font-black mt-1 text-[#4ade80]">
            {clinicalInsights.totalDaysLogged}
          </p>
          <span className={`text-[11px] ${theme.textMuted}`}>en el historial</span>
        </div>

        <div className={`p-4 rounded-3xl border ${theme.bgCard}`}>
          <span className={`text-xs font-bold ${theme.textMuted}`}>Días con Síntomas</span>
          <p className="text-2xl sm:text-3xl font-black mt-1 text-[#f87171]">
            {clinicalInsights.daysWithSymptoms}{' '}
            <span className="text-sm font-bold">({clinicalInsights.pctDaysWithSymptoms}%)</span>
          </p>
          <span className={`text-[11px] ${theme.textMuted}`}>
            {clinicalInsights.totalSymptomEpisodes} episodios en total
          </span>
        </div>

        <div className={`p-4 rounded-3xl border ${theme.bgCard}`}>
          <span className={`text-xs font-bold ${theme.textMuted}`}>Comidas Saltadas</span>
          <p className="text-2xl sm:text-3xl font-black mt-1 text-amber-400">
            {clinicalInsights.totalSkippedBlocks}
          </p>
          <span className={`text-[11px] ${theme.textMuted}`}>bloques sin comer (ayuno)</span>
        </div>

        <div className={`p-4 rounded-3xl border ${theme.bgCard}`}>
          <span className={`text-xs font-bold ${theme.textMuted}`}>Malestar tras Ayuno</span>
          <p className="text-2xl sm:text-3xl font-black mt-1 text-purple-400">
            {clinicalInsights.symptomsRelatedToSkipping}
          </p>
          <span className={`text-[11px] ${theme.textMuted}`}>episodios tras saltar comida</span>
        </div>
      </div>

      {/* Gráficos de Frecuencia de Síntomas y Horarios Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 sm:p-5 rounded-3xl border ${theme.bgCard}`}>
          <h3 className="text-sm sm:text-base font-extrabold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#f87171]" />
            Síntomas Más Frecuentes
          </h3>

          {clinicalInsights.topSymptoms.length === 0 ? (
            <p className={`text-xs ${theme.textMuted}`}>Aún no hay síntomas registrados.</p>
          ) : (
            <div className="space-y-3">
              {clinicalInsights.topSymptoms.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{item.name}</span>
                    <span className="text-[#f87171]">
                      {item.count} veces ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-500/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#f87171]"
                      style={{ width: `${Math.max(item.pct, 8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className={`p-4 sm:p-5 rounded-3xl border ${theme.bgCard}`}>
            <h3 className="text-sm sm:text-base font-extrabold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4ade80]" />
              Horarios / Bloques con Más Síntomas
            </h3>
            <div className="space-y-2.5">
              {clinicalInsights.topBlocks.map((b) => (
                <div key={b.name} className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                    {b.name}
                  </span>
                  <span className="font-extrabold">
                    {b.count} {b.count === 1 ? 'episodio' : 'episodios'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-4 sm:p-5 rounded-3xl border ${theme.bgCard}`}>
            <h3 className="text-sm sm:text-base font-extrabold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Alimentos o Ingredientes Frecuentes en Episodios
            </h3>
            <p className={`text-xs mb-3 ${theme.textMuted}`}>
              Palabras que más se repiten cuando se reporta algún síntoma:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {clinicalInsights.suspectedFoods.length === 0 ? (
                <span className={`text-xs ${theme.textMuted}`}>Sin suficientes datos aún</span>
              ) : (
                clinicalInsights.suspectedFoods.map(([word, count]) => (
                  <span
                    key={word}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 capitalize"
                  >
                    {word} ({count})
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bitácora Cronológica Detallada para Revisión Médica */}
      <div className={`p-4 sm:p-6 rounded-3xl border ${theme.bgCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold">
              Historial Cronológico de Episodios
            </h3>
            <p className={`text-xs ${theme.textMuted}`}>
              Muestra qué comió en ese bloque y si venía de saltar la comida anterior
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#4ade80]" />
            <select
              value={filterSymptom}
              onChange={(e) => setFilterSymptom(e.target.value)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${theme.bgCardSubtle}`}
            >
              <option value="TODOS">Todos los síntomas ({clinicalInsights.timelineEpisodes.length})</option>
              {SYMPTOM_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredEpisodes.length === 0 ? (
          <p className={`text-center py-8 text-sm ${theme.textMuted}`}>
            No hay episodios registrados para este filtro.
          </p>
        ) : (
          <div className="space-y-3.5">
            {filteredEpisodes.map((item, idx) => (
              <div
                key={`${item.dateKey}-${item.block.id}-${idx}`}
                className={`p-4 rounded-2xl border ${theme.bgCardSubtle}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold">
                      {DAY_NAMES_FULL[item.dateObj.getDay()]} {item.dateObj.getDate()} de{' '}
                      {MONTH_NAMES[item.dateObj.getMonth()]}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${item.block.color}25`, color: item.block.color }}
                    >
                      {item.block.name} ({item.entry.time || item.block.defaultTime})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#f87171]/20 text-[#f87171]">
                      Severidad: {item.entry.severity || 'Moderado'}
                    </span>
                    {item.cameFromSkippedMeal && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        ⚠️ Horas sin comer / Comida saltada
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectDay(item.dateKey)}
                    className="text-xs font-bold text-[#4ade80] hover:underline"
                  >
                    Ver día en Agenda →
                  </button>
                </div>

                {item.entry.symptoms?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {item.entry.symptoms.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-0.5 rounded-lg bg-[#f87171] text-[#2b0909] text-xs font-extrabold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className={`p-2.5 rounded-xl border mb-2 ${theme.border}`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#4ade80]">
                    🍽️ Registro en {item.block.name}:
                  </div>
                  <p className="text-xs sm:text-sm font-medium mt-0.5">
                    {item.entry.skipped
                      ? '— COMIDA SALTADA (No comió en este bloque)'
                      : item.entry.food || 'Sin detalle de comida'}
                  </p>
                  {item.entry.photo && (
                    <button
                      onClick={() =>
                        onOpenPhoto({
                          dateKey: item.dateKey,
                          blockId: item.block.id,
                          blockName: item.block.name,
                          photo: item.entry.photo,
                          food: item.entry.food,
                          time: item.entry.time || item.block.defaultTime
                        })
                      }
                      className="mt-1.5 text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" /> 📷 Ver foto adjunta
                    </button>
                  )}
                </div>

                {item.previousMealInfo && (
                  <div className={`p-2.5 rounded-xl border mb-2 opacity-85 ${theme.border}`}>
                    <div className={`text-[11px] font-bold uppercase ${theme.textMuted}`}>
                      ⏪ Bloque anterior ({item.previousMealInfo.blockName} - {item.previousMealInfo.time}):
                    </div>
                    <p className="text-xs mt-0.5">
                      {item.previousMealInfo.skipped
                        ? '— SALTÓ ESTA COMIDA (Pasó varias horas sin comer antes del síntoma)'
                        : item.previousMealInfo.food || 'No registrado'}
                    </p>
                  </div>
                )}

                {(item.entry.onset || item.entry.symptomNotes) && (
                  <p className="text-xs sm:text-sm text-[#f87171] font-medium mt-1">
                    Nota: {item.entry.onset ? `[${item.entry.onset}] ` : ''}
                    {item.entry.symptomNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MODAL EDITOR DE BLOQUE DE COMIDA + SÍNTOMAS
// ==========================================
function BlockEditorModal({
  darkMode,
  theme,
  dateKey,
  blockId,
  openWithSymptom,
  existingData,
  onClose,
  onSave,
  onDelete
}) {
  const blockInfo = MEAL_BLOCKS.find((b) => b.id === blockId) || MEAL_BLOCKS[0];
  const dateObj = parseDateKey(dateKey);
  const fileInputRef = useRef(null);

  const [time, setTime] = useState(existingData?.time || blockInfo.defaultTime);
  const [food, setFood] = useState(existingData?.food || '');
  const [skipped, setSkipped] = useState(Boolean(existingData?.skipped));
  const [photo, setPhoto] = useState(existingData?.photo || '');
  const [hasSymptom, setHasSymptom] = useState(
    Boolean(existingData?.hasSymptom || openWithSymptom)
  );
  const [symptoms, setSymptoms] = useState(existingData?.symptoms || []);
  const [severity, setSeverity] = useState(existingData?.severity || 'Moderado');
  const [onset, setOnset] = useState(existingData?.onset || '30 min después');
  const [symptomNotes, setSymptomNotes] = useState(existingData?.symptomNotes || '');
  const [isCompressing, setIsCompressing] = useState(false);

  const toggleSymptomTag = (tag) => {
    setSymptoms((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressing(true);
    try {
      const base64 = await compressImageToBase64(file);
      setPhoto(base64);
      setSkipped(false);
    } catch (err) {
      console.error('Error procesando imagen:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dateKey, blockId, {
      time,
      food: skipped ? '' : food,
      skipped,
      photo: skipped ? '' : photo,
      hasSymptom,
      symptoms: hasSymptom ? symptoms : [],
      severity: hasSymptom ? severity : 'Leve',
      onset: hasSymptom ? onset : '',
      symptomNotes: hasSymptom ? symptomNotes : ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border p-5 sm:p-6 max-h-[92vh] overflow-y-auto ${theme.bgCard}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4ade80]">
              {DAY_NAMES_FULL[dateObj.getDay()]} {dateObj.getDate()} de {MONTH_NAMES[dateObj.getMonth()]}
            </span>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: blockInfo.color }} />
              {blockInfo.name}
            </h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full ${theme.pillBg}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4ade80]" />
              <label className="text-xs font-bold">Hora:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${theme.bgCardSubtle}`}
              />
            </div>

            <button
              type="button"
              onClick={() => setSkipped(!skipped)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                skipped
                  ? 'bg-amber-500 text-[#241600] border-amber-300 shadow-sm'
                  : `${theme.bgCardSubtle} hover:border-amber-400`
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{skipped ? 'Comida saltada (No comió)' : 'Marcar comida saltada'}</span>
            </button>
          </div>

          {!skipped ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    ¿Qué comió o tomó en {blockInfo.name}?
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isCompressing ? 'Procesando...' : photo ? 'Cambiar foto' : 'Subir foto'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={food}
                  onChange={(e) => setFood(e.target.value)}
                  placeholder={blockInfo.placeholder}
                  className={`w-full p-3.5 rounded-2xl border text-sm sm:text-base focus:outline-none focus:border-[#4ade80] ${theme.bgCardSubtle}`}
                />
              </div>

              {photo && (
                <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${theme.bgCardSubtle}`}>
                  <div className="flex items-center gap-3">
                    <img
                      src={photo}
                      alt="Vista previa"
                      className="w-14 h-14 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-xs font-bold text-sky-400">📷 Foto adjunta lista</p>
                      <p className={`text-[11px] ${theme.textMuted}`}>
                        Se verá como texto desplegable en la agenda.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhoto('')}
                    className="p-2 rounded-xl text-[#f87171] hover:bg-[#f87171]/15"
                    title="Quitar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs sm:text-sm font-medium">
              <strong>— Comida marcada como saltada:</strong> Esto permite distinguir que este día pasó varias horas
              sin comer (y que no fue un olvido de anotar).
            </div>
          )}

          <div
            className={`p-4 rounded-2xl border transition-all ${
              hasSymptom
                ? darkMode
                  ? 'bg-[#351e1e] border-[#f87171]'
                  : 'bg-[#fff1f2] border-[#f87171]'
                : theme.bgCardSubtle
            }`}
          >
            <div
              onClick={() => setHasSymptom(!hasSymptom)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                    hasSymptom ? 'bg-[#f87171] text-[#2b0909]' : 'bg-gray-500/20'
                  }`}
                >
                  ✕
                </span>
                <div>
                  <h4 className="text-sm font-extrabold">¿Tuvo algún síntoma o malestar estomacal?</h4>
                  <p className={`text-[11px] ${theme.textMuted}`}>
                    Márcalo aquí para saber si ocurrió después de este bloque
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasSymptom(!hasSymptom);
                }}
                title={hasSymptom ? 'Quitar registro de síntoma' : 'Agregar síntoma'}
                className={`w-10 h-10 rounded-xl font-black text-lg flex items-center justify-center transition-all shrink-0 ${
                  hasSymptom
                    ? 'bg-[#f87171] text-[#2b0909] shadow-md'
                    : darkMode
                    ? 'bg-[#383838] text-white hover:bg-[#4ade80] hover:text-[#092214]'
                    : 'bg-gray-200 text-gray-800 hover:bg-[#4ade80]'
                }`}
              >
                {hasSymptom ? <Minus className="w-5 h-5 stroke-[3]" /> : <Plus className="w-5 h-5 stroke-[3]" />}
              </button>
            </div>

            {hasSymptom && (
              <div className="mt-4 space-y-3 pt-3 border-t border-[#f87171]/30">
                <div>
                  <label className="block text-xs font-bold mb-1.5">Selecciona los síntomas:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SYMPTOM_TAGS.map((tag) => {
                      const active = symptoms.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleSymptomTag(tag)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            active
                              ? 'bg-[#f87171] text-[#2b0909] border-[#fca5a5] shadow-sm'
                              : darkMode
                              ? 'bg-[#261717] border-[#5c3030] text-red-200'
                              : 'bg-white border-red-200 text-red-900'
                          }`}
                        >
                          {active ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Intensidad del malestar:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Leve', 'Moderado', 'Fuerte'].map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setSeverity(sev)}
                          className={`py-1.5 rounded-xl text-xs font-bold border ${
                            severity === sev
                              ? 'bg-[#f87171] text-[#2b0909] border-white/40'
                              : 'opacity-70 border-red-400/30'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">¿Cuándo empezó?</label>
                    <select
                      value={onset}
                      onChange={(e) => setOnset(e.target.value)}
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        darkMode ? 'bg-[#261717] border-[#5c3030] text-white' : 'bg-white border-red-300 text-red-950'
                      }`}
                    >
                      {ONSET_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">
                    Detalles adicionales del malestar (opcional):
                  </label>
                  <input
                    type="text"
                    value={symptomNotes}
                    onChange={(e) => setSymptomNotes(e.target.value)}
                    placeholder="Ej: Dolor en el esófago al tragar, o molestia por pasar horas sin comer..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs sm:text-sm ${
                      darkMode ? 'bg-[#261717] border-[#5c3030] text-white' : 'bg-white border-red-300'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {existingData && (
              <button
                type="button"
                onClick={() => onDelete(dateKey, blockId)}
                className="px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#f87171] hover:bg-[#f87171]/15 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Borrar</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold ${theme.pillBg}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-[#4ade80] text-[#092214] shadow-lg hover:opacity-95"
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// MODAL LIGHTBOX PARA VISUALIZAR LA FOTO
// ==========================================
function PhotoLightboxModal({ darkMode, theme, data, onClose, onEditBlock }) {
  const dateObj = parseDateKey(data.dateKey);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl ${theme.bgCard}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-500/20">
          <div>
            <span className="text-xs font-bold text-[#4ade80]">
              {DAY_NAMES_FULL[dateObj.getDay()]} {dateObj.getDate()} de {MONTH_NAMES[dateObj.getMonth()]} · {data.time}
            </span>
            <h3 className="text-base font-extrabold">{data.blockName}</h3>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full ${theme.pillBg}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
          <img src={data.photo} alt={data.blockName} className="w-full h-auto max-h-[60vh] object-contain" />
        </div>

        <div className="p-4 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm font-medium flex-1">{data.food || 'Foto registrada en este bloque'}</p>
          <button
            onClick={onEditBlock}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#4ade80] text-[#092214] shrink-0"
          >
            Editar bloque
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODAL DE INSTRUCCIONES PARA INSTALAR LA WEBAPP (PWA)
// ==========================================
function InstallPwaModal({ darkMode, theme, deferredInstallPrompt, onInstallClick, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border p-5 sm:p-6 ${theme.bgCard}`}>
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4ade80]/15 text-[#4ade80] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Instalar Agenda Comidas</h3>
              <p className={`text-xs ${theme.textMuted}`}>Ábrela directo desde la pantalla de inicio</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full ${theme.pillBg}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 mt-4 text-xs sm:text-sm">
          {deferredInstallPrompt && (
            <button
              onClick={onInstallClick}
              className="w-full py-3 rounded-2xl bg-[#4ade80] text-[#092214] font-extrabold text-sm shadow-md"
            >
              📲 Instalar Ahora en este Dispositivo
            </button>
          )}

          <div className={`p-3.5 rounded-2xl border ${theme.bgCardSubtle}`}>
            <p className="font-extrabold text-[#4ade80] mb-1">🤖 En Celular Android (Chrome):</p>
            <p className={theme.textMuted}>
              Toca el menú de <strong>3 puntos (⋮)</strong> arriba a la derecha y selecciona{' '}
              <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
            </p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${theme.bgCardSubtle}`}>
            <p className="font-extrabold text-sky-400 mb-1 flex items-center gap-1.5">
              <Share className="w-4 h-4" /> En iPhone / iPad (Safari):
            </p>
            <p className={theme.textMuted}>
              Toca el botón <strong>Compartir</strong> en la barra inferior de Safari y elige{' '}
              <strong>"Agregar a Inicio"</strong>.
            </p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${theme.bgCardSubtle}`}>
            <p className="font-extrabold text-amber-400 mb-1">💻 En Computador (Chrome / Edge):</p>
            <p className={theme.textMuted}>
              Haz clic en el ícono de <strong>Instalar (+)</strong> que aparece en el lado derecho de la barra de
              direcciones.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-[#4ade80] text-[#092214] font-extrabold text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODAL DE RECORDATORIO AL FINAL DEL DÍA
// ==========================================
function ReminderSettingsModal({ darkMode, theme, reminderConfig, setReminderConfig, onClose, showToast }) {
  const requestBrowserNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showToast('Tu navegador usa el recordatorio visual integrado dentro de la app.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      new Notification('¡Recordatorio Activado!', {
        body: `Te avisaremos a las ${reminderConfig.time} hrs si falta registrar alguna comida del día.`
      });
      showToast('Notificaciones del celular/computador activadas');
    } else {
      showToast('Se usará el aviso visual en la parte superior de la aplicación');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border p-5 sm:p-6 ${theme.bgCard}`}>
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4ade80]/15 text-[#4ade80] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Recordatorio al Final del Día</h3>
              <p className={`text-xs ${theme.textMuted}`}>Para no olvidar anotar ninguna comida</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full ${theme.pillBg}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-4">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${theme.bgCardSubtle}`}>
            <div>
              <p className="text-sm font-bold">Activar recordatorio diario</p>
              <p className={`text-xs ${theme.textMuted}`}>
                Muestra alerta si quedan bloques vacíos en el día
              </p>
            </div>
            <button
              onClick={() => setReminderConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold ${
                reminderConfig.enabled ? 'bg-[#4ade80] text-[#092214]' : 'bg-gray-500/30'
              }`}
            >
              {reminderConfig.enabled ? 'ACTIVO' : 'APAGADO'}
            </button>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${theme.bgCardSubtle}`}>
            <label className="text-sm font-bold">Hora del recordatorio nocturno:</label>
            <input
              type="time"
              value={reminderConfig.time}
              onChange={(e) => setReminderConfig((prev) => ({ ...prev, time: e.target.value }))}
              className={`px-3 py-1.5 rounded-xl border text-sm font-bold ${theme.bgCard}`}
            />
          </div>

          <button
            onClick={requestBrowserNotificationPermission}
            className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${theme.bgCardSubtle} hover:border-[#4ade80]`}
          >
            <Bell className="w-4 h-4 text-[#4ade80]" />
            <span>Probar aviso / Activar notificación del dispositivo</span>
          </button>

          <button
            onClick={() => {
              showToast('Recordatorio guardado');
              onClose();
            }}
            className="w-full py-2.5 rounded-2xl bg-[#4ade80] text-[#092214] font-extrabold text-sm"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MODAL DE BACKUP (EXCEL CSV / XLS Y JSON)
// ==========================================
function BackupModal({
  darkMode,
  theme,
  onClose,
  onExportCSV,
  onExportXLS,
  onExportJSON,
  onImportFile,
  onResetDemo,
  onClearAll
}) {
  const importInputRef = useRef(null);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-lg rounded-3xl border p-5 sm:p-6 ${theme.bgCard}`}>
        <div className="flex items-center justify-between pb-3 border-b border-gray-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4ade80]/15 text-[#4ade80] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold">Respaldo y Exportación a Excel</h3>
              <p className={`text-xs ${theme.textMuted}`}>
                Guarda o comparte el historial médico de comidas y síntomas
              </p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full ${theme.pillBg}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mt-4">
          <button
            onClick={onExportXLS}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${theme.bgCardSubtle} hover:border-[#4ade80]`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-[#4ade80] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold">Descargar Tabla Excel con Colores (.xls)</p>
                <p className={`text-xs ${theme.textMuted}`}>
                  Ideal para mostrar al médico: resalta en rojo las filas con síntomas
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-[#4ade80] shrink-0" />
          </button>

          <button
            onClick={onExportCSV}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${theme.bgCardSubtle} hover:border-[#4ade80]`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold">Exportar Planilla Excel / Google Sheets (.csv)</p>
                <p className={`text-xs ${theme.textMuted}`}>
                  Archivo ligero compatible con cualquier hoja de cálculo
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-sky-400 shrink-0" />
          </button>

          <button
            onClick={onExportJSON}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${theme.bgCardSubtle} hover:border-[#4ade80]`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold">Respaldo Completo con Fotos (.json)</p>
                <p className={`text-xs ${theme.textMuted}`}>
                  Guarda absolutamente todo (notas, síntomas y fotografías) para pasar del celular al PC
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-amber-400 shrink-0" />
          </button>

          <div className="pt-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".json,.csv"
              onChange={onImportFile}
              className="hidden"
            />
            <button
              onClick={() => importInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#4ade80]/50 hover:border-[#4ade80] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 text-[#4ade80]"
            >
              <Upload className="w-4 h-4" />
              <span>Importar / Restaurar archivo de respaldo (.json o .csv)</span>
            </button>
          </div>

          <div className={`pt-3 mt-2 border-t ${theme.border} flex flex-wrap items-center justify-between gap-2`}>
            <button
              onClick={onResetDemo}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${theme.pillBg}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cargar datos de ejemplo</span>
            </button>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#f87171] hover:bg-[#f87171]/15"
              >
                Vaciar todos los datos
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#f87171] font-bold">¿Seguro?</span>
                <button
                  onClick={onClearAll}
                  className="px-2.5 py-1 rounded-lg bg-[#f87171] text-[#2b0909] text-xs font-extrabold"
                >
                  Sí, borrar todo
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 rounded-lg text-xs opacity-75"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}