// ==UserScript==
// @name         SC torrent
// @namespace    https://github.com/AltarBeastiful
// @version      0.1
// @description  Add torrent result in SensCritique
// @author       Rémi Benoit
// @match        http://www.senscritique.com/film/*
// @grant        none
// ==/UserScript==

function showTorrentView() {
    //Un-highlight current page button
    var currentPage = document.querySelector("a.d-menu-item.active");
    currentPage.classList.remove("active");

    var homeButton = document.querySelector("span.d-menu-home.active-1");
    if (homeButton)
        homeButton.classList.remove("active-1");

    // Hightlight torrent button
    var torrentButton = document.querySelector("#torrent-page-link");
    torrentButton.classList.add("active");

    // Clear page content
    var page = document.evaluate('//*[@id="wrap"]/div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    while (page.firstChild) {
        page.removeChild(page.firstChild);
    }

    //Construct search interface

    //Search query input
    var searchInput = document.createElement('input');
    searchInput.id = 'torrent-search-query';
    searchInput.inputType = 'search';

    var form = document.createElement('form');
    form.action = '';
    form.addEventListener('submit', function (e) {
        clearResults();
        searchTorrents(searchQuery());
        e.preventDefault();
        return false;
    });

    //Hidden submit button
    var hiddenSubmit = document.createElement('input');
    hiddenSubmit.style.display = 'none';
    hiddenSubmit.type = 'submit';

    form.appendChild(hiddenSubmit);
    form.appendChild(searchInput);
    page.appendChild(form);

    // Find title and original title
    var originalMovieTitle = document.querySelector(".pvi-product-originaltitle");
    if (originalMovieTitle)
        originalMovieTitle = originalMovieTitle.innerHTML.trim();

    var movieTitle = document.querySelector(".pvi-product-title");
    if (movieTitle) {
        movieTitle = movieTitle.innerHTML.trim();
    } else {
        movieTitle = document.querySelector(".d-cover-title.pco-cover-title");
        if (movieTitle)
            movieTitle = movieTitle.innerHTML.trim();
    }

    if(originalMovieTitle && useOriginalTitle)
        setSearchQuery(originalMovieTitle);
    else
        setSearchQuery(movieTitle);

    // Start the search
    hiddenSubmit.click();
}

function searchTorrents(query) {
    console.log("searching for '" + query + "'");

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var response = JSON.parse(xhr.responseText);
            displayTorrents(response.list);
        }
    }
    xhr.open('GET', 'https://kat.cr/json.php?q=' + query + '&field=seeders&order=desc&page=1&category=movies' , true);
    xhr.send();
}

function displayTorrents(torrents) {
    var table = document.createElement('TABLE');
    table.id = 'search-results-table';
    table.border = 1;

    var tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);

    var i;
    for (i = 0; i < torrents.length; ++i) {
        var tr = document.createElement('TR');
        tableBody.appendChild(tr);

        var torrent = torrents[i];
        appendTextCell(torrent.title, tr);

        var magnetNode = document.createElement('a');
        magnetNode.href = magnetLink(torrent.title, torrent.hash);
        magnetNode.innerHTML = 'Magnet';
        appendCell(magnetNode, tr);

        appendTextCell(humanFileSize(torrent.size, true), tr, 'center');

        var dateObject = new Date(Date.parse(torrent.pubDate));
        var torrentAge = new Date().getTime() - dateObject.getTime();
        appendTextCell(millisecondsToStr(torrentAge), tr, 'center');

        appendTextCell(torrent.seeds, tr, 'center');
        appendTextCell(torrent.peers, tr, 'center');
    }

    var root = document.evaluate('//*[@id="wrap"]/div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    root.appendChild(table);
}

function appendTextCell(text, tableLine, align) {
    align = typeof align !== 'undefined' ?  align : 'left';
    appendCell(document.createTextNode(text), tableLine, align);
}

function appendCell(content, tableLine, align) {
    align = typeof align !== 'undefined' ?  align : 'left';
    var cell = document.createElement('TD');
    cell.appendChild(content);
    cell.align = align;
    tableLine.appendChild(cell);
}

function setSearchQuery(query) {
    var searchInput = document.querySelector('#torrent-search-query');
    searchInput.value = query;
}

function searchQuery() {
    return document.querySelector('#torrent-search-query').value;
}

function clearResults() {
    var table = document.getElementById('search-results-table');
    if (table)
        table.parentElement.removeChild(table);
}

function magnetLink(title, hash) {
    return 'magnet:?xt=urn:btih:' + hash + '&dn=' + encodeURIComponent(title) + encodedTrackers;
}

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' align';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

function millisecondsToStr(timestamp)
{
    tokens = {
        "year" : 31536000,
        "month" : 2592000,
        "week" : 604800,
        "day" : 86400,
        "hour" : 3600,
        "minute" : 60,
        "second" : 1
    };

    timestamp = Math.floor(timestamp / 1000);
    for (var text in tokens) {
        if (tokens.hasOwnProperty(text)) {

            var unit = tokens[text];
            if( timestamp < unit )
                continue;

            var numberOfUnits = Math.floor( timestamp / unit );
            return numberOfUnits + ' ' + text + ( numberOfUnits > 1 ? 's' : '' );
        }
    }
}

//Options
var useOriginalTitle = true;
var trackers = [
      'udp://tracker.openbittorrent.com:80/announce'
    , 'udp://open.demonii.com:1337/announce'
    , 'udp://tracker.publicbt.com:80/announce'
    , 'udp://9.rarbg.me:2710/announce'
];
var encodedTrackers = trackers.map(function (t) {
                                       return '&tr=' + encodeURIComponent(t);
                                   }).join('');

// Add torrent button
var torrentLink = document.createElement("a");
torrentLink.id = "torrent-page-link";
torrentLink.className = "d-menu-item";
torrentLink.innerHTML = "Torrents";
torrentLink.onclick = function() {
    showTorrentView();
};
var torrentNode = document.createElement("li");
torrentNode.appendChild(torrentLink);

var menu = document.querySelector("ul.d-menu-list");
menu.appendChild(torrentNode);
