.
├── backend/          # FastAPI application
├── frontend/           # Next.js application
├── docker-compose.yml # Docker setup
└── README.md

1. Setup Instructions :
Backend Setup (FastAPI)
cd backend
On Windows: venv\Scripts\activate  //activate venv
pip install -r requirements.txt
uvicorn app.main:app --reload  
Backend will run at : http://localhost:8000

Frontend Setup (Next.js)
cd frontend
npm install
npm run dev
Frontend will run at : http://localhost:3000

Environment Variables :
Create a .env file where required.

2. Architecture Overview : 
High-Level Flow
[ Next.js Frontend ]
        |
        | HTTP / Server-Sent Events (SSE)
        v
[ FastAPI Backend ]
        |
        | Async Job Dispatch
        v
[ Queue System (Redis) ]

Responsibilities :
Frontend :
Captures user queries
Renders streamed responses incrementally
Dynamically mounts UI components (tool calls,citations, PDF viewer)

Backend :
Accepts chat/search requests
Streams partial responses via SSE
Dispatches long-running jobs to a queue

Queue :
Handles async processing (LLM calls, retrieval, parsing)
Decouples request lifecycle from response streaming

Streaming Protocol Explanation : 
The system uses Server-Sent Events (SSE) to stream structured data from backend to frontend.
Each stream emits typed events, such as:
thinking – model reasoning phase
tool_call – request to trigger a UI component
response_chunk – partial text tokens
citation – document reference metadata
done – completion signal
The frontend listens using EventSource and updates the UI incrementally, enabling a real-time conversational experience instead of a single blocking response.

3. Libraries Used : 
Backend :
FastAPI – Async web framework with native SSE support
Uvicorn – ASGI server
Pydantic – Data validation
python-dotenv – Environment configuration

Frontend :
Next.js – React framework with app router
React – UI rendering
Zustand – Lightweight global state management
Framer Motion – UI animations for generative components

4. Design Decisions:

Generative UI Implementation :
Instead of static UI rendering, the frontend reacts to streamed event types.
This allows:
a. Tool calls to dynamically mount components
b. Citations to trigger document viewers
c. Incremental UX feedback during long responses

Trade-offs & Time Constraints :
Due to limited time:
a Queue workers are partially stubbed
b. Some UI interactions are mocked
c. Docker setup is minimal
d. Error handling is simplified
Despite this, the architecture supports easy extension to production-level robustness.


Future Improvements :
a. Complete Background Workers
Fully implement and scale async background workers for handling long-running tasks such as LLM calls, document retrieval, and parsing using the existing queue infrastructure.

b. Authentication & Rate Limiting
Add secure authentication (JWT / OAuth) and rate limiting to protect APIs, manage usage, and support multi-user environments.

c. Improve Streaming Error Recovery
Enhance robustness of the streaming pipeline by handling partial failures, reconnect logic, retry mechanisms, and graceful stream termination on backend and frontend.

d. UI/UX Enhancements
Improve overall UI polish, accessibility, responsiveness, and animations.
Refine generative UI components to better reflect tool calls, intermediate reasoning states, and structured responses.

e. Replace Mocked UI Flows with Live Integration
Connect currently mocked frontend flows (tool calls, citations, PDF viewer transitions) with fully functional backend APIs and real data sources.

f. Enhanced Response Quality Using Paid API Keys
Integrate paid LLM/API keys to unlock higher-quality responses, improved reasoning depth, faster streaming, and more reliable tool-call outputs.

g. Complete Incomplete Features
Finish partially implemented modules including:
Queue worker logic
Citation-to-document linking
PDF viewer state management
Error boundaries and loading states
Production-Ready Docker & Deployment
Harden Docker configuration for production, add environment-based configs, CI/CD pipelines, and deploy to cloud infrastructure (AWS/GCP/Vercel).



This project focuses on system design, streaming architecture, and generative UI patterns rather than full feature completion.
It demonstrates how modern AI-powered interfaces can be built using incremental streaming, async processing, and dynamic UI composition.