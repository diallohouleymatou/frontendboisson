import type { Utilisateur } from '../../utilisateurs/models/utilisateur'

export interface CreateMouvementSortieRequest {
  boissonId: number
  quantiteDemandee: number
  utilisateur: Utilisateur
}
