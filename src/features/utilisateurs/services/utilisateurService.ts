import { api } from '../../../api/api'
import type { Utilisateur } from '../models/utilisateur'
import type { LoginRequest } from '../requests/loginRequest'
import type { LoginResponse } from '../requests/loginResponse'
import type { PasswordRequest } from '../requests/passwordRequest'

export class UtilisateurService {
  static async getAllUtilisateurs(): Promise<Utilisateur[]> {
    try {
      const response = await api.get('/utilisateurs')
      return response.data
    } catch (error: any) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs')
    }
  }

  static async createUtilisateur(utilisateur: Partial<Utilisateur>): Promise<Utilisateur> {
    try {
      if (!utilisateur.email || !utilisateur.firstName || !utilisateur.lastName || !utilisateur.role) {
        throw new Error('Tous les champs obligatoires doivent être remplis')
      }

      const response = await api.post('/utilisateurs/register', utilisateur)
      return response.data
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur')
    }
  }

  static async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
      if (!loginRequest.email || !loginRequest.motDePasse) {
        throw new Error('Email et mot de passe sont requis')
      }

      const response = await api.post<LoginResponse>('/utilisateurs/login', loginRequest)
      const { token, utilisateur } = response.data
      if (!token || !utilisateur) {
        throw new Error('Réponse de connexion invalide')
      }

      localStorage.setItem('token', token)
      localStorage.setItem('isFirstLogin', JSON.stringify(utilisateur.isFirstLogin))
      localStorage.setItem('user', JSON.stringify(utilisateur))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Email ou mot de passe incorrect')
      }
      if (error.response?.status === 403) {
        throw new Error('Votre compte est désactivé')
      }
      throw new Error(error.response?.data?.message || 'Erreur lors de la connexion')
    }
  }

  static async logout(): Promise<void> {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  static async changePassword(id: number, passwordRequest: PasswordRequest): Promise<void> {
    try {
      console.log('[UtilisateurService] changePassword called', { id, passwordRequest })
      if (!id) {
        throw new Error('Utilisateur non connecté')
      }
      if (!passwordRequest.ancienMotDePasse || !passwordRequest.nouveauMotDePasse) {
        throw new Error('L\'ancien et le nouveau mot de passe sont requis')
      }
      await api.patch(`/utilisateurs/change-password?id=${id}`, passwordRequest)
      console.log('[UtilisateurService] api.patch envoyé')
      const user = this.getCurrentUser()
      if (user && user.isFirstLogin) {
        user.isFirstLogin = false
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch (error: any) {
      console.log('[UtilisateurService] Erreur dans changePassword', error)
      if (error.response?.status === 400) {
        throw new Error('Ancien mot de passe incorrect')
      }
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe')
    }
  }

  static async updateStatus(id: number, isActive: boolean): Promise<Utilisateur> {
    try {
      const response = await api.patch(`/utilisateurs/${id}/status`, { isActive })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut')
    }
  }

  static getCurrentUser(): Utilisateur | null {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      return null
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('token')
    const user = this.getCurrentUser()
    return !!token && !!user
  }

  static getToken(): string | null {
    return localStorage.getItem('token')
  }

  static initializeAuth() {
    try {
      const token = this.getToken()
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
    }
  }
}
