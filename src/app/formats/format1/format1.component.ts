import { DataGeneratorService } from './../../services/data-generator.service';
import { FormatService } from './../../services/format.service';
import { Component, OnInit, ViewChild } from '@angular/core';

import * as renderjson from 'renderjson';
import { ReportFormat, Behaviour } from '../report-format';
import { AgGridNg2 } from 'ag-grid-angular';
import * as _ from 'lodash';
import { AgGridCustomService } from '../../services/ag-grid-custom.service';
import { DataService } from '../../services/data.service';
import { DataMergeService } from '../../services/data-merge.service';

@Component({
  selector: 'app-format1',
  templateUrl: './format1.component.html',
  styleUrls: ['./format1.component.css']
})
export class Format1Component implements OnInit {

  @ViewChild('agGrid') agGrid: AgGridNg2;

  format: ReportFormat = {
    'rows': {
      'hierarchies': [
        {
          'attributes': {
            'CATEGORY': {
              'name': 'CATEGORY',
              'description': 'Category'
            }
          },
          'type': Behaviour.Tabular,
          'order': [
            'CATEGORY'
          ]
        }
      ]
    },
    'pages': {
      'hierarchies': [
        {
          'attributes': {
            'STATE': {
              'name': 'STATE',
              'description': 'State',
              'outputFilters': [
                {
                  'STATE': 2
                }
              ]
            }
          },
          'type': Behaviour.Tabular,
          'order': [
            'STATE'
          ]
        }
      ]
    },
    'filters': {
      'attributes': {},
      'type': Behaviour.None
    },
    'columns': {
      'hierarchies': [
        {
          'attributes': {
            'MONTH': {
              'name': 'MONTH',
              'description': 'Month'
            }
          },
          'type': Behaviour.Tabular,
          'order': [
            'MONTH'
          ]
        }
      ]
    }
  };

  outputFormat: {};

  rowData = [];

  columnDefs = [];

  constructor(private formatService: FormatService, private dataGenerator: DataGeneratorService,
    private agGridCustomService: AgGridCustomService, private dataService: DataService,
    private dataMergeService: DataMergeService) { }

  ngOnInit() {

    this.dataService.getResponse().subscribe(response => {
      this.createUIData(response);
    });


    this.outputFormat = this.formatService.getFormat(this.format);
    document.getElementById('format').appendChild(renderjson(this.outputFormat));

    const data = this.dataGenerator.generateDataForMerge(this.outputFormat['groupedAttrs']);

    data['data'] = this.dataGenerator.mergeMultipleDataSets(data, data['data'], _.keys(this.outputFormat['columns']));

    console.log(data);

    const sub = this.dataGenerator.getMergedData(data['data'], [],
      _.keys(this.outputFormat['rows']), _.values(this.outputFormat['columns']), data)
      .subscribe(dataObj => {
        // this.rowData = this.dataGenerator.mergeMultipleDataSets(data, dataObj.data, _.keys(this.outputFormat['rows']));

        // this.createColumnDef(dataObj.cols);
      });

    // document.getElementById('format').appendChild(renderjson(data));


  }

  createUIData(response) {
    this.dataMergeService.convertServerDataToUI(response.resultData._data, response.resultData.attribColumns,
      response.resultData.measureColumns, response.resultData.columnMap);
    // console.log(response);
  }

  createColumnDef(cols) {
    this.columnDefs = [];
    _.forEach(this.outputFormat['rows'], (desc: string, name: string) => {
      this.columnDefs.push({
        headerName: desc,
        field: desc,
        width: 110,
        cellRenderer: function (params) {
          return '<div style="color: #007bff; text-decoration: underline; cursor: pointer;">' + params.value + '</div>';
        },
        cellClicked: function (params) {
          console.log(params);
        }
      });
    });

    let colDef = [];
    colDef = this.agGridCustomService.getColDef(cols, 0, [], [], []);
    this.columnDefs = this.columnDefs.concat(colDef);

    if (_.size(cols) === 0) {
      this.columnDefs.push({
        headerName: 'Value',
        field: 'value',
        width: 110,
        filter: 'agNumberColumnFilter'
      });
    }

  }

}
