import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import App from "./config/App";
import "./assets/css/main.css";
import xordLogo from "./assets/xord-light.png";
import { Typography } from "@material-ui/core";

const AppProtected = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const userInput = prompt("Please Enter The Flash Dapp Password");
    if (userInput == process.env.REACT_APP_PASSWORD) {
      setAuthenticated(true);
    } else {
      setTried(true);
    }
  }, []);

  return authenticated ? (
    <App />
  ) : (
    <div
      style={{
        background: "black",
        color: "white",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {tried ? "AUTHENTICATION FAILED" : "LOADING"}

      <a
        // className={classes.poweredContentContainer}
        href="https://xord.one"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          position: "fixed",
          left: "50%",
          bottom: 15,
          transform: "translateX(-50%)",
          textDecoration: "none",
        }}
      >
        <Typography
          variant="body2"
          //  className={classes.poweredText}
          style={{
            marginBottom: 4,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          POWERED BY
        </Typography>
        <img src={xordLogo} alt="xord.one" width={70} />
      </a>
    </div>
  );
};
ReactDOM.render(<App />, document.getElementById("root"));
