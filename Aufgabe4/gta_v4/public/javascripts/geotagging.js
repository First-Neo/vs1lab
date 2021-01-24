/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    //var apiKey = "YOUR_API_KEY_HERE";
    var apiKey = "XaFXkBFC2dCejfGV38lAZIOxP8A5S7gb";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function() {
        
            var imageNode = document.querySelector("#result-img");
            var taglist = JSON.parse(imageNode.getAttribute("data-tags"));
            
            if (document.querySelector("#tagging_latitude_input").value == "" || document.querySelector("#tagging_longitude_input").value == "") {
                tryLocate(function(position) {
                    var lat = getLatitude(position);
                    var lon = getLongitude(position);
                    document.querySelector("#tagging_latitude_input").value = lat;
                    document.querySelector("#tagging_longitude_input").value = lon;
                    document.querySelector("#discovery_lat").value = lat;
                    document.querySelector("#discovery_lon").value = lon;
                    imageNode.src = getLocationMapSrc(lat, lon, taglist, 5);

                }, function(msg) {
                    alert(msg);
                });   
            } else {
                var lat = document.querySelector("#tagging_latitude_input").value;
                var lon = document.querySelector("#tagging_longitude_input").value;
                imageNode.src = getLocationMapSrc(lat, lon, taglist, 5);
            } 
        }

    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {
    //alert("Please change the script 'geotagging.js'");
    gtaLocator.updateLocation();
    var ajax = new XMLHttpRequest();
    document.getElementById('discovery_submit').addEventListener('click',function (event) {
        event.preventDefault();
        ajax.open("GET",'/geotags/?search='+document.getElementById("discovery_searchterm_input").value ,true);
        ajax.send(null);
        },false);
    
    document.getElementById('tagging_submit').addEventListener('click',function (event) {
            event.preventDefault();
            ajax.open("POST","/geotags",true);
            ajax.setRequestHeader('content-type','application/json');
            ajax.send(JSON.stringify({"lat":document.getElementById('tagging_latitude_input').value,
            "lon":document.getElementById('tagging_longitude_input').value,
            "name":document.getElementById('tagging_name_input').value,
            "hashtag":document.getElementById('tagging_hashtag_input').value,
            "search":document.getElementById("discovery_searchterm_input").value}));
    },false);
    ajax.onreadystatechange = function() {
        if(ajax.readyState == 4) {
            response = JSON.parse(ajax.response);
            document.getElementById('result-img').dataset.tags = JSON.stringify(response.taglist);
            gtaLocator.updateLocation();
            var input = "";
            if(Array.isArray(response.taglist) && response.taglist.length) {
                for(i = 0; i < response.taglist.length;i++) {
                    input+= ("<li>"+response.taglist[i].name+" ("+response.taglist[i].latitude + ", " + response.taglist[i].longitude + ") " + response.taglist[i].hashtag);
                }
            }
            document.getElementById('results').innerHTML = input;
        }
    }
});