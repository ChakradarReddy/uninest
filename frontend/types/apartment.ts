export interface Apartment {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  monthly_rent: number;
  deposit_percentage: number;
  min_contract_months: number;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  available_from: string;
  is_available: boolean;
  amenities: string[];
  images: string[];
  owner_id: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_profile_image?: string;
  owner_phone?: string;
  owner_email?: string;
  created_at: string;
  updated_at: string;
}

export interface ApartmentFilters {
  city?: string;
  min_rent?: number;
  max_rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  available_from?: string;
  search?: string;
  amenities?: string[];
}

export interface ApartmentSearchParams {
  page?: number;
  limit?: number;
  filters?: ApartmentFilters;
}

export interface ApartmentSearchResponse {
  apartments: Apartment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApartmentFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
  monthly_rent: number;
  deposit_percentage: number;
  min_contract_months: number;
  bedrooms: number;
  bathrooms: number;
  square_feet?: number;
  available_from: string;
  amenities: string[];
  images: File[];
}

export interface ApartmentImage {
  id: string;
  apartment_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}
