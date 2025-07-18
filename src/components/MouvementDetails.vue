<template>
  <div class="mouvement-details">
    <div class="details-header">
      <h3 class="details-title">Détails du Mouvement #{{ mouvement?.id }}</h3>
      <span class="movement-type-badge" :class="getTypeClass(mouvement?.type)">
        <component :is="getTypeIcon(mouvement?.type)" class="w-4 h-4" />
        {{ getTypeLabel(mouvement?.type) }}
      </span>
    </div>

    <div class="details-content">
      <!-- Informations générales -->
      <div class="detail-section">
        <h4 class="section-title">Informations Générales</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Date et heure :</span>
            <span class="info-value">{{ formatDateTime(mouvement?.dateMouvement) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Quantité :</span>
            <span class="info-value quantity" :class="getQuantityClass(mouvement?.type)">
              {{ formatQuantity(mouvement?.quantite, mouvement?.type) }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Utilisateur :</span>
            <span class="info-value">{{ mouvement?.utilisateur?.nom || 'Inconnu' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email :</span>
            <span class="info-value">{{ mouvement?.utilisateur?.email || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Raison et ajustement -->
      <div v-if="mouvement?.raison || mouvement?.typeAjustement" class="detail-section">
        <h4 class="section-title">Détails Spécifiques</h4>
        <div class="info-grid">
          <div v-if="mouvement?.raison" class="info-item full-width">
            <span class="info-label">Raison :</span>
            <span class="info-value">{{ mouvement.raison }}</span>
          </div>
          <div v-if="mouvement?.typeAjustement" class="info-item">
            <span class="info-label">Type d'ajustement :</span>
            <span class="info-value adjustment-type">{{ mouvement.typeAjustement }}</span>
          </div>
        </div>
      </div>

      <!-- Lignes d'opération associées -->
      <div v-if="mouvement?.ligneOperation && mouvement.ligneOperation.length > 0" class="detail-section">
        <h4 class="section-title">Opérations Associées ({{ mouvement.ligneOperation.length }})</h4>
        <div class="operations-list">
          <div v-for="operation in mouvement.ligneOperation" :key="operation.id" class="operation-card">
            <div class="operation-header">
              <span class="operation-id">#{{ operation.id }}</span>
              <span class="operation-quantity">{{ operation.quantite }} unités</span>
            </div>
            <div class="operation-details">
              <div class="detail-item">
                <span class="detail-label">Lot :</span>
                <span class="detail-value">{{ operation.lot?.numeroLot || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Boisson :</span>
                <span class="detail-value">{{ operation.lot?.boisson?.nom || 'N/A' }}</span>
              </div>
              <div v-if="operation.lot?.quantiteActuelle !== undefined" class="detail-item">
                <span class="detail-label">Stock restant :</span>
                <span class="detail-value">{{ operation.lot.quantiteActuelle }} unités</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Impact sur le stock -->
      <div class="detail-section impact-section">
        <h4 class="section-title">Impact sur le Stock</h4>
        <div class="impact-summary">
          <div class="impact-item" :class="getImpactClass(mouvement?.type)">
            <component :is="getImpactIcon(mouvement?.type)" class="w-6 h-6" />
            <div class="impact-text">
              <span class="impact-title">{{ getImpactTitle(mouvement?.type) }}</span>
              <span class="impact-description">{{ getImpactDescription(mouvement?.type, mouvement?.quantite) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="details-actions">
      <button @click="$emit('close')" class="btn btn-primary">
        Fermer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDownIcon,
  ArrowUpIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  MinusIcon,
  ScaleIcon
} from '@heroicons/vue/24/outline'
import type { Mouvement } from '../features/inventaire/models/mouvement'

defineProps<{
  mouvement: Mouvement | null
}>()

defineEmits<{
  close: []
}>()

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatQuantity = (quantity?: number, type?: string) => {
  if (quantity === undefined) return '-'
  const sign = type === 'ENTREE' ? '+' : type === 'SORTIE' ? '-' : '±'
  return `${sign}${quantity}`
}

const getTypeClass = (type?: string) => {
  return {
    'type-entree': type === 'ENTREE',
    'type-sortie': type === 'SORTIE',
    'type-ajustement': type === 'AJUSTEMENT'
  }
}

const getTypeIcon = (type?: string) => {
  const icons: Record<string, any> = {
    'ENTREE': ArrowDownIcon,
    'SORTIE': ArrowUpIcon,
    'AJUSTEMENT': AdjustmentsHorizontalIcon
  }
  return icons[type || ''] || AdjustmentsHorizontalIcon
}

const getTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    'ENTREE': 'Entrée de Stock',
    'SORTIE': 'Sortie de Stock',
    'AJUSTEMENT': 'Ajustement'
  }
  return labels[type || ''] || 'Mouvement'
}

const getQuantityClass = (type?: string) => {
  return {
    'quantity-positive': type === 'ENTREE',
    'quantity-negative': type === 'SORTIE',
    'quantity-neutral': type === 'AJUSTEMENT'
  }
}

const getImpactClass = (type?: string) => {
  return {
    'impact-positive': type === 'ENTREE',
    'impact-negative': type === 'SORTIE',
    'impact-neutral': type === 'AJUSTEMENT'
  }
}

const getImpactIcon = (type?: string) => {
  const icons: Record<string, any> = {
    'ENTREE': PlusIcon,
    'SORTIE': MinusIcon,
    'AJUSTEMENT': ScaleIcon
  }
  return icons[type || ''] || ScaleIcon
}

const getImpactTitle = (type?: string) => {
  const titles: Record<string, string> = {
    'ENTREE': 'Stock Augmenté',
    'SORTIE': 'Stock Diminué',
    'AJUSTEMENT': 'Stock Ajusté'
  }
  return titles[type || ''] || 'Impact sur le Stock'
}

const getImpactDescription = (type?: string, quantity?: number) => {
  if (!quantity) return 'Aucune quantité spécifiée'

  const descriptions: Record<string, string> = {
    'ENTREE': `${quantity} unité(s) ajoutée(s) au stock`,
    'SORTIE': `${quantity} unité(s) retirée(s) du stock`,
    'AJUSTEMENT': `Quantité ajustée de ${quantity} unité(s)`
  }
  return descriptions[type || ''] || `${quantity} unité(s) traitée(s)`
}
</script>

<style scoped>
.mouvement-details {
  max-width: 600px;
  margin: 0 auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.details-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.movement-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.type-entree {
  background: #dcfce7;
  color: #166534;
}

.type-sortie {
  background: #fee2e2;
  color: #991b1b;
}

.type-ajustement {
  background: #fed7aa;
  color: #9a3412;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.impact-section {
  background: #f0f9ff;
  border-color: #0ea5e9;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.info-item.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-value {
  font-weight: 600;
  color: #1f2937;
}

.info-value.quantity {
  font-family: 'Monaco', 'Menlo', monospace;
}

.quantity-positive {
  color: #059669;
}

.quantity-negative {
  color: #dc2626;
}

.quantity-neutral {
  color: #d97706;
}

.adjustment-type {
  padding: 0.25rem 0.5rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.operations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.operation-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.operation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.operation-id {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  color: #6b7280;
}

.operation-quantity {
  font-weight: 600;
  color: #1f2937;
}

.operation-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-label {
  color: #6b7280;
}

.detail-value {
  color: #1f2937;
  font-weight: 500;
}

.impact-summary {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
}

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

.impact-text {
  display: flex;
  flex-direction: column;
}

.impact-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.impact-description {
  font-size: 0.875rem;
  opacity: 0.8;
}

.details-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:hover {
  background: #2563eb;
}

/* Responsive */
@media (max-width: 768px) {
  .details-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .operation-details {
    grid-template-columns: 1fr;
  }
}
</style>
