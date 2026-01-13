import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00E5FF" },       // neon fintech blue
    secondary: { main: "#6C63FF" },     // premium violet
    background: {
      default: "#0D0F12",
      paper: "#14171C",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#A0A4A8",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },

  shape: {
    borderRadius: 12,
  }
});

export default theme;
