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
import { CustomCellRendererComponent } from './custom-cell-renderer/custom-cell-renderer.component';

@Component({
  selector: 'app-format4',
  templateUrl: './format4.component.html',
  styleUrls: ['./format4.component.css'],
  providers: [FakeServer]
})
export class Format4Component implements OnInit {

  @ViewChild('agGrid') agGrid: AgGridNg2;

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

        // {
        //   'attributes': {
        //     'BRANDGROUP': {
        //       'name': 'BRANDGROUP',
        //       'description': 'Brand Group'
        //     },
        //     'STATE': {
        //       'name': 'STATE',
        //       'description': 'State'
        //     }
        //   },
        //   'type': Behaviour.Tabular,
        //   'currentAttribute': 'BRANDGROUP',
        //   'order': [
        //     'BRANDGROUP',
        //     'STATE'
        //   ]
        // },
        // {
        //   'attributes': {
        //     'CITY': {
        //       'name': 'CITY',
        //       'description': 'City'
        //     },
        //     'REGION': {
        //       'name': 'REGION',
        //       'description': 'Region'
        //     }
        //   },
        //   'type': Behaviour.Replacement,
        //   'currentAttribute': 'CITY',
        //   'order': [
        //     'CITY',
        //     'REGION'
        //   ]
        // }
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

  comments = 'When we collapse a parent node in columns, all of its childs will be collapsed.';

  private rowBuffer;
  private rowGroupPanelShow;
  private rowSelection;
  private isRowSelectable;

  datasource: EnterpriseDatasource;

  frameworkComponents;

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
    private dataMergeService: DataMergeService, private fakeServer: FakeServer) { }

  ngOnInit() {

    this.formatService.getColumns.subscribe(data => {
      // this.columnDefs = data;
    });

    this.createPrimaryColDef();
    this.defaultColDef = {
      suppressFilter: true,
      width: 150
    };

    this.autoGroupColumnDef = {
      field: this.getAutoGroupColumn(),
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
    this.maxConcurrentDatasourceRequests = 1000;
    this.cacheBlockSize = 1000;
    this.maxBlocksInCache = 1000;
    this.icons = {
      groupLoading:
        `<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif"
         style="width:22px;height:22px;">`
    };

    this.frameworkComponents = {
      CustomCellRendererComponent: CustomCellRendererComponent
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

  getAutoGroupColumn() {
    let autoGroupColumn = '';
    this.format.rows.hierarchies.forEach(hierarchy => {
      if (hierarchy.type === Behaviour.Nested) {
        const lastAttr = _.last(hierarchy.order);
        autoGroupColumn = hierarchy.attributes[lastAttr].description;
      }
    });

    return autoGroupColumn;
  }



  createPrimaryColDef() {

    this.format.rows.hierarchies.forEach(hierarchy => {
      if (hierarchy.type === Behaviour.Nested) {
        this.columnDefs.push({
          headerName: 'Country Group - No Renderer'
        });
        this.columnDefs.push({
          headerName: 'Group',
          showRowGroup: true,
          cellRenderer: 'agGroupCellRenderer',
          field: 'Brand'
        });

        hierarchy.order.forEach((x, i) => {
          this.columnDefs.push({
            headerName: hierarchy.attributes[x].description,
            field: hierarchy.attributes[x].description,
            width: 150,
            filter: 'agTextColumnFilter',
            enableRowGroup: true,
            rowGroup: hierarchy.order.length > i + 1,
            hide: true,
            cellRenderer: 'CustomCellRendererComponent'
          });
          /*this.columnDefs.push({
            headerName: hierarchy.attributes[x].description,
            field: hierarchy.attributes[x].description,
            width: 150,
            filter: 'agTextColumnFilter',
            enableRowGroup: false,
            rowGroup: hierarchy.order.length > i + 1,
            cellRenderer: 'agGroupCellRenderer'
          });*/
        });

      } else if (hierarchy.type === Behaviour.Tabular) {
        hierarchy.order.forEach((x, i) => {
          this.columnDefs.push({
            headerName: hierarchy.attributes[x].description,
            field: hierarchy.attributes[x].description,
            width: 150,
            filter: 'agTextColumnFilter'
          });
        });
      } else if (hierarchy.type === Behaviour.Replacement) {
        const lastAttr = _.last(hierarchy.order);
        this.columnDefs.push({
          headerName: hierarchy.attributes[hierarchy.currentAttribute].description,
          field: hierarchy.attributes[hierarchy.currentAttribute].description,
          width: 150,
          filter: 'agTextColumnFilter',
          cellRenderer: function (params) {
            if (lastAttr !== hierarchy.currentAttribute) {
              return '<div style="color: #007bff; text-decoration: underline; cursor: pointer;">' + params.value + '</div>';
            } else {
              return params.value;
            }
          }
        });
      }
    });
    console.log('____________________________----------------------------_________________>>>>>>>>>>');
    console.log(this.columnDefs);
  }

  SimpleCellRenderer(params) {
    if (params.node.group) {
      // params.node.expanded = true;
    }
    return params.value;
  }





  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // const fakeServer = new FakeServer(this.dataGeneratorService, this.columnDefs, params,
    // this.format, this.formatService, this.agGridCustomService, this.inMemoryService, this.dataMergeService);

    this.fakeServer.setData(this.columnDefs, params, this.format);

    this.datasource = new EnterpriseDatasource(this.fakeServer, this.agGrid);
    params.api.setEnterpriseDatasource(this.datasource);

  }


}


