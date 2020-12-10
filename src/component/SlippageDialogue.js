import React, { useEffect, useState, useCallback } from "react";
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
  Grid,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ClearOutlined } from "@material-ui/icons";
import { isMobile } from "react-device-detect";
import { walletList, mobileWalletList, injected } from "../utils/connectors";
import { InjectedConnector } from "@web3-react/injected-connector";
import { setLoading, setBtn } from "../redux/actions/uiActions";
import { setSlip } from "../redux/actions/flashstakeActions";
import { connect } from "react-redux";
import Button from "./Button";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { store } from "../config/reduxStore";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import Brightness4Icon from "@material-ui/icons/Brightness4";
// , Brightness4Icon }
// import { toggleThemeModeAction } from "../redux/actions/uiActions";

// import Brightness4Icon from '@material-ui/icons';

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
    top: 0,
    // top: "50%",
    // transform: "translateY(-50%)",
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
  slippageHeading: {
    color: theme.palette.text.disabled,
  },
  _slippageButton: {
    width: "70%",
    backgroundColor: theme.palette.background.disabled,
    boxShadow: `none !important`,
    border: `none !important`,
    color: theme.palette.text.primary,
  },
  slippageButton: {
    width: "70%",
    backgroundColor: theme.palette.button.selected,
  },
  themeBtn: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  themeTxt: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  toggleText: { fontWeight: 700 },
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

  textField2: {
    background: theme.palette.background.secondary3,
    "& .MuiInputBase-input": {
      height: 36,
      fontWeight: "700 !important",
      padding: theme.spacing(0, 1),
      // fontSize: 16,
      color: theme.palette.text.disabled,
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
  perc: {
    position: "absolute",
    top: "58%",
    right: "34%",
  },
  sipBox: {
    position: "relative",
  },
  "input.MuiInputBase-input.MuiInput-input": {
    color: "000",
  },
}));

function SlippageDialogue({
  closeTimeout,
  open,
  setOpen,
  setSlip,
  slip,
  toggleThemeMode,
  theme,
  btn,
  setBtn,
}) {
  const classes = useStyles();
  // const [search, setSearch] = useState("");
  // const [slip, setSlip] = useState();
  const [selected, setSelected] = useState(false);
  const [_btn, _setBtn] = useState(btn);
  const [_slip, _setSlip] = useState(slip);
  const [_disabled, _setDisabled] = useState(true);
  const [__disabled, __setDisabled] = useState(true);

  const onChangeSlip = ({ target: { value } }) => {
    if (value <= 50) {
      _setBtn(value);
      _setSlip(value);
    }
  };

  // useEffect(() => {
  //   btnSelect(btn, slip);
  // }, []);

  const handleKeyDown = (evt) => {
    ["+", "-", "e"].includes(evt.key) && evt.preventDefault();
  };

  const onClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
    _setBtn(btn);
    _setSlip(slip);
  }, [closeTimeout, open, onClose]);

  const addressShorten = (address) => {
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(
        address.length - 4,
        address.length
      )}`;
    }
  };

  const onButtonClick = () => {
    setSlip(_slip);
    setBtn(_btn);
    onClose();
  };

  const btnSelect = (id, slip) => {
    _setDisabled(true);
    _setBtn(id);
    _setSlip(slip);
  };
  const regex = /^\d*(.(\d{1,18})?)?$/;

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.dialogPaper }}
    >
      <Container maxWidth="xs" className={classes.dialog}>
        <Box className={classes.closeBtnContainer}>
          <Typography variant="h6" className={classes.dialogHeading}>
            Transaction Settings
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            className={classes.closeIcon}
          >
            <ClearOutlined />
          </IconButton>
        </Box>

        <Grid container xs={12}>
          <Grid item xs={3}>
            <Button
              variant={"retro"}
              className={
                _btn == 0.1 ? classes.slippageButton : classes._slippageButton
              }
              onClick={() => btnSelect(0.1, 0.1)}
              // disabled={_slip.length > 0}
            >
              0.1%
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant={"retro"}
              className={
                _btn == 0.5 ? classes.slippageButton : classes._slippageButton
              }
              onClick={() => btnSelect(0.5, 0.5)}
              // disabled={_slip.length > 0}
            >
              0.5%
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant={"retro"}
              className={
                _btn == 1 ? classes.slippageButton : classes._slippageButton
              }
              onClick={() => btnSelect(1, 1)}
              // disabled={_slip.length > 0}
            >
              1%
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant={"retro"}
              className={
                _btn == 5 ? classes.slippageButton : classes._slippageButton
              }
              onClick={() => btnSelect(5, 5)}
              // disabled={_slip.length > 0}
            >
              5%
            </Button>
          </Grid>
        </Grid>

        <Box className={classes.sipBox}>
          <Typography
            variant="h6"
            style={{ paddingBottom: 5 }}
            className={classes.slippageHeading}
          >
            Custom Slippage(%)
          </Typography>
          <TextField
            placeholder={`${slip}`}
            className={!_disabled ? classes.textField : classes.textField2}
            fullWidth
            value={_slip}
            onChange={onChangeSlip}
            type="number"
            inputMode="numeric"
            pattern={regex}
            onKeyDown={handleKeyDown}
            onClick={() => {
              _setDisabled(false);
              __setDisabled(true);
            }}
            // onFocus={(e) => (e.target.placeholder = "")}
            onBlur={() => _setDisabled(true)}
          />
        </Box>
        <Button
          variant={"retro"}
          fullWidth
          // className={}
          onClick={onButtonClick}
          // disabled={}
        >
          Confirm
        </Button>

        {theme === "dark" || theme === "light" ? (
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6} className={classes.themeTxt}>
              <Typography className={classes.toggleText} variant="body1">
                Toggle Theme
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Box
                variant={"retro"}
                className={classes.themeBtn}

                // disabled={_btn === 0}
              >
                {theme === "dark" ? (
                  <Brightness4Icon onClick={toggleThemeMode} fontSize="large" />
                ) : (
                  <Brightness7Icon onClick={toggleThemeMode} fontSize="large" />
                )}
              </Box>
            </Grid>
          </Grid>
        ) : null}
      </Container>
    </MuiDialog>
  );
}
const mapStateToProps = ({
  ui: { loading, theme, btn },
  flashstake: { slip },
}) => ({
  loading,
  slip,
  theme,
  btn,
});

export default connect(mapStateToProps, { setLoading, setSlip, setBtn })(
  SlippageDialogue
);
