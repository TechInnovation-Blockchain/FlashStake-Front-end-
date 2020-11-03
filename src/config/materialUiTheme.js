import { createMuiTheme } from "@material-ui/core/styles";
// import "../assets/fonts/fonts.css";

export const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "rgba(201,131,212,1)",
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
      red: "#c983d4",
      retro: "rgba(201,131,212,1)",
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
      main: "rgba(201,131,212,1)",
    },

    navLink: {
      active: "rgba(201,131,212,1)",
    },
    shadowColor: {
      main: "rgba(101,177,193,1)",
      secondary: "rgba(201,131,212,1)",
    },
  },
  typography: {
    fontFamily: "ZCOOL QingKe HuangYou",
    fontSize: 13,
    fontWeight: "900",
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
    },
    button: {
      dark: "#555555",
      red: "#e2874a",
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
  },
  typography: {
    fontFamily: "Montserrat",
    fontSize: 12,
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
