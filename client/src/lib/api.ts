import axios from 'axios';

// Create axios instance with base configuration
const baseURL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://eloquent-reprieve-production.up.railway.app'
    : 'https://eloquent-reprieve-production.up.railway.app'
  );

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request logging
api.interceptors.request.use(
  (config) => {
    // Prefer admin token for admin endpoints; fall back to user token
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();
    const isProjectDetail = /\/api\/projects\/[^\/]+$/.test(url);
    const isProjectAdminAction = /\/api\/projects\/[^\/]+\/(approve|reject)$/.test(url) || url.includes('/api/projects/pending') || url.includes('/api/projects/admin');
    const isManualPaymentsAdmin = url.includes('/api/manual-payments/admin') || /\/api\/manual-payments\/[^\/]+\/(verify|pay-seller)$/.test(url);
    const isAuthAdmin = url.includes('/api/auth/admin');
    const isMyProjects = url.includes('/api/projects/my-projects');

    const preferAdmin = (isAuthAdmin || isProjectAdminAction || isManualPaymentsAdmin || isProjectDetail) && !isMyProjects;

    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('token');
    const tokenToUse = preferAdmin && adminToken ? adminToken : (userToken || adminToken || undefined);
    if (tokenToUse) {
      config.headers.Authorization = `Bearer ${tokenToUse}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response logging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only redirect to login for 401 errors that are not from auth endpoints or admin endpoints
    if (error.response?.status === 401 && 
        !error.config.url.includes('/auth/') && 
        !error.config.url.includes('/admin')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  adminLogin: (data: any) => api.post('/api/auth/admin/login', data),
  googleRegister: (token: string) => api.post('/api/auth/register/google', { token }),
  googleLogin: (token: string) => api.post('/api/auth/google', { token }),
  logout: () => api.post('/api/auth/logout'),
  verifyEmail: (token: string) => api.post('/api/auth/verify-email', { token }),
  resendVerificationEmail: (email: string) => api.post('/api/auth/resend-verification', { email }),
  forgotPassword: (email: string) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => 
    api.post('/api/auth/reset-password', { token, password }),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data: any) => api.put('/api/auth/profile', data),
  updatePassword: (data: any) => api.put('/api/auth/password', data),
  getAllUsers: () => api.get('/api/auth/admin/users'),
};

// Projects API
export const projectsAPI = {
  getAll: (params?: any) => api.get('/api/projects', { params }),
  getById: (id: string) => api.get(`/api/projects/${id}`),
  create: (data: any) => api.post('/api/projects', data),
  update: (id: string, data: any) => api.put(`/api/projects/${id}`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
  getMyProjects: () => api.get('/api/projects/my-projects'),
  getPendingProjects: () => api.get('/api/projects/pending'),
  approveProject: (id: string) => api.put(`/api/projects/${id}/approve`),
  rejectProject: (id: string, rejectionMessage?: string) => api.put(`/api/projects/${id}/reject`, { rejectionMessage }),
  search: (query: string) => api.get(`/api/projects/search?q=${query}`),
  getByCategory: (category: string) => api.get(`/api/projects/category/${category}`),
  uploadImage: (data: FormData) => api.post('/api/projects/upload-image', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (projectId: string) => api.post('/api/cart/add', { projectId }),
  removeFromCart: (projectId: string) => api.post('/api/cart/remove', { projectId }),
  clearCart: () => api.delete('/api/cart/clear'),
  updateQuantity: (projectId: string, quantity: number) => 
    api.put(`/api/cart/quantity/${projectId}`, { quantity }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  getById: (id: string) => api.get(`/api/categories/${id}`),
  create: (data: any) => api.post('/api/categories', data),
  update: (id: string, data: any) => api.put(`/api/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/categories/${id}`),
};

// Payments API (Updated to match backend)
export const paymentsAPI = {
  createEscrowPayment: (data: any) => api.post('/api/payments/create-escrow', data),
  confirmPayment: (data: any) => api.post('/api/payments/confirm-payment', data),
  releasePayment: (data: any) => api.post('/api/payments/release-payment', data),
  getEscrowAccount: (escrowAccountId: string) => api.get(`/api/payments/escrow/${escrowAccountId}`),
  getUserEscrowAccounts: (params?: any) => api.get('/api/payments/escrow-accounts', { params }),
  refundPayment: (data: any) => api.post('/api/payments/refund-payment', data),
};

// Manual Payments API
export const manualPaymentsAPI = {
  createPayment: (data: any) => api.post('/api/manual-payments/create', data),
  uploadPaymentProof: (paymentId: string, data: FormData) => 
    api.post(`/api/manual-payments/${paymentId}/upload-proof`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updatePaymentProof: (paymentId: string, data: FormData) => 
    api.put(`/api/manual-payments/${paymentId}/update-proof`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  verifyPayment: (paymentId: string, data: any) => api.post(`/api/manual-payments/${paymentId}/verify`, data),
  confirmDelivery: (paymentId: string, data: any) => api.post(`/api/manual-payments/${paymentId}/confirm-delivery`, data),
  paySeller: (paymentId: string, data: any) => api.post(`/api/manual-payments/${paymentId}/pay-seller`, data),
  getPaymentDetails: (paymentId: string) => api.get(`/api/manual-payments/${paymentId}`),
  getUserPayments: (params?: any) => api.get('/api/manual-payments/user/payments', { params }),
  getSellerPayments: (params?: any) => api.get('/api/manual-payments/seller/payments', { params }),
  getAdminPayments: (params?: any) => api.get('/api/manual-payments/admin/payments', { params }),
  createDispute: (paymentId: string, data: any) => api.post(`/api/manual-payments/${paymentId}/dispute`, data),
  deletePayment: (paymentId: string) => api.delete(`/api/manual-payments/${paymentId}`),
  rejectPayment: (paymentId: string, rejectionMessage?: string) => api.put(`/api/manual-payments/${paymentId}/reject`, { rejectionMessage }),
};

// Verification API
export const verificationAPI = {
  submitDocuments: (data: FormData) => 
    api.post('/api/verification/submit-documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getStatus: () => api.get('/api/verification/status'),
  getDocuments: () => api.get('/api/verification/documents'),
};

// Communication API
export const communicationAPI = {
  sendMessage: (data: any) => api.post('/api/communication/send-message', data),
  getMessages: (projectId: string) => api.get(`/api/communication/messages/${projectId}`),
  getConversations: () => api.get('/api/communication/conversations'),
  uploadAttachment: (data: FormData) => 
    api.post('/api/communication/upload-attachment', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Disputes API
export const disputesAPI = {
  createDispute: (data: any) => api.post('/api/disputes/create', data),
  getDisputes: () => api.get('/api/disputes'),
  getDisputeById: (id: string) => api.get(`/api/disputes/${id}`),
  updateDispute: (id: string, data: any) => api.put(`/api/disputes/${id}`, data),
  submitEvidence: (disputeId: string, data: FormData) => 
    api.post(`/api/disputes/${disputeId}/evidence`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Instructions API
export const instructionsAPI = {
  getInstructions: () => api.get('/api/instructions'),
};

// Contact API
export const contactAPI = {
  sendMessage: (data: any) => api.post('/api/contact/send', data),
  getAllMessages: () => api.get('/api/contact/messages'),
  replyToMessage: (messageId: string, data: { subject: string, replyMessage: string }) =>
    api.patch(`/api/contact/reply/${messageId}`, data),
};

export default api; 