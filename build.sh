#!/bin/sh

cp ./sctorrent.js firefox/data/
cp ./sctorrent.js chromium/

cp ./README.md firefox/

cd firefox
jpm xpi
mv *.xpi ..
cd ..

rm firefox/data/sctorrent.js
rm firefox/README.md
