import { http, createConfig, createStorage } from "wagmi";
import { mainnet, sepolia, type Chain } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const wagmiStorage = createStorage({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
});

const isDev = import.meta.env.MODE === "development";

const selectedChains = (
  isDev ? [sepolia] : [mainnet, sepolia]
) satisfies readonly [Chain, ...Chain[]];

const selectedTransports = {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
} as const;

export const config = createConfig({
  chains: selectedChains,
  transports: selectedTransports,
  connectors: [
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_REOWN_PROJECT_ID,
      showQrModal: true,
    }),
  ],
  ssr: false,
  storage: wagmiStorage,
});
