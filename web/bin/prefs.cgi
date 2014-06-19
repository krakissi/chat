#!/usr/bin/perl
# mperron (2014)
#
# Read preference key/value pairs from POST data and inserts them into userprefs.

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
	$sql .= qq/REPLACE INTO userprefs(user, id_pref, value) VALUES("$user", (SELECT id_pref FROM prefs WHERE desc="color"), "$color");/;
}

qx/sqlite3 '$database' '$sql'/;
if($? == 0){
	printf "Status: 204 Updated\n\n";
} else {
	printf "Status: 500 Internal Server Error\n\n";
}

exit 0
