import { ApiService } from './api';

export class EquidarService extends ApiService {
  private readonly basePath = '/api';

  async getMunicipalities(){
    return this.get<{ id: number; name: string }[]>(`${this.basePath}/municipalities`);
  }
  
  async getScoreByMunicipality(municipalityId: number){
    return this.get<{ score: number; details: any }>(`${this.basePath}/municipalities/${municipalityId}/score`);
  }

  async getInsightsByMunicipality(municipalityId: number){
    return this.get<{ insights: string[] }>(`${this.basePath}/municipalities/${municipalityId}/insights`);
  }

  async getOverallRanking(){
    return this.get<{ municipalityId: number; score: number }[]>(`${this.basePath}/ranking`);
  }

  async getInsightsBySchool(schoolId: number){
    return this.get<{ insights: string[] }>(`${this.basePath}/schools/${schoolId}/insights`);
  }

  async getCareRankingByState(stateCode: string){
    return this.get<{ schoolId: number; careIndex: number }[]>(`${this.basePath}/states/${stateCode}/care-ranking`);
  }

  async getCareRankingByMunicipality(municipalityId: number){
    return this.get<{ schoolId: number; careIndex: number }[]>(`${this.basePath}/municipalities/${municipalityId}/care-ranking`);
  }

  async getCareRankingByParameters(params: { municipalityId?: number; regionType?: string; isUrban?: boolean }){
    const query = new URLSearchParams();
    if (params.municipalityId) query.append('municipalityId', params.municipalityId.toString());
    if (params.regionType) query.append('regionType', params.regionType);
    if (params.isUrban !== undefined) query.append('isUrban', params.isUrban.toString());
    return this.get<{ schoolId: number; careIndex: number }[]>(`${this.basePath}/care-ranking?${query.toString()}`);
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