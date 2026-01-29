# Base stage
FROM oven/bun:1 AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NODE_ENV=production
RUN bun run build

# Remove dev dependencies
RUN bun install --frozen-lockfile --production

# Production stage
FROM base AS production
WORKDIR /app

# Copy built application
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy static assets
COPY --from=builder /app/static ./static

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Start the application
CMD ["bun", "run", "build/index.js"]
