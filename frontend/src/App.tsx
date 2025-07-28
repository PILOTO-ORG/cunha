import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import LoginPage from './pages/LoginPage.tsx';
// import RelatoriosPage from './pages/RelatoriosPage'; // Removido pois não existe
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/produtos" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                <Route path="/clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                <Route path="/orcamentos" element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
                <Route path="/reservas" element={<ProtectedRoute><ReservasPage /></ProtectedRoute>} />
                <Route path="/locais" element={<ProtectedRoute><LocaisPage /></ProtectedRoute>} />
                <Route path="/movimentos" element={<ProtectedRoute><MovimentosPage /></ProtectedRoute>} />
                {/* <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} /> */}
                <Route path="/nanda" element={<ProtectedRoute><NandaPage /></ProtectedRoute>} />
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
