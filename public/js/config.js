const API_BASE = window.location.origin;

const API = {
    auth: {
        login: `${API_BASE}/api/auth/login`,
        register: `${API_BASE}/api/auth/register`,
        adminLogin: `${API_BASE}/api/auth/admin/login`,
        profile: `${API_BASE}/api/auth/profile`,
        updateProfile: `${API_BASE}/api/auth/profile`,
        changePassword: `${API_BASE}/api/auth/change-password`,
        logout: `${API_BASE}/api/auth/logout`,
        address: `${API_BASE}/api/auth/address`
    },
    products: {
        all: `${API_BASE}/api/products`,
        categories: `${API_BASE}/api/products/categories`,
        single: (id) => `${API_BASE}/api/products/${id}`
    },
    cart: {
        add: `${API_BASE}/api/orders/cart/add`,
        get: `${API_BASE}/api/orders/cart`,
        remove: (id) => `${API_BASE}/api/orders/cart/${id}`
    },
    orders: {
        place: `${API_BASE}/api/orders`,
        myOrders: `${API_BASE}/api/orders`,
        single: (id) => `${API_BASE}/api/orders/${id}`
    },
    admin: {
        dashboard: `${API_BASE}/api/admin/dashboard`,
        orders: `${API_BASE}/api/admin/orders`,
        updateOrder: (id) => `${API_BASE}/api/admin/orders/${id}/status`,
        users: `${API_BASE}/api/admin/users`,
        toggleUser: (id) => `${API_BASE}/api/admin/users/${id}/toggle-active`,
        createProduct: `${API_BASE}/api/admin/products`,
        updateProduct: (id) => `${API_BASE}/api/admin/products/${id}`,
        deleteProduct: (id) => `${API_BASE}/api/admin/products/${id}`,
        createCategory: `${API_BASE}/api/admin/categories`,
        updateCategory: (id) => `${API_BASE}/api/admin/categories/${id}`,
        deleteCategory: (id) => `${API_BASE}/api/admin/categories/${id}`
    }
};

function getToken() { return localStorage.getItem('foodville_token'); }
function setToken(t) { localStorage.setItem('foodville_token', t); }
function removeToken() { localStorage.removeItem('foodville_token'); localStorage.removeItem('foodville_user'); }
function getUser() { return JSON.parse(localStorage.getItem('foodville_user') || 'null'); }
function setUser(u) { localStorage.setItem('foodville_user', JSON.stringify(u)); }
function isLoggedIn() { return !!getToken(); }
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }

async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
}

function showToast(msg, type = '') {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

function logout() { removeToken(); window.location.href = '/login'; }
