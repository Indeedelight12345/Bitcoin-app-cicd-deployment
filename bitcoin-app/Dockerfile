# Use official Nginx image as base
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default Nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy application files to Nginx root directory
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Expose port 80
EXPOSE 80



# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]