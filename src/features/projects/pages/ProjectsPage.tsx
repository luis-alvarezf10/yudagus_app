import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { REVIEW_STATUSES, DEFAULT_STATUS } from '@/features/reviews/types/review.types'
import { formatDate } from '@/lib/dateUtils'

interface Project {
  id: string
  name: string
  id_client?: string
  created_at: string
}

interface Review {
  id: string
  title: string
  description: string
  part: string
  date: string
  id_status: number | null
  created_at: string
  employees?: {
    name: string
  }
}

export const ProjectsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectReviews, setProjectReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false)
  const [editProjectName, setEditProjectName] = useState('')
  const [updatingProject, setUpdatingProject] = useState(false)
  const [editProjectError, setEditProjectError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Error al cargar proyectos:', err)
      setError('No se pudieron cargar los proyectos')
    } finally {
      setLoading(false)
    }
  }

  const loadProjectReviews = async (projectId: string) => {
    try {
      setLoadingReviews(true)
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          employees!reviews_id_manager_fkey (
            name
          )
        `)
        .eq('id_project', projectId)
        .order('date', { ascending: false })

      if (error) throw error
      setProjectReviews(data || [])
    } catch (err) {
      console.error('Error al cargar revisiones del proyecto:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project)
    await loadProjectReviews(project.id)
  }

  const handleCloseModal = () => {
    setSelectedProject(null)
    setProjectReviews([])
  }

  const getStatusInfo = (statusId: number | null) => {
    if (statusId === null) return DEFAULT_STATUS
    return REVIEW_STATUSES[statusId] || DEFAULT_STATUS
  }

  const getStatusColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500/10 text-green-400 border-green-500/30',
      red: 'bg-red-500/10 text-red-400 border-red-500/30',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
    return colors[color] || colors.gray
  }

  const handleEditProject = () => {
    if (selectedProject) {
      setEditProjectName(selectedProject.name)
      setEditProjectModalOpen(true)
    }
  }

  const handleDeleteProject = () => {
    setDeleteProjectModalOpen(true)
  }

  const handleEditProjectCancel = () => {
    setEditProjectModalOpen(false)
    setEditProjectName('')
    setEditProjectError(null)
  }

  const handleEditProjectConfirm = async () => {
    if (!selectedProject || !editProjectName.trim()) return

    try {
      setUpdatingProject(true)
      setEditProjectError(null)

      const { error: updateError } = await supabase
        .from('projects')
        .update({ name: editProjectName.trim() })
        .eq('id', selectedProject.id)

      if (updateError) throw updateError

      // Actualizar la lista de proyectos
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, name: editProjectName.trim() }
          : p
      ))

      // Actualizar el proyecto seleccionado
      setSelectedProject({ ...selectedProject, name: editProjectName.trim() })

      setEditProjectModalOpen(false)
      setEditProjectName('')
    } catch (err) {
      console.error('Error al actualizar proyecto:', err)
      setEditProjectError('No se pudo actualizar el proyecto')
    } finally {
      setUpdatingProject(false)
    }
  }

  const handleDeleteProjectCancel = () => {
    setDeleteProjectModalOpen(false)
  }

  const handleDeleteProjectConfirm = async () => {
    if (!selectedProject) return

    try {
      setDeletingProject(true)

      // Primero eliminar los participantes de todas las revisiones del proyecto
      if (projectReviews.length > 0) {
        const reviewIds = projectReviews.map(r => r.id)
        
        const { error: participantsError } = await supabase
          .from('participants')
          .delete()
          .in('id_review', reviewIds)

        if (participantsError) throw participantsError

        // Luego eliminar las revisiones
        const { error: reviewsError } = await supabase
          .from('reviews')
          .delete()
          .eq('id_project', selectedProject.id)

        if (reviewsError) throw reviewsError
      }

      // Finalmente eliminar el proyecto
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id)

      if (projectError) throw projectError

      // Actualizar la lista de proyectos
      setProjects(projects.filter(p => p.id !== selectedProject.id))

      // Cerrar modales
      setDeleteProjectModalOpen(false)
      setSelectedProject(null)
      setProjectReviews([])
    } catch (err) {
      console.error('Error al eliminar proyecto:', err)
      setError('No se pudo eliminar el proyecto')
    } finally {
      setDeletingProject(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold mb-2">Proyectos</h1>
          <p className="text-gray-400 text-sm">
            {user?.is_manager ? 'Gestiona todos los proyectos de la empresa' : 'Consulta los proyectos de la empresa'}
          </p>
        </div>
        {user?.is_manager && (
          <button 
            onClick={() => navigate('/projects/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg">+</span>
            <span>Crear Proyecto</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Cargando proyectos...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-6xl mb-4 block">📁</span>
          <p>No hay proyectos registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="bg-[#111822] rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                  📁
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-1 truncate">{project.name}</h3>
                  <p className="text-gray-500 text-xs mt-2">
                    Creado: {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Revisiones del Proyecto */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl flex-shrink-0">
                  📁
                </div>
                <div>
                  <h3 className="text-white text-2xl font-bold">{selectedProject.name}</h3>
                  <p className="text-gray-400 text-sm">
                    Revisiones técnicas del proyecto
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Información del Proyecto */}
              <div className="bg-[#1a2332] rounded-lg p-4 mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span>📋</span>
                  Información del Proyecto
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Fecha de Creación</p>
                    <p className="text-white font-medium">
                      {new Date(selectedProject.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total de Revisiones</p>
                    <p className="text-white font-medium">{projectReviews.length}</p>
                  </div>
                </div>
              </div>

              {/* Revisiones del Proyecto */}
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span>📝</span>
                  Revisiones Técnicas ({projectReviews.length})
                </h4>

                {loadingReviews ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    Cargando revisiones...
                  </div>
                ) : projectReviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-[#1a2332] rounded-lg">
                    <span className="text-4xl mb-2 block">📭</span>
                    <p>No hay revisiones para este proyecto</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectReviews.map((review) => {
                      const status = getStatusInfo(review.id_status)
                      return (
                        <div
                          key={review.id}
                          onClick={() => {
                            handleCloseModal()
                            navigate(`/reviews/${review.id}`)
                          }}
                          className="bg-[#1a2332] rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="text-white font-semibold">
                                  {review.title}
                                </h5>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(status.color)}`}>
                                  {status.name}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm line-clamp-2">
                                {review.description}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-gray-500 mb-1">Parte</p>
                              <p className="text-white font-medium truncate">
                                {review.part}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Fecha</p>
                              <p className="text-white font-medium">
                                {formatDate(review.date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Gerente</p>
                              <p className="text-white font-medium truncate capitalize">
                                {Array.isArray(review.employees) 
                                  ? review.employees[0]?.name || 'N/A'
                                  : review.employees?.name || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-800 flex justify-between items-center">
              <div>
                {user?.is_manager && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleEditProject}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span>Editar Proyecto</span>
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <span>Eliminar Proyecto</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación de Proyecto */}
      {deleteProjectModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">Eliminar Proyecto</h3>
                  <p className="text-gray-400 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-lg p-4 mb-6">
                <p className="text-white font-semibold mb-1">{selectedProject.name}</p>
                <p className="text-gray-400 text-sm">
                  Creado el {new Date(selectedProject.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>

              <p className="text-gray-300 text-sm mb-6">
                ¿Estás seguro de que deseas eliminar este proyecto? 
                {projectReviews.length > 0 && (
                  <span className="text-amber-400 block mt-2">
                    ⚠️ Este proyecto tiene {projectReviews.length} revisión(es) asociada(s) que también serán eliminadas.
                  </span>
                )}
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteProjectCancel}
                  disabled={deletingProject}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteProjectConfirm}
                  disabled={deletingProject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingProject ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Eliminar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Proyecto */}
      {editProjectModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-2xl">
                  ✏️
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">Editar Proyecto</h3>
                  <p className="text-gray-400 text-sm">Modifica el nombre del proyecto</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del proyecto"
                />
              </div>

              {editProjectError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {editProjectError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleEditProjectCancel}
                  disabled={updatingProject}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditProjectConfirm}
                  disabled={updatingProject || !editProjectName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {updatingProject ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

