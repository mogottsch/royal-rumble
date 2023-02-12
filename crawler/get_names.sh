#!/bin/bash

# use jq to parse .wrestlers[].name from each json file
# in the matches directory and save the output to a file
output_file="names.txt"

for file in matches/*.json; do
    jq -r '.wrestlers[].name' "$file" >> "$output_file"
done

# make names unique

cat "$output_file" | sort | uniq > "$output_file.tmp"
mv "$output_file.tmp" "$output_file"
