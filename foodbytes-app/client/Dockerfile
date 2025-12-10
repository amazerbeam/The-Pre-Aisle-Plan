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

# Copy the appropriate nginx config based on environment
COPY nginx.conf /etc/nginx/conf.d/nginx.prod.conf
COPY nginx.dev.conf /etc/nginx/conf.d/nginx.dev.conf
RUN if [ "$NGINX_ENV" = "dev" ]; then \
      cp /etc/nginx/conf.d/nginx.dev.conf /etc/nginx/conf.d/default.conf; \
    else \
      cp /etc/nginx/conf.d/nginx.prod.conf /etc/nginx/conf.d/default.conf; \
    fi && \
    rm /etc/nginx/conf.d/nginx.dev.conf /etc/nginx/conf.d/nginx.prod.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
