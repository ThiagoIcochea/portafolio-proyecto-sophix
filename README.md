
# Sophix AI - Asistente Inteligente para Repositorios GitHub (RAG + IA + Tiempo Real)

Sophix AI es un sistema avanzado de inteligencia artificial que permite analizar repositorios de GitHub, responder preguntas sobre código y mantener conversaciones contextuales usando arquitectura RAG (Retrieval-Augmented Generation), embeddings y búsqueda vectorial.

El sistema está diseñado como una plataforma tipo “GitHub Copilot para repositorios propios”, combinando backend, frontend móvil, automatización con n8n y múltiples modelos de IA.

---

# Arquitectura del Sistema

##  sophix-backend (NestJS)

src/
├── ai/
│   ├── ai.service.ts
│   ├── providers/
│   │   ├── foundry.provider.ts
│   │   ├── groq.provider.ts
│   │  
│
├── auth/
├── chat/
├── conversations/
├── messages/
├── github/
├── vector/
├── key-vault/
├── app.module.ts
└── main.ts

---

##  sophix-mobile (React Native - Expo)

app/
├── screens/
│   ├── HomeScreen.tsx
│   ├── ChatScreen.tsx
│   ├── RepoScreen.tsx
│   ├── LoginScreen.tsx
│
├── components/
│   ├── MessageBubble.tsx
│   ├── TypingIndicator.tsx
│   ├── RepoCard.tsx
│
├── services/
│   ├── api.ts
│   ├── websocket.ts
│
├── store/
├── hooks/
└── navigation/

---

#  Automatización con n8n (CI/CD Inteligente)

Sophix AI utiliza n8n como motor de automatización para reindexación automática.

Flujo:

GitHub Push Event
↓
Webhook en n8n
↓
Trigger de reindexación
↓
Chunking de código fuente
↓
Embeddings (Jina AI)
↓
Actualización en Qdrant

---

#  Arquitectura RAG

Usuario pregunta
↓
Detección de repositorio GitHub
↓
Embedding (Jina AI)
↓
Búsqueda en Qdrant
↓
Recuperación de código
↓
Construcción de contexto
↓
Selección de modelo IA
↓
Respuesta final

---

#  Modelos de IA Soportados

| Modelo | Uso | Características |
|--------|-----|----------------|
| gpt-4o-mini | Chat general | Balance entre velocidad y calidad |
| gpt-mini | Respuestas rápidas | Bajo costo y alta velocidad |
| llama-3.3-70b-versatile | Análisis profundo | Mejor para código complejo |

---

#  Backend - Tecnologías

- NestJS
- TypeScript
- PostgreSQL (Neon)
- Qdrant Cloud (Vector DB)
- Jina AI (Embeddings)
- GitHub API
- Azure Key Vault
- WebSockets
- n8n (automatización de reindexación)

---

#  Frontend - Tecnologías

- React Native (Expo)
- TypeScript
- Axios
- Socket.io-client
- React Navigation
- Zustand (opcional)

---

#  Instalación

Backend:
npm install
npm run start:dev

Frontend:
npm install
npx expo start

---

#  Ejecutar en Android

npx expo run:android

---

#  Funcionalidades Principales

 GitHub Analyzer
- Detección automática de repositorios
- Indexación de código fuente
- Reindexación automática con n8n

Chat Inteligente (RAG)
- Respuestas basadas en código real
- Evita alucinaciones
- Contexto por conversación
- Multi-modelo IA

Búsqueda Semántica
- Qdrant vector search
- Filtrado por repo/usuario
- Ranking por relevancia

 Tiempo Real
- WebSockets
- Chat instantáneo
- Typing indicator

 Seguridad
- JWT Authentication
- GitHub OAuth
- Azure Key Vault

---

#  API

POST /ai/chat  
POST /ai/repository-chat  
GET /auth/github/callback  

---

#  Flujo de Indexación

GitHub Repository
↓
n8n Webhook (push event)
↓
Chunking
↓
Embeddings (Jina AI)
↓
Qdrant Vector DB
↓
Búsqueda semántica

---

#  Flujo de Chat

Usuario
↓
Detección de repo
↓
Embedding query
↓
Qdrant Search
↓
Contexto
↓
IA (modelo seleccionado)
↓
Respuesta final

---

#  Estado del Proyecto

✔ RAG funcional  
✔ Qdrant integrado  
✔ Embeddings activos  
✔ Chat en tiempo real  
✔ Multi-modelo IA  
✔ GitHub indexing automático  
✔ Pipeline n8n funcionando  
✔ Frontend móvil operativo  

---

#  Autor

Thiago Paolo Icochea Rodríguez

Sistema diseñado para demostrar arquitectura moderna de IA aplicada a código, búsqueda semántica, automatización con n8n y chat inteligente multi-modelo.
