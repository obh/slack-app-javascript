
## Description
A Slack App built on the [NestJS Framework](https://nestjs.com/) utilizing [Prisma](https://www.prisma.io/). 
Prisma is used as the installation store and also for other functionality. 

## Build
Build the docker image
```bash
$ docker build -t slack-app .
```

## Running the app

```bash
$ docker run -p 3000:3000 --env-file .env -d slack-app
```

## Without Docker

```bash
# Build Prisma
$ npx prisma generate --schema=prisma/schema.prisma

# Build 
$ npm run build

# Start the server
$ npm start
```

