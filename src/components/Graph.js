// src/components/Graph.js
import React, { useEffect, useState } from 'react';
import '../styles/Graph.css'; // Importa o CSS para estilização
import { getBitcoinPrice } from '../services/api'; // Importa o serviço da API

const Graph = () => {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    async function fetchPrice() {
      const currentPrice = await getBitcoinPrice();
      setPrice(currentPrice);
    }

    fetchPrice();
  }, []);

  return (
    <div className="graph" style={{ padding: '20px' }}>
      <h2>Preço Atual do Bitcoin</h2>
      {price !== null ? (
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>${price}</p>
      ) : (
        <p>Carregando preço...</p>
      )}
    </div>
  );
};

export default Graph;
