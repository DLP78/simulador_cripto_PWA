import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import CandleChart from "./components/CandleChart.jsx";
import CryptoSelector from "./components/CryptoSelector";
import IntervalSelector from "./components/IntervalSelector";
import TechnicalIndicators from "./components/TechnicalIndicators";
import TradingPanel from "./components/TradingPanel";
import { fetchKlines, subscribeKlines, intervalMap, popularCryptos, calculateRSI, calculateMovingAverage, calculateMACD } from "./services/binance.js";

// Variável para debounce
let calculationTimeout = null;

// Componente simples de abas
const DashboardTabs = ({ watchlist, activeTab, setActiveTab, onAddTab, onRemoveTab }) => {
  return (
    <div style={{ 
      marginBottom: '6px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '1px' }}>
        {watchlist.map(symbol => (
          <button
            key={symbol}
            onClick={() => setActiveTab(symbol)}
            style={{
              padding: '4px 8px',
              backgroundColor: activeTab === symbol ? '#26a69a' : '#f0f0f0',
              color: activeTab === symbol ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: '500',
              minWidth: '45px',
              flexShrink: 0
            }}
          >
            {symbol.replace('USDT', '')}
            {watchlist.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTab(symbol);
                }}
                style={{ 
                  marginLeft: '3px', 
                  color: '#ff4757',
                  fontWeight: 'bold',
                  fontSize: '11px'
                }}
              >
                ×
              </span>
            )}
          </button>
        ))}
        
        <select
          onChange={(e) => {
            if (e.target.value) {
              onAddTab(e.target.value);
              e.target.value = '';
            }
          }}
          style={{
            padding: '4px',
            border: '1px solid #26a69a',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '10px',
            height: '26px',
            flexShrink: 0
          }}
        >
          <option value="">+</option>
          {popularCryptos
            .filter(crypto => !watchlist.includes(crypto.symbol))
            .map(crypto => (
              <option key={crypto.symbol} value={crypto.symbol}>
                {crypto.symbol.replace('USDT', '')}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

// Componente de Carteira Arrastável - VERSÃO MOBILE CORRIGIDA
const DraggableWallet = ({ currentSymbol, onTransaction }) => {
  const [position, setPosition] = useState({ x: window.innerWidth - 180, y: 10 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [walletOpen, setWalletOpen] = useState(false);

  const handleStart = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });
    e.preventDefault();
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    
    // Limitar aos limites da tela
    const boundedX = Math.max(10, Math.min(window.innerWidth - 180, newX));
    const boundedY = Math.max(10, Math.min(window.innerHeight - 100, newY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Adicionar event listeners para drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset]);

  return (
    <div style={{
      position: 'fixed',
      left: position.x,
      top: position.y,
      zIndex: 1000,
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'none' // IMPORTANTE para mobile
    }}>
      {/* Botão/Cabeçalho Arrastável */}
      <div
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{
          padding: '12px 16px', // MAIOR para mobile
          backgroundColor: walletOpen ? '#26a69a' : '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: isDragging ? 'grabbing' : 'grab',
          fontSize: '14px', // MAIOR para mobile
          fontWeight: 'bold',
          boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          WebkitTapHighlightColor: 'transparent' // Remove highlight no mobile
        }}
      >
        <span>💰</span>
        <span>Carteira</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setWalletOpen(!walletOpen);
          }}
          onTouchStart={(e) => e.stopPropagation()} // Importante para mobile
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            borderRadius: '50%',
            width: '24px', // MAIOR para mobile
            height: '24px', // MAIOR para mobile
            cursor: 'pointer',
            fontSize: '12px',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {walletOpen ? '−' : '+'}
        </button>
      </div>

      {/* Painel da Carteira */}
      {walletOpen && (
        <div style={{
          marginTop: '8px',
          width: '180px', // Ligeiramente maior para mobile
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          border: '2px solid #26a69a'
        }}>
          <TradingPanel 
            currentSymbol={currentSymbol} 
            onTransaction={onTransaction}
          />
        </div>
      )}
    </div>
  );
};

export default function CoinPage() {
  const { symbol: urlSymbol, interval: urlInterval } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [tick, setTick] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIndicators, setShowIndicators] = useState(false);
  const [calculatingIndicators, setCalculatingIndicators] = useState(false);
  const [activeTab, setActiveTab] = useState('BTCUSDT');
  const [watchlist, setWatchlist] = useState(['BTCUSDT', 'ETHUSDT', 'BNBUSDT']);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [walletOpen, setWalletOpen] = useState(false); // ← ADICIONE ESTA LINHA
  
  const symbol = urlSymbol || activeTab || 'BTCUSDT';
  const interval = urlInterval || '1h';

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('cryptoDashboardSettings');
    if (savedSettings) {
      try {
        const { symbol: savedSymbol, interval: savedInterval, watchlist: savedWatchlist } = JSON.parse(savedSettings);
        
        if (savedWatchlist && Array.isArray(savedWatchlist)) {
          setWatchlist(savedWatchlist);
        }
        
        if (!urlSymbol && !urlInterval && savedSymbol) {
          navigate(`/${savedSymbol}/${savedInterval || '1h'}`);
          return;
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
  }, [navigate, urlSymbol, urlInterval]);

  // Salvar configurações quando mudar
  useEffect(() => {
    if (symbol && interval) {
      const settings = { 
        symbol, 
        interval,
        watchlist 
      };
      localStorage.setItem('cryptoDashboardSettings', JSON.stringify(settings));
    }
  }, [symbol, interval, watchlist]);

  // Função principal - busca dados
  useEffect(() => {
    console.log("📡 Buscando dados para:", symbol, interval);
    
    if (!symbol || !interval) {
      setLoading(false);
      return;
    }

    let unsub = null;
    let isSubscribed = true;

    setLoading(true);
    setError(null);
    setData([]);
    setTick(null);

    fetchKlines(symbol, interval, 500)
      .then(klines => {
        console.log("✅ Dados recebidos:", klines.length, "velas");
        if (isSubscribed) {
          let processedData = klines;
          
          if (showIndicators) {
            try {
              processedData = calculateRSI(klines);
              processedData = calculateMovingAverage(processedData, 20);
              processedData = calculateMovingAverage(processedData, 50);
              processedData = calculateMACD(processedData);
            } catch (error) {
              console.warn("⚠️ Erro ao calcular indicadores:", error);
              processedData = klines;
            }
          }
          
          setData(processedData);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("❌ Erro ao buscar klines:", err);
        if (isSubscribed) {
          setError("Erro ao carregar dados. Verifique sua conexão.");
          setLoading(false);
        }
      });

    // WebSocket para dados em tempo real
    const wsTimeout = setTimeout(() => {
      if (isSubscribed) {
        unsub = subscribeKlines(symbol, interval, (newKline) => {
          if (isSubscribed) {
            setTick(newKline);
            if (newKline.isFinal) {
              setData(prevData => {
                const newData = [...prevData, newKline];
                return newData.slice(-500);
              });
            }
          }
        });
      }
    }, 1000);

    // Limpeza
    return () => {
      isSubscribed = false;
      clearTimeout(wsTimeout);
      if (unsub) {
        unsub();
      }
    };
  }, [symbol, interval, showIndicators]);

  // Função para toggle dos indicadores
  const toggleIndicators = (checked) => {
    setShowIndicators(checked);
    
    if (calculationTimeout) clearTimeout(calculationTimeout);
    
    if (checked && data.length > 0) {
      calculationTimeout = setTimeout(() => {
        setCalculatingIndicators(true);
        setTimeout(() => {
          try {
            const newData = calculateMACD(
              calculateMovingAverage(
                calculateRSI(data), 20
              )
            );
            setData(newData);
          } catch (error) {
            console.error("❌ Erro ao calcular indicadores:", error);
          }
          setCalculatingIndicators(false);
        }, 100);
      }, 300);
    }
  };

  // Funções para gerenciar o dashboard
  const addTab = (newSymbol) => {
    if (newSymbol && !watchlist.includes(newSymbol)) {
      const updatedWatchlist = [...watchlist, newSymbol];
      setWatchlist(updatedWatchlist);
      setActiveTab(newSymbol);
      navigate(`/${newSymbol}/${interval}`);
    }
  };

  const removeTab = (tabToRemove) => {
    if (watchlist.length > 1) {
      const updatedWatchlist = watchlist.filter(symbol => symbol !== tabToRemove);
      setWatchlist(updatedWatchlist);
      
      if (activeTab === tabToRemove) {
        const newActiveTab = updatedWatchlist[0];
        setActiveTab(newActiveTab);
        navigate(`/${newActiveTab}/${interval}`);
      }
    }
  };

  const handleIntervalChange = (newInterval) => {
    navigate(`/${symbol}/${newInterval}`);
  };

  const handleSymbolChange = (newSymbol) => {
    setActiveTab(newSymbol);
    navigate(`/${newSymbol}/${interval}`);
  };

  const clearSettings = () => {
    localStorage.removeItem('cryptoDashboardSettings');
    setWatchlist(['BTCUSDT']);
    setActiveTab('BTCUSDT');
    navigate('/BTCUSDT/1h');
    window.location.reload();
  };

  // Tela de loading
  if (loading) {
    return (
      <div style={{ 
        padding: '15px', 
        textAlign: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{ marginBottom: '12px', color: '#26a69a', fontSize: '16px' }}>🚀 Conectando...</h2>
        <div style={{ 
          width: '150px', 
          height: '3px', 
          backgroundColor: '#ddd', 
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '70%',
            height: '100%',
            backgroundColor: '#26a69a',
            borderRadius: '2px',
            animation: 'loading 1.5s infinite ease-in-out'
          }}></div>
        </div>
      </div>
    );
  }

  // Tela de erro
  if (error) {
    return (
      <div style={{ 
        padding: '15px', 
        textAlign: 'center',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{ color: '#ff4757', marginBottom: '12px', fontSize: '16px' }}>❌ Erro</h2>
        <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#26a69a',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  const currentCrypto = popularCryptos.find(crypto => crypto.symbol === symbol) || 
                       { symbol, name: symbol };

 return (
  <div style={{ 
    padding: '4px',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    boxSizing: 'border-box',
    overflow: 'hidden',
    width: '100vw',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    {/* Header Super Compacto */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '0px',
      padding: '6px 10px',
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      flexShrink: 0
    }}>
      <h1 style={{ 
        color: '#26a69a', 
        margin: 0, 
        fontSize: '13px',
        fontWeight: 'bold'
      }}>
        📊 Crypto Simulation
      </h1>
      
      <button 
        onClick={clearSettings}
        style={{
          padding: '3px 6px',
          backgroundColor: '#ff4757',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '9px'
        }}
      >
        Limpar
      </button>
    </div>

    {/* Dashboard Tabs Super Compacto */}
    <DashboardTabs
      watchlist={watchlist}
      activeTab={symbol}
      setActiveTab={handleSymbolChange}
      onAddTab={addTab}
      onRemoveTab={removeTab}
    />

    {/* Selectors Compactos em linha */}
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '6px',
      marginBottom: '0px',
      flexShrink: 0
    }}>
      <div style={{ 
        padding: '4px',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}>
        <CryptoSelector currentSymbol={symbol} onSymbolChange={handleSymbolChange} />
      </div>
      <div style={{ 
        padding: '4px',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}>
        <IntervalSelector currentInterval={interval} onIntervalChange={handleIntervalChange} availableIntervals={Object.keys(intervalMap)} />
      </div>
    </div>

    {/* Technical Indicators Toggle */}
    <div style={{ 
      marginBottom: '0px',
      padding: '4px',
      backgroundColor: 'white',
      borderRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      flexShrink: 0
    }}>
      <TechnicalIndicators 
        showIndicators={showIndicators} 
        setShowIndicators={toggleIndicators} 
      />
    </div>

    {/* Loading durante cálculo */}
    {calculatingIndicators && (
      <div style={{ 
        textAlign: 'center', 
        padding: '4px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '3px',
        marginBottom: '4px',
        color: '#856404',
        fontSize: '10px',
        flexShrink: 0
      }}>
        <p>🔄 Aplicando indicadores...</p>
      </div>
    )}

    {/* Chart Container Compacto - AGORA FLEXÍVEL */}
    <div style={{ 
      backgroundColor: 'white', 
      padding: '6px', 
      borderRadius: '4px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      marginBottom: '0px',
      width: '100%',
      overflow: 'hidden',
      flex: 1,
      minHeight: '350px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 style={{ 
        color: '#333', 
        marginBottom: '6px',
        fontSize: '11px',
        fontWeight: 'bold',
        flexShrink: 0
      }}>
        {currentCrypto.name} ({currentCrypto.symbol}) - {interval}
      </h2>
      
      {data.length > 0 ? (
        <div style={{ 
          width: '100%', 
          overflow: 'hidden',
          flex: 1,
          minHeight: '300px'
        }}>
          <CandleChart data={data} currentTick={tick} showIndicators={showIndicators} />
        </div>
      ) : (
        <div style={{ 
          padding: '15px', 
          textAlign: 'center', 
          color: '#7f8c8d',
          backgroundColor: '#f8f9fa',
          borderRadius: '3px',
          fontSize: '10px',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <p>📊 Aguardando dados...</p>
        </div>
      )}
    </div>

    {/* Carteira Arrastável */}
    <DraggableWallet 
      currentSymbol={symbol} 
      onTransaction={setLastTransaction}
    />

    {/* Notificação de Transação */}
    {lastTransaction && (
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: lastTransaction.type === 'buy' ? '#d4edda' : '#f8d7da',
        padding: '8px 16px',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1001,
        fontSize: '12px'
      }}>
        {lastTransaction.type === 'buy' ? '✅' : '📉'} 
        {lastTransaction.type === 'buy' ? 'Compra' : 'Venda'} de {lastTransaction.amountCrypto.toFixed(6)} {lastTransaction.symbol}
      </div>
    )}

    <style>
      {`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          overflow-x: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: #f8f9fa;
        }
        html, body, #root {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}
    </style>
  </div>
);}