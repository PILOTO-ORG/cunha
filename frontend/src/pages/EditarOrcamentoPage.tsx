import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditarOrcamentoPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para a página de criação de orçamento com ID para edição
    if (id) {
      navigate(`/orcamentos/novo?edit=${id}`);
    } else {
      navigate('/orcamentos');
    }
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Redirecionando para edição...</div>
    </div>
  );
};

export default EditarOrcamentoPage;
