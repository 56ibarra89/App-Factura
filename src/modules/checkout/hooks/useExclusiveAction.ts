import { useCallback, useRef } from "react";

export type RunExclusiveAction = (
  action: () => Promise<void>,
) => Promise<boolean>;

export function useExclusiveAction() {
  const processingRef = useRef(false);

  const runExclusive = useCallback<RunExclusiveAction>(async (action) => {
    if (processingRef.current) return false;

    processingRef.current = true;

    try {
      await action();
      return true;
    } finally {
      processingRef.current = false;
    }
  }, []);

  return { runExclusive };
}
