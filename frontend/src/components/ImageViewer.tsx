import React, { useState } from 'react';
import { XMarkIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
  thumbnailClassName?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  src, 
  alt, 
  className = '',
  thumbnailClassName = 'h-12 w-12'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Construir URL completa: se já for HTTP, usar direto; caso contrário, adicionar base URL
  const fullSrc = src.startsWith('http') 
    ? src 
    : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}${src.startsWith('/') ? src : '/' + src}`;

  return (
    <>
      {/* Thumbnail com hover */}
      <div 
        className="relative group cursor-pointer" 
        onClick={(e) => {
          e.stopPropagation(); // Previne propagação do click
          setIsModalOpen(true);
        }}
      >
        <img
          src={fullSrc}
          alt={alt}
          className={`object-cover rounded-lg border-2 border-gray-200 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-blue-300 ${thumbnailClassName} ${className}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const placeholder = target.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
        {/* Placeholder se imagem não carregar */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-200 items-center justify-center flex-col hidden"
        >
          <MagnifyingGlassPlusIcon className="h-6 w-6 text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">Sem imagem</span>
        </div>
        {/* Overlay ao passar o mouse */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none">
          <MagnifyingGlassPlusIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Modal de visualização */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Botão fechar */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* Imagem em tamanho grande */}
            <img
              src={fullSrc}
              alt={alt}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Legenda */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-sm font-medium">{alt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageViewer;
