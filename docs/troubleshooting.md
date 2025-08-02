# 7. Troubleshooting

*   **`Connection refused` errors**: Ensure that the backend services (PostgreSQL, Redis, Qdrant) are running. You can check their status with `docker-compose ps`.
*   **`401 Unauthorized` errors**: Make sure you have run the `create_demo_user.py` script to seed the database with the initial user.
*   **Translation issues**: If you see raw translation keys in the UI, ensure that the i18n configuration is correct and that the translation files contain all the necessary keys.
*   **Frontend compilation errors**: If you encounter issues with the frontend, try deleting the `node_modules` directory and the `package-lock.json` file, and then run `npm install` again.
