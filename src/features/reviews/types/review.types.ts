export interface Review {
  id: string
  id_project: string
  title: string
  description: string
  part: string
  date: string
  id_status: number
  created_at?: string
}

export interface CreateReviewData {
  id_project: string
  title: string
  description: string
  part: string
  date: string
  id_status: number
}

export interface ReviewStatus {
  id: number
  name: string
  color: string
}

// Mapeo de estados comunes
export const REVIEW_STATUSES: Record<number, ReviewStatus> = {
  1: { id: 1, name: 'Programado', color: 'amber' },
  2: { id: 2, name: 'En Progreso', color: 'blue' },
  3: { id: 3, name: 'Completado', color: 'green' },
  4: { id: 4, name: 'Cancelado', color: 'red' }
}
