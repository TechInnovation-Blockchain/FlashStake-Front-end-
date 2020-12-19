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
import { fetchTokenList, trunc } from "../utils/utilFunc";
import Web3 from "web3";
import {
  initializeErc20TokenContract,
  name,
  symbol,
  decimals,
} from "../utils/contractFunctions/erc20TokenContractFunctions";
import { debounce } from "../utils/debounceFunc";

// const _localStorage = localStorage.getItem("themeMode");

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

function DropdownDialog2({
  children,
  closeTimeout,
  items,
  onSelect = () => {},
  // selectedValue = {},
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
  setToken: setTokenParent,
  pools,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tokensList, setTokensList] = useState([]);
  const [nativePrice, setNativePrice] = useState();
  const [getTokensLoader, setTokensLoader] = useState(true);
  const [token, setToken] = useState({});
  const [exist, setExist] = useState(false);
  const [loader, setLoader] = useState(false);

  const history = useHistory();

  useEffect(() => {
    if (getTokensLoader) {
      setTimeout(() => {
        setTokensLoader(false);
      }, 10000);
    }
  });

  const onChangeSearch = ({ target: { value } }) => {
    setSearch(value.toLowerCase());
  };

  useEffect(() => {
    setNativePrice(nativePoolPrice());
  }, [items]);

  useEffect(() => {
    getTokensList();
  }, [tokensURI, pools]);

  const searchExistingToken = (id) => {
    if (tokensList.find((_pool) => _pool?.address?.toLowerCase() === id)) {
      return true;
    }
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

          // setTokensList({ id: "", tokenB: _token });

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

  const getTokensList = async () => {
    const data = await fetchTokenList(tokensURI.uri);
    if (data?.data?.tokens && pools) {
      setTokensList(data?.data?.tokens);
    }
  };

  const debouncedSearchToken = useCallback(debounce(searchToken, 500), []);

  useEffect(() => {
    debouncedSearchToken(search);
  }, [search]);

  const filteredData = useCallback(() => {
    // if (tokensURI.name === "Default") {
    // if (searchExistingToken(search)) {
    //   return tokensList.filter((item) =>
    //     item.address.toLowerCase.includes(search)
    //   );
    // }
    if (Web3.utils.isAddress(search)) {
      if (searchExistingToken(search)) {
        return tokensList?.filter((item) =>
          item.address.toLowerCase().includes(search)
        );
      }

      debouncedSearchToken(search);
    } else
      return tokensList.filter((item) =>
        item.symbol.toUpperCase().includes(search.toUpperCase())
      );
  }, [search, items, getTokensList]);

  // console.log(filteredData());

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onSelectLocal = (_pool) => {
    // onSelect(_pool);
    setToken(_pool);
    setTokenParent(_pool);
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

  const tryRequireLogo = (path) => {
    if (path?.startsWith("ipfs")) {
      const _val = path?.split("//");
      const joined = "https://ipfs.io/ipfs/" + _val[1];
      return joined;
    }

    return path;
  };

  return (
    <Fragment>
      <Box
        className={
          _theme === "retro" ? classes.retroDropdown : classes.dropdown
        }
        onClick={() => !disableDrop && !link && setOpen(true)}
      >
        <Typography variant="body1" className={classes.primaryText}>
          {token.address ? (
            <Fragment>
              <img
                src={token?.logoURI || tryRequire(token?.symbol)}
                alt="Logo"
                srcSet=""
                width={15}
                style={{ marginRight: 5 }}
              />
              {token.symbol}
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

          {filteredData()?.length ? (
            <List className={classes.list}>
              {filteredData()?.map((_pool) => (
                <ListItem
                  button
                  className={classes.listItem}
                  onClick={() => onSelectLocal(_pool)}
                  key={_pool.address}
                  disabled={pools?.find(
                    (_item) =>
                      _item?.tokenB?.id === String(_pool.address).toLowerCase()
                  )}
                >
                  <Typography variant="body1" className={classes.listItemText}>
                    {/* <MonetizationOn /> */}
                    {/* require(`../assets/Tokens/${_pool.tokenB.symbol}.png`) */}
                    <img
                      src={_pool?.logoURI}
                      alt={_pool?.symbol}
                      srcSet=""
                      width={20}
                      className={classes.tokensLogo}
                      style={{ marginRight: 5 }}
                    />
                    {_pool.symbol}
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
          ) : token.decimals ? (
            <List className={classes.list}>
              <ListItem
                button
                className={classes.listItem}
                onClick={() => onSelectLocal(token)}
                key={token?.address}
                disabled={
                  pools?.find((_item) => {
                    if (_item?.tokenB?.id === token.address) {
                      return true;
                    }
                  }) || allPoolsData[token.address]

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
                    src={tryRequire(token?.symbol)}
                    alt={token?.symbol}
                    srcSet=""
                    width={20}
                    className={classes.tokensLogo}
                    style={{ marginRight: 5 }}
                  />
                  {token.symbol}
                </Typography>
              </ListItem>
            </List>
          ) : (
            <Typography variant="body1" className={classes.secondaryText}>
              NO TOKENS AVAILABLE
            </Typography>
          )}

          <Box className={classes.tokensListBox}>
            <Box className={classes.DefaultListBox}>
              <img
                src={tokensURI?.logo}
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
}) => ({
  poolsApy,
  pools,
  tokensURI,
  allPoolsData,
  nativePrices,
});

export default connect(mapStateToProps, { nativePoolPrice })(DropdownDialog2);
