# 📊 Guía de Presentación — Smart Retail

## Contenido por Diapositiva

---

## DIAPOSITIVA 1: Portada

**Título:** Smart Retail — Sistema Agéntico de Gestión de Inventario con IA

**Subtítulo:** Proyecto Final — [Nombre del Programa]

**Datos:**
- Autor: [Tu nombre]
- Instituto: [Nombre del instituto]
- Fecha: Agosto 2026

**Visual:** Logo del proyecto (icono Package en cuadrado oscuro con gradiente)

---

## DIAPOSITIVA 2: Agenda

1. Problema
2. Solución propuesta
3. Arquitectura del sistema
4. Demostración en vivo
5. Stack tecnológico
6. Funcionalidades clave
7. Modelo de datos
8. IA Agéntica y MCP
9. Métricas del proyecto
10. Conclusiones

---

## DIAPOSITIVA 3: El Problema

**Título:** ¿Qué problema resuelve Smart Retail?

**Puntos clave (con iconos):**

- 📉 **Quiebre de stock** — Productos se agotan sin que nadie lo detecte a tiempo
- 💰 **Pérdida de ventas** — Clientes encuentran estantes vacíos y se van
- ⏰ **Decisiones reactivas** — Se actúa cuando ya es tarde, no preventivamente
- 📊 **Sin analítica accesible** — Herramientas predictivas son costosas y complejas

**Dato:** El quiebre de stock representa pérdidas del 4-8% en ventas anuales para retail en Colombia.

---

## DIAPOSITIVA 4: La Solución

**Título:** Smart Retail — Gestión Inteligente de Inventario

**Propuesta de valor (3 pilares):**

| Pilar | Qué hace |
|-------|----------|
| 📦 Gestión | CRUD de productos con dashboard visual y métricas en tiempo real |
| 🤖 IA Agéntica | Asistente que analiza, predice y actúa de forma autónoma |
| 🔔 Alertas | Notificaciones proactivas antes de que el problema ocurra |

**Frase resumen:** "De gestión reactiva a inteligencia preventiva"

---

## DIAPOSITIVA 5: Arquitectura General

**Título:** Arquitectura del Sistema

**Diagrama (usar el Mermaid del README o recrear como imagen):**

```
[Navegador] → [Next.js 16 (Frontend + API)] → [PostgreSQL]
                    ↕                              ↑
              [DeepSeek AI] ← stdio → [MCP Server] ─┘
```

**Componentes:**
- **Frontend:** Next.js 16 con React Server Components
- **Backend IA:** Servidor MCP con herramientas predictivas
- **LLM:** DeepSeek Chat (razonamiento y decisiones)
- **Base de datos:** PostgreSQL (datos del negocio)

---

## DIAPOSITIVA 6: Demo en Vivo

**Título:** Demostración

**Flujo a mostrar (guion):**

1. Abrir `localhost:3000` → mostrar página de login
2. Ingresar credenciales → dashboard se carga
3. Señalar los 4 KPIs (ventas, margen, inventario, riesgo)
4. Mostrar notificaciones flotantes de stock crítico
5. Navegar al gráfico de ventas y top productos
6. Mostrar recomendaciones de la IA → aprobar una
7. Cambiar a tab "Inventario" → tabla con 15 productos
8. Editar un producto → mostrar validación
9. Abrir el chat → preguntar "¿Qué productos se agotarán pronto?"
10. Mostrar cómo la IA usa herramientas y responde con tabla formateada

**Tiempo sugerido:** 3-5 minutos

---

## DIAPOSITIVA 7: Stack Tecnológico

**Título:** Tecnologías Utilizadas

**Layout: Iconos/logos en grid**

| Categoría | Tecnología | Para qué |
|-----------|-----------|----------|
| Frontend | Next.js 16 | Renderizado servidor + App Router |
| UI | React 19 + Tailwind CSS | Componentes + estilos |
| Gráficos | Recharts | Visualización de datos |
| IA | DeepSeek + Vercel AI SDK | LLM + streaming |
| Protocolo IA | MCP (Model Context Protocol) | Conexión IA ↔ datos |
| Base de datos | PostgreSQL | Almacenamiento |
| Validación | Zod | Integridad de datos |
| Testing | Vitest | Pruebas automatizadas |
| Lenguaje | TypeScript | Tipado estático |

