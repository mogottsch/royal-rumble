import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useLoadingAndErrorStates() {
  const [isLoadingRecord, setIsLoading] = useState<Record<string, boolean>>({});
  const [errorRecord, setError] = useState<Record<string, Error>>({});
  const isFetching = useIsFetching();
  const setKeyLoading = (key: string, value: boolean) => {
    setIsLoading((prev) => ({ ...prev, [key]: value }));
  };
  const setKeyError = (key: string, value: Error) => {
    setError((prev) => ({ ...prev, [key]: value }));
  };
  const [isAnyLoading, setIsAnyLoading] = useState(false);

  useEffect(() => {
    const nKeysLoading = Object.values(isLoadingRecord).filter((v) => v).length;
    const nQueriesFetching = isFetching;
    const nTotal = nKeysLoading + nQueriesFetching;

    setIsAnyLoading(nTotal > 0);
  }, [isLoadingRecord, isFetching]);

  return {
    isLoadingRecord,
    errorRecord,
    setKeyLoading,
    setKeyError,
    isAnyLoading,
  };
}
