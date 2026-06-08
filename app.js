/**
 * app.js - POS Application Logic for Thanh Dat POS
 * Implements selling checkout flow, inventory management, reports, and settings.
 */

// Application State
const state = {
  currentTab: 'pos-tab',
  products: [],
  cart: [],
  holdCarts: [], // Stores hold invoices
  storeSettings: {
    name: 'Tạp Hóa Thành Đạt',
    address: 'Số 123 Đường Lý Thường Kiệt, P. 1, TP. Vũng Tàu',
    phone: '0901.234.567',
    footer: 'Cảm ơn quý khách! Hẹn gặp lại quý khách!',
    bankName: 'MB',
    bankAccount: '99999999999',
    bankOwner: 'NGUYEN VAN A',
    printerSize: '80',
    firebaseEnable: false,
    firebaseProjectId: '',
    firebaseApiKey: '',
    expiryAlertDays: 30
  },
  theme: 'light',
  selectedCategory: 'ALL'
};

// DOM Elements
const el = {
  // Navigation
  menuItems: document.querySelectorAll('.menu-item'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  tabTitle: document.getElementById('current-tab-title'),
  storeBanner: document.getElementById('store-banner-text'),
  btnToggleTheme: document.getElementById('btn-toggle-theme'),
  headerTime: document.getElementById('header-time'),
  headerDate: document.getElementById('header-date'),

  // POS Search & Categories
  posSearchInput: document.getElementById('pos-search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  posCategoryFilters: document.getElementById('pos-category-filters'),
  posProductsGrid: document.getElementById('pos-products-grid'),
  posProductsEmpty: document.getElementById('pos-products-empty'),
  btnAddProductQuick: document.getElementById('btn-add-product-quick'),

  // POS Cart
  cartTbody: document.getElementById('cart-tbody'),
  btnClearCart: document.getElementById('btn-clear-cart'),
  btnHoldCart: document.getElementById('btn-hold-cart'),
  btnRecallCart: document.getElementById('btn-recall-cart'),
  holdCount: document.getElementById('hold-count'),
  cartCustomerPhone: document.getElementById('cart-customer-phone'),
  cartCustomerName: document.getElementById('cart-customer-name'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartDiscountInput: document.getElementById('cart-discount-input'),
  cartDiscountType: document.getElementById('cart-discount-type'),
  cartTotal: document.getElementById('cart-total'),

  // POS Payment
  paymentCashGiven: document.getElementById('payment-cash-given'),
  btnClearCash: document.getElementById('btn-clear-cash'),
  fastCashButtons: document.getElementById('fast-cash-buttons'),
  paymentChangeBack: document.getElementById('payment-change-back'),
  paymentMethodRadios: document.getElementsByName('pay-method'),
  transferQrPreview: document.getElementById('transfer-qr-preview'),
  qrBankImageContainer: document.getElementById('qr-bank-image-container'),
  btnCheckoutPrint: document.getElementById('btn-checkout-print'),

  // Barcode status
  barcodeStatusText: document.querySelector('.barcode-status .status-text'),
  virtualBarcodeInput: document.getElementById('virtual-barcode-input'),
  btnScanSim: document.getElementById('btn-scan-sim'),

  // Inventory Tab
  inventorySearchInput: document.getElementById('inventory-search-input'),
  inventoryCategoryFilter: document.getElementById('inventory-category-filter'),
  btnOpenAddProduct: document.getElementById('btn-open-add-product'),
  btnExportProducts: document.getElementById('btn-export-products'),
  btnImportProductsTrigger: document.getElementById('btn-import-products-trigger'),
  inventoryImportFile: document.getElementById('inventory-import-file'),
  inventoryTbody: document.getElementById('inventory-tbody'),

  // Reports Tab
  reportTodayRevenue: document.getElementById('report-today-revenue'),
  reportTodayProfit: document.getElementById('report-today-profit'),
  reportTodayInvoices: document.getElementById('report-today-invoices'),
  reportTotalProductsCount: document.getElementById('report-total-products-count'),
  reportHistoryDate: document.getElementById('report-history-date'),
  btnClearDateFilter: document.getElementById('btn-clear-date-filter'),
  historyTbody: document.getElementById('history-tbody'),
  revenueChart: document.getElementById('revenueChart'),

  // Settings Tab
  settingsStoreForm: document.getElementById('settings-store-form'),
  setStoreName: document.getElementById('set-store-name'),
  setStoreAddress: document.getElementById('set-store-address'),
  setStorePhone: document.getElementById('set-store-phone'),
  setInvoiceFooter: document.getElementById('set-invoice-footer'),
  setBankName: document.getElementById('set-bank-name'),
  setBankAccount: document.getElementById('set-bank-account'),
  setBankOwner: document.getElementById('set-bank-owner'),
  setPrinterSize: document.getElementById('set-printer-size'),
  btnBackupDb: document.getElementById('btn-backup-db'),
  btnRestoreDbTrigger: document.getElementById('btn-restore-db-trigger'),
  dbRestoreFile: document.getElementById('db-restore-file'),
  btnLoadDemoData: document.getElementById('btn-load-demo-data'),
  btnResetDb: document.getElementById('btn-reset-db'),

  // Modals
  productModal: document.getElementById('product-modal'),
  productForm: document.getElementById('product-form'),
  modalProductTitle: document.getElementById('modal-product-title'),
  prodId: document.getElementById('prod-id'),
  prodName: document.getElementById('prod-name'),
  prodBarcode: document.getElementById('prod-barcode'),
  prodCategory: document.getElementById('prod-category'),
  prodUnit: document.getElementById('prod-unit'),
  prodStock: document.getElementById('prod-stock'),
  prodImportPrice: document.getElementById('prod-import-price'),
  prodPrice: document.getElementById('prod-price'),
  prodExpiry: document.getElementById('prod-expiry'),
  btnGenBarcode: document.getElementById('btn-gen-barcode'),
  btnCloseProductModal: document.getElementById('btn-close-product-modal'),
  btnCancelProductModal: document.getElementById('btn-cancel-product-modal'),

  invoiceDetailModal: document.getElementById('invoice-detail-modal'),
  invoiceModalContent: document.getElementById('invoice-modal-content'),
  btnPrintInvoiceHistory: document.getElementById('btn-print-invoice-history'),
  btnCloseInvoiceModal: document.getElementById('btn-close-invoice-modal'),
  btnCloseInvoiceModalFooter: document.getElementById('btn-close-invoice-modal-footer'),

  // Hold Carts Modal Elements
  holdCartsModal: document.getElementById('hold-carts-modal'),
  holdCartsList: document.getElementById('hold-carts-list'),
  btnCloseHoldModal: document.getElementById('btn-close-hold-modal'),
  btnCloseHoldModalFooter: document.getElementById('btn-close-hold-modal-footer'),

  // Camera Scanner Elements
  btnScanCamera: document.getElementById('btn-scan-camera'),
  cameraScannerModal: document.getElementById('camera-scanner-modal'),
  cameraReader: document.getElementById('camera-reader'),
  btnCloseScannerModal: document.getElementById('btn-close-scanner-modal'),
  btnCloseScannerModalFooter: document.getElementById('btn-close-scanner-modal-footer'),

  // Warning Expiry Elements
  expiryWarningCount: document.getElementById('expiry-warning-count'),
  expiryWarningTbody: document.getElementById('expiry-warning-tbody'),

  // Firebase Setup elements
  settingsFirebaseForm: document.getElementById('settings-firebase-form'),
  setCloudSyncEnable: document.getElementById('set-cloud-sync-enable'),
  setFbProjectId: document.getElementById('set-fb-project-id'),
  setFbApiKey: document.getElementById('set-fb-api-key'),
  setExpiryAlertDays: document.getElementById('set-expiry-alert-days'),
  btnForceSync: document.getElementById('btn-force-sync'),
  cloudSyncStatus: document.getElementById('cloud-sync-status'),

  // Mobile Invoice Modal
  mobileInvoiceModal: document.getElementById('mobile-invoice-modal'),
  mobileInvoiceContent: document.getElementById('mobile-invoice-content'),
  btnCloseMobileInvoice: document.getElementById('btn-close-mobile-invoice'),
  btnCloseMobileInvoiceBottom: document.getElementById('btn-close-mobile-invoice-bottom'),
  btnMobilePrintInvoice: document.getElementById('btn-mobile-print-invoice'),

  // Print template area
  printInvoiceArea: document.getElementById('print-invoice-area'),
  toastContainer: document.getElementById('toast-container')
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Initialize IndexedDB
    await window.dbHelper.init();
    
    // 2. Load settings
    await loadSettings();

    // 3. Initialize Firebase Connection
    initFirebase();

    // 4. Load products
    await reloadProducts();

    // 5. Set up live time
    startClock();

    // 6. Register Event Listeners
    registerNavEvents();
    registerPOSEvents();
    registerInventoryEvents();
    registerSettingsEvents();
    registerReportEvents();
    registerGlobalKeyEvents();
    registerBarcodeScannerListener();

    // 7. Draw dynamic reports
    await refreshReports();

    // Show initial welcome toast
    showToast('Hệ thống POS Thành Đạt đã sẵn sàng!', 'success');
  } catch (error) {
    console.error('Initialization failed:', error);
    showToast('Lỗi khởi động cơ sở dữ liệu!', 'danger');
  }
});

// --- CLOCK & TIMERS ---
function startClock() {
  const updateTime = () => {
    const now = new Date();
    el.headerTime.textContent = now.toLocaleTimeString('vi-VN');
    el.headerDate.textContent = now.toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
    });
  };
  updateTime();
  setInterval(updateTime, 1000);
}

