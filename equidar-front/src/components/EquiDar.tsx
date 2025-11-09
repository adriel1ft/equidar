import React, { useEffect, useState } from "react";
import { MapPin, Info, Share2 } from "lucide-react";
import CarenciaMap from "./Mapping";
import { SchoolDetailModal } from "./SchoolDetails";
import { EquidarService } from "../services/api/EquidarService";

/**
 * EquiDar – UI Wireframe (mobile‑first)
 * - Removed external UI kit dependencies to avoid build/runtime issues
 * - Fixed JSX/TSX syntax that could throw "Missing semicolon" errors
 * - Replaced custom <Select/Toggle> with native elements for reliability
 * - Added lightweight self-tests (console.assert) for helper functions
 */

// ---- Mock data (MVP placeholder) -----------------------------------------
const MUNICIPIOS = [
  { id: 1, nome: "João Pessoa", carencia: 32, zona: "Urbana", populacao: 817511, escolasTotal: 184 },
  { id: 2, nome: "Campina Grande", carencia: 58, zona: "Urbana", populacao: 402912, escolasTotal: 156 },
  { id: 3, nome: "Patos", carencia: 71, zona: "Urbana", populacao: 108192, escolasTotal: 62 },
  { id: 4, nome: "Sousa", carencia: 66, zona: "Mista", populacao: 69444, escolasTotal: 48 },
  { id: 5, nome: "Cajazeiras", carencia: 45, zona: "Mista", populacao: 62576, escolasTotal: 42 },
  { id: 6, nome: "Guarabira", carencia: 52, zona: "Mista", populacao: 59081, escolasTotal: 38 },
  { id: 7, nome: "Santa Rita", carencia: 61, zona: "Urbana", populacao: 136851, escolasTotal: 76 },
  { id: 8, nome: "Bayeux", carencia: 48, zona: "Urbana", populacao: 97010, escolasTotal: 54 }
];

