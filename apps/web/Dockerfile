# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy pnpm workspace setup
COPY pnpm-workspace.yaml .

# Copy dependency definitions
COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies for the web workspace only
RUN pnpm install --frozen-lockfile --filter ./apps/web

# Copy the rest of the application source code
COPY apps/web/ ./apps/web/

# The port the web app will run on
EXPOSE 3000

# The command to run the application in development mode
CMD ["pnpm", "--filter", "./apps/web", "dev"] 