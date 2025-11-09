import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Hero */}
      <section className="text-center py-20 px-4 bg-gradient from-blue-600 to-green-600">
        <h2 className="text-4xl font-bold text-blue-800 mb-4">
          IA para uma educação pública mais justa e transparente
        </h2>
        <p className="text-gray-600 mb-8 text-xl max-w-2xl mx-auto">
          Descubra quais escolas mais precisam de investimento e acompanhe o impacto dos recursos públicos.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/explorar" className="bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium">
            Explorar escolas
          </Link>
          <button className="border border-blue-700 text-blue-700 px-6 py-3 rounded-lg text-lg font-medium">
            Saiba mais
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">Transparência</h3>
            <p className="text-gray-600">Acompanhe dados reais sobre a infraestrutura das escolas públicas.</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">Inteligência</h3>
            <p className="text-gray-600">Use IA para identificar prioridades e otimizar investimentos.</p>
          </div>
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-3">Impacto</h3>
            <p className="text-gray-600">Contribua para uma distribuição mais equitativa dos recursos.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm bg-blue-900 text-white">
        Desenvolvido pela equipe EquiDar · Hackathon Devs de Impacto 2025
      </footer>
    </div>
  );
}