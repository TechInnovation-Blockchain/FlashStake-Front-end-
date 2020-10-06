import React from "react";
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
  useLocation,
} from "react-router-dom";
import { useTransition, animated } from "react-spring";

import { Dashboard, Flashstake } from "../../pages";
import { Navbar } from "../../component";

const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/stake",
    component: Flashstake,
  },
];
const redirectRoute = "/stake";

function AnimatedRoutes() {
  const location = useLocation();
  const transitions = useTransition(location, (location) => location.pathname, {
    from: { opacity: 0, transform: "translate3d(100%,0,0)" },
    enter: { opacity: 1, transform: "translate3d(0%,0,0)" },
    leave: { opacity: 0, transform: "translate3d(-50%,0,0)" },
  });

  return transitions.map(({ item: location, props, key }) => (
    <animated.div key={key} style={props}>
      <Switch location={location}>
        {routes.map((_route) => (
          <Route {..._route} key={_route.path} />
        ))}
        <Route component={() => <Redirect to={redirectRoute} />} />
      </Switch>
    </animated.div>
  ));
}

export default function Routes() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
