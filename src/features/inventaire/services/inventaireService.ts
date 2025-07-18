import type { CreateLotRequest } from '../models/createLotRequest';
import type { LigneOperation } from '../models/ligneOperation';
import { api } from '../../../api/api';

export const inventaireService = {
  async createLot(request: CreateLotRequest): Promise<LigneOperation> {
    const response = await api.post('/inventaire/entree', request);
    return response.data;
  },
};

