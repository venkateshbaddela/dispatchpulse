import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

import { LoginPage } from "./pages/auth/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { ServicesPage } from "./pages/ServicesPage";
import { IncidentDetailPage } from "./pages/IncidentDetailsPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { PublicStatusPage } from "./pages/PublicStatusPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>           
              {/* Public Route */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/status/:slug" element={<PublicStatusPage/>}/>


              {/* Protected Workspace Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/incidents" element={<IncidentsPage/>}/>
                  <Route
                    path="/incidents/:id"
                    element={<IncidentDetailPage />}
                  />
                </Route>
              </Route>

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

