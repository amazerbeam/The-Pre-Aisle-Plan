# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Build arg to select nginx config: "dev" or "prod" (default: prod)
ARG NGINX_ENV=prod

COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx config and copy only the appropriate one
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /tmp/nginx.prod.conf
COPY nginx.dev.conf /tmp/nginx.dev.conf
RUN if [ "$NGINX_ENV" = "dev" ]; then \
      mv /tmp/nginx.dev.conf /etc/nginx/conf.d/default.conf; \
    else \
      mv /tmp/nginx.prod.conf /etc/nginx/conf.d/default.conf; \
    fi && \
    rm -f /tmp/nginx.*.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
