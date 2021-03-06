import React, { useState } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@material-ui/core/styles";
import { Web3ReactProvider } from "@web3-react/core";
import { ApolloProvider } from "@apollo/client";
import firebase from "firebase/app";
import "firebase/performance";
import "firebase/analytics";
// import { JSBI } from "@uniswap/sdk";

import { store } from "./reduxStore";
import { getLibrary } from "./web3-react";
import { client } from "./apolloGraphQl";
import Layout from "./Layout";
import Updater from "./Updater";
import {
  toggleThemeModeAction,
  toggleThemeModeActionRetro,
} from "../redux/actions/uiActions";
import { retroTheme, darkTheme, lightTheme } from "./materialUiTheme";

firebase.initializeApp({
  apiKey: "AIzaSyAsJ2mENCiitB5twBkiKE0iNKSoR8lcsAs",
  authDomain: "xio-stakex.firebaseapp.com",
  databaseURL: "https://xio-stakex.firebaseio.com",
  projectId: "xio-stakex",
  storageBucket: "xio-stakex.appspot.com",
  messagingSenderId: "498680612321",
  appId: "1:498680612321:web:7121def3cdfdb372f67ea0",
  measurementId: "G-5JCYFQSWJ7",
});

export const analytics = firebase.analytics();
export const perf = firebase.performance();

export default function App() {
  const theme = localStorage.getItem("themeMode") || "dark";
  if (!theme) {
    localStorage.setItem("themeMode", "dark");
  }
  const [themeMode, setThemeMode] = useState(theme);
  // const [prevThemeMode, setPrevThemeMode] = useState(themeMode);
  const toggleThemeMode = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");

    store.dispatch(toggleThemeModeAction());
  };

  const toggleThemeMode2 = async () => {
    if (themeMode === "retro") {
      // setThemeMode(themeMode === "dark" ? "light" : "dark");
      toggleThemeMode();
    } else {
      setThemeMode("retro");
      store.dispatch(toggleThemeModeActionRetro());
    }
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApolloProvider client={client}>
        <Provider store={store}>
          {/* <ThemeProvider theme={retroTheme}> */}
          <ThemeProvider
            theme={
              themeMode === "retro"
                ? retroTheme
                : themeMode === "dark"
                ? darkTheme
                : lightTheme
            }
          >
            <Updater />
            <Layout
              themeMode={themeMode}
              toggleThemeMode={toggleThemeMode}
              toggleThemeMode2={toggleThemeMode2}
            />
          </ThemeProvider>
        </Provider>
      </ApolloProvider>
    </Web3ReactProvider>
  );
}
