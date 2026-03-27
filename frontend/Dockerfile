# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY ./src /app/src/
COPY tsconfig.json /app/
COPY ./public /app/public/
RUN npm run build

# --- Production stage ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
