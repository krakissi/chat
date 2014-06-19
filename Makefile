all: formatter chat.db

formatter: post.c
	gcc -o formatter -s post.c

chat.db:
	if ! [ -e "chat.db" ]; then sqlite3 "chat.db" < krakchat.dbdef; fi
