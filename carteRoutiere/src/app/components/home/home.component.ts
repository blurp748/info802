import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { concat } from 'rxjs';
import { TrajetService } from 'src/app/services/trajet.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  brand!: String;
  start!: String;
  finish!: String;
  brandOptions!: String[];
  brandIds!: String[];
  @ViewChild('myMap')
  private mapComponent !: MapComponent;

  constructor(private trajetService : TrajetService) {}
  
  ngOnInit(): void {
    this.brandOptions = [];
    this.brandIds = [];
    this.trajetService.getElectricVehicules().subscribe((data : any) => {
      data.data.vehicleList.forEach((vehicule : any) => {
        var tmp = vehicule.naming.model + " : " + vehicule.naming.make;
        if(!this.brandOptions.includes(tmp)){
          this.brandOptions.push(tmp);
          this.brandIds.push(vehicule.id);
        }
      });
    })
  }

  onSubmitForm(form: NgForm) {
    var brandId = this.brandIds[this.brandOptions.indexOf(form.value.brand)];
    var latStart = 0.0;
    var longStart = 0.0;
    var latEnd = 0.0;
    var longEnd = 0.0;
    var autonomie = 0;

    if (form.value.start && form.value.finish && form.value.brand){
      const result = concat(
        this.trajetService.getCityLatAndLong(form.value.start),
        this.trajetService.getCityLatAndLong(form.value.finish),
        this.trajetService.getElectricVehicule(brandId)
      );
  
      var i = 0;
      result.subscribe({
        next: (value : any) => {
            if (i == 0){
              latStart = value[0].lat;
              longStart = value[0].lon;
              i++;
            }else if (i == 1){
              latEnd = value[0].lat;
              longEnd = value[0].lon;
              i++
            }else{
              var range = value.data.vehicleList[0].range.chargetrip_range;
              autonomie = Math.ceil(( range.best + range.worst ) / 2);
              var fast_charging = value.data.vehicleList[0].routing.fast_charging_support;
              this.mapComponent.addTrajet(latStart,longStart,latEnd,longEnd,autonomie*1000, fast_charging);
            }
        },
        error(error) {
          console.log(error);
        },
        complete : () => {
          console.log("TODO : complete not called ?");
          //this.mapComponent.addTrajet(latStart,longStart,latEnd,longEnd,autonomie*1000);
        },
      })
    }
  }
  
}
