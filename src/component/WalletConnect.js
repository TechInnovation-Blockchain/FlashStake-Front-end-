import React, { useEffect, useCallback, Fragment, useState } from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError,
} from "@web3-react/injected-connector";
import { connect } from "react-redux";

import Button from "./Button";
import { showSnackbarIndep, setLoading } from "../redux/actions/uiActions";
import { storeWeb3Context } from "../redux/actions/web3Actions";
import WalletsDialogue from "./WalletsDialogue";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { setWeb3Provider } from "../contracts/getContract";
import { walletList } from "../utils/connectors";
import { _error } from "../utils/log";
import SettingsIcon from "@material-ui/icons/Settings";
import SlippageDialogue from "./SlippageDialogue";

const useStyles = makeStyles((theme) => ({
  connectWalletButtonContainer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  // BtnsContainer: {
  //   display: "flex",
  // },
  connectWalletButton: {
    width: 200,
    borderRadius: 0,
    marginTop: theme.spacing(4),
    marginRight: theme.spacing(1),
    // backgroundColor: theme.palette.,
  },
  slippageButton: {
    width: 20,
    borderRadius: 0,
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(1),
    // backgroundColor: theme.palette.,
  },
  wallentConnectText: {
    color: theme.palette.xioRed.main,
    // fontSize: 15,
    padding: 10,
    // display: "flex",
    alignItems: "center",
  },
  expandIcon: {
    position: "absolute",
    right: 20,
    zIndex: 10,
  },
}));

function WalletConnect({
  storeWeb3Context,
  walletBackdrop,
  active,
  account,
  getBalance,
  balance,
  loading,
  setLoading,
  changeApp,
  toggleThemeMode,
}) {
  const classes = useStyles();
  const web3context = useWeb3React();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const addressShorten = (address) => {
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(
        address.length - 4,
        address.length
      )}`;
    }
  };

  const activateWallet = useCallback(
    (connector, onClose = () => {}) => {
      setLoading({
        walletConnection: true,
        connector: connector ? connector : InjectedConnector,
      });

      if (
        connector instanceof WalletConnectConnector &&
        connector.walletConnectProvider?.wc?.uri
      ) {
        connector.walletConnectProvider = undefined;
      } else if (connector instanceof FortmaticConnector) {
        onClose();
      }
      web3context
        .activate(
          connector
            ? connector
            : new InjectedConnector({
                supportedChainIds: [1, 3, 4, 5, 42],
              }),
          // walletconnect
          undefined,
          true
        )
        .then(() => {
          setLoading({ walletConnection: false });
        })
        .catch((e) => {
          let error = "";
          if (e instanceof UnsupportedChainIdError) {
            error = "Unsupported Network";
          } else if (e instanceof NoEthereumProviderError) {
            error = "No Wallet Found";
          } else if (e instanceof UserRejectedRequestError) {
            error = "Wallet Connection Rejected";
          } else if (e.code === -32002) {
            error = "Wallet Connection Request Pending";
          } else {
            error = "An Error Occurred";
          }
          showSnackbarIndep(error, "error");
          _error("ERROR activateWallet -> ", e);
          setLoading({ walletConnection: false });
        });
    },
    [web3context, setLoading]
  );

  useEffect(() => {
    storeWeb3Context(web3context);
    if (web3context?.library?.provider) {
      setWeb3Provider(web3context.library.provider);
    }
    if (web3context?.error) {
      web3context.deactivate();
    }
    if (web3context.active || web3context.account) {
      setOpen(false);
    }
  }, [web3context, storeWeb3Context]);

  useEffect(() => {
    activateWallet();
  }, []);

  return (
    <Fragment>
      <Box className={classes.connectWalletButtonContainer}>
        {walletBackdrop ? (
          <Typography variant="body2" className={classes.wallentConnectText}>
            YOU MUST CONNECT YOUR WALLET FIRST
          </Typography>
        ) : null}

        <WalletsDialogue
          heading={"CHANGE WALLET"}
          web3context={web3context}
          items={walletList}
          activate={activateWallet}
          open={open2}
          setOpen={setOpen2}
        />

        <WalletsDialogue
          className={classes.connectWalletButton}
          heading={"CONNECT TO A WALLET"}
          activate={activateWallet}
          open={open}
          setOpen={setOpen}
        />

        <SlippageDialogue
          open={open3}
          setOpen={setOpen3}
          toggleThemeMode={toggleThemeMode}
        />

        <Box className={classes.BtnsContainer}>
          <Button
            variant={!changeApp ? "retro" : "red"}
            className={classes.connectWalletButton}
            onClick={() => {
              !(active || account) ? setOpen(true) : setOpen2(true);
            }}
          >
            {web3context.active
              ? addressShorten(web3context.account)
              : "CONNECT WALLET"}
          </Button>

          <Button
            variant={!changeApp ? "retro" : "red"}
            className={classes.slippageButton}
            onClick={() => {
              setOpen3(true);
            }}
          >
            <SettingsIcon />
          </Button>
        </Box>
      </Box>
    </Fragment>
  );
}

const mapStateToProps = ({
  ui: { walletBackdrop, changeApp },
  web3: { active, account },
}) => ({ walletBackdrop, active, account, changeApp });

export default connect(mapStateToProps, { storeWeb3Context, setLoading })(
  WalletConnect
);
