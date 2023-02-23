import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  brand!: String;
  start!: String;
  finish!: String;

  url = 'http://localhost:8000';

  constructor(private httpClient: HttpClient) { }
  
  onSubmitForm(form: NgForm) {
    var args = {distance: 50, vitesse_moyenne: 10};
    var request : String = 
    "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:spy='spyne.examples.hello.soap'>"
    + "<soapenv:Header/>"
    + "<soapenv:Body>"
    +   "<spy:temps_trajet>"
    +     "<spy:distance>" + args.distance + "</spy:distance>"
    +     "<spy:vitesse_moyenne>"+ args.vitesse_moyenne +"</spy:vitesse_moyenne>"
    +   "</spy:temps_trajet>"
    + "</soapenv:Body>"
    +"</soapenv:Envelope>"


  this.search(request).subscribe(data => {
      let res = data.split("temps_trajetResult");
      res = res[1];
      res = res.replace(">","");
      res = res.replace("</tns:","");
      console.log(res);
    });
  
  }

  search(request : any): Observable<any> {
    return this.httpClient.post<any>(this.url, request, { responseType: "text" as "json"})
    .pipe(
      catchError(this.errorHandler)
    )
  }

  errorHandler(error: { error: { message: string; }; status: any; message: any; }) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
}
}
