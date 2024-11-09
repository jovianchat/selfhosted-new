# Use alpine Node image as base
FROM node:bookworm-slim

# Install nginx & supervisor
RUN apt update && apt install -y nginx supervisor && apt clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy files
COPY ../frontend/build /app/ui/build
COPY ../frontend/node_modules /app/ui/node_modules
COPY ../frontend/package.json /app/ui/package.json
COPY ../backend/axum-api /app/api/axum

# Change ownership of Working Directory to UID 1000
RUN chown -R 1000:1000 /app

# Copy Start Script
COPY docker_entrypoint.sh /etc/app/init.sh
RUN chmod +x /etc/app/init.sh

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy supervisord config
COPY supervisord.conf /etc/supervisord.conf

# Start supervisord
ENTRYPOINT ["/etc/app/init.sh"]