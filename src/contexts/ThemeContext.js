import React, { createContext, useContext, useState } from 'react';

// Cria o Contexto
export const ThemeContext = createContext();

// Cria um Provider para envolver o app
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  function toggleTheme() {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Aqui estamos criando o Hook personalizado useTheme
export function useTheme() {
  return useContext(ThemeContext);
}
