import type {Mouvement} from "./mouvement.ts";
import type {Lot} from "./lot.ts";
export interface LigneOperation {
  id?: number;
  mouvement?: Mouvement;
  lot?: Lot;
  quantite: number;
}

