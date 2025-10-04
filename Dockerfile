FROM node:18

WORKDIR /server/

COPY package.json ./

RUN npm install -g pnpm
ENV CI=true
RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "run", "start"]
