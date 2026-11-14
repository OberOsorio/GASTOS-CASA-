/**
 * Control de Gastos de Construcción
 * Dark Glassmorphic Web App
 * State Management & Business Logic
 */

// Storage keys
const STORAGE_KEY = 'gastos_construccion_data_v1';
const AUTH_KEY = 'gastos_construccion_auth_v1';

// Default Admin Credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'cotorra2026';

// Categories Configuration
const CATEGORIES = {
  materiales: {
    id: 'materiales',
    name: 'Materiales',
    badgeClass: 'badge-materiales',
    color: '#00D2FF',
    icon: '🧱'
  },
  'mano-obra': {
    id: 'mano-obra',
    name: 'Mano de Obra',
    badgeClass: 'badge-mano-obra',
    color: '#10B981',
    icon: '👷'
  },
  herramientas: {
    id: 'herramientas',
    name: 'Herramientas',
    badgeClass: 'badge-herramientas',
    color: '#F59E0B',
    icon: '🔨'
  },
  varios: {
    id: 'varios',
    name: 'Gastos Varios',
    badgeClass: 'badge-varios',
    color: '#A855F7',
    icon: '📦'
  }
};

// State
let expenses = [];
let currentCategory = 'materiales';
let activeFilter = 'all';
let searchQuery = '';
let currentEditId = null;

// Currency Formatter
function formatMoney(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

// Format Date for display
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// Initial Mock Data (Realistic Construction Expenses)
const INITIAL_DEMO_EXPENSES = [
  {
    id: 'gasto-1',
    categoria: 'materiales',
    descripcion: 'Cemento Argos Gris Uso General (x 60 bultos)',
    cantidad: 60,
    unidad: 'bultos',
    costoUnitario: 32000,
    costoTotal: 1920000,
    fecha: '2026-11-10',
    responsable: 'Ferretería El Progreso'
  },
  {
    id: 'gasto-2',
    categoria: 'materiales',
    descripcion: 'Arena de río lavada (Viaje de volqueta 6m³)',
    cantidad: 2,
    unidad: 'viajes',
    costoUnitario: 280000,
    costoTotal: 560000,
    fecha: '2026-11-11',
    responsable: 'Arenera San José'
  },
  {
    id: 'gasto-3',
    categoria: 'mano-obra',
    descripcion: 'Pago semanal Maestro Juan y 2 ayudantes (Semana 1 fundición)',
    cantidad: 1,
    unidad: 'global',
    costoUnitario: 1450000,
    costoTotal: 1450000,
    fecha: '2026-11-12',
    responsable: 'Maestro Juan Pérez'
  },
  {
    id: 'gasto-4',
    categoria: 'herramientas',
    descripcion: 'Alquiler de Mezcladora de trompo eléctrica (7 días)',
    cantidad: 7,
    unidad: 'días',
    costoUnitario: 45000,
    costoTotal: 315000,
    fecha: '2026-11-09',
    responsable: 'Alquileres & Andamios del Norte'
  },
  {
    id: 'gasto-5',
    categoria: 'materiales',
    descripcion: 'Varilla corrugada 1/2 pulgada x 6m (Acero estructural)',
    cantidad: 45,
    unidad: 'unidades',
    costoUnitario: 42000,
    costoTotal: 1890000,
    fecha: '2026-11-08',
    responsable: 'Distribuidora Siderúrgica'
  },
  {
    id: 'gasto-6',
    categoria: 'varios',
    descripcion: 'Acometida provisional de energía y medidor temporal',
    cantidad: 1,
    unidad: 'global',
    costoUnitario: 220000,
    costoTotal: 220000,
    fecha: '2026-11-07',
    responsable: 'Electricista Autorizado'
  }
];

// Initialize LocalStorage Data
function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      expenses = JSON.parse(raw);
    } else {
      expenses = [...INITIAL_DEMO_EXPENSES];
      saveExpenses();
    }
  } catch (e) {
    console.error('Error loading expenses:', e);
    expenses = [...INITIAL_DEMO_EXPENSES];
  }
}

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses:', e);
  }
}

// Authentication Check
function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

