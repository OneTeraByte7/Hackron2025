## Multi-stage Dockerfile for server (Node + Python deps) when build context is `server/`
# Build stage: install build tools, compile native modules and install Python requirements
FROM node:18-bullseye AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential python3 python3-dev python3-pip python3-distutils ca-certificates \
    libx11-dev libgl1-mesa-dev libglu1-mesa-dev pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Install node deps using package files from the server context
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy server source (build context is server/)
COPY . .

# Install Python requirements (if any)
COPY requirements.txt requirements.txt
RUN python3 -m pip install --upgrade pip setuptools wheel \
  && if [ -s requirements.txt ]; then python3 -m pip install -r requirements.txt; fi

# Production stage: smaller runtime image
FROM node:18-bullseye-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libx11-6 libgl1-mesa-glx libglu1-mesa \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Copy built server from build stage
COPY --from=build /opt/app /opt/app

WORKDIR /opt/app

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
