#!/bin/bash

cp ./crawler/data/saved_superstars.json ./backend/laravel/storage/app/saved_superstars.json
mkdir -p ./backend/laravel/storage/app/public/wrestlers
cp ./crawler/data/images/* ./backend/laravel/storage/app/public/wrestlers/
