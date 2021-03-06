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
import { connect } from "react-redux";
import flash from "../assets/FLASH2.svg";
import Flash from "../assets/Tokens/FLASH.png";
import ManageListsDropDown from "./ManageListsDropDown";
import axios from "axios";
import { nativePoolPrice } from "../redux/actions/userActions";
import { trunc } from "../utils/utilFunc";
import Web3 from "web3";
import {
  initializeErc20TokenContract,
  name,
  symbol,
  decimals,
} from "../utils/contractFunctions/erc20TokenContractFunctions";
import { debounce } from "../utils/debounceFunc";
import { fetchTokenList } from "../utils/utilFunc";
import { CONSTANTS } from "../utils/constants";
import { addToTokenList } from "../redux/actions/contractActions";
import { _error } from "../utils/log";
import _ from "lodash";

const useStyles = makeStyles((theme, _theme) => ({
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
    padding: _theme === "retro" ? 7 : 9,
    position: "relative",
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    // boxShadow: `0px 0px 6px 4px ${theme.palette.shadowColor.secondary}`,
  },

  retroDropdown: {
    background: theme.palette.background.secondary2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 7,
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
  },
  textField: {
    background: theme.palette.background.secondary3,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 5),
      // fontSize: 16,
      lineHeight: 1.5,
      textAlign: "center",
    },
  },
  list: {
    maxHeight: 200,
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
  listItemAdd: {
    padding: theme.spacing(1),
    cursor: "pointer",
  },
  loadingIcon: {
    marginRight: 5,
  },
  tokensListBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  DefaultListBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  defaultListText: {
    paddingLeft: theme.spacing(1),
  },
  // tokensLogo: {
  //   filter: "grayscale(1)",

  //   "&:hover": {
  //     filter: "none",
  //   },
  // },
}));

