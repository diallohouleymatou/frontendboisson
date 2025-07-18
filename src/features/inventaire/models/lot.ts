
import type {Boisson} from "../../boissons/models/boisson.ts";
import type {Mouvement} from "./mouvement.ts";


export interface Lot {
  id?: number;
  numeroLot: string;
  quantiteInitiale: number;
  quantiteActuelle: number;
  mouvementEntree?: Mouvement;
  dateEntree: string;
  datePeremption: string;
  boisson?: Boisson;
  vendable: boolean;
  fournisseur?: string;
}

