
import type { DashboardStatisticsDto } from '../models/stat';
import { api } from '../../../api/api';
export class StatService {
  static async getDashboardStats(): Promise<DashboardStatisticsDto> {
    const response = await api.get('/statistics/dashboard');
    return response.data;
  }
}

