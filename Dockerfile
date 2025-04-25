FROM golang:1-alpine AS builder

RUN mkdir /work
WORKDIR /work

COPY 	go.mod	.
COPY 	go.sum	.
COPY 	*.go	.

RUN go build -o suigo

FROM alpine:latest

COPY --from=builder /work/suigo /app/suigo
COPY assets /app/assets
COPY config /app/config

RUN chown -R nobody:nobody /app/config

EXPOSE 8080
# USER nobody
WORKDIR /app

VOLUME ["/app/config"]
ENTRYPOINT  ["/app/suigo"]
CMD [ "-p=8080" ]
