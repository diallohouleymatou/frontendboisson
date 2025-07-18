import type { CreateLotRequest } from '../models/createLotRequest';
import type { LigneOperation } from '../models/ligneOperation';
import type { Lot } from '../models/lot';
import { api } from '../../../api/api';

export const inventaireService = {
  async createLot(request: CreateLotRequest): Promise<LigneOperation> {
    const response = await api.post('/inventaire/entree', request);
    return response.data;
  },
  async getAllLots(): Promise<Lot[]> {
    const response = await api.get('/inventaire/lots');
    return response.data;
  },
  async getAllMouvements() {
    const response = await api.get('/inventaire/mouvements');
    console.log(response.data);
    return response.data;
  },
  async getAllLigneOperations() {
    const response = await api.get('/inventaire/ligne-operations');
    console.log(response.data);
    return response.data;
  },
  async createMouvementSortie(request: any) {
    const response = await api.post('/inventaire/sortie', request);
    return response.data;
  },
  async createMouvementAjustement(request: any) {
    const response = await api.post('/inventaire/ajustement', request);
    return response.data;
  },
  async createMouvementEntree(request: any) {
    const response = await api.post('/inventaire/entree', request);
    return response.data;
  },
};
