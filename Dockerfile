## Multi-stage Dockerfile for server (Node + Python deps) suitable for Render
# Build stage: install build tools, compile native modules and install Python requirements
FROM node:18-bullseye AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential python3 python3-dev python3-pip python3-distutils ca-certificates \
    libx11-dev libgl1-mesa-dev libglu1-mesa-dev pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Install server node deps
COPY server/package*.json server/
RUN cd server && npm ci --no-audit --no-fund

# Copy server source
COPY server/ server/

# Install Python requirements (if any)
COPY server/requirements.txt server/requirements.txt
RUN python3 -m pip install --upgrade pip setuptools wheel \
  && if [ -s server/requirements.txt ]; then python3 -m pip install -r server/requirements.txt; fi

# Production stage: smaller runtime image
FROM node:18-bullseye-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libx11-6 libgl1-mesa-glx libglu1-mesa \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/app

# Copy built server from build stage
COPY --from=build /opt/app/server /opt/app/server

WORKDIR /opt/app/server

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
