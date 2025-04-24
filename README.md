
```shell
docker build . -t suigo
docker run --rm -p 8080:80 --user "1000:973" -v /var/run/docker.sock:/var/run/docker.sock:ro -v $PWD/config:/app/config:ro suigo:latest
```

```
    labels:
      - suigo.name=Nginx2
      - suigo.description=Reverse proxy
      - suigo.href=https://github.com
      - suigo.icon=message-video
```