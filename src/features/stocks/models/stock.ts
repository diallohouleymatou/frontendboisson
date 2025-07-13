import type {Boisson} from "../../boissons/models/boisson.ts";

export interface Stock{
    id?: number;
    boisson: Boisson;
    quantiteTotale: number;
    createdAt?: string;
    updatedAt?: string;
}