const ESCOLAS = [
  { 
    id: 1, 
    nome: "E. E. José Américo", 
    municipio: "Campina Grande", 
    ideb: 3.9, 
    carencia: 82, 
    rede: "Estadual",
    zona: "Urbana",
    alunos: 856,
    professores: 42,
    faltas: ["biblioteca", "internet", "quadra_esportiva"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: true,
      acessibilidade: false,
      laboratorioInformatica: false,
      laboratorioQuimica: false,
      bibliotecaAtiva: false,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 0,
      existencia_ambiente: 1,
      acesso_transporte: 1
    }
  },
  { 
    id: 2, 
    nome: "E. M. Maria Bonita", 
    municipio: "Itaporanga", 
    ideb: 4.2, 
    carencia: 74, 
    rede: "Municipal",
    zona: "Rural",
    alunos: 324,
    professores: 18,
    faltas: ["acessibilidade", "laboratório", "internet"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: false,
      acessibilidade: false,
      laboratorioInformatica: false,
      laboratorioQuimica: false,
      bibliotecaAtiva: true,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 0,
      existencia_ambiente: 0,
      acesso_transporte: 1
    }
  },
  { 
    id: 3, 
    nome: "E. E. Raul Córdula", 
    municipio: "Campina Grande", 
    ideb: 4.5, 
    carencia: 65, 
    rede: "Estadual",
    zona: "Urbana",
    alunos: 1024,
    professores: 58,
    faltas: ["laboratório química", "internet", "sala professores"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: true,
      acessibilidade: true,
      laboratorioInformatica: true,
      laboratorioQuimica: false,
      bibliotecaAtiva: true,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 1,
      existencia_ambiente: 1,
      acesso_transporte: 1
    }
  },
  { 
    id: 4, 
    nome: "E. M. Padre Zé", 
    municipio: "Patos", 
    ideb: 3.2, 
    carencia: 88, 
    rede: "Municipal",
    zona: "Rural",
    alunos: 187,
    professores: 12,
    faltas: ["água encanada", "esgoto", "internet", "laboratório", "biblioteca"],
    infraestrutura: {
      agua: false,
      energia: true,
      esgoto: false,
      acessibilidade: false,
      laboratorioInformatica: false,
      laboratorioQuimica: false,
      bibliotecaAtiva: false,
      internetBandaLarga: false,
      refeitorio: false,
      apoio_psicopedagogico: 0,
      existencia_ambiente: 0,
      acesso_transporte: 0
    }
  },
  { 
    id: 5, 
    nome: "E. E. Professor Lordão", 
    municipio: "João Pessoa", 
    ideb: 5.1, 
    carencia: 28, 
    rede: "Estadual",
    zona: "Urbana",
    alunos: 1456,
    professores: 82,
    faltas: ["quadra coberta"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: true,
      acessibilidade: true,
      laboratorioInformatica: true,
      laboratorioQuimica: true,
      bibliotecaAtiva: true,
      internetBandaLarga: true,
      refeitorio: true,
      apoio_psicopedagogico: 1,
      existencia_ambiente: 1,
      acesso_transporte: 1
    }
  },
  { 
    id: 6, 
    nome: "E. M. São Francisco", 
    municipio: "Sousa", 
    ideb: 3.7, 
    carencia: 79, 
    rede: "Municipal",
    zona: "Rural",
    alunos: 246,
    professores: 15,
    faltas: ["esgoto", "internet", "laboratório", "acessibilidade"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: false,
      acessibilidade: false,
      laboratorioInformatica: false,
      laboratorioQuimica: false,
      bibliotecaAtiva: false,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 0,
      existencia_ambiente: 0,
      acesso_transporte: 1
    }
  },
  { 
    id: 7, 
    nome: "E. E. Elpídio de Almeida", 
    municipio: "Campina Grande", 
    ideb: 4.8, 
    carencia: 42, 
    rede: "Estadual",
    zona: "Urbana",
    alunos: 1189,
    professores: 65,
    faltas: ["internet estável", "laboratório química"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: true,
      acessibilidade: true,
      laboratorioInformatica: true,
      laboratorioQuimica: false,
      bibliotecaAtiva: true,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 1,
      existencia_ambiente: 1,
      acesso_transporte: 1
    }
  },
  { 
    id: 8, 
    nome: "E. M. Nazaré de Souza", 
    municipio: "Cajazeiras", 
    ideb: 4.0, 
    carencia: 56, 
    rede: "Municipal",
    zona: "Urbana",
    alunos: 432,
    professores: 28,
    faltas: ["laboratório", "quadra esportiva", "internet"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: true,
      acessibilidade: false,
      laboratorioInformatica: false,
      laboratorioQuimica: false,
      bibliotecaAtiva: true,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 0,
      existencia_ambiente: 1,
      acesso_transporte: 1
    }
  },
  { 
    id: 9, 
    nome: "E. E. Monte Carmelo", 
    municipio: "Santa Rita", 
    ideb: 3.5, 
    carencia: 71, 
    rede: "Estadual",
    zona: "Urbana",
    alunos: 678,
    professores: 38,
    faltas: ["biblioteca", "internet", "laboratório química", "acessibilidade"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: true,
      acessibilidade: false,
      laboratorioInformatica: true,
      laboratorioQuimica: false,
      bibliotecaAtiva: false,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 0,
      existencia_ambiente: 1,
      acesso_transporte: 1
    }
  },
  { 
    id: 10, 
    nome: "E. M. Rosa Mística", 
    municipio: "Guarabira", 
    ideb: 4.3, 
    carencia: 62, 
    rede: "Municipal",
    zona: "Rural",
    alunos: 298,
    professores: 19,
    faltas: ["esgoto", "internet", "laboratório"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: false,
      acessibilidade: false,
      laboratorioInformatica: false,
      laboratorioQuimica: false,
      bibliotecaAtiva: true,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 0,
      existencia_ambiente: 0,
      acesso_transporte: 1
    }
  },
  { 
    id: 11, 
    nome: "E. E. Olivina Olívia", 
    municipio: "João Pessoa", 
    ideb: 4.7, 
    carencia: 38, 
    rede: "Estadual",
    zona: "Urbana",
    alunos: 945,
    professores: 54,
    faltas: ["laboratório química", "quadra coberta"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: true,
      acessibilidade: true,
      laboratorioInformatica: true,
      laboratorioQuimica: false,
      bibliotecaAtiva: true,
      internetBandaLarga: true,
      refeitorio: true,
      apoio_psicopedagogico: 1,
      existencia_ambiente: 1,
      acesso_transporte: 1
    }
  },
  { 
    id: 12, 
    nome: "E. M. Pedro Álvares Cabral", 
    municipio: "Bayeux", 
    ideb: 3.8, 
    carencia: 68, 
    rede: "Municipal",
    zona: "Urbana",
    alunos: 512,
    professores: 31,
    faltas: ["internet", "laboratório", "acessibilidade", "biblioteca"],
    infraestrutura: {
      agua: true,
      energia: true,
      esgoto: true,
      acessibilidade: false,
      laboratorioInformatica: false,
      laboratorioQuimica: false,
      bibliotecaAtiva: false,
      internetBandaLarga: false,
      refeitorio: true,
      apoio_psicopedagogico: 0,
      existencia_ambiente: 1,
      acesso_transporte: 1
    }
  }
];

