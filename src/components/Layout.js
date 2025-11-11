import Header from './Header';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div>
      {/* Cabeçalho */}
      <Header />

      {/* Navbar */}
      <Navbar />

      <div style={{ display: 'flex' }}>
        {/* Sidebar (fixa à esquerda) */}
        <Sidebar />

        {/* Aqui vão aparecer as páginas (Home, CoinPage, etc) */}
        <div style={{ flex: 1, padding: '20px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
