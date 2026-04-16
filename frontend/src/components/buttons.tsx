import { Button } from "@mui/material";
import { JSX } from "react";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useNotificationContext } from "../contexts/notification_context";

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

export function CopyToClipboardButton({ text }: { text: string }) {
  const handleClick = () => {
    if (!navigator.clipboard) {
      notify("Your browser does not support copying to clipboard", "error");
      return;
    }
    navigator.clipboard.writeText(text);
    notify("Copied to clipboard", "success");
  };
  const { notify } = useNotificationContext();

  return (
    <>
      <Button onClick={handleClick}>
        <ContentPasteIcon />
      </Button>
    </>
  );
}
