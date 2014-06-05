#!/usr/bin/perl
# mperron (2014)
#
# Checks accounts database for the given username and returns a sensible JSON result.

use strict;

print "Content-Type: application/json; charset=utf-8\n\n";

chomp(my $homepath = qx/mod_home accounts/);
chdir($homepath);
my $database = "accounts.db";

my %queryvals;
my $buffer = $ENV{QUERY_STRING};
if(length($buffer) > 0){
	my @pairs = split(/[;&]/, $buffer);
	foreach my $pair (@pairs){
		my ($name, $value) = split(/=/, $pair);
		$value =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
		chomp($queryvals{$name} = $value);
	}
}

my $exists = "false";

my $name = lc $queryvals{name};
if($name =~ /^[a-z\d]{4,}+$/){
	my $sql = qq/SELECT name FROM users WHERE name="$name" LIMIT 1;/;
	chomp(my $response = qx/sqlite3 '$database' '$sql'/);
	$exists = "true" if(length($response) > 0);
}

print qq/{ "exists": $exists }/;
exit 0
