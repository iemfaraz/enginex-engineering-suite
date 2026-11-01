FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node server ./server
COPY --chown=node:node app ./app
COPY --chown=node:node assets ./assets
COPY --chown=node:node index.html login.html account.html ./
RUN mkdir /data && chown node:node /data
USER node
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/data/enginex.sqlite
EXPOSE 3000
CMD ["node","server/server.js"]
