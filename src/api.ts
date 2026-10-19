import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export interface Asset {
  asset_id: number;
  asset_name: string;
  stock_quantity: number;
  category: 'Consumable' | 'Non-Consumable';
}

export type AssetInput = Omit<Asset, 'asset_id'>;

export const listAssets = () => api.get<Asset[]>('/assets');
export const addAsset = (data: AssetInput) => api.post<Asset>('/assets', data);
export const editAsset = (id: number, data: Partial<AssetInput>) => api.patch<Asset>(`/assets/${id}`, data);
export const removeAsset = (id: number) => api.delete(`/assets/${id}`);