// --- SETTINGS MANAGEMENT ---
async function loadSettings() {
  const keys = Object.keys(state.storeSettings);
  for (let key of keys) {
    const val = await window.dbHelper.getSetting(key);
    if (val !== null) {
      // Parse boolean for firebaseEnable
      if (key === 'firebaseEnable') {
        state.storeSettings[key] = (val === true || val === 'true');
      } else {
        state.storeSettings[key] = val;
      }
    }
  }

  // Sync state to inputs in Settings Tab
  el.setStoreName.value = state.storeSettings.name;
  el.setStoreAddress.value = state.storeSettings.address;
  el.setStorePhone.value = state.storeSettings.phone;
  el.setInvoiceFooter.value = state.storeSettings.footer;
  el.setBankName.value = state.storeSettings.bankName;
  el.setBankAccount.value = state.storeSettings.bankAccount;
  el.setBankOwner.value = state.storeSettings.bankOwner;
  el.setPrinterSize.value = state.storeSettings.printerSize;
  el.setCloudSyncEnable.checked = state.storeSettings.firebaseEnable === true;
  el.setFbProjectId.value = state.storeSettings.firebaseProjectId || '';
  el.setFbApiKey.value = state.storeSettings.firebaseApiKey || '';
  el.setExpiryAlertDays.value = state.storeSettings.expiryAlertDays || 30;

  // Set top-banner text
  el.storeBanner.textContent = `Cửa Hàng ${state.storeSettings.name}`;

  // Theme Sync
  const savedTheme = await window.dbHelper.getSetting('theme', 'light');
  state.theme = savedTheme;
  if (state.theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

// --- CLOUD SYNC FIREBASE INTEGRATION ---
let firestoreDb = null;

async function initFirebase() {
  const isEnabled = state.storeSettings.firebaseEnable;
  const projId = state.storeSettings.firebaseProjectId;
  const apiKey = state.storeSettings.firebaseApiKey;

  if (!isEnabled || !projId || !apiKey) {
    updateCloudStatus('disabled');
    firestoreDb = null;
    return;
  }

  try {
    updateCloudStatus('connecting');
    const firebaseConfig = {
      apiKey: apiKey,
      projectId: projId,
      authDomain: `${projId}.firebaseapp.com`
    };

    // If a Firebase app is already initialized, delete it first to allow new credentials to apply
    if (firebase.apps.length > 0) {
      await firebase.app().delete();
    }

    firebase.initializeApp(firebaseConfig);
    firestoreDb = firebase.firestore();

    // Enable persistence with multi-tab support and graceful fallback
    try {
      await firestoreDb.enablePersistence({ synchronizeTabs: true });
      console.log("Firestore multi-tab persistence enabled.");
    } catch (err) {
      if (err.code === 'failed-precondition') {
        // Fallback to single-tab persistence
        try {
          await firestoreDb.enablePersistence();
          console.log("Firestore single-tab persistence enabled.");
        } catch (err2) {
          console.warn("Firestore single-tab persistence failed:", err2.code);
        }
      } else {
        console.warn("Firestore persistence failed to enable:", err.code);
      }
    }

    // Check network connectivity
    if (navigator.onLine) {
      updateCloudStatus('online');
    } else {
      updateCloudStatus('offline');
    }

    // Listen to network status
    window.addEventListener('online', () => {
      if (firestoreDb) updateCloudStatus('online');
    });
    window.addEventListener('offline', () => {
      if (firestoreDb) updateCloudStatus('offline');
    });

  } catch (err) {
    console.error("Firebase init failed:", err);
    updateCloudStatus('error');
    firestoreDb = null;
  }
}

function updateCloudStatus(status) {
  const container = el.cloudSyncStatus;
  if (!container) return;

  const dot = container.querySelector('.status-dot');
  const text = container.querySelector('.status-text');

  // Reset classes
  container.className = 'barcode-status';

  if (status === 'disabled') {
    text.textContent = 'Đám mây: Chưa bật';
    container.style.opacity = '0.5';
  } else if (status === 'connecting') {
    text.textContent = 'Đám mây: Kết nối...';
    container.style.opacity = '1';
    container.classList.add('connecting'); // styled in CSS variables as amber
  } else if (status === 'online') {
    text.textContent = 'Đám mây: Đã đồng bộ';
    container.style.opacity = '1';
    container.classList.add('connected');
  } else if (status === 'offline') {
    text.textContent = 'Đám mây: Ngoại tuyến';
    container.style.opacity = '1';
    container.classList.add('offline');
  } else if (status === 'error') {
    text.textContent = 'Đám mây: Lỗi cấu hình';
    container.style.opacity = '1';
    container.classList.add('error');
  }
}

async function syncProductToCloud(product) {
  if (!firestoreDb) return;
  try {
    // Firestore does not support undefined values. Ensure fields are clean
    const cleanProduct = {
      id: Number(product.id),
      name: product.name || '',
      barcode: product.barcode || '',
      category: product.category || 'Khác',
      unit: product.unit || 'Cái',
      importPrice: Number(product.importPrice) || 0,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      expiryDate: product.expiryDate || '',
      createdAt: product.createdAt || new Date().toISOString()
    };
    await firestoreDb.collection('products').doc(cleanProduct.id.toString()).set(cleanProduct);
  } catch (e) {
    console.error("Firestore sync product failed:", e);
  }
}

async function syncInvoiceToCloud(invoice) {
  if (!firestoreDb) return;
  try {
    await firestoreDb.collection('invoices').doc(invoice.id).set(invoice);
  } catch (e) {
    console.error("Firestore sync invoice failed:", e);
  }
}

async function forceSyncAllToCloud() {
  if (!firestoreDb) {
    showToast("Vui lòng kích hoạt và cấu hình Đám Mây trước!", "warning");
    return;
  }

  showToast("Đang đồng bộ dữ liệu lên Đám Mây...", "info");
  try {
    const products = await window.dbHelper.getAllProducts();
    const invoices = await window.dbHelper.getAllInvoices();
    
    // Sync products
    for (let p of products) {
      await syncProductToCloud(p);
    }
    
    // Sync invoices
    for (let inv of invoices) {
      await syncInvoiceToCloud(inv);
    }
    
    showToast(`Đã đồng bộ thành công ${products.length} sản phẩm và ${invoices.length} hóa đơn!`, "success");
  } catch (err) {
    console.error("Force sync failed:", err);
    showToast("Đồng bộ đám mây thất bại!", "danger");
  }
}

// --- UTILITIES ---
function formatVND(amount) {
  return Number(amount).toLocaleString('vi-VN') + ' đ';
}

function parseVND(str) {
  if (!str) return 0;
  return Number(String(str).replace(/[^0-9]/g, '')) || 0;
}

function generateUUID() {
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,''); // YYYYMMDD
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HD-${dateStr}-${rand}`;
}

// Custom Toast Alerts
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  
  el.toastContainer.appendChild(toast);

  const closeToast = () => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', closeToast);
  
  setTimeout(() => {
    if (toast.parentNode) closeToast();
  }, duration);
}

// --- NAVIGATION ---
function registerNavEvents() {
  el.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  el.btnToggleTheme.addEventListener('click', async () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme');
    await window.dbHelper.saveSetting('theme', state.theme);
    showToast(`Đã chuyển sang chế độ ${state.theme === 'dark' ? 'Tối' : 'Sáng'}`, 'info');
  });
}

function switchTab(tabId) {
  state.currentTab = tabId;
  
  // Menu buttons
  el.menuItems.forEach(item => {
    if (item.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Tab views
  el.tabPanes.forEach(pane => {
    if (pane.id === tabId) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // Header Title
  let title = 'Bán Hàng';
  if (tabId === 'inventory-tab') title = 'Quản Lý Kho Hàng';
  else if (tabId === 'reports-tab') title = 'Báo Cáo & Doanh Thu';
  else if (tabId === 'settings-tab') title = 'Cấu Hình Hệ Thống';
  el.tabTitle.textContent = title;

  // Refresh tab specifics
  if (tabId === 'reports-tab') {
    refreshReports();
  } else if (tabId === 'inventory-tab') {
    renderInventoryTable();
  } else if (tabId === 'pos-tab') {
    renderPOSProducts();
    el.posSearchInput.focus();
  }
}

// --- INVENTORY MANAGEMENT (TAB 2) ---
async function reloadProducts() {
  state.products = await window.dbHelper.getAllProducts();
  // Sync category lists
  renderCategoryFilters();
  renderPOSProducts();
}

function renderCategoryFilters() {
  // Extract unique categories
  const categories = new Set();
  state.products.forEach(p => {
    if (p.category) categories.add(p.category);
  });

  // POS page category list
  let posHtml = `<button class="cat-filter ${state.selectedCategory === 'ALL' ? 'active' : ''}" data-category="ALL">Tất Cả</button>`;
  categories.forEach(cat => {
    posHtml += `<button class="cat-filter ${state.selectedCategory === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>`;
  });
  el.posCategoryFilters.innerHTML = posHtml;

  // Re-attach filters events
  document.querySelectorAll('.cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedCategory = btn.getAttribute('data-category');
      renderPOSProducts();
    });
  });

  // Inventory page category select filter
  let invHtml = `<option value="ALL">Tất cả danh mục</option>`;
  categories.forEach(cat => {
    invHtml += `<option value="${cat}">${cat}</option>`;
  });
  el.inventoryCategoryFilter.innerHTML = invHtml;
}

function renderInventoryTable() {
  const query = el.inventorySearchInput.value.toLowerCase().trim();
  const categoryFilter = el.inventoryCategoryFilter.value;
  
  const filtered = state.products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query));
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  if (filtered.length === 0) {
    el.inventoryTbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Không tìm thấy sản phẩm nào trong kho</td></tr>`;
    return;
  }

  el.inventoryTbody.innerHTML = filtered.map(p => {
    // Stock levels styling
    let stockClass = 'high';
    if (p.stock <= 5) stockClass = 'low';
    else if (p.stock <= 15) stockClass = 'medium';

    // Expiry date styling
    let expiryText = '---';
    let expiryClass = '';
    if (p.expiryDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const exp = new Date(p.expiryDate);
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      const formattedExp = exp.toLocaleDateString('vi-VN');
      
      if (diffDays <= 0) {
        expiryText = `${formattedExp} (Quá Hạn)`;
        expiryClass = 'text-danger';
      } else if (diffDays <= (Number(state.storeSettings.expiryAlertDays) || 30)) {
        expiryText = `${formattedExp} (Cận Hạn ${diffDays}n)`;
        expiryClass = 'text-warning';
      } else {
        expiryText = formattedExp;
      }
    }

    return `
      <tr>
        <td>${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td><code style="font-size: 11px;">${p.barcode || '---'}</code></td>
        <td>${p.category || 'Khác'}</td>
        <td>${p.unit || 'Cái'}</td>
        <td class="text-right">${formatVND(p.importPrice)}</td>
        <td class="text-right" style="color: var(--primary-color); font-weight: 700;">${formatVND(p.price)}</td>
        <td class="${expiryClass}" style="font-weight: 600;">${expiryText}</td>
        <td class="text-right">
          <span class="stock-indicator ${stockClass}">${p.stock}</span>
        </td>
        <td class="text-center">
          <div class="action-buttons-cell">
            <button class="btn btn-outline btn-xs btn-edit-prod" data-id="${p.id}">Sửa</button>
            <button class="btn btn-danger btn-xs btn-del-prod" data-id="${p.id}" style="padding: 4px 6px;">Xóa</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind edit & delete buttons
  document.querySelectorAll('.btn-edit-prod').forEach(btn => {
    btn.addEventListener('click', () => openProductModal(btn.getAttribute('data-id')));
  });
  document.querySelectorAll('.btn-del-prod').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
  });
}