---

## DIAPOSITIVA 8: Funcionalidades — Dashboard

**Título:** Dashboard de Métricas

**Captura de pantalla del dashboard con anotaciones:**

- 4 KPIs con gradientes de color (ventas, margen, inventario, riesgo)
- Gráfico de tendencia de ventas (7 días, formato $COP)
- Top 5 productos más vendidos (barras horizontales con colores)
- Margen de ganancia por categoría

---

## DIAPOSITIVA 9: Funcionalidades — Inventario

**Título:** Gestión de Inventario

**Captura + bullets:**

- Tabla responsive con 15 productos
- Columnas: SKU, Producto, Precio (COP), Stock, Estado
- Acciones: Editar (modal con formulario) / Eliminar
- Validación Zod en tiempo real
- Badge de estado: Óptimo / Stock Bajo / Agotado
- Botón "Nuevo Producto" con formulario completo

---

## DIAPOSITIVA 10: Funcionalidades — IA Agéntica

**Título:** Asistente de IA con Capacidades Autónomas

**Diferencia clave con un chatbot normal:**

| Chatbot normal | Smart Retail AI |
|----------------|-----------------|
| Responde con texto genérico | Consulta datos reales de la DB |
| No ejecuta acciones | Crea alertas automáticamente |
| Sin contexto del negocio | Conoce stock, ventas, proveedores |
| Respuesta estática | Razona en pasos (hasta 5 iteraciones) |

**Herramientas disponibles:**
1. `get_current_stock` — Consulta inventario
2. `get_sales_velocity` — Calcula predicciones
3. `create_ai_recommendation` — Crea alertas

---

## DIAPOSITIVA 11: ¿Qué es MCP?

**Título:** Model Context Protocol — El puente entre la IA y los datos

**Analogía:** MCP es como un "USB-C para la IA" — una interfaz estándar para conectar cualquier modelo a cualquier fuente de datos.

**Flujo visual:**

```
Usuario pregunta → LLM razona → Decide herramienta → MCP ejecuta → DB responde → LLM responde al usuario
```

**Beneficios:**
- Protocolo abierto y estándar
- Desacopla IA del acceso a datos
- Agregar herramientas sin tocar el frontend
- Cualquier LLM puede usar las mismas herramientas

---

## DIAPOSITIVA 12: Seguridad

**Título:** Autenticación y Validación

**Dos capas:**

| Capa | Implementación |
|------|----------------|
| 🔐 Autenticación | Sesiones con cookie httpOnly + proxy Next.js 16 |
| ✅ Validación | Zod en todas las entradas (Server Actions + API) |

**Qué se protege:**
- Todas las rutas requieren sesión activa
- Cookies expiran en 24 horas
- UUIDs validados antes de consultar DB
- NaN, strings vacíos y negativos rechazados

---

## DIAPOSITIVA 13: Notificaciones Proactivas

**Título:** Alertas Automáticas de Stock

**Captura de las notificaciones flotantes + explicación:**

- 🔴 **Crítico (stock = 0):** Panel se abre automáticamente
- 🟡 **Warning (stock < mínimo):** Botón animado visible
- Descartables individualmente
- No requiere acción del usuario para activarse

**Impacto:** El administrador se entera del riesgo al instante, antes de abrir cualquier reporte.

---

## DIAPOSITIVA 14: Modelo de Datos

**Título:** Base de Datos — 8 Tablas Relacionales

**Diagrama ER simplificado (imagen del Mermaid):**

- `categories` → `products` → `sale_items` ← `sales`
- `suppliers` → `products` → `ai_recommendations`
- `chat_conversations` → `chat_messages`

**Moneda:** Todos los valores en COP (Pesos Colombianos)

---

## DIAPOSITIVA 15: Testing

**Título:** Calidad del Código

**Métricas:**

