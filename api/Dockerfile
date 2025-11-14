FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copier tout le projet (inclut prisma/)
COPY . .

# ✅ Générer les fichiers Prisma
RUN npx prisma generate

# ✅ Compiler le projet NestJS
RUN npm run build

# --- IMAGE FINALE ---
FROM node:20-alpine
WORKDIR /app

# Copier le build et les dépendances
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env .env                 

EXPOSE 3003

# ✅ Lancement du serveur NestJS
CMD ["node", "dist/main"]
