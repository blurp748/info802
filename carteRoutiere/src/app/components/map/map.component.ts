import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { TrajetService } from 'src/app/services/trajet.service';
import 'leaflet-routing-machine';

var iconUrl = 'assets/images/recharge.png';
const iconRecharge = L.icon({
  iconUrl,
  iconSize: [25, 35],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

var iconRetinaUrl = 'assets/marker-icon-2x.png';
var iconUrl = 'assets/marker-icon.png';
var shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

  map!: L.Map;
  control !: L.Routing.Control;

  constructor(private trajetService : TrajetService) {}

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 45.607101, 5.8874 ],
      zoom: 15
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }
  
  addTrajet(latStart : number, longStart : number, latEnd : number, longEnd : number) {
    if (this.control) this.map.removeControl(this.control);
    this.control = L.Routing.control({
        router: L.Routing.osrmv1({
            serviceUrl: `http://router.project-osrm.org/route/v1/`
        }),
        fitSelectedRoutes: false,
        show: false,
        routeWhileDragging: true,
        waypoints: [
            L.latLng(latStart, longStart),
            L.latLng(latEnd, longEnd)
        ]
    });

    this.control.on('routesfound', (e) => {
        var routes = e.routes;
        console.log(routes[0]);
        var summary = routes[0].summary;
        var distanceKm = summary.totalDistance / 1000;
        var vitesse_moyenne = 110;
        this.trajetService.search( distanceKm , vitesse_moyenne ).subscribe(data => {
          let res = data.split("temps_trajetResult");
          res = res[1];
          res = res.replace(">","");
          res = res.replace("</tns:","");
          let timesH;
          let timesMn = Math.ceil(res * 60);
          if (timesMn > 60) {
            timesH = Math.floor(timesMn / 60);
            timesMn = timesMn - (timesH * 60);
          }
          if(timesH){
            console.log(timesH + "h " + timesMn + "mn");
          }else{
            console.log(timesMn + "mn");
          }
        });
    });

    this.control.addTo(this.map);
  }

  ngAfterViewInit(): void {
      this.initMap();
      this.trajetService.getBornes("Bourget-du-Lac").subscribe(data =>{
        data.records.forEach((element : any) => {
          var marker = L.marker([element.geometry.coordinates[1],element.geometry.coordinates[0]], {icon: iconRecharge});
          marker.addTo(this.map);
        });
      });
  }

}
