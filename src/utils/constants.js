export const CONSTANTS = {
  GRAPHQL_ENDPOINT_URI: "https://server.xio.app:4010/graphql",
  // GRAPHQL_ENDPOINT_URI:
  // "https://api.thegraph.com/subgraphs/name/asadnaeem1/flashstake-protocol-v2",
  WETH_ERC20_ADDRESS: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
  ADDRESS_XIO_RINKEBY: "0xB4467E8D621105312a914F1D42f10770C0Ffe3c8",
  // ADDRESS_XIO_RINKEBY: "0x6bdC644E0dA75E59da0587e13fC806BFB61764Cb",
  FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS:
    "0xa91902085405ce0f648a7eb82045aefc1b7bac01",
  FLASH_PROTOCOL_CONTRACT: "0xEc02f813404656E2A2AEd5BaeEd41D785324E8D0",
  // FLASHSTAKE_PROTOCOL_CONTRACT_ADDRESS:
  // "0x0084f276c585a3cFD1F48a850A8A723dE54274Fd",
  TXN_SERVER: "https://stakexserver.xio.app:3000/addtxnhash",
  MAINNET_ADDRESSES: {
    LINK: "0x514910771af9ca656af840dff83e8264ecf986ca",
    AAVE: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    SNX: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
    UNI: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    YFI: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
    MKR: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    UMA: "0x04fa0d235c4abf4bcf4787af4cf447de572ef828",
    XIO: "0x0f7f961648ae6db43c75663ac7e5414eb79b5704",
    FLASH: "0x0f7f961648ae6db43c75663ac7e5414eb79b5704",
  },
  BALANCE_CONTRACT: "0x3cDA8420E25510765490201E1D054c517D085a7E",
  QUERY_CONTRACT: "0xd92ea80512b6e3ed596c66324eb841e526f5e94b",
  CACHE_SERVER: "https://server.xio.app:3015/getReserves",
  CHAIN_ID: 3,
  NETWORK: "ROPSTEN",

  TOKENS_LIST: [
    {
      name: "Default",
      uri:
        "https://gateway.pinata.cloud/ipfs/QmehgcQBpkFnkNAGfxz22pjm3WG8raVvDwNzEJSDFWDXHo/flash-default-rinkeby.tokenlist.json",
      logoURI:
        "https://gateway.pinata.cloud/ipfs/QmUXXHhTpqc53zF1kXkY1MNr7aUFGL11L1bCM9XSFJkDJk/FLASH.png",
    },

    {
      name: "Flash",
      uri:
        "https://gateway.pinata.cloud/ipfs/QmeEwJKNvMTSSZpSPM1UyVy5ktxdRtNvwQmkkM4rTtBJhh/flashtest.tokenlist.json",
      logoURI:
        "https://gateway.pinata.cloud/ipfs/QmWew1cUQQrpQnRuaf4gbKJt3eVWE4NzxFMbxxpDq7uGei",
    },
    {
      name: "1inch",
      uri:
        "https://bafybeib6dbxeadfyxk6vcqhyhtxlw4zpy5bqjpseg6fc33wks7oyx77n7e.ipfs.dweb.link/",
      logoURI: "https://1inch.exchange/assets/images/logo.png",
    },
    {
      name: "Aave Token List",
      uri:
        "https://bafybeick5mozllkwessstgvebwvqcallrkoiiakrl3agh2lghwapg53dmy.ipfs.dweb.link/",
      logoURI: "ipfs://QmWzL3TSmkMhbqGBEwyeFyWVvLmEo3F44HBMFnmTUiTfp1",
    },
    {
      name: "CMC DeFi",
      uri:
        "https://bafybeia2zujfb5qraeekvil62gxemmzumvigoe4lymtqxo2ey4jdlt3p7i.ipfs.dweb.link/",
      logoURI: "ipfs://QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx",
    },
    {
      name: "CMC Stablecoin",
      uri:
        "https://bafybeihuwebylwuzllrnbes5gkgh3axscj4qadiqwtonrvajycu66ddmye.ipfs.dweb.link/",
      logoURI: "ipfs://QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx",
    },
    {
      name: "CMC200 ERC20",
      uri:
        "https://bafybeiemddci7gzlpxkcjjqy2bpox6qhew4m4wxjvp74alfzxxd6utajoq.ipfs.dweb.link/",
      logoURI: "ipfs://QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx",
    },
    {
      name: "Dharma Token List",
      uri:
        "https://bafybeieuyombtcyzdvjcdfmr5ci4rd77jg3mme5sbwermttgaro4zjoqvu.ipfs.dweb.link/",
      logoURI: "ipfs://QmVSnomsK2wLaFpgDMrLQgvhJ66YR4jrcvW5HjDEc8VVwA",
    },
    {
      name: "Messari Verified",
      uri: "https://messari.io/tokenlist/messari-verified",
      logoURI: "https://messari.io/images/logo_tcr-check.svg",
    },
    {
      name: "MyCrypto Token List",
      uri: "https://uniswap.mycryptoapi.com/",
      logoURI:
        "https://raw.githubusercontent.com/MyCryptoHQ/MyCrypto/master/src/assets/images/favicon.png",
    },
    {
      name: "Synthetix",
      uri:
        "https://bafybeih6fx3z3devax2s3gocepqvogzspqh5w32q4tyn46mp7xolyvdiuy.ipfs.dweb.link/",
      logoURI:
        "https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.5/snx/SNX.svg",
    },
    {
      name: "UMA",
      uri: "https://umaproject.org/uma.tokenlist.json",
      logoURI:
        "https://umaproject.org/assets/images/UMA_square_red_logo_circle.png",
    },
    {
      name: "Zerion Explore",
      uri:
        "https://bafybeie7zq6yerhz4kjdifceszzqoxqakb3pftwjr422zvivkc4wp7evri.ipfs.dweb.link/",
      logoURI:
        "https://token-icons.s3.amazonaws.com/brand/1_z-white_blue-rounded-square.png",
    },
    {
      name: "Uniswap Default List",
      uri: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
      logoURI: "ipfs://QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir",
    },
    {
      name: "Compound",
      uri:
        "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json",
      logoURI:
        "https://raw.githubusercontent.com/compound-finance/token-list/master/assets/compound-interface.svg",
    },
  ],
};
