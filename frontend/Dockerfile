# syntax=docker/dockerfile:1

# ---- Build the static site ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
# Empty: the API is reached on the same origin, through nginx (see nginx.conf).
ARG VITE_API_URL
ARG VITE_BASE=/
RUN npm run build

# ---- Serve it with nginx ----
FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
