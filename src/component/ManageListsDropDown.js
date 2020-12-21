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
import FLASH from "../assets/Tokens/FLASH.png";
import Button from "./Button";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { CONSTANTS } from "../utils/constants";
import { setTokensURI } from "../redux/actions/uiActions";
import axios from "axios";

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
  backIcon: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.xioRed.main,
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
    maxHeight: "100%",
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

function ManageListsDropDown({
  children,
  closeTimeout,
  items = [],
  onSelect = () => {},
  selectedValue = {},
  heading = "MANAGE TOKENS LIST",
  disableDrop,
  link,
  _theme,
  poolsApy,
  _onClose,
  tokensListApis,
  setTokensURI,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customList, setCustomList] = useState("");
  const [customTokenList, setCustomTokenList] = useState([]);
  const [tokensList, setTokensList] = useState([]);
  const [loader, setLoader] = useState(false);

  const history = useHistory();

  const onChangeSearch = ({ target: { value } }) => {
    setSearch(value.toUpperCase());
  };
  const onChangeCustomList = ({ target: { value } }) => {
    setCustomList(value);
  };

  // useEffect(()=>{

  // })

  const filteredData = useCallback(() => {
    return items.filter((item) =>
      item.tokenB?.symbol.toUpperCase().includes(search)
    );
  }, [search, items]);
  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  // const onBack = () => {
  //   setOpen(false);
  // };

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
    if (path?.startsWith("ipfs")) {
      const _val = path?.split("//");
      const joined = "https://ipfs.io/ipfs/" + _val[1];
      return joined;
    }

    return path;
  };

  // let tokenList = [];
  // try {
  //   tokenList = JSON.parse(await localStorage.getItem("tokenList")) || [];
  // } catch (e) {}
  // if (
  //   !tokenList?.find((_tokenItem) => _tokenItem.address === token.address)
  // ) {
  //   tokenList.push(token);
  //   localStorage.setItem("tokenList", JSON.stringify(tokenList));
  //   setTokensList((_tokenList) => [..._tokenList, token]);
  // }

  const addListToStorage = async (_list) => {
    let tokensListCutoms = [];
    try {
      setLoader(true);
      const res = await axios.get(_list);
      console.log("RESPONSE", res);
      if (res?.data?.name) {
        tokensListCutoms =
          JSON.parse(await localStorage.getItem("CustomTokenList")) || [];

        tokensListCutoms.push({
          name: res?.data?.name,
          uri: _list,
          logoURI: res?.data?.logoURI,
        });
      }
      console.log("RESPONSE", tokensListCutoms);
      localStorage.setItem("CustomTokenList", JSON.stringify(tokensListCutoms));
      getTokensList();
      setLoader(false);
      setCustomList("");
    } catch (e) {
      setLoader(false);
      setCustomTokenList({});
    }
    // console.log("RESPONSE", customTokenList);

    // localStorage.setItem("TokensURL", customTokenList);
  };

  useEffect(() => {
    getTokensList();
  }, [customTokenList]);

  const getTokensList = async () => {
    let userTokens;
    try {
      userTokens = JSON.parse(await localStorage.getItem("CustomTokenList"));
    } catch (e) {}
    setTokensList([...(CONSTANTS.TOKENS_LIST || []), ...(userTokens || [])]);
  };

  return (
    <Fragment>
      <Button
        fullWidth
        variant="retro"
        // disabled={disabled}
        // loading={loadingRedux.pool}
        onClick={() => {
          setOpen(true);
        }}
      >
        CHANGE
      </Button>

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
              placeholder="ADD TOKENS LIST"
              className={classes.textField}
              fullWidth
              value={customList}
              onChange={onChangeCustomList}
            />
          </Box>

          <Button
            fullWidth
            variant="retro"
            disabled={
              !(
                customList?.startsWith("https") ||
                customList?.startsWith("ipfs")
              ) || loader
            }
            loading={loader}
            onClick={() => {
              addListToStorage(customList);
            }}
          >
            ADD
          </Button>

          <List className={classes.list}>
            {tokensList.map((item) => (
              <ListItem
                button
                className={classes.listItem}
                onClick={() => {
                  setTokensURI({
                    uri: item.uri,
                    name: item.name,
                    logo: item.logoURI,
                  });
                  setOpen(false);
                  // onBack();
                }}
                key={item.name}
              >
                <Typography variant="body1" className={classes.listItemText}>
                  <img
                    src={tryRequire(item.logoURI)}
                    // alt={"logo"}
                    srcSet=""
                    width={20}
                    className={classes.tokensLogo}
                    style={{ marginRight: 5 }}
                  />
                  {item.name}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Container>
      </MuiDialog>
    </Fragment>
  );
}

const mapStateToProps = ({ user: { poolsApy }, ui: { tokensListApis } }) => ({
  poolsApy,
  tokensListApis,
});

export default connect(mapStateToProps, { setTokensURI })(ManageListsDropDown);
