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
  Grid,
  Slider,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { ClearOutlined } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { store } from "../config/reduxStore";
import Button from "./Button";

const {
  ui: { changeApp },
} = store.getState();

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
    background: theme.palette.button.retro,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1),
    position: "relative",
    border: `2px solid ${theme.palette.shadowColor.main}`,
    borderRadius: theme.palette.ButtonRadius.small,
    cursor: "pointer",

    "&:hover": {
      background: theme.palette.button.hover,
    },
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
    // paddingBottom: 0,

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
      padding: theme.spacing(0, 1),
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
  removeBtn: {
    // backgroundColor: theme.palette.button.retro,
    border: "none",
    // height: 35,
    color: theme.palette.buttonText.dark,
    letterSpacing: 2,
    lineHeight: 1.2,
    fontWeight: 700,
    borderRadius: theme.palette.ButtonRadius.small,
  },
  headingBox: {
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.border.secondary}`,
  },
  mainHeading: {
    fontWeight: 900,
  },
  firstBox: {
    backgroundColor: theme.palette.background.liquidity,
    padding: theme.spacing(2),
    borderRadius: 5,
  },
  outerBox: {
    display: "flex",
    width: "100%",
  },
  outerBox2: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: theme.palette.background.liquidity,
    borderRadius: 5,
    // padding: theme.spacing(2),
    height: 60,
  },
  innerBox: {
    width: "100%",
  },
  fontStyle: {
    fontWeight: 900,
  },
  removeText: {
    fontWeight: 900,
  },
  info: {
    textAlign: "left",
    // display: "flex",
  },
  mainCont: {
    margin: "0 !important",
  },
  burnedText: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  fontWeight: {
    fontweight: 700,
  },
}));

export default function RemoveDropDown({
  children,
  closeTimeout,
  items = [],
  onSelect = () => {},
  selectedValue = {},
  disableDrop,
  link,
  type = "stake",
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const history = useHistory();

  const onChangeSearch = ({ target: { value } }) => {
    setSearch(value.toUpperCase());
  };

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
        <Typography
          variant="body1"
          className={classes.removeBtn}
          onClick={() => !disableDrop && !link && setOpen(true)}
        >
          REMOVE
        </Typography>
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
              YOU WILL RECEIVE
            </Typography>

            <IconButton
              size="small"
              onClick={onClose}
              className={classes.backIcon}
            >
              <ArrowBackIcon />
            </IconButton>

            <IconButton
              size="small"
              onClick={onClose}
              className={classes.closeIcon}
            >
              <ClearOutlined />
            </IconButton>
          </Box>
          <Box className={classes.closeBtnContainer}>
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

          <Box className={classes.firstBox}>
            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="h6">
                  0.000905761
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography variant="h6" className={classes.fontStyle}>
                  XIO
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="h3" className={classes.fontStyle}>
            {" "}
            +
          </Typography>

          <Box className={classes.firstBox}>
            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="h6">
                  0.6314
                </Typography>
              </Grid>
              <Grid xs={6} style={{ textAlign: "right" }}>
                <Typography variant="h6" className={classes.fontStyle}>
                  AAVE
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box className={classes.removeBox}>
            <Typography className={classes.removeText} variant="caption">
              Output is estimated. If the price changes by more than 0.5% your
              transaction will revert
            </Typography>
          </Box>

          <Box className={classes.firstBox}>
            <Grid xs={12} className={classes.outerBox}>
              <Grid
                xs={6}
                style={{ textAlign: "left" }}
                className={classes.innerBox}
              >
                <Typography className={classes.fontStyle} variant="h6">
                  XIO / AAVE BURNED
                </Typography>
              </Grid>
              <Grid xs={6} className={classes.burnedText}>
                <Typography variant="h6" className={classes.fontStyle}>
                  0.0230133
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box className={classes.info}>
            <Typography className={classes.fontWeight}>
              1 XIO = 697.58 AAVE
            </Typography>
            <Typography className={classes.fontWeight}>
              1 AAVE = 0.00143333 XIO
            </Typography>
          </Box>

          <Button variant="retro" fullWidth>
            CONFIRM
          </Button>
        </Container>
      </MuiDialog>
    </Fragment>
  );
}
