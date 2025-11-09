import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white shadow-sm sticky top-0 z-50">
      <h1 className="text-xl font-bold text-blue-700">EquiDar</h1>
      <div className="flex gap-2 items-center">
        {isHome ? (
          <Link to="/explorar" className="bg-blue-700 text-white px-4 py-2 rounded">
            Acessar plataforma
          </Link>
        ) : (
          <Link to="/" className="px-3 py-2 rounded border text-sm">
            Voltar para Home
          </Link>
        )}
      </div>
    </header>
  );
}