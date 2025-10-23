# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY . .

# Expose port 80
EXPOSE 80

# Start development server
CMD ["npm", "start"]
