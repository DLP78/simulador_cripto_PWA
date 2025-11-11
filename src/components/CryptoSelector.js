import React from 'react';
import { popularCryptos } from '../services/binance.js';

const CryptoSelector = ({ currentSymbol, onSymbolChange }) => {
  return (
    <div style={{ 
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3>Selecionar Criptomoeda:</h3>
      <select
        value={currentSymbol}
        onChange={(e) => onSymbolChange(e.target.value)}
        style={{
          padding: '10px',
          fontSize: '16px',
          border: '2px solid #26a69a',
          borderRadius: '5px',
          backgroundColor: 'white',
          cursor: 'pointer',
          minWidth: '200px'
        }}
      >
        {popularCryptos.map(crypto => (
          <option key={crypto.symbol} value={crypto.symbol}>
            {crypto.name} ({crypto.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CryptoSelector;