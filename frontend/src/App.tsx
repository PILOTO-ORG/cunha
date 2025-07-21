import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './styles/index.css';

// Layout
import Layout from './components/Layout.tsx';

// Pages
import HomePage from './pages/HomePage.tsx';
import NandaPage from './pages/NandaPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import ClientsPage from './pages/ClientsPage.tsx';
import BudgetsPage from './pages/OrcamentosPage.tsx';
import ReservasPage from './pages/ReservasPage.tsx';
import LocaisPage from './pages/LocaisPage.tsx';
import MovimentosPage from './pages/MovimentosPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Extend the Window interface to include the ENV property
declare global {
  interface Window {
    ENV: {
      NODE_ENV: 'development' | 'production';
    };
  }
}

// Initialize window.ENV if it doesn't exist
if (!window.ENV) {
  window.ENV = {
    NODE_ENV: (window as any).process?.env?.NODE_ENV === 'production' ? 'production' : 'development'
  };
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/orcamentos" element={<BudgetsPage />} />
            <Route path="/reservas" element={<ReservasPage />} />
            <Route path="/locais" element={<LocaisPage />} />
            <Route path="/movimentos" element={<MovimentosPage />} />
            <Route path="/relatorios" element={
              <div className="container mx-auto px-4 py-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h2 className="text-xl font-semibold text-blue-800 mb-2">Relatórios</h2>
                  <p className="text-blue-600">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            } />
            <Route path="/nanda" element={<NandaPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
      {window.ENV.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
