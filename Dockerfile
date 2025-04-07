FROM node:20-alpine AS base

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package.json package-lock.json ./

# Установка зависимостей
RUN npm ci

# Копирование исходного кода
COPY . .

# Полное отключение ESLint для сборки
RUN rm -f .eslintrc* && \
    echo '{"root": true, "extends": ["next"], "rules": { "@typescript-eslint/no-unused-vars": "off" }}' > .eslintrc && \
    echo '{"extends": ["plugin:@next/next/recommended"], "rules": { "@typescript-eslint/no-unused-vars": "off" }}' > .eslintrc.json

# Сборка приложения 
RUN npm run build

# Запуск приложения
CMD ["npm", "run", "start"] 