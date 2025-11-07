import { Toaster as Sonner, Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { config } from "./lib/wagmi";
import { Header } from "./components/Header";
import { Router } from "./router/router";
// import { Router } from "./routes/router";

const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#4CAF50',
    '--w3m-border-radius-master': '10px',
  } as any,
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={config}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Header />
            <Router />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </WagmiProvider>
  </QueryClientProvider>
);

export default App;