FROM node:18

RUN apt-get update -y \
    && apt-get upgrade -y \
    && apt-get -y install curl python3 build-essential git ca-certificates

ENV DEBUG="notes:*,messages:*"
ENV SEQUELIZE_CONNECT="src/models/sequelize-docker-mysql.yaml"
ENV NOTES_MODEL="sequelize"
ENV USER_SERVICE_URL="http://svc-userauth:5858"
ENV PORT="3000"

RUN mkdir -p /notesapp
COPY . /notesapp/

WORKDIR /notesapp
# RUN npm install -g yarn --force
RUN yarn install

VOLUME /sessions

EXPOSE 3000
CMD [ "yarn", "start" ]