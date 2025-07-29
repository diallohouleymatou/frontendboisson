import type { Fournisseur } from '../models/fournisseur';
import { api } from '../../../api/api';

export class FournisseurService {
  private static readonly base_Url = '/fournisseurs';

  static async getAllFournisseurs(): Promise<Fournisseur[]> {
    const response = await api.get<Fournisseur[]>(this.base_Url);
    return response.data;
  }

  static async addFournisseur(fournisseur: Fournisseur) {
    const response = await api.post<Fournisseur>(this.base_Url, fournisseur);
    return response.data;
  }

  static async updateFournisseur(fournisseur: Fournisseur, id: number) {
    const response = await api.put<Fournisseur>(`${this.base_Url}/${id}`, fournisseur);
    return response.data;
  }

  static async getFournisseurById(id: number) {
    const response = await api.get<Fournisseur>(`${this.base_Url}/${id}`);
    return response.data;
  }
}

