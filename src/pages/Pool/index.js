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

function Pool({ animation }) {
  const classes = useStyles();

  useEffect(() => {
    document.title = "Pool - XIO | The Future is at Stake";
  }, []);

  return (
    <PageAnimation in={true} reverse={animation > 0}>
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
const mapStateToProps = () => ({ ui: { animation } }) => ({
  animation,
});

export default connect(mapStateToProps, {})(Pool);
