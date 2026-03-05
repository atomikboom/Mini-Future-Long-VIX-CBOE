import { useCallback, useEffect, useState } from "react";
import { fetchVIXLive, type LivePoint } from "../services/vixLive";

type LiveStatus = "loading" | "ok" | "error";

export const useVixLive = () => {
  const [liveVix, setLiveVix] = useState<number | null>(null);
  const [liveHistory, setLiveHistory] = useState<LivePoint[]>([]);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>("loading");
  const [liveTs, setLiveTs] = useState("");
  const [liveSource, setLiveSource] = useState("");

  const doFetch = useCallback(async () => {
    setLiveStatus("loading");
    try {
      const { spot, history } = await fetchVIXLive();
      setLiveVix(spot);
      if (history.length > 0) setLiveHistory(history);
      setLiveStatus("ok");
      const now = new Date();
      setLiveTs(
        `${now.toLocaleDateString("it-IT")} ${now.toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      );
      setLiveSource(import.meta.env.VITE_VIX_PROXY_URL ? "Proxy personalizzato" : "Yahoo Finance · ~15 min delay");
    } catch {
      setLiveStatus("error");
    }
  }, []);

  useEffect(() => {
    const warmup = window.setTimeout(() => {
      void doFetch();
    }, 0);
    const id = window.setInterval(doFetch, 5 * 60 * 1000);
    return () => {
      window.clearTimeout(warmup);
      window.clearInterval(id);
    };
  }, [doFetch]);

  return { liveVix, liveHistory, liveStatus, liveTs, liveSource, doFetch };
};
