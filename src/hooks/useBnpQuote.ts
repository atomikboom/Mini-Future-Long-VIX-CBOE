import { useCallback, useEffect, useState } from "react";
import { fetchBnpTopFields, type BnpTopFields } from "../services/bnpProduct";

const emptyTopFields: BnpTopFields = {
  priceRef: null,
  lastTrade: null,
  bid: null,
  ask: null,
  minOggi: null,
  maxOggi: null,
  maxAnno: null,
  strike: null,
  knockOut: null,
  scadenza: null,
  quoteTime: null,
};

export const useBnpQuote = () => {
  const [fields, setFields] = useState<BnpTopFields>(emptyTopFields);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await fetchBnpTopFields();
      setFields(data);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const warmup = window.setTimeout(() => {
      void refresh();
    }, 0);
    const id = window.setInterval(refresh, 60 * 1000);
    return () => {
      window.clearTimeout(warmup);
      window.clearInterval(id);
    };
  }, [refresh]);

  return { ...fields, bnpStatus: status, refreshBnp: refresh };
};
