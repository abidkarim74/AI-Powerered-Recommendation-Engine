# AI-Powered Social Recommendation Engine

Welcome to the **Social Recommendation Engine** project! This is a full-stack application designed to provide personalized content recommendations using state-of-the-art vector search and Large Language Models (LLMs).

**🔗 [Live Demo](https://www.linkedin.com/posts/abid-karim123_ai-artificialintelligence-machinelearning-ugcPost-7474387685588082689-S2B4/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAE38664BltUeoq9Hr3pZ8WzH7AV7KB-73gg)**

## 🚀 Project Overview

The application features a social media-like feed where users can see posts and get intelligent, content-based recommendations. It uses natural language processing to understand the semantic meaning of posts and user interactions, powering a highly personalized feed.

## 🛠️ Tech Stack

### Backend
*   **FastAPI**: High-performance asynchronous web framework for Python.
*   **PostgreSQL**: Relational database.
*   **pgvector**: Postgres extension for vector similarity search.
*   **SQLAlchemy & Alembic**: ORM and database migration tools.
*   **Sentence Transformers**: For generating high-quality text embeddings to power the recommendation engine.
*   **Uvicorn**: ASGI web server.
*   **Authentication**: JWT-based authentication (passlib, python-jose).

### Frontend
*   **React 19**: Modern UI library.
*   **TypeScript**: For strong typing and reliable code.
*   **Vite**: Extremely fast frontend tooling and bundler.
*   **Tailwind CSS (v4)**: Utility-first CSS framework for rapid UI development.
*   **React Router**: For client-side routing.
*   **Axios**: For making HTTP requests to the backend.

---

## 📂 Folder Structure

```text
recommendation_engine/
│
├── backend/                  # FastAPI backend application
│   ├── app/                  # Main application code
│   │   ├── configs/          # Configuration and environment variables
│   │   ├── controllers/      # Business logic and request handling
│   │   ├── database/         # Database connection setup
│   │   ├── dependencies/     # FastAPI dependencies (e.g., auth)
│   │   ├── llm/              # AI and recommendation engine logic
│   │   ├── models/           # SQLAlchemy database models
│   │   ├── routes/           # API endpoints
│   │   ├── schemas/          # Pydantic schemas for request/response validation
│   │   ├── utils/            # Helper functions
│   │   └── server.py         # Application entry point
│   ├── migrations/           # Alembic database migrations
│   ├── main.py               # Seed script for creating initial posts
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # React frontend application
    ├── src/                  # React source code (components, pages, etc.)
    ├── public/               # Static assets
    ├── package.json          # Node.js dependencies and scripts
    └── vite.config.ts        # Vite configuration
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:

*   **Python 3.9+**
*   **Node.js 18+** & **npm**
*   **PostgreSQL** (with `pgvector` extension installed)

---

## 🚀 Installation & Setup

### 1. Database Setup

Ensure your PostgreSQL instance is running and you have created a database for the project. You must also enable the `pgvector` extension on your database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv env
    # On Windows:
    .\env\Scripts\activate
    # On macOS/Linux:
    source env/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    Create a `.env` file in the `backend` directory based on the configuration required (e.g., Database URL, JWT Secret Key).
5.  Run Database Migrations:
    ```bash
    alembic upgrade head
    ```

### 3. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

---

## 🏃‍♂️ Running the Application

### Start the Backend Server

From the `backend` directory, run:

```bash
cd backend
uvicorn app.server:app --reload --port 8000
```
The API will be accessible at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.

### Start the Frontend Server

From the `frontend` directory, run:

```bash
cd frontend
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

---

## 🌱 Seeding the Database

To populate the database with an initial set of diverse posts (Technology, Fitness, Mental Health, Science, Music, etc.), you can run the provided seed script. 

*Note: Ensure your backend server is running and you have a valid `ACCESS_TOKEN` set in the `main.py` script.*

```bash
cd backend
python main.py
```

---

## 🧠 How the Recommendation Engine Works

1.  **Embeddings**: When posts are created, the text content is passed through a Sentence Transformer model to generate a dense vector representation (embedding).
2.  **Storage**: These embeddings are stored in the PostgreSQL database using the `pgvector` extension.
3.  **Personalization**: As users interact with the app, the engine queries the database to find posts with embeddings mathematically similar (e.g., via Cosine Similarity) to the user's interests or past interactions, surfacing the most relevant content.

### 🤖 Models Used

*   **Sentence Transformers**: Currently, we are using local models placed in the `backend/llm_models` directory to generate high-quality text embeddings.
*   **LLM Integration**: The project is utilizing **Qwen3** via `llama.cpp` for core reasoning and generation tasks. However, the system is built to be flexible—**any OpenAI API-compatible model** can be used as a drop-in replacement.
