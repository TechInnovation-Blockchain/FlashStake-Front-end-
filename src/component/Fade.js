import React from "react";
import { useSpring, animated } from "react-spring/web.cjs"; // web.cjs is required for IE 11 support

const Fade = React.forwardRef(function Fade(props, ref) {
  const { in: open, children, onEnter, onExited, ...other } = props;
  const style = useSpring({
    // from: { opacity: 0 },
    // to: { opacity: open ? 1 : 0 },
    transitionDuration: "150ms",
    from: { maxHeight: 0 },
    to: { maxHeight: open ? 130 : 0 },
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
    <animated.div ref={ref} style={{ ...style, overflow: "hidden" }} {...other}>
      {children}
    </animated.div>
  );
});

export default Fade;