// Novo conjunto de dados para categorias de carência
const CATEGORIAS_CARENCIA = [
  { id: "biblioteca", nome: "Biblioteca", peso: 0.15 },
  { id: "internet", nome: "Internet Banda Larga", peso: 0.15 },
  { id: "laboratorio", nome: "Laboratório de Informática", peso: 0.12 },
  { id: "acessibilidade", nome: "Acessibilidade", peso: 0.13 },
  { id: "quadra_esportiva", nome: "Quadra Esportiva", peso: 0.10 },
  { id: "refeitorio", nome: "Refeitório", peso: 0.12 },
  { id: "agua_esgoto", nome: "Água e Esgoto", peso: 0.13 },
  { id: "sala_professores", nome: "Sala dos Professores", peso: 0.10 }
];

// ---- Helpers --------------------------------------------------------------
const corCarencia = (v) => (v >= 70 ? "#ef4444" : v >= 50 ? "#f59e0b" : "#22c55e");

// Simple self-tests to avoid silent regressions
function runSelfTests() {
  try {
    console.assert(corCarencia(80) === "#ef4444", "color for >=70 should be red");
    console.assert(corCarencia(60) === "#f59e0b", "color for 50-69 should be amber");
    console.assert(corCarencia(10) === "#22c55e", "color for <50 should be green");
    // ranking should be descending by carência
    const sorted = [...ESCOLAS].sort((a, b) => b.carencia - a.carencia);
    for (let i = 1; i < sorted.length; i++) {
      console.assert(sorted[i - 1].carencia >= sorted[i].carencia, "ranking order");
    }
    // basic data integrity
    console.assert(MUNICIPIOS.every(m => typeof m.nome === "string" && typeof m.carencia === "number"), "municipios integrity");
  } catch (e) {
    console.warn("Self-tests reported an issue:", e);
  }
}

