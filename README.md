# 🏗️ ObraControl - Control de Gastos de Construcción (Casa)

Una aplicación web moderna, minimalista y responsiva (**Mobile-First**) diseñada para el control financiero ágil de la construcción de una casa o proyecto de obra.

---

## ✨ Características Principales

### 1. 🎨 Estética & Diseño (Dark Glassmorphic UI)
- **Fondo Base:** Slate oscuro profundo (`#04060B`) con gradientes radiales de iluminación ambiental.
- **Glassmorphism Avanzado:** Contenedores y tarjetas con `backdrop-filter: blur(20px)`, bordes sutiles y esquinas redondeadas de 20px (`rounded-2xl`).
- **Acentos Cromáticos:** Neón cian (`#00D2FF`) y azul eléctrico (`#0066FF`) para llamadas a la acción, microinteracciones y estados activos.
- **Microinteracciones y Movimiento:** Transiciones fluidas tipo resorte (*spring physics*), aceleración por hardware (`will-change`, `transform: translateZ(0)`) y efectos sonoros / haptic táctiles en registro.

### 2. ⚡ Flujo 1: Registro Rápido en Obra
- **Selector de Categorías con Íconos y Badges:**
  - 🧱 **Materiales:** Cemento, arena, varilla, ladrillo, tubería, etc.
  - 👷 **Mano de Obra:** Pago semanal de maestro, ayudantes, jornales o contratistas.
  - 🔨 **Herramientas & Equipos:** Alquiler de mezcladora, andamios, discos de corte, palas.
  - 📦 **Gastos Varios:** Transporte, fletes, servicios provisionales, permisos y alimentación.
- **Sugerencias Rápidas:** Chips de autocompletado para ítems frecuentes en obra.
- **Cálculo Automático en Tiempo Real:** Multiplica la cantidad por el costo unitario instantáneamente y lo muestra en un display neón cian.
- **Persistencia Local:** Todos los datos se almacenan de inmediato en `localStorage`.
- **Vista de Recientes:** Muestra los últimos gastos agregados para confirmación inmediata sin salir del flujo rápido.

### 3. 🔐 Flujo 2: Sistema de Autenticación
- Acceso exclusivo para administradores mediante login protegido con credenciales seguras.
- **Credenciales por Defecto:**
  - **Usuario:** `admin`
  - **Contraseña:** `cotorra2026`
- **Protección de Rutas:** Si un usuario intenta ingresar al panel sin autenticarse, es redirigido automáticamente a la pantalla de login.

### 4. 📊 Flujo 3: Panel Administrativo (Dashboard de Control)
- **KPIs en Tiempo Real:**
  - Inversión Total Acumulada.
  - Total invertido en Materiales (% del total).
  - Total invertido en Mano de Obra (% del total).
  - Total invertido en Herramientas (% del total).
  - Total invertido en Gastos Varios (% del total).
- **Gráfico de Dona SVG & Barra de Distribución:** Visualización gráfica del presupuesto por categoría con conteo de registros.
- **Búsqueda Instantánea & Filtros:** Filtrado reactivo por texto (descripción, proveedor, fecha) y por categoría.
- **Gestión Completa (CRUD):**
  - Edición de registros con modal interactivo y recalculo automático.
  - Eliminación con modal de confirmación fluido.
- **Exportación Profesional a Excel (.xlsx):**
  - Integrado con la librería **SheetJS (`xlsx`)** localmente.
  - Genera un archivo `.xlsx` estructurado con columnas formateadas, anchos automáticos y fila de **Total General**.
- **Cierre de Sesión Seguro:** Botón para retornar al modo público o de registro rápido.

---

## 🚀 Estructura del Proyecto

```
GASTOS-CASA-/
├── index.html          # Estructura Mobile-First semántica
├── css/
│   └── styles.css      # Sistema de diseño Glassmorphic oscuro con animaciones spring
├── js/
│   ├── app.js          # Lógica de negocio, estado, KPIs, filtros y autenticación
│   └── xlsx.full.min.js# Librería SheetJS para exportación local a Excel sin conexión
└── README.md           # Documentación del proyecto
```

---

## 💻 Cómo Ejecutar la Aplicación

Al ser una aplicación web estática y autosuficiente (sin necesidad de compiladores ni Node.js en producción):

1. **Directamente en el navegador:**
   Haz doble clic sobre `index.html` para abrirlo en cualquier navegador web moderno (Chrome, Safari, Edge, Firefox).

2. **Con un servidor local de desarrollo (opcional):**
   ```bash
   # Con Python
   python3 -m http.server 8080

   # O con Node.js / npx
   npx serve .
   ```

3. **Despliegue en GitHub Pages / Vercel / Netlify:**
   Simplemente sube la carpeta al repositorio y activa GitHub Pages en la rama principal (`main`).
