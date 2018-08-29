import { EnterpriseDatasource, FakeServer } from './enterprise-datasource';

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { DataGeneratorService } from '../services/data-generator.service';

@Component({
  selector: 'app-ag-enterprise-rowmodel',
  templateUrl: './ag-enterprise-rowmodel.component.html',
  styleUrls: ['./ag-enterprise-rowmodel.component.css']
})
export class AgEnterpriseRowmodelComponent {

  private gridApi;
  private gridColumnApi;

  private columnDefs;
  private defaultColDef;
  private rowModelType;
  private cacheBlockSize;
  private rowGroupPanelShow;
  private icons;

  constructor(private http: HttpClient) {
    this.columnDefs = [
      {
        headerName: 'Athlete',
        field: 'athlete'
      },
      {
        headerName: 'Age',
        field: 'age'
      },
      {
        headerName: 'Country',
        field: 'country',
        rowGroup: true,
        hide: true
      },
      {
        headerName: 'Year',
        field: 'year'
      },
      {
        headerName: 'Sport',
        field: 'sport'
      },
      {
        headerName: 'Gold',
        field: 'gold'
      },
      {
        headerName: 'Silver',
        field: 'silver'
      },
      {
        headerName: 'Bronze',
        field: 'bronze'
      }
    ];
    this.defaultColDef = {
      width: 100,
      suppressFilter: true
    };
    this.rowModelType = 'enterprise';
    this.cacheBlockSize = 50;
    this.rowGroupPanelShow = 'never';
    this.icons = {
      groupLoading:
        '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
    };
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    this.http
      .get('https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/olympicWinners.json')
      .subscribe(data => {
        const fakeServer = new FakeServer(data);
        const datasource = new EnterpriseDatasource(fakeServer);
        params.api.setEnterpriseDatasource(datasource);
      });
  }

}
