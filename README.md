# Yudagus App

Aplicación de gestión de revisiones de desempeño construida con React, TypeScript, Vite y Supabase.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

### Node.js
- **Versión requerida:** Node.js 18.x o superior
- **Descargar:** [https://nodejs.org/](https://nodejs.org/)
- **Verificar instalación:**
  ```bash
  node --version
  ```

### pnpm (Gestor de paquetes)
Este proyecto utiliza **pnpm** como gestor de paquetes.

- **Instalar pnpm globalmente:**
  ```bash
  npm install -g pnpm
  ```
- **Verificar instalación:**
  ```bash
  pnpm --version
  ```

> **Nota:** También puedes usar npm o yarn, pero se recomienda pnpm para mantener consistencia con el proyecto.

## 🚀 Instalación

Sigue estos pasos para configurar el proyecto en tu máquina local:

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd yudagus_app
```

### 2. Instalar dependencias
```bash
pnpm install
```

Este comando instalará todas las dependencias necesarias:
- **React 19.2.0** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS 4.x** - Framework de CSS
- **React Router DOM** - Enrutamiento
- **Supabase** - Backend y base de datos

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

> **Importante:** Solicita estas credenciales al administrador del proyecto o configura tu propio proyecto en [Supabase](https://supabase.com/).

## 🏃‍♂️ Ejecutar el Proyecto

### Modo Desarrollo
Inicia el servidor de desarrollo con hot-reload:
```bash
pnpm dev
```

La aplicación estará disponible en: **http://localhost:5173**

## 🛠️ Tecnologías Utilizadas

- **React 19.2.0** - Biblioteca de interfaz de usuario
- **TypeScript 5.9.3** - Superset de JavaScript con tipado estático
- **Vite 7.2.4** - Build tool de nueva generación
- **Tailwind CSS 4.1.18** - Framework de CSS utility-first
- **React Router DOM 7.12.0** - Enrutamiento para React
- **Supabase 2.90.1** - Backend as a Service (autenticación, base de datos)
- **ESLint** - Linter para mantener calidad de código

## 📁 Estructura del Proyecto

```
yudagus_app/
├── src/
│   ├── features/          # Módulos por funcionalidad
│   │   ├── auth/          # Autenticación
│   │   ├── dashboard/     # Dashboard
│   │   ├── reviews/       # Gestión de revisiones
│   │   └── users/         # Gestión de usuarios
│   ├── lib/               # Configuraciones y utilidades
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Punto de entrada
├── public/                # Archivos estáticos
├── .env.local            # Variables de entorno (no incluido en git)
└── package.json          # Dependencias y scripts
```

## 🤝 Contribuir

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y haz commit: `git commit -m 'Añadir nueva funcionalidad'`
3. Sube los cambios: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

## 📝 Notas Adicionales

- El proyecto usa **React 19** con las últimas características
- **Tailwind CSS 4** está configurado con el plugin de Vit

## ❓ Solución de Problemas

### Error: "Cannot find module"
```bash
# Limpia node_modules e instala de nuevo
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error con variables de entorno
- Verifica que el archivo `.env.local` existe
- Asegúrate de que las variables empiezan con `VITE_`
- Reinicia el servidor de desarrollo después de cambiar variables
