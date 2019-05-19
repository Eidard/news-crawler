# Create Node Docker container
FROM node:latest
MAINTAINER dragon20002@sdkim.org

# Copy sources to container
COPY . /usr/src/app

# Change working directory in container
WORKDIR /usr/src/app

# Install npm dependency
RUN npm install

# Open port 50000
EXPOSE 50000

# Run news crawler
CMD npm start

# HOW TO use Dockerfile
# Edit private/config.json, private/credentials.json files (See README.md)
# $ docker build -t news-crawler
# $ docker run -d -p {prefer_port}:50000 news-crawler