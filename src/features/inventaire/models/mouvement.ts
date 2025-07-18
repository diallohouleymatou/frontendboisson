import type {Utilisateur} from "../../utilisateurs/models/utilisateur.ts";
import type {LigneOperation} from "./ligneOperation.ts";

export interface Mouvement {
  id?: number;
  type: string; // TypeMouvement
  dateMouvement: string;
  quantite: number;
  utilisateur?: Utilisateur;
  ligneOperation?: LigneOperation[];
  typeAjustement?: string; // TypeAjustement
  raison?: string;
}

