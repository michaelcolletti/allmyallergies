# AllMyAllergies Development Container
# Supports SPARC methodology + claude-flow + AgentDB agentic-flow

FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install additional system dependencies
RUN apt-get update && apt-get install -y \
    watchman \
    openjdk-17-jdk \
    android-sdk \
    && rm -rf /var/lib/apt/lists/*

# Set Android SDK environment (for Android builds)
ENV ANDROID_HOME=/usr/lib/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Install Python for SPARC CLI
RUN apt-get update && apt-get install -y python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    expo-cli \
    eas-cli \
    @expo/ngrok \
    typescript \
    ts-node \
    nodemon \
    concurrently \
    claude-flow

# Install SPARC CLI (if available via pip)
RUN pip3 install sparc --break-system-packages 2>/dev/null || true

# Create directories
RUN mkdir -p /home/node/.claude/memory

# Set working directory
WORKDIR /workspaces/allmyallergies

# Switch to node user
USER node
