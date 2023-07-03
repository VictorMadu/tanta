FROM node:16-alpine
WORKDIR /app

COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install

COPY ./src ./src
COPY ./test ./test 
COPY ./nest-cli.json ./
COPY ./knexfile.ts ./
COPY ./tsconfig* ./
COPY ./jest* ./
COPY ./.eslintrc.js ./
COPY .prettierrc ./

RUN ls -lah .

RUN yarn build

CMD yarn mr-u && yarn start
