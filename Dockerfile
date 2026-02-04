FROM node:18

# LibreOffice, Poppler, GraphicsMagick 설치 (HWP/PDF 변환용)
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-l10n-ko \
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
CMD ["pnpm", "run", "start"]

