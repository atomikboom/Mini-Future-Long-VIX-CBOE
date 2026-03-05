export type BnpTopFields = {
  priceRef: number | null;
  lastTrade: number | null;
  bid: number | null;
  ask: number | null;
  minOggi: number | null;
  maxOggi: number | null;
  maxAnno: number | null;
  strike: number | null;
  knockOut: number | null;
  scadenza: string | null;
  quoteTime: string | null;
};

const BNP_URL = "https://investimenti.bnpparibas.it/product-details/NLBNPIT31OG6/";

const defaultProxies = [
  `https://corsproxy.io/?url=${encodeURIComponent(BNP_URL)}`,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(BNP_URL)}`,
];

const decodeDate = (iso: string | null | undefined): string | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("it-IT");
};

const getPropsJson = (html: string): any => {
  const m = html.match(/id="container-pdpheaderblock"[^>]*data-react-props="([^"]+)"/i);
  if (!m?.[1]) return null;
  const decoded = atob(m[1]);
  return JSON.parse(decoded);
};

export const fetchBnpTopFields = async (): Promise<BnpTopFields> => {
  const customProxy = import.meta.env.VITE_BNP_PROXY_URL as string | undefined;
  const urls = customProxy
    ? [`${customProxy}${customProxy.includes("?") ? "&" : "?"}url=${encodeURIComponent(BNP_URL)}`]
    : defaultProxies;

  let html = "";
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      html = await res.text();
      if (html.includes("container-pdpheaderblock")) break;
    } catch {
      // try next source
    }
  }

  if (!html) {
    throw new Error("Impossibile recuperare HTML BNP");
  }

  const props = getPropsJson(html);
  if (!props) {
    throw new Error("Impossibile leggere data-react-props BNP");
  }

  const headerRaw = props.initialDataModel?.productHeaderResponse;
  const kvRaw = props.initialDataModel?.productKeyValueRowResponse;
  const header = typeof headerRaw === "string" ? JSON.parse(headerRaw) : headerRaw;
  const keyValue = typeof kvRaw === "string" ? JSON.parse(kvRaw) : kvRaw;

  const hr = header?.result ?? {};
  const hv = hr?.keyFigures ?? {};
  const kr = keyValue?.result ?? {};
  const kv = kr?.keyFigures ?? {};

  const bid = Number.isFinite(hr.bid) ? Number(hr.bid) : null;
  const ask = Number.isFinite(hr.ask) ? Number(hr.ask) : null;
  const mid = bid !== null && ask !== null ? +((bid + ask) / 2).toFixed(4) : null;
  const priceRef = mid ?? hv.referencePrice ?? hr.bidClose ?? hr.askClose ?? null;
  const minOggi = Number.isFinite(kv.dayLow) ? Number(kv.dayLow) : (bid !== null && ask !== null ? Math.min(bid, ask) : null);
  const maxOggi = Number.isFinite(kv.dayHigh) ? Number(kv.dayHigh) : (bid !== null && ask !== null ? Math.max(bid, ask) : null);

  return {
    priceRef: Number.isFinite(priceRef) ? Number(priceRef) : null,
    lastTrade: Number.isFinite(hv.lastPrice) ? Number(hv.lastPrice) : null,
    bid,
    ask,
    minOggi,
    maxOggi,
    maxAnno: Number.isFinite(kv.yearlyHigh) ? Number(kv.yearlyHigh) : null,
    strike: Number.isFinite(hr.first?.strikeAbsolute) ? Number(hr.first.strikeAbsolute) : null,
    knockOut: Number.isFinite(hr.first?.knockOutAbsolute) ? Number(hr.first.knockOutAbsolute) : null,
    scadenza: decodeDate(hr.maturityDate ?? hv.maturityDate),
    quoteTime: hv.lastUpdate ?? null,
  };
};
