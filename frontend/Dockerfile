FROM node:18.20-alpine

WORKDIR /app

RUN npm install -g serve

COPY build /app/build

CMD ["serve", "-s", "build"]