function registerInventoryEvents() {
  el.inventorySearchInput.addEventListener('input', renderInventoryTable);
  el.inventoryCategoryFilter.addEventListener('change', renderInventoryTable);
  
  el.btnOpenAddProduct.addEventListener('click', () => openProductModal());
  el.btnCloseProductModal.addEventListener('click', closeProductModal);
  el.btnCancelProductModal.addEventListener('click', closeProductModal);

  // Auto Generate Barcode in form
  el.btnGenBarcode.addEventListener('click', () => {
    // Generate code standard: 200 + 10 random digits (internal store bar)
    let code = '200';
    for (let i = 0; i < 10; i++) {
      code += Math.floor(Math.random() * 10);
    }
    el.prodBarcode.value = code;
    showToast('Đã sinh mã vạch nội bộ!', 'info');
  });

  // Save Product
  el.productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = el.prodId.value;
    const name = el.prodName.value.trim();
    const barcode = el.prodBarcode.value.trim();
    const category = el.prodCategory.value.trim() || 'Khác';
    const unit = el.prodUnit.value.trim() || 'Cái';
    const stock = Number(el.prodStock.value) || 0;
    const importPrice = Number(el.prodImportPrice.value) || 0;
    const price = Number(el.prodPrice.value) || 0;
    const expiryDate = el.prodExpiry.value;

    if (!name || price <= 0) {
      showToast('Vui lòng nhập đầy đủ thông tin!', 'warning');
      return;
    }

    // Check barcode duplicates
    if (barcode) {
      const match = await window.dbHelper.getProductByBarcode(barcode);
      if (match && (!id || match.id !== Number(id))) {
        showToast('Mã vạch này đã được sử dụng cho sản phẩm khác!', 'danger');
        return;
      }
    }

    // Check duplicate product names (case-insensitive)
    const nameMatch = state.products.find(p => p.name.toLowerCase().trim() === name.toLowerCase() && (!id || p.id !== Number(id)));
    if (nameMatch) {
      showToast('Tên sản phẩm này đã tồn tại! Vui lòng chỉnh sửa sản phẩm cũ thay vì tạo mới.', 'danger');
      return;
    }

    const prodData = { name, barcode, category, unit, stock, importPrice, price, expiryDate };
    
    try {
      if (id) {
        prodData.id = Number(id);
        const original = state.products.find(p => p.id === Number(id));
        prodData.createdAt = original ? original.createdAt : new Date().toISOString();
        await window.dbHelper.updateProduct(prodData);
        await syncProductToCloud(prodData); // Cloud sync
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        const newId = await window.dbHelper.addProduct(prodData);
        prodData.id = newId;
        await syncProductToCloud(prodData); // Cloud sync
        showToast('Thêm sản phẩm mới thành công!', 'success');
      }
      closeProductModal();
      await reloadProducts();
      renderInventoryTable();
    } catch (err) {
      console.error(err);
      showToast('Lỗi lưu sản phẩm!', 'danger');
    }
  });

  // JSON Export Products
  el.btnExportProducts.addEventListener('click', () => {
    if (state.products.length === 0) {
      showToast('Không có sản phẩm nào để xuất!', 'warning');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Kho_Hang_ThanhDat_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất file JSON kho hàng!', 'success');
  });

  // JSON Import Products
  el.btnImportProductsTrigger.addEventListener('click', () => el.inventoryImportFile.click());
  el.inventoryImportFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const list = JSON.parse(event.target.result);
        if (!Array.isArray(list)) throw new Error('Data format is not an array.');
        
        let count = 0;
        for (let p of list) {
          // Add products one by one, ignoring IDs to create new ones or updating
          await window.dbHelper.addProduct({
            name: p.name,
            barcode: p.barcode,
            category: p.category,
            unit: p.unit,
            stock: p.stock,
            importPrice: p.importPrice,
            price: p.price
          });
          count++;
        }
        showToast(`Đã nhập thành công ${count} sản phẩm từ file!`, 'success');
        await reloadProducts();
        renderInventoryTable();
      } catch (err) {
        console.error(err);
        showToast('File JSON không hợp lệ!', 'danger');
      }
      el.inventoryImportFile.value = ''; // reset
    };
    reader.readAsText(file);
  });
}

async function openProductModal(id = null) {
  el.productForm.reset();
  el.prodId.value = '';
  
  if (id) {
    el.modalProductTitle.textContent = 'Chỉnh Sửa Sản Phẩm';
    const prod = await window.dbHelper.getProductById(id);
    if (prod) {
      el.prodId.value = prod.id;
      el.prodName.value = prod.name;
      el.prodBarcode.value = prod.barcode || '';
      el.prodCategory.value = prod.category || 'Khác';
      el.prodUnit.value = prod.unit || 'Cái';
      el.prodStock.value = prod.stock || 0;
      el.prodImportPrice.value = prod.importPrice || 0;
      el.prodPrice.value = prod.price || 0;
      el.prodExpiry.value = prod.expiryDate || '';
    }
  } else {
    el.modalProductTitle.textContent = 'Thêm Sản Phẩm Mới';
    el.prodExpiry.value = '';
  }
  
  el.productModal.style.display = 'flex';
  el.prodName.focus();
}

function closeProductModal() {
  el.productModal.style.display = 'none';
}

async function deleteProduct(id) {
  if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này?')) {
    await window.dbHelper.deleteProduct(id);
    showToast('Đã xóa sản phẩm.', 'info');
    await reloadProducts();
    renderInventoryTable();
  }
}

// --- POS WORSPACE (TAB 1) ---
function renderPOSProducts() {
  const query = el.posSearchInput.value.toLowerCase().trim();
  const selectedCat = state.selectedCategory;
  
  const filtered = state.products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query) || (p.barcode && p.barcode.includes(query));
    const matchesCategory = selectedCat === 'ALL' || p.category === selectedCat;
    return matchesQuery && matchesCategory;
  });

  if (filtered.length === 0) {
    el.posProductsGrid.innerHTML = '';
    el.posProductsEmpty.style.display = 'flex';
    return;
  }

  el.posProductsEmpty.style.display = 'none';
  el.posProductsGrid.innerHTML = filtered.map(p => {
    const isOut = p.stock <= 0;
    
    // Calculate expiry warning
    let expiryHtml = '';
    if (p.expiryDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const exp = new Date(p.expiryDate);
      const diffTime = exp - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const alertDays = Number(state.storeSettings.expiryAlertDays) || 30;
      
      if (diffDays <= 0) {
        expiryHtml = `<span class="stock out-of-stock" style="margin-top: 4px; display: block; text-align: center;">Hết hạn</span>`;
      } else if (diffDays <= alertDays) {
        expiryHtml = `<span class="stock" style="background-color: var(--warning-color); color: white; margin-top: 4px; display: block; text-align: center;">Cận date: ${diffDays}n</span>`;
      }
    }

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-card-info">
          <h4>${p.name}</h4>
          <span class="barcode">${p.barcode || 'Không mã'}</span>
        </div>
        <div class="product-card-bottom" style="flex-wrap: wrap;">
          <span class="price">${formatVND(p.price)}</span>
          <div style="display: flex; flex-direction: column; align-items: flex-end;">
            <span class="stock ${isOut ? 'out-of-stock' : ''}">${isOut ? 'Hết' : 'Kho: ' + p.stock}</span>
            ${expiryHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Add click to add to cart
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      addToCart(id);
    });
  });
}

