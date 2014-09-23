/*
	post.cgi
	Mike Perron (2013-2014)

	Message formatting from kc1. I should probably rewrite these rules
	as regex in perl. Some day.
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char x2c(char *what){
	register char digit;
	digit=(what[0]>='A'?((what[0]&0xdf)-'A')+10:(what[0]-'0'));
	digit*=16;
	digit+=(what[1]>='A'?((what[1]&0xdf)-'A')+10:(what[1]-'0'));
	return digit;
}

void unescape_url(char *url){
	register int x, y;
	for(x=0, y=0;url[y];++x, ++y){
		if((url[x]=url[y])=='%'){
			url[x]=x2c(&url[y+1]);
			y+=2;
		}
	}
	url[x]=0;
}
void chomp(char *str){
	if((str = strpbrk(str, "\r\n")))
		*str = 0;
}

int hashtag = 0;
void unhash(){
	while(hashtag > 0){
		fputs("</span>", stdout);
		hashtag--;
	}
}

int main(){
	char *str, *s, *s_a, *cmd;

	// Formatting counters.
	int anchor_count = 0;
	int bold_count = 0;
	int code_count = 0;
	int implying = 0;
	int inquote = 0;
	int italic_count = 0;
	int strike_count = 0;

	// TODO: this should read until EOF.
	//Read POST
	fgets(str = calloc(2048, sizeof(char)), 2048, stdin);
	chomp(s = str);

	//Decode
	for(s_a = s; *s_a; s_a++)
		if(*s_a == '+')
			*s_a = ' ';
	unescape_url(s);
	s_a = s;
	while((*s_a == '\r') || (*s_a == '\n') || (*s_a==' '))
		s_a++, s++;
	if(*s == 0)
		return 0;

	if(*s == '>'){
		implying = 1;
		if(strpbrk(s, "\r\n"))
			fputs("<br>", stdout);
		fputs("<span class=greentext>", stdout);
	}
	for(s_a = s; *s_a; s_a++){
		switch(*s_a){
			case '\r':
			case '\n':
				unhash();
				if(implying){
					fputs("<br>", stdout);
					if(*(s_a + 1) != '>')
						fputc('>', stdout);
				} else fputc(*s_a, stdout);
				break;
			case '.': case '!': case '?':
			case '-': case ',': case ';':
			case ':':
			case ' ':
				unhash();
				fputc(*s_a, stdout);
				break;
			case '#':
			case '@':
				if(!(((*(s_a - 1) >= 'A') && (*(s_a - 1) <= 'Z')) || ((*(s_a - 1) >= 'a') && (*(s_a - 1) <= 'z'))) &&
					!((*(s_a - 1) >= '0') && (*(s_a - 1) <= '9'))){
					if(!hashtag){
						hashtag++;
						fprintf(stdout, "<span class=hashtag>%c", *s_a);
					} else fputc(*s_a, stdout);
				} else fputc(*s_a, stdout);
				break;
			case 'h':
				if((cmd = strstr(s_a, "http://")) == s_a){
					if(cmd = strstr(s_a + 7, " "))
						*cmd = 0;
					fprintf(stdout, "<a href=\"%s\">%s</a>", s_a, s_a);
					if(cmd)
						*cmd = ' ';
					else for(cmd = s_a; *cmd; cmd++);
					s_a = cmd - 1;
				} else {
					if((cmd = strstr(s_a, "https://")) == s_a){
						if((cmd = strstr(s_a + 8, " ")))
							*cmd = 0;
						fprintf(stdout, "<a href=\"%s\">%s</a>", s_a, s_a);
						if(cmd)
							*cmd = ' ';
						else for(cmd = s_a; *cmd; cmd++);
						s_a = cmd - 1;
					} else fputs("h", stdout);
				}
				break;
			case '\"':
				if(*(s_a-1) != '\\'){
					if(inquote){
						inquote = 0;
						fprintf(stdout, "&quot;</span>");
					} else {
						if(!((*(s_a - 1) >= 'A') && (*(s_a - 1) <= 'Z')) &&
							!((*(s_a - 1) >= 'a') && (*(s_a - 1) <= 'z')) &&
							!((*(s_a - 1) >= '0') && (*(s_a - 1) <= '9'))
						){
							inquote = 1;
							fprintf(stdout, "<span class=\"inlinequote\">&quot;");
						} else fputs("\"", stdout);
					}
				} else fputs("\"", stdout);
				break;
			case '<':
				unhash();
				if(code_count){
					if((cmd = strstr(s_a, "</code>")) == s_a){
						if(code_count == 0){
							fputs("&lt;", stdout);
							continue;
						}
						fputs("</span>", stdout);
						code_count--;
						s_a += 6;
					} else fputs("&lt;", stdout);
				} else switch(*(s_a + 1)){
					case 'a':
						if((s_a == strstr(s_a, "<a href=")) && (cmd = strstr(s_a, ">")) &&
							!(
								strstr(s_a, "javascript:") ||
								strstr(s_a, "onclick=") ||
								strstr(s_a, "onmouseover=") ||
								strstr(s_a, "onblur=")
							)
						){
							*cmd = 0;
							fputs(s_a, stdout);
							anchor_count++;
							fputs(">", stdout);
							*cmd = '>';
							s_a = cmd;
						} else fputs("&lt;", stdout);
						break;
					case 'b':
						if((cmd = strstr(s_a, "<b>")) == s_a){
							fputs("<b>", stdout);
							bold_count++;
							s_a += 2;
						} else {
							if((cmd = strstr(s_a, "<br>")) == s_a){
								fputs("<br>", stdout);
								s_a += 3;
							} else fputs("&lt;", stdout);
						}
						break;
					case 'c':
						if((cmd = strstr(s_a, "<code>")) == s_a){
							fputs("<br><span class=code>", stdout);
							code_count++;
							s_a += 5;
						} else fputs("&lt;", stdout);
						break;
					case 'i':
						if((cmd = strstr(s_a, "<i>")) == s_a){
							fputs("<i>", stdout);
							italic_count++;
							s_a += 2;
						} else fputs("&lt;", stdout);
						break;
					case 's':
						if((cmd = strstr(s_a, "<strike>")) == s_a){
							fputs("<span style=\"text-decoration:line-through;\">", stdout);
							strike_count++;
							s_a += 7;
						} else fputs("&lt;", stdout);
						break;

					//All closing tags are handled here
					case '/':
						switch(*(s_a + 2)){
							case 'a':
								if((cmd = strstr(s_a, "</a>")) == s_a){
									if(anchor_count == 0){
										fputs("&lt;", stdout);
										continue;
									}
									fputs("</a>", stdout);
									anchor_count--;
									s_a += 3;
								} else fputs("&lt;", stdout);
								break;
							case 'b':
								if((cmd = strstr(s_a, "</b>")) == s_a){
									if(bold_count == 0){
										fputs("&lt;", stdout);
										continue;
									}
									fputs("</b>", stdout);
									bold_count--;
									s_a += 3;
								} else fputs("&lt;", stdout);
								break;
							case 'c':
								if((cmd = strstr(s_a, "</code>")) == s_a){
									if(code_count == 0){
										fputs("&lt;", stdout);
										continue;
									}
									fputs("</span>", stdout);
									code_count--;
									s_a += 6;
								} else fputs("&lt;", stdout);
								break;
							case 'i':
								if((cmd = strstr(s_a, "</i>")) == s_a){
									if(italic_count == 0){
										fputs("&lt;", stdout);
										continue;
									}
									fputs("</i>", stdout);
									italic_count--;
									s_a += 3;
								} else fputs("&lt;", stdout);
								break;
							case 's':
								if((cmd = strstr(s_a, "</strike>")) == s_a){
									if(strike_count == 0){
										fputs("&lt;", stdout);
										continue;
									}
									fputs("</span>", stdout);
									strike_count--;
									s_a += 8;
								} else fputs("&lt;", stdout);
								break;
							default:
								fputs("&lt;", stdout);
						}
						break;
					default:
						fputs("&lt;", stdout);
				}
				break;
			case '>':
				fputs("&gt;", stdout);
				break;
			default:
				fputc(*s_a, stdout);
		}
	}

	while(bold_count-- > 0)
		fputs("</b>", stdout);
	while(code_count-- > 0)
		fputs("</span>", stdout);
	while(italic_count-- > 0)
		fputs("</i>", stdout);
	while(strike_count-- > 0)
		fputs("</span>", stdout);
	while(anchor_count-- > 0)
		fputs("</a>", stdout);
	while(hashtag-- > 0)
		fputs("</span>", stdout);
	if(implying)
		fputs("</span>", stdout);
	if(inquote)
		fputs("</span>", stdout);

	return 0;
}
