import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { reviewService } from '../services/review.service'
import type { CreateReviewData } from '../types/review.types'

export const ScheduleReviewPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    id_project: '',
    description: '',
    part: '',
    date: new Date().toISOString().split('T')[0],
    id_status: null as number | null
  })

  const [parts, setParts] = useState<string[]>([])
  const [partInput, setPartInput] = useState('')

  const handleAddPart = () => {
    if (partInput.trim() && !parts.includes(partInput.trim())) {
      setParts([...parts, partInput.trim()])
      setPartInput('')
    }
  }

  const handleRemovePart = (partToRemove: string) => {
    setParts(parts.filter(p => p !== partToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      const reviewData: CreateReviewData = {
        ...formData,
        part: parts.join(', '), // Unir todas las partes
        id_manager: user?.id || null // Asignar el ID del gerente actual
      }

      await reviewService.createReview(reviewData)
      navigate('/dashboard') // Redirigir al dashboard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al programar la revisión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-[#111822] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white"
            >
              ← Volver
            </button>
            <div>
              <div className="text-gray-400 text-sm mb-1">
                Revisiones Técnicas / <span className="text-white">Programar Nueva Revisión</span>
              </div>
              <h1 className="text-white text-2xl font-bold">Programar Revisión Técnica Formal</h1>
              <p className="text-gray-400 text-sm mt-1">
                Define el alcance de la revisión, contexto del proyecto y asigna roles de participantes.
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Ver Guías
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - General Information & Logistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-blue-500 text-xl">ℹ️</span>
                <h2 className="text-white text-lg font-bold">Información General</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Título de la Revisión
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="ej., Q4 API Architecture Review"
                    required
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Selección de Proyecto
                    </label>
                    <input
                      type="text"
                      value={formData.id_project}
                      onChange={(e) => setFormData({ ...formData, id_project: e.target.value })}
                      placeholder="ID del Proyecto"
                      required
                      className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Descripción de la Revisión
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalla los objetivos y requisitos de esta revisión técnica..."
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Logistics & Scope */}
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-blue-500 text-xl">📅</span>
                <h2 className="text-white text-lg font-bold">Logística y Alcance</h2>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Fecha de Revisión
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Partes a Revisar
                  </label>
                  
                  {/* Tags de partes */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {parts.map((part) => (
                      <span
                        key={part}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                      >
                        {part}
                        <button
                          type="button"
                          onClick={() => handleRemovePart(part)}
                          className="hover:text-blue-300"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Input para agregar partes */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={partInput}
                      onChange={(e) => setPartInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPart())}
                      placeholder="Escribe un componente y presiona enter..."
                      className="flex-1 px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddPart}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Participants */}
          <div className="space-y-6">
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 text-xl">👥</span>
                <h2 className="text-white text-lg font-bold">Participantes</h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Asigna roles a los miembros del equipo para esta revisión.
              </p>

              <div className="space-y-4">
                {/* Placeholder para participantes */}
                <div className="text-center py-8 text-gray-500 text-sm">
                  Funcionalidad de asignación de participantes próximamente
                </div>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-700 text-blue-400 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span>👤</span>
                  <span>Agregar Miembro del Equipo</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Se enviarán correos de invitación a todos los participantes al programar.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <span>📅</span>
              <span>{loading ? 'Programando...' : 'Programar Revisión'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
