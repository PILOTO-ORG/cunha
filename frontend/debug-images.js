// Script de debug para verificar URLs de imagens
// Execute no console do navegador

console.log('=== DEBUG IMAGENS ===');
console.log('API_URL:', process.env.REACT_APP_API_URL || 'http://localhost:4001');

// Verificar se as imagens estão acessíveis
const testImageUrl = (url) => {
  const img = new Image();
  img.onload = () => console.log('✅ Imagem carregada:', url);
  img.onerror = () => console.error('❌ Erro ao carregar:', url);
  img.src = url;
};

// Testar URLs
const urls = [
  '/uploads/produtos/imagem.jpg',
  'http://localhost:4001/uploads/produtos/imagem.jpg',
  '/api/uploads/produtos/imagem.jpg'
];

urls.forEach(url => testImageUrl(url));

// Verificar localStorage
console.log('JWT Token:', localStorage.getItem('jwt') ? 'Existe' : 'Não existe');

// Verificar todas as imagens na página
const images = document.querySelectorAll('img');
console.log(`Total de imagens na página: ${images.length}`);
images.forEach((img, i) => {
  if (img.alt.includes('Galeria') || img.alt.includes('Produto')) {
    console.log(`Imagem ${i}:`, {
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete
    });
  }
});
