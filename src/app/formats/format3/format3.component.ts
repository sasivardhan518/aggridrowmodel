import { DataMergeService } from './../../services/data-merge.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormatService } from '../../services/format.service';
import { DataGeneratorService } from '../../services/data-generator.service';
import { AgGridCustomService } from '../../services/ag-grid-custom.service';
import { AgGridNg2 } from 'ag-grid-angular';
import { ReportFormat, Behaviour } from '../report-format';

import * as renderjson from 'renderjson';
import * as _ from 'lodash';
import { EnterpriseDatasource } from './enterprise-datasource';
import { FakeServer } from './fake-server';
import { InMemoryService } from '../../services/in-memory.service';

@Component({
  selector: 'app-format3',
  templateUrl: './format3.component.html',
  styleUrls: ['./format3.component.css']
})
export class Format3Component implements OnInit {

  @ViewChild('agGrid') agGrid: AgGridNg2;

  comments = 'When we collapse a parent node in columns, only parent node will be collapsed and all of its childs are visible.';

  format: ReportFormat = {
    'rows': {
      'hierarchies': [
        {
          'attributes': {
            'CATEGORY': {
              'name': 'CATEGORY',
              'description': 'Category'
            },
            'MANUFACTURER': {
              'name': 'MANUFACTURER',
              'description': 'Manufacturer'
            },
            'BRAND': {
              'name': 'BRAND',
              'description': 'Brand'
            }
          },
          'type': Behaviour.Nested,
          'currentAttribute': 'CATEGORY',
          'order': [
            'CATEGORY',
            'MANUFACTURER',
            'BRAND'
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
            'QUARTER': {
              'name': 'QUARTER',
              'description': 'Quarter'
            },
            'MONTH': {
              'name': 'MONTH',
              'description': 'Month'
            },
            'DATE': {
              'name': 'DATE',
              'description': 'Date'
            }
          },
          'currentAttribute': 'QUARTER',
          'type': Behaviour.Nested,
          'order': [
            'QUARTER',
            'MONTH',
            'DATE'
          ]
        }
      ]
    }
  };

  outputFormat: {};
  private gridApi;
  private gridColumnApi;

  columnDefs = [];
  defaultColDef;

  columnBehaviour = 'nested';


  private rowBuffer;
  private rowGroupPanelShow;
  private rowSelection;
  private isRowSelectable;

  datasource: EnterpriseDatasource;

  rowModelType = 'enterprise';
  maxConcurrentDatasourceRequests = 10;
  cacheBlockSize = 100;
  maxBlocksInCache = 2;
  autoGroupColumnDef;
  icons = {
    groupLoading:
      // tslint:disable-next-line:max-line-length
      '<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif" style="width:22px;height:22px;">'
  };

  constructor(private formatService: FormatService, private dataGeneratorService: DataGeneratorService,
    private agGridCustomService: AgGridCustomService, private inMemoryService: InMemoryService,
    private dataMergeService: DataMergeService) { }

  ngOnInit() {

    this.formatService.getColumns.subscribe(data => {
      // this.columnDefs = data;
    });

    this.createPrimaryColDef();
    // this.columnDefs = [
    //   {
    //     headerName: 'Category',
    //     field: 'Category',
    //     width: 120,
    //     filter: 'agTextColumnFilter',
    //     enableRowGroup: true,
    //     rowGroup: true,
    //     cellRenderer: 'agGroupCellRenderer',
    //     hide: true
    //   },
    //   {
    //     headerName: 'Category',
    //     field: 'Category',
    //     width: 120,
    //     filter: 'agTextColumnFilter',
    //     enableRowGroup: true,
    //     rowGroup: true,
    //     cellRenderer: 'agGroupCellRenderer',
    //     hide: true
    //   },
    //   {
    //     headerName: 'Category',
    //     field: 'Category',
    //     width: 120,
    //     filter: 'agTextColumnFilter',
    //     enableRowGroup: true,
    //     rowGroup: true,
    //     cellRenderer: 'agGroupCellRenderer',
    //     hide: true
    //   }
    // ];

    this.defaultColDef = {
      suppressFilter: true,
      width: 150
    };

    this.autoGroupColumnDef = {
      field: 'Brand',
      width: 150,
      // cellRenderer: 'agGroupCellRenderer'
      // cellRendererParams: { checkbox: true }
    };
    this.rowBuffer = 0;
    this.rowModelType = 'enterprise';
    this.rowGroupPanelShow = 'always';
    this.rowSelection = 'multiple';
    this.isRowSelectable = function (rowNode) {
      return !rowNode.group;
    };
    this.maxConcurrentDatasourceRequests = 2;
    this.cacheBlockSize = 100;
    this.maxBlocksInCache = 2;
    this.icons = {
      groupLoading:
        `<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif"
         style="width:22px;height:22px;">`
    };

  }

  columnGroupOpened(event) {
    this.datasource.fakeServer.columnGroupOpened(event);
  }

  rowGroupOpened(event) {
    console.log(event);
    // this.rowNodesDataPresent.push(event.node);

    // this.datasource.rowGroupOpened(event);
  }


  changeFormat(behaviour, entity) {
    this.datasource.fakeServer.changeFormat(behaviour, entity);
    this.gridApi.purgeEnterpriseCache();
  }

  stateOfGrid() {
    const blockState = this.gridApi.getCacheBlockState();
    console.log(blockState);
  }



  createPrimaryColDef() {
    if (this.format.rows.hierarchies[0].type === Behaviour.Nested) {
      const lastAttr = _.last(this.format.rows.hierarchies[0].order);
      this.format.rows.hierarchies[0].order.forEach((x, i) => {
        this.columnDefs.push({
          headerName: this.format.rows.hierarchies[0].attributes[x].description,
          field: this.format.rows.hierarchies[0].attributes[x].description,
          width: 150,
          filter: 'agTextColumnFilter',
          enableRowGroup: true,
          rowGroup: this.format.rows.hierarchies[0].order.length > i + 1,
          // cellRenderer: this.format.rows.hierarchies[0].order.length > i + 1 ? 'agGroupCellRenderer' : '',
          hide: true
        });
      });
      this.autoGroupColumnDef = {
        field: this.format.rows.hierarchies[0].attributes[lastAttr].description,
        width: 150
        // cellRenderer: 'agGroupCellRenderer'
        // cellRendererParams: { checkbox: true }
      };
    }
  }





  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    const fakeServer = new FakeServer(this.dataGeneratorService, this.columnDefs, params,
      this.format, this.formatService, this.agGridCustomService, this.inMemoryService, this.dataMergeService);

    this.datasource = new EnterpriseDatasource(fakeServer, this.agGrid);
    params.api.setEnterpriseDatasource(this.datasource);

  }


}


