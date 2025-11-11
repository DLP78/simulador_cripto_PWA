import React from 'react';

const TechnicalIndicators = ({ showIndicators, setShowIndicators }) => {
  return (
    <div style={{ 
      margin: '20px 0',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h4>Indicadores Técnicos:</h4>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            checked={showIndicators}
            onChange={(e) => setShowIndicators(e.target.checked)}
          />
          📊 Análise Técnica Completa
        </label>
        
        {showIndicators && (
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            <strong>📈 Painel Superior:</strong>
            <br />• <span style={{ color: '#ffa502' }}>MA20</span> - Média Móvel (20 períodos)
            <br />
            <strong>📊 RSI (14):</strong>
            <br />• <span style={{ color: '#ff4757' }}>70+</span> - Sobrevenda
            <br />• <span style={{ color: '#2ed573' }}>30-</span> - Sobrecompra
            <br />
            <strong>📉 MACD (12,26,9):</strong>
            <br />• <span style={{ color: '#3742fa' }}>Linha Azul</span> - MACD
            <br />• <span style={{ color: '#ff6b35' }}>Linha Laranja</span> - Signal
            <br />• <span style={{ color: '#26a69a' }}>Verde</span>/<span style={{ color: '#ef5350' }}>Vermelho</span> - Histograma
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalIndicators;
