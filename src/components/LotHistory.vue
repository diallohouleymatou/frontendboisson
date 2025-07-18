<template>
  <div class="lot-history">
    <div class="history-header">
      <h3 class="history-title">Historique du Lot {{ lot?.numeroLot }}</h3>
      <div class="lot-summary">
        <span class="lot-info">{{ lot?.boisson?.nom }}</span>
        <span class="lot-stock" :class="getStockClass()">
          {{ lot?.quantiteActuelle }}/{{ lot?.quantiteInitiale }} unités
        </span>
      </div>
    </div>

    <div class="history-content">
      <!-- Informations du lot -->
      <div class="lot-details-card">
        <h4 class="card-title">Informations du Lot</h4>
        <div class="lot-details-grid">
          <div class="detail-item">
            <span class="detail-label">Numéro de lot :</span>
            <span class="detail-value">{{ lot?.numeroLot }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Boisson :</span>
            <span class="detail-value">{{ lot?.boisson?.nom }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Format :</span>
            <span class="detail-value">{{ lot?.boisson?.format }} {{ lot?.boisson?.volume }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Fournisseur :</span>
            <span class="detail-value">{{ lot?.fournisseur || 'Non renseigné' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date d'entrée :</span>
            <span class="detail-value">{{ formatDate(lot?.dateEntree) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date de péremption :</span>
            <span class="detail-value" :class="getExpirationClass()">
              {{ formatDate(lot?.datePeremption) }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Vendable :</span>
            <span class="detail-value" :class="lot?.vendable ? 'vendable-yes' : 'vendable-no'">
              {{ lot?.vendable ? 'Oui' : 'Non' }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Statut :</span>
            <span class="detail-value" :class="getStatusClass()">
              {{ getStatusText() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Timeline des mouvements -->
      <div class="movements-timeline">
        <h4 class="card-title">Historique des Mouvements</h4>

        <div v-if="isLoadingHistory" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Chargement de l'historique...</p>
        </div>

        <div v-else-if="lotMovements.length === 0" class="empty-history">
          <ClipboardDocumentListIcon class="w-12 h-12 text-gray-400" />
          <p>Aucun mouvement trouvé pour ce lot</p>
        </div>

        <div v-else class="timeline">
          <!-- Entrée initiale -->
          <div class="timeline-item creation">
            <div class="timeline-marker creation-marker">
              <PlusIcon class="w-4 h-4" />
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">Création du lot</span>
                <span class="timeline-date">{{ formatDateTime(lot?.dateEntree) }}</span>
              </div>
              <div class="timeline-details">
                <p class="timeline-description">
                  Lot créé avec {{ lot?.quantiteInitiale }} unités
                </p>
                <div class="timeline-impact creation-impact">
                  <span>Stock initial : {{ lot?.quantiteInitiale }} unités</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mouvements -->
          <div
            v-for="movement in lotMovements"
            :key="movement.id"
            class="timeline-item"
            :class="getMovementClass(movement.type)"
          >
            <div class="timeline-marker" :class="getMarkerClass(movement.type)">
              <component :is="getMovementIcon(movement.type)" class="w-4 h-4" />
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">{{ getMovementTitle(movement.type) }}</span>
                <span class="timeline-date">{{ formatDateTime(movement.dateMouvement) }}</span>
              </div>
              <div class="timeline-details">
                <p class="timeline-description">
                  {{ getMovementDescription(movement) }}
                </p>
                <div class="timeline-metadata">
                  <span class="metadata-item">
                    <UserIcon class="w-4 h-4" />
                    {{ movement.utilisateur?.nom || 'Utilisateur inconnu' }}
                  </span>
                  <span class="metadata-item">
                    <HashtagIcon class="w-4 h-4" />
                    Mouvement #{{ movement.id }}
                  </span>
                </div>
                <div v-if="movement.raison" class="timeline-reason">
                  <span class="reason-label">Raison :</span>
                  <span class="reason-text">{{ movement.raison }}</span>
                </div>
                <div class="timeline-impact" :class="getImpactClass(movement.type)">
                  <span>{{ getImpactText(movement) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- État actuel -->
          <div class="timeline-item current">
            <div class="timeline-marker current-marker">
              <CheckCircleIcon class="w-4 h-4" />
            </div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-title">État actuel</span>
                <span class="timeline-date">{{ formatDateTime(new Date().toISOString()) }}</span>
              </div>
              <div class="timeline-details">
                <p class="timeline-description">
                  Stock disponible : {{ lot?.quantiteActuelle }} unités
                </p>
                <div class="timeline-impact current-impact">
                  <span>
                    {{ getUtilizationRate() }}% utilisé
                    ({{ (lot?.quantiteInitiale || 0) - (lot?.quantiteActuelle || 0) }} unités consommées)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="history-actions">
      <button @click="refreshHistory" class="btn btn-secondary" :disabled="isLoadingHistory">
        <ArrowPathIcon class="w-4 h-4" />
        Actualiser
      </button>
      <button @click="$emit('close')" class="btn btn-primary">
        Fermer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  UserIcon,
  HashtagIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/vue/24/outline'
import type { Lot } from '../features/inventaire/models/lot'
import type { Mouvement } from '../features/inventaire/models/mouvement'
import { inventaireService } from '../features/inventaire/services/inventaireService'

const props = defineProps<{
  lot: Lot | null
}>()

defineEmits<{
  close: []
}>()

const lotMovements = ref<Mouvement[]>([])
const isLoadingHistory = ref(false)

onMounted(() => {
  loadLotHistory()
})

const loadLotHistory = async () => {
  if (!props.lot?.id) return

  try {
    isLoadingHistory.value = true
    // Simuler le chargement de l'historique des mouvements pour ce lot
    // En réalité, vous devriez avoir une méthode API pour récupérer les mouvements d'un lot spécifique
    const allMovements = await inventaireService.getAllMouvements()
    lotMovements.value = allMovements.filter(movement =>
      movement.ligneOperation?.some(ligne => ligne.lot?.id === props.lot?.id)
    ).sort((a, b) => new Date(a.dateMouvement).getTime() - new Date(b.dateMouvement).getTime())
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
  } finally {
    isLoadingHistory.value = false
  }
}

const refreshHistory = () => {
  loadLotHistory()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStockClass = () => {
  if (!props.lot) return ''
  const percentage = (props.lot.quantiteActuelle / props.lot.quantiteInitiale) * 100
  if (percentage === 0) return 'stock-empty'
  if (percentage <= 25) return 'stock-critical'
  if (percentage <= 50) return 'stock-low'
  return 'stock-normal'
}

const getExpirationClass = () => {
  if (!props.lot?.datePeremption) return ''

  const expirationDate = new Date(props.lot.datePeremption)
  const now = new Date()
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) return 'expired'
  if (daysUntilExpiration <= 7) return 'warning'
  if (daysUntilExpiration <= 30) return 'caution'
  return 'normal'
}

const getStatusClass = () => {
  return getStockClass()
}

const getStatusText = () => {
  if (!props.lot) return 'Inconnu'

  const percentage = (props.lot.quantiteActuelle / props.lot.quantiteInitiale) * 100
  const isExpired = props.lot.datePeremption && new Date(props.lot.datePeremption) < new Date()

  if (isExpired) return 'Périmé'
  if (percentage === 0) return 'Stock épuisé'
  if (percentage <= 25) return 'Stock critique'
  if (percentage <= 50) return 'Stock faible'
  return 'Stock normal'
}

const getUtilizationRate = () => {
  if (!props.lot || props.lot.quantiteInitiale === 0) return 0
  return Math.round(((props.lot.quantiteInitiale - props.lot.quantiteActuelle) / props.lot.quantiteInitiale) * 100)
}

const getMovementClass = (type: string) => {
  return {
    'entree': type === 'ENTREE',
    'sortie': type === 'SORTIE',
    'ajustement': type === 'AJUSTEMENT'
  }
}

const getMarkerClass = (type: string) => {
  return {
    'entree-marker': type === 'ENTREE',
    'sortie-marker': type === 'SORTIE',
    'ajustement-marker': type === 'AJUSTEMENT'
  }
}

const getMovementIcon = (type: string) => {
  const icons: Record<string, any> = {
    'ENTREE': ArrowDownIcon,
    'SORTIE': ArrowUpIcon,
    'AJUSTEMENT': AdjustmentsHorizontalIcon
  }
  return icons[type] || AdjustmentsHorizontalIcon
}

const getMovementTitle = (type: string) => {
  const titles: Record<string, string> = {
    'ENTREE': 'Entrée de stock',
    'SORTIE': 'Sortie de stock',
    'AJUSTEMENT': 'Ajustement'
  }
  return titles[type] || 'Mouvement'
}

const getMovementDescription = (movement: Mouvement) => {
  const quantity = movement.quantite
  const type = movement.type

  if (type === 'ENTREE') {
    return `Ajout de ${quantity} unité(s) au stock`
  } else if (type === 'SORTIE') {
    return `Retrait de ${quantity} unité(s) du stock`
  } else if (type === 'AJUSTEMENT') {
    return `Ajustement de ${quantity} unité(s)`
  }

  return `Traitement de ${quantity} unité(s)`
}

const getImpactClass = (type: string) => {
  return {
    'impact-positive': type === 'ENTREE',
    'impact-negative': type === 'SORTIE',
    'impact-neutral': type === 'AJUSTEMENT'
  }
}

const getImpactText = (movement: Mouvement) => {
  const quantity = movement.quantite
  const type = movement.type

  if (type === 'ENTREE') {
    return `+${quantity} unité(s) ajoutée(s)`
  } else if (type === 'SORTIE') {
    return `-${quantity} unité(s) retirée(s)`
  } else if (type === 'AJUSTEMENT') {
    return `±${quantity} unité(s) ajustée(s)`
  }

  return `${quantity} unité(s) traitée(s)`
}
</script>

<style scoped>
.lot-history {
  max-width: 800px;
  margin: 0 auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.history-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.lot-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.lot-info {
  font-weight: 500;
  color: #6b7280;
}

.lot-stock {
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
}

.stock-normal {
  color: #059669;
}

.stock-low {
  color: #d97706;
}

.stock-critical {
  color: #ea580c;
}

.stock-empty {
  color: #dc2626;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.lot-details-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.lot-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-value {
  font-weight: 600;
  color: #1f2937;
}

.expired {
  color: #dc2626;
}

.warning {
  color: #ea580c;
}

.caution {
  color: #d97706;
}

.normal {
  color: #059669;
}

.vendable-yes {
  color: #059669;
}

.vendable-no {
  color: #dc2626;
}

.movements-timeline {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 1rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  z-index: 1;
}

.creation-marker {
  background: #dcfce7;
  color: #166534;
}

.entree-marker {
  background: #dcfce7;
  color: #166534;
}

.sortie-marker {
  background: #fee2e2;
  color: #991b1b;
}

.ajustement-marker {
  background: #fed7aa;
  color: #9a3412;
}

.current-marker {
  background: #dbeafe;
  color: #1d4ed8;
}

.timeline-content {
  padding: 1.5rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.timeline-title {
  font-weight: 600;
  color: #1f2937;
}

.timeline-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.timeline-description {
  color: #374151;
  margin-bottom: 1rem;
}

.timeline-metadata {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.timeline-reason {
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.375rem;
}

.reason-label {
  font-weight: 500;
  color: #374151;
  margin-right: 0.5rem;
}

.reason-text {
  color: #6b7280;
}

.timeline-impact {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.creation-impact,
.impact-positive {
  background: #dcfce7;
  color: #166534;
}

.impact-negative {
  background: #fee2e2;
  color: #991b1b;
}

.impact-neutral {
  background: #fed7aa;
  color: #9a3412;
}

.current-impact {
  background: #dbeafe;
  color: #1d4ed8;
}

.history-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .lot-summary {
    align-items: flex-start;
  }

  .lot-details-grid {
    grid-template-columns: 1fr;
  }

  .timeline {
    padding-left: 1.5rem;
  }

  .timeline-marker {
    left: -1.5rem;
  }

  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .timeline-metadata {
    flex-direction: column;
    gap: 0.5rem;
  }

  .history-actions {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
