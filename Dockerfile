# Use an official Node.js version as base image
FROM node:22-slim

# Install dependencies, including ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg libchromaprint-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .


# Specify the command to run your CLI application
ENTRYPOINT ["node", "--env-file", ".env", "cli.js"]
