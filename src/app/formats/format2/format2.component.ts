import { DataMergeService } from './../../services/data-merge.service';
import { Attribute } from './../report-format';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormatService } from '../../services/format.service';
import { DataGeneratorService } from '../../services/data-generator.service';
import { AgGridCustomService } from '../../services/ag-grid-custom.service';
import { AgGridNg2 } from 'ag-grid-angular';
import { ReportFormat, Behaviour } from '../report-format';

import * as renderjson from 'renderjson';
import * as _ from 'lodash';
import { InMemoryService } from '../../services/in-memory.service';
import { GridOptions, ColumnApi, CellClickedEvent } from 'ag-grid';

@Component({
  selector: 'app-format2',
  templateUrl: './format2.component.html',
  styleUrls: ['./format2.component.css']
})
export class Format2Component implements OnInit {

  // self = null;

  behaviour: Behaviour = Behaviour.Tabular;

  @ViewChild('agGrid') agGrid: AgGridNg2;

  reportFormat: ReportFormat = {
    'rows': {
      'hierarchies': [
        {
          'attributes': {
            'CATEGORY': {
              'name': 'CATEGORY',
              'description': 'Category'
            },
            'BRANDFAMILY': {
              'name': 'BRANDFAMILY',
              'description': 'Brand Family'
            },
            'BRAND': {
              'name': 'BRAND',
              'description': 'Brand'
            }
          },
          'type': Behaviour.Tabular,
          'order': [
            'CATEGORY',
            'BRANDFAMILY',
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
            'MONTH': {
              'name': 'MONTH',
              'description': 'Month'
            },
            'DATE': {
              'name': 'DATE',
              'description': 'Date'
            },
            'QUARTER': {
              'name': 'QUARTER',
              'description': 'Quarter'
            }
          },
          'type': Behaviour.Tabular,
          'currentAttribute': 'QUARTER',
          'order': [
            'QUARTER',
            'MONTH',
            'DATE',

          ]
        }
      ]
    }
  };

  columnBehaviour = 'tabular';

  rowBehaviour = 'tabular';

  outputFormat: {};

  rowData = [];

  columnDefs = [];



  gridOptions: GridOptions = {
    rowSelection: 'multiple',
    enableColResize: true,
    groupMultiAutoColumn: true,
    showToolPanel: false,
    toolPanelSuppressSideButtons: true,
    enableSorting: true,
    enableFilter: true
  };

  dataPresentForGroupIds = [];

  changeFormat(behaviour, entity) {
    this.reportFormat[entity].hierarchies[0].type = behaviour;
    if (entity === 'columns') {
      this.behaviour = behaviour;
    }

    if (this.behaviour === Behaviour.Nested) {
      this.reportFormat.columns.hierarchies[0].currentAttribute = this.reportFormat.columns.hierarchies[0].order[0];
    }

    this.reportFormat[entity].hierarchies[0].currentAttribute = this.reportFormat[entity].hierarchies[0].order[0];
    this.dataPresentForGroupIds = [];
    this.getDataForSelectedFormat();
  }

  constructor(private formatService: FormatService, private dataGenerator: DataGeneratorService,
    private agGridCustomService: AgGridCustomService, private inMemoryService: InMemoryService,
    private dataMergeService: DataMergeService) { }

  ngOnInit() {
    this.getDataForSelectedFormat();
    // self = this;
    // document.getElementById('format').appendChild(renderjson(data));

  }

