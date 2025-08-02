# Kronos EAM Login Credentials

## Demo User Account

You can login to the Kronos EAM application using the following credentials:

- **Email**: mario.rossi@energysolutions.it
- **Password**: Demo123!

## Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Notes

1. Make sure both the backend API and frontend are running:
   - Backend: Run `./run_api.sh` in the `/home/bloom/sentrics/kronos-eam-backend` directory
   - Frontend: Run `npm start` in the `/home/bloom/sentrics/kronos-eam-react` directory

2. The login uses JWT authentication with access and refresh tokens.

3. The demo user has Admin role with full permissions.

## Troubleshooting

If you encounter login issues:
1. Ensure the backend API is running on port 8000
2. Check that Docker services are running: `docker-compose ps`
3. Verify the database connection is working