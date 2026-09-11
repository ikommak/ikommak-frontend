import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage.jsx'
import ShopListPage from '../pages/ShopListPage.jsx'
import ShopDetailPage from '../pages/ShopDetailPage.jsx'
import ReservationPage from '../pages/ReservationPage.jsx'
import ReservationSuccessPage from '../pages/ReservationSuccessPage.jsx'
import AdminLoginPage from '../pages/AdminLoginPage.jsx'
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import SiteLayout from '../layouts/SiteLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'

export function createRoutes() {
  return [
    { element: <SiteLayout />, children: [
      { path: '/', element: <HomePage /> },
      { path: '/shops', element: <ShopListPage /> },
      { path: '/shops/:id', element: <ShopDetailPage /> },
      { path: '/shops/:id/reserve', element: <ReservationPage /> },
      { path: '/reservations/:reference/success', element: <ReservationSuccessPage /> },
      { path: '*', element: <NotFoundPage /> },
    ] },
    { path: '/admin/login', element: <AdminLoginPage /> },
    { element: <AdminLayout />, children: [
      { path: '/admin', element: <AdminDashboardPage /> },
    ] },
  ]
}

export const router = createBrowserRouter(createRoutes())
