import { supabase } from '@/lib/supabase'
import type { Review, CreateReviewData } from '../types/review.types'

export const reviewService = {
  // Obtener todas las revisiones
  async getReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false })

    if (error) throw error
    return data as Review[]
  },

  // Obtener revisión por ID
  async getReviewById(id: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Review
  },

  // Obtener revisiones por proyecto
  async getReviewsByProject(projectId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id_project', projectId)
      .order('date', { ascending: false })

    if (error) throw error
    return data as Review[]
  },

  // Obtener revisiones por estado
  async getReviewsByStatus(statusId: number) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id_status', statusId)
      .order('date', { ascending: false })

    if (error) throw error
    return data as Review[]
  },

  // Crear nueva revisión
  async createReview(reviewData: CreateReviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single()

    if (error) throw error
    return data as Review
  },

  // Actualizar revisión
  async updateReview(id: string, updates: Partial<Review>) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Review
  },

  // Eliminar revisión
  async deleteReview(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Obtener revisiones recientes (últimas 10)
  async getRecentReviews(limit: number = 10) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as Review[]
  }
}
