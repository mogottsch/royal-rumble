import { useEffect, useState } from "react";

interface Props {
  errorUser: unknown;
  isLoadingUser: boolean;
}

export function useStates({ errorUser, isLoadingUser }: Props) {
  const [isLoadingRecord, setIsLoading] = useState<Record<string, boolean>>({});
  const [errorRecord, setError] = useState<Record<string, Error>>({});
  const setKeyLoading = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };
  const setKeyError = (key: string, value: Error) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };
  const [isAnyLoading, setIsAnyLoading] = useState(false);

  useEffect(() => {
    if (!errorUser) {
      const newErrorObj = { ...errorRecord };
      delete newErrorObj["user"];
      setError(newErrorObj);
    } else {
      let newError =
        errorUser instanceof Error ? errorUser : new Error("Unknown error");
      setError((prev) => ({ ...prev, user: newError }));
    }

    setKeyLoading("user", isLoadingUser);
  }, [errorUser, isLoadingUser]);

  useEffect(() => {
    setIsAnyLoading(Object.values(isLoadingRecord).some((v) => v));
  }, [isLoadingRecord]);
  return {
    isLoadingRecord,
    errorRecord,
    setKeyLoading,
    setKeyError,
    isAnyLoading,
  };
}
