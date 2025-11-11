import React from 'react';

const IntervalSelector = ({ currentInterval, onIntervalChange, availableIntervals }) => {
  if (!availableIntervals || !Array.isArray(availableIntervals)) {
    return <div>Carregando intervalos...</div>;
  }

  return (
    <div style={{ 
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3>Selecionar Intervalo:</h3>
      <div>
        {availableIntervals.map(intv => (
          <button
            key={intv}
            onClick={() => onIntervalChange(intv)}
            style={{ 
              margin: '5px',
              padding: '8px 16px',
              backgroundColor: currentInterval === intv ? '#26a69a' : '#fff',
              color: currentInterval === intv ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {intv}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IntervalSelector;