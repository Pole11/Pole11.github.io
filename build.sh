#!/bin/bash

gcc -c ./src/main.c -o ./out/main.o
gcc -c ./src/lib/parse.c -o ./out/parse.o
gcc -c ./src/lib/fs.c -o ./out/fs.o

gcc ./out/main.o ./out/parse.o ./out/fs.o -o ./out/runme -g -fsanitize=address