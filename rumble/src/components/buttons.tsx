import { Button } from "@mui/material";

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
