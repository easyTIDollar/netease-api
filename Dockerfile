FROM node:20-alpine

RUN apk add --no-cache tini

ENV NODE_ENV=production

WORKDIR /app

COPY . ./

RUN corepack enable && corepack prepare pnpm@10 --activate && pnpm i --frozen-lockfile

EXPOSE 3000

CMD [ "/sbin/tini", "--", "node", "app.js" ]
