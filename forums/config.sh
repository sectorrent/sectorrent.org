#!/bin/bash

CONFIG_FILE=""

case "$RUNTIME" in
  "prod")
    CONFIG_FILE="/env/prod.env";
    ;;
  "debug")
    CONFIG_FILE="/env/debug.env";
    ;;
  *)
    CONFIG_FILE="/env/dev.env";
    ;;
esac

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Config file not found: $CONFIG_FILE"
  exit 1
fi

source "$CONFIG_FILE"

INPUT_FILE="templates/config.template.json"
OUTPUT_FILE="config.json"

cp "$INPUT_FILE" "$OUTPUT_FILE"

while IFS='=' read -r key value; do
  if [ -z "$key" ] || [[ $key == \#* ]]; then
    continue
  fi

  if [[ "$value" =~ "BASE64\("* ]]; then
    value=${value:8:${#value}-10};
    value=$(echo "$value" | base64 -d)
    value=$(echo "$value" | sed -e 's/\\/\\\\/g' \
                                   -e 's/"/\\"/g' \
                                   -e 's/\n/\\n/g' \
                                   -e 's/\r/\\r/g' \
                                   -e 's/\t/\\t/g')
  fi

  sed -i "s|\${$key}|$value|g" "$OUTPUT_FILE"
done < "$CONFIG_FILE"

#cat $OUTPUT_FILE

node app.js
