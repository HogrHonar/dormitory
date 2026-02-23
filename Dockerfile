FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

CMD ["sh", "-c", "pnpm run db:deploy && pnpm run dev"]