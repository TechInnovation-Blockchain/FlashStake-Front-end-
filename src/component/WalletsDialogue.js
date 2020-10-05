import React, { useEffect, Fragment, useState, useCallback } from "react";
import {
  Dialog as MuiDialog,
  IconButton,
  Container,
  Typography,
  Box,
  List,
  ListItem,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ClearOutlined, ExpandMore, MonetizationOn } from "@material-ui/icons";
import Button from "./Button";
import { isMobile } from "react-device-detect";
import { walletList, mobileWalletList, injected } from "../utils/connectors";
import { InjectedConnector } from "@web3-react/injected-connector";
import { setLoading } from "../redux/actions/uiActions";
import { connect } from "react-redux";
import { fortmatic } from "../utils/connectors";

const useStyles = makeStyles((theme) => ({
  connectWalletButton: {
    width: 250,
    borderRadius: 0,
  },
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 700,
    cursor: "Pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    background: theme.palette.background.secondary,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1),
    position: "relative",
  },
  dropdownIcon: {
    color: theme.palette.xioRed.main,
    position: "absolute",
    right: 0,
    // margin: theme.spacing(1),
    fontWeight: 900,
  },
  closeBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
  },
  clearSearch: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.text.disabled,
  },
  dialogPaper: {
    maxWidth: 400,
    width: "100vw",
    borderRadius: 0,
  },
  dialog: {
    textAlign: "center",
    padding: theme.spacing(2),
    paddingBottom: 0,

    "&>*": {
      marginBottom: theme.spacing(2),
    },
    background: theme.palette.background.primary,
  },
  dialogHeading: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
    padding: "5px 0",
  },
  secondaryHeading: {
    color: theme.palette.text.disabled,
  },
  textField: {
    background: theme.palette.background.secondary3,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 1),
      // fontSize: 16,
      lineHeight: 1.5,
      textAlign: "center",
    },
  },
  list: {
    maxHeight: 500,
    overflowY: "scroll",
    padding: 0,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
    filter: "grayscale(1)",

    "&:hover": {
      filter: "none",
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.secondary3,
    },
  },
  selectedListItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.primary,

    "&:hover": {
      // color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.secondary3,
    },
  },
  listItemText: {
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },

  disabledText: {
    // color: theme.palette.xioRed.main,
    color: theme.palette.text.disabled,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  link: {
    textDecoration: "none",
  },
  loadingIcon: {
    marginRight: 5,
  },
}));

function WalletsDialogue({
  children,
  closeTimeout,
  items = [],
  onSelect = () => {},
  selectedValue = "",
  heading,
  disableDrop,
  link,
  activate = () => {},
  open,
  setOpen,
  web3context,
  loading,
}) {
  const classes = useStyles();
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [loader, setLoader] = useState(false);

  // console.log(loading.walletConnection);

  const onChangeSearch = ({ target: { value } }) => {
    setSearch(value.toUpperCase());
  };

  const walletsItems = isMobile ? mobileWalletList : walletList;

  // const filteredData = useCallback(() => {
  //   return walletsItems.filter(({ name }) =>
  //     name.toUpperCase().includes(search)
  //   );
  // }, [search, walletList]);

  const filteredData = useCallback(() => {
    if (!isMobile) {
      return walletsItems.filter(({ name }) =>
        name.toUpperCase().includes(search)
      );
    } else {
      if (window.ethereum) {
        return [
          {
            name: window?.ethereum?.isMetaMask ? "METAMASK" : "INJECTED",
            connector: injected,
            connectorType: InjectedConnector,
          },
        ];
      } else {
        return mobileWalletList.filter(({ name }) =>
          name.toUpperCase().includes(search)
        );
      }
    }
  }, [search, walletList]);

  const onClose = useCallback(() => {
    // console.log("yolo onClose -> ");
    setOpen(false);
  }, []);

  const onSelectLocal = (symbol, address) => {
    onSelect(symbol, address);
    onClose();
  };

  useEffect(() => {
    // let _fortmatic = walletsItems.find(
    //   (_wallet) => _wallet.connectorType === FortmaticConnector
    // );
    // if (_fortmatic) {
    //   _fortmatic.connector.on("OVERLAY_READY", onClose);
    //   // console.log("yolo");
    // }
    // walletsItems
    //   .find((wallet) => wallet.connectorType === FortmaticConnector)
    //   ?.connector.on("OVERLAY_READY", () => {
    //     setOpen(false);
    //   });
    // if (fortmatic) {
    //   const provider = fortmatic?.getProvider();
    //   // console.log({ fortmatic, provider });
    //   const pollForOverlayReady = setInterval(() => {
    //     if (provider.overlayReady) {
    //       clearInterval(pollForOverlayReady);
    //       // console.log("yadaaaaaaaaaaaaaaaaaaaaa");
    //     }
    //   }, 200);
    //   return () => clearInterval(pollForOverlayReady);
    // }
  }, []);

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

  // useEffect(() => {
  //   walletName(web3context ? selectedWallet : "");
  // }, [web3context]);

  const addressShorten = (address) => {
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(
        address.length - 2,
        address.length
      )}`;
    }
  };

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.dialogPaper }}
    >
      <Container maxWidth="xs" className={classes.dialog}>
        <Box className={classes.closeBtnContainer}>
          <Typography variant="body1" className={classes.dialogHeading}>
            {heading}

            <br />
            {web3context ? (
              <span
                className={classes.secondaryHeading}
              >{`CONNECTED TO ${addressShorten(web3context.account)}`}</span>
            ) : null}
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            className={classes.closeIcon}
          >
            <ClearOutlined />
          </IconButton>
        </Box>

        <Box className={classes.closeBtnContainer}>
          <TextField
            placeholder="SEARCH"
            className={classes.textField}
            fullWidth
            value={search}
            onChange={onChangeSearch}
          />
          {search ? (
            <IconButton
              size="small"
              onClick={() => setSearch("")}
              className={classes.clearSearch}
            >
              <ClearOutlined />
            </IconButton>
          ) : null}
        </Box>

        {filteredData().length ? (
          <List className={classes.list}>
            {filteredData().map(({ name, connector, connectorType }) => (
              <ListItem
                button
                //   onClick={() => onSelectLocal(item, address)}
                key={name}
                onClick={() => {
                  // handleClick(name, connector);
                  setSelectedWallet(name);
                  activate(connector, onClose);
                  // console.log(connector);
                  // defaultSelect(connector);
                }}
                className={
                  !(web3context?.connector instanceof connectorType)
                    ? classes.listItem
                    : classes.selectedListItem
                }
              >
                <Typography variant="body1" className={classes.listItemText}>
                  {/* <MonetizationOn /> */}{" "}
                  {loading.walletConnection &&
                  loading.connector === connector ? (
                    <CircularProgress
                      size={12}
                      color="inherit"
                      className={classes.loadingIcon}
                    />
                  ) : null}
                  <img
                    src={require(`../assets/Wallets/${name}.png`)}
                    alt={name}
                    srcset=""
                    width={20}
                    // className={classes.tokensLogo}
                    style={{ marginRight: 5 }}
                  />
                  {name}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" className={classes.secondaryText}>
            NOTHING TO SHOW
          </Typography>
        )}
      </Container>
    </MuiDialog>
  );
}
const mapStateToProps = ({ ui: { loading } }) => ({ loading });

export default connect(mapStateToProps, { setLoading })(WalletsDialogue);
