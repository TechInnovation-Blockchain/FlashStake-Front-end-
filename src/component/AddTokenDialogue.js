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
import { ClearOutlined } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { store } from "../config/reduxStore";
import Button from "./Button";
import Web3 from "web3";
import { connect } from "react-redux";
import {
  initializeErc20TokenContract,
  name,
  symbol,
  decimals,
} from "../utils/contractFunctions/erc20TokenContractFunctions";
import { debounce } from "../utils/debounceFunc";

const useStyles = makeStyles((theme) => ({
  primaryText: {
    color: theme.palette.text.primary,
    fontWeight: 700,
    cursor: "Pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    background: theme.palette.background.secondary2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1),
    position: "relative",
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
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
    paddingTop: theme.spacing(2),
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: "70%",
    transform: "translateY(-50%)",
  },
  clearSearch: {
    position: "absolute",
    right: 10,
    top: "65%",
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
  },
  textField: {
    background: theme.palette.background.secondary3,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 8),
      // fontSize: 16,
      lineHeight: 1.5,
      textAlign: "center",
    },
  },
  list: {
    maxHeight: 130,
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

    // "&:hover": {
    //   color: theme.palette.text.primary,
    // },
  },
  listItemText: {
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
  },
  disabledText: {
    // color: theme.palette.xioRed.main,
    color: theme.palette.text.disabled,
    // fontSize: 12,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
  },
  loadingIcon: {
    marginRight: 5,
  },
  tokenInfoHead: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 700,
  },
}));

function AddTokenDialogue({
  children,
  closeTimeout,
  items = [],
  onSelect = () => {},
  selectedValue = {},
  heading = "ADD TOKEN",
  disableDrop,
  link,
  setCreate,
  //   type = "stake",
  setToken: setTokenParent,
  pools,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState({});
  const [exist, setExist] = useState(false);
  const [loader, setLoader] = useState(false);

  const onChangeSearch = ({ target: { value } }) => {
    setSearch(value.toLowerCase());
  };

  const handleClick = () => {
    setTokenParent(token);
    setOpen(false);
  };

  const searchToken = async (_address) => {
    if (searchExistingToken(_address)) {
      setExist(true);
    } else {
      setExist(false);
      if (Web3.utils.isAddress(_address)) {
        setLoader(true);
        await initializeErc20TokenContract(_address);
        const _decimals = await decimals();
        if (_decimals) {
          const _name = await name();
          const _symbol = await symbol();
          setToken({
            address: _address,
            name: _name,
            symbol: _symbol,
            decimals: _decimals,
          });
          setLoader(false);
        } else {
          setToken({});
        }
      } else {
        setToken({});
      }
    }
  };

  const searchExistingToken = (id) => {
    if (pools.find((_pool) => _pool?.tokenB?.id === id)) {
      return true;
    }
  };

  // useEffect(() => {
  //   searchExistingToken("0x4a92183332905bd7a0d09788a0c79e1b7ef866e0");
  // });

  const debouncedSearchToken = useCallback(debounce(searchToken, 500), []);

  useEffect(() => {
    debouncedSearchToken(search);
  }, [search]);

  const filteredData = useCallback(() => {
    return items.filter((item) =>
      item.tokenB?.symbol.toUpperCase().includes(search)
    );
  }, [search, items]);
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onSelectLocal = (_pool) => {
    onSelect(_pool);
    onClose();
  };

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

  const tryRequire = (path) => {
    try {
      return require(`../assets/Tokens/${path}.png`);
    } catch (err) {
      return require(`../assets/Tokens/NOTFOUND.png`);
    }
  };
  return (
    <Fragment>
      <Box
        className={classes.dropdown}
        onClick={() => !disableDrop && !link && setOpen(true)}
      >
        <Typography variant="body1" className={classes.primaryText}>
          {token?.symbol ? (
            <Fragment>
              <img
                src={tryRequire(token?.symbol)}
                alt="Logo"
                srcSet=""
                width={15}
                style={{ marginRight: 5 }}
              />
              {token?.symbol}
            </Fragment>
          ) : (
            <span className={classes.disabledText}>SELECT</span>
          )}
        </Typography>
        {!disableDrop ? (
          <IconButton className={classes.dropdownIcon} size="small">
            {/* <ExpandMore fontSize="large" /> */}
          </IconButton>
        ) : null}
      </Box>

      <MuiDialog
        open={open}
        // open={true}
        onClose={onClose}
        PaperProps={{ className: classes.dialogPaper }}
      >
        <Container maxWidth="xs" className={classes.dialog}>
          <Box className={classes.closeBtnContainer}>
            <Typography variant="body1" className={classes.dialogHeading}>
              {heading}
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
              placeholder="TOKEN ADDRESS"
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
          {token?.decimals ? (
            <Box className={classes.tokenInfo}>
              <Typography variant="body1" className={classes.tokenInfoHead}>
                Token Name:{" "}
                <span className={classes.dialogHeading}>{token?.name}</span>
              </Typography>

              <Typography variant="body1" className={classes.tokenInfoHead}>
                Token Symbol:{" "}
                <span className={classes.dialogHeading}>{token?.symbol}</span>
              </Typography>

              <Typography variant="body1" className={classes.tokenInfoHead}>
                Token Decimals:
                <span className={classes.dialogHeading}>{token?.decimals}</span>
              </Typography>
            </Box>
          ) : exist ? (
            <Typography variant="body2" className={classes.dialogHeading}>
              {" "}
              TOKEN ALREADY EXISTS
            </Typography>
          ) : loader ? (
            <Typography variant="body2" className={classes.dialogHeading}>
              {" "}
              FETCHING TOKEN DETAILS{" "}
              <CircularProgress size={12} color={"inherit"} />
            </Typography>
          ) : (
            <Typography variant="body2" className={classes.dialogHeading}>
              {" "}
              ADD TOKEN ADDRESS TO SEE DETAILS{" "}
            </Typography>
          )}

          <Button
            fullWidth
            variant="retro"
            onClick={handleClick}
            disabled={
              !Web3.utils.isAddress(search) || !token?.decimals || exist
            }
          >
            ADD
          </Button>
        </Container>
      </MuiDialog>
    </Fragment>
  );
}

const mapStateToProps = ({ user: { pools } }) => ({ pools });

export default connect(mapStateToProps, {})(AddTokenDialogue);
