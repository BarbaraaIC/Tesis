# 1. Imagen base con Node
FROM node:22-alpine

# 2. Carpeta de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiar package.json
COPY package*.json ./

# 4. Instalar dependencias
RUN npm install

# 5. Copiar todo el código
COPY . .

# 6. Build del frontend
RUN npm run build

# 7. Instalar servidor estático
RUN npm install -g serve

# 8. Servir la app
CMD ["serve", "-s", "dist", "-l", "3000"]