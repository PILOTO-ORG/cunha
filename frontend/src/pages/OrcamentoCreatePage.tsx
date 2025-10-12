import React from 'react';
import OrcamentoCheckoutForm from '../components/OrcamentoCheckoutForm';

const OrcamentoCreatePage: React.FC = () => {
  // Aqui você pode passar os itens iniciais do marketplace, se necessário
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Criar Orçamento (Marketplace)</h1>
      <OrcamentoCheckoutForm items={[]} onSuccess={() => {}} onCancel={() => {}} />
    </div>
  );
};

export default OrcamentoCreatePage;
