# Sistema de Ventas

Sistema de gestión de ventas con Django (backend) y React (frontend).

## Requisitos previos

Instala esto antes de continuar:

- [Python 3.12](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Git](https://git-scm.com/)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd sistema_de_ventas
```

### 2. Backend (Django)

```bash
cd backend
python -m venv .venv
```

**Windows:**
```bash
.venv\Scripts\activate
```

**Mac / Linux:**
```bash
source .venv/bin/activate
```

Instalar dependencias y arrancar:
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

El backend queda corriendo en: `http://127.0.0.1:8000`

### 3. Frontend (React)

Abre una terminal nueva:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda corriendo en: `http://localhost:5173`

---

## Primer uso

Crea un superusuario para entrar al sistema:

```bash
cd backend
python manage.py createsuperuser
```

---

## Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

> Si no tienes `.env.example`, pídele al dueño del proyecto el archivo `.env`.

---

## Estructura del proyecto

```
sistema_de_ventas/
├── backend/          # API Django REST Framework
│   ├── config/       # Configuración principal
│   ├── user/         # Gestión de usuarios
│   └── ...
└── frontend/         # Interfaz React + Vite
    └── src/
        ├── pages/
        ├── components/
        └── ...
```