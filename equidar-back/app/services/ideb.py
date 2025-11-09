import pandas as pd
from typing import List, Dict, Optional
from app.models import (
    IDEBData, SchoolPerformanceReport, MunicipalityPerformanceReport,
    AxisPerformance, IDEBPerformanceIndex, UpgradePoint, PerformanceAxis,
    UpgradePriority, SchoolType
)
import numpy as np

class IDEBService:
    def __init__(self, csv_path: str):
        self.df = pd.read_csv(csv_path, dtype={'ID_ESCOLA': str, 'CO_MUNICIPIO': str})
        self._clean_data()
    
    def _clean_data(self):
        """Limpa e prepara os dados do CSV"""
        # Substitui valores vazios e '-' por NaN
        self.df = self.df.replace(['-', ''], np.nan)
        
        # Converte colunas numéricas
        numeric_columns = [col for col in self.df.columns if col.startswith('VL_')]
        for col in numeric_columns:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
    
    def get_school_data(self, school_id: str) -> Optional[IDEBData]:
        """Retorna dados brutos de uma escola"""
        school = self.df[self.df['ID_ESCOLA'] == school_id]
        if school.empty:
            return None
        
        row = school.iloc[0].to_dict()
        return IDEBData(
            id_escola=row['ID_ESCOLA'],
            no_escola=row['NO_ESCOLA'],
            co_municipio=row['CO_MUNICIPIO'],
            no_municipio=row['NO_MUNICIPIO'],
            rede=SchoolType(row['REDE']),
            vl_indicador_rend_2017=row.get('VL_INDICADOR_REND_2017'),
            vl_indicador_rend_2019=row.get('VL_INDICADOR_REND_2019'),
            vl_indicador_rend_2021=row.get('VL_INDICADOR_REND_2021'),
            vl_nota_matematica_2017=row.get('VL_NOTA_MATEMATICA_2017'),
            vl_nota_matematica_2019=row.get('VL_NOTA_MATEMATICA_2019'),
            vl_nota_matematica_2021=row.get('VL_NOTA_MATEMATICA_2021'),
            vl_nota_portugues_2017=row.get('VL_NOTA_PORTUGUES_2017'),
            vl_nota_portugues_2019=row.get('VL_NOTA_PORTUGUES_2019'),
            vl_nota_portugues_2021=row.get('VL_NOTA_PORTUGUES_2021'),
            vl_nota_media_2017=row.get('VL_NOTA_MEDIA_2017'),
            vl_nota_media_2019=row.get('VL_NOTA_MEDIA_2019'),
            vl_nota_media_2021=row.get('VL_NOTA_MEDIA_2021'),
            vl_observado_2017=row.get('VL_OBSERVADO_2017'),
            vl_observado_2019=row.get('VL_OBSERVADO_2019'),
            vl_observado_2021=row.get('VL_OBSERVADO_2021'),
            vl_projecao_2017=row.get('VL_PROJECAO_2017'),
            vl_projecao_2019=row.get('VL_PROJECAO_2019'),
            vl_projecao_2021=row.get('VL_PROJECAO_2021'),
            resultado_2017=row.get('RESULTADO_2017'),
            resultado_2019=row.get('RESULTADO_2019'),
            resultado_2021=row.get('RESULTADO_2021')
        )
    
    def _calculate_trend(self, values: List[Optional[float]]) -> str:
        """Calcula a tendência baseado em valores temporais"""
        valid_values = [v for v in values if v is not None]
        if len(valid_values) < 2:
            return "stable"
        
        # Calcula diferença entre último e primeiro valor válido
        diff = valid_values[-1] - valid_values[0]
        
        if diff > 0.1:  # Threshold para melhoria
            return "improving"
        elif diff < -0.1:
            return "declining"
        return "stable"
    
    def _normalize_score(self, value: Optional[float], min_val: float, max_val: float) -> float:
        """Normaliza um valor para escala 0-100"""
        if value is None:
            return 0.0
        return ((value - min_val) / (max_val - min_val)) * 100
    
    def _calculate_axis_performance(self, data: IDEBData, axis: PerformanceAxis) -> AxisPerformance:
        """Calcula performance de um eixo específico"""
        if axis == PerformanceAxis.RENDIMENTO:
            scores = [data.vl_indicador_rend_2017, data.vl_indicador_rend_2019, data.vl_indicador_rend_2021]
            min_val, max_val = 0, 1
        elif axis == PerformanceAxis.MATEMATICA:
            scores = [data.vl_nota_matematica_2017, data.vl_nota_matematica_2019, data.vl_nota_matematica_2021]
            min_val, max_val = 150, 300
        elif axis == PerformanceAxis.PORTUGUES:
            scores = [data.vl_nota_portugues_2017, data.vl_nota_portugues_2019, data.vl_nota_portugues_2021]
            min_val, max_val = 150, 300
        else:  # IDEB_GERAL
            scores = [data.vl_observado_2017, data.vl_observado_2019, data.vl_observado_2021]
            min_val, max_val = 0, 10
        
        trend = self._calculate_trend(scores)
        latest_score = next((s for s in reversed(scores) if s is not None), None)
        normalized = self._normalize_score(latest_score, min_val, max_val)
        
        return AxisPerformance(
            axis=axis,
            score_2017=scores[0],
            score_2019=scores[1],
            score_2021=scores[2],
            trend=trend,
            normalized_score=normalized
        )
    
    def _generate_upgrade_points(self, data: IDEBData, axes: List[AxisPerformance]) -> List[UpgradePoint]:
        """Gera pontos de melhoria priorizados"""
        upgrade_points = []
        
        # Analisa cada eixo
        for axis_perf in axes:
            if axis_perf.normalized_score < 50:  # Abaixo de 50% = crítico
                priority = UpgradePriority.CRITICO
                impact = "High"
            elif axis_perf.normalized_score < 70:
                priority = UpgradePriority.ALTO
                impact = "Medium"
            else:
                continue  # Não precisa de melhoria urgente
            
            # Descrições específicas por eixo
            descriptions = {
                PerformanceAxis.RENDIMENTO: f"Taxa de aprovação em {axis_perf.normalized_score:.1f}%. Implementar programas de reforço escolar e acompanhamento individualizado.",
                PerformanceAxis.MATEMATICA: f"Desempenho em Matemática em {axis_perf.normalized_score:.1f}%. Capacitar professores em metodologias ativas e disponibilizar materiais didáticos.",
                PerformanceAxis.PORTUGUES: f"Desempenho em Português em {axis_perf.normalized_score:.1f}%. Fortalecer programa de leitura e interpretação de textos.",
                PerformanceAxis.IDEB_GERAL: f"IDEB geral em {axis_perf.normalized_score:.1f}%. Plano de melhoria integral necessário."
            }
            
            upgrade_points.append(UpgradePoint(
                area=axis_perf.axis.value,
                description=descriptions[axis_perf.axis],
                priority=priority,
                current_score=axis_perf.score_2021,
                target_score=(axis_perf.score_2021 or 0) * 1.2,  # Meta: 20% de melhoria
                impact_estimate=impact
            ))
        
        # Verifica meta IDEB
        if data.vl_observado_2021 and data.vl_projecao_2021:
            if data.vl_observado_2021 < data.vl_projecao_2021:
                diff = data.vl_projecao_2021 - data.vl_observado_2021
                upgrade_points.append(UpgradePoint(
                    area="Meta IDEB",
                    description=f"Escola não atingiu meta IDEB 2021. Déficit de {diff:.2f} pontos. Revisar estratégias pedagógicas e gestão escolar.",
                    priority=UpgradePriority.ALTO,
                    current_score=data.vl_observado_2021,
                    target_score=data.vl_projecao_2021,
                    impact_estimate="High"
                ))
        
        # Ordena por prioridade
        priority_order = {
            UpgradePriority.CRITICO: 0,
            UpgradePriority.ALTO: 1,
            UpgradePriority.MEDIO: 2,
            UpgradePriority.BAIXO: 3
        }
        upgrade_points.sort(key=lambda x: priority_order[x.priority])
        
        return upgrade_points[:5]  # Top 5 prioridades
    
    def _classify_overall_performance(self, score: float) -> str:
        """Classifica performance geral"""
        if score >= 80:
            return "Excelente"
        elif score >= 65:
            return "Bom"
        elif score >= 50:
            return "Regular"
        else:
            return "Precisa Melhorar"
    
    def get_school_performance_report(self, school_id: str) -> Optional[SchoolPerformanceReport]:
        """Gera relatório completo de performance de uma escola"""
        data = self.get_school_data(school_id)
        if not data:
            return None
        
        # Calcula performance por eixo
        axes_performance = [
            self._calculate_axis_performance(data, PerformanceAxis.RENDIMENTO),
            self._calculate_axis_performance(data, PerformanceAxis.MATEMATICA),
            self._calculate_axis_performance(data, PerformanceAxis.PORTUGUES),
            self._calculate_axis_performance(data, PerformanceAxis.IDEB_GERAL)
        ]
        
        # IDEB Index
        ideb_values = [data.vl_observado_2017, data.vl_observado_2019, data.vl_observado_2021]
        ideb_index = IDEBPerformanceIndex(
            ideb_2017=data.vl_observado_2017,
            ideb_2019=data.vl_observado_2019,
            ideb_2021=data.vl_observado_2021,
            meta_2021=data.vl_projecao_2021,
            atingiu_meta=data.vl_observado_2021 >= data.vl_projecao_2021 if data.vl_observado_2021 and data.vl_projecao_2021 else None,
            distancia_meta=data.vl_observado_2021 - data.vl_projecao_2021 if data.vl_observado_2021 and data.vl_projecao_2021 else None,
            trend=self._calculate_trend(ideb_values)
        )
        
        # Pontos de melhoria
        upgrade_points = self._generate_upgrade_points(data, axes_performance)
        
        # Score geral (média ponderada dos eixos)
        overall_score = sum(ax.normalized_score for ax in axes_performance) / len(axes_performance)
        
        return SchoolPerformanceReport(
            school_id=data.id_escola,
            school_name=data.no_escola,
            municipality=data.no_municipio,
            network_type=data.rede,
            axes_performance=axes_performance,
            ideb_index=ideb_index,
            upgrade_points=upgrade_points,
            overall_score=overall_score,
            overall_classification=self._classify_overall_performance(overall_score)
        )
    
    def get_municipality_performance_report(self, municipality_code: str) -> Optional[MunicipalityPerformanceReport]:
        """Gera relatório consolidado de um município"""
        mun_schools = self.df[self.df['CO_MUNICIPIO'] == municipality_code]
        
        if mun_schools.empty:
            return None
        
        municipality_name = mun_schools.iloc[0]['NO_MUNICIPIO']
        total_schools = len(mun_schools)
        
        # Médias municipais
        avg_ideb_2021 = mun_schools['VL_OBSERVADO_2021'].mean()
        avg_matematica_2021 = mun_schools['VL_NOTA_MATEMATICA_2021'].mean()
        avg_portugues_2021 = mun_schools['VL_NOTA_PORTUGUES_2021'].mean()
        avg_rendimento_2021 = mun_schools['VL_INDICADOR_REND_2021'].mean()
        
        # Distribuição de classificações
        schools_by_classification = {"Excelente": 0, "Bom": 0, "Regular": 0, "Precisa Melhorar": 0}
        municipal_priorities_list = []
        
        for _, school_row in mun_schools.iterrows():
            school_data = self.get_school_data(school_row['ID_ESCOLA'])
            if school_data:
                report = self.get_school_performance_report(school_row['ID_ESCOLA'])
                if report:
                    schools_by_classification[report.overall_classification] += 1
                    municipal_priorities_list.extend(report.upgrade_points)
        
        # Consolida prioridades municipais (top 10)
        priority_counts = {}
        for up in municipal_priorities_list:
            key = up.area
            if key not in priority_counts:
                priority_counts[key] = {"count": 0, "example": up}
            priority_counts[key]["count"] += 1
        
        municipal_priorities = [
            UpgradePoint(
                area=data["example"].area,
                description=f"{data['count']} escolas precisam melhorar em {data['example'].area}. {data['example'].description}",
                priority=data["example"].priority,
                current_score=None,
                target_score=None,
                impact_estimate="High" if data["count"] > total_schools * 0.5 else "Medium"
            )
            for _, data in sorted(priority_counts.items(), key=lambda x: x[1]["count"], reverse=True)[:10]
        ]
        
        # Score municipal
        municipal_score = self._normalize_score(avg_ideb_2021, 0, 10) if not pd.isna(avg_ideb_2021) else 0.0
        
        return MunicipalityPerformanceReport(
            municipality_id=municipality_code,
            municipality_name=municipality_name,
            total_schools=total_schools,
            avg_ideb_2021=avg_ideb_2021 if not pd.isna(avg_ideb_2021) else None,
            avg_matematica_2021=avg_matematica_2021 if not pd.isna(avg_matematica_2021) else None,
            avg_portugues_2021=avg_portugues_2021 if not pd.isna(avg_portugues_2021) else None,
            avg_rendimento_2021=avg_rendimento_2021 if not pd.isna(avg_rendimento_2021) else None,
            schools_by_classification=schools_by_classification,
            municipal_priorities=municipal_priorities,
            municipal_score=municipal_score
        )
    
    def list_schools_by_municipality(self, municipality_code: str) -> List[Dict]:
        """Lista todas as escolas de um município"""
        schools = self.df[self.df['CO_MUNICIPIO'] == municipality_code]
        return [
            {
                "id_escola": row['ID_ESCOLA'],
                "no_escola": row['NO_ESCOLA'],
                "rede": row['REDE'],
                "ideb_2021": row['VL_OBSERVADO_2021']
            }
            for _, row in schools.iterrows()
        ]