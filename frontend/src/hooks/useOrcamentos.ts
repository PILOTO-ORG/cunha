// Hook de exemplo para orçamentos
import { useCallback } from 'react';

export function useConverterOrcamento() {
  // Exemplo de mutation fake
  const mutateAsync = useCallback(async (id: number) => {
    // Simule uma chamada de API
    return Promise.resolve({ success: true, id });
  }, []);
  return { mutateAsync };
}

// Export default para garantir que seja um módulo
export default useConverterOrcamento;
