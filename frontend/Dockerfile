# Dockerfile dla React (frontend)
FROM node:14 as build

WORKDIR /app

COPY package.json package-lock.json ./

ENV NPM_CONFIG_CACHE=/usr/src/app/.npm-cache
ENV PATH /app/node_modules/.bin:$PATH
#Change to prod
ENV NODE_ENV=development

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/usr/src/app/.npm-cache \
    npm ci \
    npm install @stripe/stripe-js 

COPY . .
RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]