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
