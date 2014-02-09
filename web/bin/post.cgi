#!/usr/bin/perl

use strict;
use URI::Encode;

chomp(my $homepath = qx/mod_home chat/);
chdir($homepath);
my $database = "chat.db";

my %postvalues;
chomp(my $buffer = <STDIN>);
if(length($buffer)>0){
	my @pairs=split(/[;&]/, $buffer);
	foreach my $pair (@pairs){
		my ($name, $value) = split(/=/, $pair);
		$value =~ s/\+/ /g;
		$value = URI::Encode::uri_decode($value);
		$postvalues{$name} = $value;
	}
}
my $message = URI::Encode::uri_encode($postvalues{'message'}, "\0-\377");

my $sql = qq/INSERT INTO log(user, remote_addr, message) VALUES('krakissi', '$ENV{'REMOTE_ADDR'}', '$message');/;
qx/sqlite3 "$database" "$sql"/;

printf "Status: 204 Received\nContent-Type: text/plain; charset=utf-8\n\nReceived\n";

exit 0
