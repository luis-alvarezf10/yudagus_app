/**
 * Formatea una fecha en formato YYYY-MM-DD a un string legible
 * sin problemas de zona horaria
 */
export const formatDate = (dateString: string, locale: string = 'es-ES'): string => {
  // Dividir la fecha en partes para evitar problemas de zona horaria
  const [year, month, day] = dateString.split('-').map(Number)
  
  // Crear fecha en zona horaria local
  const date = new Date(year, month - 1, day)
  
  return date.toLocaleDateString(locale)
}

/**
 * Formatea una fecha con opciones personalizadas
 */
export const formatDateWithOptions = (
  dateString: string, 
  locale: string = 'es-ES',
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  
  return date.toLocaleDateString(locale, options)
}