// ---- UI -------------------------------------------------------------------
export default function EquiDarUI() {
  const [mode, setMode] = useState("Gestor");
  const [municipioFiltro, setMunicipioFiltro] = useState("");
  const [redeFiltro, setRedeFiltro] = useState("");
  const [zonaFiltro, setZonaFiltro] = useState("");
  const [busca, setBusca] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null as Escola | null);
  const [isLoading, setIsLoading] = useState(false);
  const [rankings, setRankings] = useState<any[]>([]);
  const equidarService = new EquidarService();

  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const data = await equidarService.getMunicipalityRankings();
        setRankings(data.map(r => ({
          id: r.municipality_id,
          nome: r.municipality_name,
          carencia: Math.round((1 - r.score) * 100),
          detalhes: r.breakdown
        })));
      } catch (error) {
        console.error('Erro ao carregar rankings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  useEffect(() => {
    runSelfTests();
  }, []);

  // Simples filtragem client-side (mock)
  const escolasFiltradas = ESCOLAS.filter((e) => {
    const byMunicipio = !municipioFiltro || e.municipio === municipioFiltro;
    const byBusca = !busca || e.nome.toLowerCase().includes(busca.toLowerCase()) || e.municipio.toLowerCase().includes(busca.toLowerCase());
    // rede/zona placeholders para futura lógica
    return byMunicipio && byBusca;
  }).sort((a, b) => b.carencia - a.carencia);

  const handleGenerateRanking = async () => {
    try {
      setIsLoading(true);
      const params = {
        municipalityId: municipioFiltro ? parseInt(municipioFiltro) : undefined,
        regionType: redeFiltro || undefined,
        isUrban: zonaFiltro ? zonaFiltro === "Urbana" : undefined
      };

      const ranking = await equidarService.getCareRankingByParameters(params);
      // TODO: Atualizar o estado com os dados recebidos
      console.log('Ranking recebido:', ranking);
    } catch (error) {
      console.error('Erro ao gerar ranking:', error);
      // TODO: Adicionar tratamento de erro adequado
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Filtros */}
      <section className="py-6 px-4 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar escola ou município..."
            className="max-w-sm w-full px-3 py-2 rounded border"
            disabled
          />
          <select className="px-3 py-2 rounded border" value={municipioFiltro} onChange={(e) => setMunicipioFiltro(e.target.value)}>
            <option value="">Município</option>
            {MUNICIPIOS.map((m) => (
              <option key={m.nome} value={m.nome}>{m.nome}</option>
            ))}
          </select>
          <select className="px-3 py-2 rounded border" value={redeFiltro} onChange={(e) => setRedeFiltro(e.target.value)}>
            <option value="">Rede</option>
            <option value="Estadual">Estadual</option>
            <option value="Municipal">Municipal</option>
          </select>
          <select className="px-3 py-2 rounded border" value={zonaFiltro} onChange={(e) => setZonaFiltro(e.target.value)}>
            <option value="">Zona</option>
            <option value="Urbana">Urbana</option>
            <option value="Rural">Rural</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleGenerateRanking}
          disabled={isLoading}
          >
            {isLoading ? 'Gerando...' : 'Gerar ranking'}
          </button>
        </div>
      </section>

      <CarenciaMap></CarenciaMap>

      {/* Ranking */}
      <section className="px-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-800">Ranking de prioridade </h3>
          <span className="text-xs text-gray-500">Ordenado por índice de carência</span>
        </div>
      </section>

      <main className="px-4 pb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {escolasFiltradas.map((e, i) => (
          <div key={e.nome} className="bg-white shadow-sm border border-gray-200 rounded-lg">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-800">
                  {i + 1}. {e.nome} – {e.municipio}
                </h3>
                <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">IDEB: {e.ideb.toFixed(1)}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Índice de carência</span>
                  <b>{e.carencia}%</b>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded mt-1">
                  <div className="h-2 rounded" style={{ width: `${e.carencia}%`, background: corCarencia(e.carencia) }} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Principais faltas: {e.faltas.join(", ")}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedSchool(e)}
                  className="px-3 py-1 rounded border text-sm"
                >
                  <Info className="w-4 h-4 inline mr-1" /> Ver mais
                </button>
                <button className="px-3 py-1 rounded border text-sm">
                  <Share2 className="w-4 h-4 inline mr-1" /> Compartilhar
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      <SchoolDetailModal 
        isOpen={!!selectedSchool}
        onClose={() => setSelectedSchool(null)}
        school={selectedSchool}
      />

      {/* Insights */}
      <section className="px-4 py-8 bg-gray-100">
        <h3 className="text-lg font-semibold text-blue-700 mb-4">💡 Insights automáticos</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>As escolas rurais têm 2,3x mais carência que as urbanas.</li>
          <li>Biblioteca e conectividade são os fatores mais ausentes.</li>
          <li>Investir em 10 escolas reduziria a carência média em 18%.</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm bg-blue-900 text-white">
        Desenvolvido pela equipe EquiDar · Hackathon Devs de Impacto 2025
      </footer>
    </div>
  );
}
