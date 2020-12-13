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
function geoTag(lat, lon, name, hashtag) {
    this.latitude = lat;
    this.longitude = lon;
    this.name = name;
    this.hashtag = hashtag;

    this.getLatitude = function () {
		return this.latitude;
	};
	this.getLongitude = function () {
		return this.longitude;
	};
	this.getName = function () {
		return this.name;
	};
	this.getHashtag = function () {
		return this.hashtag;
	};
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
var InMemory = (function () {
var geoTags = [];

    return {
        tagSearchRadius: function (lat, lon, radius) {
            var taglist = [];
            geoTags.forEach(element => { 
                if ((Math.abs(lat - element.getLatitude()) <= radius) &&
                    (Math.abs(lon - element.getLongitude()) <= radius)) {
                        taglist.push(element);
                    }
            }); 
            return taglist;
        },


        tagSearch: function (tagName) {
            if(tagName == "")
                return geoTags;

            var result = [];
            geoTags.forEach(element => { 
                if (tagName == element.getName())
                result.push(element)
            }); 
            return result;
        },


        addGeoTag: function (lat, lon, name, hashtag) {
            geoTags.push(new geoTag(lat, lon, name, hashtag));
        },



        removeGeoTag: function (tagName) {
            geoTags.forEach(element, index => { 
                if (tagName == element.getName()) {
                    geoTags.splice(index, 0);
                    return;
                }
            });
        },
    }
})();
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
        taglist: InMemory.tagSearchRadius(req.body.tagging_latitude_input, req.body.tagging_longitude_input, 5),
        lat: req.body.tagging_latitude_input,
        lon: req.body.tagging_longitude_input,
        datatags: JSON.stringify(InMemory.tagSearchRadius(req.body.tagging_latitude_input, req.body.tagging_longitude_input, 5))
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
    InMemory.addGeoTag(
        req.body.tagging_latitude_input, 
        req.body.tagging_longitude_input, 
        req.body.tagging_name_input,
        req.body.tagging_hashtag_input);

    res.render('gta', {
        taglist: InMemory.tagSearchRadius(req.body.tagging_latitude_input, req.body.tagging_longitude_input, 5),
        lat: req.body.tagging_latitude_input,
        lon: req.body.tagging_longitude_input,
        datatags: JSON.stringify(InMemory.tagSearchRadius(req.body.tagging_latitude_input, req.body.tagging_longitude_input, 5))
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
    var result = InMemory.tagSearch(req.body.discovery_searchterm_input);

    res.render('gta', {
        taglist: result,
        lat: req.body.tagging_latitude_input,
        lon: req.body.tagging_longitude_input,
        datatags: JSON.stringify(result)
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



