import type {Boisson} from "../../boissons/models/boisson.ts";
import type {Fournisseur} from "../../fournisseur/models/fournisseur.ts";

export interface Lot{
    id?: number;
    fournisseur: Fournisseur;
    numeroLot: string;
    quantiteInitiale: number;
    quantiteActuelle: number;
    dateEntree: string;
    datePeremption: string;
    boisson: Boisson;
    vendable: boolean;
}