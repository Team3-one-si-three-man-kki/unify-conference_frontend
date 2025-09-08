import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WaitingRoom from './pages/SessionRoom/WaitingRoom';
import { SessionRoom } from './pages/SessionRoom/SessionRoom';
import './App.css';
import TenantDashboard from "./components/layout/TenantDashboard/TenantDashboard";
import { UniconMain as Main } from "./pages/Home/unicon_main";

import AdminLayout from "./components/layout/AdminLayout/AdminLayout";

// 실제 컴포넌트들 import
import UserManagementDashboard from "./pages/UserManagement/UserManagement";
import ModuleMarketplace from "./pages/ModuleMarketplace/ModuleMarketplace";
import AttendanceModule from "./pages/AttendanceModule/AttendanceModule";
import SignUpPage from "./pages/SignUp/SignUpPage"
import LoginPage from "./pages/Login/LoginPage"
import { SessionCreator } from "./pages/session/SessionCreator";
import { SessionManager } from "./components/features/sessionManager/SessionManager";
import ModuleManagement from "./pages/ModuleManagement/ModuleManagement";
import { LoginCustomizer } from "./pages/LoginCustomizer";

import AdminDevLogin from "./pages/Admin/Admin_dev_login";
import TenantManagementSystem from "./pages/Admin/Admin_dev_tenant";
import ModuleManagementSystem from "./pages/Admin/Admin_dev_module";
import ServerAnalyticsDashboard from "./pages/Admin/Admin_dev_server";
import DashboardAnalytics from "./pages/Admin/Admin_dev_dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/waiting/:roomId" element={<WaitingRoom />} />
        <Route path="/session/:roomId" element={<SessionRoom />} />
        {/* 메인페이지는 /main 경로로 변경 */}
        <Route path="/main" element={<Main />} />

        <Route path="/AdminDevLogin" element={<AdminDevLogin />} />

        {/* Admin routes with layout */}
         <Route path="/admin" element={
          <AdminLayout><DashboardAnalytics /></AdminLayout>
        } />
        <Route path="/admin-dashboard" element={
          <AdminLayout><DashboardAnalytics /></AdminLayout>
        } />
        <Route path="/admin-tenant" element={
          <AdminLayout><TenantManagementSystem /></AdminLayout>
        } />
        <Route path="/admin-module" element={
          <AdminLayout><ModuleManagementSystem /></AdminLayout>
        } />
        <Route path="/admin-server" element={
          <AdminLayout><ServerAnalyticsDashboard /></AdminLayout>
        } />

        
        <Route path="/" element={<TenantDashboard />}>
          {/* 기본 경로 - 사용자 관리 페이지로 바로 이동 */}
          <Route index element={<UserManagementDashboard />} />
          
          {/* 각 페이지들 */}
          <Route path="users" element={<UserManagementDashboard />} />
          <Route path="modules" element={<ModuleMarketplace />} />
          <Route path="attendance" element={<AttendanceModule />} />
          <Route path="login-custom" element={<LoginPage />} />
          <Route path="customize-login/:tenantId" element={<LoginCustomizer />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="meeting" element={<SessionCreator />} />
          <Route path="previous-meeting" element={<SessionManager />} />
          <Route path="module-management" element={<ModuleManagement />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
