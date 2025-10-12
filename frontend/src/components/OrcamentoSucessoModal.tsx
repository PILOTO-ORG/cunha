import React, { useState } from 'react';
import Button from './ui/Button';
import { 
  DocumentArrowDownIcon, 
  PencilSquareIcon, 
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface OrcamentoSucessoModalProps {
  orcamentoId: number;
  onClose: () => void;
  onGerarPDF: () => Promise<void>;
  onGerarAssinatura: () => Promise<any>;
}

const OrcamentoSucessoModal: React.FC<OrcamentoSucessoModalProps> = ({
  orcamentoId,
  onClose,
  onGerarPDF,
}) => {
  const [loadingPDF, setLoadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      setLoadingPDF(true);
      await onGerarPDF();
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoadingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="w-10 h-10 text-white mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-white">Orçamento Criado!</h2>
                <p className="text-green-100 text-sm">Nº {String(orcamentoId).padStart(6, '0')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-800 font-medium">
              ✓ Orçamento salvo com sucesso!
            </p>
            <p className="text-green-700 text-sm mt-1">
              Escolha uma das opções abaixo para compartilhar ou assinar o documento.
            </p>
          </div>

          {/* Opções de Ação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Baixar PDF */}
            <div className="border-2 border-blue-200 rounded-lg p-5 hover:border-blue-400 transition-colors bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center mb-3">
                <DocumentArrowDownIcon className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-bold text-gray-900">Baixar PDF</h3>
                  <p className="text-xs text-gray-600">Download direto</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Faça download do orçamento em PDF para impressão ou envio por email.
              </p>
              <Button
                onClick={handleDownloadPDF}
                disabled={loadingPDF}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loadingPDF ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Gerando...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </>
                )}
              </Button>
            </div>

            {/* Assinatura Digital */}
            <div className="border-2 border-gray-200 rounded-lg p-5 bg-gradient-to-br from-gray-50 to-white opacity-75">
              <div className="flex items-center mb-3">
                <PencilSquareIcon className="w-8 h-8 text-gray-400 mr-3" />
                <div>
                  <h3 className="font-bold text-gray-700">Assinatura Digital</h3>
                  <p className="text-xs text-yellow-600 font-semibold">Em Breve</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Envie para assinatura digital usando a plataforma do governo federal.
              </p>
              <Button
                disabled={true}
                className="w-full bg-gray-400 cursor-not-allowed"
                title="Funcionalidade em desenvolvimento"
              >
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Em Breve
              </Button>
            </div>
          </div>

          {/* Informações do Link de Assinatura - Funcionalidade em Breve */}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <Button
              onClick={onClose}
              variant="secondary"
              className="px-6"
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrcamentoSucessoModal;
