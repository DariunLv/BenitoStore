// src/utils/store.js
// Centralized data management with localStorage

const STORAGE_KEY = 'benito_store_data';

const DEFAULT_JEWELRY_CATEGORIES = [
  { id: 'ofertas', name: 'Ofertas Especiales', image: '', lottieUrl: 'https://lottie.host/f605aec1-2e91-496b-9b55-4982e2f75047/Ow0BUEgWTP.lottie', storeType: 'jewelry', order: 0, isOffers: true },
  { id: 'anillos', name: 'Anillos', image: '', lottieUrl: 'https://lottie.host/60f16af4-8158-4643-8208-d87861d241a9/73zzcGNGgg.lottie', storeType: 'jewelry', order: 1 },
  { id: 'collares', name: 'Collares', image: '', lottieUrl: 'https://lottie.host/127d2e9a-3ac9-457f-a3b5-447168c1b4a0/T2ntdUWyuk.lottie', storeType: 'jewelry', order: 2 },
  { id: 'collares-parejas', name: 'Collares para Parejas', image: '', lottieUrl: 'https://lottie.host/454dfe96-d4d9-4938-96f4-db32c761f5d0/SLbWwfzsQh.lottie', storeType: 'jewelry', order: 3 },
  { id: 'pulseras', name: 'Pulseras', image: '', lottieUrl: 'https://lottie.host/12dd8dcf-4152-449c-b7d0-bb9448664e7a/Tz7RkTie6i.lottie', storeType: 'jewelry', order: 4 },
];

const DEFAULT_DATA = {
  categories: [...DEFAULT_JEWELRY_CATEGORIES],
  products: [],
  adminPassword: 'benito2026',
};

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStore(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const data = JSON.parse(raw);
    // Ensure default categories exist
    const existingIds = data.categories.map(c => c.id);
    DEFAULT_JEWELRY_CATEGORIES.forEach(dc => {
      if (!existingIds.includes(dc.id)) {
        data.categories.push(dc);
      }
    });
    return data;
  } catch {
    saveStore(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
}

export function saveStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving store data:', e);
  }
}

export function getCategories(storeType = 'jewelry') {
  const data = loadStore();
  return data.categories
    .filter(c => c.storeType === storeType)
    .sort((a, b) => a.order - b.order);
}

export function getAllCategories() {
  const data = loadStore();
  return data.categories.sort((a, b) => a.order - b.order);
}

export function addCategory(category) {
  const data = loadStore();
  data.categories.push(category);
  saveStore(data);
  return data;
}

export function updateCategory(id, updates) {
  const data = loadStore();
  const idx = data.categories.findIndex(c => c.id === id);
  if (idx !== -1) {
    data.categories[idx] = { ...data.categories[idx], ...updates };
    saveStore(data);
  }
  return data;
}

export function deleteCategory(id) {
  const data = loadStore();
  // Don't delete default jewelry categories
  const defaultIds = DEFAULT_JEWELRY_CATEGORIES.map(c => c.id);
  if (defaultIds.includes(id)) return data;
  data.categories = data.categories.filter(c => c.id !== id);
  data.products = data.products.filter(p => p.categoryId !== id);
  saveStore(data);
  return data;
}

export function getProducts(categoryId) {
  const data = loadStore();
  if (categoryId) {
    return data.products.filter(p => p.categoryId === categoryId);
  }
  return data.products;
}

export function getProductsByStore(storeType) {
  const data = loadStore();
  const catIds = data.categories.filter(c => c.storeType === storeType).map(c => c.id);
  return data.products.filter(p => catIds.includes(p.categoryId));
}

export function getOfferProducts() {
  const data = loadStore();
  return data.products.filter(p => p.categoryId === 'ofertas');
}

export function addProduct(product) {
  const data = loadStore();
  data.products.push(product);
  saveStore(data);
  return data;
}

export function updateProduct(id, updates) {
  const data = loadStore();
  const idx = data.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    data.products[idx] = { ...data.products[idx], ...updates };
    saveStore(data);
  }
  return data;
}

export function deleteProduct(id) {
  const data = loadStore();
  data.products = data.products.filter(p => p.id !== id);
  saveStore(data);
  return data;
}

export function toggleSoldOut(id) {
  const data = loadStore();
  const idx = data.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    data.products[idx].soldOut = !data.products[idx].soldOut;
    saveStore(data);
  }
  return data;
}

export function verifyPassword(pw) {
  const data = loadStore();
  return pw === data.adminPassword;
}

export function changePassword(newPw) {
  const data = loadStore();
  data.adminPassword = newPw;
  saveStore(data);
  return data;
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
