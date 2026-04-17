import { useRouteError } from "react-router-dom";
import { useI18n } from "./i18n";

export default function ErrorPage() {
  const error = useRouteError();
  const { t } = useI18n();
  console.error(error);

  return (
    <div id="error-page">
      <h1>{t("error.title")}</h1>
      <p>{t("error.body")}</p>
      <p>
        {error instanceof Error ? <i>{error.message}</i> : <i>{t("error.unknown")}</i>}
      </p>
    </div>
  );
}
