<?php

$context = new ZMQContext();

//  Socket to send messages on
$socket = new ZMQSocket($context, ZMQ::SOCKET_PUSH);

//If I want to connect to the server I use this line
$socket->connect('tcp://127.0.0.1:3000');

$count = 0;
while (true) {
    $socket->send('some work ' . $count);
    $count++;
    sleep(1);
}
