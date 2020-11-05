import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { store } from "../reduxStore";

import { Flashstake, Swap, Pool, Vote } from "../../pages";
import { Navbar, FlashstakePausedMessage } from "../../component";

const getRoutes = (paused) => {
  const {
    web3: { account },
  } = store.getState();

  const allowed = [
    "0xe7Ef8E1402055EB4E89a57d1109EfF3bAA334F5F",
    "0x425b9dBa4b4a355cc063C5105501797C5F50266B",
    "0x88c81290327316D89983EeB9fc9aF63219474a3D",
  ].map((_add) => _add.toLowerCase());

  return [
    {
      path: "/stake",
      component: paused ? FlashstakePausedMessage : Flashstake,
    },
    {
      path: "/swap",
      component: paused ? FlashstakePausedMessage : Swap,
    },
    {
      path: "/pool",
      component: allowed.includes(account?.toLowerCase()) ? Pool : Vote,
    },
    {
      path: "/vote",
      component: Vote,
    },
  ];
};

function Routes({
  contractState,
  themeMode,
  toggleThemeMode,
  account,
  changeApp,
}) {
  const [routes, setRoutes] = useState(getRoutes());
  const redirectRoute = "/stake";

  useEffect(() => {
    setRoutes(getRoutes(contractState));
  }, [contractState, account, changeApp]);

  return (
    <BrowserRouter>
      <Navbar themeMode={themeMode} toggleThemeMode={toggleThemeMode} />
      <Switch>
        {routes.map((_route) => (
          <Route {..._route} key={_route.path} />
        ))}

        <Route exact component={() => <Redirect to={redirectRoute} />} />
      </Switch>
    </BrowserRouter>
  );
}

const mapStateToProps = ({
  contract: { contractState },
  web3: { account, active },
  ui: { changeApp },
}) => ({
  contractState,
  account,
  active,
  changeApp,
});

export default connect(mapStateToProps)(Routes);
