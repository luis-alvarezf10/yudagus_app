export interface Review {
  id: string
  id_project: string
  title: string
  description: string
  part: string
  date: string
  id_status: number | null
  created_at?: string
}

export interface CreateReviewData {
  id_project: string
  title: string
  description: string
  part: string
  date: string
  id_status: number | null
}

export interface ReviewStatus {
  id: number
  name: string
  color: string
  description: string
}

// Mapeo de estados según tu base de datos
export const REVIEW_STATUSES: Record<number, ReviewStatus> = {
  1: { id: 1, name: 'Aceptado', color: 'green', description: 'Se acepta el producto sin modificaciones' },
  2: { id: 2, name: 'Rechazado', color: 'red', description: 'Rechazado debido a errores graves' },
  3: { id: 3, name: 'Pendiente', color: 'amber', description: 'Aceptado el producto de manera provisional' }
}

// Estado por defecto cuando id_status es null
export const DEFAULT_STATUS: ReviewStatus = {
  id: 0,
  name: 'En Espera',
  color: 'gray',
  description: 'Esperando revisión'
}
