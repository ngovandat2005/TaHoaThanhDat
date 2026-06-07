/**
 * db.js - IndexedDB Helper for Thanh Dat POS
 * Handles local offline storage for products, invoices, and settings.
 */

class ThanhDatDB {
  constructor() {
    this.dbName = 'ThanhDatPOS_DB';
    this.dbVersion = 1;
    this.db = null;
  }

  /**
   * Initializes the IndexedDB database
   */
  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Database initialized successfully.');
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Products store
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
          productStore.createIndex('barcode', 'barcode', { unique: false });
          productStore.createIndex('name', 'name', { unique: false });
          productStore.createIndex('category', 'category', { unique: false });
        }

        // 2. Invoices store
        if (!db.objectStoreNames.contains('invoices')) {
          const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id' });
          invoiceStore.createIndex('createdAt', 'createdAt', { unique: false });
          invoiceStore.createIndex('customerPhone', 'customerPhone', { unique: false });
        }

        // 3. Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // --- PRODUCT METHODS ---

  getAllProducts() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  getProductById(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.get(Number(id));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  getProductByBarcode(barcode) {
    return new Promise((resolve, reject) => {
      if (!barcode) return resolve(null);
      const transaction = this.db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const index = store.index('barcode');
      const request = index.get(barcode.trim());

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  addProduct(product) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      
      // Ensure data types are correct
      const cleanProduct = {
        name: product.name || '',
        barcode: (product.barcode || '').trim(),
        importPrice: Number(product.importPrice) || 0,
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        unit: product.unit || 'Cái',
        category: product.category || 'Khác',
        expiryDate: product.expiryDate || '',
        createdAt: new Date().toISOString()
      };

      const request = store.add(cleanProduct);

      request.onsuccess = () => resolve(request.result); // returns the auto-incremented id
      request.onerror = () => reject(request.error);
    });
  }

  updateProduct(product) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');

      const cleanProduct = {
        id: Number(product.id),
        name: product.name,
        barcode: (product.barcode || '').trim(),
        importPrice: Number(product.importPrice) || 0,
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        unit: product.unit || 'Cái',
        category: product.category || 'Khác',
        expiryDate: product.expiryDate || '',
        createdAt: product.createdAt || new Date().toISOString()
      };

      const request = store.put(cleanProduct);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  deleteProduct(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.delete(Number(id));

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  clearAllProducts() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // --- INVOICE METHODS ---

  getAllInvoices() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['invoices'], 'readonly');
      const store = transaction.objectStore('invoices');
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort invoices by date descending
        const results = request.result || [];
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  addInvoice(invoice) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['invoices', 'products'], 'readwrite');
      const invoiceStore = transaction.objectStore('invoices');
      const productStore = transaction.objectStore('products');

      // 1. Deduct stock for each item in the invoice
      const updateStockPromises = invoice.items.map(item => {
        return new Promise((resUpdate, rejUpdate) => {
          if (!item.id) return resUpdate(); // skip if no product ID
          
          const getReq = productStore.get(Number(item.id));
          getReq.onsuccess = () => {
            const product = getReq.result;
            if (product) {
              product.stock = Math.max(0, (product.stock || 0) - item.quantity);
              const putReq = productStore.put(product);
              putReq.onsuccess = () => resUpdate();
              putReq.onerror = () => rejUpdate(putReq.error);
            } else {
              resUpdate();
            }
          };
          getReq.onerror = () => rejUpdate(getReq.error);
        });
      });

      Promise.all(updateStockPromises)
        .then(() => {
          // 2. Save the invoice
          const request = invoiceStore.add(invoice);
          request.onsuccess = () => resolve(invoice.id);
          request.onerror = () => reject(request.error);
        })
        .catch(err => {
          console.error("Error updating stock during invoice creation:", err);
          reject(err);
        });
    });
  }

  deleteInvoice(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['invoices'], 'readwrite');
      const store = transaction.objectStore('invoices');
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // --- SETTINGS METHODS ---

  getSetting(key, defaultValue = null) {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve(defaultValue);
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  saveSetting(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export a single instance to be used application-wide
const dbHelper = new ThanhDatDB();
window.dbHelper = dbHelper;
