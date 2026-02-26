FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm

COPY . .

RUN pnpm install

EXPOSE 5173

CMD ["pnpm", "dev", "--host"] 

