import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { connect } from "react-redux";

import { Dashboard, Flashstake, Swap, Pool, Vote } from "../../pages";
import { Navbar, FlashstakePausedMessage } from "../../component";

const getRoutes = (paused) => {
  return [
    {
      path: "/dashboard",
      component: Dashboard,
    },
    {
      path: "/stake",
      component: paused ? FlashstakePausedMessage : Flashstake,
    },
    {
      path: "/swap",
      component: Swap,
    },
    {
      path: "/pool",
      component: Pool,
    },
    {
      path: "/vote",
      component: Vote,
    },
  ];
};

function Routes({ contractState }) {
  const [routes, setRoutes] = useState(getRoutes());
  const redirectRoute = "/stake";

  useEffect(() => {
    setRoutes(getRoutes(contractState));
  }, [contractState]);

  return (
    <BrowserRouter>
      <Navbar />
      <Switch>
        {routes.map((_route) => (
          <Route {..._route} key={_route.path} />
        ))}
        <Route exact component={() => <Redirect to={redirectRoute} />} />
      </Switch>
    </BrowserRouter>
  );
}

const mapStateToProps = ({ contract: { contractState } }) => ({
  contractState,
});

export default connect(mapStateToProps)(Routes);