| Tipo | Cantidad | Framework |
|------|----------|-----------|
| Pruebas unitarias | 42 | Vitest |
| Pruebas de integración | 10 | Vitest + MCP SDK |
| **Total** | **52** | — |

**Qué se testea:**
- Esquemas de validación Zod (21 tests)
- Formato de moneda COP (5 tests)
- Autenticación (7 tests)
- Parser de Markdown (9 tests)
- Herramientas MCP reales contra DB (10 tests)

---

## DIAPOSITIVA 16: Diseño Responsive

**Título:** Adaptable a Cualquier Pantalla

**Dos capturas lado a lado:**

| Desktop (≥1280px) | Portátil (<1280px) |
|---|---|
| Dashboard + Chat lateral | Contenido full + Chat flotante |
| Tabla con todas las columnas | Columnas ocultas (Costo, Margen) |

---

## DIAPOSITIVA 17: Métricas del Proyecto

**Título:** El Proyecto en Números

| Métrica | Valor |
|---------|-------|
| Archivos fuente | ~35 |
| Líneas de código | ~2,500 |
| Componentes React | 12 |
| Server Actions | 6 |
| Endpoints REST | 6 |
| Herramientas MCP | 3 |
| Esquemas de validación | 4 |
| Pruebas automatizadas | 52 |
| Errores de compilación | 0 |

---

## DIAPOSITIVA 18: Conclusiones

**Título:** Lo que demostramos

1. **IA agéntica es viable** para retail colombiano con tecnologías accesibles
2. **MCP estandariza** la conexión entre IA y datos sin acoplamiento
3. **Next.js 16** simplifica la arquitectura fullstack (Server Components + Proxy)
4. **Validación en capas** con Zod previene bugs silenciosos
5. **Notificaciones proactivas** cambian el paradigma de gestión reactiva a preventiva
6. **TypeScript + testing** reducen el ciclo de debugging significativamente

---

## DIAPOSITIVA 19: Trabajo Futuro

**Título:** Próximos pasos

- 🔐 Multi-usuario con roles (admin / viewer)
- 📱 PWA con notificaciones push nativas
- 🔄 WebSockets para actualización en tiempo real
- 📄 Exportación de reportes PDF
- 🏪 Soporte multi-tienda
- ☁️ Deploy en Vercel + Neon (producción)

---

## DIAPOSITIVA 20: Cierre

**Título:** ¿Preguntas?

**Datos de contacto:**
- GitHub: github.com/eneidyscastellano
- Repos: smart-retail-web / smart-retail-mcp

**Frase final:** "Smart Retail transforma datos en decisiones inteligentes."

---

## 💡 Tips para la Exposición

### Tiempo sugerido: 15-20 minutos
- Introducción (slides 1-4): 3 min
- Arquitectura + Tech (slides 5-7): 3 min
- **Demo en vivo (slide 6): 4-5 min** ← Lo más impactante
- Funcionalidades (slides 8-13): 4 min
- Técnico (slides 14-16): 2 min
- Cierre (slides 17-20): 2 min

### Qué impresiona en la demo:
1. La IA respondiendo con datos reales de la DB (no inventados)
2. Las notificaciones apareciendo automáticamente
3. El chat creando una recomendación que aparece en el dashboard
4. El formato de tablas en las respuestas de la IA

### Posibles preguntas del jurado:
- "¿Por qué MCP y no una API REST normal?" → MCP permite que el LLM descubra herramientas dinámicamente y las use autónomamente.
- "¿Qué pasa si la IA se equivoca?" → Las recomendaciones requieren aprobación humana antes de ejecutarse.
- "¿Es escalable?" → Sí: PostgreSQL maneja millones de registros, MCP se puede extender con más herramientas sin cambiar código.
- "¿Cómo se protegen los datos?" → Cookie httpOnly, proxy de rutas, validación Zod, queries parametrizadas (no SQL injection).
- "¿Por qué DeepSeek y no ChatGPT?" → Costo-efectivo para Colombia, API compatible con Vercel AI SDK, buen razonamiento con herramientas.
