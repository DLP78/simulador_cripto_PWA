// src/components/DashboardTabs.jsx
import React from 'react';

const DashboardTabs = ({ watchlist, activeTab, setActiveTab, onAddTab, onRemoveTab }) => {
  return (
    <div style={{ 
      marginBottom: '20px',
      borderBottom: '2px solid #e0e0e0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {watchlist.map(symbol => (
          <button
            key={symbol}
            onClick={() => setActiveTab(symbol)}
            style={{
              padding: '10px 20px',
              margin: '0 5px 5px 0',
              backgroundColor: activeTab === symbol ? '#26a69a' : '#f0f0f0',
              color: activeTab === symbol ? 'white' : '#333',
              border: 'none',
              borderRadius: '5px 5px 0 0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {symbol}
            {watchlist.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTab(symbol);
                }}
                style={{ 
                  marginLeft: '8px', 
                  color: '#ff4757',
                  fontWeight: 'bold'
                }}
              >
                ×
              </span>
            )}
          </button>
        ))}
        
        <button
          onClick={onAddTab}
          style={{
            padding: '10px 15px',
            margin: '0 5px 5px 0',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          + Add Par
        </button>
      </div>
    </div>
  );
};

export default DashboardTabs;