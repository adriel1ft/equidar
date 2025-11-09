import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MUNICIPIOS_DATA = [
  { nome: "João Pessoa", lat: -7.115, lng: -34.863, carencia: 45 },
  { nome: "Campina Grande", lat: -7.231, lng: -35.881, carencia: 58 },
  { nome: "Santa Rita", lat: -7.114, lng: -34.975, carencia: 62 },
  { nome: "Patos", lat: -7.017, lng: -37.277, carencia: 71 },
  { nome: "Bayeux", lat: -7.125, lng: -34.932, carencia: 65 },
  { nome: "Sousa", lat: -6.761, lng: -38.228, carencia: 69 },
  { nome: "Cabedelo", lat: -6.982, lng: -34.838, carencia: 48 },
  { nome: "Cajazeiras", lat: -6.888, lng: -38.559, carencia: 63 },
  { nome: "Guarabira", lat: -6.851, lng: -35.485, carencia: 55 }
];

const getCorCarencia = (valor: number): string => {
  if (valor >= 70) return "#ef4444";
  if (valor >= 50) return "#f59e0b";
  return "#22c55e";
};

const getCategoria = (valor: number): string => {
  if (valor >= 70) return "Alta Carência";
  if (valor >= 50) return "Média Carência";
  return "Baixa Carência";
};

const CarenciaMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    // Inicializa o mapa
    mapRef.current = L.map(mapContainer.current).setView([-7.5, -36.0], 7);

    // Adiciona camada de tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Adiciona marcadores
    MUNICIPIOS_DATA.forEach((municipio) => {
      const color = getCorCarencia(municipio.carencia);
      
      // Cria ícone customizado
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            font-size: 12px;
          ">${municipio.carencia}</div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Adiciona marcador com popup
      L.marker([municipio.lat, municipio.lng], { icon: customIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="padding: 12px; font-family: sans-serif;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${municipio.nome}</h3>
            <p style="margin: 0;">Índice de Carência: <strong>${municipio.carencia}%</strong></p>
            <p style="margin: 4px 0 0; font-size: 12px; color: ${color}; font-weight: 600;">
              ${getCategoria(municipio.carencia)}
            </p>
          </div>
        `);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="border rounded-lg bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-800">
          Mapa de Carência Educacional
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#22c55e]" /> Baixa (&lt;50%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#f59e0b]" /> Média (50-69%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-[#ef4444]" /> Alta (≥70%)
          </span>
        </div>
      </div>

      <div 
        ref={mapContainer} 
        className="rounded-lg h-[500px] w-full"
        style={{ minHeight: '500px' }}
      />

      {/* --- 
      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Observações:</p>
        <ul className="list-disc list-inside mt-2">
          <li>O tamanho do marcador indica a intensidade do índice</li>
          <li>Clique nos marcadores para ver detalhes</li>
          <li>Use os controles para ajustar a visualização</li>
        </ul>
      </div>
      */}
    </div>
  );
};

export default CarenciaMap;