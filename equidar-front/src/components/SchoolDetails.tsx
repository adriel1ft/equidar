import React from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

export type Escola = {
  nome: string;
  municipio: string;
  ideb: number;
  carencia: number;
  faltas: string[];
}

interface SchoolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: {
    nome: string;
    municipio: string;
    ideb: number;
    carencia: number;
    faltas: string[];
  };
  aiDescription?: string;
}

export function SchoolDetailModal({ isOpen, onClose, school, aiDescription }: SchoolDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !school) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-blue-800">
            {school.nome}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Informações gerais</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Município</span>
                  <p className="font-medium">{school.municipio}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">IDEB</span>
                  <p className="font-medium">{school.ideb.toFixed(1)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Índice de carência</span>
                  <p className="font-medium">{school.carencia}%</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Principais faltas</span>
                  <p className="font-medium">{school.faltas.join(", ")}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-1">Análise IA</h3>
              <div className="bg-blue-50 p-4 rounded-lg text-blue-800">
                {aiDescription || 'Gerando análise...'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex gap-3 justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Fechar
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
              Gerar relatório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}