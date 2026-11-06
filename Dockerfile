
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY classifier.js /usr/share/nginx/html/
COPY model.json /usr/share/nginx/html/

EXPOSE 80
