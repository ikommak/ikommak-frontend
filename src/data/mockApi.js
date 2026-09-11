import * as apiCatalog from '../api/catalog.js'
import * as apiReviews from '../api/reviews.js'
import * as apiReservations from '../api/reservations.js'
import * as apiAdmin from '../api/admin.js'
import { mockCatalog } from './mockData.js'

const mockSource = Object.freeze({
  isDemo: true,
  listCategories: async () => mockCatalog.categories,
  listDistricts: async () => mockCatalog.districts,
  listShops: async () => mockCatalog.shops,
  getShop: async id => mockCatalog.shops.data.find(shop => shop.id === String(id)) ?? null,
  listReviews: async () => ({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
  submitReview: async () => ({ status: 'pending', message: 'نظر شما پس از بررسی منتشر می‌شود.' }),
  submitReservation: async (id, input) => {
    const shop = mockCatalog.shops.data.find(item => item.id === String(id))
    if (!shop) throw new Error('این تعمیرگاه پیدا نشد.')
    return { reference: `IK-DEMO${String(id).padStart(8, '0')}`, status: 'pending', preferredAt: new Date(input.preferredAt).toISOString(), createdAt: new Date().toISOString(), shop: { id: shop.id, name: shop.name, phone: shop.phone, address: shop.address } }
  },
  getAdminSession: async () => ({ authenticated: true, username: 'demo' }),
  loginAdmin: async () => ({ authenticated: true, username: 'demo' }),
  logoutAdmin: async () => ({ authenticated: false, username: null }),
  listAdminReviews: async () => ({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
  moderateReview: async (_id, input) => ({ status: input.action === 'approve' ? 'approved' : 'rejected' }),
  listAdminReservations: async () => ({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
  updateReservation: async (id, input) => ({ id: String(id), status: input.status }),
})

const apiSource = Object.freeze({
  isDemo: false,
  ...apiCatalog,
  ...apiReviews,
  ...apiReservations,
  ...apiAdmin,
})

export function dataSource(mode = import.meta.env.VITE_DATA_MODE || 'api') {
  if (mode === 'api') return apiSource
  if (mode === 'mock') return mockSource
  throw new Error('VITE_DATA_MODE must be "api" or "mock"')
}
