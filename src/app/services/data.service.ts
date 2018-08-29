import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RequestOptions, Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataService {

    constructor(private http: HttpClient) { }

    getResponse(): Observable<any> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({ headers: headers });

        return this.http.get('/assets/data/response.json');

    }

}
