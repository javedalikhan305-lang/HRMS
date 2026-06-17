import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Attendance from './pages/Attendance';
import Profile from './pages/Profile';
import Leave from './pages/Leave';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Employees from './pages/Employees';
import Org from './pages/Org';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Approvals from './pages/Approvals';
import Onboarding from './pages/Onboarding';
import UsersRoles from './pages/UsersRoles';
import Workflows from './pages/Workflows';
import AIAssistant from './pages/AIAssistant';

import RegisterUser from './pages/RegisterUser';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="org" element={<Org />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="documents" element={<Documents />} />
            <Route path="team" element={<Team />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="register-user" element={<RegisterUser />} />
            <Route path="roles" element={<UsersRoles />} />
            <Route path="workflows" element={<Workflows />} />
            <Route path="ai" element={<AIAssistant />} />
          </Route>
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
