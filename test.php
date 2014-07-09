<pre>
<?php

require_once('config.php');

$maxint = 9223372036854775807;

// handlerid is the ID in the email_handlers table.
$handlerid = 2147483645;

// The postid.
$postid = 2147483647;

// The post hash to check against.
$postcode = 'c5109993615308b9faa8b9b5123f688f90862468';

// The unique address of this user - used for checking access and checking
// e-mail address.
$userid = 2147483646;
$userhash = 'a40961ed62ce8b2e358a7bc8baee8505aa336f1f';

$handlerid = $postid = $userid = $maxint;

const REPLY = 1;

// The various content.
$puserid = pack_int($userid);
$ppostid = pack_int($postid);
$phash = pack('H*', substr(md5($postcode . $userhash), 0, 16));
$subaddress = base64_encode(pack_int($handlerid) . $puserid . $ppostid . $phash);
$address = 'andrewrn+' . $subaddress . '@gmail.com';
echo "Input\n";
echo "=====\n";
echo "Handler ID:\t\t{$handlerid}\n";
echo "User ID:\t\t{$userid}\n";
echo "Unique User Hash:\t{$userhash}\n";
echo "Post ID:\t\t{$postid}\n";
echo "Post Hash:\t\t{$postcode}\n";
echo "Generated Sub-address:\t{$subaddress}\n";
echo "Length of Sub-address:\t" . strlen($subaddress) . "\n";
echo "Generated Full address:\t{$address}\n";
echo "\n";
echo "============================================================================\n";
echo "\n";
echo "Output\n";
echo "======\n";
print_r(decode_address($address));
//$result = mail($address, 'Test mail using new VERP address', 'This is my message');

function decode_address($address) {
    global $postcode, $userhash;
    list($localpart, $domain) = explode('@', $address, 2);
    $parts = explode('+', $localpart, 2);

    $return = new stdClass();
    $return->address = $address;
    if (count($parts) !== 2) {
        return $return;
    }

    $return->mailbox = $parts[0];
    $data = base64_decode($parts[1]);

    $content = unpack('N2handlerid/N2userid/N2dataid/H*hash', $data);
    if (PHP_INT_SIZE === 8) {
        $content['handlerid'] = $content['handlerid1'] << 32 | $content['handlerid2'];
        $content['userid'] = $content['userid1'] << 32 | $content['userid2'];
        $content['dataid'] = $content['dataid1'] << 32 | $content['dataid2'];
    } else {
        // Erm...
    }

    $return = (object) array_merge((array) $return, $content);
    $return->verified = substr(md5($postcode . $userhash), 0, 16) == $return->hash;

    return $return;
}

function create_address($handlerid, $args) {
    $address = 'andrewrn+';
    $address .= base64_encode(pack_int($handlerid) . $args);
    return $address . '@gmail.com';
}

function pack_int($int) {
    if (PHP_INT_SIZE === 8) {
        $left = 0xffffffff00000000;
        $right = 0x00000000ffffffff;
        $l = ($int & $left) >>32;
        $r = $int & $right;

        return pack('NN', $l, $r);
    } else {
        return pack('NN', 0, $int);
    }
}

function unpack_int($int) {
    if (PHP_INT_SIZE === 8) {
        $set = unpack('N2', $int);
        return $set[1] << 32 | $set[2];
    } else {
        return unpack('l', $int);
    }
}
