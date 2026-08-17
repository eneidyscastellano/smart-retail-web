# 🛒 Smart Retail — Sistema Agéntico de Gestión de Inventario

Sistema inteligente de gestión de inventario para retail colombiano que combina un dashboard web en tiempo real con un asistente de IA conversacional. La IA analiza velocidades de venta, predice agotamientos de stock y genera recomendaciones de reabastecimiento de forma autónoma.

---

## ✨ Características Principales

- 🔐 **Autenticación** con sesiones basadas en cookies (proxy de Next.js 16)
- 📦 **CRUD completo** de productos con validación Zod
- 🤖 **Asistente de IA agéntico** con streaming y herramientas MCP
- 📊 **Gráfico de ventas** de los últimos 7 días (Recharts)
- 🔔 **Notificaciones proactivas** de stock crítico (alertas flotantes automáticas)
- 💡 **Panel de recomendaciones** de IA con acciones de aprobar/rechazar
- 💰 **Precios en COP** (Pesos Colombianos)
- ✅ **Validación de datos** con Zod en Server Actions y API Routes

---

## 📐 Arquitectura del Sistema

```mermaid
graph TB
    subgraph Cliente["🖥️ Navegador"]
        Login[Página de Login]
        UI[Dashboard Next.js]
        Chat[Panel de Chat]
        Alerts[Notificaciones de Stock]
    end

    subgraph Frontend["⚡ smart-retail-web (Next.js 16)"]
        Proxy[proxy.ts - Autenticación]
        SC[Server Components]
        SA[Server Actions + Zod]
        API[API Routes + Zod]
        ChatRoute["/api/chat"]
    end

    subgraph MCP["🤖 smart-retail-mcp (MCP Server)"]
        Tools[Herramientas MCP]
        T1[get_current_stock]
        T2[get_sales_velocity]
        T3[create_ai_recommendation]
    end

    subgraph External["☁️ Servicios Externos"]
        DeepSeek[DeepSeek AI]
        DB[(PostgreSQL)]
    end

    Login -->|Credenciales| SA
    Proxy -->|Verifica cookie| SC
    UI -->|HTTP/RSC| SC
    UI -->|Form Submit| SA
    Chat -->|Stream| ChatRoute
    Alerts -->|Auto-detecta| SC

    SC -->|SQL| DB
    SA -->|SQL| DB
    API -->|SQL| DB

    ChatRoute -->|stdio| Tools
    ChatRoute -->|API| DeepSeek

    Tools --> T1
    Tools --> T2
    Tools --> T3

    T1 -->|SQL| DB
    T2 -->|SQL| DB
    T3 -->|SQL| DB

    DeepSeek -->|Tool Calls| ChatRoute
```

### Flujo de datos

1. **Autenticación**: El proxy (`proxy.ts`) intercepta cada request, verifica la cookie de sesión y redirige a `/login` si no hay sesión válida.
2. **Dashboard**: Los Server Components consultan PostgreSQL directamente y renderizan la tabla de inventario, gráfico de ventas, recomendaciones de IA y alertas de stock.
3. **Notificaciones**: El sistema detecta automáticamente productos con stock bajo/crítico y muestra un panel flotante con alertas categorizadas.
4. **CRUD de productos**: Los formularios usan Server Actions con validación Zod que ejecutan queries SQL y revalidan la página.
5. **Chat agéntico**: El usuario envía un mensaje → Next.js conecta vía stdio al servidor MCP → DeepSeek decide qué herramientas usar → MCP ejecuta queries → DeepSeek genera respuesta en streaming.

---

## 🗄️ Modelo de Datos

