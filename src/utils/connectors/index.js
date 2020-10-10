import { InjectedConnector } from "@web3-react/injected-connector";
// import { NetworkConnector } from "@web3-react/network-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
// import { LedgerConnector } from "@web3-react/ledger-connector";
// import { TrezorConnector } from "@web3-react/trezor-connector";
// import { FrameConnector } from "@web3-react/frame-connector";
// import { AuthereumConnector } from "@web3-react/authereum-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { PortisConnector } from "@web3-react/portis-connector";
// import { SquarelinkConnector } from "@web3-react/squarelink-connector";
// import { TorusConnector } from "@web3-react/torus-connector";

const POLLING_INTERVAL = 12000;
const RPC_URLS = {
  1: process.env.REACT_APP_NETWORK_URL1,
  4: process.env.REACT_APP_NETWORK_URL4,
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

// export const network = new NetworkConnector({
//   urls: { 4: RPC_URLS[4] },
//   defaultChainId: 4,
// });

export const walletconnect = new WalletConnectConnector({
  rpc: { 4: RPC_URLS[4] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
});

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[4],
  appName: "XIOFlashstake",
});

// export const ledger = new LedgerConnector({
//   chainId: 4,
//   url: RPC_URLS[4],
//   pollingInterval: POLLING_INTERVAL,
// });

// export const trezor = new TrezorConnector({
//   chainId: 4,
//   url: RPC_URLS[4],
//   pollingInterval: POLLING_INTERVAL,
// });

// export const frame = new FrameConnector({ supportedChainIds: [4] });

// export const authereum = new AuthereumConnector({ chainId: 4 });

export const fortmatic = new FortmaticConnector({
  apiKey: process.env.REACT_APP_FORTMATIC_KEY,
  chainId: 4,
});

export const portis = new PortisConnector({
  dAppId: process.env.REACT_APP_PORTIS_ID,
  networks: [4],
});

// // export const squarelink = new SquarelinkConnector({
// //   clientId: process.env.SQUARELINK_CLIENT_ID,
// //   networks: [1, 100],
// // });

// export const torus = new TorusConnector({ chainId: 4 });

export const walletList = [
  {
    name: "METAMASK",
    connector: injected,
    connectorType: InjectedConnector,
  },
  {
    name: "WALLETCONNECT",
    connector: walletconnect,
    connectorType: WalletConnectConnector,
  },
  {
    name: "COINBASE",
    connector: walletlink,
    connectorType: WalletLinkConnector,
  },
  {
    name: "FORTMATIC",
    connector: fortmatic,
    connectorType: FortmaticConnector,
  },
  {
    name: "PORTIS",
    connector: portis,
    connectorType: PortisConnector,
  },
];

export const mobileWalletList = [
  {
    name: "WALLETCONNECT",
    connector: walletconnect,
    connectorType: WalletConnectConnector,
  },

  {
    name: "FORTMATIC",
    connector: fortmatic,
    connectorType: FortmaticConnector,
  },
  {
    name: "PORTIS",
    connector: portis,
    connectorType: PortisConnector,
  },
];
