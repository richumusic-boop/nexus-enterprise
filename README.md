---
title: Nexus Enterprise
emoji: 🚀
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Nexus Enterprise System

This is the unified deployment of the Nexus Enterprise System, containing both the FastAPI Backend and the React Frontend.

## Environment Variables Needed

To run this space, you must provide a `DATABASE_URL` in the Space Settings. We recommend using **Neon.tech** for a free PostgreSQL database.

- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure string for token generation.
