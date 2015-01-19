all: formatter

formatter: post.c
	gcc -o formatter -s post.c
