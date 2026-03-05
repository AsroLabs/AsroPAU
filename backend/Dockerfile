FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Copy .env for production
COPY .env.docker .env

EXPOSE 3000

CMD ["npm", "start"]
