#!/bin/bash

# Set output path relative to project root
output_file="data/names.txt"

# Extract names from all match files, sort and deduplicate
jq -r '.wrestlers[].name' data/matches/*.json | sort -u > "$output_file"

echo "Created $output_file"
