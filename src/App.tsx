import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Diario from "./pages/Diario";
import GestioneDiario from "./pages/GestioneDiario";
import Checks from "./pages/Checks";
import Nutrizione from "./pages/Nutrizione";
import Documenti from "./pages/Documenti";
import AllenamentoRedesign from "./pages/AllenamentoRedesign";
import Progressi from "./pages/Progressi";
import InstallApp from "./pages/InstallApp";
import Settings from "./pages/Settings";
import Inizia from "./pages/Inizia";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Navigate to="/diario" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/diario" element={<Diario />} />
            <Route path="/gestionediario" element={<GestioneDiario />} />
            <Route path="/checks" element={<Checks />} />
            <Route path="/nutrizione" element={<Nutrizione />} />
            <Route path="/documenti" element={<Documenti />} />
            <Route path="/allenamento" element={<AllenamentoRedesign />} />
            <Route path="/progressi" element={<Progressi />} />
            <Route path="/install" element={<InstallApp />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/inizia" element={<Inizia />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
