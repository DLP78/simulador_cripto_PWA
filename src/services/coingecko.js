// src/services/coingecko.js
const API_KEY = 'CG-4mU1tQHJV2Zf17iRRwsk9h6Y'; // <-- Coloque sua chave da CoinGecko aqui
const BASE_URL = 'https://api.coingecko.com/api/v3';

async function fetchPrice(cryptoId, currency = 'usd') {
  try {
    const response = await fetch(`${BASE_URL}/simple/price?ids=${cryptoId}&vs_currencies=${currency}`, {
      headers: {
        'x-cg-api-key': API_KEY
      }
    });
    const data = await response.json();
    return data[cryptoId][currency];
  } catch (error) {
    console.error('Erro ao buscar preço da criptomoeda:', error);
    return null;
  }
}

async function fetchMultiplePrices(cryptoIds, currency = 'usd') {
  try {
    const ids = cryptoIds.join(',');
    const response = await fetch(`${BASE_URL}/simple/price?ids=${ids}&vs_currencies=${currency}`, {
      headers: {
        'x-cg-api-key': API_KEY
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar múltiplos preços:', error);
    return null;
  }
}

export { fetchPrice, fetchMultiplePrices };

