// src/pages/CoinPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CandleChart from "../components/CandleChart";
import IntervalSelector from "../components/IntervalSelector";
import { fetchKlines, subscribeKlines, intervalMap } from "../services/binance";

export default function CoinPage() {
  const { symbol, interval } = useParams(); // 👈 vem da URL
  const [data, setData] = useState([]);
  const [tick, setTick] = useState(null);

  useEffect(() => {
    if (!symbol || !interval) return;

    let unsub = null;

    (async () => {
      const apiInterval = intervalMap[interval] ?? interval;
      try {
        const klines = await fetchKlines(symbol, apiInterval);
        setData(klines);

        unsub = subscribeKlines(symbol, apiInterval, (k) => {
          setTick({
            time: k.time,
            open: k.open,
            high: k.high,
            low: k.low,
            close: k.close,
          });
        });
      } catch (err) {
        console.error("Erro ao buscar klines:", err);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [symbol, interval]);

  return (
    <div>
      <h2>{symbol}</h2>
      <IntervalSelector currentInterval={interval} />
      <CandleChart data={data} />
    </div>
  );
}
