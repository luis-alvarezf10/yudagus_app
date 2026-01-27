import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  name: string
  created_at: string
}

export const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)
  const [editClientName, setEditClientName] = useState('')
  const [updating, setUpdating] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [relatedProjectsCount, setRelatedProjectsCount] = useState(0)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      console.error('Error al cargar clientes:', err)
      setError('No se pudieron cargar los clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation()
    setClientToEdit(client)
    setEditClientName(client.name)
    setEditModalOpen(true)
  }

  const handleDeleteClick = async (e: React.MouseEvent, client: Client) => {
    e.stopPropagation()
    
    // Contar proyectos relacionados
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('id_client', client.id)

    setRelatedProjectsCount(count || 0)
    setClientToDelete(client)
    setDeleteModalOpen(true)
  }

  const handleEditCancel = () => {
    setEditModalOpen(false)
    setClientToEdit(null)
    setEditClientName('')
    setEditError(null)
  }

  const handleEditConfirm = async () => {
    if (!clientToEdit || !editClientName.trim()) return

    try {
      setUpdating(true)
      setEditError(null)

      const { error: updateError } = await supabase
        .from('clients')
        .update({ name: editClientName.trim() })
        .eq('id', clientToEdit.id)

      if (updateError) throw updateError

      // Actualizar la lista
      setClients(clients.map(c => 
        c.id === clientToEdit.id 
          ? { ...c, name: editClientName.trim() }
          : c
      ))

      setEditModalOpen(false)
      setClientToEdit(null)
      setEditClientName('')
    } catch (err) {
      console.error('Error al actualizar cliente:', err)
      setEditError('No se pudo actualizar el cliente')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setClientToDelete(null)
    setRelatedProjectsCount(0)
  }

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return

    try {
      setDeleting(true)

      // Obtener todos los proyectos del cliente
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('id_client', clientToDelete.id)

      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id)

        // Obtener todas las revisiones de esos proyectos
        const { data: reviews } = await supabase
          .from('reviews')
          .select('id')
          .in('id_project', projectIds)

        if (reviews && reviews.length > 0) {
          const reviewIds = reviews.map(r => r.id)

          // Eliminar participantes de las revisiones
          const { error: participantsError } = await supabase
            .from('participants')
            .delete()
            .in('id_review', reviewIds)

          if (participantsError) throw participantsError

          // Eliminar las revisiones
          const { error: reviewsError } = await supabase
            .from('reviews')
            .delete()
            .in('id_project', projectIds)

          if (reviewsError) throw reviewsError
        }

        // Eliminar los proyectos
        const { error: projectsError } = await supabase
          .from('projects')
          .delete()
          .eq('id_client', clientToDelete.id)

        if (projectsError) throw projectsError
      }

      // Finalmente eliminar el cliente
      const { error: clientError } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientToDelete.id)

      if (clientError) throw clientError

      // Actualizar la lista
      setClients(clients.filter(c => c.id !== clientToDelete.id))
      setDeleteModalOpen(false)
      setClientToDelete(null)
      setRelatedProjectsCount(0)
    } catch (err) {
      console.error('Error al eliminar cliente:', err)
      setError('No se pudo eliminar el cliente')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold mb-2">Clientes</h1>
          <p className="text-gray-400 text-sm">Gestiona todos los clientes de la empresa</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
          <span className="text-lg">+</span>
          <span>Crear Cliente</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Cargando clientes...
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <span className="text-6xl mb-4 block">👥</span>
          <p>No hay clientes registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-[#111822] rounded-xl border border-gray-800 p-6 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-1 truncate capitalize">{client.name}</h3>
                  <p className="text-gray-500 text-xs mt-2">
                    Registrado: {new Date(client.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={(e) => handleEditClick(e, client)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Editar</span>
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, client)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edición */}
      {editModalOpen && clientToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-2xl">
                  ✏️
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">Editar Cliente</h3>
                  <p className="text-gray-400 text-sm">Modifica el nombre del cliente</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#1a2332] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente"
                />
              </div>

              {editError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleEditCancel}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditConfirm}
                  disabled={updating || !editClientName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
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

      {/* Modal de Confirmación de Eliminación */}
      {deleteModalOpen && clientToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111822] rounded-xl border border-gray-800 w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">Eliminar Cliente</h3>
                  <p className="text-gray-400 text-sm">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-lg p-4 mb-6">
                <p className="text-white font-semibold mb-1 capitalize">{clientToDelete.name}</p>
                <p className="text-gray-400 text-sm">
                  Registrado el {new Date(clientToDelete.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>

              <p className="text-gray-300 text-sm mb-6">
                ¿Estás seguro de que deseas eliminar este cliente?
                {relatedProjectsCount > 0 && (
                  <span className="text-amber-400 block mt-2">
                    ⚠️ Se eliminarán {relatedProjectsCount} proyecto(s) relacionado(s) y todas sus revisiones.
                  </span>
                )}
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
    </div>
  )
}
