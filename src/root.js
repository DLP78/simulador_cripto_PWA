import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CoinPage from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<CoinPage />} />
      <Route path="/:symbol?/:interval?" element={<CoinPage />} />
    </Routes>
  </BrowserRouter>
);
