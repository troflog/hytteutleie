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
        if (sjekkFilter(hytte, valg)) {
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
function fyllHytter() {
    var hyttefelt = document.getElementById('hyttefelt');
    //Henter ut innholdet i templaten
    var temp = document.querySelector('#hytte-temp').content;
    //Hentar ut valga i filtreringsmenyen
    valg = hytteValg();
    for (i = 0; i < hytter.length; i++) {
        if (sjekkFilter(hytter[i], valg)) {
            //Kloner templaten
            var clone = document.importNode(temp, true);
            //Fyller inn med informasjon frå hytter.json
            clone.querySelectorAll('a')[0].href = 'hytteinfo.html?id=' + hytter[i].id;
            p = clone.querySelectorAll('p'); 
            p[0].textContent = 'Område:' + hytter[i].omrade;
            p[1].textContent = hytter[i].kortinfo;
            p[2].textContent = hytter[i].pris  +" kr/døgn";
            td = clone.querySelectorAll("td");
            td[1].textContent = hytter[i].rom;
            td[3].textContent = hytter[i].toalett;
            td[5].textContent = hytter[i].dusj;

            //Legger til hytta
            hyttefelt.appendChild(clone);
        }

    }
}

//Sjekk om ei spesifikk hytte oppfyller alle kravene til filteret
function sjekkFilter(hytte, valg) {
    //Startar med å anta at hytta skal visast
    var vis = true;
    //Sjekk om vi har fjell,skog eller hav
    if (valg.omrade.length > 0) {
        vis = false;        
        for (j = 0; j < valg.omrade.length; j++) {
            if (hytte.omrade.toLowerCase() == valg.omrade[j]) {
                vis = true;
            }
        }
    }
    //Returnere false sidan vi ikkje har treff uansett
    if(vis == false){
        return vis;
    }
    
    //Sjekk om vi har sett antall rom
    if(valg.rom.length >0){
        vis = false;
        rom = hytte.rom
        for(j = 0;j<valg.rom.length;j++){
            if(hytte.rom == valg.rom[j]){
                vis = true
            }
            if((valg.rom[j] == 4) & hytte.rom >4 ){
                vis = true
            }
        }
    }
    //Returnere false sidan vi ikkje har treff uansett
    if(vis == false){
        return vis;
    }

    //Sjekk om vi er innanfor prisrange
    if((valg.minPris <= hytte.pris) & (valg.maxPris >= hytte.pris)){
        vis = true;
    } else {
        vis = false;
    }
    return vis;

}

//Denne funksjonen les tilstanden til alle filtrer valgene
// og returnerer dei i eit objekt
function hytteValg() {
    //Objekt kor alle valga i filtreringsmenyen skal vere    
    var valg = {};
    //Sjekk kva område som er valgt
    valg.omrade = [];

    if ($("#fjell-sjekk").is(':checked')) {
        valg.omrade.push("fjell");
    }
    if ($("#skog-sjekk").is(':checked')) {
        valg.omrade.push("skog");
    }
    if ($("#hav-sjekk").is(':checked')) {
        valg.omrade.push("hav");
    }

    //Sjekk kor mange rom som er valgt
    valg.rom =[];    
    if ($("#1rom-sjekk").is(':checked')){
        valg.rom.push(1);
    }
    if ($("#2rom-sjekk").is(':checked')){
        valg.rom.push(2);
    }
    if ($("#3rom-sjekk").is(':checked')){
        valg.rom.push(3);
    }
    if ($("#4rom-sjekk").is(':checked')){
        valg.rom.push(4);
    }

    //Sjekk kva priser range som er valgt
    var minPris = document.getElementById("minpris").value;    
    if(minPris === ""){
        valg.minPris = -100000; //Setter den til eit lite tall
    } else {
        valg.minPris = parseInt(minPris);
    }
    var maxPris = document.getElementById("maxpris").value;  
    if(maxPris === ""){
        valg.maxPris = 90071992547409; //Setter den til eit stort tal
    } else {
        valg.maxPris = parseInt(maxPris);
    }  
    //Retanerar hyttevalg
    return valg;
}

//Sjekker om fra pris er større ein til pris. Viss det skjer så skal vi stoppe
//valgEvent() og vise ei feilmelding under fra feltet
function validerPris() {
    var minPris = document.getElementById("minpris").value;
    var maxPris = document.getElementById("maxpris").value;            
    error = document.getElementById("error-pris");
    if (minPris !=="" & maxPris !=="" & (parseInt(minPris) >= parseInt(maxPris))) {        
        error.innerHTML = 'Fra pris er større en til pris';
        return false;
    } else {        
        error.innerHTML = '';
        return true
    }

  
}

//Denne funksjonen skal starte når vi har endra noko i filtreringsfeltet
function valgEvent() {
    if (validerPris()) {
        //Fjernar alle hyttene utanom template (some children[0])
        var node = document.getElementById("hyttefelt");
        var children = node.children;
        for (i = 1; i < children.length; i++) {
             node.removeChild(children[i]);
        }
        children = node.children;
        fyllHytter();
        makeMap();

    }


}





//Funksjon som hindrere brukar i å skrive inn noko anna ein nummer i tekstboksen.
function kunNummer(evt) {
    var theEvent = evt || window.event;
    var key = theEvent.keyCode || theEvent.which;
    if ((key < 48 || key > 57) && !(key == 8 || key == 9 || key == 13 || key == 37 || key == 39)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }
}



// Denne køyrar ikkje før heile dokumentet er lasta
$(document).ready(function() {
    //Les fila med hytter    
    $.getJSON('hytter.json', function(datafile) {
        hytter = datafile.hytter;
        fyllHytter();
        makeMap();
    });
    








});
