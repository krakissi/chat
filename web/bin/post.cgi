#!/usr/bin/perl

use strict;
use URI::Escape;
use DBI;

my $dbh = DBI->connect('dbi:mysql:chat', 'kraknet', '') or warn "could not access DB";

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

if(length($message) > 10000){
	printf "Status: 413 Message Too Long\n\n";
	exit 0;
} elsif(length($message) == 0){
	printf "Status: 400 Message Too Short\n\n";
	exit 0;
}

my $ip = $ENV{HTTP_X_FORWARDED_FOR} // $ENV{REMOTE_ADDR} // "unknown";

if(!($user =~ s/OK[\s](.*)/\1/)){
	$user = $ip;
}

my $sth = $dbh->prepare(qq/INSERT INTO log(user, remote_addr, message) VALUES(?, ?, ?);/);
$sth->execute($user, $ip, $message) or warn "could not insert message";

printf "Status: 204 Received\nContent-Type: text/plain; charset=utf-8\n\nReceived\n";

exit 0
