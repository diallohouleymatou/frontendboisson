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

