# Etapa 1: Construcción
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor estático con NGINX
FROM nginx:alpine

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build
COPY --from=build /app/dist /usr/share/nginx/html

# Cambiar el puerto por defecto de NGINX a 5173
RUN sed -i 's/listen       80;/listen       5173;/' /etc/nginx/conf.d/default.conf

EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]

