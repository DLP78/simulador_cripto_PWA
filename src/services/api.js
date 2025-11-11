// src/services/api.js
const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

export async function getBitcoinPrice() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data.bitcoin.usd;
  } catch (error) {
    console.error('Erro ao buscar o preço do Bitcoin:', error);
    return null;
  }
}

  