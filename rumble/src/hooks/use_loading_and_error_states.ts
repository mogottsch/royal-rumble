import { useEffect, useState } from "react";

export function useLoadingAndErrorStates() {
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
