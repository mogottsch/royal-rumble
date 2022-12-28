/* eslint-disable react/react-in-jsx-scope -- Unaware of jsxImportSource */
/** @jsxImportSource @emotion/react */
import { FormControl, FormHelperText, Input, InputLabel } from "@mui/material";
import { css } from "@emotion/react";

interface InputFieldProps<T> {
  label: string;
  value: T;
  id: string;
  onChange: (value: string) => void;
  htmlFor?: string;
  errorMessages?: string[];
}

export function InputField<T>({
  label,
  value,
  id,
  onChange,
  htmlFor,
  errorMessages,
}: InputFieldProps<T>) {
  return (
    <FormControl
      css={css`
        width: 100%;
      `}
    >
      <InputLabel
        htmlFor={htmlFor}
        error={errorMessages !== undefined && errorMessages.length > 0}
      >
        {label}
      </InputLabel>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
      {errorMessages !== undefined && errorMessages.length > 0 && (
        <FormHelperText error>
          <ErrorMessages errorMessages={errorMessages} />
        </FormHelperText>
      )}
    </FormControl>
  );
}

function ErrorMessages({ errorMessages }: { errorMessages: string[] }) {
  return (
    <ul>
      {errorMessages.map((message) => (
        <li>{message}</li>
      ))}
    </ul>
  );
}
