// Controllers: Funções auxiliares e de resposta


// Resposta de sucesso padrão
function createSuccessResponse(data) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

// Resposta de erro padrão
function createErrorResponse(message, code) {
  return {
    error: true,
    success: false,
    message,
    code,
    timestamp: new Date().toISOString()
  };
}

// (Opcional) Resposta de query, se necessário para debug
function createQueryResponse(query, parameters = {}) {
  return {
    query,
    parameters,
    timestamp: new Date().toISOString()
  };
}
module.exports = {
  createQueryResponse,
  createErrorResponse,
  createSuccessResponse
};
