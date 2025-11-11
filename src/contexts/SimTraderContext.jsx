// src/contexts/SimTraderContext.jsx
import { createContext, useContext, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useSimTrader = () => useContext(Ctx);

export function SimTraderProvider({ children }) {
  const [balance, setBalance] = useState(10000); // USD fictício
  const [position, setPosition] = useState(null); // { side:'LONG'|'SHORT', qty, avg }
  const [history, setHistory] = useState([]);

  const api = useMemo(() => ({
    balance, position, history,
    buy(qty, price) {
      if (position && position.side === 'SHORT') {
        // fecha/compensa
        const pnl = (position.avg - price) * position.qty;
        setBalance(b => b + pnl);
        setHistory(h => [...h, { type: 'close-short', qty: position.qty, price, pnl, ts: Date.now() }]);
        setPosition(null);
        return;
      }
      const cost = qty * price;
      if (cost > balance) return;
      setBalance(b => b - cost);
      setPosition(p => {
        if (!p) return { side: 'LONG', qty, avg: price };
        const totalQty = p.qty + qty;
        const avg = (p.avg * p.qty + price * qty) / totalQty;
        return { side: 'LONG', qty: totalQty, avg };
      });
      setHistory(h => [...h, { type: 'buy', qty, price, ts: Date.now() }]);
    },
    sell(qty, price) {
      if (position && position.side === 'LONG') {
        const closingQty = Math.min(qty, position.qty);
        const pnl = (price - position.avg) * closingQty;
        setBalance(b => b + pnl + position.avg * closingQty);
        const remaining = position.qty - closingQty;
        setHistory(h => [...h, { type: 'sell', qty: closingQty, price, pnl, ts: Date.now() }]);
        setPosition(remaining > 0 ? { ...position, qty: remaining } : null);
        return;
      }
      // abrir short
      setPosition(p => {
        if (!p) return { side: 'SHORT', qty, avg: price };
        const totalQty = p.qty + qty;
        const avg = (p.avg * p.qty + price * qty) / totalQty;
        return { side: 'SHORT', qty: totalQty, avg };
      });
      setHistory(h => [...h, { type: 'open-short', qty, price, ts: Date.now() }]);
    },
    reset() {
      setBalance(10000); setPosition(null); setHistory([]);
    }
  }), [balance, position, history]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
