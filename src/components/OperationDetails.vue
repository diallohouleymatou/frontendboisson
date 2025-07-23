<template>
  <div class="operation-details">
    <div class="details-header">
      <h3 class="details-title">Opération #{{ operation?.id }}</h3>
      <span class="operation-status-badge" :class="getStatusClass()">
        {{ getStatusText() }}
      </span>
    </div>
    <div class="details-content compact">
      <div class="main-info">
        <div class="main-info-item">
          <span class="main-label">Type :</span>
          <span class="main-value type-badge" :class="getTypeClass()">
            <component :is="getTypeIcon()" class="w-4 h-4" />
            {{ getTypeLabel() }}
          </span>
        </div>
        <div class="main-info-item">
          <span class="main-label">Quantité :</span>
          <span class="main-value quantity-badge" :class="getQuantityClass()">{{ formatQuantity() }}</span>
        </div>
        <div class="main-info-item">
          <span class="main-label">Date :</span>
          <span class="main-value">{{ formatDateTime(operation?.mouvement?.dateMouvement) }}</span>
        </div>
        <div class="main-info-item" v-if="operation?.lot">
          <span class="main-label">Lot :</span>
          <span class="main-value">{{ operation.lot.numeroLot }}</span>
        </div>
        <div class="main-info-item" v-if="operation?.lot?.boisson">
          <span class="main-label">Boisson :</span>
          <span class="main-value">{{ operation.lot.boisson.nom }}</span>
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
    'status-completed': true,
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
    return currentStock
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

import { getCurrentInstance } from 'vue'
</script>

<style scoped>
.operation-details {
  max-width: 420px;
  margin: 0 auto;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
}
.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.details-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}
.operation-status-badge {
  padding: 0.4rem 1rem;
  border-radius: 0.7rem;
  font-size: 0.95rem;
  font-weight: 500;
  background: #e0f2fe;
  color: #0284c7;
}
.details-content.compact {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}
.main-info {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.main-info-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.main-label {
  font-size: 1rem;
  color: #64748b;
  min-width: 80px;
  font-weight: 500;
}
.main-value {
  font-size: 1.08rem;
  font-weight: 600;
  color: #1e293b;
}
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.7rem;
  border-radius: 1rem;
  background: #f0fdfa;
  color: #059669;
}
.type-sortie {
  background: #fef2f2;
  color: #dc2626;
}
.type-ajustement {
  background: #fefce8;
  color: #d97706;
}
.quantity-badge {
  background: #f0fdfa;
  color: #059669;
  border-radius: 1rem;
  padding: 0.2rem 0.7rem;
}
.quantity-negative {
  background: #fef2f2;
  color: #dc2626;
}
.quantity-neutral {
  background: #fefce8;
  color: #d97706;
}
.details-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}
.btn.btn-primary {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.7rem 2.2rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn.btn-primary:hover {
  background: #2563eb;
}
</style>
