FROM node:20-alpine

WORKDIR /app

COPY shared/ /app/shared/
RUN cd /app/shared && npm install --production && npm link

COPY abha-mock-service/package.json ./package.json
RUN npm install --production --ignore-scripts 2>/dev/null; exit 0

COPY abha-mock-service/ .

RUN npm link @abha-sync/shared

EXPOSE 3004

CMD ["node", "src/index.js"]
