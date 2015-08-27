#!/bin/sh
sudo apt-get update
sudo apt-get install python-software-properties -y
sudo add-apt-repository ppa:chris-lea/node.js -y
sudo apt-get update
sudo apt-get install nodejs -y
npm install
echo "All done! To start the server please run 'start.sh', or type 'node server.js' into your console"
