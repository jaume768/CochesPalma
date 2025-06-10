# Concesionario Web - .reliable.

Aplicación web completa para un concesionario de vehículos con búsqueda inteligente impulsada por IA, construida con una arquitectura moderna basada en microservicios desplegada con Docker.

## 🚀 Características Principales

- **Frontend Next.js** con diseño moderno y responsive
- **API REST Node.js** con Express
- **Base de datos MySQL** con estructura relacional optimizada
- **Búsqueda Inteligente** con procesamiento de lenguaje natural
- **Scraping automatizado** para mantener el inventario actualizado
- **Arquitectura de microservicios** con Docker Compose
- **Modelo MVC** en el backend para mejor mantenibilidad
- **Interfaz de usuario intuitiva** con animaciones y efectos visuales

## 📊 Funcionalidades

### Para Clientes
- **Búsqueda Inteligente**: Interpreta consultas en lenguaje natural como "quiero un coche rojo diesel por menos de 20000€"
- **Filtrado Avanzado**: Filtros por combustible, carrocería y más
- **Visualización de Vehículos**: Galerías de imágenes con información detallada de cada vehículo
- **Formulario de Contacto**: Para solicitar más información sobre vehículos específicos
- **Solicitudes de Alquiler**: Sección dedicada para alquilar vehículos

### Para Vendedores
- **Formulario de Venta**: Página para que los usuarios vendan sus vehículos
- **Gestión de Inventario**: Administración completa de vehículos (a través del backend)
- **Panel de Control**: Análisis y métricas (pendiente de implementación)

## 🏗️ Arquitectura

El proyecto está estructurado en cuatro servicios principales:

1. **Frontend (Next.js)**
   - Framework React con Server-Side Rendering
   - Componentes modulares y reutilizables
   - Optimización SEO con metadatos dinámicos
   - Routing y navegación optimizados

2. **API Backend (Node.js + Express)**
   - Arquitectura MVC 
   - Controladores especializados
   - Middleware de autenticación y seguridad
   - Integración con servicios de IA para búsquedas inteligentes

3. **Base de Datos (MySQL)**
   - Esquema optimizado para concesionarios
   - Relaciones entre vehículos, características, imágenes
   - Inicialización automática con scripts predefinidos

4. **Scripts Automatizados**
   - Scraping de datos de vehículos
   - Actualización periódica de inventario
   - Sincronización con la base de datos

## 🔧 Requisitos Previos

- Docker y Docker Compose
- Git

## 💻 Instalación y Despliegue Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/jaume768/CochesPalma.git
cd CochessPalma
```

2. **Desplegar con Docker Compose**
**Nota:** configura el .env del api-nodejs con la key de open ai antes de hacer el build
```bash
docker-compose up --build
```

3. **Acceder a la aplicación**
- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)
- PHPMyAdmin: [http://localhost:8080](http://localhost:8080)

## 🛠️ Desarrollo Local

Para desarrollo local, puedes ejecutar cada servicio por separado:

### Frontend (Next.js)
```bash
cd frontend-nextjs
npm install
npm run dev
```

### API Backend
```bash
cd api-nodejs
npm install
npm run dev
```

### Base de Datos
El modo más sencillo es usar Docker solo para la base de datos:
```bash
docker-compose up mysql phpmyadmin
```

## 🔄 Flujo de Datos

El sistema funciona de la siguiente manera:

1. Los scripts de scraping recolectan datos de vehículos automáticamente
2. Los datos se almacenan en la base de datos MySQL 
3. La API procesa y sirve estos datos al frontend
4. El frontend muestra la información con una interfaz atractiva
5. La búsqueda inteligente traduce consultas de lenguaje natural a filtros de base de datos

## 🔍 Búsqueda con IA

La característica distintiva del proyecto es su motor de búsqueda inteligente:

- **Análisis de Consultas**: Procesa y entiende consultas como "quiero un coche azul con menos de 50.000km"
- **Generación de SQL**: Convierte lenguaje natural en consultas SQL estructuradas
- **Respaldo Convencional**: Si la IA no puede procesar la consulta, se utiliza búsqueda convencional
- **Mejora Continua**: El sistema aprende de las consultas para mejorar resultados futuros

## 📂 Estructura de Directorios

```
/
├── frontend-nextjs/        # Aplicación Next.js
│   ├── app/                # Componentes y páginas
│   ├── public/             # Archivos estáticos
│   └── Dockerfile          # Configuración para Docker
├── api-nodejs/             # Backend API
│   ├── controllers/        # Controladores MVC
│   ├── models/             # Modelos de datos
│   ├── routes/             # Rutas de la API
│   ├── scripts/            # Scripts de scraping
│   └── Dockerfile          # Configuración para Docker
├── docker-compose.yml      # Configuración de Docker Compose
└── README.md               # Este archivo
```

## 👥 Acceso a PHPMyAdmin

Para gestionar la base de datos visualmente:
- **URL**: [http://localhost:8080](http://localhost:8080)
- **Usuario**: concesionario_user
- **Contraseña**: concesionario_pass

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

---

Desarrollado con ❤️ por [Jaume768](https://github.com/jaume768)
