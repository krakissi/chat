#!/usr/bin/perl
# chat
# Mike Perron (2014)
#
# This script handles retrieving new messages from the database and returning
# them to the requesting user. Response are always JSON objects and can contain
# meta information.

use strict;
use DBI;

my $dbh = DBI->connect('dbi:mysql:chat', 'kraknet', '') or warn "could not access DB";

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

my $sql = qq/SELECT id_message, timestamp, remote_addr, user, message FROM log/;

my $last = $queryvals{t};
$last =~ s/\\/\\\\/g;
$last =~ s/"/\\"/g;
$last =~ s/'/'"'"'/g;

$sql .= ((length($last) == 0) or ($last eq "never")) ? ' ORDER BY timestamp DESC LIMIT 1500' : qq/ WHERE id_message > ? ORDER BY timestamp DESC/;

my $sth = $dbh->prepare("SELECT * FROM ($sql) AS internaltable ORDER BY timestamp ASC;");
if((length($last) == 0) or ($last eq "never")){
	$sth->execute();
} else {
	$sth->execute($last);
}

my $output = "";
my %users;

# Updates are retrieved in reverse order, so we need to flip the list.
while(my @row = $sth->fetchrow_array()){
	my ($id_message, $timestamp, $remote_addr, $user, $message) = @row;

	my $ipcolor = "#ffffff";
	my $iphighlight = "";
	if($remote_addr =~ /[0-9]*\.([0-9]*)\.([0-9]*)\.([0-9]*)/){
		$ipcolor = sprintf("#%02x%02x%02x", $1, $2, $3);
		if(($1 + $2 + $3) < 0x70){
			$iphighlight = "darkipcolor";
		}
	}

	$output .= qq/{"id_message": "$id_message", "timestamp": "$timestamp", "ipcolor": "$ipcolor"/ . ((length($iphighlight) > 0) ? qq/, "iphighlight": "$iphighlight"/ : "") . qq/, "user": "$user", "message": "$message"},\n/;
	$last = $id_message;
	$users{$user} = '';
}

my $userjson = "";
my @userlist = keys %users;
foreach my $user (@userlist){
	my $color = "#a0a0a0";
	my $highlight = "";

	$sql = qq/SELECT value FROM userprefs WHERE id_pref=(SELECT id_pref FROM prefs WHERE description='color') AND user=?;/;
	$sth = $dbh->prepare($sql);
	$sth->execute($user);

	my @row = $sth->fetchrow_array();
	$sth->execute();
	my $response = $row[0];

	if(length($response) > 0){
		$color = "#$response";

		if($response =~ /([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/){
			if((hex($1) + hex($2) + hex($3)) < 0x70){
				$highlight = "darkusername";
			}
		}
	}

	$userjson .= qq/"$user": {"color": "$color"/ . ((length($highlight) > 0) ? qq/, "highlight": "$highlight"/ : "") . qq/},/;
}
$userjson =~ s/^(.*),$/\1/;
$output = qq/{"last": "$last", "messages": [$output {}], "userlist": {$userjson}}/;

if($last eq $queryvals{t}){
print<<EOF;
Status: 204 No New Messages
Content-Type: text/plain; charset=utf-8
krakws-skiplog: true

EOF
} else {
print<<EOF;
Content-Type: application/json; charset=utf-8
krakws-skiplog: true

$output
EOF
}

exit 0
