# Dockerfile para backend Node.js
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/. ./
EXPOSE 4000
CMD ["node", "app.js"]
