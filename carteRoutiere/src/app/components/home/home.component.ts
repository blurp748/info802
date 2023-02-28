import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { concat } from 'rxjs';
import { TrajetService } from 'src/app/services/trajet.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  brand!: String;
  start!: String;
  finish!: String;
  @ViewChild('myMap')
  private mapComponent !: MapComponent;

  constructor(private trajetService : TrajetService) {}
  
  onSubmitForm(form: NgForm) {

    var latStart = 0.0;
    var longStart = 0.0;
    var latEnd = 0.0;
    var longEnd = 0.0;

    const result = concat(
      this.trajetService.getCityLatAndLong(form.value.start),
      this.trajetService.getCityLatAndLong(form.value.finish)
    );

    var i = 0;
    result.subscribe({
      next(value) {
          console.log(value);
          if (i == 0){
            latStart = value[0].lat;
            longStart = value[0].lon;
            i++;
          }else{
            latEnd = value[0].lat;
            longEnd = value[0].lon;
          }
      },
      complete : () => {
        this.mapComponent.addTrajet(latStart,longStart,latEnd,longEnd);
      },
    })
  }
  
}
