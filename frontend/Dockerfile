FROM node:22

WORKDIR /app

COPY package*.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

EXPOSE 5173

ENV ORIGIN=http://localhost:5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"] 