function registerPOSEvents() {
  // Search input actions
  el.posSearchInput.addEventListener('input', () => {
    const query = el.posSearchInput.value.trim();
    if (query.length > 0) {
      el.clearSearchBtn.style.display = 'block';
    } else {
      el.clearSearchBtn.style.display = 'none';
    }
    
    // Check if the query is an EXACT barcode match
    if (query.length >= 4) {
      const matched = state.products.find(p => p.barcode === query);
      if (matched) {
        addToCart(matched.id);
        el.posSearchInput.value = '';
        el.clearSearchBtn.style.display = 'none';
      }
    }
    renderPOSProducts();
  });

  el.clearSearchBtn.addEventListener('click', () => {
    el.posSearchInput.value = '';
    el.clearSearchBtn.style.display = 'none';
    renderPOSProducts();
    el.posSearchInput.focus();
  });

  el.btnAddProductQuick.addEventListener('click', () => {
    switchTab('inventory-tab');
    openProductModal();
  });

  // Cart actions
  el.btnClearCart.addEventListener('click', clearCart);
  
  // Hold & Recall cart
  el.btnHoldCart.addEventListener('click', holdCurrentCart);
  el.btnRecallCart.addEventListener('click', recallHeldCart);

  // Close Hold Carts Modal
  const closeHoldModal = () => { el.holdCartsModal.style.display = 'none'; };
  el.btnCloseHoldModal.addEventListener('click', closeHoldModal);
  el.btnCloseHoldModalFooter.addEventListener('click', closeHoldModal);

  // Camera Scanner Actions
  el.btnScanCamera.addEventListener('click', startCameraScanner);
  el.btnCloseScannerModal.addEventListener('click', stopCameraScanner);
  el.btnCloseScannerModalFooter.addEventListener('click', stopCameraScanner);

  // Discount changes
  el.cartDiscountInput.addEventListener('input', calculateCartTotals);
  el.cartDiscountType.addEventListener('change', calculateCartTotals);

  // Customer integrations (auto load details)
  el.cartCustomerPhone.addEventListener('input', () => {
    const phone = el.cartCustomerPhone.value.trim();
    if (phone.length >= 9) {
      // Find a previous invoice with this phone number to auto-fill customer name
      window.dbHelper.getAllInvoices().then(invoices => {
        const matching = invoices.find(inv => inv.customerPhone === phone);
        if (matching && matching.customerName) {
          el.cartCustomerName.value = matching.customerName;
          showToast(`Nhận diện khách hàng: ${matching.customerName}`, 'info');
        }
      });
    }
  });

  // Cash given calculation
  el.paymentCashGiven.addEventListener('input', () => {
    // Strip letters and format nicely
    const rawVal = el.paymentCashGiven.value.replace(/[^0-9]/g, '');
    if (rawVal) {
      el.paymentCashGiven.value = Number(rawVal).toLocaleString('vi-VN');
    }
    calculateChangeBack();
  });

  el.btnClearCash.addEventListener('click', () => {
    el.paymentCashGiven.value = '';
    calculateChangeBack();
    el.paymentCashGiven.focus();
  });

  // Fast cash select
  el.fastCashButtons.addEventListener('click', (e) => {
    if (!e.target.classList.contains('fast-cash-btn')) return;
    
    const value = e.target.getAttribute('data-value');
    const total = parseVND(el.cartTotal.textContent);
    
    if (total <= 0) return;

    if (value === 'exact') {
      el.paymentCashGiven.value = total.toLocaleString('vi-VN');
    } else {
      el.paymentCashGiven.value = Number(value).toLocaleString('vi-VN');
    }
    calculateChangeBack();
  });

  // Payment method selection
  el.paymentMethodRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'TRANSFER') {
        el.transferQrPreview.style.display = 'block';
        generateVietQR();
      } else {
        el.transferQrPreview.style.display = 'none';
      }
    });
  });

  // Checkout and Print
  el.btnCheckoutPrint.addEventListener('click', checkoutAndPrint);

  // Mobile Invoice Modal: close buttons
  const closeMobileInvoiceModal = () => {
    el.mobileInvoiceModal.style.display = 'none';
  };
  el.btnCloseMobileInvoice.addEventListener('click', closeMobileInvoiceModal);
  el.btnCloseMobileInvoiceBottom.addEventListener('click', closeMobileInvoiceModal);

  // Mobile Invoice Modal: "In Hóa Đơn" for bluetooth printers
  el.btnMobilePrintInvoice.addEventListener('click', () => {
    window.print();
  });

  // Barcode simulation
  el.btnScanSim.addEventListener('click', () => {
    const barcode = el.virtualBarcodeInput.value.trim();
    if (barcode) {
      handleBarcodeScan(barcode);
      el.virtualBarcodeInput.value = '';
    }
  });
  el.virtualBarcodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      el.btnScanSim.click();
    }
  });
}

// Global Key Shortcuts for cashier convenience
function registerGlobalKeyEvents() {
  window.addEventListener('keydown', (e) => {
    // F2 Focuses Search Box
    if (e.key === 'F2') {
      e.preventDefault();
      switchTab('pos-tab');
      el.posSearchInput.focus();
    }
    // F8 Focuses cash given
    if (e.key === 'F8') {
      e.preventDefault();
      switchTab('pos-tab');
      el.paymentCashGiven.focus();
      el.paymentCashGiven.select();
    }
    // F9 Submits Checkout
    if (e.key === 'F9') {
      if (!el.btnCheckoutPrint.disabled) {
        e.preventDefault();
        checkoutAndPrint();
      }
    }
  });
}

// Keyboard listener to capture machine gun-like physical Barcode Scanner inputs
function registerBarcodeScannerListener() {
  let buffer = '';
  let lastKeyTime = Date.now();

  window.addEventListener('keydown', (e) => {
    const now = Date.now();
    
    // Physical scanner characters arrive very fast (< 30ms apart)
    const timeDiff = now - lastKeyTime;
    lastKeyTime = now;

    // Reset buffer if delay is too long (implies human typing)
    if (timeDiff > 50) {
      buffer = '';
    }

    if (e.key === 'Enter') {
      if (buffer.length >= 3) {
        e.preventDefault();
        handleBarcodeScan(buffer);
        buffer = '';
      }
    } else if (e.key.length === 1 && /^[0-9a-zA-Z]$/.test(e.key)) {
      buffer += e.key;
    }
  });
}

async function handleBarcodeScan(barcode) {
  const prod = await window.dbHelper.getProductByBarcode(barcode);
  if (prod) {
    addToCart(prod.id);
    showToast(`Đã quét: ${prod.name}`, 'success');
  } else {
    showToast(`Không tìm thấy mã vạch: ${barcode}`, 'warning');
    // Offer to add new product
    if (confirm(`Không thấy mặt hàng có mã vạch: "${barcode}". Bạn có muốn thêm sản phẩm mới với mã vạch này?`)) {
      switchTab('inventory-tab');
      openProductModal();
      el.prodBarcode.value = barcode;
    }
  }
}

// Cart Mechanics
function addToCart(productId) {
  const prod = state.products.find(p => p.id === Number(productId));
  if (!prod) return;

  // Verify stock levels
  if (prod.stock <= 0) {
    showToast(`Sản phẩm "${prod.name}" đã hết hàng trong kho!`, 'warning');
  }

  const existing = state.cart.find(item => item.id === prod.id);
  if (existing) {
    existing.quantity += 1;
    if (existing.quantity > prod.stock) {
      showToast(`Chú ý: Số lượng bán (${existing.quantity}) vượt quá tồn kho (${prod.stock})!`, 'warning');
    }
  } else {
    state.cart.push({
      id: prod.id,
      name: prod.name,
      barcode: prod.barcode,
      price: prod.price,
      importPrice: prod.importPrice,
      unit: prod.unit,
      quantity: 1
    });
  }

  renderCartTable();
}

