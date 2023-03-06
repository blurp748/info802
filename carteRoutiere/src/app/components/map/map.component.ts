import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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
  distance !: number;
  autonomie !: number;
  temps !: string;
  cost !: string;
  @ViewChild('map') mapElement: ElementRef<HTMLDivElement> | undefined;

  constructor(private trajetService : TrajetService, private renderer : Renderer2) {}

  private initMap(): void {
    this.map = L.map('map', {
      center: [ 45.607101, 5.8874 ],
      zoom: 3
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }
  
  addTrajet(latStart : number, longStart : number, latEnd : number, longEnd : number, autonomie : number) {
    this.controlInit(latStart, longStart, latEnd, longEnd);
    this.map.flyTo(new L.LatLng(latStart,longStart), 6);

    var waypoints: L.LatLng[] = [
      L.latLng(latStart, longStart),
      L.latLng(latEnd, longEnd)
    ]

    var middleWaypoints: L.LatLng[] = [];

    var settingBornes = false;
    this.control.on('routesfound', (e) => {
      if(!settingBornes){
        var route = e.routes[0];
        var distance = route.summary.totalDistance;
        var vitesse_moyenne = 110;
        var coordinates = route.coordinates;
        var maxInd = route.waypointIndices[1];
        var metersPercoordinates = distance / maxInd;
        var coordinatesPointInd = (autonomie - 20000) / metersPercoordinates;

        this.distance = Math.floor(distance / 1000);
        this.autonomie = Math.floor(autonomie/1000);

        this.control.createAlternativesContainer();

        if (autonomie < distance){
          for( var i = 0; (i*coordinatesPointInd) < maxInd; i++) {
            if ( i != 0) {
              var needToStop = coordinates[Math.ceil(i*coordinatesPointInd)];
              
              this.trajetService.getBornesByLatLong(needToStop.lat,needToStop.lng,20000).subscribe(data =>{
                if(data.records.length != 0) {
                  var borneCoordinates = data.records[0].geometry.coordinates;
                  middleWaypoints.push(L.latLng(borneCoordinates[1],borneCoordinates[0]));
                  var waypointsRes: L.LatLng[] = [];
                  waypointsRes.push(waypoints[0]);
                  middleWaypoints.forEach(data => {
                    waypointsRes.push(data);
                  })
                  waypointsRes.push(waypoints[1]);
                  this.control.setWaypoints(waypointsRes);
                }
              });
            }
          };
        
        }
      
        this.calculTemps(distance, vitesse_moyenne, middleWaypoints.length);
        this.calculCost(distance / 1000);
        settingBornes = true;
      }

      var childs = this.mapElement?.nativeElement.childNodes[0].childNodes[3].childNodes;
      console.log(childs);
      if(childs != undefined && childs.length > 2){
        for( var i = 1; i< childs.length -1; i++){
          this.renderer.setStyle(childs[i], "content", 'url("assets/images/recharge.png")');
        } 
      }

    });
  }

  ngAfterViewInit(): void {
      this.initMap();
  }

  controlInit(latStart : number, longStart : number, latEnd : number, longEnd : number): void {
    if (this.control) this.map.removeControl(this.control);
    this.control = L.Routing.control({
        router: L.Routing.osrmv1({
            serviceUrl: `http://router.project-osrm.org/route/v1/`
        }),
        fitSelectedRoutes: false,
        routeWhileDragging: false,
        show: false,
        waypoints: [
            L.latLng(latStart, longStart),
            L.latLng(latEnd, longEnd)
        ],
    });
    this.control.addTo(this.map);
  }

  calculTemps(distance : number, vitesse_moyenne : number, points: number) {
    this.trajetService.search( distance / 1000 , vitesse_moyenne ).subscribe(data => {
      let res = data.split("temps_trajetResult");
      res = res[1];
      res = res.replace(">","");
      res = res.replace("</tns:","");
      let timesMn = Math.ceil(res * 60);
      if (timesMn > 60) {
        let timesH = Math.floor(timesMn / 60);
        timesMn = timesMn - (timesH * 60);
        this.temps = timesH + "h " + timesMn + "mn";
      }else{
        this.temps = timesMn + "mn";
      }
    });
  }

  calculCost(distance: number) {
    this.trajetService.getCost(distance).subscribe(data => {
      this.cost = (Math.round(data.cost * 100) / 100).toFixed(2)
    })
  }

}
