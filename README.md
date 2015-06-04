#SC Torrent
Add torrent result for SensCritique.

#Build

##Firefox

Install `jpm`, Firefox addons utilities:

```
$npm install jpm -g
```

Then generate the xpi:

```
$./build.sh
```

##Chromium

Go to extension. Activate "Developer mode". Click on "Load unpacked extension" and select the `chromium` folder at the root of the project.
