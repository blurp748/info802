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

    constructor(private httpClient: HttpClient, private apollo: Apollo) { }
    
    search(distance : number, vitesse_moyenne : number): Observable<any> {
        var request: string = 
        "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:spy='spyne.examples.hello.soap'>"
        + "<soapenv:Header/>"
        + "<soapenv:Body>"
        +   "<spy:temps_trajet>"
        +     "<spy:distance>" + distance + "</spy:distance>"
        +     "<spy:vitesse_moyenne>"+ vitesse_moyenne +"</spy:vitesse_moyenne>"
        +   "</spy:temps_trajet>"
        + "</soapenv:Body>"
        +"</soapenv:Envelope>";

        return this.httpClient.post<any>(this.soapTrajetURL, request, { responseType: "text" as "json"})
        .pipe(
          catchError(this.errorHandler)
        )
    }

    getBornes(city : string): Observable<any> {

        return this.httpClient.get<any>("https://odre.opendatasoft.com/api/records/1.0/search/?dataset=bornes-irve&q=" + city)
        .pipe(
          catchError(this.errorHandler)
        )
    }

    getBornesByLatLong(lat : number, long : number): Observable<any> {

      return this.httpClient.get<any>("https://odre.opendatasoft.com/api/records/1.0/search/?dataset=bornes-irve&q=&rows=1&geofilter.distance="+ lat +"%2C"+ long +"%2C" + 20000)
      .pipe(
        catchError(this.errorHandler)
      )
    }

    getCityLatAndLong(city : string): Observable<any> {
        return this.httpClient.get<any>("https://nominatim.openstreetmap.org/search?q="+ city +"&format=json")
        .pipe(
          catchError(this.errorHandler)
        )
    }

    getElectricVehicules(): Observable<any> {
      return this.apollo.watchQuery({
        query: gql`
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
        `
      }).valueChanges;
    }

    getElectricVehicule(id: String): Observable<any> {
      return this.apollo.watchQuery({
        query: gql`
        {
          vehicleList(
            search : "638157687592b0f2c57fc08f"
          ) {
            id
            naming {
              make
              model
              chargetrip_version
            }
            media {
              image {
                url
              }
              brand {
                thumbnail_url
              }
            }
            range {
              chargetrip_range {
                best
                worst
              }
            }
            battery {
              usable_kwh
            }
            routing {
              fast_charging_support
            }
            connectors {
              standard
            }
          }
        }
        `
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