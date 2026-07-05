import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing   from './pages/Landing'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chat      from './pages/Chat'
import Documents from './pages/Documents'
import Analytics from './pages/Analytics'
import Settings  from './pages/Settings'
import Admin     from './pages/Admin'
import History   from './pages/History'
import PublicChat from './pages/PublicChat'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/"            element={<Landing />} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/chat/:slug"  element={<PublicChat />} />

            {/* Protected */}
            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat"        element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/history"     element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/documents"   element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/analytics"   element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings"    element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin"       element={<ProtectedRoute><Admin /></ProtectedRoute>} />

            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
