import type {Boisson} from "../../boissons/models/boisson.ts";

export interface Lot{
    id?: number;
    numeroLot: string;
    quantiteInitiale: number;
    quantiteActuelle: number;
    dateEntree: string;
    datePeremption: string;
    boisson: Boisson;
    vendable: boolean;
}