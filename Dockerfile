FROM node:18

WORKDIR /server/
COPY . /server/

EXPOSE 3000

RUN apt-get update && \
    apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev && \
    rm -rf /var/lib/apt/lists/*


RUN npm install --verbose
RUN npm run build

CMD npm run start