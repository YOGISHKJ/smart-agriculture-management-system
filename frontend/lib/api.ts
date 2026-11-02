const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  issues?: Array<{ field: string; message: string }>;
  [key: string]: any;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'FARMER' | 'ADMIN';
  phone?: string;
}

export interface Field {
  id: number;
  user_id: number;
  name: string;
  location: string;
  area: number;
  soil_type?: string;
  water_source?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  total_crops?: string | number;
  active_crops?: string | number;
}

export interface Crop {
  id: number;
  user_id: number;
  field_id: number;
  name: string;
  variety?: string;
  season: string;
  sowing_date: string;
  expected_harvest_date: string;
  seed_quantity: number;
  status: 'PLANNED' | 'ACTIVE' | 'HARVESTED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  field_name?: string;
  field_location?: string;
  field_area?: number;
  owner_name?: string;
  total_water_liters?: number;
  total_fertilizer_kg?: number;
  total_fertilizer_cost?: number;
}

export interface WaterUsage {
  id: number;
  user_id: number;
  crop_id: number;
  date: string;
  method: string;
  liters: number;
  duration_minutes: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  crop_name?: string;
  crop_variety?: string;
  field_name?: string;
  field_location?: string;
  owner_name?: string;
}

export interface FertilizerUsage {
  id: number;
  user_id: number;
  crop_id: number;
  date: string;
  name: string;
  type: string;
  quantity_kg: number;
  cost: number;
  method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  crop_name?: string;
  crop_variety?: string;
  field_name?: string;
  field_location?: string;
  owner_name?: string;
}

export interface DashboardSummary {
  totalFields: number;
  totalArea: number;
  totalCrops: number;
  activeCrops: number;
  plannedCrops: number;
  harvestedCrops: number;
  totalWater: number;
  totalWaterMinutes: number;
  totalFertilizer: number;
  totalFertilizerCost: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('agri_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('agri_token');
        localStorage.removeItem('agri_user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
      const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (err: any) {
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest<{ success: boolean; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (userData: { name: string; email: string; password: string; phone?: string }) =>
      apiRequest<{ success: boolean; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    me: () => apiRequest<{ success: boolean; user: User }>('/auth/me'),
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('agri_token');
        localStorage.removeItem('agri_user');
      }
    }
  },

  // Fields
  fields: {
    getAll: () => apiRequest<{ success: boolean; fields: Field[] }>('/fields'),
    getById: (id: number | string) => apiRequest<{ success: boolean; field: Field }>(`/fields/${id}`),
    create: (data: Partial<Field>) =>
      apiRequest<{ success: boolean; message: string; field: Field }>('/fields', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: number | string, data: Partial<Field>) =>
      apiRequest<{ success: boolean; message: string; field: Field }>(`/fields/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id: number | string) =>
      apiRequest<{ success: boolean; message: string }>(`/fields/${id}`, {
        method: 'DELETE'
      })
  },

  // Crops
  crops: {
    getAll: (params?: { field_id?: number | string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.field_id) q.append('field_id', String(params.field_id));
      if (params?.status) q.append('status', params.status);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiRequest<{ success: boolean; crops: Crop[] }>(`/crops${qs}`);
    },
    getById: (id: number | string) => apiRequest<{ success: boolean; crop: Crop }>(`/crops/${id}`),
    create: (data: Partial<Crop>) =>
      apiRequest<{ success: boolean; message: string; crop: Crop }>('/crops', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: number | string, data: Partial<Crop>) =>
      apiRequest<{ success: boolean; message: string; crop: Crop }>(`/crops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id: number | string) =>
      apiRequest<{ success: boolean; message: string }>(`/crops/${id}`, {
        method: 'DELETE'
      })
  },

  // Water Usage
  water: {
    getAll: (params?: { crop_id?: number | string }) => {
      const q = new URLSearchParams();
      if (params?.crop_id) q.append('crop_id', String(params.crop_id));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiRequest<{
        success: boolean;
        water_usages: WaterUsage[];
        summary_by_crop: Array<{ crop_id: number; crop_name: string; total_liters: number; total_minutes: number; log_count: number }>;
      }>(`/water${qs}`);
    },
    getById: (id: number | string) => apiRequest<{ success: boolean; water_usage: WaterUsage }>(`/water/${id}`),
    create: (data: Partial<WaterUsage>) =>
      apiRequest<{ success: boolean; message: string; water_usage: WaterUsage }>('/water', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: number | string, data: Partial<WaterUsage>) =>
      apiRequest<{ success: boolean; message: string; water_usage: WaterUsage }>(`/water/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id: number | string) =>
      apiRequest<{ success: boolean; message: string }>(`/water/${id}`, {
        method: 'DELETE'
      })
  },

  // Fertilizer Usage
  fertilizer: {
    getAll: (params?: { crop_id?: number | string }) => {
      const q = new URLSearchParams();
      if (params?.crop_id) q.append('crop_id', String(params.crop_id));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiRequest<{
        success: boolean;
        fertilizer_usages: FertilizerUsage[];
        summary_by_crop: Array<{ crop_id: number; crop_name: string; total_kg: number; total_cost: number; log_count: number }>;
      }>(`/fertilizer${qs}`);
    },
    getById: (id: number | string) =>
      apiRequest<{ success: boolean; fertilizer_usage: FertilizerUsage }>(`/fertilizer/${id}`),
    create: (data: Partial<FertilizerUsage>) =>
      apiRequest<{ success: boolean; message: string; fertilizer_usage: FertilizerUsage }>('/fertilizer', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id: number | string, data: Partial<FertilizerUsage>) =>
      apiRequest<{ success: boolean; message: string; fertilizer_usage: FertilizerUsage }>(`/fertilizer/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id: number | string) =>
      apiRequest<{ success: boolean; message: string }>(`/fertilizer/${id}`, {
        method: 'DELETE'
      })
  },

  // Dashboard
  dashboard: {
    getSummary: () =>
      apiRequest<{
        success: boolean;
        summary: DashboardSummary;
        charts: {
          waterUsageOverTime: Array<{ date: string; liters: number; crops: string }>;
          fertilizerUsagePerCrop: Array<{ crop_name: string; total_kg: number; total_cost: number }>;
        };
        recentLogs: {
          water: any[];
          fertilizer: any[];
        };
      }>('/dashboard/summary')
  },

  // Health
  health: {
    check: () => apiRequest<{ status: string; database: { status: string } }>('/health')
  }
};
