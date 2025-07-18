import type { Lot } from './lot';
import type { Utilisateur } from '../../utilisateurs/models/utilisateur';

export interface CreateLotRequest {
  lot: Lot;
  utilisateur: Utilisateur;
}

