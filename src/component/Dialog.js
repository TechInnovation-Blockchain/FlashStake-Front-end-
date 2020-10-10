import React, { useEffect } from "react";
import {
  Dialog as MuiDialog,
  IconButton,
  Container,
  Box,
  CircularProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  CheckCircleOutline,
  CancelOutlined,
  ClearOutlined,
  BlockOutlined,
} from "@material-ui/icons";

import Stepper from "./Stepper";

const useStyles = makeStyles((theme) => ({
  closeBtnContainer: {
    display: "flex",
    // justifyContent: "center",
    alignItems: "center",
    position: "relative",
    justifyContent: "flex-end",
    marginBottom: "0 !important",
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: "50%",
    // transform: "translateY(45%)",
    // zIndex: 4,
  },
  dialog: {
    // width: 300,
    textAlign: "center",
    padding: theme.spacing(2),
    paddingBottom: 0,
    backgroundColor: theme.palette.background.primary,
    "&>*": {
      marginBottom: `${theme.spacing(2)}px !important`,
    },
  },

  dialogPaper: {
    maxWidth: 400,
    width: "100vw",
    borderRadius: 0,
  },
  dialogIcon: {
    fontSize: 80,
  },
  redText: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
  },
  greenText: {
    color: theme.palette.text.green,
    fontWeight: 700,
  },
  pendingIcon: {
    marginBottom: theme.spacing(3),
  },
}));

export default function Dialog({
  children,
  open = false,
  onClose = () => {},
  closeTimeout,
  status,
  title = "",
  stepperShown,
  step,
}) {
  const classes = useStyles();

  useEffect(() => {
    if (open && closeTimeout) {
      setTimeout(onClose, closeTimeout);
    }
  }, [closeTimeout, open, onClose]);

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.dialogPaper }}
    >
      <Container maxWidth="xs" className={classes.dialog}>
        <Box className={classes.closeBtnContainer}>
          {/* <Typography variant="body1" className={classes.redText}>
            {title}
          </Typography> */}
          <IconButton
            size="small"
            onClick={onClose}
            className={classes.closeIcon}
          >
            <ClearOutlined />
          </IconButton>
        </Box>
        {stepperShown ? <Stepper step={step} /> : null}
        {status
          ? {
              pending: (
                <CircularProgress size={60} className={classes.pendingIcon} />
              ),
              success: (
                <CheckCircleOutline
                  className={`${classes.dialogIcon} ${classes.greenText}`}
                />
              ),
              failed: (
                <CancelOutlined
                  className={`${classes.dialogIcon} ${classes.redText}`}
                />
              ),
              rejected: (
                <BlockOutlined
                  className={`${classes.dialogIcon} ${classes.redText}`}
                />
              ),
            }[status]
          : null}
        {children}
      </Container>
    </MuiDialog>
  );
}
