FROM golang:1.19.1-alpine3.16

ARG DEV

WORKDIR /app

# install gcc
RUN apk add --no-cache gcc musl-dev

RUN if [ "$DEV" = "true" ]; \
    then echo "Installing go air" && go install github.com/cosmtrek/air@latest; \
    else echo "Not installing go air"; \
fi

COPY . .

RUN go build -o royal

ENTRYPOINT ["./royal"]
