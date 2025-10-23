import React from 'react';
import OrcamentoCheckoutForm from '../components/OrcamentoCheckoutForm';
import { useNavigate } from 'react-router-dom';

const OrcamentoCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (orcamentoData?: any) => {
    // O OrcamentoCheckoutForm já cuida de abrir o PDF e navegar
    // Aqui podemos adicionar lógica adicional se necessário
    console.log('Orçamento criado:', orcamentoData);
  };

  const handleCancel = () => {
    navigate('/orcamentos');
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Criar Orçamento (Marketplace)</h1>
      <OrcamentoCheckoutForm 
        items={[]} 
        onSuccess={handleSuccess} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default OrcamentoCreatePage;