function renderCartTable() {
  if (state.cart.length === 0) {
    el.cartTbody.innerHTML = `
      <tr class="cart-empty-row">
        <td colspan="5" class="text-center py-5">
          <div class="empty-cart-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="width: 40px; height: 40px; color: var(--text-muted); margin-bottom: 8px;"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
            <p>Chưa có sản phẩm nào. Hãy quét mã vạch hoặc chọn từ danh sách bên trái.</p>
          </div>
        </td>
      </tr>
    `;
    el.btnCheckoutPrint.disabled = true;
    calculateCartTotals();
    return;
  }

  el.btnCheckoutPrint.disabled = false;
  el.cartTbody.innerHTML = state.cart.map((item, index) => {
    return `
      <tr>
        <td>
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-barcode">${item.barcode || 'Không mã'}</span>
          </div>
        </td>
        <td>
          <div class="qty-control">
            <button class="qty-btn dec-qty" data-index="${index}">-</button>
            <input type="text" class="qty-input" value="${item.quantity}" data-index="${index}">
            <button class="qty-btn inc-qty" data-index="${index}">+</button>
          </div>
        </td>
        <td>${formatVND(item.price)}</td>
        <td class="text-right" style="font-weight: 700;">${formatVND(item.price * item.quantity)}</td>
        <td class="text-center">
          <button class="cart-item-remove" data-index="${index}">&times;</button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach cart controls events
  document.querySelectorAll('.dec-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      if (state.cart[idx].quantity > 1) {
        state.cart[idx].quantity -= 1;
        renderCartTable();
      }
    });
  });

  document.querySelectorAll('.inc-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      const prod = state.products.find(p => p.id === state.cart[idx].id);
      state.cart[idx].quantity += 1;
      if (prod && state.cart[idx].quantity > prod.stock) {
        showToast(`Cảnh báo: Kho chỉ còn ${prod.stock}!`, 'warning');
      }
      renderCartTable();
    });
  });

  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', () => {
      const idx = Number(input.getAttribute('data-index'));
      const val = parseInt(input.value) || 1;
      state.cart[idx].quantity = Math.max(1, val);
      
      const prod = state.products.find(p => p.id === state.cart[idx].id);
      if (prod && state.cart[idx].quantity > prod.stock) {
        showToast(`Cảnh báo: Kho chỉ còn ${prod.stock}!`, 'warning');
      }
      renderCartTable();
    });
  });

  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      state.cart.splice(idx, 1);
      renderCartTable();
    });
  });

  calculateCartTotals();
}

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discount
  let discountVal = Number(el.cartDiscountInput.value.replace(/[^0-9]/g, '')) || 0;
  const discountType = el.cartDiscountType.value;
  
  let finalDiscount = 0;
  if (discountType === '%') {
    discountVal = Math.min(100, Math.max(0, discountVal));
    finalDiscount = Math.round((subtotal * discountVal) / 100);
  } else {
    discountVal = Math.min(subtotal, Math.max(0, discountVal));
    finalDiscount = discountVal;
  }

  // Format discount input value visually
  if (discountType === 'đ' && discountVal > 0) {
    el.cartDiscountInput.value = discountVal.toLocaleString('vi-VN');
  }

  const total = Math.max(0, subtotal - finalDiscount);

  el.cartSubtotal.textContent = formatVND(subtotal);
  el.cartTotal.textContent = formatVND(total);

  calculateChangeBack();

  // If QR transfer mode active, update QR image dynamically
  const method = document.querySelector('input[name="pay-method"]:checked').value;
  if (method === 'TRANSFER') {
    generateVietQR();
  }
}

function calculateChangeBack() {
  const total = parseVND(el.cartTotal.textContent);
  const given = parseVND(el.paymentCashGiven.value);
  
  if (given < total || total === 0) {
    el.paymentChangeBack.textContent = '0 đ';
    el.paymentChangeBack.className = 'change-green';
  } else {
    const change = given - total;
    el.paymentChangeBack.textContent = formatVND(change);
    el.paymentChangeBack.className = 'change-green highlight-change';
  }
}

function clearCart() {
  state.cart = [];
  el.cartCustomerPhone.value = '';
  el.cartCustomerName.value = '';
  el.cartDiscountInput.value = '0';
  el.cartDiscountType.value = 'đ';
  el.paymentCashGiven.value = '';
  renderCartTable();
}

// Queue / Hold cart feature
function holdCurrentCart() {
  if (state.cart.length === 0) {
    showToast('Giỏ hàng trống, không có gì để lưu!', 'warning');
    return;
  }

  // Calculate total price for this held cart to display in the list
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountVal = Number(el.cartDiscountInput.value.replace(/[^0-9]/g, '')) || 0;
  const discountType = el.cartDiscountType.value;
  let finalDiscount = 0;
  if (discountType === '%') {
    discountVal = Math.min(100, Math.max(0, discountVal));
    finalDiscount = Math.round((subtotal * discountVal) / 100);
  } else {
    discountVal = Math.min(subtotal, Math.max(0, discountVal));
    finalDiscount = discountVal;
  }
  const total = Math.max(0, subtotal - finalDiscount);

  const newHold = {
    id: Date.now(), // Unique ID based on timestamp
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    cart: [...state.cart],
    customerPhone: el.cartCustomerPhone.value.trim(),
    customerName: el.cartCustomerName.value.trim(),
    discountVal: el.cartDiscountInput.value,
    discountType: el.cartDiscountType.value,
    itemCount: state.cart.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: total
  };

  state.holdCarts.push(newHold);

  el.holdCount.textContent = state.holdCarts.length;
  el.btnRecallCart.style.display = 'inline-block';
  showToast('Đã lưu giỏ hàng nháp!', 'success');
  clearCart();
}

function recallHeldCart() {
  if (state.holdCarts.length === 0) return;

  if (state.holdCarts.length === 1) {
    // If only 1 cart, confirm override if current cart is not empty
    if (state.cart.length > 0) {
      if (!confirm('Giỏ hàng hiện tại đang có sản phẩm. Bạn có chắc chắn muốn ghi đè để khôi phục đơn hàng nháp này?')) {
        return;
      }
    }
    restoreHeldCart(0);
  } else {
    // If multiple carts, show modal list
    renderHoldCartsList();
    el.holdCartsModal.style.display = 'flex';
  }
}

function renderHoldCartsList() {
  if (state.holdCarts.length === 0) {
    el.holdCartsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px 0;">Không có đơn hàng nháp nào đang lưu</div>`;
    el.holdCartsModal.style.display = 'none';
    el.btnRecallCart.style.display = 'none';
    el.holdCount.textContent = '0';
    return;
  }

  el.holdCartsList.innerHTML = state.holdCarts.map((item, index) => {
    const customerDesc = item.customerName || item.customerPhone 
      ? `${item.customerName || 'Khách lẻ'} (${item.customerPhone || 'Không SĐT'})` 
      : 'Khách vãng lai';
    return `
      <div class="hold-cart-item">
        <div class="hold-cart-info">
          <div class="hold-cart-title">Đơn nháp #${index + 1} (${item.time})</div>
          <div class="hold-cart-meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              ${customerDesc}
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              ${item.itemCount} sp
            </span>
            <span>
              <strong style="color: var(--primary-color);">${formatVND(item.totalPrice)}</strong>
            </span>
          </div>
        </div>
        <div class="hold-cart-actions">
          <button class="btn btn-primary btn-xs btn-restore-hold" data-index="${index}">Chọn</button>
          <button class="btn btn-danger btn-xs btn-delete-hold" data-index="${index}" style="padding: 4px 6px;">Xóa</button>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners
  document.querySelectorAll('.btn-restore-hold').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      if (state.cart.length > 0) {
        if (!confirm('Giỏ hàng hiện tại đang có sản phẩm. Bạn có chắc chắn muốn ghi đè để khôi phục đơn hàng nháp này?')) {
          return;
        }
      }
      restoreHeldCart(idx);
      el.holdCartsModal.style.display = 'none';
    });
  });

  document.querySelectorAll('.btn-delete-hold').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      if (confirm(`Bạn có chắc chắn muốn xóa đơn nháp #${idx + 1}?`)) {
        deleteHeldCart(idx);
      }
    });
  });
}

function restoreHeldCart(index) {
  const held = state.holdCarts[index];
  if (!held) return;

  state.cart = [...held.cart];
  el.cartCustomerPhone.value = held.customerPhone;
  el.cartCustomerName.value = held.customerName;
  el.cartDiscountInput.value = held.discountVal;
  el.cartDiscountType.value = held.discountType;

  // Remove from state.holdCarts
  state.holdCarts.splice(index, 1);

  // Update UI recall button & count
  el.holdCount.textContent = state.holdCarts.length;
  if (state.holdCarts.length === 0) {
    el.btnRecallCart.style.display = 'none';
  }

  showToast('Đã khôi phục giỏ hàng tạm!', 'success');
  renderCartTable();
}

function deleteHeldCart(index) {
  state.holdCarts.splice(index, 1);
  el.holdCount.textContent = state.holdCarts.length;
  if (state.holdCarts.length === 0) {
    el.btnRecallCart.style.display = 'none';
    el.holdCartsModal.style.display = 'none';
  } else {
    renderHoldCartsList();
  }
  showToast('Đã xóa đơn hàng nháp.', 'info');
}

// ============================================================
// Camera Barcode Scanner - Native Web API Implementation
// Uses MediaDevices + BarcodeDetector (native, fast, no CDN)
// Falls back to html5-qrcode library if BarcodeDetector unavailable
// ============================================================
let cameraStream = null;
let scanAnimationFrame = null;
let html5QrcodeScanner = null;

function startCameraScanner() {
  el.cameraScannerModal.style.display = 'flex';

  // Force using the Html5Qrcode library instead of native BarcodeDetector
  // for maximum compatibility and recognition rates of 1D barcodes on mobile devices
  if (typeof Html5Qrcode !== 'undefined') {
    _startHtml5QrcodeScanner();
  } else {
    showToast('Trình duyệt không hỗ trợ quét camera. Hãy dùng Chrome hoặc Safari mới nhất.', 'danger');
    el.cameraScannerModal.style.display = 'none';
  }
}

// --- Native BarcodeDetector implementation ---
async function _startNativeScanner() {
  const container = el.cameraReader;

  // Build camera UI
  container.innerHTML = `
    <div style="position: relative; width: 100%; background: #000; border-radius: 8px; overflow: hidden;">
      <video id="scanner-video" autoplay playsinline muted
        style="width: 100%; display: block; max-height: 65vh; object-fit: cover;"></video>
      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <div style="width: 75%; height: 28%; border: 3px solid #00e676; border-radius: 10px;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.45);
          animation: scanline 1.5s ease-in-out infinite alternate;">
        </div>
      </div>
      <p style="position: absolute; bottom: 12px; left: 0; right: 0; text-align: center; color: #fff; font-size: 12px; margin: 0;">
        📷 Đưa mã vạch vào khung xanh
      </p>
    </div>
  `;

  // Add scanning animation style if not already present
  if (!document.getElementById('scanner-style')) {
    const style = document.createElement('style');
    style.id = 'scanner-style';
    style.textContent = `
      @keyframes scanline {
        from { box-shadow: 0 0 0 9999px rgba(0,0,0,0.45), inset 0 -90% 0 rgba(0,230,118,0.12); }
        to   { box-shadow: 0 0 0 9999px rgba(0,0,0,0.45), inset 0  90% 0 rgba(0,230,118,0.12); }
      }`;
    document.head.appendChild(style);
  }

  const video = document.getElementById('scanner-video');

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = cameraStream;
    await video.play();
  } catch (err) {
    console.error('Camera access denied:', err);
    showToast('Không mở được camera! Hãy cấp quyền camera cho trình duyệt.', 'danger');
    el.cameraScannerModal.style.display = 'none';
    return;
  }

  const detector = new BarcodeDetector({
    formats: ['ean_13', 'ean_8', 'code_128', 'qr_code', 'upc_a', 'upc_e', 'code_39', 'itf']
  });

  const scanFrame = async () => {
    if (!cameraStream || video.readyState < video.HAVE_ENOUGH_DATA) {
      scanAnimationFrame = requestAnimationFrame(scanFrame);
      return;
    }
    try {
      const barcodes = await detector.detect(video);
      if (barcodes.length > 0) {
        const code = barcodes[0].rawValue;
        if (navigator.vibrate) navigator.vibrate(120);
        stopCameraScanner();
        handleBarcodeScan(code);
        return;
      }
    } catch (_) {}
    scanAnimationFrame = requestAnimationFrame(scanFrame);
  };

  scanAnimationFrame = requestAnimationFrame(scanFrame);
}

// --- html5-qrcode library fallback ---
function _startHtml5QrcodeScanner() {
  if (html5QrcodeScanner) {
    try { html5QrcodeScanner.stop(); } catch (_) {}
    html5QrcodeScanner = null;
  }

  el.cameraReader.innerHTML = '';

  // CRITICAL: formatsToSupport MUST be in the constructor, NOT in start() config
  const supportedFormats = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.ITF
  ];

  html5QrcodeScanner = new Html5Qrcode('camera-reader', {
    formatsToSupport: supportedFormats,
    verbose: false
  });

  const scanConfig = {
    fps: 25, // Higher frame rate for faster detection
    qrbox: (viewfinderWidth, viewfinderHeight) => {
      // Wide and short rectangular scan box (optimized for horizontal 1D barcodes)
      // This allows users to get much closer to the product while keeping the barcode inside the box
      const width = Math.floor(viewfinderWidth * 0.9);
      const height = Math.floor(viewfinderHeight * 0.3);
      return {
        width: width,
        height: Math.max(100, height)
      };
    },
    disableFlip: false,
    videoConstraints: {
      facingMode: 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true
    }
  };

  html5QrcodeScanner.start(
    { facingMode: 'environment' },
    scanConfig,
    (decodedText) => {
      if (navigator.vibrate) navigator.vibrate(120);
      stopCameraScanner();
      handleBarcodeScan(decodedText);
    },
    () => {} // Ignore per-frame scan misses
  ).catch(err => {
    console.error('html5-qrcode start failed:', err);
    showToast('Không truy cập được camera! Hãy cấp quyền camera.', 'danger');
    el.cameraScannerModal.style.display = 'none';
  });

}

