## Active frontend context

- This is the only active customer-facing frontend. The sibling `front` project is a legacy behavior reference and must not receive new product work.
- The application is a React/Vite Persian RTL frontend using the versioned backend API under `/api/v1`.
- Production builds use same-origin API requests (`VITE_DATA_MODE=api`, `VITE_API_BASE_URL=/api/v1`) when served by Nginx.
- The current staging deployment serves the built `dist/` directory from `/opt/ikommak/current/frontend` on `http://156.241.0.113`.
- Run `npm test` and `npm run build` after frontend changes. Do not commit `.env` files, build output, dependencies, logs, or customer data.
- GitHub pull-based deployment and CI/CD are planned, not yet configured.
