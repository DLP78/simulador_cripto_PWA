import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode } from 'lightweight-charts';
import { calculateRSI, calculateMovingAverage, calculateMACD } from '../services/binance';

export default function CandleChart({ data, currentTick, showIndicators }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const rsiSeriesRef = useRef(null);
  const ma20SeriesRef = useRef(null);
  const ma50SeriesRef = useRef(null);
  const macdSeriesRef = useRef(null);
  const signalSeriesRef = useRef(null);
  const histogramSeriesRef = useRef(null);

  useEffect(() => {
    console.log("📊 CandleChart - Iniciando renderização");
    console.log("📊 Dados recebidos:", data.length, "velas | Indicadores:", showIndicators);
    
    if (!chartContainerRef.current || data.length === 0) {
      console.log("⏸️ Aguardando dados ou container...");
      return;
    }

    // Remove gráfico existente
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: showIndicators ? 700 : 500,
      layout: {
        backgroundColor: '#ffffff',
        textColor: '#191919',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#758696',
          width: 1,
          style: 1,
          labelBackgroundColor: '#2589e4',
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 1,
          labelBackgroundColor: '#2589e4',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#D1D4DC',
      },
    });

    // ==================== SÉRIE PRINCIPAL (CANDLES) ====================
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    candleSeries.setData(data);
    candleSeriesRef.current = candleSeries;
    console.log("✅ Candlestick series criada com", data.length, "velas");

    // ==================== INDICADORES TÉCNICOS ====================
    if (showIndicators) {
      try {
        console.log("🧮 Calculando indicadores técnicos...");
        
        // Calcula todos os indicadores
        let chartData = calculateRSI(data);
        chartData = calculateMovingAverage(chartData, 20);
        chartData = calculateMovingAverage(chartData, 50);
        chartData = calculateMACD(chartData);

        console.log("📊 Indicadores calculados:", {
          rsi: chartData.filter(item => item.rsi !== null && item.rsi !== undefined).length,
          ma20: chartData.filter(item => item.ma20 !== null && item.ma20 !== undefined).length,
          ma50: chartData.filter(item => item.ma50 !== null && item.ma50 !== undefined).length,
          macd: chartData.filter(item => item.macd !== null && item.macd !== undefined).length
        });

        // ==================== MÉDIAS MÓVEIS (NO GRÁFICO PRINCIPAL) ====================
        const ma20Data = chartData
          .filter(item => item.ma20 !== null && item.ma20 !== undefined)
          .map(item => ({ time: item.time, value: item.ma20 }));

        const ma50Data = chartData
          .filter(item => item.ma50 !== null && item.ma50 !== undefined)
          .map(item => ({ time: item.time, value: item.ma50 }));

        if (ma20Data.length > 0) {
          const ma20Series = chart.addLineSeries({
            color: '#FF9800',
            lineWidth: 2,
            title: 'MA20',
            priceScaleId: 'right',
          });
          ma20Series.setData(ma20Data);
          ma20SeriesRef.current = ma20Series;
          console.log("✅ MA20 renderizada:", ma20Data.length, "pontos");
        }

        if (ma50Data.length > 0) {
          const ma50Series = chart.addLineSeries({
            color: '#2196F3',
            lineWidth: 2,
            title: 'MA50',
            priceScaleId: 'right',
          });
          ma50Series.setData(ma50Data);
          ma50SeriesRef.current = ma50Series;
          console.log("✅ MA50 renderizada:", ma50Data.length, "pontos");
        }

        // ==================== RSI (MESMO GRÁFICO, ESCALA DIFERENTE) ====================
        const rsiData = chartData
          .filter(item => item.rsi !== null && item.rsi !== undefined)
          .map(item => ({ time: item.time, value: item.rsi }));

        if (rsiData.length > 0) {
          const rsiSeries = chart.addLineSeries({
            color: '#FF5252',
            lineWidth: 2,
            title: 'RSI (14)',
            priceScaleId: 'overlay',
            priceLineVisible: false,
          });

          // Linhas de referência RSI
          chart.addLineSeries({
            color: '#FF4757',
            lineWidth: 1,
            lineStyle: 2,
            priceScaleId: 'overlay',
          }).setData([
            { time: data[0]?.time, value: 70 }, 
            { time: data[data.length-1]?.time, value: 70 }
          ]);

          chart.addLineSeries({
            color: '#4CAF50',
            lineWidth: 1,
            lineStyle: 2,
            priceScaleId: 'overlay',
          }).setData([
            { time: data[0]?.time, value: 30 }, 
            { time: data[data.length-1]?.time, value: 30 }
          ]);

          rsiSeries.setData(rsiData);
          rsiSeriesRef.current = rsiSeries;
          console.log("✅ RSI renderizado:", rsiData.length, "pontos");
        }

        // ==================== MACD (MESMO GRÁFICO, ESCALA DIFERENTE) ====================
        const macdData = chartData
          .filter(item => item.macd !== null && item.macd !== undefined)
          .map(item => ({ time: item.time, value: item.macd }));

        const signalData = chartData
          .filter(item => item.signal !== null && item.signal !== undefined)
          .map(item => ({ time: item.time, value: item.signal }));

        const histogramData = chartData
          .filter(item => item.histogram !== null && item.histogram !== undefined)
          .map(item => ({
            time: item.time,
            value: item.histogram,
            color: item.histogram >= 0 ? '#26a69a' : '#ef5350'
          }));

        if (macdData.length > 0) {
          // MACD Line
          const macdSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            title: 'MACD',
            priceScaleId: 'overlay2',
          });

          // Signal Line
          const signalSeries = chart.addLineSeries({
            color: '#FF6D00',
            lineWidth: 2,
            title: 'Signal',
            priceScaleId: 'overlay2',
          });

          // Histogram
          const histogramSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceScaleId: 'overlay2',
          });

          macdSeries.setData(macdData);
          signalSeries.setData(signalData);
          histogramSeries.setData(histogramData);

          macdSeriesRef.current = macdSeries;
          signalSeriesRef.current = signalSeries;
          histogramSeriesRef.current = histogramSeries;
          console.log("✅ MACD renderizado:", macdData.length, "pontos");
        }

        console.log("🎉 Todos os indicadores renderizados com sucesso!");

      } catch (error) {
        console.error("❌ Erro ao renderizar indicadores:", error);
        // Continua mostrando apenas os candles em caso de erro
      }
    }

    chartRef.current = chart;

    // Redimensionamento responsivo
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, showIndicators]);

  // Atualizações em tempo real
  useEffect(() => {
    if (currentTick && candleSeriesRef.current) {
      candleSeriesRef.current.update(currentTick);
    }
  }, [currentTick]);

  return (
    <div
      ref={chartContainerRef}
      className="chart-container"
      style={{ 
        width: '100%', 
        height: showIndicators ? '700px' : '500px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        marginTop: '20px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    />
  );
}