function stopCameraScanner() {
  // Stop native stream
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  if (scanAnimationFrame) {
    cancelAnimationFrame(scanAnimationFrame);
    scanAnimationFrame = null;
  }

  // Stop html5-qrcode if running
  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().catch(() => {}).finally(() => {
      html5QrcodeScanner = null;
    });
  }

  el.cameraReader.innerHTML = '';
  el.cameraScannerModal.style.display = 'none';
}


// VietQR code Generator
function generateVietQR() {
  const total = parseVND(el.cartTotal.textContent);
  if (total <= 0) {
    el.qrBankImageContainer.innerHTML = `<div class="qr-loading">Đang chờ giỏ hàng...</div>`;
    return;
  }

  const bank = state.storeSettings.bankName;
  const acc = state.storeSettings.bankAccount;
  const name = encodeURIComponent(state.storeSettings.bankOwner);
  const memo = encodeURIComponent(`Thanh Toan Tap Hoa Thanh Dat`);
  
  if (!acc) {
    el.qrBankImageContainer.innerHTML = `<div class="qr-loading" style="color: var(--danger-color)">Vui lòng cấu hình tài khoản trong tab Cài Đặt!</div>`;
    return;
  }

  el.qrBankImageContainer.innerHTML = `<div class="qr-loading">Đang tải mã QR chuyển khoản...</div>`;

  const imgUrl = `https://img.vietqr.io/image/${bank}-${acc}-compact2.jpg?amount=${total}&addInfo=${memo}&accountName=${name}`;
  
  const img = new Image();
  img.onload = () => {
    el.qrBankImageContainer.innerHTML = `<img src="${imgUrl}" alt="VietQR Transfer code">`;
  };
  img.onerror = () => {
    el.qrBankImageContainer.innerHTML = `<div class="qr-loading" style="color: var(--danger-color)">Lỗi kết nối tạo mã VietQR.</div>`;
  };
  img.src = imgUrl;
}

// Checkout and Trigger Thermal Print
async function checkoutAndPrint() {
  // Verify that products in the cart are still valid (not expired)
  for (let item of state.cart) {
    const dbProd = state.products.find(p => p.id === item.id);
    if (dbProd && dbProd.expiryDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const exp = new Date(dbProd.expiryDate);
      if (exp < today) {
        showToast(`Không thể thanh toán! Sản phẩm "${item.name}" đã hết hạn sử dụng.`, 'danger');
        return;
      }
    }
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = parseVND(el.cartTotal.textContent);
  const given = parseVND(el.paymentCashGiven.value);
  const method = document.querySelector('input[name="pay-method"]:checked').value;
  const custName = el.cartCustomerName.value.trim();
  const custPhone = el.cartCustomerPhone.value.trim();

  // If CASH, ensure customer gives enough money, or default to total
  let actualGiven = given;
  if (method === 'CASH') {
    if (given < total && given > 0) {
      showToast('Khách đưa thiếu tiền mặt!', 'warning');
      return;
    }
    if (given === 0) {
      actualGiven = total; // assume exact amount if blank
    }
  } else {
    actualGiven = total; // bank transfers are exact
  }

  const change = Math.max(0, actualGiven - total);
  const invoiceId = generateUUID();
  const now = new Date();

  // Prepare Invoice payload
  const invoice = {
    id: invoiceId,
    items: state.cart,
    subtotal: subtotal,
    discountAmount: subtotal - total,
    totalPrice: total,
    cashGiven: actualGiven,
    changeGiven: change,
    paymentMethod: method,
    customerName: custName || 'Khách vãng lai',
    customerPhone: custPhone || '',
    createdAt: now.toISOString()
  };

  try {
    // 1. Save invoice in database (which updates inventory)
    await window.dbHelper.addInvoice(invoice);
    await syncInvoiceToCloud(invoice); // Cloud Sync invoice

    // 2. Render print receipt template HTML
    renderReceiptPrintTemplate(invoice);

    // 3. Post-checkout: Clear cart and reload state
    const postCheckout = () => {
      clearCart();
      reloadProducts().then(() => {
        renderInventoryTable();
        refreshReports();
        // Sync updated stock to Firebase Cloud
        invoice.items.forEach(item => {
          const p = state.products.find(prod => prod.id === item.id);
          if (p) syncProductToCloud(p);
        });
      });
      showToast(`Thanh toán thành công hóa đơn ${invoiceId}!`, 'success');
    };

    // 4. Detect mobile vs desktop to choose between modal preview vs print
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // On mobile: show invoice in a readable modal instead of print dialog
      el.mobileInvoiceContent.innerHTML = el.printInvoiceArea.innerHTML;
      el.mobileInvoiceModal.style.display = 'flex';
      postCheckout();
    } else {
      // On desktop: trigger print dialog as before
      setTimeout(() => {
        window.print();
        postCheckout();
        el.posSearchInput.focus();
      }, 150);
    }

  } catch (error) {
    console.error(error);
    showToast('Lỗi hệ thống khi thanh toán!', 'danger');
  }
}

