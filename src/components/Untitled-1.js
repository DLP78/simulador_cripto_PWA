// src/components/AddSymbolModal.jsx
import React, { useState } from 'react';
import { popularCryptos } from '../services/binance';

const AddSymbolModal = ({ isOpen, onClose, onAddSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredCryptos = popularCryptos.filter(crypto =>
    crypto.symbol.includes(searchTerm.toUpperCase()) ||
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3>Adicionar Criptomoeda</h3>
        
        <input
          type="text"
          placeholder="Buscar por símbolo ou nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}
        />

        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {filteredCryptos.map(crypto => (
            <div
              key={crypto.symbol}
              onClick={() => {
                onAddSymbol(crypto.symbol);
                onClose();
              }}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{crypto.symbol}</strong>
                <br />
                <small>{crypto.name}</small>
              </div>
              <span style={{ color: '#26a69a' }}>+</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '15px',
            padding: '8px 15px',
            backgroundColor: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default AddSymbolModal;