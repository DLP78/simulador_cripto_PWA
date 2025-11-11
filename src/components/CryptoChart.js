import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registra os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CryptoChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Busca o histórico de preços do Bitcoin dos últimos 7 dias
    const fetchChartData = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=7&interval=daily');
        const data = await response.json();
        
        const prices = data.prices;
        const labels = prices.map(priceData => new Date(priceData[0]).toLocaleDateString('pt-BR'));
        const pricePoints = prices.map(priceData => priceData[1]);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Preço do Bitcoin (BRL)',
              data: pricePoints,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico", error);
      }
    };

    fetchChartData();
  }, []);

  if (!chartData) {
    return <p>Carregando gráfico...</p>;
  }

  return (
    <div style={{marginTop: '40px'}}>
      <h2>Histórico de Preços (Últimos 7 dias)</h2>
      <Line data={chartData} />
    </div>
  );
};

export default CryptoChart;