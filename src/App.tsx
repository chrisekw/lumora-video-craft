import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import Templates from "./pages/Templates";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import URLToVideo from "./pages/URLToVideo";
import VideoCloneGenerator from "./pages/VideoCloneGenerator";
import PromptToVideo from "./pages/PromptToVideo";
import UGCVideoCreator from "./pages/UGCVideoCreator";
import ExplainerVideoGenerator from "./pages/ExplainerVideoGenerator";
import SmartVideoGenerator from "./pages/SmartVideoGenerator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/create-project/url-clone" element={<URLToVideo />} />
            <Route path="/create-project/video-clone" element={<VideoCloneGenerator />} />
            <Route path="/create-project/prompt-to-video" element={<PromptToVideo />} />
            <Route path="/create-project/ugc-creator" element={<UGCVideoCreator />} />
            <Route path="/create-project/explainer-video" element={<ExplainerVideoGenerator />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/smart-video" element={<SmartVideoGenerator />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
