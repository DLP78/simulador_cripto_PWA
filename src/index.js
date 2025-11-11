import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CoinPage from './App';
import './styles.css';
import './styles/responsive.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<CoinPage />} />
      <Route path="/:symbol?/:interval?" element={<CoinPage />} />
    </Routes>
  </BrowserRouter>
);
