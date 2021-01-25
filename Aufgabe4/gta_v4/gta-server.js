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
var cnt = 0;



app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

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


function geoTag(lat, lon, name, hashtag, id) {    
    this.latitude = lat;
    this.longitude = lon;
    this.name = name;
    this.hashtag = hashtag;
    this.id = cnt;

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
    
    this.getID = function() {
        return this.id;
    }
    
    this.setLatitude = function (latitude) {
		this.latitude = latitude;
    };
    
	this.setLongitude = function (longitude) {
		this.longitude = longitude;
    };
    
	this.setName = function (name) {
		this.name = name;
    };
    
	this.setHashtag = function (hashtag) {
		this.hashtag = hashtag;
    };

    this.setID = function (id) {
		this.id = id;
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
                if (element.getName().includes(tagName) || "#" + tagName == element.getHashtag() || tagName == element.getHashtag())
                result.push(element);
            }); 
            return result;
        },

        idSearch: function (id) {
            var retVal = null;
            geoTags.forEach(element => {;
                if (element.getID() == id) {
                    retVal = element;
                }
            }); 
            return retVal;
        },


        addGeoTag: function (lat, lon, name, hashtag, id) {
            geoTags.push(new geoTag(lat, lon, name, hashtag, id));
        },


        removeGeoTag: function (id) {
            for(i=0;i<geoTags.length;i++) {
                if(id == geoTags[i].getID()) {
                    geoTags.splice(i, 1);
                    break;
                }
            }
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
        req.body.tagging_hashtag_input,
        cnt++);

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

app.post('/geotags/', function(req,res){
   InMemory.addGeoTag(req.body.lat, req.body.lon, req.body.name, req.body.hashtag, cnt);
   cnt = cnt + 1;
   if(req.body.search == "") {
    res.send(JSON.stringify({"taglist":InMemory.tagSearchRadius(req.body.lat, req.body.lon, 5)}));
   } else {
    res.send(JSON.stringify({"taglist":InMemory.tagSearch(req.body.search)}));
   }
})

app.get('/geotags/', function(req,res){
    const {search} = req.query;
    res.send(JSON.stringify({"taglist":InMemory.tagSearch(search)}));
})

app.put('/geotags/:id', function(req,res) {
    const id = req.params.id;
    var tag = InMemory.idSearch(id);
    if(tag == null) {
        InMemory.addGeoTag(
            req.body.lat,
            req.body.lon,
            req.body.name,
            req.body.hashtag,
            cnt);
            cnt = cnt + 1;
            res.sendStatus(200); 
    } else {
        res.sendStatus(400);
    }
})

app.get('/geotags/:id', function(req,res) {
    const id = req.params.id;
    var tag = InMemory.idSearch(id);
    if(tag == null) {
        res.sendStatus(404);
    } else {
        res.send(tag);
    }
})

app.delete('/geotags/:id', function(req,res) {
    const id = req.params.id;
    var tag = InMemory.idSearch(id);
    if(tag == null) {
        res.sendStatus(204);
    } else {
        
        res.send(InMemory.removeGeoTag(id));
    }
})
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