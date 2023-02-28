import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';
import { TrajetService } from 'src/app/services/trajet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  brand!: String;
  start!: String;
  finish!: String;

  constructor(private trajetService : TrajetService) {}
  
  onSubmitForm(form: NgForm) {

    var args = {distance: 100, vitesse_moyenne: 10};
    
    this.trajetService.search(args.distance,args.vitesse_moyenne).subscribe(data => {
      let res = data.split("temps_trajetResult");
      res = res[1];
      res = res.replace(">","");
      res = res.replace("</tns:","");
      console.log(res);
    });
  }
  
}
