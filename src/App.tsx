import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import PlayerPage from "./pages/PlayerPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const APP_PASSWORD = "jBOcWU5Qr8q83-e";

const PasswordOverlay = () => {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem("mind_control_app_unlocked") === "true");
  const [hasError, setHasError] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === APP_PASSWORD) {
      localStorage.setItem("mind_control_app_unlocked", "true");
      setIsUnlocked(true);
      return;
    }

    setHasError(true);
    setPassword("");
  };

  if (isUnlocked) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-background px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-bold text-foreground">Enter password</h2>
          <p className="mt-2 text-sm text-muted-foreground">Password required to open Mind Control.</p>
        </div>
        <Input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setHasError(false);
          }}
          autoFocus
          aria-label="App password"
          aria-invalid={hasError}
          placeholder="Password"
          className="text-center"
        />
        {hasError && <p className="mt-3 text-center text-sm text-destructive">Incorrect password</p>}
        <Button type="submit" className="mt-5 w-full">
          Unlock app
        </Button>
      </form>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/player/:hz" element={<PlayerPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <PasswordOverlay />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
