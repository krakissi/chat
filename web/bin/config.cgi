#!/usr/bin/perl

use strict;

print "Content-Type: application/json; charset=utf-8\n\n";

chomp(my $user = qx/mod_find accounts:auth/);

my $jsonblob = "{";

if($user =~ s/^OK[\s](.*)$/\1/){
	$jsonblob .= qq/"user": "$user"/;

	chomp(my $homepath = qx/mod_home chat/);
	chdir($homepath);
	my $database = "chat.db";

	my $sql = qq/SELECT value FROM userprefs WHERE user="$user" AND id_pref=(SELECT id_pref FROM prefs WHERE desc="color");/;
	chomp(my $response = qx/sqlite3 '$database' '$sql'/);
	if(($? == 0) and (length($response) == 6)){
		$jsonblob .= qq/, "color": "$response"/;
	}
}

print $jsonblob . "}";
exit 0
