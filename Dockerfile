# Stage 1: Сборка приложения
FROM node:20-alpine AS builder
WORKDIR /app

# Копирование зависимостей и установка пакетов
COPY package.json package-lock.json ./
RUN npm ci

# Копирование исходников и сборка проекта
COPY . .
RUN npm run build

# Stage 2: Подготовка продакшн-образа
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Копируем необходимые файлы из стадии сборки
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
# Открываем порт, на котором работает приложение
EXPOSE 3000

# Команда для запуска приложения
CMD ["npm", "start"]
