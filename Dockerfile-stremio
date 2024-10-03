# Use Bun's official image
FROM oven/bun:latest
LABEL fly_launch_runtime="Bun"

# Set environment variables
ENV NODE_ENV="production"
ENV PORT=3000

# Set the working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Copy the entire monorepo to the container
COPY . .

# Install all dependencies (monorepo-wide)
RUN bun install

# Change to the stremio package directory
WORKDIR /app/packages/stremio

# Expose the necessary port (adjust if needed)
EXPOSE 3000

# Start the app using the start script in stremio package
CMD ["bun", "run", "start"]
