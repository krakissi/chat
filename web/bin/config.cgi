#!/usr/bin/perl

use strict;
use DBI;

print "Content-Type: application/json; charset=utf-8\n\n";

chomp(my $user = qx/mod_find accounts:auth/);

my $jsonblob = "{";

if($user =~ s/^OK[\s](.*)$/\1/){
	$jsonblob .= qq/"user": "$user"/;

	my $dbh = DBI->connect('dbi:mysql:chat', 'kraknet', '') or warn "could not access DB";

	my $sth = $dbh->prepare(qq/SELECT value FROM userprefs WHERE user=? AND id_pref=(SELECT id_pref FROM prefs WHERE description='color');/);
	$sth->execute($user);

	my @row = $sth->fetchrow_array();
	my $response = $row[0];

	if((length($response) == 6)){
		$jsonblob .= qq/, "color": "$response"/;
	}
}

print $jsonblob . "}";
exit 0
