import { Button } from "@mui/material";
import { JSX } from "react";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useNotificationContext } from "../contexts/notification_context";
import { useI18n } from "../i18n";

type ParentButtonProps = React.ComponentProps<typeof Button>;

interface ButtonProps extends ParentButtonProps {
  children: JSX.Element | string;
}

export function PrimaryButton(props: ButtonProps) {
  return (
    <Button variant="contained" size="large" {...props}>
      {props.children}
    </Button>
  );
}

export function SecondaryButton(props: ButtonProps) {
  return (
    <Button variant="contained" size="large" {...props} color="secondary">
      {props.children}
    </Button>
  );
}

export function CopyToClipboardButton({ text, label }: { text: string; label: string }) {
  const { t } = useI18n();
  const handleClick = async () => {
    if (!navigator.clipboard) {
      notify(t("bar.copyUnsupported"), "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      notify(t("bar.copied"), "success");
    } catch (error) {
      notify((error as Error).message || t("bar.copyUnsupported"), "error");
    }
  };
  const { notify } = useNotificationContext();

  return (
    <>
      <Button onClick={handleClick} aria-label={label}>
        <ContentPasteIcon />
      </Button>
    </>
  );
}
