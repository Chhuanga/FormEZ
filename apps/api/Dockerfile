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
COPY apps/api/package.json ./apps/api/

# Install dependencies for the API workspace only
# This leverages Docker layer caching to avoid reinstalling dependencies on every code change.
RUN pnpm install --frozen-lockfile --filter ./apps/api

# Copy the Prisma schema to generate the client
COPY apps/api/prisma ./apps/api/prisma

# Generate the Prisma client
RUN pnpm --filter ./apps/api exec prisma generate

# Copy the rest of the application source code
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/tsconfig.build.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/
COPY tsconfig.json .

# Copy the entrypoint script and make it executable
COPY apps/api/entrypoint.sh .
RUN chmod +x ./entrypoint.sh

# The port the API will run on
EXPOSE 3001

# The command to run the application
ENTRYPOINT ["/usr/src/app/entrypoint.sh"] 