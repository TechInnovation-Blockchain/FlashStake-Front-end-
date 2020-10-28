import React, { Fragment, useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { PageAnimation } from "../../component";
import AnimateHeight from "react-animate-height";
import { useHistory } from "react-router-dom";
import { setHeightValue } from "../../redux/actions/uiActions";

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

function Vote({ animation, heightVal, setHeightValue }) {
  const classes = useStyles();
  const history = useHistory();
  const ref = useRef(null);
  const [height, setHeight] = useState(heightVal);

  useEffect(() => {
    setHeightValue(ref.current.clientHeight);
  });

  const toggle = () => {
    setHeight(height < 300 ? heightVal : "100%");
  };

  useEffect(() => {
    if (history.location.pathname === "/vote") {
      toggle();
    }
  }, [history.location.pathname]);

  useEffect(() => {
    document.title = "Vote - XIO | The Future is at Stake";
  }, []);

  return (
    <PageAnimation in={true} reverse={animation > 0}>
      <Fragment>
        <AnimateHeight
          id="example-panel"
          duration={700}
          height={heightVal} // see props documentation below
        >
          <Box
            ref={ref}
            className={`${classes.contentContainer} contentContainer1`}
          >
            <Typography variant="h6" className={classes.comingSoon}>
              COMING SOON
            </Typography>
          </Box>
        </AnimateHeight>
      </Fragment>
    </PageAnimation>
  );
}

const mapStateToProps = () => ({ ui: { animation, heightVal } }) => ({
  animation,
  heightVal,
});

export default connect(mapStateToProps, { setHeightValue })(Vote);
