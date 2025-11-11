import React, { useState, useEffect } from 'react';

// Estilos básicos para a tabela (opcional, mas ajuda na aparência)
const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    fontSize: '16px',
  },
  th: {
    borderBottom: '2px solid #ddd',
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa'
  },
  td: {
    borderBottom: '1.5px solid #ddd',
    padding: '12px',
    textAlign: 'left',
  },
  image: {
    width: '24px',
    height: '24px',
    marginRight: '10px',
    verticalAlign: 'middle'
  },
  positive: {
    color: 'green'
  },
  negative: {
    color: 'red'
  }
};

const CryptoTable = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        const data = await response.json();
        setCoins(data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados da API", error);
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  if (loading) {
    return <p>Carregando criptomoedas...</p>;
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>#</th>
          <th style={styles.th}>Moeda</th>
          <th style={styles.th}>Preço</th>
          <th style={styles.th}>24h %</th>
        </tr>
      </thead>
      <tbody>
        {coins.map((coin, index) => (
          <tr key={coin.id}>
            <td style={styles.td}>{index + 1}</td>
            <td style={styles.td}>
              <img src={coin.image} alt={coin.name} style={styles.image} />
              {coin.name} ({coin.symbol.toUpperCase()})
            </td>
            <td style={styles.td}>
              {coin.current_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </td>
            <td style={{...styles.td, ...(coin.price_change_percentage_24h > 0 ? styles.positive : styles.negative)}}>
              {coin.price_change_percentage_24h.toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CryptoTable;