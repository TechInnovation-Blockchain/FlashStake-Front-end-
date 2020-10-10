import React, { Fragment, useEffect } from "react";
import { connect } from "react-redux";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { PageAnimation } from "../../component";

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    padding: theme.spacing(4),
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    // height: "200px",
  },
  comingSoon: {
    color: theme.palette.xioRed.main,
    fontWeight: 700,
  },
}));

function Vote() {
  const classes = useStyles();

  useEffect(() => {
    document.title = "Vote - XIO | The Future is at Stake";
  }, []);

  return (
    <PageAnimation in={true}>
      <Fragment>
        <Box className={classes.contentContainer}>
          <Typography variant="h6" className={classes.comingSoon}>
            COMING SOON
          </Typography>
        </Box>
      </Fragment>
    </PageAnimation>
  );
}

const mapStateToProps = () => ({});

export default connect(mapStateToProps, {})(Vote);
