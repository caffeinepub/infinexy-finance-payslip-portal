import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminPortal } from "./pages/AdminPortal";
import { EmployeePortal } from "./pages/EmployeePortal";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function AppInner() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    if (showRegister) {
      return <RegisterPage onBack={() => setShowRegister(false)} />;
    }
    return <LoginPage onNavigateRegister={() => setShowRegister(true)} />;
  }

  if (user.isAdmin) {
    return <AdminPortal />;
  }

  return <EmployeePortal />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
      <Toaster richColors />
    </AuthProvider>
  );
}
