import React, { useState, useEffect } from 'react';

const TradingPanel = ({ currentSymbol, onTransaction }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState({
    BRL: 1000, // Saldo inicial em reais
    crypto: {} // { BTCUSDT: 0.001, ETHUSDT: 0.02 }
  });
  const [positions, setPositions] = useState([]);

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('cryptoWallet');
    if (savedData) {
      const { wallet: savedWallet, positions: savedPositions } = JSON.parse(savedData);
      setWallet(savedWallet);
      setPositions(savedPositions || []);
    }
  }, []);

  // Salvar dados no localStorage
  const saveToLocalStorage = (newWallet, newPositions) => {
    const data = {
      wallet: newWallet,
      positions: newPositions
    };
    localStorage.setItem('cryptoWallet', JSON.stringify(data));
  };

  // Buscar preço atual (simulado)
  const getCurrentPrice = async () => {
    // Preços simulados - depois podemos integrar com API real
    const priceMap = {
      'BTCUSDT': 50000,
      'ETHUSDT': 3000,
      'BNBUSDT': 600,
      'SOLUSDT': 150,
      'ADAUSDT': 0.5,
      'XRPUSDT': 0.6,
      'DOTUSDT': 7,
      'DOGEUSDT': 0.15,
      'AVAXUSDT': 40,
      'LINKUSDT': 18
    };
    return priceMap[currentSymbol] || 100;
  };

  const handleBuy = async () => {
    if (!amount || amount < 10) return;
    
    setIsLoading(true);
    const amountNumber = parseFloat(amount);
    const currentPrice = await getCurrentPrice();
    const amountCrypto = amountNumber / currentPrice;
    const fee = amountNumber * 0.001; // Taxa de 0.1%

    if (wallet.BRL >= amountNumber + fee) {
      // Atualizar carteira
      const newWallet = {
        BRL: wallet.BRL - (amountNumber + fee),
        crypto: {
          ...wallet.crypto,
          [currentSymbol]: (wallet.crypto[currentSymbol] || 0) + amountCrypto
        }
      };

      // Adicionar posição
      const newPosition = {
        id: Date.now(),
        type: 'buy',
        symbol: currentSymbol,
        amountBRL: amountNumber,
        amountCrypto,
        entryPrice: currentPrice,
        fee,
        timestamp: Date.now(),
        status: 'open'
      };

      const newPositions = [newPosition, ...positions];

      setWallet(newWallet);
      setPositions(newPositions);
      setAmount('');

      // Salvar e notificar
      saveToLocalStorage(newWallet, newPositions);
      
      if (onTransaction) onTransaction(newPosition);
      alert(`✅ Compra realizada!\n${amountCrypto.toFixed(6)} ${currentSymbol} por R$ ${amountNumber.toFixed(2)}`);
    } else {
      alert('❌ Saldo insuficiente!');
    }
    setIsLoading(false);
  };

  const handleSell = async () => {
    if (!amount || amount <= 0) return;
    
    setIsLoading(true);
    const amountNumber = parseFloat(amount);
    const currentPrice = await getCurrentPrice();
    const amountBRL = amountNumber * currentPrice;
    const fee = amountBRL * 0.001;

    if (wallet.crypto[currentSymbol] >= amountNumber) {
      // Atualizar carteira
      const newWallet = {
        BRL: wallet.BRL + (amountBRL - fee),
        crypto: {
          ...wallet.crypto,
          [currentSymbol]: (wallet.crypto[currentSymbol] || 0) - amountNumber
        }
      };

      // Registrar venda
      const saleTransaction = {
        id: Date.now(),
        type: 'sell',
        symbol: currentSymbol,
        amountBRL,
        amountCrypto: amountNumber,
        exitPrice: currentPrice,
        fee,
        timestamp: Date.now(),
        profit: (currentPrice - (positions.find(p => p.symbol === currentSymbol)?.entryPrice || currentPrice)) * amountNumber
      };

      const newPositions = [...positions];

      setWallet(newWallet);
      setPositions(newPositions);
      setAmount('');

      // Salvar e notificar
      saveToLocalStorage(newWallet, newPositions);
      
      if (onTransaction) onTransaction(saleTransaction);
      alert(`✅ Venda realizada!\n${amountNumber} ${currentSymbol} por R$ ${amountBRL.toFixed(2)}`);
    } else {
      alert('❌ Saldo insuficiente de criptomoeda!');
    }
    setIsLoading(false);
  };

  const handleSellAll = async () => {
    const currentBalance = wallet.crypto[currentSymbol] || 0;
    if (currentBalance <= 0) {
      alert('❌ Nenhuma posição para vender!');
      return;
    }

    setAmount(currentBalance.toString());
    handleSell();
  };

  const resetWallet = () => {
    if (window.confirm('Resetar carteira? Voltará a ter R$ 1000,00')) {
      const newWallet = {
        BRL: 1000,
        crypto: {}
      };
      setWallet(newWallet);
      setPositions([]);
      setAmount('');
      saveToLocalStorage(newWallet, []);
      alert('🔄 Carteira resetada! Saldo: R$ 1000,00');
    }
  };

  const currentCryptoBalance = wallet.crypto[currentSymbol] || 0;

  return (
    <div style={{
      padding: '12px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      marginBottom: '10px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', color: '#26a69a' }}>
          💰 Carteira
        </h3>
        <button
          onClick={resetWallet}
          style={{
            padding: '2px 6px',
            backgroundColor: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          Resetar
        </button>
      </div>

      {/* Saldo */}
      <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Saldo Disponível:</div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#26a69a' }}>
          R$ {wallet.BRL.toFixed(2)}
        </div>
        {currentCryptoBalance > 0 && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {currentSymbol}: {currentCryptoBalance.toFixed(6)}
          </div>
        )}
      </div>

      {/* Input de Valor */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="number"
          placeholder="Valor em BRL ou Quantidade"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
          min="10"
        />
        <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
          Mínimo: R$ 10,00
        </div>
      </div>

      {/* Botões de Ação */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <button
          onClick={handleBuy}
          disabled={isLoading || !amount || amount < 10 || amount > wallet.BRL}
          style={{
            padding: '8px',
            backgroundColor: '#26a69a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            opacity: (isLoading || !amount || amount < 10 || amount > wallet.BRL) ? 0.5 : 1
          }}
        >
          {isLoading ? '🔄' : '💰'} Comprar
        </button>

        <button
          onClick={handleSell}
          disabled={isLoading || !amount || amount > currentCryptoBalance}
          style={{
            padding: '8px',
            backgroundColor: '#ef5350',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            opacity: (isLoading || !amount || amount > currentCryptoBalance) ? 0.5 : 1
          }}
        >
          {isLoading ? '🔄' : '📉'} Vender
        </button>
      </div>

      {currentCryptoBalance > 0 && (
        <button
          onClick={handleSellAll}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '6px',
            backgroundColor: '#ffa502',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            marginBottom: '8px',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          {isLoading ? '🔄' : '🔥'} Vender Tudo
        </button>
      )}

      {/* Quick Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', marginBottom: '12px' }}>
        {[10, 50, 100].map(value => (
          <button
            key={value}
            onClick={() => setAmount(value.toString())}
            style={{
              padding: '4px',
              backgroundColor: '#f0f0f0',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            R$ {value}
          </button>
        ))}
      </div>

      {/* Posições Abertas */}
      {positions.filter(p => p.status === 'open').length > 0 && (
        <div>
          <h4 style={{ fontSize: '12px', margin: '0 0 8px 0', color: '#333' }}>
            📊 Posições Abertas
          </h4>
          {positions
            .filter(p => p.status === 'open')
            .slice(0, 3)
            .map(position => (
              <div key={position.id} style={{
                padding: '6px',
                marginBottom: '4px',
                backgroundColor: position.type === 'buy' ? '#e8f5e8' : '#ffe6e6',
                borderRadius: '3px',
                fontSize: '10px'
              }}>
                <div>{position.symbol}: {position.amountCrypto.toFixed(6)}</div>
                <div>Entrada: R$ {position.entryPrice.toFixed(2)}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TradingPanel;