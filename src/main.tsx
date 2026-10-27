import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import App from './App';
import './styles/index.css';
import { hydrateStore } from './lib/hydrate';

// Admin pages load their own data behind authentication, so only the storefront needs the public snapshot.
const boot = window.location.pathname.startsWith('/admin') ? Promise.resolve() : hydrateStore();
boot.finally(() => ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
));
