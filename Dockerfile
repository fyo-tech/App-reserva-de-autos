# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa de runtime estático
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

#Agregar fallback para SPA
RUN sed -i 's/index  index.html index.htm/index  index.html index.htm;\n    try_files $uri $uri/ /index.html;/g' /etc/nginx/conf.d/default.conf

EXPOSE 80