import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import EquiDar from './components/EquiDar';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorar" element={<EquiDar />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}