export type ListingStatus = 'pending' | 'active' | 'rejected' | 'expired'
export type ListingType = 'apartment' | 'house' | 'room' | 'studio'

export type CityName =
  | 'الناصرة'
  | 'أم الفحم'
  | 'الطيبة'
  | 'الطيرة'
  | 'باقة الغربية'
  | 'كفر قاسم'
  | 'سخنين'
  | 'عرابة'
  | 'شفاعمرو'
  | 'رهط'
  | 'تل شبع'
  | 'رامة'
  | 'كفر كنا'
  | 'المغار'
  | 'يافا'
  | 'حيفا'
  | 'عكا'
  | 'أخرى'

export const CITIES: CityName[] = [
  'الناصرة',
  'أم الفحم',
  'الطيبة',
  'الطيرة',
  'باقة الغربية',
  'كفر قاسم',
  'سخنين',
  'عرابة',
  'شفاعمرو',
  'رهط',
  'تل شبع',
  'رامة',
  'كفر كنا',
  'المغار',
  'يافا',
  'حيفا',
  'عكا',
  'أخرى',
]

export const LISTING_TYPES: { value: ListingType; label: string; labelHe: string }[] = [
  { value: 'apartment', label: 'شقة', labelHe: 'דירה' },
  { value: 'house', label: 'بيت', labelHe: 'בית' },
  { value: 'room', label: 'غرفة', labelHe: 'חדר' },
  { value: 'studio', label: 'استوديو', labelHe: 'סטודיו' },
]

export interface Profile {
  id: string
  full_name: string
  phone: string
  is_landlord: boolean
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  listing_type: ListingType
  city: CityName
  neighborhood: string | null
  address: string | null
  rooms: number
  floor: number | null
  size_sqm: number | null
  furnished: boolean
  parking: boolean
  elevator: boolean
  balcony: boolean
  price: number
  price_negotiable: boolean
  contact_phone: string
  contact_name: string
  photos: string[]
  status: ListingStatus
  rejection_reason: string | null
  views: number
  created_at: string
  updated_at: string
  expires_at: string
}

export interface ListingFormData {
  title: string
  description: string
  listing_type: ListingType
  city: CityName | ''
  neighborhood: string
  rooms: number
  floor: number | ''
  size_sqm: number | ''
  furnished: boolean
  parking: boolean
  elevator: boolean
  balcony: boolean
  price: number
  price_negotiable: boolean
  contact_name: string
  contact_phone: string
}

export interface SearchFilters {
  city?: CityName
  listing_type?: ListingType
  min_price?: number
  max_price?: number
  min_rooms?: number
  furnished?: boolean
}
