import type { CreateLotRequest } from '../models/createLotRequest';
import type { CreateMouvementSortieRequest } from '../models/createMouvementSortieRequest';
import type { CreateMouvementAjustementRequest } from '../models/createMouvementAjustementRequest';
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
    const response = await api.get('/inventaire/ligne-operations-all');
    console.log(response.data);
    return response.data;
  },
  async createMouvementSortie(request: CreateMouvementSortieRequest) {
    const response = await api.post('/inventaire/sortie', request);
    return response.data;
  },
  async createMouvementAjustement(request: CreateMouvementAjustementRequest) {
    const response = await api.post('/inventaire/ajustement', request);
    return response.data;
  },
  async createMouvementEntree(request: CreateLotRequest) {
    const response = await api.post('/inventaire/entree', request);
    return response.data;
  },
};
