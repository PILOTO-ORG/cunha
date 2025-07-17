import React from 'react';

interface OrcamentoFormProps {
  orcamento?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const OrcamentoForm: React.FC<OrcamentoFormProps> = ({ orcamento, onSuccess, onCancel }) => {
  return (
    <div>
      <h3>Formulário de Orçamento (placeholder)</h3>
      <button onClick={onSuccess}>Salvar</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  );
};

export default OrcamentoForm;
