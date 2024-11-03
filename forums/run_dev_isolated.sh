# This runs the container isolated from the rest services.
# Only use for development purposes.
NODE_ENV=development RUNTIME=dev docker compose run -v $(pwd):/usr/src/app forums