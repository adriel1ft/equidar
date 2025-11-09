import { ApiService } from './api';

export class EquidarService extends ApiService {
  constructor() {
    // Obtém a URL base das variáveis de ambiente
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    super(baseURL);
  }

  async getMunicipalities(){
    return this.get<{ id: number; name: string }[]>(`/municipalities`);
  }
  
  async getScoreByMunicipality(municipalityId: number){
    return this.get<{ score: number; details: any }>(`/municipalities/${municipalityId}/score`);
  }

  async getInsightsByMunicipality(municipalityId: number){
    return this.get<{ insights: string[] }>(`/municipalities/${municipalityId}/insights`);
  }

  async getOverallRanking(){
    return this.get<{ municipalityId: number; score: number }[]>(`/ranking`);
  }

  async getInsightsBySchool(schoolId: number){
    return this.get<{ insights: string[] }>(`/schools/${schoolId}/insights`);
  }

  async getCareRankingByState(stateCode: string){
    return this.get<{ schoolId: number; careIndex: number }[]>(`/states/${stateCode}/care-ranking`);
  }

  async getCareRanking(){
    return this.get<{ schoolId: number; careIndex: number }[]>(`/municipalities/ranking`);
  }

  async getCareRankingByMunicipality(municipalityId: number){
    return this.get<{ schoolId: number; careIndex: number }[]>(`/municipalities/${municipalityId}/care-ranking`);
  }

  async getCareRankingByParameters(params: { municipalityId?: number; regionType?: string; isUrban?: boolean }){
    const query = new URLSearchParams();
    if (params.municipalityId) query.append('municipalityId', params.municipalityId.toString());
    if (params.regionType) query.append('regionType', params.regionType);
    if (params.isUrban !== undefined) query.append('isUrban', params.isUrban.toString());
    return this.get<{ schoolId: number; careIndex: number }[]>(`/care-ranking?${query.toString()}`);
  }

  async getSchoolAdditionalInfo(schoolId: string) {
    return this.get<any>(`/schools/${schoolId}/additional-info`);
  }

  async generateSchoolReport(schoolId: string) {
    return this.get<{ reportUrl: string }>(`/schools/${schoolId}/report`);
  }
  
  async getMunicipalityRankings() {
    return this.get<Array<{
      municipality_id: string,
      score: number,
      breakdown: {
        internet: number,
        access: number,
        school: number,
        equity: number
      }
    }>>('/municipalities/ranking');
  }

  private handleError(error: any): Error {
    if (error.response) {
      return new Error(`API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    }
    return new Error(`Network Error: ${error.message}`);
  }

  private log(message: string) {
    console.log(`[EquidarService] ${message}`);
  }
}