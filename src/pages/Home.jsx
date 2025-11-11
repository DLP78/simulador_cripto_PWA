// src/pages/Home.jsx
import { Link } from 'react-router-dom';

const TOP10 = ['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT','DOGEUSDT','TONUSDT','TRXUSDT','LTCUSDT'];

export default function Home() {
  return (
    <div style={{ padding: 16, color: '#eee' }}>
      <h2>Top 10</h2>
      <ul>
        {TOP10.map(s => (
          <li key={s}><Link to={`/${s}`}>{s}</Link></li>
        ))}
      </ul>
    </div>
  );
}
