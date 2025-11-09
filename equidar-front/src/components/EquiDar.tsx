import React, { useEffect, useState } from "react";
import { MapPin, Info, Share2 } from "lucide-react";
import CarenciaMap from "./Mapping";
import { SchoolDetailModal } from "./SchoolDetails";

/**
 * EquiDar – UI Wireframe (mobile‑first)
 * - Removed external UI kit dependencies to avoid build/runtime issues
 * - Fixed JSX/TSX syntax that could throw "Missing semicolon" errors
 * - Replaced custom <Select/Toggle> with native elements for reliability
 * - Added lightweight self-tests (console.assert) for helper functions
 */

// ---- Mock data (MVP placeholder) -----------------------------------------
const MUNICIPIOS = [
  { nome: "João Pessoa", carencia: 32 },
  { nome: "Campina Grande", carencia: 58 },
  { nome: "Patos", carencia: 71 },
  { nome: "Sousa", carencia: 66 },
  { nome: "Cajazeiras", carencia: 45 },
  { nome: "Guarabira", carencia: 52 },
];

const ESCOLAS = [
  { nome: "E. E. José Américo", municipio: "Campina Grande", ideb: 3.9, carencia: 82, faltas: ["biblioteca", "internet"] },
  { nome: "E. M. Maria Bonita", municipio: "Itaporanga", ideb: 4.2, carencia: 74, faltas: ["acessibilidade", "laboratório"] },
  { nome: "E. E. Frei Damião", municipio: "Sousa", ideb: 6.0, carencia: 76, faltas: ["laboratório", "internet"] },
  { nome: "E. M. N. de Castro", municipio: "Patos", ideb: 3.7, carencia: 69, faltas: ["biblioteca", "acessibilidade"] },
  { nome: "E. M. Monte Azul", municipio: "Cajazeiras", ideb: 4.8, carencia: 62, faltas: ["laboratório"] },
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
          <button className="bg-green-600 text-white px-4 py-2 rounded">Gerar ranking</button>
        </div>
      </section>

      <CarenciaMap></CarenciaMap>

      {/* Ranking */}
      <section className="px-4 pt-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-800">Ranking de prioridade (simulado)</h3>
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
        aiDescription="Esta escola apresenta um índice de carência significativo, principalmente nas áreas de infraestrutura tecnológica e biblioteca. Com base nos dados históricos, investimentos em conectividade e acervo bibliográfico teriam alto impacto no desempenho dos alunos."
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
