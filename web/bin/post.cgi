#!/usr/bin/perl

use strict;
use URI::Escape;

chomp(my $homepath = qx/mod_home chat/);
chdir($homepath);
my $database = "chat.db";

chomp(my $user = qx/mod_find accounts:auth/);

my %postvalues;
chomp(my $buffer = <STDIN>);
if(length($buffer) > 0){
	my @pairs = split(/[;&]/, $buffer);
	foreach my $pair (@pairs){
		my ($name, $value) = split(/=/, $pair);
		$postvalues{$name} = $value;
	}
}
my $message = $postvalues{message};
$message =~ s/'/'"'"'/g; # Oh Bash, you so silly.
$message = qx/echo '$message' | mod_find chat:formatter/;

$message = uri_escape($message);
$message =~ s/"/\\"/g;
$message =~ s/'/'"'"'/g;

if(length($message) > 1024){
	printf "Status: 400 Message Too Long\n\n";
	exit 0;
}

my $ip = $ENV{HTTP_X_FORWARDED_FOR} // $ENV{REMOTE_ADDR} // "unknown";
$ip =~ s/\\/\\\\/g;
$ip =~ s/"/\\"/g;
$ip =~ s/'/'"'"'/g;

if(!($user =~ s/OK[\s](.*)/\1/)){
	$user = $ip;
}

&post(3);

sub post {
	my $attempts = shift;

	if($attempts <= 0){
		printf "Status: 500 Internal Server Error\n\n";
	} else {
		my $sql = qq/INSERT INTO log(user, remote_addr, message) VALUES("$user", "$ip", "$message");/;
		qx/sqlite3 '$database' '$sql'/;
		if($? == 0){
			printf "Status: 204 Received\nContent-Type: text/plain; charset=utf-8\n\nReceived\n";
		} else {
			sleep(1);
			&post($attempts - 1);
		}
	}
}

exit 0
