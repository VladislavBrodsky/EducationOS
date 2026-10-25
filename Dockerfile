FROM node:24-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS dependencies
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder
COPY . .
ARG PYTHON_API_URL=http://api:8000
ENV PYTHON_API_URL=$PYTHON_API_URL
RUN mkdir -p public && npm run build

FROM node:24-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
RUN groupadd --system --gid 1001 educationos && useradd --system --uid 1001 --gid 1001 educationos
COPY --from=builder --chown=educationos:educationos /app/.next/standalone ./
COPY --from=builder --chown=educationos:educationos /app/.next/static ./.next/static
COPY --from=builder --chown=educationos:educationos /app/public ./public
USER educationos
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
