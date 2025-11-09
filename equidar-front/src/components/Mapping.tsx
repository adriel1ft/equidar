import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

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
  const map = useRef<mapboxgl.Map | null>(null);

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-36.0, -7.5], // Centro da Paraíba
        zoom: 7,
        pitch: 30, // Adiciona uma inclinação para melhor visualização
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      map.current.on("load", () => {
        MUNICIPIOS_DATA.forEach((municipio) => {
          const color = getCorCarencia(municipio.carencia);
          
          // Cria o elemento do marcador
          const el = document.createElement("div");
          el.className = "carencia-marker";
          el.style.backgroundColor = color;
          el.style.width = "40px";
          el.style.height = "40px";
          el.style.borderRadius = "50%";
          el.style.border = "3px solid white";
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.fontWeight = "bold";
          el.style.color = "white";
          el.style.fontSize = "12px";
          el.textContent = municipio.carencia.toString();

          // Cria o popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 12px;">
              <h3 style="font-weight: bold; margin-bottom: 8px;">${municipio.nome}</h3>
              <p style="margin: 0;">Índice de Carência: ${municipio.carencia}%</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: ${color};">
                ${getCategoria(municipio.carencia)}
              </p>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([municipio.lng, municipio.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });
      });
    } catch (error) {
      console.error("Erro ao inicializar o mapa:", error);
    }
  };

  useEffect(() => {
    initializeMap();
    return () => {
      if (map.current) {
        map.current.remove();
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

      <div ref={mapContainer} className="rounded-lg h-[500px]" />

      <div className="mt-4 text-sm text-gray-600">
        <p className="font-medium">Observações:</p>
        <ul className="list-disc list-inside mt-2">
          <li>O tamanho do marcador indica a intensidade do índice</li>
          <li>Clique nos marcadores para ver detalhes</li>
          <li>Use os controles para ajustar a visualização</li>
        </ul>
      </div>
    </div>
  );
};

export default CarenciaMap;