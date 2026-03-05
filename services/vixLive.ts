const MESI_IT = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const CACHE_KEY = "vix-live-cache-v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

export type LivePoint = { d: string; v: number };
export type LivePayload = { spot: number | null; history: LivePoint[] };

const YF_URL = "https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX?interval=1mo&range=18mo";

const defaultProxies = [
  `https://corsproxy.io/?url=${encodeURIComponent(YF_URL)}`,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(YF_URL)}`,
];

const readCache = (): LivePayload | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: LivePayload };
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (data: LivePayload): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // ignore quota/private mode errors
  }
};

export const fetchVIXLive = async (): Promise<LivePayload> => {
  const customProxy = import.meta.env.VITE_VIX_PROXY_URL as string | undefined;
  const localProxyCandidates = ["/vix-proxy", "/api/vix-proxy"];
  const customUrls = customProxy
    ? [`${customProxy}${customProxy.includes("?") ? "&" : "?"}url=${encodeURIComponent(YF_URL)}`]
    : [];
  const localUrls = localProxyCandidates.map(
    (p) => `${p}${p.includes("?") ? "&" : "?"}url=${encodeURIComponent(YF_URL)}`,
  );
  const urls = [...customUrls, ...localUrls, ...defaultProxies];

  let json: any = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) continue;
      json = await res.json();
      if (json?.chart?.result?.[0]) break;
    } catch {
      // try next source
    }
  }

  const result = json?.chart?.result?.[0];
  if (!result) {
    const cached = readCache();
    if (cached) return cached;
    throw new Error("Impossibile recuperare VIX live da provider/proxy");
  }

  const spot = result.meta?.regularMarketPrice ?? null;
  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];

  const history: LivePoint[] = timestamps
    .map((ts: number, i: number) => {
      const close = closes[i];
      if (!close || close <= 0) return null;
      const dt = new Date(ts * 1000);
      return {
        d: `${MESI_IT[dt.getMonth()]} ${String(dt.getFullYear()).slice(2)}`,
        v: Math.round(close * 100) / 100,
      };
    })
    .filter(Boolean) as LivePoint[];

  const payload = { spot, history };
  writeCache(payload);
  return payload;
};
