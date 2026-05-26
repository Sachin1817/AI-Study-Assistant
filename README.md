# 🎓 AI Study Assistant

**An Elite, Full-Stack AI-Powered Tutor & Study Suite for Seamless Note Synthesis, Quizzes, & RAG Chat**

<div align="center">
  
  [![React](https://img.shields.io/badge/React-18.2-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS_v3-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
  [![Groq API](https://img.shields.io/badge/AI-Groq_LLaMA_3.1-black.svg?style=for-the-badge&logo=meta)](https://groq.com/)

  <p align="center">
    <a href="#-key-features">Key Features</a> •
    <a href="#%EF%B8%8F-system-architecture">System Architecture</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-api-endpoint-registry">API Registry</a> •
    <a href="#%EF%B8%8F-configuration--environment">Configuration</a> •
    <a href="#-installation--setup">Setup Instructions</a> •
    <a href="#-local-mock-database-fallback">Mock DB Fallback</a>
  </p>

</div>

---

## 🌟 Overview

**AI Study Assistant** is a premium, full-stack learning platform engineered to revolutionize how students, researchers, and professionals digest complex materials. By feeding textbooks, research articles, or scanned notes into our advanced processing pipeline, users can instantly synthesize dense PDFs into **interactive study aids** powered by ultra-fast LLaMA 3.1 inference on the Groq API. 

Designed with a sleek, responsive, glassmorphic dark interface, the application bridges high-performance FastAPI backend logic with a dynamic React frontend to deliver buttery-smooth, context-rich study tools.

---

## ✨ Key Features

*   **📄 Intelligent PDF Processing & OCR:** Advanced double-layer parsing using `pdfplumber` and `pypdf`. Integrates `pytesseract` OCR for scanned notes and diagrams.
*   **📝 Smart Notes Generator:** Synthesizes dense material into concise, structured bullet points, isolates key **mathematical formulas**, and predicts **10-mark level exam questions** with meticulously generated model answers.
*   **🧠 High-Fidelity Summarizer:** Distills papers into high-level conceptual overviews, dense study paragraphs, and quick-revision flashcard decks.
*   **🔊 Text-to-Speech (TTS) Voice Explanations:** Employs a text-to-speech audio compiler using the Google TTS (`gTTS`) API, allowing hands-free, on-the-go auditory learning with full media playback control.
*   **🎯 Interactive Quiz Studio:** Generates tailored, multi-format (MCQs, True/False, Short-Answer) quizzes across different difficulty levels, complete with live scoring, detailed explanation reviews, and session logging.
*   **🤖 Semantic RAG Chatbot:** Integrates Context-Aware Retrieval-Augmented Generation (RAG). Index, search, and chat directly with your specific document chunks via high-performance vector embeddings.
*   **🔒 Hybrid Authentication:** Seamless dual-support for local JWT JWT tokens and secure Google OAuth via Firebase Authentication.
*   **📊 Study Metrics & Dashboard:** Track total pages processed, total uploads, average quiz scores, and recent activities via interactive telemetry graphs.
*   **🔌 High-Fidelity Mock Database:** An intelligent MongoDB simulation system that automatically falls back to an isolated, lightweight local JSON storage (`db_store.json`) when MongoDB is offline, allowing 100% app functionality without database prerequisites!

---

## 🖥️ System Architecture

Our RAG-powered vector search and AI synthesis operate through a structured pipeline:

```mermaid
graph TD
    User([User]) -->|Upload PDF / Request Study Aid| FE[React 18 Frontend]
    FE -->|API Request + Auth Header| BE[FastAPI Backend Gateway]
    BE -->|Token Validation| Auth[JWT & Firebase Authenticator]
    BE -->|Extract & Chunk Text| PDFProc[pdfplumber / pytesseract Engine]
    PDFProc -->|Semantical 800-char Overlap Chunks| Embedder[Background Vector Embeddings Generator]
    Embedder -->|1536-dim Vectors| DB_Embed[(MongoDB Embeddings Collection)]
    BE -->|Prompt & Source Chunks| Groq[Groq LLaMA 3.1 LLM]
    BE -->|TTS Generation Request| gTTS[gTTS Engine]
    gTTS -->|Save .mp3 File| Static[/static/audios/]
    BE -->|Offline Fallback DB| MockDB[(db_store.json Mock Database)]
    BE -->|Online DB| RealDB[(MongoDB Atlas database)]
```

---

## 💻 Tech Stack

### **Frontend Suite** 🎨
*   **Core:** React 18 (Vite boilerplate for sub-second build times)
*   **Styling:** Tailwind CSS with a cohesive glassmorphic dark color scheme
*   **Animations:** Framer Motion for premium fluid page-to-page transitions
*   **Icons & Telemetry:** Lucide React & Canvas Confetti for interactive micro-rewards
*   **Routing & Auth:** React Router DOM & Firebase Authentication integration

### **Backend Engine** ⚙️
*   **Core API Service:** FastAPI (high-concurrency Python ASGI framework)
*   **AI Inference Platform:** Groq Cloud SDK (running ultra-low latency LLaMA models)
*   **Document Analysis:** `pdfplumber`, `pypdf`, and `pytesseract` OCR
*   **Audio Synthesis:** `gTTS` (Google Text-to-Speech)
*   **Vector Operations:** Local text similarity matrices and MongoDB indexing strategies
*   **Database Interface:** PyMongo (supporting MongoDB Atlas or local clusters)
*   **Token Security:** Passlib (Bcrypt hashing) & Python-Jose (JWT generation)

---

## 📂 Directory Layout

```text
AI-Study-Assistant/
├── frontend/                # React Vite Application
│   ├── src/
│   │   ├── components/      # AudioPlayer, FileUploader, Navbar, Sidebar
│   │   ├── context/         # AuthContext with Firebase + Local JWT
│   │   ├── pages/           # Landing, Dashboard, PDFUpload, Summarizer, Quizzes, Notes
│   │   ├── services/        # Centralized Axios API request clients
│   │   ├── index.css        # Tailwind directives and custom animation frames
│   │   └── main.jsx
│   ├── tailwind.config.js   # Custom theme palettes (brand-deep, teal, accent)
│   └── package.json
│
├── backend/                 # FastAPI Service
│   ├── app/
│   │   ├── auth/            # Hashing and User identity resolution layers
│   │   ├── models/          # MongoDB documents schemas (Pydantic validated)
│   │   ├── routers/         # REST API controller nodes
│   │   │   ├── auth.py, pdfs.py, summaries.py, quizzes.py, chats.py, notes.py, stats.py
│   │   ├── services/        # Core business operations (LLM drivers, TTS engines, OCR pipelines)
│   │   ├── static/          # Server persistent folders for uploads and generated audios
│   │   ├── config.py        # Pydantic Settings reading .env variables
│   │   ├── database.py      # Dual real-MongoDB / high-fidelity mock-DB connection logic
│   │   └── main.py          # Central app configuration, middlewares, and routers registration
│   ├── requirements.txt     # Python project package dependencies
│   └── run.py               # Uvicorn developer server trigger file
│
└── README.md
```

---

## 🔌 API Endpoint Registry

All backend routes require the bearer header: `Authorization: Bearer <JWT_TOKEN>` (unless marked as `Public`).

| Category | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/auth/register` | Register a new developer/student account | Public |
| | `POST` | `/auth/login` | Log in and receive a JSON Web Token (JWT) | Public |
| | `POST` | `/auth/firebase-login`| Validate Firebase session and sync local user status | Public |
| | `GET` | `/auth/me` | Fetch active user information profile | Yes |
| | `PUT` | `/auth/me` | Update user preferences or avatar data | Yes |
| **PDF Processing** | `POST` | `/pdfs/upload` | Process new PDF file upload (Supports optional `use_ocr` Form flag)| Yes |
| | `GET` | `/pdfs/` | List all PDFs uploaded by the authenticated user | Yes |
| | `DELETE`| `/pdfs/{pdf_id}` | Remove PDF file, document chunks, and embeddings | Yes |
| **Study Summaries**| `POST` | `/summaries/generate`| Generate high-level, paragraph, or key bullet points | Yes |
| | `POST` | `/summaries/voice` | Translate textual summary into audio `.mp3` file via gTTS | Yes |
| | `POST` | `/summaries/{pdf_id}`| Generate and cache summary specifically for a PDF ID | Yes |
| | `GET` | `/summaries/{pdf_id}`| Retrieve cached summary data | Yes |
| **Quiz Studio** | `POST` | `/quizzes/generate` | Build interactive MCQs, True/False, or Short Answer questions | Yes |
| | `POST` | `/quizzes/{quiz_id}/submit`| Submit answers for grading, returns explanations and score | Yes |
| | `GET` | `/quizzes/history` | List user's quiz practice logs with score records | Yes |
| **Notes & Exams** | `POST` | `/notes/generate` | Extract formulas and generate 10-mark level predicted exam Q&As | Yes |
| | `GET` | `/notes/pdf/{pdf_id}` | Fetch notes associated with a specific PDF ID | Yes |
| | `GET` | `/notes/` | List all generated notes for the user | Yes |
| | `DELETE`| `/notes/{note_id}` | Delete a note resource | Yes |
| **RAG Chatbot** | `POST` | `/chats/sessions` | Create a new Q&A session for a PDF document | Yes |
| | `GET` | `/chats/sessions` | List active user chat sessions | Yes |
| | `POST` | `/chats/sessions/{session_id}/query`| Post query to a document (RAG search + Groq LLaMA) | Yes |
| **Telemetry Stats**| `GET` | `/stats/` | Fetch total counts and recent activities for dashboard widgets | Yes |

---

## 🛠️ Configuration & Environment

### **Backend Configuration** (`/backend/.env`)
Create a `.env` file inside the `backend` directory:
```env
# Server Port
PORT=8000

# Authentication Keys
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Settings
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net
DB_NAME=ai_study_assistant

# AI Inference Keys (Get key from console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Firebase Integration (For frontend sync validation)
FIREBASE_PROJECT_ID=ai-study-assistant-app
```

### **Frontend Configuration** (`/frontend/.env`)
Create a `.env` file inside the `frontend` directory:
```env
VITE_API_URL=http://localhost:8000

# Firebase Configuration Details (Optional if using Google OAuth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🚀 Installation & Setup

### **Prerequisites**
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Python](https://www.python.org/) (v3.9 - v3.12 recommended)
*   *Optional:* [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Not required! The local mock-database triggers automatically if MongoDB is not running).
*   *Optional:* [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (For parsing scanned images inside PDFs).

---

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/Sachin1817/AI-Study-Assistant.git
cd AI-Study-Assistant
```

---

### **Step 2: Backend Setup**
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    # Windows:
    python -m venv .venv
    .venv\Scripts\activate

    # macOS/Linux:
    python3 -m venv .venv
    source .venv/bin/activate
    ```
3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure your environment parameters:
    Create a `.env` file as detailed in the [Configuration](#backend-configuration-backendenv) section.
5.  Start the FastAPI application server:
    ```bash
    python run.py
    ```
    *The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).*

---

### **Step 3: Frontend Setup**
1.  Open a new terminal window/tab and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install the package dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment parameters:
    Create a `.env` file as detailed in the [Configuration](#frontend-configuration-frontendenv) section.
4.  Launch the Vite development server:
    ```bash
    npm run dev
    ```
    *Open [http://localhost:5173](http://localhost:5173) in your web browser to start using the app!*

---

## 🔌 Local Mock Database Fallback

To ensure a seamless developer experience out of the box, AI Study Assistant is equipped with a **High-Fidelity local mock database engine**. 

### **How it Works:**
1.  Upon server startup, the backend attempts to establish a connection with the configured `MONGODB_URI`.
2.  If the connection fails or times out (e.g. no local MongoDB running and no Atlas URL supplied), the system logs a warning:
    `"Could not connect to MongoDB client. Activating High-Fidelity local mock database."`
3.  FastAPI will automatically create `backend/app/db_store.json`.
4.  A custom interface mimics MongoDB's `insert_one`, `find_one`, `find`, `update_one`, `delete_one`, and pagination cursor logic.
5.  All user accounts, uploaded metadata, notes, and quiz histories will persist locally inside that file.

*This makes the app instantly runnable locally for demos, grading, or offline development with **zero** cloud dependencies!*

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. 

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

## 📬 Contact & Support

*   **GitHub:** [@Sachin1817](https://github.com/Sachin1817)
*   **Email:** [sachindevaraju49@gmail.com](mailto:sachindevaraju49@gmail.com)

Project Link: [https://github.com/Sachin1817/AI-Study-Assistant](https://github.com/Sachin1817/AI-Study-Assistant)

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ to empower learners everywhere.</b>
</div>