  getDataForSelectedFormat() {
    this.outputFormat = this.formatService.getFormat(this.reportFormat);
    document.getElementById('format').innerHTML = '';
    document.getElementById('format').appendChild(renderjson(this.outputFormat));

    const data = this.inMemoryService.getDataBasedOnFormat(this.outputFormat['groupedAttrs']);

    // data['data'] = this.dataGenerator.mergeMultipleDataSets(data, data['data'],
    // _.keys(this.getGroupedAttrs('columns', this.outputFormat)));

    console.log(data);

    const sub = this.dataGenerator
      .getMergedData(data['data'], [], _.keys(this.outputFormat['rows']),
        _.keys(this.agGridCustomService.getGroupedAttrs('columns', this.outputFormat)), data)
      .subscribe(dataObj => {
        this.rowData = this.dataGenerator.mergeMultipleDataSets(data, dataObj.data,
          _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)));

        // tslint:disable-next-line:max-line-length
        this.columnDefs = this.agGridCustomService.createColumnDef(dataObj.cols, this.outputFormat, this.reportFormat, this.drillDown, this);
      });
  }



  drillDown(params: CellClickedEvent) {
    const currentIndex = _.values(this.outputFormat['rows']).indexOf(params.colDef.field);
    if (currentIndex > -1) {
      const currentAttr = (_.keys(this.outputFormat['rows']))[currentIndex];
      let nextAttr;
      const index = this.reportFormat.rows.hierarchies[0].order.indexOf(currentAttr);
      if (this.reportFormat.rows.hierarchies[0].order.length > index + 1) {
        nextAttr = this.reportFormat.rows.hierarchies[0].order[index + 1];
        this.reportFormat.rows.hierarchies[0].currentAttribute = nextAttr;
        if (this.behaviour === Behaviour.Nested) {
          this.reportFormat.columns.hierarchies[0].currentAttribute = this.reportFormat.columns.hierarchies[0].order[0];
        }
        this.getDataForSelectedFormat();
        this.dataPresentForGroupIds = [];
      }
    }
  }


  columnGroupOpened(event) {
    const self = this;
    console.log('opened: ', event);
    if (event.columnGroup.expanded && (this.behaviour === Behaviour.Replacement ||
      (this.dataPresentForGroupIds.indexOf(event.columnGroup.groupId) === -1 && this.behaviour === Behaviour.Nested))) {
      this.dataPresentForGroupIds.push(event.columnGroup.groupId);
      const currentAttr: Attribute = event.columnGroup.colGroupDef.attribute;
      const parents = _.clone(event.columnGroup.colGroupDef.parents);

      const parentInfo = _.clone(event.columnGroup.colGroupDef.value);
      let nextAttr;
      const index = this.reportFormat.columns.hierarchies[0].order.indexOf(currentAttr.name);
      if (this.reportFormat.columns.hierarchies[0].order.length > index + 1) {
        nextAttr = this.reportFormat.columns.hierarchies[0].order[index + 1];
        this.reportFormat.columns.hierarchies[0].currentAttribute = nextAttr;
      }

      if (this.behaviour === Behaviour.Replacement) {
        setTimeout(() => {
          self.getDataForSelectedFormat();
        }, 1000);
      } else {
        let allCols = this.columnDefs;

        parents.forEach(parentValue => {
          allCols = _.find(allCols, (x) => x['headerName'] === parentValue).children;
        });

        const group = _.find(allCols, (x) => x['headerName'] === event.columnGroup.colGroupDef.headerName);

        group.children.forEach(element => {
          if (element.columnGroupShow === 'open') {
            element.headerName = '';
          }
        });

        // group.children = group.children.filter((x => x.columnGroupShow === 'closed'));
        this.outputFormat = this.formatService.getFormat(this.reportFormat);
        document.getElementById('format').innerHTML = '';
        document.getElementById('format').appendChild(renderjson(this.outputFormat));

        const data = this.inMemoryService.getDataBasedOnFormat(this.outputFormat['groupedAttrs']);

        const filteredData = this.filterDataBasedOnDrillVals(data['data'], parentInfo);


        // data['data'] = this.dataGenerator.mergeMultipleDataSets(data, data['data'],
        // _.keys(this.getGroupedAttrs('columns', this.outputFormat)));

        console.log(data);

        parents.push(event.columnGroup.colGroupDef.headerName);

        this.dataGenerator
          .getMergedData(filteredData, _.values(event.columnGroup.colGroupDef.value), _.keys(this.outputFormat['rows']),
            _.keys(this.agGridCustomService.getGroupedAttrs('columns', this.outputFormat)), data)
          .subscribe(dataObj => {
            const nextLevelData = this.dataGenerator.mergeMultipleDataSets(data, dataObj.data,
              _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)));

            this.dataMergeService.mergeTablesBasedOnRows(this.rowData, nextLevelData,
              _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)));

            let colDef = [];
            if (this.behaviour === Behaviour.Tabular ||
              (_.last(this.reportFormat.columns.hierarchies[0].order) === this.reportFormat.columns.hierarchies[0].currentAttribute)) {
              colDef = this.agGridCustomService.getColDef(dataObj.cols, 0, [], _.values(event.columnGroup.colGroupDef.value),
                this.agGridCustomService.getAttributes(this.reportFormat, 'columns', _.keys(this.outputFormat['columns'])));
            } else if (this.behaviour === Behaviour.Nested || this.behaviour === Behaviour.Replacement) {
              colDef = this.agGridCustomService.getHierarchyColDef(dataObj.cols, 0, [], parents,
                this.agGridCustomService.getAttributes(this.reportFormat, 'columns', _.keys(this.outputFormat['columns'])), parentInfo);
            }
            // this.columnDefs = this.columnDefs.concat(colDef);

            colDef.forEach(x => {
              x.columnGroupShow = 'open';
            });

            group.children = _.union(group.children, colDef);
            group.openByDefault = true;
            event.api.setRowData(this.rowData);

          });

        setTimeout(() => {
          event.api.setColumnDefs(self.columnDefs);
        }, 1000);


      }

    }
  }



  filterDataBasedOnDrillVals(data, filters) {
    _.map(filters, (value, key) => {
      data = data.filter((record) => value === record[key]);
    });
    return data;
  }

}
