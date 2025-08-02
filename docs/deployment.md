# 6. Deployment

The application is designed to be deployed with Docker. Both the frontend and backend have their own Dockerfiles, and a `docker-compose.yml` file is provided for running the entire application stack.

For a production deployment, it is recommended to use a managed database and Redis service, and to run the application on a container orchestration platform like Kubernetes.
