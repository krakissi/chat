all: formatter chat.db

formatter: post.c
	gcc -o formatter -s post.c