```mermaid
erDiagram
    categories {
        UUID id PK
        VARCHAR name
    }

    suppliers {
        UUID id PK
        VARCHAR name
        VARCHAR email
        INT lead_time_days
    }

    products {
        UUID id PK
        VARCHAR sku UK
        VARCHAR name
        UUID category_id FK
        UUID supplier_id FK
        DECIMAL price
        DECIMAL cost
        INT current_stock
        INT min_safety_stock
    }

    sales {
        UUID id PK
        TIMESTAMP sale_date
        DECIMAL total_amount
    }

    sale_items {
        UUID id PK
        UUID sale_id FK
        UUID product_id FK
        INT quantity
        DECIMAL unit_price
    }

    ai_recommendations {
        UUID id PK
        UUID product_id FK
        INT recommended_order_qty
        TEXT reason
        VARCHAR status
        TIMESTAMP created_at
    }

    chat_conversations {
        TEXT id PK
        TIMESTAMP created_at
    }

    chat_messages {
        UUID id PK
        TEXT conversation_id FK
        TEXT role
        TEXT content
        TIMESTAMP created_at
    }

    categories ||--o{ products : "tiene"
    suppliers ||--o{ products : "provee"
    products ||--o{ sale_items : "vendido en"
    products ||--o{ ai_recommendations : "recomendado"
    sales ||--o{ sale_items : "contiene"
    chat_conversations ||--o{ chat_messages : "tiene"
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- API Key de [DeepSeek](https://platform.deepseek.com/)

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd smart-retail
```

### 2. Configurar la base de datos

Crear una base de datos PostgreSQL y ejecutar el esquema (las tablas se crean según el modelo ER descrito arriba).

### 3. Configurar variables de entorno

**smart-retail-mcp/.env**
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/smart_retail
```

**smart-retail-web/.env.local**
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/smart_retail
DEEPSEEK_API_KEY=tu_api_key_aqui

# Autenticación (credenciales de demo)
AUTH_USER=admin
AUTH_PASSWORD=admin123
AUTH_SECRET=smart-retail-secret-key-change-in-production
```

### 4. Instalar dependencias

```bash
# Backend MCP
cd smart-retail-mcp
npm install

# Frontend Web
cd ../smart-retail-web
npm install
```

### 5. Sembrar datos de demostración

```bash
cd smart-retail-mcp
npm run seed
```

Esto inserta datos completos para una demo: 5 categorías, 4 proveedores, 15 productos (con stock variado), 13 ventas recientes, 32 items de venta, y 4 recomendaciones de IA pendientes.

### 6. Ejecutar en desarrollo

```bash
# Terminal 1: Frontend (el MCP se levanta automáticamente desde el chat)
cd smart-retail-web
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

**Credenciales de acceso:** `admin` / `admin123`

---

## 📁 Estructura del Proyecto

```
smart-retail/
├── smart-retail-mcp/              # Servidor MCP (herramientas de IA)
│   ├── src/
│   │   ├── index.ts               # Definición e implementación de herramientas MCP
│   │   ├── db.ts                  # Pool de conexión PostgreSQL
│   │   └── seed.ts               # Script de datos de demostración
│   ├── package.json
│   └── tsconfig.json
│
└── smart-retail-web/              # Aplicación Web (Next.js 16)
    ├── proxy.ts                   # 🔐 Proxy de autenticación (reemplaza middleware)
    ├── app/
    │   ├── page.tsx               # Dashboard principal (Server Component)
    │   ├── layout.tsx             # Layout raíz
    │   ├── actions.ts             # Server Actions (CRUD + validación Zod)
    │   ├── login/                 # 🔐 Página de inicio de sesión
    │   │   ├── page.tsx
    │   │   ├── LoginForm.tsx
    │   │   └── actions.ts
    │   ├── logout/
    │   │   └── actions.ts         # 🔐 Cerrar sesión
    │   └── api/
    │       ├── chat/route.ts      # Endpoint de chat streaming + MCP
    │       └── products/          # API REST de productos (con validación Zod)
    │           ├── route.ts              # GET + POST
    │           └── [id]/route.ts         # PUT + DELETE
    ├── components/
    │   ├── ChatPanel.tsx          # Chat conversacional con streaming
    │   ├── AddProductDialog.tsx   # Modal crear producto
    │   ├── EditProductDialog.tsx  # Modal editar producto
    │   ├── SalesChart.tsx         # Gráfico de barras (Recharts)
    │   ├── StockAlerts.tsx        # 🔔 Notificaciones flotantes de stock
    │   └── ui/                    # Componentes base (shadcn/base-ui)
    ├── lib/
    │   ├── db.ts                  # Pool de conexión PostgreSQL
    │   ├── auth.ts                # 🔐 Utilidades de autenticación
    │   ├── validations.ts         # ✅ Esquemas Zod
    │   ├── chat-store.ts          # Persistencia de historial de chat
    │   └── utils.ts               # cn() + formatCOP()
    ├── docs/
    │   ├── ARCHITECTURE.md        # Diagramas detallados
    │   └── INFORME_PROYECTO.md    # Informe académico
    ├── smart_retail_postman.json  # Colección Postman
    └── package.json
