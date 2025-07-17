// Código para formatar a resposta final do n8n
const queryResult = $input.first().json;
const configData = $('Code').first().json;

console.log('📤 [FINISH] Dados recebidos:', JSON.stringify({
  queryResult: Array.isArray(queryResult) ? `Array[${queryResult.length}]` : typeof queryResult,
  configData: configData,
  action: configData?.action
}, null, 2));

// Se houve erro na validação, retornar erro
if (configData.error || configData.success === false) {
  console.log('❌ [FINISH] Retornando erro:', configData);
  return configData;
}

// Lista de ações que devem retornar arrays
const arrayActions = [
  'listar_produtos', 'listar_clientes', 'listar_locais', 
  'listar_reservas', 'listar_movimentos', 'buscar_clientes_nome',
  'buscar_locais_tipo', 'buscar_reservas_cliente', 'buscar_reservas_produto',
  'buscar_reservas_periodo', 'buscar_movimentos_produto', 'buscar_movimentos_tipo',
  'buscar_movimentos_periodo', 'obter_historico_produto', 'listar_produtos_estoque_baixo'
];

// Processar resultado da query
let processedData;

if (arrayActions.includes(configData.action)) {
  // Para endpoints de listagem, sempre garantir que retornamos um array
  if (Array.isArray(queryResult)) {
    processedData = queryResult;
  } else if (queryResult && typeof queryResult === 'object') {
    processedData = [queryResult];
  } else {
    processedData = [];
  }
  console.log(`✅ [FINISH] Endpoint de listagem - retornando array com ${processedData.length} itens`);
} else {
  // Para endpoints de busca/criação/atualização, retornar objeto único
  if (Array.isArray(queryResult)) {
    processedData = queryResult.length > 0 ? queryResult[0] : {};
  } else if (queryResult && typeof queryResult === 'object') {
    // Verificar se é um objeto de contagem
    if (queryResult.total !== undefined && configData.action === 'verificar_cliente_existe') {
      processedData = {
        total: queryResult.total.toString()
      };
    } else {
      processedData = queryResult;
    }
  } else {
    processedData = {};
  }
  console.log('✅ [FINISH] Endpoint de objeto único - processado');
}

// Resposta de sucesso padrão
const response = {
  success: true,
  data: processedData,
  action: configData.action,
  timestamp: new Date().toISOString()
};

// Para queries de listagem, adicionar metadados de paginação
if (arrayActions.includes(configData.action) && Array.isArray(processedData)) {
  response.pagination = {
    total: processedData.length,
    returned: processedData.length,
    page: configData.page || 1,
    limit: configData.limit || 50
  };
}

// Adicionar mensagem específica se disponível
if (configData.successMessage) {
  response.message = configData.successMessage;
}

console.log('📤 [FINISH] Resposta final:', JSON.stringify({
  success: response.success,
  dataType: Array.isArray(response.data) ? `Array[${response.data.length}]` : typeof response.data,
  action: response.action,
  hasPagination: !!response.pagination
}, null, 2));

return response;