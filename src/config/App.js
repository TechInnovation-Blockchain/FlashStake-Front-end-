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
import { toggleThemeModeAction } from "../redux/actions/uiActions";
import { retroTheme, darkTheme } from "./materialUiTheme";

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

// console.log(JSBI.BigInt("1"));

export const analytics = firebase.analytics();
export const perf = firebase.performance();

export default function App() {
  const theme = localStorage.getItem("themeMode") || "retro";
  if (!theme) {
    localStorage.setItem("themeMode", "retro");
  }
  const [themeMode, setThemeMode] = useState(theme);

  const toggleThemeMode = () => {
    setThemeMode(themeMode === "dark" ? "retro" : "dark");

    store.dispatch(toggleThemeModeAction());
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApolloProvider client={client}>
        <Provider store={store}>
          {/* <ThemeProvider theme={retroTheme}> */}
          <ThemeProvider theme={themeMode === "dark" ? darkTheme : retroTheme}>
            <Updater />
            <Layout themeMode={themeMode} toggleThemeMode={toggleThemeMode} />
          </ThemeProvider>
        </Provider>
      </ApolloProvider>
    </Web3ReactProvider>
  );
}
