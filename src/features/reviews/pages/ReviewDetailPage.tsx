import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth'
import { REVIEW_STATUSES, DEFAULT_STATUS } from '../types/review.types'
import { formatDateWithOptions, isToday } from '@/lib/dateUtils'

interface ReviewDetail {
  id: string
  title: string
  description: string
  part: string
  date: string
  id_status: number | null
  created_at: string
  projects?: {
    name: string
  }
  employees?: {
    name: string
  }
}

interface Participant {
  id: string
  role: string
  employees: {
    id: string
    name: string
    professions?: {
      name: string
    } | null
  } | null
  roles: {
    id: string
    name: string
    description?: string | null
  } | null
}

interface Topic {
  id: string
  content: string
  is_pending: boolean
  created_at: string
}

interface Vote {
  id: number
  id_review: string
  id_employee: string
  id_status: number
  employees?: {
    name: string
  }
}

export const ReviewDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [newTopicContent, setNewTopicContent] = useState('')
  const [isReviewer, setIsReviewer] = useState(false)
  const [isSecretary, setIsSecretary] = useState(false)
  const [localTopics, setLocalTopics] = useState<string[]>([])
  const [uploadingTopics, setUploadingTopics] = useState(false)
  const [completingReview, setCompletingReview] = useState(false)
  const [votes, setVotes] = useState<Vote[]>([])
  const [userVote, setUserVote] = useState<number | null>(null)
  const [submittingVote, setSubmittingVote] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [reportExists, setReportExists] = useState(false)
  const [reportData, setReportData] = useState({
    part: '',
    id_employee: '',
    conclusions: ''
  })
  const [finalReport, setFinalReport] = useState<any>(null)

  useEffect(() => {
    if (id) {
      loadReviewDetails()
    }
  }, [id])

  const loadReviewDetails = async () => {
    try {
      setLoading(true)
      
      // Cargar detalles de la revisión
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .select(`
          *,
          projects (
            name
          ),
          employees!reviews_id_manager_fkey (
            name
          )
        `)
        .eq('id', id)
        .single()

      if (reviewError) throw reviewError
      setReview(reviewData)

      // Cargar participantes con sus roles
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select(`
          id,
          role,
          employees (
            id,
            name,
            professions (
              name
            )
          ),
          roles (
            id,
            name,
            description
          )
        `)
        .eq('id_review', id)

      if (participantsError) throw participantsError
      setParticipants(participantsData as any || [])

      // Verificar si el usuario actual es el revisor
      const userParticipation = participantsData?.find(
        (p: any) => p.employees?.id === user?.id
      ) as any
      
      const roleName = Array.isArray(userParticipation?.roles)
        ? userParticipation.roles[0]?.name
        : userParticipation?.roles?.name
      
      if (roleName?.toLowerCase() === 'revisor') {
        setIsReviewer(true)
      }
      
      if (roleName?.toLowerCase() === 'secretario') {
        setIsSecretary(true)
      }

      // Cargar temas de la revisión
      await loadTopics()
      
      // Cargar votos si la revisión está terminada
      if (reviewData.id_status === 4) {
        await loadVotes()
      }
      
      // Verificar si ya existe un reporte
      await checkReportExists()
      
      // Obtener el ID del revisor para prellenar el formulario
      const reviewer = participantsData?.find(
        (p: any) => {
          const pRoleName = Array.isArray(p.roles)
            ? p.roles[0]?.name
            : p.roles?.name
          return pRoleName?.toLowerCase() === 'revisor'
        }
      ) as any
      
      if (reviewer?.employees?.id) {
        setReportData(prev => ({
          ...prev,
          id_employee: reviewer.employees.id,
          part: reviewData.part || ''
        }))
      }
    } catch (err) {
      console.error('Error al cargar detalles:', err)
      setError('No se pudieron cargar los detalles de la revisión')
    } finally {
      setLoading(false)
    }
  }

  const checkReportExists = async () => {
    if (!id) return

    try {
      const { data } = await supabase
        .from('reports')
        .select(`
          *,
          employees (
            name
          )
        `)
        .eq('id_review', id)
        .single()

      if (data) {
        setReportExists(true)
        setFinalReport(data)
      }
    } catch (err) {
      // No hay reporte, está bien
      setReportExists(false)
      setFinalReport(null)
    }
  }

  const loadTopics = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('id_review', id)

      if (error) {
        console.error('Error al cargar temas:', error)
        setTopics([])
        return
      }
      
      setTopics(data || [])
    } catch (err) {
      console.error('Error al cargar temas:', err)
      setTopics([])
    }
  }

  const loadVotes = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          employees (
            name
          )
        `)
        .eq('id_review', id)

      if (error) {
        console.error('Error al cargar votos:', error)
        return
      }

      setVotes(data || [])
      
      // Verificar si el usuario actual ya votó
      const myVote = data?.find((v: any) => v.id_employee === user?.id)
      if (myVote) {
        setUserVote(myVote.id_status)
      }
    } catch (err) {
      console.error('Error al cargar votos:', err)
    }
  }

  const handleAddTopic = async () => {
    if (!newTopicContent.trim()) return

    // Agregar a la lista local
    setLocalTopics([...localTopics, newTopicContent.trim()])
    setNewTopicContent('')
  }

  const handleRemoveLocalTopic = (index: number) => {
    setLocalTopics(localTopics.filter((_, i) => i !== index))
  }

  const handleUploadTopics = async () => {
    if (localTopics.length === 0) return

    try {
      setUploadingTopics(true)

      // Preparar los temas para insertar
      const topicsToInsert = localTopics.map(content => ({
        id_review: id,
        content,
        is_pending: true
      }))

      const { data, error } = await supabase
        .from('topics')
        .insert(topicsToInsert)
        .select()

      if (error) throw error

      // Agregar los nuevos temas a la lista de temas guardados
      setTopics([...data, ...topics])
      
      // Limpiar la lista local
      setLocalTopics([])
      
      setError(null)
    } catch (err) {
      console.error('Error al subir temas:', err)
      setError('No se pudieron subir los temas')
    } finally {
      setUploadingTopics(false)
    }
  }

  const handleToggleTopicStatus = async (topicId: string, currentStatus: boolean) => {
    if (!isSecretary) return // Solo el secretario puede tachar temas
    
    try {
      const { error } = await supabase
        .from('topics')
        .update({ is_pending: !currentStatus })
        .eq('id', topicId)

      if (error) throw error

      setTopics(topics.map(t => 
        t.id === topicId ? { ...t, is_pending: !currentStatus } : t
      ))
    } catch (err) {
      console.error('Error al actualizar tema:', err)
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    if (!isReviewer) return // Solo el revisor puede eliminar temas
    
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', topicId)

      if (error) throw error

      setTopics(topics.filter(t => t.id !== topicId))
    } catch (err) {
      console.error('Error al eliminar tema:', err)
      setError('No se pudo eliminar el tema')
    }
  }

  const handleCompleteReview = async () => {
    if (!isSecretary || !review) return
    
    // Verificar si ya existe un reporte
    if (!reportExists) {
      // Abrir modal para crear el reporte
      setReportModalOpen(true)
      return
    }
    
    // Si ya existe el reporte, proceder a terminar la reunión
    await finalizeReview()
  }

  const handleSubmitReport = async () => {
    if (!review || !reportData.part || !reportData.id_employee || !reportData.conclusions) {
      setError('Por favor completa todos los campos del reporte')
      return
    }

    try {
      setSubmittingReport(true)

      // Insertar el reporte
      const { error: reportError } = await supabase
        .from('reports')
        .insert({
          id_review: review.id,
          part: reportData.part,
          id_employee: reportData.id_employee,
          conclusions: reportData.conclusions
        })

      if (reportError) throw reportError

      setReportExists(true)
      setReportModalOpen(false)
      
      // Recargar el reporte
      await checkReportExists()
      
      // Ahora sí, terminar la reunión
      await finalizeReview()
    } catch (err) {
      console.error('Error al crear reporte:', err)
      setError('No se pudo crear el reporte')
    } finally {
      setSubmittingReport(false)
    }
  }

  const finalizeReview = async () => {
    if (!review) return
    
    try {
      setCompletingReview(true)
      
      // Actualizar el estado de la revisión a "Terminado" (id: 4)
      const { error } = await supabase
        .from('reviews')
        .update({ id_status: 4 })
        .eq('id', review.id)

      if (error) throw error

      // Actualizar el estado local
      setReview({ ...review, id_status: 4 })
      setError(null)
      
      // Cargar votos
      await loadVotes()
      
      // Mostrar mensaje de éxito
      alert('Reunión completada exitosamente. Los participantes pueden votar ahora.')
    } catch (err) {
      console.error('Error al completar revisión:', err)
      setError('No se pudo completar la revisión')
    } finally {
      setCompletingReview(false)
    }
  }

  const handleSubmitVote = async (statusId: number) => {
    if (!review || !user?.id || userVote !== null || !acceptedTerms) return

    try {
      setSubmittingVote(true)

      // Insertar el voto
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          id_review: review.id,
          id_employee: user.id,
          id_status: statusId
        })

      if (voteError) throw voteError

      // Actualizar estado local
      setUserVote(statusId)

      // Recargar votos
      await loadVotes()

      // Verificar si ya hay 3 votos
      const { data: allVotes, error: countError } = await supabase
        .from('votes')
        .select('id_status')
        .eq('id_review', review.id)

      if (countError) throw countError

      if (allVotes && allVotes.length >= 3) {
        // Calcular el resultado de la votación
        const voteCounts = allVotes.reduce((acc: any, vote: any) => {
          acc[vote.id_status] = (acc[vote.id_status] || 0) + 1
          return acc
        }, {})

        // Determinar el estado ganador (mayoría simple)
        let winningStatus = 1 // Por defecto aceptado
        let maxVotes = 0

        Object.entries(voteCounts).forEach(([status, count]: [string, any]) => {
          if (count > maxVotes) {
            maxVotes = count
            winningStatus = parseInt(status)
          }
        })

        // Actualizar el estado de la revisión
        const { error: updateError } = await supabase
          .from('reviews')
          .update({ id_status: winningStatus })
          .eq('id', review.id)

        if (updateError) throw updateError

        // Actualizar estado local
        setReview({ ...review, id_status: winningStatus })

        alert('Votación completada. El estado de la revisión ha sido actualizado.')
      } else {
        alert('Voto registrado exitosamente')
      }
    } catch (err) {
      console.error('Error al enviar voto:', err)
      setError('No se pudo registrar el voto')
    } finally {
      setSubmittingVote(false)
    }
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

  const handleDeleteClick = () => {
    setDeleteModalOpen(true)
  }

  const handleEditClick = () => {
    navigate(`/reviews/${id}/edit`)
  }

  const handleDeleteConfirm = async () => {
    if (!review) return

    try {
      setDeleting(true)
      
      // Primero eliminar los participantes
      const { error: participantsError } = await supabase
        .from('participants')
        .delete()
        .eq('id_review', review.id)

      if (participantsError) throw participantsError

      // Luego eliminar la revisión
      const { error: reviewError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review.id)

      if (reviewError) throw reviewError

      // Redirigir a la lista de revisiones
      navigate('/reviews')
    } catch (err) {
      console.error('Error al eliminar revisión:', err)
      setError('No se pudo eliminar la revisión')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Cargando detalles...
        </div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <p className="text-red-400 mb-4">{error || 'Revisión no encontrada'}</p>
          <button
            onClick={() => navigate('/reviews')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Revisiones
          </button>
        </div>
      </div>
    )
  }

  const status = getStatusInfo(review.id_status)

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="bg-[#111822] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white"
            >
              ← Volver
            </button>
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-1">
                Revisiones / <span className="text-white">Detalles</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-white text-2xl font-bold">{review.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status.color)}`}>
                  {status.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles de la Revisión */}
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 text-xl">📋</span>
                <h2 className="text-white text-lg font-bold">Información de la Revisión</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Descripción</label>
                  <p className="text-white mt-1">{review.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Proyecto</label>
                    <p className="text-white mt-1">{review.projects?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Parte a Revisar</label>
                    <p className="text-white mt-1">{review.part}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Fecha de Revisión</label>
                    <p className="text-white mt-1">
                      {formatDateWithOptions(review.date, 'es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Gerente Responsable</label>
                    <p className="text-white mt-1 capitalize">{review.employees?.name || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Estado</label>
                  <p className="text-white mt-1">{status.description}</p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm">Fecha de Creación</label>
                  <p className="text-white mt-1">
                    {new Date(review.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Temas a Tratar - Visible para todos */}
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 text-xl">📋</span>
                <h2 className="text-white text-lg font-bold">Temas a Tratar</h2>
              </div>

              {topics.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <p>No hay asuntos sugeridos aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-4 rounded-lg border ${
                        topic.is_pending
                          ? 'bg-amber-500/5 border-amber-500/30'
                          : 'bg-green-500/5 border-green-500/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox solo visible para secretario y si no tiene estado */}
                        {isSecretary && review.id_status === null && (
                          <button
                            onClick={() => handleToggleTopicStatus(topic.id, topic.is_pending)}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              topic.is_pending
                                ? 'border-amber-400 hover:bg-amber-400/10'
                                : 'border-green-400 bg-green-400/10'
                            }`}
                          >
                            {!topic.is_pending && (
                              <span className="text-green-400 text-xs">✓</span>
                            )}
                          </button>
                        )}
                        
                        <div className="flex-1">
                          <p className={`text-sm ${
                            topic.is_pending ? 'text-white' : 'text-gray-400 line-through'
                          }`}>
                            {topic.content}
                          </p>
                        </div>
                        
                        {/* Botón X solo visible para revisor y si no tiene estado */}
                        {isReviewer && review.id_status === null && (
                          <button
                            onClick={() => handleDeleteTopic(topic.id)}
                            className="text-red-400 hover:text-red-300 text-lg leading-none flex-shrink-0"
                            title="Eliminar tema"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agregar Tema - Solo para Revisor, en la fecha de revisión y si no tiene estado */}
            {isReviewer && isToday(review.date) && review.id_status === null && (
              <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-green-500 text-xl">➕</span>
                  <h2 className="text-white text-lg font-bold">Sugerir Temas</h2>
                </div>

                <div className="space-y-3">
                  {/* Lista de temas locales */}
                  {localTopics.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {localTopics.map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/30 rounded-lg"
                        >
                          <p className="flex-1 text-sm text-white">{topic}</p>
                          <button
                            onClick={() => handleRemoveLocalTopic(index)}
                            className="text-red-400 hover:text-red-300 text-lg leading-none"
                            title="Eliminar tema"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    placeholder="Describe el tema a tratar en la reunión..."
                    rows={3}
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddTopic}
                      disabled={!newTopicContent.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Agregar a la Lista</span>
                    </button>
                    
                    {localTopics.length > 0 && (
                      <button
                        onClick={handleUploadTopics}
                        disabled={uploadingTopics}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {uploadingTopics ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Subiendo...</span>
                          </>
                        ) : (
                          <>
                            <span>Sugerir asuntos</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Votación - Solo visible cuando la revisión está terminada */}
            {review.id_status === 4 && (
              <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-purple-500 text-xl">🗳️</span>
                  <h2 className="text-white text-lg font-bold">Votación de Evaluación</h2>
                </div>

                {userVote !== null ? (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 mb-4">
                      <span className="text-green-400 text-xl">✓</span>
                      <span className="text-green-400 font-semibold">Ya has votado</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Tu voto: <span className="text-white font-semibold">{getStatusInfo(userVote).name}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      Votos registrados: {votes.length} / 3
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm mb-4">
                      Selecciona el resultado de la evaluación del producto:
                    </p>
                    
                    {/* Checkbox de aceptar condiciones */}
                    <div className="mb-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/30">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-2 border-blue-400 bg-transparent checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold mb-1">
                            Acepto las condiciones de votación
                          </p>
                          <p className="text-gray-400 text-xs">
                            Confirmo que he revisado el producto y mi voto refleja una evaluación objetiva basada en los criterios establecidos. Entiendo que este voto es definitivo y no puede ser modificado.
                          </p>
                        </div>
                      </label>
                    </div>
                    
                    <button
                      onClick={() => handleSubmitVote(1)}
                      disabled={submittingVote || !acceptedTerms}
                      className="w-full p-4 rounded-lg border-2 border-green-500/30 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div className="text-left flex-1">
                          <p className="text-white font-bold">Aceptado</p>
                          <p className="text-gray-400 text-xs">Se acepta el producto sin modificaciones</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSubmitVote(2)}
                      disabled={submittingVote || !acceptedTerms}
                      className="w-full p-4 rounded-lg border-2 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">❌</span>
                        <div className="text-left flex-1">
                          <p className="text-white font-bold">Rechazado</p>
                          <p className="text-gray-400 text-xs">Rechazado debido a errores graves</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSubmitVote(3)}
                      disabled={submittingVote || !acceptedTerms}
                      className="w-full p-4 rounded-lg border-2 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⏳</span>
                        <div className="text-left flex-1">
                          <p className="text-white font-bold">Pendiente</p>
                          <p className="text-gray-400 text-xs">Aceptado el producto de manera provisional</p>
                        </div>
                      </div>
                    </button>

                    <p className="text-gray-500 text-xs text-center mt-4">
                      Votos registrados: {votes.length} / 3
                    </p>
                  </div>
                )}

                {/* Lista de votos */}
                {votes.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h3 className="text-white text-sm font-bold mb-3">Votos Registrados:</h3>
                    <div className="space-y-2">
                      {votes.map((vote) => (
                        <div
                          key={vote.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#1a2332] border border-gray-700"
                        >
                          <span className="text-white text-sm capitalize">
                            {vote.employees?.name || 'Usuario'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(getStatusInfo(vote.id_status).color)}`}>
                            {getStatusInfo(vote.id_status).name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Participantes */}
          <div className="space-y-6">
            <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-blue-500 text-xl">👥</span>
                <h2 className="text-white text-lg font-bold">Participantes</h2>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No hay participantes asignados
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant) => {
                    if (!participant.employees || !participant.roles) return null
                    
                    return (
                      <div
                        key={participant.id}
                        className="p-4 rounded-lg bg-[#1a2332] border border-gray-700"
                      >
                        {/* Empleado */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {participant.employees.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate capitalize">
                              {participant.employees.name}
                            </p>
                            <p className="text-gray-400 text-xs truncate capitalize">
                              {participant.employees.professions?.name || 'Sin profesión'}
                            </p>
                          </div>
                        </div>

                        {/* Rol */}
                        <div className="pt-3 border-t border-gray-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-400 text-xs font-bold uppercase">
                              {participant.roles.name}
                            </span>
                          </div>
                          {participant.roles.description && (
                            <p className="text-gray-400 text-xs">
                              {participant.roles.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Reporte Final - Visible cuando existe */}
            {finalReport && (
              <div className="bg-[#111822] rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-green-500 text-xl">📄</span>
                  <h2 className="text-white text-lg font-bold">Reporte Final</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase">
                      ¿Qué fue lo que se revisó?
                    </label>
                    <p className="text-white mt-1">{finalReport.part}</p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase">
                      ¿Quién lo revisó?
                    </label>
                    <p className="text-white mt-1 capitalize">
                      {finalReport.employees?.name || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase">
                      Descubrimientos y Conclusiones
                    </label>
                    <p className="text-white mt-1 whitespace-pre-wrap">{finalReport.conclusions}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex items-center justify-start gap-3">
          {/* Botón para secretario - Completar reunión (solo si no tiene estado) */}
          {isSecretary && review.id_status === null && isToday(review.date) && (
            <button
              onClick={handleCompleteReview}
              disabled={completingReview}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completingReview ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Completando...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Dar por Terminada la Reunión</span>
                </>
              )}
            </button>
          )}
          
          {/* Botones para gerentes */}
          {user?.is_manager && (
            <>
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Editar Revisión</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <span>Eliminar Revisión</span>
              </button>
            </>
          )}
        </div>
      </main>

      {/* Modal de Confirmación de Eliminación */}
      {deleteModalOpen && review && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">Eliminar Revisión</h3>
                  <p className="text-gray-400 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-lg p-4 mb-6">
                <p className="text-white font-semibold mb-1">{review.title}</p>
                <p className="text-gray-400 text-sm">{review.description}</p>
              </div>

              <p className="text-gray-300 text-sm mb-6">
                ¿Estás seguro de que deseas eliminar esta revisión? Se eliminarán también todos los participantes asignados.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Eliminando...</span>
                    </>
                  ) : (
                    <>
                      <span>Eliminar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reporte de Reunión */}
      {reportModalOpen && review && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl">
                  📝
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">Reporte de Reunión</h3>
                  <p className="text-gray-400 text-sm">Completa el reporte antes de finalizar la reunión</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. ¿Qué fue lo que se revisó? */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    1. ¿Qué fue lo que se revisó?
                  </label>
                  <input
                    type="text"
                    value={reportData.part}
                    onChange={(e) => setReportData({ ...reportData, part: e.target.value })}
                    placeholder="Ej: Módulo de autenticación, Base de datos, etc."
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 2. ¿Quién lo revisó? */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    2. ¿Quién lo revisó?
                  </label>
                  <select
                    value={reportData.id_employee}
                    onChange={(e) => setReportData({ ...reportData, id_employee: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un revisor</option>
                    {participants
                      .filter((p) => {
                        const roleName = Array.isArray(p.roles)
                          ? p.roles[0]?.name
                          : p.roles?.name
                        return roleName?.toLowerCase() === 'revisor'
                      })
                      .map((p) => (
                        <option key={p.id} value={p.employees?.id}>
                          {p.employees?.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 3. ¿Cuáles fueron los descubrimientos y las conclusiones? */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">
                    3. ¿Cuáles fueron los descubrimientos y las conclusiones?
                  </label>
                  <textarea
                    value={reportData.conclusions}
                    onChange={(e) => setReportData({ ...reportData, conclusions: e.target.value })}
                    placeholder="Describe los hallazgos, problemas encontrados, recomendaciones y conclusiones de la revisión..."
                    rows={6}
                    className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setReportModalOpen(false)
                    setError(null)
                  }}
                  disabled={submittingReport}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={submittingReport || !reportData.part || !reportData.id_employee || !reportData.conclusions}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submittingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>Guardar y Finalizar Reunión</span>
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
