
```shell
docker build . -t suigo
docker run --rm -p 8080:80 -v /var/run/docker.sock:/var/run/docker.sock:ro -v $PWD/config:/app/config:ro suigo:latest
```

```
    labels:
    
      - suigo.name=Nginx
      - suigo.description=Reverse proxy
      - suigo.group=test
      - suigo.href=https://github.com
      - suigo.icon=mdi-message-video
```


```
services:
  nginx1:
    image: nginx
    labels:
      - suigo.group=System
      - suigo.name=Nginx
      - suigo.icon=cib-nginx
      # - suigo.href=
      - suigo.description=Web server and a reverse proxy server

  nginx2:
    image: nginx
    labels:
      - suigo.group=Administrator
      - suigo.name=Syncthing
      - suigo.icon=arcticons-syncthing
      - suigo.href=https://syncthing.${DOMAIN_LOCAL}
      - suigo.description=Peer-to-peer file synchronization  

  nginx3:
    image: nginx
    labels:
      - suigo.group=Administrator
      - suigo.name=Prometheus
      - suigo.icon=cbi-prometheusio
      - suigo.href=https://prometheus.${DOMAIN_LOCAL}
      - suigo.description=Event monitoring and alerting
```