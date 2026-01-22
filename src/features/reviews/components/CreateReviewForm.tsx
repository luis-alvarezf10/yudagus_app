import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CreateReviewData } from '../types/review.types'
import { REVIEW_STATUSES } from '../types/review.types'

interface CreateReviewFormProps {
  onSubmit: (data: CreateReviewData) => Promise<void>
  loading?: boolean
  error?: string | null
  onCancel?: () => void
}

export const CreateReviewForm = ({ onSubmit, loading, error, onCancel }: CreateReviewFormProps) => {
  const [formData, setFormData] = useState<CreateReviewData>({
    id_project: '',
    title: '',
    description: '',
    part: '',
    date: new Date().toISOString().split('T')[0],
    id_status: null // En espera por defecto
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        id_project: '',
        title: '',
        description: '',
        part: '',
        date: new Date().toISOString().split('T')[0],
        id_status: null
      })
    } catch (err) {
      console.error('Error creating review:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Título de la Revisión *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-3 py-2 bg-[#233348] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Auditoría de Seguridad API"
          />
        </div>

        <div>
          <label htmlFor="id_project" className="block text-sm font-medium text-gray-300 mb-1">
            ID del Proyecto *
          </label>
          <input
            id="id_project"
            type="text"
            value={formData.id_project}
            onChange={(e) => setFormData({ ...formData, id_project: e.target.value })}
            required
            className="w-full px-3 py-2 bg-[#233348] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="UUID del proyecto"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
          Descripción *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
          className="w-full px-3 py-2 bg-[#233348] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe los objetivos y alcance de la revisión..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="part" className="block text-sm font-medium text-gray-300 mb-1">
            Parte/Módulo *
          </label>
          <input
            id="part"
            type="text"
            value={formData.part}
            onChange={(e) => setFormData({ ...formData, part: e.target.value })}
            required
            className="w-full px-3 py-2 bg-[#233348] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Backend, Frontend"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">
            Fecha *
          </label>
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-3 py-2 bg-[#233348] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="id_status" className="block text-sm font-medium text-gray-300 mb-1">
            Estado
          </label>
          <select
            id="id_status"
            value={formData.id_status ?? ''}
            onChange={(e) => setFormData({ ...formData, id_status: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-3 py-2 bg-[#233348] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">En Espera</option>
            {Object.values(REVIEW_STATUSES).map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creando...' : 'Crear Revisión'}
        </button>
      </div>
    </form>
  )
}
