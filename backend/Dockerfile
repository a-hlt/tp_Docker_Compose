# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies for testing/building if needed)
RUN npm ci

# Copy application source code
COPY . .

# ==========================================
# Stage 2: Production Release
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set NODE_ENV to production to optimize runtime
ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application code from builder stage
COPY --from=builder /usr/src/app/index.js ./

# Use a non-privileged system user for container security
USER node

EXPOSE 3000

CMD ["node", "index.js"]
