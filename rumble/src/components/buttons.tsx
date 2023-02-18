import { Button, Snackbar } from "@mui/material";
import { useState } from "react";
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
    <Button variant="outlined" size="large" {...props}>
      {props.children}
    </Button>
  );
}

export function CopyToClipboardButton() {
  const handleClick = () => {
    navigator.clipboard.writeText(window.location.toString());
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
