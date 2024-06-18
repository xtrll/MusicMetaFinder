# Stage 1: Setup Dependencies
FROM node:22-slim AS dependencies
WORKDIR /app

# Install runtime dependencies (ffmpeg and chromaprint-tools)
RUN apt-get update && \
    apt-get install -y ffmpeg libchromaprint-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json to install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Stage 2: Final Stage
FROM node:22-slim
WORKDIR /app

# Install runtime dependencies again (ffmpeg and chromaprint-tools)
RUN apt-get update && \
    apt-get install -y ffmpeg libchromaprint-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy application files and dependencies from dependencies stage
COPY --from=dependencies /app /app

# Prune development dependencies
RUN npm prune --production

# Specify the command to run your CLI application
ENTRYPOINT ["node", "--env-file", ".env", "cli.js"]

