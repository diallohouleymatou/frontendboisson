export interface Stat{

}

export interface DailyMovementsDto {
  dates: string[];
  entries: number[];
  exits: number[];
  adjustments: number[];
}

export interface MovementTrendDto {
  period: string; // e.g. "Cette Semaine", "Ce Mois", "Cette Année"
  totalMovements: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface WeeklyDatasetDto {
  label: string;
  data: number[];
  color?: string;
}

export interface WeeklyStockMovementDto {
  weekDates: string[];
  datasets: WeeklyDatasetDto[];
  totalEntries: number;
  totalExits: number;
  totalAdjustments: number;
}

export interface StockAlertDto {
  beverageName: string;
  currentStockLevel: number;
  thresholdLevel: number;
  alertSeverityLevel: string;
}
