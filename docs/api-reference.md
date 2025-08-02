# 4. API Reference

The backend exposes a RESTful API for interacting with the application's data. All endpoints are available under the `/api/v1` prefix.

## 4.1. Authentication

*   `POST /auth/login`: Authenticates a user and returns a JWT.
*   `POST /auth/refresh`: Refreshes an expired JWT.

## 4.2. Plants

*   `GET /plants`: Returns a list of all plants.
*   `POST /plants`: Creates a new plant.
*   `GET /plants/{plant_id}`: Returns the details of a specific plant.

## 4.3. Workflows

*   `GET /workflows`: Returns a list of all workflows.
*   `POST /workflows`: Creates a new workflow.
*   `GET /workflows/{workflow_id}`: Returns the details of a specific workflow.

## 4.4. Dashboard

*   `GET /dashboard/metrics`: Returns key metrics for the main dashboard.

## 4.5. Documents

*   `GET /documents`: Returns a list of all documents.
*   `POST /documents`: Uploads a new document.

## 4.6. AI Assistant

*   `POST /ai-assistant/chat`: Sends a message to the AI assistant and returns a response.

## 4.7. Users

*   `GET /users`: Returns a list of all users.
*   `POST /users`: Creates a new user.
