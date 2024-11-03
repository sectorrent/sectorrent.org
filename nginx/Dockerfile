# Use the official Nginx base image
FROM nginx:alpine

# Expose ports
EXPOSE 80
EXPOSE 443

# Copy the custom Nginx configuration file
#COPY nginx.conf /etc/nginx/nginx.conf

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
