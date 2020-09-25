import React, { useState } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@material-ui/core/styles";
import { Web3ReactProvider } from "@web3-react/core";
import { ApolloProvider } from "@apollo/client";

import { store } from "./reduxStore";
import { getLibrary } from "./web3-react";
import { client } from "./apolloGraphQl";
import Layout from "./Layout";
import Updater from "./Updater";
import UpdaterTxns from "./UpdaterTxns";
import { toggleThemeModeAction } from "../redux/actions/uiActions";
import { darkTheme, lightTheme } from "./materialUiTheme";

export default function App() {
  const theme = localStorage.getItem("themeMode") || "dark";
  if (!theme) {
    localStorage.setItem("themeMode", "dark");
  }
  const [themeMode, setThemeMode] = useState(theme);

  const toggleThemeMode = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");

    store.dispatch(toggleThemeModeAction());
  };

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApolloProvider client={client}>
        <Provider store={store}>
          <ThemeProvider theme={themeMode === "dark" ? darkTheme : lightTheme}>
            <Updater />
            {/* <UpdaterTxns /> */}
            <Layout themeMode={themeMode} toggleThemeMode={toggleThemeMode} />
          </ThemeProvider>
        </Provider>
      </ApolloProvider>
    </Web3ReactProvider>
  );
}
