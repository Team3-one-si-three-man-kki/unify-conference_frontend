import { BrowserRouter, Routes, Route } from "react-router-dom";
import TenantDashboard from "./components/layout/TenantDashboard/TenantDashboard";
import { UniconMain as Main } from "./pages/Home/unicon_main";

// 실제 컴포넌트들 import
import UserManagementDashboard from "./pages/UserManagement/UserManagement";
import ModuleMarketplace from "./pages/ModuleMarketplace/ModuleMarketplace";
import AttendanceModule from "./pages/AttendanceModule/AttendanceModule";
import SignUpPage from "./pages/SignUp/SignUpPage";
import LoginPage from "./pages/Login/LoginPage";
import ModuleManagement from "./pages/ModuleManagement/ModuleManagement";
import "./App.css";

// 임시 컴포넌트들

const MeetingPage = () => (
  <div style={{ padding: '20px' }}>
    <h1>미팅 생성</h1>
    <p>미팅 생성 페이지입니다. (개발 예정)</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인페이지는 /main 경로로 변경 */}
        <Route path="/main" element={<Main />} />
        
        <Route path="/" element={<TenantDashboard />}>
          {/* 기본 경로 - 사용자 관리 페이지로 바로 이동 */}
          <Route index element={<UserManagementDashboard />} />
          
          {/* 각 페이지들 */}
          <Route path="users" element={<UserManagementDashboard />} />
          <Route path="modules" element={<ModuleMarketplace />} />
          <Route path="attendance" element={<AttendanceModule />} />
          <Route path="login-custom" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="meeting" element={<MeetingPage />} />
          <Route path="module-management" element={<ModuleManagement />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;