import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { gql, Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable({
  providedIn: 'root'
})

export class TrajetService {

    soapTrajetURL : string = 'http://localhost:8000';
    restCostURL : string = 'https://info802-rest.vercel.app';
    nominatimURL : string = "https://nominatim.openstreetmap.org";
    borneURL : string = "https://odre.opendatasoft.com/api";

    constructor(private httpClient: HttpClient, private apollo: Apollo) { }
    
    search(distance : number, vitesse_moyenne : number, points : number, fast_charging : boolean): Observable<any> {
        var request: string = 
        "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:spy='spyne.examples.hello.soap'>"
        + "<soapenv:Header/>"
        + "<soapenv:Body>"
        +   "<spy:temps_trajet>"
        +     "<spy:distance>" + distance + "</spy:distance>"
        +     "<spy:vitesse_moyenne>"+ vitesse_moyenne +"</spy:vitesse_moyenne>"
        +     "<spy:points>"+ points +"</spy:points>"
        +     "<spy:fast_charging>"+ fast_charging +"</spy:fast_charging>"
        +   "</spy:temps_trajet>"
        + "</soapenv:Body>"
        +"</soapenv:Envelope>";

        return this.httpClient.post<any>(this.soapTrajetURL, request, { responseType: "text" as "json"})
        .pipe(
          catchError(this.errorHandler)
        )
    }

    getCost(distance : number): Observable<any> {

      var request = {
        distance: distance
      }

      return this.httpClient.post<any>(this.restCostURL + "/cost", request)
      .pipe(
        catchError(this.errorHandler)
      )
  }

    getBornes(city : string): Observable<any> {
        return this.httpClient.get<any>(this.borneURL + "/records/1.0/search/?dataset=bornes-irve&q=" + city)
        .pipe(
          catchError(this.errorHandler)
        )
    }

    getBornesByLatLong(lat : number, long : number, metersRadius : number): Observable<any> {
      return this.httpClient.get<any>(this.borneURL + "/records/1.0/search/?dataset=bornes-irve&q=&rows=1&geofilter.distance="+ lat +"%2C"+ long +"%2C" + metersRadius)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    getCityLatAndLong(city : string): Observable<any> {
        return this.httpClient.get<any>(this.nominatimURL + "/search?q="+ city +"&format=json")
        .pipe(
          catchError(this.errorHandler)
        )
    }

    getElectricVehicules(): Observable<any> {

      let getVehicules = gql`
      {
        vehicleList(
          size: 870
        ) {
          id
          naming {
            make
            model
          }
        }
      }
      `;

      return this.apollo.watchQuery({ query: getVehicules }).valueChanges;
    }

    getElectricVehicule(id: String): Observable<any> {

      let getVehiculeById = gql`
      query getVehiculeById($idVehicule: String!) {
        vehicleList(
          search : $idVehicule
        ) {
          id
          naming {
            make
            model
            chargetrip_version
          }
          range {
            chargetrip_range {
              best
              worst
            }
          }
          routing {
            fast_charging_support
          }
        }
      }
      `;

      return this.apollo.watchQuery({ 
        query: getVehiculeById,
        variables: {
          idVehicule: id
        }
      }).valueChanges;
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