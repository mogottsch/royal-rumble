import { useMemo, useState } from "react";

export function useLoadingAndErrorStates() {
  const [isLoadingRecord, setIsLoading] = useState<Record<string, boolean>>({});
  const [errorRecord, setError] = useState<Record<string, Error>>({});
  const setKeyLoading = (key: string, value: boolean) => {
    setIsLoading((previous) => ({ ...previous, [key]: value }));
  };
  const setKeyError = (key: string, value: Error) => {
    setError((previous) => ({ ...previous, [key]: value }));
  };
  const isAnyLoading = useMemo(
    () => Object.values(isLoadingRecord).some(Boolean),
    [isLoadingRecord],
  );

  return {
    isLoadingRecord,
    errorRecord,
    setKeyLoading,
    setKeyError,
    isAnyLoading,
  };
}
