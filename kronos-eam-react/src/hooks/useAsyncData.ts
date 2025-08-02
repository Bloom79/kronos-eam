import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for handling async data fetching with loading and error states
 */
export function useAsyncData<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
  const { immediate = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await asyncFunction(...args);
        
        if (isMountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const error = err instanceof Error ? err : new Error('An error occurred');
          setError(error);
          onError?.(error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute, reset };
}