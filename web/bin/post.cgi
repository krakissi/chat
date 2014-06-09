#!/usr/bin/perl

use strict;
use URI::Encode;

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
$message =~ s/\\/\\\\/g;
$message =~ s/'/%27/g;
$message = qx/echo '$message' | mod_find chat:formatter/;
$message = URI::Encode::uri_encode($message, "\0-\377");
$message =~ s/(['"])/\\\1/g;

my $ip = $ENV{HTTP_X_FORWARDED_FOR} // $ENV{REMOTE_ADDR} // "unknown";
$ip =~ s/\\/\\\\/g;
$ip =~ s/(["'])/\\\1/g;

if(!($user =~ s/OK[\s](.*)/\1/)){
	$user = $ip;
}

my $sql = qq/INSERT INTO log(user, remote_addr, message) VALUES("$user", "$ip", "$message");/;
qx/sqlite3 '$database' '$sql'/;
if($? == 0){
	printf "Status: 204 Received\nContent-Type: text/plain; charset=utf-8\n\nReceived\n";
} else {
	printf "Status: 500 Internal Server Error\n\n";
}

exit 0
