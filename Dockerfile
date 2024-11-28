# Use a lightweight Node.js image
FROM node:20

# Install system dependencies for canvas
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json to optimize caching
COPY package*.json ./

# Install production dependencies only
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application's port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]