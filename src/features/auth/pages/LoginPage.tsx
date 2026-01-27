import { useAuth } from '../hooks/useAuthContext'
import { LoginForm } from '../components/LoginForm'

export const LoginPage = () => {
  const { login, loading, error } = useAuth()

  return (
    <div className="min-h-screen bg-[#101822] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 bg-[#101822] px-6 md:px-10 py-3 z-10">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 text-blue-600">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path 
                clipRule="evenodd" 
                d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" 
                fill="currentColor" 
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Revisión Técnica Formal
          </h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Hero Section */}
        <div className="hidden md:flex flex-1 bg-blue-600 relative items-center justify-center p-12 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white blur-[100px]"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-lg text-white">
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Gestiona tus revisiones técnicas de forma eficiente y profesional.
            </h2>
            <p className="text-xl opacity-90 mb-8 leading-relaxed text-slate-100">
              Sistema integral para la gestión de revisiones técnicas formales, seguimiento de proyectos y evaluación de calidad de productos de software.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span className="text-lg">Programación y Seguimiento de Revisiones</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span className="text-lg">Gestión de Temas y Actas de Reunión</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span className="text-lg">Sistema de Votación y Evaluación</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✓</span>
                <span className="text-lg">Reportes Detallados y Conclusiones</span>
              </div>
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-blue-600 to-blue-600"></div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-[#101822]">
          <LoginForm 
            onSubmit={login}
            loading={loading}
            error={error}
          />

          {/* Footer */}
          <footer className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-gray-600">
            <span>© 2024 Revisión Técnica Formal</span>
          </footer>
        </div>
      </main>
    </div>
  )
}
