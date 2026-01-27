import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/useAuthContext'
import { LoginPage } from './features/auth'
import { ManagerDashboardPage, EmployeeDashboardPage, DashboardLayout } from './features/dashboard'
import { ScheduleReviewPage, ReviewsPage, ReviewDetailPage, MyReviewsPage } from './features/reviews'
import { EditReviewPage } from './features/reviews/pages/EditReviewPage'
import { ProjectsPage, CreateProjectPage } from './features/projects'
import { ClientsPage } from './features/clients'
import { EmployeesPage } from './features/employees'
import { SettingsPage } from './features/settings'

function App() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto text-blue-600">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path 
                  clipRule="evenodd" 
                  d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" 
                  fill="currentColor" 
                  fillRule="evenodd"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : user?.is_manager ? (
          <>
            <Route path="/dashboard" element={<DashboardLayout><ManagerDashboardPage /></DashboardLayout>} />
            <Route path="/projects" element={<DashboardLayout><ProjectsPage /></DashboardLayout>} />
            <Route path="/projects/create" element={<CreateProjectPage />} />
            <Route path="/clients" element={<DashboardLayout><ClientsPage /></DashboardLayout>} />
            <Route path="/employees" element={<DashboardLayout><EmployeesPage /></DashboardLayout>} />
            <Route path="/reviews" element={<DashboardLayout><ReviewsPage /></DashboardLayout>} />
            <Route path="/reviews/:id" element={<ReviewDetailPage />} />
            <Route path="/reviews/:id/edit" element={<EditReviewPage />} />
            <Route path="/reviews/schedule" element={<ScheduleReviewPage />} />
            <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<DashboardLayout><EmployeeDashboardPage /></DashboardLayout>} />
            <Route path="/my-reviews" element={<DashboardLayout><MyReviewsPage /></DashboardLayout>} />
            <Route path="/projects" element={<DashboardLayout><ProjectsPage /></DashboardLayout>} />
            <Route path="/reviews/:id" element={<ReviewDetailPage />} />
            <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
