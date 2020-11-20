import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import App from "./config/App";
import "./assets/css/main.css";

// ReactDOM.render(() => {}, document.getElementById("root"));
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
    </div>
  );
};
ReactDOM.render(<AppProtected />, document.getElementById("root"));
