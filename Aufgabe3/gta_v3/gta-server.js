/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN 
app.use(express.static('public'));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */
function geoTag() {
    this.latitude = document.querySelector("#tagging_latitude_input").value;
    this.longitude = document.querySelector("#tagging_longitude_input").value;
    this.name = document.querySelector("#tagging_name_input").value;
    this.hashtag = document.querySelector("#tagging_hashtag_input").value;
}
// TODO: CODE ERGÄNZEN

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */
var geoTags;

function tagSearchRadius (tags, lat, lon, radius) {
    var taglist;
    tags.forEach(element => { 
        if ((Math.abs(lat - element.latitude) <= (radius * Math.pow(10, -6))) &&
            (Math.abs(lon - element.longitude) <= (radius * Math.pow(10, -6)))) {
                taglist.push(element);
            }
    }); 
    return taglist;
}

function tagSearch(tags, tagName) {
    tags.forEach(element => { 
        if (tagName == element.name)
        return element;
    }); 
}

function addGeoTag(tags) {
    tags.push(geoTag());
}

function removeGeoTag(tags, tagName) {
    tags.forEach(element, index => { 
        if (tagName == element.name) {
            tags.splice(index, 0);
            return;
        }
    }); 
}


// TODO: CODE ERGÄNZEN

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: []
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */
app.post('/tagging', function (req, res) {
    response = {
        
        latitude:req.body.tagging_latitude_input,
        longitude:req.body.tagging_longitude_input,
        name:req.body.tagging_name_input,
        hashtag:req.body.tagging_hashtag_input
    }  

    //console.log(req.body);
    res.render('gta', {
        taglist: [response]
    });
  })




// TODO: CODE ERGÄNZEN START

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */
app.post('/discovery', function (req, res) {
   /*
    discovery_searchterm_input: 'a',
  discovery_lat: '48.989132299999994',
  discovery_lon: '8.391791',
  discovery_submit:


   */


    res.render('gta', {
        taglist: []
    });
  })
// TODO: CODE ERGÄNZEN

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
