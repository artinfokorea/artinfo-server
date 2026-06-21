FROM node:18

# Poppler, GraphicsMagick 설치 (PDF 변환용)
RUN apt-get update && apt-get install -y \
    poppler-utils \
    graphicsmagick \
    ghostscript \
    fonts-nanum \
    fonts-nanum-coding \
    fonts-nanum-extra \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /server/

COPY package.json ./

RUN npm install -g pnpm
ENV CI=true
RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000
# 운영 실행: 이미지에 이미 빌드된 dist를 그대로 구동한다.
# (pnpm run start = nest start 는 컨테이너 부팅마다 tsc 재컴파일을 돌려 CPU/RAM을 크게 잡아먹으므로 사용하지 않는다)
CMD ["node", "dist/main"]