function renderReceiptPrintTemplate(invoice) {
  const itemsHtml = invoice.items.map(item => `
    <tr>
      <td class="col-name">${item.name}</td>
      <td class="col-qty">${item.quantity}</td>
      <td class="col-price">${formatVND(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const pSize = state.storeSettings.printerSize;
  const formattedDate = new Date(invoice.createdAt).toLocaleString('vi-VN');

  el.printInvoiceArea.innerHTML = `
    <div class="print-receipt ${pSize === '58' ? 'paper-58' : ''}">
      <div class="print-header">
        <h2>${state.storeSettings.name}</h2>
        <p>${state.storeSettings.address}</p>
        <p>SĐT: ${state.storeSettings.phone}</p>
        <div class="print-divider"></div>
        <h3>HÓA ĐƠN BÁN HÀNG</h3>
        <p>Mã HĐ: ${invoice.id}</p>
        <p>Ngày in: ${formattedDate}</p>
      </div>
      
      <div class="print-details">
        <p>Khách hàng: ${invoice.customerName}</p>
        ${invoice.customerPhone ? `<p>SĐT: ${invoice.customerPhone}</p>` : ''}
        <p>Hình thức: ${invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản (QR)'}</p>
      </div>

      <div class="print-divider"></div>

      <table class="print-table">
        <thead>
          <tr>
            <th class="col-name">Tên hàng</th>
            <th class="col-qty">SL</th>
            <th class="col-price">T.Tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="print-divider"></div>

      <div class="print-totals">
        <div class="print-totals-row">
          <span>Tiền hàng:</span>
          <span>${formatVND(invoice.subtotal)}</span>
        </div>
        ${invoice.discountAmount > 0 ? `
          <div class="print-totals-row">
            <span>Chiết khấu:</span>
            <span>-${formatVND(invoice.discountAmount)}</span>
          </div>
        ` : ''}
        <div class="print-totals-row grand-total">
          <span>TỔNG CỘNG:</span>
          <span>${formatVND(invoice.totalPrice)}</span>
        </div>
        <div class="print-totals-row">
          <span>Khách đưa:</span>
          <span>${formatVND(invoice.cashGiven)}</span>
        </div>
        <div class="print-totals-row">
          <span>Thối lại:</span>
          <span>${formatVND(invoice.changeGiven)}</span>
        </div>
      </div>

      <div class="print-divider"></div>
      <div class="print-footer">
        <p>${state.storeSettings.footer}</p>
        <p>Powered by Thanh Dat POS</p>
      </div>
    </div>
  `;
}

// --- REPORTS & HISTORICAL INVOICES (TAB 3) ---
async function refreshReports() {
  const invoices = await window.dbHelper.getAllInvoices();
  const todayStr = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  
  const todayInvoices = invoices.filter(inv => inv.createdAt.startsWith(todayStr));
  
  // 1. Calculate today revenue
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.totalPrice, 0);
  
  // 2. Calculate today estimated profits
  let todayProfit = 0;
  todayInvoices.forEach(inv => {
    inv.items.forEach(item => {
      // profit = quantity * (selling price - import price)
      const importPr = item.importPrice || 0;
      todayProfit += item.quantity * (item.price - importPr);
    });
    // subtract discount distributed
    todayProfit -= inv.discountAmount || 0;
  });

  // Render cards
  el.reportTodayRevenue.textContent = formatVND(todayRevenue);
  el.reportTodayProfit.textContent = formatVND(Math.max(0, todayProfit));
  el.reportTodayInvoices.textContent = todayInvoices.length + ' đơn';
  el.reportTotalProductsCount.textContent = state.products.length + ' mã';

  // 3. Render Historical List
  renderHistoryTable(invoices);

  // 4. Draw Canvas-based Sales Chart (No external chart libraries needed)
  drawRevenueChart(invoices);

  // 5. Render Expiry warnings
  renderExpiryWarningTable();
}

function renderExpiryWarningTable() {
  const alertDays = Number(state.storeSettings.expiryAlertDays) || 30;
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const warnings = state.products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diffDays <= alertDays;
  });
  
  warnings.sort((a,b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  
  el.expiryWarningCount.textContent = `${warnings.length} sản phẩm`;
  
  if (warnings.length === 0) {
    el.expiryWarningTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Không có sản phẩm nào cận hạn hoặc quá hạn sử dụng.</td></tr>`;
    return;
  }
  
  el.expiryWarningTbody.innerHTML = warnings.map(p => {
    const exp = new Date(p.expiryDate);
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    let statusBadge = '';
    if (diffDays <= 0) {
      statusBadge = `<span class="stock-indicator low">Quá Hạn (${Math.abs(diffDays)} ngày)</span>`;
    } else {
      statusBadge = `<span class="stock-indicator medium">Cận Hạn (${diffDays} ngày)</span>`;
    }
    
    return `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td><code>${p.barcode || '---'}</code></td>
        <td>${p.category || 'Khác'}</td>
        <td class="text-right">${p.stock}</td>
        <td>${exp.toLocaleDateString('vi-VN')}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
}

function renderHistoryTable(invoices) {
  const dateFilter = el.reportHistoryDate.value; // YYYY-MM-DD
  
  const filtered = invoices.filter(inv => {
    if (!dateFilter) return true;
    return inv.createdAt.startsWith(dateFilter);
  });

  if (filtered.length === 0) {
    el.historyTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Không tìm thấy hóa đơn nào trong khoảng lọc</td></tr>`;
    return;
  }

  el.historyTbody.innerHTML = filtered.map(inv => {
    const date = new Date(inv.createdAt);
    const timeFormatted = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')} - ${date.toLocaleDateString('vi-VN')}`;
    const methodText = inv.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Ck QR';
    const isVoided = inv.voided === true;
    
    return `
      <tr style="${isVoided ? 'opacity:0.45; text-decoration: line-through;' : ''}">
        <td><strong>${inv.id.substring(inv.id.lastIndexOf('-') + 1)}</strong>${isVoided ? ' <span style="color:var(--danger-color);font-size:10px;font-weight:700;">[HUỶ]</span>' : ''}</td>
        <td>${timeFormatted}</td>
        <td class="text-right" style="font-weight: 700;">${formatVND(inv.totalPrice)}</td>
        <td><span class="stock-indicator ${inv.paymentMethod === 'CASH' ? 'high' : 'medium'}">${methodText}</span></td>
        <td class="text-center" style="white-space: nowrap;">
          <button class="btn btn-outline btn-xs btn-view-invoice" data-id="${inv.id}" style="margin-right: 4px;">Xem</button>
          ${!isVoided ? `<button class="btn btn-danger btn-xs btn-void-invoice" data-id="${inv.id}" title="Hủy và hoàn kho hóa đơn này" style="padding: 4px 7px;">Hủy</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  // Bind view invoice details click
  document.querySelectorAll('.btn-view-invoice').forEach(btn => {
    btn.addEventListener('click', () => {
      showInvoiceDetails(btn.getAttribute('data-id'));
    });
  });

  // Bind void invoice click
  document.querySelectorAll('.btn-void-invoice').forEach(btn => {
    btn.addEventListener('click', () => {
      voidInvoice(btn.getAttribute('data-id'));
    });
  });
}

function registerReportEvents() {
  el.reportHistoryDate.addEventListener('change', async () => {
    const invoices = await window.dbHelper.getAllInvoices();
    renderHistoryTable(invoices);
  });

  el.btnClearDateFilter.addEventListener('click', async () => {
    el.reportHistoryDate.value = '';
    const invoices = await window.dbHelper.getAllInvoices();
    renderHistoryTable(invoices);
  });

  // Modal actions
  el.btnCloseInvoiceModal.addEventListener('click', () => el.invoiceDetailModal.style.display = 'none');
  el.btnCloseInvoiceModalFooter.addEventListener('click', () => el.invoiceDetailModal.style.display = 'none');
  
  // Reprint
  el.btnPrintInvoiceHistory.addEventListener('click', () => {
    const invId = el.btnPrintInvoiceHistory.getAttribute('data-id');
    window.dbHelper.getAllInvoices().then(invoices => {
      const inv = invoices.find(i => i.id === invId);
      if (inv) {
        renderReceiptPrintTemplate(inv);
        setTimeout(() => window.print(), 100);
      }
    });
  });
}

async function showInvoiceDetails(invoiceId) {
  const invoices = await window.dbHelper.getAllInvoices();
  const inv = invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  el.btnPrintInvoiceHistory.setAttribute('data-id', invoiceId);
  const itemsHtml = inv.items.map(item => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
      <span>${item.name} <strong>x${item.quantity}</strong></span>
      <span>${formatVND(item.price * item.quantity)}</span>
    </div>
  `).join('');

  el.invoiceModalContent.innerHTML = `
    <div style="border-bottom: 1px dashed var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
      <h4 style="margin-bottom: 4px;">Mã Đơn: ${inv.id}</h4>
      <p style="font-size: 12px; color: var(--text-muted);">Thời gian: ${new Date(inv.createdAt).toLocaleString('vi-VN')}</p>
      <p style="font-size: 12px; color: var(--text-muted);">Khách hàng: ${inv.customerName} ${inv.customerPhone ? '('+inv.customerPhone+')' : ''}</p>
    </div>
    <div style="margin-bottom: 12px; border-bottom: 1px dashed var(--border-color); padding-bottom: 12px;">
      <h5>DANH SÁCH MẶT HÀNG:</h5>
      <div style="margin-top: 8px;">${itemsHtml}</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px; font-weight: 600;">
      <div style="display: flex; justify-content: space-between;">
        <span>Tổng giá trị hàng:</span>
        <span>${formatVND(inv.subtotal)}</span>
      </div>
      ${inv.discountAmount > 0 ? `
        <div style="display: flex; justify-content: space-between; color: var(--danger-color)">
          <span>Chiết khấu giảm giá:</span>
          <span>-${formatVND(inv.discountAmount)}</span>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; border-top: 1px solid var(--border-color); padding-top: 6px; margin-top: 4px;">
        <span>TỔNG CỘNG:</span>
        <span style="color: var(--primary-color)">${formatVND(inv.totalPrice)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 500; color: var(--text-muted);">
        <span>Phương thức:</span>
        <span>${inv.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản (VietQR)'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 500; color: var(--text-muted);">
        <span>Khách đưa:</span>
        <span>${formatVND(inv.cashGiven)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 500; color: var(--text-muted);">
        <span>Tiền thối lại:</span>
        <span>${formatVND(inv.changeGiven)}</span>
      </div>
    </div>
  `;

  el.invoiceDetailModal.style.display = 'flex';
}

// --- VOID (HỦY) INVOICE ---
async function voidInvoice(invoiceId) {
  // Show a friendly confirmation before voiding
  const shortId = invoiceId.substring(invoiceId.lastIndexOf('-') + 1);
  const confirmed = confirm(
    `⚠️ XÁC NHẬN HỦY HÓA ĐƠN\n\nMã đơn: ${shortId}\n\n` +
    `Hành động này sẽ:\n` +
    `• Xóa hóa đơn khỏi hệ thống\n` +
    `• Hoàn trả tồn kho cho tất cả sản phẩm trong đơn\n\n` +
    `Bạn có chắc chắn muốn hủy đơn hàng này không?`
  );
  if (!confirmed) return;

  try {
    showToast('Đang xử lý hủy đơn hàng...', 'info', 2000);

    // 1. Void invoice and restore stock in IndexedDB
    await window.dbHelper.voidInvoice(invoiceId);

    // 2. Remove from Firebase if cloud sync is enabled
    if (firestoreDb) {
      try {
        await firestoreDb.collection('invoices').doc(invoiceId).delete();
      } catch (e) {
        console.warn('Cloud delete invoice failed:', e);
      }
    }

    // 3. Refresh all data
    await reloadProducts();
    renderInventoryTable();
    await refreshReports();

    showToast(`Đã hủy hóa đơn ${shortId} và hoàn kho thành công!`, 'success');

  } catch (err) {
    console.error('Void invoice error:', err);
    showToast('Lỗi hủy hóa đơn! Vui lòng thử lại.', 'danger');
  }
}

// Draw a beautiful custom 7-day revenue chart using raw HTML5 Canvas API (no network or chart libraries required)
function drawRevenueChart(invoices) {
  const canvas = el.revenueChart;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Calculate revenue for the last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push({
      dateStr: d.toISOString().slice(0,10),
      label: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      revenue: 0
    });
  }

  last7Days.forEach(day => {
    const matches = invoices.filter(inv => inv.createdAt.startsWith(day.dateStr));
    day.revenue = matches.reduce((sum, inv) => sum + inv.totalPrice, 0);
  });

  const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 100000); // minimum scale

  // 2. Setup Chart Layout
  const paddingLeft = 70;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = canvas.width - paddingLeft - paddingRight;
  const chartHeight = canvas.height - paddingTop - paddingBottom;

  // Background and Grid lines
  ctx.strokeStyle = state.theme === 'dark' ? '#1f2937' : '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.fillStyle = state.theme === 'dark' ? '#9ca3af' : '#64748b';
  ctx.font = '10px Plus Jakarta Sans';
  ctx.textAlign = 'right';

  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const y = paddingTop + (chartHeight / gridCount) * i;
    const value = maxRevenue - (maxRevenue / gridCount) * i;
    
    // Draw grid horizontal line
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(canvas.width - paddingRight, y);
    ctx.stroke();

    // Draw Y labels
    ctx.fillText(formatShortVND(value), paddingLeft - 8, y + 4);
  }

  // Draw bars
  const barWidth = (chartWidth / last7Days.length) * 0.55;
  const barGap = (chartWidth / last7Days.length) * 0.45;
  const startX = paddingLeft + barGap / 2;

  last7Days.forEach((day, index) => {
    const x = startX + index * (barWidth + barGap);
    const barHeight = (day.revenue / maxRevenue) * chartHeight;
    const y = paddingTop + chartHeight - barHeight;

    // Draw Bar with rounded corners on top
    const radius = 6;
    ctx.fillStyle = '#10b981'; // Primary green
    ctx.beginPath();
    ctx.moveTo(x, y + barHeight);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.lineTo(x + barWidth - radius, y);
    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
    ctx.lineTo(x + barWidth, y + barHeight);
    ctx.closePath();
    ctx.fill();

    // Hover effect simulation or drawing value label on top
    if (day.revenue > 0) {
      ctx.fillStyle = state.theme === 'dark' ? '#f3f4f6' : '#0f172a';
      ctx.font = 'bold 9px Plus Jakarta Sans';
      ctx.textAlign = 'center';
      ctx.fillText(formatShortVND(day.revenue), x + barWidth / 2, y - 5);
    }

    // Draw X Label
    ctx.fillStyle = state.theme === 'dark' ? '#9ca3af' : '#64748b';
    ctx.font = '10px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText(day.label, x + barWidth / 2, paddingTop + chartHeight + 18);
  });
}

function formatShortVND(val) {
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1) + 'M';
  } else if (val >= 1000) {
    return (val / 1000).toFixed(0) + 'k';
  }
  return val;
}

// --- SETTINGS EVENTS (TAB 4) ---
function registerSettingsEvents() {
  el.settingsStoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    state.storeSettings.name = el.setStoreName.value.trim();
    state.storeSettings.address = el.setStoreAddress.value.trim();
    state.storeSettings.phone = el.setStorePhone.value.trim();
    state.storeSettings.footer = el.setInvoiceFooter.value.trim();
    state.storeSettings.bankName = el.setBankName.value;
    state.storeSettings.bankAccount = el.setBankAccount.value.trim();
    state.storeSettings.bankOwner = el.setBankOwner.value.trim().toUpperCase();

    // Save each setting to IndexedDB
    const keys = Object.keys(state.storeSettings);
    for (let key of keys) {
      await window.dbHelper.saveSetting(key, state.storeSettings[key]);
    }

    // Update Banner
    el.storeBanner.textContent = `Cửa Hàng ${state.storeSettings.name}`;

    showToast('Đã lưu thông tin cấu hình cửa hàng!', 'success');
  });

  el.settingsFirebaseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    state.storeSettings.firebaseEnable = el.setCloudSyncEnable.checked;
    state.storeSettings.firebaseProjectId = el.setFbProjectId.value.trim();
    state.storeSettings.firebaseApiKey = el.setFbApiKey.value.trim();
    state.storeSettings.expiryAlertDays = Number(el.setExpiryAlertDays.value) || 30;

    const keys = ['firebaseEnable', 'firebaseProjectId', 'firebaseApiKey', 'expiryAlertDays'];
    for (let key of keys) {
      await window.dbHelper.saveSetting(key, state.storeSettings[key]);
    }
    
    await initFirebase();
    await reloadProducts();
    await refreshReports();
    showToast('Đã lưu cấu hình Đám Mây & Hạn Dùng!', 'success');
  });

  el.btnForceSync.addEventListener('click', forceSyncAllToCloud);

  el.setPrinterSize.addEventListener('change', async () => {
    state.storeSettings.printerSize = el.setPrinterSize.value;
    await window.dbHelper.saveSetting('printerSize', el.setPrinterSize.value);
    showToast(`Đã đổi khổ máy in thành K${el.setPrinterSize.value}`, 'success');
  });

  // DB Backup
  el.btnBackupDb.addEventListener('click', async () => {
    const products = await window.dbHelper.getAllProducts();
    const invoices = await window.dbHelper.getAllInvoices();
    const settingsList = [];
    
    const keys = Object.keys(state.storeSettings);
    for (let k of keys) {
      const val = await window.dbHelper.getSetting(k);
      settingsList.push({ key: k, value: val });
    }

    const backupData = {
      products,
      invoices,
      settings: settingsList,
      backupTime: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SaoLuuy_POS_ThanhDat_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    showToast('Đã xuất file dự phòng hệ thống!', 'success');
  });

  // DB Restore
  el.btnRestoreDbTrigger.addEventListener('click', () => el.dbRestoreFile.click());
  el.dbRestoreFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!confirm('Hành động này sẽ ghi đè lên toàn bộ dữ liệu hiện tại của hệ thống. Bạn có muốn tiếp tục?')) {
      el.dbRestoreFile.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Basic check
        if (!data.products || !data.invoices) throw new Error('Cấu trúc file backup không hợp lệ');

        // Clear existing database
        await window.dbHelper.clearAllProducts();
        
        // Also clear invoices
        const allInvoices = await window.dbHelper.getAllInvoices();
        for (let inv of allInvoices) {
          await window.dbHelper.deleteInvoice(inv.id);
        }

        // Restore products
        for (let p of data.products) {
          await window.dbHelper.addProduct({
            name: p.name,
            barcode: p.barcode,
            category: p.category,
            unit: p.unit,
            stock: p.stock,
            importPrice: p.importPrice,
            price: p.price
          });
        }

        // Restore invoices
        for (let inv of data.invoices) {
          // Add directly without deducting stock again since stock is already loaded in backup products
          const transaction = window.dbHelper.db.transaction(['invoices'], 'readwrite');
          const store = transaction.objectStore('invoices');
          store.add(inv);
        }

        // Restore settings
        if (data.settings && Array.isArray(data.settings)) {
          for (let set of data.settings) {
            await window.dbHelper.saveSetting(set.key, set.value);
          }
        }

        showToast('Khôi phục hệ thống thành công! Đang tải lại...', 'success');
        setTimeout(() => location.reload(), 1500);

      } catch (err) {
        console.error(err);
        showToast('Khôi phục thất bại, file dữ liệu bị lỗi!', 'danger');
      }
      el.dbRestoreFile.value = '';
    };
    reader.readAsText(file);
  });

  // Load sample demo data
  el.btnLoadDemoData.addEventListener('click', async () => {
    if (confirm('Bạn có muốn nạp dữ liệu sản phẩm mẫu? Sản phẩm cũ vẫn được giữ nguyên.')) {
      const demoProducts = [
        { name: 'Mì ăn liền Hảo Hảo Tôm Chua Cay 75g', barcode: '8934563138165', category: 'Mì ăn liền', unit: 'Gói', stock: 120, importPrice: 3200, price: 4500 },
        { name: 'Sữa tươi Vinamilk ít đường hộp 180ml', barcode: '8934673111234', category: 'Sữa & Sản phẩm sữa', unit: 'Hộp', stock: 64, importPrice: 6800, price: 8500 },
        { name: 'Nước ngọt Coca-Cola Lon 320ml', barcode: '8935049500015', category: 'Nước giải khát', unit: 'Lon', stock: 96, importPrice: 8200, price: 10500 },
        { name: 'Nước ngọt Pepsi Lon 320ml', barcode: '8935049500123', category: 'Nước giải khát', unit: 'Lon', stock: 72, importPrice: 8000, price: 10000 },
        { name: 'Nước tinh khiết Aquafina Chai 500ml', barcode: '8935049500666', category: 'Nước giải khát', unit: 'Chai', stock: 150, importPrice: 3800, price: 5000 },
        { name: 'Bia Heineken Premium Lon 330ml', barcode: '8934588012112', category: 'Bia & Rượu', unit: 'Lon', stock: 48, importPrice: 17200, price: 21000 },
        { name: 'Bia Tiger Crystal Lon 330ml', barcode: '8934588012228', category: 'Bia & Rượu', unit: 'Lon', stock: 60, importPrice: 15800, price: 19000 },
        { name: 'Bia 333 Export Lon 330ml', barcode: '8934588012334', category: 'Bia & Rượu', unit: 'Lon', stock: 84, importPrice: 11000, price: 14000 },
        { name: 'Dầu ăn Neptune Light Chai 1L', barcode: '8935022030102', category: 'Gia vị & Nước chấm', unit: 'Chai', stock: 30, importPrice: 42000, price: 53000 },
        { name: 'Nước mắm Nam Ngư Chai 750ml', barcode: '8936017361284', category: 'Gia vị & Nước chấm', unit: 'Chai', stock: 40, importPrice: 35000, price: 44000 },
        { name: 'Hạt nêm Knorr từ thịt thăn xương ống 400g', barcode: '8935013000107', category: 'Gia vị & Nước chấm', unit: 'Gói', stock: 35, importPrice: 28000, price: 36000 },
        { name: 'Bánh quy Cosy Kinh Đô Gói 150g', barcode: '8935013000999', category: 'Bánh kẹo & Ăn vặt', unit: 'Gói', stock: 45, importPrice: 14500, price: 19000 },
        { name: 'Bột giặt OMO hệ ma thuật túi 800g', barcode: '8935013011228', category: 'Hóa mỹ phẩm', unit: 'Túi', stock: 25, importPrice: 38000, price: 46000 },
        { name: 'Nước rửa chén Sunlight Trà Xanh Chai 750ml', barcode: '8935013022339', category: 'Hóa mỹ phẩm', unit: 'Chai', stock: 28, importPrice: 24000, price: 31000 },
        { name: 'Kem đánh răng Colgate ngừa sâu răng 150g', barcode: '8935013044119', category: 'Hóa mỹ phẩm', unit: 'Hộp', stock: 50, importPrice: 26000, price: 33000 },
        { name: 'Khăn giấy khô Silkwell Gói 100 tờ', barcode: '8935013044225', category: 'Khác', unit: 'Gói', stock: 60, importPrice: 9000, price: 14000 },
        { name: 'Bánh ChocoPie Orion Hộp 6 cái 198g', barcode: '8935022030999', category: 'Bánh kẹo & Ăn vặt', unit: 'Hộp', stock: 24, importPrice: 28000, price: 35000 },
        { name: 'Đường cát trắng tinh luyện Biên Hòa 1kg', barcode: '8935013055118', category: 'Gia vị & Nước chấm', unit: 'Gói', stock: 50, importPrice: 21500, price: 27000 },
        { name: 'Tương ớt Chinsu Chai 250g', barcode: '8936017361111', category: 'Gia vị & Nước chấm', unit: 'Chai', stock: 80, importPrice: 10500, price: 14000 },
        { name: 'Muối sấy tinh sấy I-ốt Hải Dương 500g', barcode: '8936017360201', category: 'Gia vị & Nước chấm', unit: 'Gói', stock: 100, importPrice: 4000, price: 6000 }
      ];

      for (let p of demoProducts) {
        await window.dbHelper.addProduct(p);
      }
      showToast('Đã nạp kho hàng sản phẩm mẫu thành công!', 'success');
      await reloadProducts();
      renderInventoryTable();
    }
  });

  // Reset DB
  el.btnResetDb.addEventListener('click', async () => {
    if (confirm('CẢNH BÁO CỰC KỲ QUAN TRỌNG: Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu gồm hàng hóa và hóa đơn lịch sử? Hệ thống sẽ trống trơn.')) {
      if (confirm('Lần cuối xác nhận: Chắc chắn xóa vĩnh viễn?')) {
        await window.dbHelper.clearAllProducts();
        
        const allInvoices = await window.dbHelper.getAllInvoices();
        for (let inv of allInvoices) {
          await window.dbHelper.deleteInvoice(inv.id);
        }
        
        showToast('Hệ thống đã reset sạch sẽ.', 'danger');
        setTimeout(() => location.reload(), 1000);
      }
    }
  });
}