```

---

## 🔐 Autenticación

Sistema de autenticación basado en sesiones con cookies:

| Componente | Función |
|------------|---------|
| `proxy.ts` | Intercepta requests, verifica cookie, redirige a `/login` si no hay sesión |
| `lib/auth.ts` | Crear/verificar/destruir sesiones, validar credenciales |
| `/login` | Página de inicio de sesión con manejo de errores |
| Botón "Cerrar Sesión" | En la barra superior del dashboard |

**Seguridad aplicada:**
- Cookie `httpOnly` (no accesible desde JavaScript del cliente)
- Cookie `secure` en producción (solo HTTPS)
- Token con timestamp para expiración automática (24 horas)
- Credenciales configurables vía variables de entorno

---

## 🔔 Notificaciones Proactivas de Stock

El sistema alerta automáticamente cuando detecta productos en riesgo:

| Severidad | Condición | Indicador |
|-----------|-----------|-----------|
| 🔴 Crítico | Stock = 0 | Panel se abre automáticamente |
| 🟡 Warning | Stock < mínimo de seguridad | Botón animado en esquina |

- Se muestran como panel flotante en la esquina inferior derecha
- Descartables individualmente o en grupo
- Persisten en localStorage para no molestar en la misma sesión

---

## ✅ Validación con Zod

Todos los endpoints y Server Actions validan datos de entrada:

```typescript
// Ejemplo: createProductSchema
z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  price: z.number().min(0),
  cost: z.number().min(0),
  current_stock: z.number().int().min(0),
  category_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
})
```

Previene: NaN, strings vacíos, UUIDs inválidos, números negativos.

---

## 🤖 Herramientas MCP (Model Context Protocol)

El servidor MCP expone 3 herramientas que la IA puede invocar de forma autónoma:

| Herramienta | Descripción | Parámetros |
|-------------|-------------|------------|
| `get_current_stock` | Inventario actual de todos los productos con tiempos de entrega del proveedor | Ninguno |
| `get_sales_velocity` | Velocidad promedio de ventas diarias por producto en los últimos N días | `days: number` |
| `create_ai_recommendation` | Crea una alerta de reabastecimiento cuando detecta riesgo de agotamiento | `product_id`, `recommended_order_qty`, `reason` |

---

## 🔌 API REST

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar todos los productos |
| POST | `/api/products` | Crear un producto (con validación) |
| PUT | `/api/products/:id` | Actualizar un producto parcialmente (con validación) |
| DELETE | `/api/products/:id` | Eliminar un producto |

### Chat

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/chat?conversationId=xxx` | Recuperar historial de conversación |
| POST | `/api/chat` | Enviar mensaje y recibir respuesta en streaming |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js (App Router) | 16.3.1 |
| UI | React + Base UI + Tailwind CSS | 19.2.8 |
| Gráficos | Recharts | 3.x |
| Validación | Zod | 4.x |
| IA (LLM) | DeepSeek via Vercel AI SDK | 7.x |
| Protocolo IA | Model Context Protocol (MCP) | 1.30.0 |
| Base de datos | PostgreSQL | 14+ |
| Lenguaje | TypeScript | 5.x / 7.x |
| Runtime | Node.js | 18+ |

---

## 🎮 Datos de Demostración

El script `npm run seed` (en smart-retail-mcp) inserta:

| Entidad | Cantidad | Detalle |
|---------|----------|---------|
| Categorías | 5 | Ropa Invierno, Verano, Calzado, Accesorios, Deportes |
| Proveedores | 4 | Lead times: 3, 5, 7 y 21 días |
| Productos | 15 | 2 críticos (stock 0), 4 stock bajo, 9 óptimos |
| Ventas | 13 | Últimos 7 días con montos variados |
| Items de venta | 32 | Movimiento en casi todos los productos |
| Recomendaciones IA | 4 | Pendientes con razones detalladas |

---

## 💰 Formato de Moneda

Todos los precios se expresan en **Pesos Colombianos (COP)** usando `Intl.NumberFormat('es-CO')`. Ejemplo: `$189.900`.

---

## 📋 Colección Postman

Disponible en `smart_retail_postman.json` con todos los endpoints organizados por carpetas (Productos y Chat).

---

## 📄 Licencia

ISC
