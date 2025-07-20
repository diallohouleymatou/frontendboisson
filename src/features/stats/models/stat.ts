export interface Stat{}

export interface StockAlertDto {
  lotId: number;
  boisson: string;
  quantite: number;
  seuil: number;
}

export interface DashboardStatisticsDto {
  totalBeverages: number;
  totalStock: number;
  lowStockAlerts: number;
  totalMovements: number;
  totalUsers: number;
  totalValue: number;
  stockAlerts?: StockAlertDto[];
}
