import type {Boisson} from "../../boissons/models/boisson.ts";
import type {Lot} from "../../lots/models/lot.ts";
import type {MouvementLot} from "./mouvementLot.ts";
import type {TypeAjustement} from "./typeAjustement.ts";
import type {TypeMouvement} from "./typeMouvement.ts";
import type {Utilisateur} from "../../utilisateurs/models/utilisateur.ts";

export interface Mouvement{
    id?: number;
    type: TypeMouvement;
    dateMouvement: string; // ou Date
    quantite: number;
    boissonId: number;
    boisson?: Boisson;
    boissonNom?: string;

    lotId: number;
    lotNumero?: string;
    lot?: Lot;

    utilisateurId: number;
    utilisateur?: Utilisateur;
    utilisateurEmail?: string;

    typeAjustement?: TypeAjustement;
    raison?: string;

    mouvementLots?: MouvementLot[];

}