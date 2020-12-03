import { createMuiTheme } from "@material-ui/core/styles";
// import "../assets/fonts/fonts.css";
import { store } from "./reduxStore";

let {
  ui: { changeApp },
} = store.getState();

export const retroTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#ed3293",
    },
    secondary: {
      main: "#171717",
    },
    secondary2: {
      main: "#6cc79b",
    },
    text: {
      primary: "#ffffff",
      primary2: "#000000",
      // secondary: "#d1d1d1",
      // primary: "#000000",
      green: "#6cc79b",
      secondary: "#cccccc",
      secondary2: "#cccccc",
      secondary4: "#696969",
      grey: "#696969",
    },
    action: {
      hover: "#f0f0f0",
    },
    border: {
      main: "#000",
      secondary: "#ffffff1f",
      gray: "#121212",
    },
    button: {
      dark: "#555555",
      red: "#ed3293",
      retro: "#ed3293",

      hover: "#cc1675",
    },
    buttonText: {
      dark: "#ffffff",
      red: "#ffffff",
      retro: "#646464",
    },
    background: {
      primary: "#121212",
      secondary: "#1A1A1A",
      secondary2: "#000000",
      secondary4: "#1a1a1a",
      secondary3: "#000000",
      selected: "#171717",
    },
    xioRed: {
      main: "#ed3293",
    },

    navLink: {
      active: "#ed3293",
    },
    shadowColor: {
      main: "#59e7d5",
      secondary: "#ed3293",
    },
    ButtonRadius: {
      small: 10,
    },
  },

  typography: {
    fontFamily: "ZCOOL QingKe HuangYou",
    fontSize: 13,
    fontWeight: "900",
  },
});

export const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#D89C74",
    },
    secondary: {
      main: "#171717",
    },
    secondary2: {
      main: "#6cc79b",
    },
    text: {
      primary: "#ffffff",
      primary2: "#000000",
      // secondary: "#d1d1d1",
      // primary: "#000000",
      green: "#6cc79b",
      secondary: "#cccccc",
      secondary2: "#cccccc",
      secondary4: "#696969",
      grey: "#696969",
    },
    action: {
      hover: "#f0f0f0",
    },
    border: {
      main: "#000",
      secondary: "#ffffff1f",
      gray: "#121212",
    },
    button: {
      dark: "#555555",
      red: "#D89C74",
      retro: "#D89C74",
      hover: "#d98955",
    },
    buttonText: {
      dark: "#ffffff",
      red: "#ffffff",
    },
    background: {
      primary: "#121212",
      secondary: "#1A1A1A",
      secondary2: "#000000",
      secondary4: "#1a1a1a",
      secondary3: "#000000",
      selected: "#171717",
      liquidity: "#424242",
      disabled: "#000000",
    },
    xioRed: {
      main: "#D89C74",
    },

    navLink: {
      active: "#D89C74",
    },
    shadowColor: {
      main: "transparent",
      secondary: "transparent",
    },
    ButtonRadius: {
      small: 0,
    },
  },
  typography: {
    fontFamily: "Montserrat",
    fontSize: 11,
  },
});

export const lightTheme = createMuiTheme({
  palette: {
    type: "light",
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#171717",
    },
    secondary2: {
      main: "#6cc79b",
    },
    action: {
      hover: "#f0f0f0",
    },
    //----------------------------------------------//
    text: {
      primary: "#000000",
      // secondary: "#cccccc",
      secondary: "#000",
      secondary2: "#1a1a1a",
      secondary4: "#1a1a1a",
      green: "#6cc79b",
      primary2: "#000000",
    },
    xioRed: {
      main: "#e2874a",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f5f5f5",
      secondary3: "#e5e5e5",
      secondary4: "#eeeee",
      secondary2: "#f5f5f5",
      selected: "#e5e5e5",
      liquidity: "#e5e5e5",
      disabled: "#E2E2E2",
    },
    button: {
      dark: "#555555",
      red: "#D89C74",
      retro: "#D89C74",
      hover: "#d98955",
    },
    buttonText: {
      dark: "#ffffff",
      red: "#ffffff",
    },
    border: {
      main: "#e2e2e2",
      secondary: "#0000001f",
    },
    navLink: {
      active: "#e2874a",
    },
    shadowColor: {
      main: "transparent",
      secondary: "transparent",
    },
    ButtonRadius: {
      small: 0,
    },
  },
  typography: {
    fontFamily: "Montserrat",
    fontSize: 11,
  },
});

// export const theme = createMuiTheme({
//   palette: {
//     type: "dark",
//     primary: {
//       main: "#ffffff",
//     },
//     secondary: {
//       main: "#171717",
//     },
//     secondary2: {
//       main: "#6cc79b",
//     },
//     action: {
//       hover: "#f0f0f0",
//     },
//     //----------------------------------------------//
//     text: {
//       primary: "#ffffff",
//       // secondary: "#cccccc",
//       secondary: "#919191",
//       green: "#6cc79b",
//       primary2: "#000000",
//     },
//     xioRed: {
//       main: "#c983d4",
//     },
//     background: {
//       primary: "#000000",
//       secondary: "#000000",
//       secondary2: "#171717",
//     },
//     button: {
//       dark: "#555555",
//       red: "#c983d4",
//     },
//     buttonText: {
//       dark: "#ffffff",
//       red: "#ffffff",
//     },
//     border: {
//       main: "#e2e2e2",
//       secondary: "#0f0f0f",
//     },
//   },
//   typography: {
//     fontFamily: "Lato",
//     fontSize: 12,
//   },
// });
