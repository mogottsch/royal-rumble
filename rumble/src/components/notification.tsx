import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import { NotificationData } from "../hooks/use_notifications";

export function NotificationDisplayer({
  notificationData,
}: {
  notificationData: NotificationData;
}) {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
    notificationData.clear();
  };
  useEffect(() => {
    if (notificationData.text !== undefined) {
      setOpen(true);
    }
  }, [notificationData.text]);
  return (
    <Snackbar
      open={open}
      onClose={() => handleClose()}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity={notificationData.type}>{notificationData.text}</Alert>
    </Snackbar>
  );
}
