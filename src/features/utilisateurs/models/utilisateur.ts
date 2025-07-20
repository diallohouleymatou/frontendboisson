import type {Role} from "./role.ts";

export interface Utilisateur {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    motDePasse?: string;
    isActive: boolean;
    isFirstLogin: boolean;
    createdAt?: string;
    updatedAt?: string;
}