#!/usr/bin/perl
# chat
# Mike Perron (2014)
#
# This script handles retrieving new messages from the database and returning
# them to the requesting user. Response are always JSON objects and can contain
# meta information.

use strict;

chomp(my $homepath = qx/mod_home chat/);
chdir($homepath);
my $database = "chat.db";

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

my $sql = qq/SELECT datetime(timestamp, "localtime") as timestamp_display, remote_addr, user, message FROM log/;
my $last = $queryvals{t};
$last =~ s/\\/\\\\/g;
$last =~ s/"/\\"/g;
$last =~ s/'/'"'"'/g;

$sql .= ((length($last) == 0) or ($last eq "never")) ? ' ORDER BY timestamp DESC LIMIT 1500;' : qq/ WHERE timestamp_display > "$last" ORDER BY timestamp DESC;/;

my $response = qx/sqlite3 '$database' '$sql'/;
my @updateset = split('\n', $response);
my $output = "";
my %users;

# Updates are retrieved in reverse order, so we need to flip the list.
@updateset = reverse @updateset;

foreach my $msg (@updateset){
	my ($timestamp, $remote_addr, $user, $message) = split('\|', $msg, 4);

	my $ipcolor = "#ffffff";
	if($remote_addr =~ /[0-9]*\.([0-9]*)\.([0-9]*)\.([0-9]*)/){
		$ipcolor = sprintf("#%02x%02x%02x", $1, $2, $3);
	}

	$output .= qq/{"timestamp": "$timestamp", "ipcolor": "$ipcolor", "user": "$user", "message": "$message"},\n/;
	$last = $timestamp;
	$users{$user} = '';
}

my $userjson = "";
my @userlist = keys %users;
foreach my $user (@userlist){
	my $color = "#a0a0a0";
	my $highlight = "";

	$sql = qq/SELECT value FROM userprefs WHERE id_pref=(SELECT id_pref FROM prefs WHERE desc="color") AND user="$user";/;
	$response = qx/sqlite3 '$database' '$sql'/;
	if($? == 0){
		chomp($response);
		if(length($response) > 0){
			$color = "#$response";

			if($response =~ /([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/){
				if((hex($1) + hex($2) + hex($3)) < 70){
					$highlight = "darkusername";
				}
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
