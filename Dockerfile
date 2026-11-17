# ==============================================================================
# Etapa 1: Construcción Web (Builder) — App-Factura
# ==============================================================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Evitar la descarga del binario pesado de Electron dentro del contenedor Linux,
# ya que en Docker compilamos y servimos la versión Web (npm run build:web).
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# URL del backend inyectada en tiempo de compilación para Vite
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build:web

# ==============================================================================
# Etapa 2: Servidor Estático (Runner) — Nginx
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Configuración SPA en el puerto 5173 (alineado con CORS por defecto del backend)
RUN printf 'server {\n\
    listen 5173;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location /assets/ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
