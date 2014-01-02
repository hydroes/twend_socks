<?php

$context = new ZMQContext();

//  Socket to send messages on
$socket = new ZMQSocket($context, ZMQ::SOCKET_PUSH);

$socket->bind('tcp://127.0.0.1:3000');

$count = 0;
while (true) {
    $socket->send('some work ' . $count);
    echo "some work  $count \n";
    $count++;
    sleep(1);
}
