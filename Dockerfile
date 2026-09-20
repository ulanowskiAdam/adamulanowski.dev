
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Reduce peak memory usage when building on a small VPS.
ARG NG_BUILD_MAX_WORKERS=1
RUN NG_BUILD_MAX_WORKERS=${NG_BUILD_MAX_WORKERS} npm run build


FROM node:24-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist /app/dist
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/adamulanowski.dev/server/server.mjs"]
