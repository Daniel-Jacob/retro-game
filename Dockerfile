# Multi-stage build: compile the static game, then serve it (plus the Spotify
# preview API) from a single rootless Node runtime. The runtime stage contains
# no front-end build tooling.

# ---- build stage ----
FROM node:lts-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
# Node LTS alpine ships a non-root `node` user (uid 1000). We run as that user on
# the unprivileged port 8080 — satisfying OpenShift constraints: runAsNonRoot,
# allowPrivilegeEscalation:false, no host networking. The server has no runtime
# npm dependencies (built-in http/fs + global fetch), so no node_modules needed.
# Song previews come from the public iTunes API — no secret/credentials required.
FROM node:lts-alpine
ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0
WORKDIR /app
# Copy only what the runtime needs.
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/package.json ./package.json
USER node
EXPOSE 8080
CMD ["node", "server/index.js"]
