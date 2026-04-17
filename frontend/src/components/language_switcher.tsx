import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useI18n } from "../i18n";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  const handleChange = (event: SelectChangeEvent) => {
    const nextLanguage = event.target.value as "en" | "de";
    setLanguage(nextLanguage);
  };

  return (
    <FormControl size="small">
      <Select
        value={language}
        onChange={handleChange}
        displayEmpty
        inputProps={{ "aria-label": t("common.language") }}
        sx={{ minWidth: 104, bgcolor: "rgba(0, 0, 0, 0.18)" }}
      >
        <MenuItem value="en">EN</MenuItem>
        <MenuItem value="de">DE</MenuItem>
      </Select>
    </FormControl>
  );
}
