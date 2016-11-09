// Global variable for hytter. Legger den her for at alle funksjonen skal ha tilgong
// I denne vert hytter.json lagra.
var hytter;

// Denne funksjonen tegnar kartet og setter inn alle markeringar
//https://developers.google.com/maps/documentation/javascript/adding-a-google-map
function initMap() {
    var sted = {
        lat: 61.893,
        lng: 5.531722
    };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: sted
    });
    for (i = 0; i < hytter.length; i++) {
        var hytte = hytter[i]
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(hytte.loc[0], hytte.loc[1]),
            map: map,
            url: 'hytteinfo.html?id=' + hytte.id
        });
        google.maps.event.addListener(marker, 'click', function() {
            window.location.href = this.url;
        });
    }
}

// Dette er ein funksjon som utførerer initMap ved å sende den til google api
function makeMap() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' +
        'AIzaSyB5g5902denQTpZ7iVYmct-wTIMUo1VtqI&callback=initMap';
    document.body.appendChild(script);
}

// Denne skriv alle hyttene til skjerm
function fyllHytter(hytter) {
    var hyttefelt = document.getElementById('hyttefelt');
    //Henter ut innholdet i templaten
    var temp = document.querySelector('#hytte-temp').content;

    for (i = 0; i < hytter.length; i++) {
        //Kloner templaten
        var clone = document.importNode(temp, true);
        //Fyller inn med informasjon frå hytter.json
        clone.querySelectorAll('a')[0].href = 'hytteinfo.html?id=' + hytter[i].id;
        clone.querySelectorAll('p')[0].textContent = 'Område:' + hytter[i].omrade; // ='dsfa';// hytter[i].omrade;
        //Legger til hytta
        hyttefelt.appendChild(clone);

    }
    
}

// Denne køyrar ikkje før heile dokumentet er lasta
$(document).ready(function() {
    //Les fila med hytter    
    $.getJSON('hytter.json', function(datafile) {
        hytter = datafile.hytter;
        fyllHytter(hytter);
        makeMap();

    });

});
