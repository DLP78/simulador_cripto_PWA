
import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [saldo, setSaldo] = useState(1000);
  const [cotacao, setCotacao] = useState(null);
  const [quantidade, setQuantidade] = useState(0);
  const [historico, setHistorico] = useState([]);

  const buscarCotacao = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl'
      );
      const data = await res.json();
      setCotacao(data.bitcoin.brl);
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
    }
  };

  useEffect(() => {
    buscarCotacao();
    const intervalo = setInterval(buscarCotacao, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const simularCompra = () => {
    if (!cotacao || saldo <= 0) return;
    const valor = cotacao;
    const qtd = Number((10 / valor).toFixed(6));
    setSaldo(prev => prev - 10);
    setQuantidade(prev => prev + qtd);
    setHistorico(prev => [...prev, `Comprado ${qtd} BTC por R$10`]);
  };

  const simularVenda = () => {
    if (quantidade <= 0 || !cotacao) return;
    const vendaReais = quantidade * cotacao;
    setSaldo(prev => prev + vendaReais);
    setHistorico(prev => [...prev, `Vendido ${quantidade} BTC por R$${vendaReais.toFixed(2)}`]);
    setQuantidade(0);
  };

  return (
    <div className="container">
      <h1>Simulador Cripto</h1>
      <p><strong>Saldo:</strong> R$ {saldo.toFixed(2)}</p>
      <p><strong>BTC em carteira:</strong> {quantidade}</p>
      <p><strong>Cotação BTC:</strong> R$ {cotacao || 'Carregando...'}</p>
      <div className="buttons">
        <button onClick={simularCompra}>Simular Compra (R$10)</button>
        <button onClick={simularVenda}>Simular Venda</button>
      </div>
      <div>
        <h2>Histórico</h2>
        <ul>
          {historico.slice().reverse().map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default App;
