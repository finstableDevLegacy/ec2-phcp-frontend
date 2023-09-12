import { useLocation } from "@remix-run/react";
import React from "react";

export function useQueryParam() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}
