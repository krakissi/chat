#!/usr/bin/perl

use strict;

print "Content-Type: application/json; charset=utf-8\n\n";

chomp(my $user = qx/mod_find accounts:auth/);

my $jsonblob = "{";

if($user =~ s/^OK[\s](.*)$/\1/){
	$jsonblob .= qq/"user": "$user"/;
}

print $jsonblob . "}";
exit 0
