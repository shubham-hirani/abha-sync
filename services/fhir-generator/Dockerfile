FROM node:20-alpine

WORKDIR /app

COPY shared/ /app/shared/
RUN cd /app/shared && npm install --production && npm link

COPY fhir-generator/package.json ./package.json
RUN npm install --production --ignore-scripts 2>/dev/null; exit 0

COPY fhir-generator/ .

RUN npm link @abha-sync/shared

EXPOSE 3003

CMD ["node", "src/index.js"]
