import React from 'react';
import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { EquidarService } from "../services/api/EquidarService";

export type Escola = {
  id: number;
  nome: string;
  municipio: string;
  ideb: number;
  carencia: number;
  rede: string;
  zona: string;
  alunos: number;
  professores: number;
  faltas: string[];
  infraestrutura: {
    agua: boolean;
    energia: boolean;
    esgoto: boolean;
    acessibilidade: boolean;
    laboratorioInformatica: boolean;
    laboratorioQuimica: boolean;
    bibliotecaAtiva: boolean;
    internetBandaLarga: boolean;
    refeitorio: boolean;
    apoio_psicopedagogico: number;
    existencia_ambiente: number;
    acesso_transporte: number;
  };
}

interface SchoolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: Escola | null;
}

export function SchoolDetailModal({ isOpen, onClose, school }: SchoolDetailModalProps) {
  const [aiDescription, setAiDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const equidarService = new EquidarService();

  // Função para gerar relatório com contexto completo da escola
  // Função para gerar relatório com contexto completo da escola (VERSÃO MOCKADA)
const handleGenerateReport = async () => {
  if (!school) {
    console.error('Escola não disponível');
    return;
  }

  setIsLoading(true);
  setError("");
  
  try {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));

    let mockDescription = "";

    // Análise baseada no nível de carência
    if (school.carencia >= 80) {
      mockDescription = `🚨 ANÁLISE CRÍTICA - ${school.nome}

A escola ${school.nome} apresenta um cenário de CARÊNCIA CRÍTICA (${school.carencia}%), demandando intervenção urgente. Com ${school.alunos} alunos e apenas ${school.professores} professores (razão de ${(school.alunos / school.professores).toFixed(1)} alunos por professor), a instituição enfrenta desafios estruturais significativos.

📊 PRINCIPAIS DEFICIÊNCIAS:
${school.faltas.map(f => `• ${f}`).join('\n')}

🏫 INFRAESTRUTURA:
${!school.infraestrutura.agua ? '⚠️ Ausência de água encanada - risco à saúde e higiene\n' : ''}${!school.infraestrutura.esgoto ? '⚠️ Sem sistema de esgoto adequado\n' : ''}${!school.infraestrutura.internetBandaLarga ? '⚠️ Sem acesso à internet de qualidade - limitando inclusão digital\n' : ''}${!school.infraestrutura.bibliotecaAtiva ? '⚠️ Biblioteca inexistente ou inativa\n' : ''}${!school.infraestrutura.apoio_psicopedagogico ? '⚠️ Sem apoio psicopedagógico\n' : ''}${!school.infraestrutura.acesso_transporte ? '⚠️ Acesso precário ao transporte escolar\n' : ''}

🎯 IMPACTO NO IDEB:
O IDEB de ${school.ideb} reflete diretamente a precariedade das condições de ensino. A falta de recursos essenciais compromete severamente o processo de aprendizagem.

💡 RECOMENDAÇÕES PRIORITÁRIAS:
1. Investimento emergencial em infraestrutura básica (água, esgoto, energia)
2. Implementação de conectividade de qualidade
3. Contratação e capacitação de profissionais
4. Criação de programas de apoio pedagógico
5. Melhoria das condições de acessibilidade

⏰ URGÊNCIA: MÁXIMA - Ações devem ser iniciadas imediatamente para garantir condições mínimas de dignidade e aprendizado.`;
    } 
    else if (school.carencia >= 60) {
      mockDescription = `⚠️ ANÁLISE DE ATENÇÃO - ${school.nome}

A ${school.nome} está em situação de CARÊNCIA MODERADA-ALTA (${school.carencia}%), requerendo atenção especial e planejamento de melhorias. Atende ${school.alunos} estudantes com ${school.professores} educadores.

📊 SITUAÇÃO ATUAL:
A escola ${school.zona === 'Rural' ? 'localizada em zona rural' : 'em área urbana'} da rede ${school.rede.toLowerCase()} apresenta lacunas importantes na infraestrutura que afetam a qualidade do ensino.

❌ PRINCIPAIS FALTAS:
${school.faltas.map(f => `• ${f}`).join('\n')}

✅ PONTOS POSITIVOS:
${school.infraestrutura.agua ? '• Possui água encanada\n' : ''}${school.infraestrutura.energia ? '• Energia elétrica disponível\n' : ''}${school.infraestrutura.refeitorio ? '• Refeitório funcionando\n' : ''}${school.infraestrutura.bibliotecaAtiva ? '• Biblioteca ativa\n' : ''}

📈 ANÁLISE DO IDEB (${school.ideb}):
${school.ideb >= 4.5 ? 'IDEB acima da média, mas pode melhorar com investimentos adequados.' : 'IDEB abaixo do esperado, indicando necessidade de intervenções pedagógicas e estruturais.'}

🎯 AÇÕES RECOMENDADAS:
1. Modernização dos laboratórios e espaços de aprendizagem
2. Implementação/melhoria da conectividade
3. ${!school.infraestrutura.apoio_psicopedagogico ? 'Criação de serviço de apoio psicopedagógico' : 'Fortalecimento do apoio psicopedagógico'}
4. Investimento em acessibilidade e inclusão
5. Capacitação continuada dos professores

⏰ PRAZO SUGERIDO: 12-18 meses para implementação das melhorias prioritárias.`;
    }
    else if (school.carencia >= 40) {
      mockDescription = `✅ ANÁLISE SATISFATÓRIA - ${school.nome}

A ${school.nome} apresenta condições ADEQUADAS (carência de ${school.carencia}%), com infraestrutura básica garantida e oportunidades de aperfeiçoamento. A instituição atende ${school.alunos} alunos com ${school.professores} professores.

🎓 DESTAQUES POSITIVOS:
• IDEB de ${school.ideb} - ${school.ideb >= 4.5 ? 'acima da média nacional' : 'em processo de melhoria'}
• Infraestrutura básica completa (água, energia, esgoto)
• ${school.infraestrutura.refeitorio ? 'Refeitório em funcionamento' : ''}
• ${school.infraestrutura.bibliotecaAtiva ? 'Biblioteca ativa e funcional' : ''}
• ${school.infraestrutura.apoio_psicopedagogico ? 'Serviço de apoio psicopedagógico disponível' : ''}

📊 ÁREAS DE MELHORIA:
${school.faltas.length > 0 ? school.faltas.map(f => `• ${f}`).join('\n') : '• Poucas melhorias necessárias'}

🌟 OPORTUNIDADES DE EXCELÊNCIA:
1. ${!school.infraestrutura.internetBandaLarga ? 'Upgrade de conectividade para ensino digital' : 'Expansão de recursos digitais'}
2. ${!school.infraestrutura.laboratorioQuimica ? 'Implementação de laboratório de química' : 'Modernização dos laboratórios existentes'}
3. Programas de incentivo à leitura e pesquisa
4. Parcerias com universidades e empresas
5. Projetos de inovação pedagógica

💡 PERSPECTIVA:
Com investimentos moderados, esta escola tem potencial para se tornar referência regional em qualidade de ensino.

⏰ HORIZONTE: Melhorias incrementais nos próximos 6-12 meses podem elevar significativamente os indicadores.`;
    }
    else {
      mockDescription = `🌟 ANÁLISE DE EXCELÊNCIA - ${school.nome}

A ${school.nome} é um MODELO DE REFERÊNCIA (carência de apenas ${school.carencia}%), oferecendo condições exemplares de ensino para seus ${school.alunos} estudantes, com suporte de ${school.professores} educadores qualificados.

🏆 INDICADORES DE QUALIDADE:
• IDEB ${school.ideb} - EXCELENTE, acima da meta nacional
• Razão aluno/professor: ${(school.alunos / school.professores).toFixed(1)} - dentro do ideal
• Infraestrutura completa e moderna
• ${school.infraestrutura.apoio_psicopedagogico ? 'Apoio psicopedagógico estruturado' : ''}
• ${school.infraestrutura.acesso_transporte ? 'Transporte escolar de qualidade' : ''}

✨ INFRAESTRUTURA DESTACADA:
${school.infraestrutura.agua ? '✓ Sistema completo de água e saneamento\n' : ''}${school.infraestrutura.internetBandaLarga ? '✓ Internet de alta velocidade\n' : ''}${school.infraestrutura.laboratorioInformatica ? '✓ Laboratório de informática equipado\n' : ''}${school.infraestrutura.laboratorioQuimica ? '✓ Laboratório de química funcional\n' : ''}${school.infraestrutura.bibliotecaAtiva ? '✓ Biblioteca rica e atualizada\n' : ''}${school.infraestrutura.acessibilidade ? '✓ Acessibilidade completa\n' : ''}${school.infraestrutura.refeitorio ? '✓ Refeitório de qualidade\n' : ''}

🎯 PEQUENOS AJUSTES SUGERIDOS:
${school.faltas.length > 0 ? school.faltas.map(f => `• Implementar: ${f}`).join('\n') : '• Manutenção preventiva dos equipamentos\n• Atualização periódica de recursos didáticos'}

🚀 POTENCIAL DE LIDERANÇA:
Esta escola pode servir como centro de formação e referência para outras instituições da região. Recomenda-se:
1. Criação de programa de mentoria para escolas vizinhas
2. Desenvolvimento de projetos piloto de inovação educacional
3. Parcerias internacionais de intercâmbio pedagógico
4. Publicação de boas práticas e metodologias

💎 CONCLUSÃO:
Modelo exemplar de gestão educacional que demonstra o impacto positivo de investimentos adequados e comprometimento institucional. Continue investindo em inovação e formação continuada.`;
    }

    // Adicionar contexto específico baseado na zona
    if (school.zona === 'Rural') {
      mockDescription += `\n\n🌾 CONTEXTO RURAL:
Esta escola em zona rural enfrenta desafios específicos como ${!school.infraestrutura.acesso_transporte ? 'dificuldade de acesso e transporte' : 'necessidade de manter rotas de transporte'}, ${!school.infraestrutura.internetBandaLarga ? 'conectividade limitada' : 'manutenção da infraestrutura digital'} e menor densidade populacional, o que exige políticas diferenciadas de apoio.`;
    }

    setAiDescription(mockDescription);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    setError('Não foi possível gerar o relatório. Tente novamente.');
  } finally {
    setIsLoading(false);
  }
};
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  // Reset ao fechar
  useEffect(() => {
    if (!isOpen) {
      setAiDescription("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !school) return null;

  const corCarencia = (v: number) => 
    v >= 70 ? "text-red-600 bg-red-50" : 
    v >= 50 ? "text-amber-600 bg-amber-50" : 
    "text-green-600 bg-green-50";

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b z-10">
          <div>
            <h2 className="text-2xl font-semibold text-blue-800">
              {school.nome}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {school.municipio} · {school.rede} · {school.zona}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Indicadores Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm text-gray-600">IDEB</span>
              <p className="text-2xl font-bold text-blue-800">{school.ideb}</p>
            </div>
            <div className={`p-4 rounded-lg ${corCarencia(school.carencia)}`}>
              <span className="text-sm">Carência</span>
              <p className="text-2xl font-bold">{school.carencia}%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm text-gray-600">Alunos</span>
              <p className="text-2xl font-bold text-gray-800">{school.alunos}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm text-gray-600">Professores</span>
              <p className="text-2xl font-bold text-gray-800">{school.professores}</p>
            </div>
          </div>

          {/* Estatísticas Adicionais */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📊 Estatísticas</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700">Razão Alunos/Professor:</span>
                <span className="ml-2 font-semibold">{(school.alunos / school.professores).toFixed(1)}</span>
              </div>
              <div>
                <span className="text-blue-700">Tipo:</span>
                <span className="ml-2 font-semibold">{school.rede} - {school.zona}</span>
              </div>
            </div>
          </div>

          {/* Infraestrutura */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              🏫 Infraestrutura Disponível
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries({
                agua: "Água Encanada",
                energia: "Energia Elétrica",
                esgoto: "Esgoto Sanitário",
                acessibilidade: "Acessibilidade",
                laboratorioInformatica: "Lab. Informática",
                laboratorioQuimica: "Lab. Química",
                bibliotecaAtiva: "Biblioteca Ativa",
                internetBandaLarga: "Internet Banda Larga",
                refeitorio: "Refeitório"
              }).map(([key, label]) => {
                const hasItem = school.infraestrutura[key as keyof typeof school.infraestrutura];
                return (
                  <div 
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded ${
                      hasItem ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {hasItem ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="text-sm">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Principais Carências */}
          {school.faltas.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Principais Carências Identificadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {school.faltas.map((falta, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {falta}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Análise IA */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              🤖 Análise Inteligente
            </h3>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {aiDescription ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {aiDescription}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">
                  Clique no botão abaixo para gerar uma análise detalhada com IA
                </p>
                <button
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⚙️</span>
                      Gerando análise...
                    </span>
                  ) : (
                    'Gerar Análise IA'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-4 border-t">
          <div className="flex gap-3 justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fechar
            </button>
            {aiDescription && (
              <button 
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
              >
                {isLoading ? 'Gerando...' : 'Gerar Nova Análise'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}