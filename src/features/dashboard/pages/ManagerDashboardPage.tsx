import { useState, useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { reviewService, REVIEW_STATUSES, CreateReviewForm } from '@/features/reviews'
import type { Review, CreateReviewData } from '@/features/reviews'

interface StatCard {
  title: string
  value: string | number
  icon: string
  change: string
  changeType: 'positive' | 'negative'
  subtitle: string
}

interface Employee {
  id: string
  name: string
  role: string
  status: 'online' | 'offline' | 'busy'
  avatar?: string
}

export const ManagerDashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  const [stats] = useState<StatCard[]>([
    {
      title: 'Proyectos Activos',
      value: 12,
      icon: '📊',
      change: '+2%',
      changeType: 'positive',
      subtitle: 'vs mes anterior'
    },
    {
      title: 'Horas Facturables',
      value: '1,240',
      icon: '⏰',
      change: '-5%',
      changeType: 'negative',
      subtitle: 'vs mes anterior'
    },
    {
      title: 'Revisiones Pendientes',
      value: '05',
      icon: '✓',
      change: '-10%',
      changeType: 'negative',
      subtitle: 'vs semana anterior'
    },
    {
      title: 'Satisfacción',
      value: '98%',
      icon: '😊',
      change: '+1%',
      changeType: 'positive',
      subtitle: 'objetivo 95%'
    }
  ])

  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Arquitecta Principal',
      status: 'online'
    },
    {
      id: '2',
      name: 'Marcus Thorne',
      role: 'Ingeniero DevOps',
      status: 'online'
    },
    {
      id: '3',
      name: 'Elena Rodriguez',
      role: 'Líder QA Senior',
      status: 'offline'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Desarrollador Backend Sr.',
      status: 'busy'
    }
  ])

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await reviewService.getRecentReviews(10)
      setReviews(data)
    } catch (err) {
      console.error('Error loading reviews:', err)
      setError('Error al cargar las revisiones')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReview = async (data: CreateReviewData) => {
    try {
      setLoading(true)
      setError(null)
      await reviewService.createReview(data)
      await loadReviews()
      setShowCreateForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear revisión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (statusId: number) => {
    const status = REVIEW_STATUSES[statusId] || REVIEW_STATUSES[1]
    
    const colorClasses = {
      green: 'bg-green-500/10 text-green-500',
      blue: 'bg-blue-500/20 text-blue-500',
      amber: 'bg-amber-500/10 text-amber-500',
      red: 'bg-red-500/10 text-red-500'
    }

    return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${colorClasses[status.color as keyof typeof colorClasses]}`}>
        {status.name}
      </span>
    )
  }

  const getStatusIndicator = (status: Employee['status']) => {
    const colors = {
      online: 'bg-green-500',
      offline: 'border border-gray-500',
      busy: 'bg-orange-500'
    }

    return <span className={`w-2 h-2 rounded-full ${colors[status]}`}></span>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1a]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-800 bg-[#111822] px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            {/* Botón hamburguesa para móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white text-2xl"
            >
              ☰
            </button>
            <div className="text-blue-500 text-xl sm:text-2xl">�</div>
            <h2 className="text-white text-base sm:text-lg lg:text-xl font-bold">Panel de Control</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Barra de búsqueda - oculta en móvil pequeño */}
            <div className="hidden md:block relative w-48 lg:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-[#233348] border-none rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                placeholder="Buscar proyectos..."
                type="text"
              />
            </div>

            <div className="flex gap-2">
              <button className="p-2 rounded-lg bg-[#233348] text-gray-400 hover:text-white relative">
                <span className="text-lg sm:text-xl">🔔</span>
                <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#111822]"></span>
              </button>
              <button className="p-2 rounded-lg bg-[#233348] text-gray-400 hover:text-white">
                <span className="text-lg sm:text-xl">👤</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 bg-[#111822] border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium">{stat.title}</p>
                  <span className="text-xl sm:text-2xl">{stat.icon}</span>
                </div>
                <p className="text-white text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs font-bold ${
                      stat.changeType === 'positive' ? 'text-green-500' : 'text-orange-500'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-gray-400 text-[10px]">{stat.subtitle}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Reviews Table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-2">
                <h2 className="text-white text-lg sm:text-xl font-bold">Revisiones Técnicas Recientes</h2>
                <button 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="text-lg">{showCreateForm ? '✕' : '+'}</span>
                  <span>{showCreateForm ? 'Cancelar' : 'Crear Revisión'}</span>
                </button>
              </div>

              {/* Formulario de creación */}
              {showCreateForm && (
                <div className="bg-[#111822] rounded-xl border border-gray-800 p-4 sm:p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Nueva Revisión Técnica</h3>
                  <CreateReviewForm
                    onSubmit={handleCreateReview}
                    loading={loading}
                    error={error}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              )}

              {/* Tabla/Lista de revisiones */}
              <div className="bg-[#111822] rounded-xl border border-gray-800 overflow-hidden">
                {loading && reviews.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando revisiones...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    No hay revisiones registradas
                  </div>
                ) : (
                  <>
                    {/* Vista de tabla para desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Título de Revisión</th>
                            <th className="px-6 py-4 font-semibold">Fecha</th>
                            <th className="px-6 py-4 font-semibold text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {reviews.map((review) => (
                            <tr
                              key={review.id}
                              className="hover:bg-gray-800/20 transition-colors cursor-pointer group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-white text-sm font-medium group-hover:text-blue-500 transition-colors">
                                    {review.title}
                                  </span>
                                  <span className="text-gray-400 text-xs truncate max-w-xs">
                                    {review.description}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(review.date)}</td>
                              <td className="px-6 py-4 text-right">{getStatusBadge(review.id_status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista de cards para móvil */}
                    <div className="md:hidden divide-y divide-gray-800">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 hover:bg-gray-800/20 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="text-white text-sm font-medium mb-1">{review.title}</h3>
                              <p className="text-gray-400 text-xs mb-2 line-clamp-2">{review.description}</p>
                            </div>
                            {getStatusBadge(review.id_status)}
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{review.part}</span>
                            <span>{formatDate(review.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Employees Sidebar */}
            <div className="space-y-4">
              <h2 className="text-white text-lg sm:text-xl font-bold px-2">Empleados</h2>
              <div className="bg-[#111822] rounded-xl border border-gray-800 p-4 flex flex-col gap-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-white text-sm font-semibold truncate">{employee.name}</span>
                      <span className="text-gray-400 text-xs truncate">{employee.role}</span>
                    </div>
                    {getStatusIndicator(employee.status)}
                  </div>
                ))}

                <button className="w-full mt-2 py-2 text-gray-400 text-xs font-medium hover:text-white transition-colors border-t border-gray-800 pt-4">
                  Ver Directorio Completo
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
