import type {Role} from "./role.ts";

export interface Utilisateur{
    id: number;
    email: string;
    role: Role;
    motDePasse: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}