function setAuthenticated(status) {
  if (status) {
    sessionStorage.setItem(AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(AUTH_KEY);
  }
}

// Audio Feedback / Haptic Microinteraction
function playMicroClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Audio context may be restricted by browser policy before user gesture
  }
}

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const icon = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `
    <div style="flex-shrink:0;">${icon}</div>
    <div style="font-size:14px; font-weight:600; color:#F1F5F9;">${message}</div>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  playMicroClick();

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// Construction Catalog by Category (Dynamic Dropdown Options)
const CATALOGO_OBRA = {
  materiales: [
    { label: '🧱 Cemento Gris (Bulto 50kg)', unit: 'bultos' },
    { label: '🚛 Arena de Río Lavada', unit: 'm³' },
    { label: '🪨 Gravilla / Triturado', unit: 'm³' },
    { label: '🔩 Varilla Corrugada 1/2"', unit: 'unidades' },
    { label: '🔩 Varilla Corrugada 3/8"', unit: 'unidades' },
    { label: '🧱 Ladrillo Tolete / Bloque N°4', unit: 'unidades' },
    { label: '⛓️ Alambre Recocido / Puntillas', unit: 'kg' },
    { label: '🕸️ Malla Electrosoldada', unit: 'unidades' },
    { label: '🚰 Tubería y Accesorios PVC', unit: 'unidades' },
    { label: '⚡ Cableado y Material Eléctrico', unit: 'metros' },
    { label: '🎨 Estuco, Pintura y Acabados', unit: 'galones' },
    { label: '🪵 Madera / Tabla / Guadua', unit: 'unidades' },
    { label: '✨ Cerámica / Porcelanato / Pegante', unit: 'm²' },
    { label: '💧 Impermeabilizante / Aditivos', unit: 'galones' },
    { label: '__custom__', text: '✍️ Otro material (Especificar)...', unit: 'unidades' }
  ],
  'mano-obra': [
    { label: '👷 Pago Semanal Maestro de Obra', unit: 'semanas' },
    { label: '👷‍♂️ Jornal Diario Ayudante / Oficial', unit: 'días' },
    { label: '🧱 Mano de Obra Mampostería y Pañete', unit: 'global' },
    { label: '🏗️ Mano de Obra Estructura / Fundición', unit: 'global' },
    { label: '⚡ Instalaciones Eléctricas (Mano de Obra)', unit: 'global' },
    { label: '🚰 Instalaciones Hidrosanitarias (Plomería)', unit: 'global' },
    { label: '🎨 Mano de Obra Estuco, Pintura y Enchape', unit: 'global' },
    { label: '🏠 Instalación de Cubierta / Techo', unit: 'global' },
    { label: '__custom__', text: '✍️ Otro pago de mano de obra (Especificar)...', unit: 'global' }
  ],
  herramientas: [
    { label: '🔄 Alquiler de Mezcladora (Trompo)', unit: 'días' },
    { label: '🪜 Alquiler de Andamios y Tableros', unit: 'días' },
    { label: '🔨 Compra de Herramienta Menor (Palas, Picas)', unit: 'unidades' },
    { label: '⚙️ Discos de Corte, Brocas y Pulidora', unit: 'unidades' },
    { label: '🛒 Carretilla Buggy de Obra', unit: 'unidades' },
    { label: '⚡ Alquiler de Rana Compactadora / Vibrador', unit: 'días' },
    { label: '__custom__', text: '✍️ Otra herramienta o equipo (Especificar)...', unit: 'unidades' }
  ],
  varios: [
    { label: '🚚 Flete / Transporte de Materiales', unit: 'viajes' },
    { label: '⚡ Pago de Servicios Provisionales (Agua / Luz)', unit: 'global' },
    { label: '📄 Licencias, Planos y Trámites', unit: 'global' },
    { label: '🗑️ Retiro de Escombros (Volqueta)', unit: 'viajes' },
    { label: '🥤 Refrigerios e Hidratación Personal', unit: 'global' },
    { label: '🔒 Seguridad y Cerramiento de Obra', unit: 'global' },
    { label: '__custom__', text: '✍️ Otro gasto vario (Especificar)...', unit: 'global' }
  ]
};

// Populate Concepto Select based on Category
function populateConceptoDropdown(catId) {
  const selectEl = document.getElementById('quickConceptoSelect');
  const unitEl = document.getElementById('quickUnidad');
  const customBox = document.getElementById('customConceptoBox');
  if (!selectEl) return;

  const list = CATALOGO_OBRA[catId] || CATALOGO_OBRA.materiales;
  selectEl.innerHTML = list.map((item, idx) => {
    const val = item.label === '__custom__' ? '__custom__' : item.label;
    const text = item.text || item.label;
    return `<option value="${escapeHtml(val)}" data-unit="${item.unit}" ${idx === 0 ? 'selected' : ''}>${escapeHtml(text)}</option>`;
  }).join('');

  // Auto-update unit to match first item
  if (unitEl && list[0]) {
    unitEl.value = list[0].unit;
  }
  if (customBox) {
    customBox.style.display = 'none';
  }
}

// Handle Category Dropdown Change
function handleQuickCategoryChange(catId) {
  currentCategory = catId;
  populateConceptoDropdown(catId);
  playMicroClick();
}

// Handle Concepto Dropdown Change
function handleQuickConceptoChange(val) {
  const selectEl = document.getElementById('quickConceptoSelect');
  const customBox = document.getElementById('customConceptoBox');
  const customInput = document.getElementById('quickDescripcionCustom');
  const unitEl = document.getElementById('quickUnidad');

  if (val === '__custom__') {
    if (customBox) customBox.style.display = 'block';
    if (customInput) customInput.focus();
  } else {
    if (customBox) customBox.style.display = 'none';
    // Set recommended unit from selected option
    if (selectEl && unitEl) {
      const selectedOpt = selectEl.options[selectEl.selectedIndex];
      const recommendedUnit = selectedOpt?.getAttribute('data-unit');
      if (recommendedUnit) unitEl.value = recommendedUnit;
    }
  }
  playMicroClick();
}

// Handle Proveedor Dropdown Change
function handleQuickProveedorChange(val) {
  const customBox = document.getElementById('customProveedorBox');
  const customInput = document.getElementById('quickResponsableCustom');
  if (val === '__custom__') {
    if (customBox) customBox.style.display = 'block';
    if (customInput) customInput.focus();
  } else {
    if (customBox) customBox.style.display = 'none';
  }
}

// Simplified Quick Amount Handling
let rawQuickAmount = 0;

function formatRawAmount(val) {
  if (!val || val <= 0) return '';
  return new Intl.NumberFormat('es-CO').format(val);
}

function updateQuickAmountFromInput() {
  const input = document.getElementById('quickMontoDisplay');
  const wordsEl = document.getElementById('quickMontoWords');
  const btnText = document.getElementById('quickSubmitBtnText');
  
  if (!input) return;

  // Strip all non-numeric characters
  const raw = input.value.replace(/\D/g, '');
  rawQuickAmount = raw ? parseInt(raw, 10) : 0;

  // Format with thousand dots
  if (rawQuickAmount > 0) {
    input.value = formatRawAmount(rawQuickAmount);
    if (wordsEl) {
      wordsEl.textContent = `Valor confirmado: ${formatMoney(rawQuickAmount)}`;
      wordsEl.style.color = 'var(--neon-cyan)';
    }
    if (btnText) {
      btnText.textContent = `Registrar Gasto (${formatMoney(rawQuickAmount)})`;
    }
  } else {
    input.value = '';
    if (wordsEl) {
      wordsEl.textContent = 'Toca aquí para ingresar el valor';
      wordsEl.style.color = 'var(--text-secondary)';
    }
    if (btnText) {
      btnText.textContent = 'Registrar Gasto';
    }
  }
}

// Toggle Optional Details Box
let detailsExpanded = false;
function toggleQuickDetails() {
  const box = document.getElementById('quickDetailsBox');
  const icon = document.getElementById('detailsToggleIcon');
  const text = document.getElementById('detailsToggleText');

  detailsExpanded = !detailsExpanded;
  if (box) {
    box.style.display = detailsExpanded ? 'flex' : 'none';
  }
  if (icon) {
    icon.textContent = detailsExpanded ? '▴' : '▾';
  }
  if (text) {
    text.textContent = detailsExpanded ? 'Ocultar opciones adicionales' : 'Opciones adicionales (Cantidad, Unidad, Proveedor, Fecha)';
  }
  playMicroClick();
}

// Update Today's Summary Banner on Hero
function updateTodaySummary() {
  const summaryEl = document.getElementById('quickTodaySummary');
  if (!summaryEl) return;

  const today = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.fecha === today);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.costoTotal || 0), 0);

  summaryEl.textContent = `Hoy: ${formatMoney(todayTotal)} (${todayExpenses.length})`;
}

// Edit Modal Total Calculation
function updateEditTotal() {
  const qtyInput = document.getElementById('editCantidad');
  const costInput = document.getElementById('editCostoUnitario');
  const totalDisplay = document.getElementById('editTotalDisplay');

  const qty = parseFloat(qtyInput?.value) || 0;
  const cost = parseFloat(costInput?.value) || 0;
  const total = qty * cost;

  if (totalDisplay) {
    totalDisplay.textContent = formatMoney(total);
  }
}

// Quick Register Form Submission (Professional Dropdown Driven)
function handleQuickRegister(e) {
  e.preventDefault();
  
  const monto = rawQuickAmount;
  if (!monto || monto <= 0) {
    showToast('Ingresa el monto total del gasto', 'error');
    document.getElementById('quickMontoDisplay')?.focus();
    return;
  }

  // Get selected category
  const catSelect = document.getElementById('quickCategoriaSelect');
  const categoria = catSelect ? catSelect.value : currentCategory;

  // Get selected material/concepto or custom input
  const conceptoSelect = document.getElementById('quickConceptoSelect');
  let descripcion = conceptoSelect ? conceptoSelect.value : '';
  // Remove leading emoji for clean record if desired, or keep it clean
  descripcion = descripcion.replace(/^[^\w\sÁÉÍÓÚáéíóúÑñ]+\s*/, '').trim();

  if (conceptoSelect && conceptoSelect.value === '__custom__') {
    const customDesc = (document.getElementById('quickDescripcionCustom')?.value || '').trim();
    if (!customDesc) {
      showToast('Especifica el nombre del material o gasto', 'error');
      document.getElementById('quickDescripcionCustom')?.focus();
      return;
    }
    descripcion = customDesc;
  }

  // Append optional extra note if provided
  const notaExtra = (document.getElementById('quickNotaExtra')?.value || '').trim();
  if (notaExtra) {
    descripcion = `${descripcion} (${notaExtra})`;
  }

  // Read optional details or apply smart defaults
  const today = new Date().toISOString().split('T')[0];
  const cantidad = parseFloat(document.getElementById('quickCantidad')?.value) || 1;
  const unidad = document.getElementById('quickUnidad')?.value || 'global';
  const fecha = document.getElementById('quickFecha')?.value || today;

  // Provider dropdown or custom
  const provSelect = document.getElementById('quickProveedorSelect');
  let responsable = provSelect ? provSelect.value : 'Ferretería General';
  if (responsable === '__custom__') {
    responsable = (document.getElementById('quickResponsableCustom')?.value || '').trim() || 'Obra';
  }

  const costoTotal = monto;
  const costoUnitario = cantidad > 0 ? Math.round(costoTotal / cantidad) : costoTotal;

  const newExpense = {
    id: 'gasto-' + Date.now(),
    categoria,
    descripcion,
    cantidad,
    unidad,
    costoUnitario,
    costoTotal,
    fecha,
    responsable
  };

  expenses.unshift(newExpense);
  saveExpenses();

  // Reset form cleanly
  rawQuickAmount = 0;
  const amountInput = document.getElementById('quickMontoDisplay');
  if (amountInput) amountInput.value = '';
  const customDescEl = document.getElementById('quickDescripcionCustom');
  if (customDescEl) customDescEl.value = '';
  const notaExtraEl = document.getElementById('quickNotaExtra');
  if (notaExtraEl) notaExtraEl.value = '';
  const customProvEl = document.getElementById('quickResponsableCustom');
  if (customProvEl) customProvEl.value = '';
  document.getElementById('quickCantidad').value = '1';
  populateConceptoDropdown(categoria);
  updateQuickAmountFromInput();

  showToast('✓ Gasto registrado correctamente', 'success');
  updateTodaySummary();
  renderQuickRecentList();
  renderAdminDashboard();
}

// Render Recent Expenses (3-5 items on Quick View)
function renderQuickRecentList() {
  const container = document.getElementById('quickRecentList');
  if (!container) return;

  const recent = expenses.slice(0, 4);
  if (recent.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 24px; color: var(--text-muted); font-size: 13px;">
        Aún no hay gastos registrados hoy.
      </div>
    `;
    return;
  }

  container.innerHTML = recent.map(item => {
    const cat = CATEGORIES[item.categoria] || CATEGORIES.varios;
    return `
      <div class="glass-card" style="padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div style="display:flex; align-items:center; gap: 12px; min-width: 0;">
          <div style="width:36px; height:36px; border-radius:10px; background:${cat.color}18; border:1px solid ${cat.color}33; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">
            ${cat.icon}
          </div>
          <div style="min-width: 0;">
            <div style="font-weight:600; font-size:14px; color:#F1F5F9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(item.descripcion)}
            </div>
            <div style="font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:8px;">
              <span>${formatDate(item.fecha)}</span>
              <span>•</span>
              <span style="color:${cat.color};">${cat.name}</span>
              <span>•</span>
              <span>${item.cantidad} ${item.unidad}</span>
            </div>
          </div>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div style="font-family:'JetBrains Mono',monospace; font-weight:700; font-size:15px; color:var(--neon-cyan);">
            ${formatMoney(item.costoTotal)}
          </div>
          <div style="font-size:11px; color:var(--text-muted);">
            ${escapeHtml(item.responsable)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Navigation flow control
function navigateTo(viewId) {
  const views = ['quickView', 'loginView', 'adminView'];
  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = 'none';
  });

  if (viewId === 'adminView') {
    if (!isAuthenticated()) {
      navigateTo('loginView');
      showToast('Inicia sesión para acceder al panel de control', 'error');
      return;
    }
  }

  const target = document.getElementById(viewId);
  if (target) {
    target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (viewId === 'adminView') {
    renderAdminDashboard();
  }
}

// Admin Authentication Form
function handleLogin(e) {
  e.preventDefault();
  const userInput = document.getElementById('loginUser').value.trim();
  const passInput = document.getElementById('loginPass').value.trim();

  if (userInput === ADMIN_USER && passInput === ADMIN_PASS) {
    setAuthenticated(true);
    document.getElementById('loginPass').value = '';
    showToast('Bienvenido al Panel de Administración');
    navigateTo('adminView');
  } else {
    showToast('Credenciales incorrectas. Prueba admin / cotorra2026', 'error');
  }
}

function handleLogout() {
  setAuthenticated(false);
  showToast('Sesión administrativa cerrada');
  navigateTo('quickView');
}

// Admin Dashboard KPIs and Visual Distribution
function renderAdminDashboard() {
  // Compute KPIs
  const totalAccumulated = expenses.reduce((acc, curr) => acc + (curr.costoTotal || 0), 0);
  
  const categoryTotals = {
    materiales: 0,
    'mano-obra': 0,
    herramientas: 0,
    varios: 0
  };

  expenses.forEach(item => {
    if (categoryTotals[item.categoria] !== undefined) {
      categoryTotals[item.categoria] += (item.costoTotal || 0);
    } else {
      categoryTotals.varios += (item.costoTotal || 0);
    }
  });

  // Update KPI DOM
  document.getElementById('kpiTotal').textContent = formatMoney(totalAccumulated);
  document.getElementById('kpiMateriales').textContent = formatMoney(categoryTotals.materiales);
  document.getElementById('kpiManoObra').textContent = formatMoney(categoryTotals['mano-obra']);
  document.getElementById('kpiHerramientas').textContent = formatMoney(categoryTotals.herramientas);
  document.getElementById('kpiVarios').textContent = formatMoney(categoryTotals.varios);
  
  // Percentages
  const pctMat = totalAccumulated > 0 ? ((categoryTotals.materiales / totalAccumulated) * 100).toFixed(1) : 0;
  const pctMo = totalAccumulated > 0 ? ((categoryTotals['mano-obra'] / totalAccumulated) * 100).toFixed(1) : 0;
  const pctHer = totalAccumulated > 0 ? ((categoryTotals.herramientas / totalAccumulated) * 100).toFixed(1) : 0;
  const pctVar = totalAccumulated > 0 ? ((categoryTotals.varios / totalAccumulated) * 100).toFixed(1) : 0;

  document.getElementById('pctMateriales').textContent = `${pctMat}%`;
  document.getElementById('pctManoObra').textContent = `${pctMo}%`;
  document.getElementById('pctHerramientas').textContent = `${pctHer}%`;
  document.getElementById('pctVarios').textContent = `${pctVar}%`;

  // Render Visual Distribution Bar
  renderDistributionBar(pctMat, pctMo, pctHer, pctVar);

  // Render SVG Donut Chart
  renderDonutChart(categoryTotals, totalAccumulated);

  // Render Table & List
  renderAdminTable();
}

function renderDistributionBar(m, mo, h, v) {
  const barContainer = document.getElementById('distProgressBar');
  if (!barContainer) return;

  barContainer.innerHTML = `
    <div style="width: ${m}%; background: var(--cat-materiales); height: 100%; transition: width 0.6s var(--ease-spring);" title="Materiales: ${m}%"></div>
    <div style="width: ${mo}%; background: var(--cat-mano-obra); height: 100%; transition: width 0.6s var(--ease-spring);" title="Mano de Obra: ${mo}%"></div>
    <div style="width: ${h}%; background: var(--cat-herramientas); height: 100%; transition: width 0.6s var(--ease-spring);" title="Herramientas: ${h}%"></div>
    <div style="width: ${v}%; background: var(--cat-varios); height: 100%; transition: width 0.6s var(--ease-spring);" title="Varios: ${v}%"></div>
  `;
}

function renderDonutChart(categoryTotals, total) {
  const chartEl = document.getElementById('donutChartContainer');
  if (!chartEl) return;

  if (total === 0) {
    chartEl.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 13px;">Sin datos para graficar</div>`;
    return;
  }

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const cats = [
    { key: 'materiales', name: 'Materiales', color: '#00D2FF', val: categoryTotals.materiales },
    { key: 'mano-obra', name: 'Mano de Obra', color: '#10B981', val: categoryTotals['mano-obra'] },
    { key: 'herramientas', name: 'Herramientas', color: '#F59E0B', val: categoryTotals.herramientas },
    { key: 'varios', name: 'Gastos Varios', color: '#A855F7', val: categoryTotals.varios }
  ];

  let circlesSvg = '';
  cats.forEach(c => {
    const fraction = c.val / total;
    const strokeDash = fraction * circumference;
    if (strokeDash > 0) {
      circlesSvg += `
        <circle cx="80" cy="80" r="${radius}" fill="none" stroke="${c.color}" stroke-width="16"
          stroke-dasharray="${strokeDash} ${circumference}"
          stroke-dashoffset="-${offset}"
          stroke-linecap="round"
          style="transition: stroke-dashoffset 0.6s var(--ease-spring);" />
      `;
      offset += strokeDash;
    }
  });

  chartEl.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:center; gap: 24px; flex-wrap:wrap;">
      <div style="position:relative; width:160px; height:160px; flex-shrink:0;">
        <svg width="160" height="160" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="16" />
          ${circlesSvg}
        </svg>
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
          <span style="font-size:11px; text-transform:uppercase; color:var(--text-muted); font-weight:700; letter-spacing:0.5px;">Registros</span>
          <span style="font-size:22px; font-weight:800; color:#FFFFFF; font-family:'JetBrains Mono',monospace;">${expenses.length}</span>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap: 8px; min-width: 170px;">
        ${cats.map(c => `
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:13px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="width:10px; height:10px; border-radius:3px; background:${c.color}; display:inline-block;"></span>
              <span style="color:var(--text-secondary);">${c.name}</span>
            </div>
            <span style="font-weight:700; font-family:'JetBrains Mono',monospace; color:#FFFFFF;">
              ${total > 0 ? ((c.val / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Filter and Search
function getFilteredExpenses() {
  let list = [...expenses];

  if (activeFilter !== 'all') {
    list = list.filter(item => item.categoria === activeFilter);
  }

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(item => 
      item.descripcion.toLowerCase().includes(q) ||
      (item.responsable && item.responsable.toLowerCase().includes(q)) ||
      (item.unidad && item.unidad.toLowerCase().includes(q)) ||
      item.fecha.includes(q)
    );
  }

  return list;
}

// Render Admin Table & Mobile Cards
function renderAdminTable() {
  const tableBody = document.getElementById('adminTableBody');
  const cardsContainer = document.getElementById('adminCardsContainer');
  const emptyState = document.getElementById('adminEmptyState');
  const countBadge = document.getElementById('filteredCountBadge');

  const filtered = getFilteredExpenses();

  if (countBadge) {
    countBadge.textContent = `${filtered.length} de ${expenses.length}`;
  }

  if (filtered.length === 0) {
    if (tableBody) tableBody.innerHTML = '';
    if (cardsContainer) cardsContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Desktop Table Rows
  if (tableBody) {
    tableBody.innerHTML = filtered.map(item => {
      const cat = CATEGORIES[item.categoria] || CATEGORIES.varios;
      return `
        <tr>
          <td style="font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--text-secondary);">
            ${formatDate(item.fecha)}
          </td>
          <td>
            <span class="badge ${cat.badgeClass}">${cat.name}</span>
          </td>
          <td>
            <div style="font-weight:600; color:#F1F5F9; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(item.descripcion)}">
              ${escapeHtml(item.descripcion)}
            </div>
            <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(item.responsable)}</div>
          </td>
          <td style="font-size:13px; color:var(--text-secondary);">
            ${item.cantidad} <span style="font-size:11px; color:var(--text-muted);">${item.unidad}</span>
          </td>
          <td style="font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--text-secondary);">
            ${formatMoney(item.costoUnitario)}
          </td>
          <td style="font-family:'JetBrains Mono',monospace; font-weight:700; font-size:14px; color:var(--neon-cyan);">
            ${formatMoney(item.costoTotal)}
          </td>
          <td style="text-align:right;">
            <div style="display:inline-flex; align-items:center; gap:6px;">
              <button class="btn-icon" onclick="openEditModal('${item.id}')" title="Editar gasto">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn-icon" onclick="confirmDeleteExpense('${item.id}')" title="Eliminar gasto" style="hover:border-color:#F43F5E;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Mobile Cards (Mobile-First responsive layout)
  if (cardsContainer) {
    cardsContainer.innerHTML = filtered.map(item => {
      const cat = CATEGORIES[item.categoria] || CATEGORIES.varios;
      return `
        <div class="glass-card" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span class="badge ${cat.badgeClass}">${cat.name}</span>
            <span style="font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--text-muted);">${formatDate(item.fecha)}</span>
          </div>

          <div>
            <div style="font-weight:700; font-size:15px; color:#F1F5F9; line-height:1.3;">
              ${escapeHtml(item.descripcion)}
            </div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">
              Resp: <span style="color:#FFFFFF; font-weight:500;">${escapeHtml(item.responsable)}</span>
            </div>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(0,0,0,0.25); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.04);">
            <div style="font-size:12px; color:var(--text-muted);">
              ${item.cantidad} ${item.unidad} × ${formatMoney(item.costoUnitario)}
            </div>
            <div style="font-family:'JetBrains Mono',monospace; font-weight:800; font-size:16px; color:var(--neon-cyan);">
              ${formatMoney(item.costoTotal)}
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
            <button class="btn-secondary" onclick="openEditModal('${item.id}')" style="padding:8px 14px; font-size:12px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Editar
            </button>
            <button class="btn-secondary" onclick="confirmDeleteExpense('${item.id}')" style="padding:8px 14px; font-size:12px; color:#F87171; border-color:rgba(248,113,113,0.3);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Eliminar
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Edit Modal Management
function openEditModal(id) {
  const item = expenses.find(e => e.id === id);
  if (!item) return;

  currentEditId = id;
  document.getElementById('editId').value = item.id;
  document.getElementById('editCategoria').value = item.categoria;
  document.getElementById('editDescripcion').value = item.descripcion;
  document.getElementById('editCantidad').value = item.cantidad;
  document.getElementById('editUnidad').value = item.unidad;
  document.getElementById('editCostoUnitario').value = item.costoUnitario;
  document.getElementById('editFecha').value = item.fecha;
  document.getElementById('editResponsable').value = item.responsable;

  updateEditTotal();
  document.getElementById('editModalOverlay').classList.add('active');
}

function closeEditModal() {
  document.getElementById('editModalOverlay').classList.remove('active');
  currentEditId = null;
}

function handleSaveEdit(e) {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const index = expenses.findIndex(x => x.id === id);
  if (index === -1) return;

  const categoria = document.getElementById('editCategoria').value;
  const descripcion = document.getElementById('editDescripcion').value.trim();
  const cantidad = parseFloat(document.getElementById('editCantidad').value) || 0;
  const unidad = document.getElementById('editUnidad').value;
  const costoUnitario = parseFloat(document.getElementById('editCostoUnitario').value) || 0;
  const fecha = document.getElementById('editFecha').value;
  const responsable = document.getElementById('editResponsable').value.trim();

  expenses[index] = {
    ...expenses[index],
    categoria,
    descripcion,
    cantidad,
    unidad,
    costoUnitario,
    costoTotal: cantidad * costoUnitario,
    fecha,
    responsable: responsable || 'Sin especificar'
  };

  saveExpenses();
  closeEditModal();
  renderAdminDashboard();
  renderQuickRecentList();
  showToast('Gasto actualizado correctamente');
}

// Delete Confirmation Modal
let pendingDeleteId = null;

function confirmDeleteExpense(id) {
  pendingDeleteId = id;
  const item = expenses.find(e => e.id === id);
  const textEl = document.getElementById('deleteModalDesc');
  if (textEl && item) {
    textEl.textContent = `"${item.descripcion}" (${formatMoney(item.costoTotal)})`;
  }
  document.getElementById('deleteModalOverlay').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModalOverlay').classList.remove('active');
  pendingDeleteId = null;
}

function executeDeleteExpense() {
  if (!pendingDeleteId) return;
  expenses = expenses.filter(e => e.id !== pendingDeleteId);
  saveExpenses();
  closeDeleteModal();
  renderAdminDashboard();
  renderQuickRecentList();
  showToast('Gasto eliminado');
}

// Professional Excel Export (.xlsx) using SheetJS
function exportToExcel() {
  if (!window.XLSX) {
    showToast('La librería de Excel no está lista aún', 'error');
    return;
  }

  const list = getFilteredExpenses();
  if (list.length === 0) {
    showToast('No hay registros disponibles para exportar', 'error');
    return;
  }

  // Build clean tabular data with headers
  const excelData = list.map((item, idx) => ({
    'N°': idx + 1,
    'Fecha': formatDate(item.fecha),
    'Categoría': (CATEGORIES[item.categoria] || {}).name || item.categoria,
    'Descripción del Gasto': item.descripcion,
    'Cantidad': item.cantidad,
    'Unidad': item.unidad,
    'Costo Unitario ($)': item.costoUnitario,
    'Costo Total ($)': item.costoTotal,
    'Responsable / Proveedor': item.responsable
  }));

  // Add Summary Total Row
  const totalAmount = list.reduce((sum, item) => sum + (item.costoTotal || 0), 0);
  excelData.push({
    'N°': '',
    'Fecha': '',
    'Categoría': 'TOTAL GENERAL',
    'Descripción del Gasto': `Total acumulado de ${list.length} registros`,
    'Cantidad': '',
    'Unidad': '',
    'Costo Unitario ($)': '',
    'Costo Total ($)': totalAmount,
    'Responsable / Proveedor': ''
  });

  // Create Worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for clean readability
  worksheet['!cols'] = [
    { wch: 5 },   // N°
    { wch: 12 },  // Fecha
    { wch: 16 },  // Categoría
    { wch: 38 },  // Descripción
    { wch: 10 },  // Cantidad
    { wch: 12 },  // Unidad
    { wch: 18 },  // Costo Unitario
    { wch: 18 },  // Costo Total
    { wch: 28 }   // Responsable
  ];

  // Create Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gastos de Construcción');

  // File naming with current date
  const today = new Date().toISOString().split('T')[0];
  const filename = `Gastos_Construccion_Casa_${today}.xlsx`;

  // Export file
  XLSX.writeFile(workbook, filename);
  showToast(`Archivo Excel exportado: ${filename}`);
}

// Reset / Load Demo Data
function loadDemoData() {
  expenses = [...INITIAL_DEMO_EXPENSES];
  saveExpenses();
  renderAdminDashboard();
  renderQuickRecentList();
  showToast('Datos de demostración cargados');
}

// Clear all data
function clearAllExpenses() {
  if (confirm('¿Estás seguro de que deseas eliminar TODOS los gastos registrados? Esta acción no se puede deshacer.')) {
    expenses = [];
    saveExpenses();
    renderAdminDashboard();
    renderQuickRecentList();
    showToast('Se han eliminado todos los registros');
  }
}

// Utility: Escape HTML for security
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  loadExpenses();

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  const quickDateInput = document.getElementById('quickFecha');
  if (quickDateInput) quickDateInput.value = today;

  // Initialize dynamic concept dropdown for default category ('materiales')
  populateConceptoDropdown('materiales');

  // Large Amount Input Formatting
  const amountInput = document.getElementById('quickMontoDisplay');
  if (amountInput) {
    amountInput.addEventListener('input', updateQuickAmountFromInput);
  }

  // Real-time calculation on Edit Modal
  const editQty = document.getElementById('editCantidad');
  const editCost = document.getElementById('editCostoUnitario');
  if (editQty) editQty.addEventListener('input', updateEditTotal);
  if (editCost) editCost.addEventListener('input', updateEditTotal);

  // Quick form submit
  const quickForm = document.getElementById('quickRegisterForm');
  if (quickForm) quickForm.addEventListener('submit', handleQuickRegister);

  // Login form submit
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Edit form submit
  const editForm = document.getElementById('editExpenseForm');
  if (editForm) editForm.addEventListener('submit', handleSaveEdit);

  // Search input in Admin
  const searchInput = document.getElementById('adminSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderAdminTable();
    });
  }

  // Filter Buttons in Admin
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      playMicroClick();
      renderAdminTable();
    });
  });

  // Render initial view & today's summary
  renderQuickRecentList();
  updateTodaySummary();

  // If already authenticated, show admin badge or state
  if (isAuthenticated()) {
    const adminPill = document.getElementById('adminStatusIndicator');
    if (adminPill) adminPill.style.display = 'inline-flex';
  }
});
