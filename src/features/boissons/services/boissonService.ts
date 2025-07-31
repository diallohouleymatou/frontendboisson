import type {Boisson} from "../models/boisson.ts";
import {api} from "../../../api/api.ts";
export class BoissonService {
    private static readonly base_Url='/boissons';
    static async getAllBoissons():Promise<Boisson[]>{
        const response=await api.get<Boisson[]>(this.base_Url);
        // Map 'active' to 'isActive' for compatibility with the frontend
        return response.data.map((b: any) => ({
            ...b,
            isActive: b.active
        }));
    }
    static async addBoisson(boisson:Boisson){
      const response = await api.post<Boisson>(this.base_Url,boisson);
      return response.data;
    }
    static async updateBoisson(boisson:Boisson,id:number){
        console.log(boisson)
        const response = await api.put<Boisson>(this.base_Url+'/'+id,boisson);
        return response.data;
    }
    static async getBoissonById(id:number){
        const response = await api.get<Boisson>(this.base_Url+'/'+id);
        return response.data;
    }
    static async activateOrDeactivateBoisson(id: number) {
        const response = await api.put<Boisson>(
            `${this.base_Url}/${id}/statut`
        );
        return response.data;
    }
}