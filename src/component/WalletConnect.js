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
import { isMobile } from "react-device-detect";

import Button from "./Button";
import {
  showSnackbarIndep,
  showExpandBox,
  setLoading,
} from "../redux/actions/uiActions";
import { storeWeb3Context } from "../redux/actions/web3Actions";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import ExpandableBox from "./ExpandableBox";
import { Transition } from "react-transition-group";
import WalletsDialogue from "./WalletsDialogue";
import {
  injected,
  walletconnect,
  walletlink,
  fortmatic,
  portis,
} from "../utils/connectors";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { FortmaticConnector } from "@web3-react/fortmatic-connector";
import { setWeb3Provider } from "../contracts/getContract";
import { walletList } from "../utils/connectors";

const useStyles = makeStyles((theme) => ({
  connectWalletButtonContainer: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  connectWalletButton: {
    width: 250,
    borderRadius: 0,
    backgroundColor: theme.palette.background.primary,
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
}) {
  const classes = useStyles();
  const web3context = useWeb3React();
  const [openBox, setOpenBox] = useState(false);
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  const addressShorten = (address) => {
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(
        address.length - 2,
        address.length
      )}`;
    }
  };

  const activateWallet = useCallback(
    (connector, onClose = () => {}) => {
      // // console.log(connector instanceof InjectedConnector);
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
          console.error("ERROR activateWallet -> ", e);
          setLoading({ walletConnection: false });
        });
    },
    [web3context]
  );

  useEffect(() => {
    if (openBox) {
      showExpandBox();
    }
  }, [openBox]);

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

  // const duration = 300;
  // // const [display,setDisplay]
  // const defaultStyle = {
  //   transition: `opacity ${duration}ms ease-in-out`,
  //   opacity: 0,

  //   display: openBox ? "block" : "none",
  // };
  // const transitionStyles = {
  //   entering: { opacity: 1 },
  //   entered: { opacity: 1 },
  //   exiting: { opacity: 0 },
  //   exited: { opacity: 0 },
  // };

  return (
    <Fragment>
      <Box className={classes.connectWalletButtonContainer}>
        {/* {openBox ? ( */}
        {/* <Transition in={openBox} timeout={duration}>
          {(state) => (
            <span
              style={{
                ...defaultStyle,
                ...transitionStyles[state],
              }}
            > */}
        {/* <ExpandableBox
          open={openBox}
          changeWallet={setOpen}
          web3context={web3context}
          // walletList={walletList}
          activateWallet={activateWallet}
        /> */}
        {/* </span>
          )}
        </Transition> */}
        {/* ) : null} */}
        {/* {openBox ? <ExpandableBox /> : null} */}
        {walletBackdrop ? (
          <Typography variant="body2" className={classes.wallentConnectText}>
            YOU MUST CONNECT YOUR WALLET FIRST
          </Typography>
        ) : null}

        <WalletsDialogue
          // className={classes.connectWalletButton}
          heading={"CHANGE WALLET"}
          web3context={web3context}
          items={walletList}
          activate={activateWallet}
          open={open2}
          setOpen={setOpen2}

          // address={addressShorten(web3context.account)}
        />

        <WalletsDialogue
          className={classes.connectWalletButton}
          heading={
            "CONNECT TO A WALLET"
            // web3context.active || web3context.account
            //   ? `CONNECTED TO ${addressShorten(web3context.account)}`
            //   : "CONNECT TO A WALLET"
          }
          // items={isMobile ? mobileWalletList : walletList}
          activate={activateWallet}
          open={open}
          setOpen={setOpen}
          // address={addressShorten(web3context.account)}
        />

        <Button
          variant="dark"
          className={classes.connectWalletButton}
          // disabled={web3context.active || web3context.account}

          onClick={() => {
            !(active || account) ? setOpen(true) : setOpen2(true);
          }}
          // onClick={() => {
          //   setOpen((val) => !val);
          // }}
          // BackdropComponent={Backdrop}
        >
          {web3context.active
            ? addressShorten(web3context.account)
            : "CONNECT WALLET"}
          {/* {openBox ? (
            <ExpandMore className={classes.expandIcon} />
          ) : (
            <ExpandLess className={classes.expandIcon} />
          )} */}
        </Button>
      </Box>
    </Fragment>
  );
}

const mapStateToProps = ({
  ui: { walletBackdrop },
  web3: { active, account },
}) => ({ walletBackdrop, active, account });

export default connect(mapStateToProps, { storeWeb3Context, setLoading })(
  WalletConnect
);
