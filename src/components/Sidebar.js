// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext'; // Corrigido para usar o hook correto

function Sidebar() {
  const { theme } = useTheme(); // Usa o hook para pegar o tema

  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul className="sidebar-menu">
        <li><Link to="/" className="sidebar-link">Home</Link></li>
        <li><Link to="/about" className="sidebar-link">Sobre</Link></li>
        <li><Link to="/settings" className="sidebar-link">Configurações</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
