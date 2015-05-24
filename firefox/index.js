var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: "http://www.senscritique.com/film/*",
  contentScriptFile: './sctorrent.js'
});
