import React, { useState } from 'react';
import { XMarkIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageGalleryUploadProps {
  images?: string[] | null;
  onAdd: (files: FileList) => void;
  onRemove: (imagePath: string) => void;
  maxImages?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

const ImageGalleryUpload: React.FC<ImageGalleryUploadProps> = ({
  images = [],
  onAdd,
  onRemove,
  maxImages = 10,
  maxSizeMB = 5,
  disabled = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const currentImages = images || [];

  const getImageSrc = (src: string) => {
    if (src.startsWith('http') || src.startsWith('https')) {
      return src;
    }
    if (src.startsWith('/')) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${src}`;
    }
    if (src.startsWith('data:')) {
      return src; // Base64
    }
    return `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${src.startsWith('/') ? '' : '/'}${src}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validar quantidade
    if (currentImages.length + files.length > maxImages) {
      setError(`Máximo de ${maxImages} imagens permitido`);
      return;
    }

    // Validar tipo e tamanho
    const maxSize = maxSizeMB * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        setError('Apenas arquivos de imagem são permitidos');
        return;
      }

      if (file.size > maxSize) {
        setError(`Cada imagem deve ter no máximo ${maxSizeMB}MB`);
        return;
      }
    }

    setError(null);
    onAdd(files);
    
    // Limpar input
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && currentImages.length < maxImages) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    // Validar quantidade
    if (currentImages.length + files.length > maxImages) {
      setError(`Máximo de ${maxImages} imagens permitido`);
      return;
    }

    // Validar tipo e tamanho
    const maxSize = maxSizeMB * 1024 * 1024;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        setError('Apenas arquivos de imagem são permitidos');
        return;
      }

      if (file.size > maxSize) {
        setError(`Cada imagem deve ter no máximo ${maxSizeMB}MB`);
        return;
      }
    }

    setError(null);
    onAdd(files);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Galeria de Imagens
          <span className="ml-1 text-xs font-normal text-gray-500">
            (máx. {maxSizeMB}MB cada)
          </span>
        </label>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          currentImages.length >= maxImages 
            ? 'bg-red-100 text-red-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {currentImages.length}/{maxImages}
        </span>
      </div>

      {/* Grid de imagens */}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {currentImages.map((imagePath, index) => (
          <div key={index} className="relative group">
            <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50 shadow-sm transition-all duration-200 hover:shadow-md">
              <img
                src={getImageSrc(imagePath)}
                alt={`Galeria ${index + 1}`}
                className="h-32 w-full object-cover"
                onError={(e) => {
                  console.error('Erro ao carregar imagem da galeria:', imagePath);
                  // Mostrar placeholder em caso de erro
                  e.currentTarget.style.display = 'none';
                }}
              />
              
              {/* Overlay com número da imagem */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                <span className="text-white text-xs font-medium">#{index + 1}</span>
              </div>

              {/* Botão de remover */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(imagePath)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg hover:scale-110"
                  title="Remover imagem"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Botão para adicionar mais imagens */}
        {!disabled && currentImages.length < maxImages && (
          <label className={`
            h-32 border-2 border-dashed rounded-xl
            flex flex-col items-center justify-center gap-2
            cursor-pointer transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg' 
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
            }
          `}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className={`
              p-2 rounded-full transition-all duration-200
              ${isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-100'}
            `}>
              {isDragging ? (
                <PhotoIcon className="h-6 w-6 text-blue-500" />
              ) : (
                <PlusIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {isDragging ? 'Solte aqui' : 'Adicionar'}
            </span>
          </label>
        )}

        {/* Placeholder quando não há imagens */}
        {currentImages.length === 0 && !disabled && (
          <>
            <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50" />
            <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50" />
            <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hidden md:block" />
          </>
        )}
      </div>

      {/* Mensagens de ajuda e erro */}
      {!error && currentImages.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <PhotoIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Adicione imagens à galeria clicando no botão ou arrastando arquivos
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XMarkIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryUpload;
