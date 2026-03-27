# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json /app/
RUN npm install
COPY ./src /app/src/
COPY tsconfig.json /app/
COPY ./public /app/public/
ARG REACT_APP_API_URL=http://localhost:8000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# --- Production stage ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
