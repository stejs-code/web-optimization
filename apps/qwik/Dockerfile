FROM oven/bun:1 AS production

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile


COPY . .

RUN ls

RUN bun run build
RUN bun run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["bun", "run", "serve"]
