
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