import { api } from '../../../api/api'
import type { Utilisateur } from '../models/utilisateur'

export class UtilisateurService {
  static async getAllUtilisateurs(): Promise<Utilisateur[]> {
    try {
      const response = await api.get('/utilisateurs')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      throw error
    }
  }

  static async createUtilisateur(utilisateur: Partial<Utilisateur>): Promise<Utilisateur> {
    try {
      const response = await api.post('/utilisateurs/register', utilisateur)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      throw error
    }
  }

  static async updateUtilisateur(id: number, utilisateur: Partial<Utilisateur>): Promise<Utilisateur> {
    try {
      const response = await api.put(`/utilisateurs/${id}`, utilisateur)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      throw error
    }
  }

  static async deleteUtilisateur(id: number): Promise<void> {
    try {
      await api.delete(`/utilisateurs/${id}`)
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
      throw error
    }
  }

  static async changePassword(id: number, passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await api.put(`/utilisateurs/${id}/password`, passwordData)
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error)
      throw error
    }
  }
}

