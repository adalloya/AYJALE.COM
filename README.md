# AyJale.com - Conectando Talento en México

AyJale es una plataforma moderna e inteligente para la búsqueda de empleo y el reclutamiento en México. Incorpora evaluaciones psicométricas avanzadas (modelo Big 5) e interactividad para conectar a los candidatos ideales con las mejores empresas.

---

## 🛠️ Stack Tecnológico (Tech Stack)

### 💻 Frontend (Cliente)
* **Framework:** React 19 + Vite (para compilación ultra rápida y HMR).
* **Estilos:** Tailwind CSS (diseño responsivo y moderno).
* **Enrutamiento:** React Router DOM (v7).
* **Iconografía:** Lucide React.
* **Gráficas y Reportes:** Recharts (para visualización de resultados psicométricos).

### ⚙️ Backend (Servidor de Evaluaciones)
* **Framework API:** FastAPI (Python 3.10+) - alto rendimiento y documentación interactiva automática.
* **ORM:** SQLAlchemy (v2).
* **Migraciones de DB:** Alembic.
* **Controlador de Base de Datos:** `psycopg2-binary` y `asyncpg`.
* **Motor Científico:** NumPy, Pandas y CatSim (para simulaciones de teoría de respuesta al ítem).

### 🗄️ Base de Datos, Autenticación y Seguridad
* **Proveedor:** **Supabase** (PostgreSQL administrado).
* **Autenticación:** Supabase Auth (Manejo de registros, inicios de sesión y recuperación de contraseña).
* **Seguridad:** Row Level Security (RLS) habilitada en PostgreSQL para proteger la información confidencial de candidatos y empresas.
* **Almacenamiento (Storage):** Buckets públicos en Supabase para almacenamiento de `avatars` (fotos de perfil), `cvs` (currículums) y `audio`.

---

## 📂 Estructura del Proyecto

* `./` -> Código fuente del frontend en React.
* `./src/components/` -> Componentes de UI reutilizables (filtros, chat, evaluaciones, layouts).
* `./src/pages/` -> Vistas principales de la app (Candidato, Empresa, Admin, Landing).
* `./backend/` -> Servidor API de FastAPI en Python.
* `./migration/` -> Scripts SQL de estructura para la base de datos (por ejemplo, [full_schema_migration.sql](file:///Users/adalloya/Desktop/APPS/TALENTOMX/migration/full_schema_migration.sql)).

---

## 🚀 Instalación y Configuración Local

### 1. Requisitos Previos
* Node.js (v18 o superior)
* Python (v3.10 o superior)

### 2. Configuración del Frontend
1. En la raíz del proyecto, instala las dependencias de Node:
   ```bash
   npm install
   ```
2. Crea un archivo `.env` en la raíz del proyecto con la URL y clave anon de tu proyecto de Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-larga...
   ```
3. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
   El sitio web estará disponible en: **`http://localhost:5173/`**

### 3. Configuración del Backend
1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. Crea e inicia un entorno virtual de Python:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Instala los requerimientos:
   ```bash
   pip install -r requirements.txt
   ```
4. Inicia el servidor de FastAPI:
   ```bash
   uvicorn app.main:app --reload
   ```
   La documentación interactiva de la API estará en `http://localhost:8000/docs`.

---

## 🗄️ Inicialización de Base de Datos (Supabase)

Si estás configurando una base de datos de Supabase desde cero:
1. Crea un nuevo proyecto en Supabase.
2. Ve al **SQL Editor** del panel de Supabase.
3. Copia y ejecuta el contenido del script de migración limpio ubicado en: [migration/full_schema_migration.sql](file:///Users/adalloya/Desktop/APPS/TALENTOMX/migration/full_schema_migration.sql).
4. Crea tres Buckets públicos en la sección de **Storage**: `avatars`, `cvs`, y `audio`.

---

## 🔑 Cuentas de Prueba para Desarrollo

El proyecto cuenta con cuentas semilla para pruebas locales. Todas usan la contraseña **`password123`**:

* **Super Administrador:**
  * **Email:** `test.admin@ayjale.com`
  * **Portal de Acceso:** `http://localhost:5173/admin-portal`
* **Empresa / Reclutador (Acme Corp):**
  * **Email:** `test.company@ayjale.com`
  * **Portal de Acceso:** `http://localhost:5173/login`
* **Candidato (Juan Pérez):**
  * **Email:** `test.candidate@ayjale.com`
  * **Portal de Acceso:** `http://localhost:5173/login`
