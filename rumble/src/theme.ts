import { red } from "@mui/material/colors";
import { createTheme, ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
  },
};
// Create a theme instance.
const theme = createTheme(themeOptions);

export default theme;
