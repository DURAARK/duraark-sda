FROM ubuntu:14.04

RUN DEBIAN_FRONTEND=noninteractive

# Install NodeJS from PPA
RUN apt-get install python software-properties-common -y
RUN add-apt-repository ppa:chris-lea/node.js -y
RUN apt-get update -y
RUN apt-get -y install build-essential nodejs curl -y
RUN npm install sails nodemon -g

# Bundle app, install, expose and finally run it
COPY ./ /duraark/microservice
WORKDIR /duraark/microservice

EXPOSE 5013

RUN npm install

CMD ["sails", "lift", "--prod"]
