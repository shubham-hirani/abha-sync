FROM node:20-alpine

WORKDIR /app

COPY shared/ /app/shared/
RUN cd /app/shared && npm install --production && npm link

COPY api-gateway/package.json ./package.json
RUN npm install --production --ignore-scripts 2>/dev/null; exit 0

COPY api-gateway/ .

RUN npm link @abha-sync/shared

# Create data directory for SQLite
RUN mkdir -p /data

ENV DB_PATH=/data/abha-sync.db

EXPOSE 3010

CMD ["sh", "-c", "node src/migrate.js && node src/index.js"]
