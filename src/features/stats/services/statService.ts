import { api } from '../../../api/api';
import type {
  DailyMovementsDto,
  WeeklyStockMovementDto,
  StockAlertDto
} from '../models/stat';

export class StatService {
  static async getDashboardStats(): Promise<DashboardStatisticsDto> {
    const response = await api.get('/statistics/dashboard');
    return response.data;
  }
}

export class AnalysisService {
  static async getDailyMovements(start: string, end: string): Promise<DailyMovementsDto> {
    const response = await api.get('/statistics/daily-movements', { params: { start, end } });
    console.log( 'Daily Movements Response:', response.data);
    return response.data;
  }

  static async getWeeklyStockMovement(): Promise<WeeklyStockMovementDto> {
    const response = await api.get('/statistics/weekly-stock-movement');
    console.log('Weekly Stock Movement Response:', response.data);
    return response.data;
  }

  static async getStockAlerts(): Promise<StockAlertDto[]> {
    const response = await api.get('/statistics/stocks');
    console.log('Stock Alerts Response:', response.data);
    return response.data;
  }
}
