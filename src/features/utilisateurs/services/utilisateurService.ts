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

  static async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/utilisateurs/login', loginRequest)
      const { token, utilisateur } = response.data
      if (!token || !utilisateur) {
        throw new Error('Réponse de connexion invalide')
      }
      // Store the token for future requests
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(utilisateur))
      // Set the default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Email ou mot de passe incorrect')
      }
      throw new Error('Erreur lors de la connexion: ' + (error.response?.data?.message || error.message))
    }
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  static async changePassword(passwordRequest: PasswordRequest): Promise<void> {
    try {
      const userId = this.getCurrentUser()?.id
      if (!userId) {
        throw new Error('Utilisateur non connecté')
      }
      await api.patch(`/utilisateurs/change-password?id=${userId}`, passwordRequest)
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Ancien mot de passe incorrect')
      }
      throw new Error('Erreur lors du changement de mot de passe: ' + (error.response?.data?.message || error.message))
    }
  }

  static getCurrentUser(): Utilisateur | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('token')
    const user = this.getCurrentUser()
    return !!token && !!user
  }

  static getToken(): string | null {
    return localStorage.getItem('token')
  }

  // Initialize the API with the stored token if it exists
  static initializeAuth() {
    const token = this.getToken()
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }
}
