import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const useLocalStorage = (
  key: string,
  initialValue: string
): [string, Dispatch<SetStateAction<string>>] => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      if (saved) {
        setState(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    if (state !== initialValue) {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [state]);

  return [state, setState];
};
