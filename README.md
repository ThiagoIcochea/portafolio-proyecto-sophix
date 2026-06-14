# Sophix AI - Asistente Inteligente para Repositorios GitHub (RAG + IA + Tiempo Real)

Sophix AI es un sistema moderno de asistencia inteligente que permite analizar repositorios de GitHub, responder preguntas sobre código y mantener conversaciones contextualizadas usando **RAG (Retrieval-Augmented Generation)**, embeddings, búsqueda vectorial y modelos de IA.

El sistema combina un backend en **NestJS**, almacenamiento vectorial con **Qdrant Cloud**, generación de embeddings con **Jina AI**, y respuestas inteligentes mediante **Azure AI / Foundry**, además de soporte en tiempo real con **WebSockets**.

---

# Arquitectura del Proyecto

## Backend

```text
sophix-backend/
├── src/
│
├── ai/
│   ├── ai.service.ts                  # Motor principal RAG + generación de respuestas
│   ├── providers/
│   │   └── foundry.provider.ts        # Cliente Azure OpenAI / Foundry
│
├── auth/
│   └── github OAuth + JWT
│
├── chat/
│   ├── chat.gateway.ts               # WebSockets (tiempo real)
│   ├── chat.service.ts               # Lógica de chat
│   └── chat.module.ts
│
├── conversations/
│   └── gestión de conversaciones
│
├── messages/
│   └── almacenamiento de mensajes
│
├── github/
│   ├── github.service.ts             # Integración con GitHub API
│   ├── repository-indexer.service.ts # Chunking + indexación
│   ├── embeddings.service.ts        # Generación de embeddings
│   └── github.controller.ts
│
├── vector/
│   └── qdrant.service.ts             # Vector DB (Qdrant Cloud)
│
├── key-vault/
│   └── key-vault.service.ts         # Azure Key Vault (secrets)
│
├── app.module.ts
├── main.ts

```

---

# Arquitectura General del Sistema

## Flujo RAG (Retrieval-Augmented Generation)

1. Usuario envía pregunta sobre un repositorio GitHub.
2. Se detecta el repositorio desde el mensaje.
3. Se genera embedding con **Jina AI / embeddings service**.
4. Se busca similitud en **Qdrant Cloud**.
5. Se recuperan chunks relevantes del código.
6. Se construye contexto.
7. Se envía al modelo de IA (Azure Foundry).
8. Se genera respuesta final.

---

# Tecnologías Utilizadas

## Backend Core

* NestJS
* TypeScript
* Node.js

## Inteligencia Artificial

* Azure OpenAI / Foundry
* Jina AI Embeddings
* RAG (Retrieval-Augmented Generation)

## Base de Datos

* PostgreSQL (Neon)
* TypeORM

## Vector Database

* Qdrant Cloud (búsqueda semántica)

## Integraciones

* GitHub API (repositorios y análisis de código)
* Azure Key Vault (gestión de secretos)

## Tiempo Real

* WebSockets (NestJS Gateway)

---

# Funcionalidades Principales

## 📁 Análisis de Repositorios

* Indexación automática de repositorios GitHub
* Chunking de código fuente
* Generación de embeddings
* Almacenamiento en base vectorial

---

## 🧠 IA con Contexto (RAG)

* Preguntas sobre repositorios específicos
* Respuestas basadas en código real
* Evita alucinaciones (no inventa archivos)
* Contexto dinámico por conversación

---

## 🔎 Búsqueda Semántica

* Búsqueda por similitud en Qdrant
* Filtrado por repositorio / owner
* Ranking por score de relevancia

---

## 💬 Chat Inteligente

* Conversaciones persistentes
* Contexto histórico
* Integración con IA

---

## ⚡ Tiempo Real (WebSockets)

* Mensajes en vivo
* Indicador de escritura
* Salas por conversación
* Experiencia tipo chat moderno

---

## 🔐 Seguridad

* JWT Authentication
* GitHub OAuth
* Secrets en Azure Key Vault

---



# Instalación

```bash
npm install
```

---

# Ejecución

```bash
npm run start:dev
```

---

# Flujo de Indexación

```text
GitHub Repo
   ↓
Chunking (RepositoryIndexerService)
   ↓
Embeddings (Jina AI)
   ↓
Qdrant Cloud (Vector DB)
   ↓
Búsqueda semántica
```

---

# Flujo de Chat con RAG

```text
Usuario pregunta
   ↓
Detecta repo
   ↓
Embedding pregunta
   ↓
Qdrant search
   ↓
Construcción de contexto
   ↓
Azure Foundry (IA)
   ↓
Respuesta final
```

---

# WebSockets (Chat en Tiempo Real)

Eventos principales:

* connected
* joinConversation
* typing
* message
* messageReceived

---

# Estado del Proyecto

✔ RAG implementado
✔ Embeddings funcionales (Jina AI)
✔ Vector DB (Qdrant Cloud)
✔ Indexación de repositorios
✔ Chat con contexto
✔ Azure Key Vault integrado
✔ WebSockets básico funcionando

---

# Autor

**Thiago Paolo Icochea Rodriguez**

Proyecto enfocado en demostrar arquitectura moderna de IA aplicada a código, búsqueda semántica y sistemas de chat inteligentes.
