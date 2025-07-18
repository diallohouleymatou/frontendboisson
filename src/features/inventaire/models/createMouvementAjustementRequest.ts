import type { Utilisateur } from '../../utilisateurs/models/utilisateur'

export interface CreateMouvementAjustementRequest {
  lotId: number
  delta: number
  raison: string
  utilisateur: Utilisateur
}
