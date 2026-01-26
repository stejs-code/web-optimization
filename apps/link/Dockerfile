FROM golang:1.25-trixie AS build

WORKDIR /usr/share/app

COPY . .

ENV CGO_ENABLED=1
RUN go build -o link main.go

FROM debian:trixie-slim AS production

WORKDIR /usr/share/app

COPY --from=build /usr/share/app/link .

COPY --from=build /usr/share/app/404.html .

EXPOSE 8080

ENV GIN_MODE=release

CMD /usr/share/app/link