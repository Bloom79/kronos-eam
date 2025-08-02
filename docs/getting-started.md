# 2. Getting Started

This guide will walk you through setting up the development environment for Kronos EAM.

## 2.1. Prerequisites

*   Node.js (v16 or higher)
*   Python (v3.10 or higher)
*   Docker and Docker Compose
*   `pip` and `venv` for Python package management

## 2.2. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd kronos-eam-backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Start the backend services (PostgreSQL, Redis, Qdrant):**
    ```bash
    docker-compose up -d
    ```
5.  **Run the database migrations:**
    ```bash
    alembic upgrade head
    ```
6.  **Seed the database with initial data:**
    ```bash
    python create_demo_user.py
    ```
7.  **Start the backend server:**
    ```bash
    uvicorn app.main:app --reload
    ```

The backend will now be running at `http://localhost:8000`.

## 2.3. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd kronos-eam-react
    ```
2.  **Install the required dependencies:**
    ```bash
    npm install
    ```
3.  **Start the frontend development server:**
    ```bash
    npm start
    ```

The frontend will now be running at `http://localhost:3000`.
