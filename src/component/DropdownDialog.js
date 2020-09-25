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
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ClearOutlined, ExpandMore, MonetizationOn } from "@material-ui/icons";

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
    fontSize: 12,
  },
  secondaryText: {
    color: theme.palette.text.secondary,
    fontWeight: 700,
  },
  link: {
    textDecoration: "none",
  },
  // tokensLogo: {
  //   filter: "grayscale(1)",

  //   "&:hover": {
  //     filter: "none",
  //   },
  // },
}));

export default function DropdownDialog({
  children,
  closeTimeout,
  items = [],
  onSelect = () => {},
  selectedValue = "",
  heading = "SELECT TOKEN",
  disableDrop,
  link,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const onChangeSearch = ({ target: { value } }) => {
    setSearch(value.toUpperCase());
  };

  const filteredData = useCallback(() => {
    return items.filter((item) => item.symbol.toUpperCase().includes(search));
  }, [search, items]);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  const onSelectLocal = (symbol, address) => {
    onSelect(symbol, address);
    onClose();
  };

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

  // {{
  //   if(selectedValue) {
  //     (
  //       <img
  //         src={require(`../assets/Tokens/${selectedValue}.png`)}
  //         alt="Logo"
  //         srcset=""
  //         width={20}
  //         style={{ marginRight: 5 }}
  //       />
  //     ),
  //       selectedValue;
  //   },
  // }() || <span className={classes.disabledText}>SELECT</span>}

  return (
    <Fragment>
      {/* <Box
        className={classes.dropdown}
        onClick={() => !disableDrop && setOpen(true)}
      >
        <Typography variant="body1" className={classes.primaryText}>
          {selectedValue ? (
            <Fragment>
              <img
                src={require(`../assets/Tokens/${selectedValue}.png`)}
                alt="Logo"
                srcset=""
                width={15}
                style={{ marginRight: 5 }}
              />
              {selectedValue}
            </Fragment>
          ) : (
            <span className={classes.disabledText}>SELECT</span>
          )}
        </Typography>
        {!disableDrop ? (
          <IconButton className={classes.dropdownIcon} size="small">
            <ExpandMore fontSize="large" />
          </IconButton>
        ) : null}
      </Box> */}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.link}
        >
          <Box
            className={classes.dropdown}
            onClick={() => !disableDrop && !link && setOpen(true)}
          >
            <Typography variant="body1" className={classes.primaryText}>
              {selectedValue ? (
                <Fragment>
                  <img
                    src={require(`../assets/Tokens/${selectedValue}.png`)}
                    alt="Logo"
                    srcset=""
                    width={15}
                    style={{ marginRight: 5 }}
                  />
                  {selectedValue}
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
          className={classes.dropdown}
          onClick={() => !disableDrop && !link && setOpen(true)}
        >
          <Typography variant="body1" className={classes.primaryText}>
            {selectedValue ? (
              <Fragment>
                <img
                  src={require(`../assets/Tokens/${selectedValue}.png`)}
                  alt="Logo"
                  srcset=""
                  width={15}
                  style={{ marginRight: 5 }}
                />
                {selectedValue}
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
        open={open}
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
          {filteredData().length ? (
            <List className={classes.list}>
              {filteredData().map(({ symbol: item, address }) => (
                <ListItem
                  button
                  className={classes.listItem}
                  onClick={() => onSelectLocal(item, address)}
                  key={item}
                >
                  <Typography variant="body1" className={classes.listItemText}>
                    {/* <MonetizationOn /> */}

                    <img
                      src={require(`../assets/Tokens/${item}.png`)}
                      alt={item}
                      srcset=""
                      width={20}
                      className={classes.tokensLogo}
                      style={{ marginRight: 5 }}
                    />
                    {item}
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
    </Fragment>
  );
}
