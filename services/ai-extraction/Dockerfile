FROM node:20-alpine

WORKDIR /app

# Copy and install shared module, link globally
COPY shared/ /app/shared/
RUN cd /app/shared && npm install --production && npm link

# Copy service package.json and install deps (without file: dep)
COPY ai-extraction/package.json ./package.json
RUN npm install --production --ignore-scripts 2>/dev/null; exit 0

# Copy service source
COPY ai-extraction/ .

# Link shared (must be after COPY to avoid overwrite)
RUN npm link @abha-sync/shared

EXPOSE 3001

CMD ["node", "src/index.js"]
