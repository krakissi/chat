#!/usr/bin/perl
# mperron (2014)
#
# Read preference key/value pairs from POST data and inserts them into userprefs.

use strict;
use URI::Escape;
use DBI;

chomp(my $user = qx/mod_find accounts:auth/);

my $dbh = DBI->connect('dbi:mysql:chat', 'kraknet', '') or warn "could not access DB";

my %postvalues;
chomp(my $buffer = <STDIN>);
if(length($buffer) > 0){
	my @pairs = split(/[;&]/, $buffer);
	foreach my $pair (@pairs){
		my ($name, $value) = split(/=/, $pair);
		$value =~ s/\+/ /g;
		$value = uri_unescape($value);
		$postvalues{$name} = $value;
	}
}

if(!($user =~ s/OK[\s](.*)/\1/)){
	printf "Status: 401 Unauthorized\n\n";
	exit 0
}

my $sql = "";

my $color = $postvalues{color};
if((length($color) > 0) && ($color =~ /^[0-9a-fA-F]{6}$/)){
	$color = lc $color;
	$sql .= qq/REPLACE INTO userprefs(user, id_pref, value) VALUES(?, (SELECT id_pref FROM prefs WHERE description='color'), ?);/;
}

my $sth = $dbh->prepare($sql);
if($sth->execute($user, $color)){
	printf "Status: 204 Updated\n\n";
} else {
	printf "Status: 500 Internal Server Error\n\n";
}

exit 0
