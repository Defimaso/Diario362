import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Diario from "./pages/Diario";
import GestioneDiario from "./pages/GestioneDiario";
import AreaPersonale from "./pages/AreaPersonale";
import Progressi from "./pages/Progressi";
import InstallApp from "./pages/InstallApp";
import Settings from "./pages/Settings";
import Inizia from "./pages/Inizia";
import Guida from "./pages/Guida";
import Upgrade from "./pages/Upgrade";
import Messaggi from "./pages/Messaggi";
import Community from "./pages/Community";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
            <Route path="/" element={<Navigate to="/diario" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/diario" element={<Diario />} />
            <Route path="/gestionediario" element={<GestioneDiario />} />
            <Route path="/checks" element={<Navigate to="/progressi" replace />} />
            <Route path="/area-personale" element={<AreaPersonale />} />
            <Route path="/nutrizione" element={<Navigate to="/area-personale" replace />} />
            <Route path="/documenti" element={<Navigate to="/area-personale" replace />} />
            <Route path="/allenamento" element={<Navigate to="/area-personale" replace />} />
            <Route path="/progressi" element={<Progressi />} />
            <Route path="/install" element={<InstallApp />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/inizia" element={<Inizia />} />
            <Route path="/guida" element={<Guida />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/messaggi" element={<Messaggi />} />
            <Route path="/community" element={<Community />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
