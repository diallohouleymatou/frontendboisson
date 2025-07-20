import type { Utilisateur } from "../models/utilisateur";

export interface LoginResponse {
    utilisateur: Utilisateur;
    token: string;
}