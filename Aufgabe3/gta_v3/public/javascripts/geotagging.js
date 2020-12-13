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
        
          
            //console.log(document.querySelector("#result-img").getAttribute("data-tags"));

            //var test = document.querySelector("#result-img").attributes[1].value;
            //console.log(test.attributes);
            //console.log(document.querySelector("#result-img").getAttributeNode("data-tags"));
     

            //var taglist = JSON.parse(document.querySelector("#result-img").getAttribute("data-tags-type"));
            
            
            if (document.querySelector("#discovery_lat").value == "") {
                tryLocate(function(position) {
                    document.querySelector("#tagging_latitude_input").value = position.coords.latitude;
                    document.querySelector("#tagging_longitude_input").value = position.coords.longitude;
                    document.querySelector("#discovery_lat").value = position.coords.latitude;
                    document.querySelector("#discovery_lon").value = position.coords.longitude;
                    $.getJSON("taglist", function(input) {
                        document.querySelector("#result-img").setAttribute("data-tags", input);
                        document.querySelector("#result-img").src = getLocationMapSrc(
                            document.querySelector("#tagging_latitude_input").value, 
                            document.querySelector("#tagging_longitude_input").value, 
                            JSON.parse(input), 
                            10);
                    });
                }, function(msg) {
                    alert(msg);
                });   
            } else {
                document.querySelector("#tagging_latitude_input").value = document.querySelector("#discovery_lat").value;
                document.querySelector("#tagging_longitude_input").value = document.querySelector("#discovery_lon").value;
                $.getJSON("taglist", function(input) {
                    document.querySelector("#result-img").setAttribute("data-tags", input);
                    document.querySelector("#result-img").src = getLocationMapSrc(
                        document.querySelector("#tagging_latitude_input").value, 
                        document.querySelector("#tagging_longitude_input").value, 
                        JSON.parse(input), 
                        10);
                });

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
});