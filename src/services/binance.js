const BINANCE_API = 'https://api.binance.com';

export const intervalMap = {
  "1m": "1m",
  "5m": "5m", 
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "2h": "2h",
  "4h": "4h",
  "1d": "1d"
};

export const popularCryptos = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'Binance Coin' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'ADAUSDT', name: 'Cardano' },
  { symbol: 'XRPUSDT', name: 'Ripple' },
  { symbol: 'DOTUSDT', name: 'Polkadot' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  { symbol: 'AVAXUSDT', name: 'Avalanche' },
  { symbol: 'LINKUSDT', name: 'Chainlink' }
];

export async function fetchKlines(symbol = 'BTCUSDT', interval = '1h', limit = 500) {
  const url = `${BINANCE_API}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Falha ao buscar klines');
  const data = await res.json();
  return data.map(k => ({
    time: Math.floor(k[0] / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

export function subscribeKlines(symbol = 'BTCUSDT', interval = '1h', onKline) {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg && msg.k) {
      const k = msg.k;
      onKline({
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        isFinal: k.x,
      });
    }
  };
  return () => ws.close(1000, 'unsubscribe');
}

// Função para calcular RSI (OTIMIZADA)
export function calculateRSI(data, period = 14) {
  if (data.length < period + 1) {
    return data.map(item => ({ ...item, rsi: null }));
  }

  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i-1].close);
  }

  let avgGain = 0;
  let avgLoss = 0;

  // Primeiro cálculo
  for (let i = 0; i < period; i++) {
    avgGain += Math.max(changes[i], 0);
    avgLoss += Math.abs(Math.min(changes[i], 0));
  }
  
  avgGain /= period;
  avgLoss /= period;

  const result = [...data];
  
  // Aplica RSI apenas onde tem dados suficientes
  for (let i = period; i < data.length; i++) {
    const change = changes[i-1];
    const gain = Math.max(change, 0);
    const loss = Math.abs(Math.min(change, 0));
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    result[i] = {
      ...result[i],
      rsi: avgLoss === 0 ? 100 : 100 - (100 / (1 + rs))
    };
  }

  return result;
}

// Função para calcular Médias Móveis (OTIMIZADA)
export function calculateMovingAverage(data, period = 20) {
  const result = [...data];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result[i] = { 
      ...result[i], 
      [`ma${period}`]: sum / period 
    };
  }
  
  return result;
}

// - FUNÇÃO MACD CORRIGIDA
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (data.length < slowPeriod + signalPeriod) {
    console.warn('Dados insuficientes para MACD. Necessário:', slowPeriod + signalPeriod, 'Disponível:', data.length);
    return data.map(item => ({ ...item, macd: null, signal: null, histogram: null }));
  }

  // Função para calcular EMA
  const calculateEMA = (data, period) => {
    const k = 2 / (period + 1);
    const emas = [];
    
    // Primeiro valor é SMA
    let sma = 0;
    for (let i = 0; i < period; i++) {
      sma += data[i].close;
    }
    emas.push(sma / period);
    
    // EMA subsequentes
    for (let i = period; i < data.length; i++) {
      const ema = (data[i].close * k) + (emas[i - period] * (1 - k));
      emas.push(ema);
    }
    return emas;
  };

  // Calcula EMAs
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);

  // Calcula MACD Line (diferença entre EMAs)
  const macdLine = [];
  const startIndex = slowPeriod - 1;
  
  for (let i = startIndex; i < emaSlow.length; i++) {
    const fastIndex = i - slowPeriod + fastPeriod;
    if (fastIndex >= 0 && fastIndex < emaFast.length) {
      const macdValue = emaFast[fastIndex] - emaSlow[i];
      macdLine.push({
        time: data[i].time,
        value: macdValue
      });
    }
  }

  // Calcula Signal Line (EMA do MACD)
  const signalLine = [];
  if (macdLine.length >= signalPeriod) {
    const kSignal = 2 / (signalPeriod + 1);
    
    // Primeiro signal é SMA do MACD
    let signalSma = 0;
    for (let i = 0; i < signalPeriod; i++) {
      signalSma += macdLine[i].value;
    }
    signalLine.push({ 
      time: macdLine[signalPeriod - 1].time, 
      value: signalSma / signalPeriod 
    });
    
    // Signal Line subsequente
    for (let i = signalPeriod; i < macdLine.length; i++) {
      const signalValue = (macdLine[i].value * kSignal) + (signalLine[i - signalPeriod] * (1 - kSignal));
      signalLine.push({ 
        time: macdLine[i].time, 
        value: signalValue 
      });
    }
  }

  // Combina com dados originais
  const result = data.map(item => ({ ...item }));
  
  macdLine.forEach((macdItem, index) => {
    const dataIndex = data.findIndex(d => d.time === macdItem.time);
    if (dataIndex !== -1) {
      result[dataIndex] = {
        ...result[dataIndex],
        macd: macdItem.value
      };
    }
  });

  signalLine.forEach((signalItem, index) => {
    const dataIndex = data.findIndex(d => d.time === signalItem.time);
    if (dataIndex !== -1) {
      result[dataIndex] = {
        ...result[dataIndex],
        signal: signalItem.value,
        histogram: result[dataIndex].macd !== undefined ? 
                 result[dataIndex].macd - signalItem.value : null
      };
    }
  });

  console.log('MACD calculado:', {
    macdValues: macdLine.filter(m => m.value !== null).length,
    signalValues: signalLine.filter(s => s.value !== null).length,
    firstMacd: macdLine[0],
    firstSignal: signalLine[0]
  });

  return result;
}


// Simulação de trading
export const tradingService = {
  // Modo de operação (real ou practice)
  mode: 'practice',
  
  // Carteira do usuário
  wallet: {
    practice: {
      BRL: 1000, // Saldo inicial em reais
      crypto: {} // { BTC: 0.001, ETH: 0.02, ... }
    },
    real: {
      BRL: 0,
      crypto: {}
    }
  },

  // Histórico de transações
  transactions: [],

  // Configurações
  setMode(mode) {
    if (['practice', 'real'].includes(mode)) {
      this.mode = mode;
      this.saveToLocalStorage();
    }
  },

  // Buscar preço atual de uma crypto
  async getCurrentPrice(symbol) {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Erro ao buscar preço:', error);
      return null;
    }
  },

  // Simular compra
  async buyCrypto(symbol, amountBRL) {
    const currentPrice = await this.getCurrentPrice(symbol);
    if (!currentPrice) return null;

    const amountCrypto = amountBRL / currentPrice;
    const fee = amountBRL * 0.001; // Taxa de 0.1%

    if (this.wallet[this.mode].BRL >= amountBRL + fee) {
      // Atualizar saldo
      this.wallet[this.mode].BRL -= (amountBRL + fee);
      this.wallet[this.mode].crypto[symbol] = (this.wallet[this.mode].crypto[symbol] || 0) + amountCrypto;

      // Registrar transação
      const transaction = {
        type: 'buy',
        symbol,
        amountBRL,
        amountCrypto,
        price: currentPrice,
        fee,
        timestamp: Date.now(),
        mode: this.mode
      };

      this.transactions.unshift(transaction);
      this.saveToLocalStorage();

      return transaction;
    }
    return null;
  },

  // Simular venda
  async sellCrypto(symbol, amountCrypto) {
    const currentPrice = await this.getCurrentPrice(symbol);
    if (!currentPrice) return null;

    const amountBRL = amountCrypto * currentPrice;
    const fee = amountBRL * 0.001; // Taxa de 0.1%

    if (this.wallet[this.mode].crypto[symbol] >= amountCrypto) {
      // Atualizar saldo
      this.wallet[this.mode].crypto[symbol] -= amountCrypto;
      this.wallet[this.mode].BRL += (amountBRL - fee);

      // Registrar transação
      const transaction = {
        type: 'sell',
        symbol,
        amountBRL,
        amountCrypto,
        price: currentPrice,
        fee,
        timestamp: Date.now(),
        mode: this.mode
      };

      this.transactions.unshift(transaction);
      this.saveToLocalStorage();

      return transaction;
    }
    return null;
  },

  // Vender tudo
  async sellAll(symbol) {
    const currentCrypto = this.wallet[this.mode].crypto[symbol] || 0;
    if (currentCrypto > 0) {
      return this.sellCrypto(symbol, currentCrypto);
    }
    return null;
  },

  // Buscar saldo atual
  getBalance() {
    return {
      BRL: this.wallet[this.mode].BRL,
      crypto: { ...this.wallet[this.mode].crypto }
    };
  },

  // Buscar histórico
  getTransactions(limit = 20) {
    return this.transactions.slice(0, limit);
  },

  // Salvar no localStorage
  saveToLocalStorage() {
    localStorage.setItem('cryptoTraderData', JSON.stringify({
      wallet: this.wallet,
      transactions: this.transactions,
      mode: this.mode
    }));
  },

  // Carregar do localStorage
  loadFromLocalStorage() {
    const saved = localStorage.getItem('cryptoTraderData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.wallet = data.wallet || this.wallet;
        this.transactions = data.transactions || [];
        this.mode = data.mode || 'practice';
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
  },

  // Resetar carteira practice
  resetPracticeWallet() {
    this.wallet.practice = {
      BRL: 1000,
      crypto: {}
    };
    this.transactions = this.transactions.filter(t => t.mode !== 'practice');
    this.saveToLocalStorage();
  }
};

// Inicializar carregando dados salvos
tradingService.loadFromLocalStorage();