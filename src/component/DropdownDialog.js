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
  items,
  onSelect = () => {},
  selectedValue = {},
  heading = "SELECT TOKEN",
  disableDrop,
  link,
  _theme,
  poolsApy,
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
  }, [items]);

  const searchExistingToken = (id) => {
    if (
      tokensList.find((_pool) => _pool?.tokenB?.address?.toLowerCase() === id)
    ) {
      return true;
    }
  };

  const searchToken = async (_address) => {
    if (searchExistingToken(_address)) {
    } else {
      if (Web3.utils.isAddress(_address)) {
        await initializeErc20TokenContract(_address);
        const _decimals = await decimals();
        if (_decimals) {
          const _name = await name();
          const _symbol = await symbol();

          // setTokensList({ id: "", tokenB: _token });

          setToken({
            tokenB: {
              id: _address,
              address: _address,
              name: _name,
              symbol: _symbol,
              decimals: _decimals,
            },
          });
        } else {
          setToken({});
        }
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
    // if (tokensURI.name === "Default") {
    if (Web3.utils.isAddress(search)) {
      if (searchExistingToken(search)) {
        return tokensList?.filter((item) =>
          item.tokenB.id.toLowerCase().includes(search)
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
    // } else {
    // return tokensList;
    // }
  }, [search, items, tokensList, pools]);

  const onClose = useCallback(() => {
    if (overrideOpen) {
      setOpenProp(false);
    } else {
      setOpen(false);
    }
  }, []);

  const onSelectLocal = (_pool) => {
    console.log("POOL", _pool);
    onSelect(_pool);
    onClose();
  };

  useEffect(() => {
    if ((overrideOpen ? openProp : open) && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, openProp, overrideOpen, onClose]);

  // {{
  //   if(selectedValue) {
  //     (
  //       <img
  //         src={require(`../assets/Tokens/${selectedValue}.png`)}
  //         alt="Logo"
  //         srcSet=""
  //         width={20}
  //         style={{ marginRight: 5 }}
  //       />
  //     ),
  //       selectedValue;
  //   },
  // }() || <span className={classes.disabledText}>SELECT</span>}
  const tryRequire = (path, add) => {
    try {
      return require(`../assets/Tokens/${path}.png`);
    } catch (err) {
      return require(`../assets/Tokens/NOTFOUND.png`);
    }
  };

  const tryRequireLogo = (path, add) => {
    if (path?.startsWith("ipfs")) {
      const _val = path?.split("//");
      const joined = "https://ipfs.io/ipfs/" + _val[1];
      return joined;
    }
    if (path?.includes("raw.githubusercontent.com/")) {
      // console.log("ADD", Web3.utils.toChecksumAddress(add));
      try {
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${Web3.utils.toChecksumAddress(
          add
        )}/logo.png`;
      } catch (e) {
        // console.log(e);
        return require(`../assets/Tokens/NOTFOUND.png`);
      }

      // return require(`../assets/Tokens/NOTFOUND.png`);
    }
    return path;
  };

  const addTokenToList = useCallback(async () => {
    let _tokenList = [];
    try {
      _tokenList = JSON.parse(await localStorage.getItem("tokenList")) || [];
    } catch (e) {}
    if (
      !_tokenList?.find(
        (_tokenItem) => _tokenItem.address === token?.tokenB?.address
      )
    ) {
      _tokenList.push(token?.tokenB);
      localStorage.setItem("tokenList", JSON.stringify(_tokenList));
      addToTokenList(token);
    }
  }, [token]);

  return (
    <Fragment>
      {link ? (
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
                      // selectedValue?.tokenB?.logoURI ||
                      tryRequireLogo(
                        selectedValue?.tokenB?.logoURI,
                        selectedValue?.tokenB?.address?.toLowerCase()
                      )
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
              ? {
                  /* <IconButton className={classes.dropdownIcon} size="small">
                <ExpandMore fontSize="large" />
              </IconButton> */
                }
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
                    // selectedValue?.tokenB?.logoURI ||
                    tryRequireLogo(
                      selectedValue?.tokenB?.logoURI,
                      selectedValue?.tokenB?.address?.toLowerCase()
                    )
                  }
                  alt="Logo"
                  srcSet=""
                  width={15}
                  style={{ marginRight: 5 }}
                />
                {selectedValue.tokenB.symbol}{" "}
                {history.location.pathname === "/stake" &&
                poolsApy[selectedValue.id]
                  ? `(${
                      parseFloat(poolsApy[selectedValue.id]).toFixed(2) -
                        parseInt(poolsApy[selectedValue.id]) >
                      0
                        ? parseFloat(poolsApy[selectedValue.id]).toFixed(2)
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
              {/* <ExpandMore fontSize="large" /> */}
            </IconButton>
          ) : null}
        </Box>
      )}

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
                  // disabled={
                  //   !pools?.find((_item) => {
                  //     if (
                  //       _item?.tokenB?.id ===
                  //       _pool?.tokenB?.address.toLowerCase()
                  //     ) {
                  //       return true;
                  //     }
                  //   })
                  // }
                >
                  <Typography variant="body1" className={classes.listItemText}>
                    {/* <MonetizationOn /> */}
                    {/* require(`../assets/Tokens/${_pool.tokenB.symbol}.png`) */}
                    <img
                      src={
                        // _pool?.tokenB?.logoURI ||
                        tryRequireLogo(_pool?.tokenB?.logoURI)
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
                      : history.location.pathname === "/stake" &&
                        poolsApy[_pool.id]
                      ? `(${
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
                  onSelectLocal(token);
                }}
                key={token.tokenB.address}
                disabled={
                  !pools?.find((_item) => {
                    if (_item?.tokenB?.id === token.tokenB.address) {
                      return true;
                    }
                  }) || token?.tokenB?.chainId === CONSTANTS.CHAIN_ID

                  // Object.keys(allPoolsData).find((_item) => {
                  //   if (_item === token.address) {
                  //     return true;
                  //   }
                  // })
                }
              >
                <Typography variant="body1" className={classes.listItemText}>
                  {/* <MonetizationOn /> */}
                  {/* require(`../assets/Tokens/${_pool.tokenB.symbol}.png`) */}
                  <img
                    src={
                      token?.tokenB?.logoURI ||
                      tryRequire(token?.tokenB?.symbol)
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
                src={tryRequireLogo(tokensURI?.logo)}
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
}) => ({
  poolsApy,
  pools,
  tokensURI,
  allPoolsData,
  nativePrices,
  tokenList,
});

export default connect(mapStateToProps, { nativePoolPrice, addToTokenList })(
  DropdownDialog
);
