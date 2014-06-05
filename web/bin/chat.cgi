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
if(length($buffer)>0){
	my @pairs=split(/[;&]/, $buffer);
	foreach my $pair (@pairs){
		my ($name, $value) = split(/=/, $pair);
		$value =~ s/%([a-fA-F0-9][a-fA-F0-9])/pack("C", hex($1))/eg;
		chomp($queryvals{$name} = $value);
	}
}

my $sql = qq/SELECT timestamp,remote_addr,user,message FROM log/;
my $last = $queryvals{t};

if((length($last) == 0) or ($last eq "never")){ $sql .= ';' }
else { $sql .=  qq/ WHERE timestamp > "$last" ORDER BY timestamp asc;/ }

my $response = qx/sqlite3 '$database' '$sql'/;
my @updateset = split('\n', $response);
my $output = "";
my %users;

foreach my $msg (@updateset){
	my ($timestamp, $remote_addr, $user, $message) = split('\|', $msg, 4);
	$output .= qq/{"timestamp": "$timestamp", "remote_addr": "$remote_addr", "user": "$user", "message": "$message"},\n/;
	$last = $timestamp;
	$users{$user} = '';
}

my $userjson = "";
my @userlist = keys %users;
foreach my $user (@userlist){
	my $color = "black";
	$userjson .= qq/"$user": {"color": "$color"},\n/;
}
$userjson =~ s/^(.*),$/\1/;
$output = qq/{"last": "$last", "messages": [$output {}], "userlist": {$userjson}}/;

if($last eq $queryvals{t}){
print<<EOF;
Status: 204 No New Messages
Content-Type: text/plain; charset=utf-8

EOF
} else {
print<<EOF;
Content-Type: application/json; charset=utf-8

$output
EOF
}

exit 0
