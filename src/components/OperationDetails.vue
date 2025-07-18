<template>
  <div class="operation-details">
    <div class="details-header">
      <h3 class="details-title">Détails de l'Opération #{{ operation?.id }}</h3>
      <span class="operation-status-badge" :class="getStatusClass()">
        {{ getStatusText() }}
      </span>
    </div>

    <div class="details-content">
      <!-- Informations de l'opération -->
      <div class="detail-section">
        <h4 class="section-title">Informations de l'Opération</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">ID Opération :</span>
            <span class="info-value operation-id">#{{ operation?.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Quantité traitée :</span>
            <span class="info-value quantity" :class="getQuantityClass()">
              {{ formatQuantity() }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Date opération :</span>
            <span class="info-value">{{ formatDateTime(operation?.mouvement?.dateMouvement) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Type mouvement :</span>
            <span class="info-value movement-type" :class="getTypeClass()">
              <component :is="getTypeIcon()" class="w-4 h-4" />
              {{ getTypeLabel() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Informations du lot -->
      <div v-if="operation?.lot" class="detail-section lot-section">
        <h4 class="section-title">Lot Concerné</h4>
        <div class="lot-card">
          <div class="lot-header">
            <span class="lot-number">{{ operation.lot.numeroLot }}</span>
            <span class="lot-status" :class="getLotStatusClass()">
              {{ getLotStatusText() }}
            </span>
          </div>
          <div class="lot-details">
            <div class="lot-info-grid">
              <div class="lot-info-item">
                <span class="lot-label">Boisson :</span>
                <span class="lot-value">{{ operation.lot.boisson?.nom || 'Non définie' }}</span>
              </div>
              <div class="lot-info-item">
                <span class="lot-label">Format :</span>
                <span class="lot-value">
                  {{ operation.lot.boisson?.format }} {{ operation.lot.boisson?.volume }}
                </span>
              </div>
              <div class="lot-info-item">
                <span class="lot-label">Stock actuel :</span>
                <span class="lot-value stock-current">{{ operation.lot.quantiteActuelle }} unités</span>
              </div>
              <div class="lot-info-item">
                <span class="lot-label">Stock initial :</span>
                <span class="lot-value">{{ operation.lot.quantiteInitiale }} unités</span>
              </div>
              <div class="lot-info-item">
                <span class="lot-label">Date d'entrée :</span>
                <span class="lot-value">{{ formatDate(operation.lot.dateEntree) }}</span>
              </div>
              <div class="lot-info-item">
                <span class="lot-label">Date de péremption :</span>
                <span class="lot-value" :class="getExpirationClass()">
                  {{ formatDate(operation.lot.datePeremption) }}
                </span>
              </div>
              <div class="lot-info-item">
                <span class="lot-label">Fournisseur :</span>
                <span class="lot-value">{{ operation.lot.fournisseur || 'Non renseigné' }}</span>
              </div>
              <div class="lot-info-item">
                <span class="lot-label">Vendable :</span>
                <span class="lot-value" :class="operation.lot.vendable ? 'vendable-yes' : 'vendable-no'">
                  {{ operation.lot.vendable ? 'Oui' : 'Non' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informations du mouvement parent -->
      <div v-if="operation?.mouvement" class="detail-section">
        <h4 class="section-title">Mouvement Parent</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">ID Mouvement :</span>
            <span class="info-value">#{{ operation.mouvement.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Utilisateur :</span>
            <span class="info-value">{{ operation.mouvement.utilisateur?.nom || 'Inconnu' }}</span>
          </div>
          <div v-if="operation.mouvement.raison" class="info-item full-width">
            <span class="info-label">Raison :</span>
            <span class="info-value">{{ operation.mouvement.raison }}</span>
          </div>
          <div v-if="operation.mouvement.typeAjustement" class="info-item">
            <span class="info-label">Type d'ajustement :</span>
            <span class="info-value adjustment-type">{{ operation.mouvement.typeAjustement }}</span>
          </div>
        </div>
      </div>

      <!-- Impact calculé -->
      <div class="detail-section impact-section">
        <h4 class="section-title">Impact sur le Stock</h4>
        <div class="impact-calculation">
          <div class="calculation-step">
            <span class="step-label">Stock avant opération :</span>
            <span class="step-value">{{ getStockBefore() }} unités</span>
          </div>
          <div class="calculation-operator">
            <component :is="getOperatorIcon()" class="w-6 h-6" :class="getOperatorClass()" />
          </div>
          <div class="calculation-step">
            <span class="step-label">Quantité opération :</span>
            <span class="step-value">{{ operation?.quantite || 0 }} unités</span>
          </div>
          <div class="calculation-equals">=</div>
          <div class="calculation-result">
            <span class="result-label">Stock après opération :</span>
            <span class="result-value" :class="getStockAfterClass()">{{ getStockAfter() }} unités</span>
          </div>
        </div>

        <div class="impact-summary">
          <div class="impact-badge" :class="getImpactClass()">
            <component :is="getImpactIcon()" class="w-5 h-5" />
            <span>{{ getImpactText() }}</span>
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
import type { LigneOperation } from '../features/inventaire/models/ligneOperation'

defineProps<{
  operation: LigneOperation | null
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
    minute: '2-digit'
  })
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatQuantity = () => {
  const props = getCurrentInstance()?.props as any
  const operation = props?.operation
  if (!operation?.quantite) return '-'
  const type = operation.mouvement?.type
  const sign = type === 'ENTREE' ? '+' : type === 'SORTIE' ? '-' : '±'
  return `${sign}${operation.quantite}`
}

const getStatusClass = () => {
  const props = getCurrentInstance()?.props as any
  const operation = props?.operation
  return {
    'status-completed': true, // Toutes les opérations sont considérées comme complétées
    'status-entree': operation?.mouvement?.type === 'ENTREE',
    'status-sortie': operation?.mouvement?.type === 'SORTIE',
    'status-ajustement': operation?.mouvement?.type === 'AJUSTEMENT'
  }
}

const getStatusText = () => {
  return 'Opération Terminée'
}

const getQuantityClass = () => {
  const props = getCurrentInstance()?.props as any
  const type = props?.operation?.mouvement?.type
  return {
    'quantity-positive': type === 'ENTREE',
    'quantity-negative': type === 'SORTIE',
    'quantity-neutral': type === 'AJUSTEMENT'
  }
}

const getTypeClass = () => {
  const props = getCurrentInstance()?.props as any
  const type = props?.operation?.mouvement?.type
  return {
    'type-entree': type === 'ENTREE',
    'type-sortie': type === 'SORTIE',
    'type-ajustement': type === 'AJUSTEMENT'
  }
}

const getTypeIcon = () => {
  const props = getCurrentInstance()?.props as any
  const type = props?.operation?.mouvement?.type
  const icons: Record<string, any> = {
    'ENTREE': ArrowDownIcon,
    'SORTIE': ArrowUpIcon,
    'AJUSTEMENT': AdjustmentsHorizontalIcon
  }
  return icons[type || ''] || AdjustmentsHorizontalIcon
}

const getTypeLabel = () => {
  const props = getCurrentInstance()?.props as any
  const type = props?.operation?.mouvement?.type
  const labels: Record<string, string> = {
    'ENTREE': 'Entrée',
    'SORTIE': 'Sortie',
    'AJUSTEMENT': 'Ajustement'
  }
  return labels[type || ''] || 'Opération'
}

const getLotStatusClass = () => {
  const props = getCurrentInstance()?.props as any
  const lot = props?.operation?.lot
  if (!lot) return 'status-unknown'

  const stock = lot.quantiteActuelle || 0
  const isExpired = lot.datePeremption && new Date(lot.datePeremption) < new Date()

  if (isExpired) return 'status-expired'
  if (stock === 0) return 'status-empty'
  if (stock < 10) return 'status-low'
  return 'status-normal'
}

const getLotStatusText = () => {
  const props = getCurrentInstance()?.props as any
  const lot = props?.operation?.lot
  if (!lot) return 'Statut inconnu'

  const stock = lot.quantiteActuelle || 0
  const isExpired = lot.datePeremption && new Date(lot.datePeremption) < new Date()

  if (isExpired) return 'Périmé'
  if (stock === 0) return 'Stock épuisé'
  if (stock < 10) return 'Stock faible'
  return 'Stock normal'
}

const getExpirationClass = () => {
  const props = getCurrentInstance()?.props as any
  const datePeremption = props?.operation?.lot?.datePeremption
  if (!datePeremption) return ''

  const expirationDate = new Date(datePeremption)
  const now = new Date()
  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) return 'expired'
  if (daysUntilExpiration <= 7) return 'warning'
  if (daysUntilExpiration <= 30) return 'caution'
  return 'normal'
}

const getStockBefore = () => {
  const props = getCurrentInstance()?.props as any
  const operation = props?.operation
  if (!operation?.lot || !operation?.quantite) return 0

  const currentStock = operation.lot.quantiteActuelle || 0
  const operationQuantity = operation.quantite
  const type = operation.mouvement?.type

  if (type === 'ENTREE') {
    return currentStock - operationQuantity
  } else if (type === 'SORTIE') {
    return currentStock + operationQuantity
  } else {
    return currentStock // Pour les ajustements, difficile de calculer sans plus d'infos
  }
}

const getStockAfter = () => {
  const props = getCurrentInstance()?.props as any
  return props?.operation?.lot?.quantiteActuelle || 0
}

const getStockAfterClass = () => {
  const stockAfter = getStockAfter()
  if (stockAfter === 0) return 'stock-empty'
  if (stockAfter < 10) return 'stock-low'
  return 'stock-normal'
}

const getOperatorIcon = () => {
  const props = getCurrentInstance()?.props as any
  const type = props?.operation?.mouvement?.type
  return type === 'ENTREE' ? PlusIcon : type === 'SORTIE' ? MinusIcon : ScaleIcon
}

const getOperatorClass = () => {
  const props = getCurrentInstance()?.props as any
  const type = props?.operation?.mouvement?.type
  return {
    'operator-add': type === 'ENTREE',
    'operator-subtract': type === 'SORTIE',
    'operator-adjust': type === 'AJUSTEMENT'
  }
}

const getImpactClass = () => {
  const props = getCurrentInstance()?.props as any
  const type = props?.operation?.mouvement?.type
  return {
    'impact-positive': type === 'ENTREE',
    'impact-negative': type === 'SORTIE',
    'impact-neutral': type === 'AJUSTEMENT'
  }
}

const getImpactIcon = () => {
  return getOperatorIcon()
}

const getImpactText = () => {
  const props = getCurrentInstance()?.props as any
  const operation = props?.operation
  const type = operation?.mouvement?.type
  const quantity = operation?.quantite || 0

  const texts: Record<string, string> = {
    'ENTREE': `Stock augmenté de ${quantity} unité(s)`,
    'SORTIE': `Stock diminué de ${quantity} unité(s)`,
    'AJUSTEMENT': `Stock ajusté de ${quantity} unité(s)`
  }
  return texts[type || ''] || `${quantity} unité(s) traitée(s)`
}

// Helper function to get current instance (Vue 3 composition API)
import { getCurrentInstance } from 'vue'
</script>

<style scoped>
.operation-details {
  max-width: 700px;
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

.operation-status-badge {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-completed {
  background: #dcfce7;
  color: #166534;
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

.lot-section {
  background: #fefce8;
  border-color: #eab308;
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

.operation-id {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
}

.quantity {
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

.movement-type {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.type-entree {
  color: #059669;
}

.type-sortie {
  color: #dc2626;
}

.type-ajustement {
  color: #d97706;
}

/* Lot card */
.lot-card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  overflow: hidden;
}

.lot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.lot-number {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: #1f2937;
}

.lot-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-normal {
  background: #dcfce7;
  color: #166534;
}

.status-low {
  background: #fed7aa;
  color: #9a3412;
}

.status-empty {
  background: #fee2e2;
  color: #991b1b;
}

.status-expired {
  background: #fee2e2;
  color: #991b1b;
}

.lot-details {
  padding: 1rem;
}

.lot-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.lot-info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.lot-label {
  color: #6b7280;
  font-weight: 500;
}

.lot-value {
  color: #1f2937;
  font-weight: 600;
}

.stock-current {
  color: #0ea5e9;
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

/* Impact calculation */
.impact-calculation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.calculation-step,
.calculation-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-label,
.result-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.step-value,
.result-value {
  font-weight: 600;
  color: #1f2937;
}

.calculation-operator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}

.operator-add {
  background: #dcfce7;
  color: #059669;
}

.operator-subtract {
  background: #fee2e2;
  color: #dc2626;
}

.operator-adjust {
  background: #fed7aa;
  color: #d97706;
}

.calculation-equals {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7280;
}

.stock-empty {
  color: #dc2626;
}

.stock-low {
  color: #ea580c;
}

.stock-normal {
  color: #059669;
}

.impact-summary {
  text-align: center;
}

.impact-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
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

  .info-grid,
  .lot-info-grid {
    grid-template-columns: 1fr;
  }

  .impact-calculation {
    flex-direction: column;
    gap: 1rem;
  }

  .calculation-operator {
    transform: rotate(90deg);
  }
}
</style>
