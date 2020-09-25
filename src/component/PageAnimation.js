import React from "react";
import { useSpring, animated } from "react-spring/web.cjs"; // web.cjs is required for IE 11 support

const PageAnimation = React.forwardRef(function Fade(props, ref) {
  const { in: open, children, onEnter, onExited, reverse, ...other } = props;
  const style = useSpring({
    // from: { opacity: 0 },
    // to: { opacity: open ? 1 : 0 },
    transitionDuration: "150ms",
    from: {
      opacity: 0,
      transform: reverse ? "translate3d(-100%,0,0)" : "translate3d(100%,0,0)",
    },
    to: {
      opacity: 1,
      transform: reverse ? "translate3d(0%,0,0)" : "translate3d(0%,0,0)",
    },
    onStart: () => {
      if (open && onEnter) {
        onEnter();
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited();
      }
    },
  });

  return (
    <animated.div
      ref={ref}
      style={{ ...style, overflow: "hidden", width: "100%" }}
      {...other}
    >
      {children}
    </animated.div>
  );
});

export default PageAnimation;