function DropdownDialog({
  children,
  closeTimeout,
  onSelect = () => {},
  selectedValue = {},
  heading = "SELECT TOKEN",
  disableDrop,
  link,
  _theme,
  poolsApy,
  rewardPercent,
  type = "stake",
  tokensURI,
  allPoolsData,
  nativePoolPrice,
  nativePrices,
  pools,
  tokenList,
  addToTokenList,
  overrideOpen,
  openProp,
  setOpenProp,
  initialValues,
  maxTimeDuration,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tokensList, setTokensList] = useState([]);
  const [nativePrice, setNativePrice] = useState();
  const [getTokensLoader, setTokensLoader] = useState(true);
  const [token, setToken] = useState({});

  const history = useHistory();

  useEffect(() => {
    if (pools.length) {
      // setTimeout(() => {
      setTokensLoader(false);
      // }, 10000);
    }
  });

  const updateTokensList = () => {
    setTokensList(
      tokenList.map((_token) => ({
        id: pools.find(
          (_pool) => _pool.tokenB.id === String(_token.address).toLowerCase()
        )?.id,
        tokenB: { ..._token, id: String(_token.address).toLowerCase() },
      }))
    );
  };

  useEffect(updateTokensList, [tokenList]);

  const onChangeSearch = ({ target: { value } }) => {
    setSearch(value);
  };

  useEffect(() => {
    setNativePrice(nativePoolPrice());
  }, [pools]);

  const checkAvailableToken = (id) => {
    let tok = tokensList.find(
      (_pool) => _pool?.tokenB?.address?.toLowerCase() === id?.toLowerCase()
    );
    if (tok) return true;
    else return false;
  };

  const searchExistingToken = (id) => {
    if (checkAvailableToken(id)) {
      return true;
    }
  };

  const getTokenDetails = _.memoize(async (address) => {
    try {
      const _address = String(address).toLowerCase();
      await initializeErc20TokenContract(_address);
      const _decimals = await decimals();
      if (_decimals) {
        const _name = await name();
        const _symbol = await symbol();

        return {
          id: _address,
          address: _address,
          name: _name,
          symbol: _symbol,
          decimals: _decimals,
          logoURI:
            "https://gateway.pinata.cloud/ipfs/QmPjZKfLBxZH5DCnbVM55FNnVeMEwJuP2b1oquMw5z8ECA",
        };
      } else {
        return {};
      }
    } catch (e) {
      _error("ERROR getTokenDetails -> ", e);
      return {};
    }
  });

  const searchToken = async (_address) => {
    if (searchExistingToken(_address)) {
      return true;
    } else {
      if (Web3.utils.isAddress(_address)) {
        const _token = await getTokenDetails(_address);
        setToken({
          id: pools.find((_pool) =>
            _pool.tokenB.id === String(_address).toLowerCase() ? _pool.id : ""
          ),
          tokenB: _token,
        });
      } else {
        setToken({});
      }
    }
  };

  const debouncedSearchToken = useCallback(debounce(searchToken, 500), []);
  useEffect(() => {
    debouncedSearchToken(search);
  }, [search]);

  const filteredData = useCallback(() => {
    if (Web3.utils.isAddress(search)) {
      if (searchExistingToken(search)) {
        return tokensList?.filter((item) =>
          item.tokenB.id.toLowerCase().includes(search.toLowerCase())
        );
      }

      debouncedSearchToken(search);
    }

    return tokensList.filter(
      (item) =>
        item?.tokenB?.symbol?.toUpperCase().includes(search.toUpperCase()) &&
        pools?.find(
          (__item) =>
            __item?.tokenB?.id === String(item.tokenB.address).toLowerCase()
        )
    );
  }, [search, pools, tokensList]);

  const onClose = useCallback(() => {
    if (overrideOpen) {
      setOpenProp(false);
      setSearch("");
    } else {
      setOpen(false);
      setSearch("");
    }
  }, []);

  const onSelectLocal = (_pool) => {
    onSelect(_pool);
    onClose();
  };

  useEffect(() => {
    if ((overrideOpen ? openProp : open) && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, openProp, overrideOpen, onClose]);

  const tryRequire = (path, add) => {
    try {
      return require(`../assets/Tokens/${path}.png`);
    } catch (err) {
      return require(`../assets/Tokens/NOTFOUND.png`);
    }
  };

  const tryRequireLogo = (path, add) => {
    // if(pools.find(add))

    if (path?.startsWith("ipfs")) {
      const _val = path?.split("//");
      const joined = "https://ipfs.io/ipfs/" + _val[1];
      return joined;
    }
    // if (path?.includes("raw.githubusercontent.com/")) {
    //   try {
    //     return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${Web3.utils.toChecksumAddress(
    //       add
    //     )}/logo.png`;
    //   } catch (e) {
    //     return require(`../assets/Tokens/NOTFOUND.png`);
    //   }

    //   // return require(`../assets/Tokens/NOTFOUND.png`);
    // }
    // return path;

    if (path?.includes("raw.githubusercontent.com/")) {
      // try {
      // if (add) {
      //   return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${Web3.utils.toChecksumAddress(
      //     add
      //   )}/logo.png`;
      // }
      // } catch (e) {
      // return require(`../assets/Tokens/NOTFOUND.png`);
      // }

      // return require(`../assets/Tokens/NOTFOUND.png`);
      return path;
    }
    return path;
  };

  const addTokenToList = useCallback(async () => {
    if (!token?.tokenB) {
      return;
    }
    let _tokenList = [];
    try {
      tokenList = JSON.parse(await localStorage.getItem("tokenList")) || [];
    } catch (e) {}
    if (
      !_tokenList?.find(
        (_tokenItem) => _tokenItem.address === token?.tokenB?.address
      )
    ) {
      _tokenList.push(token?.tokenB);
      localStorage.setItem("tokenList", JSON.stringify(_tokenList));
      addToTokenList(token?.tokenB);
      setSearch("");
    }
  }, [token]);

  return (
    <Fragment>
      {/* {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          <Box
            className={
              _theme === "retro" ? classes.retroDropdown : classes.dropdown
            }
            onClick={() =>
              !disableDrop && !link && overrideOpen
                ? setOpenProp(true)
                : setOpen(true)
            }
          >
            <Typography variant="body1" className={classes.primaryText}>
              {selectedValue.tokenB?.symbol ? (
                <Fragment>
                  <img
                    src={
                      tryRequireLogo(selectedValue?.tokenB?.logoURI) ||
                      CONSTANTS.NO_TOKEN_IMAGE
                    }
                    alt="Logo"
                    srcSet=""
                    width={15}
                    style={{ marginRight: 5 }}
                  />
                  {selectedValue.tokenB.symbol}
                </Fragment>
              ) : (
                <span className={classes.disabledText}>ETH</span>
              )}
            </Typography>
            {!disableDrop
              ? ""
               
              : null}
          </Box>
        </a>
      ) : (
        <Box
          className={
            _theme === "retro" ? classes.retroDropdown : classes.dropdown
          }
          onClick={() =>
            !disableDrop && !link && overrideOpen
              ? setOpenProp(true)
              : setOpen(true)
          }
        >
          <Typography variant="body1" className={classes.primaryText}>
            {selectedValue.tokenB?.symbol ? (
              <Fragment>
                <img
                  src={
                    tryRequireLogo(selectedValue?.tokenB?.logoURI) ||
                    CONSTANTS.NO_TOKEN_IMAGE
                  }
                  alt="Logo"
                  srcSet=""
                  width={15}
                  style={{ marginRight: 5 }}
                />
                {selectedValue.tokenB.symbol}{" "}
              
                {history.location.pathname === "/stake"
                  ? rewardPercent &&
                    rewardPercent[selectedValue.id] &&
                    initialValues.days > 0 &&
                    initialValues.quantity > 0
                    ? isNaN(rewardPercent[selectedValue.id])
                      ? "(0%)"
                      : `(${
                          trunc(rewardPercent[selectedValue.id]) > 0
                            ? trunc(rewardPercent[selectedValue.id])
                            : "0"
                        }%)`
                    : isNaN(poolsApy[selectedValue.id])
                    ? "(0%)"
                    : `(${
                        parseFloat(poolsApy[selectedValue.id]).toFixed(2) -
                          parseInt(poolsApy[selectedValue.id]) >
                        0
                          ? poolsApy[selectedValue.id]
                            ? parseFloat(poolsApy[selectedValue.id]).toFixed(2)
                            : 0
                          : parseInt(poolsApy[selectedValue.id])
                      }%)`
                  : null}
              </Fragment>
            ) : (
              <span className={classes.disabledText}>SELECT</span>
            )}
          </Typography>
          {!disableDrop ? (
            <IconButton className={classes.dropdownIcon} size="small">
            </IconButton>
          ) : null}
        </Box>
      )} 
      */}

      <MuiDialog
        open={overrideOpen ? openProp : open}
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
              placeholder="SEARCH TOKEN/ADDRESS"
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

          {filteredData().length && pools.length ? (
            <List className={classes.list}>
              {filteredData().map((_pool) => (
                <ListItem
                  button
                  className={classes.listItem}
                  onClick={() => onSelectLocal(_pool)}
                  key={_pool.id}
                  disabled={
                    !pools?.find((_item) => {
                      if (
                        _item?.tokenB?.id ===
                        _pool?.tokenB?.address.toLowerCase()
                      ) {
                        return true;
                      }
                    }) ||
                    "0xb4467e8d621105312a914f1d42f10770c0ffe3c8" ===
                      _pool.address
                  }
                >
                  <Typography variant="body1" className={classes.listItemText}>
                    <img
                      src={
                        tryRequireLogo(_pool?.tokenB?.logoURI) ||
                        CONSTANTS.NO_TOKEN_IMAGE
                      }
                      alt={_pool.tokenB.symbol}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = tryRequire(_pool?.tokenB?.symbol);
                      }}
                      srcSet=""
                      width={20}
                      className={classes.tokensLogo}
                      style={{ marginRight: 5 }}
                    />
                    {_pool.tokenB.symbol}{" "}
                    {history.location.pathname === "/swap" &&
                    nativePrices.length
                      ? Object.keys(nativePrices).find((_item) => {
                          if (_item === _pool.tokenB.id) {
                            return `$${trunc(nativePrices[_item])}`;
                          }
                        })
                      : history.location.pathname === "/stake"
                      ? isNaN(parseInt(poolsApy[_pool.id]))
                        ? "(0%)"
                        : `(${
                            parseFloat(poolsApy[_pool.id]).toFixed(2) -
                              parseInt(poolsApy[_pool.id]) >
                            0
                              ? parseFloat(poolsApy[_pool.id]).toFixed(2)
                              : parseInt(poolsApy[_pool.id])
                          }%)`
                      : null}
                  </Typography>
                </ListItem>
              ))}
            </List>
          ) : getTokensLoader ? (
            <Typography variant="body1" className={classes.secondaryText}>
              <CircularProgress
                size={12}
                color="inherit"
                className={classes.loadingIcon}
              />{" "}
              GETTING TOKENS
            </Typography>
          ) : token?.tokenB?.decimals ? (
            <List className={classes.list}>
              <ListItem
                button
                className={classes.listItem}
                onClick={() => {
                  onSelectLocal({
                    ...token,
                    id: pools.find((_pool) =>
                      _pool.tokenB.id ===
                      String(token?.tokenB?.address).toLowerCase()
                        ? _pool.id
                        : ""
                    )?.id,
                  });
                }}
                key={token.tokenB.address}
                disabled={
                  !pools?.find((_item) => {
                    if (_item?.tokenB?.id === token.tokenB.address) {
                      return true;
                    }
                  }) ||
                  token?.tokenB?.chainId === CONSTANTS.CHAIN_ID ||
                  "0xb4467e8d621105312a914f1d42f10770c0ffe3c8" === token.address
                  // Object.keys(allPoolsData).find((_item) => {
                  //   if (_item === token.address) {
                  //     return true;
                  //   }
                  // })
                }
              >
                <Typography variant="body1" className={classes.listItemText}>
                  <img
                    src={
                      require(`../assets/Tokens/NOTFOUND.png`) ||
                      CONSTANTS.NO_TOKEN_IMAGE
                    }
                    alt={token.tokenB.symbol}
                    srcSet=""
                    width={20}
                    className={classes.tokensLogo}
                    style={{ marginRight: 5 }}
                  />
                  {token.tokenB.symbol}
                </Typography>
              </ListItem>
              <Typography
                variant="body2"
                className={`${classes.listItemText} ${classes.listItem} ${classes.listItemAdd}`}
                onClick={addTokenToList}
              >
                Add Token To List
              </Typography>
            </List>
          ) : (
            <Typography variant="body1" className={classes.secondaryText}>
              NO TOKENS AVAILABLE
            </Typography>
          )}

          <Box className={classes.tokensListBox}>
            <Box className={classes.DefaultListBox}>
              {}
              <img
                src={
                  tryRequireLogo(tokensURI?.logo) || CONSTANTS.NO_TOKEN_IMAGE
                }
                // src={themeModeflash}
                alt="logo"
                width={tokensURI?.name !== "Default" ? 20 : 10}
                // width={animate ? 30 : 30}
                // className={classes.logo}
                // onClick={() => {
                // toggle();
                // }}
              />{" "}
              <Typography variant="body1" className={classes.defaultListText}>
                {tokensURI?.name}
              </Typography>
            </Box>
            <Box>
              <ManageListsDropDown _onClose={onClose} />
            </Box>
          </Box>
        </Container>
      </MuiDialog>
    </Fragment>
  );
}

const mapStateToProps = ({
  user: { poolsApy, pools, nativePrices },
  ui: { tokensURI },
  query: { allPoolsData },
  contract: { tokenList },
  flashstake: { rewardPercent, initialValues, maxTimeDuration },
}) => ({
  poolsApy,
  pools,
  rewardPercent,
  tokensURI,
  allPoolsData,
  nativePrices,
  tokenList,
  initialValues,
  maxTimeDuration,
});

export default connect(mapStateToProps, { nativePoolPrice, addToTokenList })(
  DropdownDialog
);
