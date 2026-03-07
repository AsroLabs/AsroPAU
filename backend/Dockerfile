FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Copy data files that tsc doesn't include in dist (only if they exist)
RUN if [ -d src/db/data ]; then mkdir -p dist/db/data && cp -r src/db/data/* dist/db/data/; fi

# Copy .env for production
COPY .env.docker .env

EXPOSE 3000

CMD ["npm", "start"]
