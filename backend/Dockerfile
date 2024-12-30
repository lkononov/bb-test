FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS dev
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS prod
ENV NODE_ENV=production
COPY . .
CMD ["npm", "start"]
