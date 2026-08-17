# 📐 Diagramas de Arquitectura — Smart Retail

Todos los diagramas usan sintaxis [Mermaid](https://mermaid.js.org/) y se renderizan automáticamente en GitHub.

---

## 1. Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph Cliente["🖥️ Navegador del Usuario"]
        Browser[Dashboard Web]
        ChatUI[Chat Agéntico]
    end

    subgraph NextJS["⚡ smart-retail-web<br/>Next.js 16 (App Router)"]
        direction TB
        RSC[React Server Components<br/>Renderizado en servidor]
        ServerActions[Server Actions<br/>createProduct / updateProduct / deleteProduct]
        APIProducts["/api/products<br/>REST API"]
        APIChat["/api/chat<br/>Streaming + MCP Client"]
    end

    subgraph MCPServer["🤖 smart-retail-mcp<br/>MCP Server (stdio)"]
        direction TB
        MCPHandler[Request Handler]
        Tool1["🔧 get_current_stock"]
        Tool2["🔧 get_sales_velocity"]
        Tool3["🔧 create_ai_recommendation"]
    end

    subgraph Services["☁️ Servicios Externos"]
        LLM["DeepSeek Chat<br/>(LLM)"]
        Database[("PostgreSQL<br/>Base de Datos")]
    end

    %% Conexiones del cliente
    Browser -- "RSC Stream" --> RSC
    Browser -- "Form Action" --> ServerActions
    ChatUI -- "POST /api/chat" --> APIChat

    %% Conexiones del servidor Next.js
    RSC -- "SQL Query" --> Database
    ServerActions -- "SQL Query" --> Database
    APIProducts -- "SQL Query" --> Database
    APIChat -- "stdio (spawn)" --> MCPHandler
    APIChat -- "API (streaming)" --> LLM

    %% LLM decide herramientas
    LLM -. "Tool Calls" .-> APIChat

    %% MCP ejecuta
    MCPHandler --> Tool1
    MCPHandler --> Tool2
    MCPHandler --> Tool3
    Tool1 -- "SQL" --> Database
    Tool2 -- "SQL" --> Database
    Tool3 -- "INSERT" --> Database
```

---

## 2. Diagrama de Secuencia — Chat Agéntico

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as ChatPanel (Browser)
    participant N as /api/chat (Next.js)
    participant M as MCP Server
    participant D as DeepSeek (LLM)
    participant DB as PostgreSQL

    U->>C: Escribe mensaje
    C->>N: POST /api/chat {messages, conversationId}
    N->>DB: Guardar mensaje del usuario
    N->>M: Conectar vía stdio (spawn tsx)
    M-->>N: Conexión establecida

    N->>D: streamText(messages, tools)
    
    loop Hasta max 5 pasos
        D->>N: Tool Call: get_current_stock
        N->>M: callTool("get_current_stock")
        M->>DB: SELECT productos + proveedores
        DB-->>M: Datos de inventario
        M-->>N: Resultado JSON
        N->>D: Resultado de herramienta
        
        D->>N: Tool Call: get_sales_velocity
        N->>M: callTool("get_sales_velocity", {days: 7})
        M->>DB: SELECT ventas + cálculo
        DB-->>M: Velocidades de venta
        M-->>N: Resultado JSON
        N->>D: Resultado de herramienta
    end

    D-->>N: Texto final (streaming)
    N-->>C: SSE stream (text-delta)
    N->>DB: Guardar respuesta del asistente
    C-->>U: Muestra respuesta progresivamente
```

---

## 3. Diagrama Entidad-Relación (Base de Datos)

```mermaid
erDiagram
    categories {
        UUID id PK "gen_random_uuid()"
        VARCHAR name "NOT NULL"
    }

    suppliers {
        UUID id PK "gen_random_uuid()"
        VARCHAR name "NOT NULL"
        VARCHAR email
        INT lead_time_days "Días de entrega"
    }

    products {
        UUID id PK "gen_random_uuid()"
        VARCHAR sku UK "Código único"
        VARCHAR name "NOT NULL"
        UUID category_id FK
        UUID supplier_id FK
        DECIMAL price "Precio venta (COP)"
        DECIMAL cost "Costo compra (COP)"
        INT current_stock "Stock actual"
        INT min_safety_stock "Stock mínimo seguro"
    }

    sales {
        UUID id PK "gen_random_uuid()"
        TIMESTAMP sale_date
        DECIMAL total_amount "Total en COP"
    }

    sale_items {
        UUID id PK "gen_random_uuid()"
        UUID sale_id FK
        UUID product_id FK
        INT quantity
        DECIMAL unit_price
    }

    ai_recommendations {
        UUID id PK "gen_random_uuid()"
        UUID product_id FK
        INT recommended_order_qty
        TEXT reason "Explicación de la IA"
        VARCHAR status "PENDING | APPROVED | REJECTED"
        TIMESTAMP created_at
    }

    chat_conversations {
        TEXT id PK "conv-timestamp-random"
        TIMESTAMP created_at
    }

    chat_messages {
        UUID id PK "gen_random_uuid()"
        TEXT conversation_id FK
        TEXT role "user | assistant"
        TEXT content
        TIMESTAMP created_at
    }

    categories ||--o{ products : "categoriza"
    suppliers ||--o{ products : "provee"
    products ||--o{ sale_items : "vendido en"
    products ||--o{ ai_recommendations : "tiene recomendaciones"
    sales ||--o{ sale_items : "contiene items"
    chat_conversations ||--o{ chat_messages : "contiene mensajes"
```

---

## 4. Diagrama de Componentes Frontend

```mermaid
graph TD
    subgraph ServerSide["Server Components"]
        Page["page.tsx<br/>━━━━━━━━━━━<br/>getProducts()<br/>getRecommendations()<br/>getSalesTrend()<br/>getCategories()<br/>getSuppliers()"]
    end

    subgraph ClientSide["Client Components"]
        ChatPanel["ChatPanel<br/>━━━━━━━━━━━<br/>messages: ChatMsg[]<br/>input: string<br/>isLoading: boolean<br/>━━━━━━━━━━━<br/>handleSubmit()<br/>handleClear()"]
        
        AddDialog["AddProductDialog<br/>━━━━━━━━━━━<br/>open: boolean<br/>━━━━━━━━━━━<br/>formAction()"]
        
        EditDialog["EditProductDialog<br/>━━━━━━━━━━━<br/>open: boolean<br/>sku, name, price...<br/>isPending: boolean<br/>━━━━━━━━━━━<br/>handleSubmit()<br/>handleOpenChange()"]
        
        SalesChart["SalesChart<br/>━━━━━━━━━━━<br/>data: SalesDataPoint[]<br/>━━━━━━━━━━━<br/>BarChart (Recharts)"]
    end

    subgraph ServerActions["Server Actions (actions.ts)"]
        create["createProduct(formData)"]
        update["updateProduct(id, formData)"]
        delete["deleteProduct(id)"]
        approve["approveRecommendation(id)"]
        reject["rejectRecommendation(id)"]
    end

    subgraph Library["lib/"]
        dbLib["db.ts → query()"]
        chatStore["chat-store.ts<br/>━━━━━━━━━━━<br/>ensureChatSchema()<br/>ensureConversation()<br/>getConversationMessages()<br/>saveMessage()<br/>clearConversation()"]
        utils["utils.ts<br/>━━━━━━━━━━━<br/>cn()<br/>formatCOP()"]
    end

    Page --> ChatPanel
    Page --> AddDialog
    Page --> EditDialog
    Page --> SalesChart

    AddDialog --> create
    EditDialog --> update
    Page --> delete
    Page --> approve
    Page --> reject

    create --> dbLib
    update --> dbLib
    delete --> dbLib
    approve --> dbLib
    reject --> dbLib

    Page --> utils
```

---

## 5. Diagrama de Deployment

```mermaid
graph LR
    subgraph Dev["Entorno de Desarrollo"]
        NextDev["next dev<br/>:3000"]
        MCPProc["tsx src/index.ts<br/>(proceso hijo stdio)"]
        PGLocal["PostgreSQL<br/>:5432"]
    end

    subgraph Cloud["Producción (futuro)"]
        Vercel["Vercel<br/>Next.js"]
        PGDB["PostgreSQL<br/>(Neon/Supabase)"]
        DSAPI["DeepSeek API"]
    end

    NextDev --> MCPProc
    NextDev --> PGLocal
    MCPProc --> PGLocal
    NextDev --> DSAPI

    Vercel --> PGDB
    Vercel --> DSAPI
```

---

## Notas

- Los diagramas Mermaid se renderizan automáticamente en GitHub, GitLab y la mayoría de editores Markdown.
- Para exportar como imagen: usar [mermaid.live](https://mermaid.live/) o la extensión de VS Code "Markdown Preview Mermaid Support".
