FROM nginx:alpine
ARG GIT_SHA=unknown
COPY . /usr/share/nginx/html
RUN echo "$GIT_SHA" > /usr/share/nginx/html/version.txt
