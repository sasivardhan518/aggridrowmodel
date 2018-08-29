import { DataMergeService } from './../../services/data-merge.service';
import { AgGridNg2 } from 'ag-grid-angular';
import { DataGeneratorService } from '../../services/data-generator.service';
import { ReportFormat, Attribute, Behaviour } from '../report-format';
import { AgGridCustomService } from '../../services/ag-grid-custom.service';
import { FormatService } from '../../services/format.service';
import * as renderjson from 'renderjson';
import * as _ from 'lodash';
import { IEnterpriseGetRowsParams, RowNode, IEnterpriseGetRowsRequest } from 'ag-grid';
import { InMemoryService } from '../../services/in-memory.service';
import { Injectable } from '@angular/core';

interface NodeInfo {
    node: any; // RowNode
    data: object[];
    request: IEnterpriseGetRowsRequest;
    params: IEnterpriseGetRowsParams;
}

@Injectable()
export class FakeServer {

    primaryColumnDefs;
    secondaryColumnDefs = [];
    gridApi: AgGridNg2; // AgGridNg2;
    // dataGeneratorService: DataGeneratorService;
    reportFormat: ReportFormat;
    outputFormat: {};
    // formatService;
    // agGridCustomService: AgGridCustomService;
    // inMemoryService: InMemoryService;
    private dataPresentForGroups = [];
    private rowNodesDataPresent = [];
    // dataMergeService: DataMergeService;

    allLeafsData = [];

    // constructor(dataGeneratorService: DataGeneratorService, columnDefs, params, reportFormat: ReportFormat,
    //     formatService: FormatService, agGridCustomService: AgGridCustomService, inMemoryService: InMemoryService,
    //     dataMergeService: DataMergeService) {
    //     this.primaryColumnDefs = columnDefs;
    //     this.gridApi = params;
    //     this.dataGeneratorService = dataGeneratorService;
    //     this.reportFormat = reportFormat;
    //     this.formatService = formatService;
    //     this.agGridCustomService = agGridCustomService;
    //     this.inMemoryService = inMemoryService;
    //     this.dataMergeService = dataMergeService;
    // }

    constructor(private dataGeneratorService: DataGeneratorService,
        private formatService: FormatService, private agGridCustomService: AgGridCustomService,
        private inMemoryService: InMemoryService,
        private dataMergeService: DataMergeService) {
    }

    setData(columnDefs, params, reportFormat) {
        this.primaryColumnDefs = columnDefs;
        this.gridApi = params;
        this.reportFormat = reportFormat;
    }

    getFirstLevelData(callback, params: IEnterpriseGetRowsParams) {
        const self = this;
        this.outputFormat = this.formatService.getFormat(this.reportFormat);
        document.getElementById('format').innerHTML = '';
        document.getElementById('format').appendChild(renderjson(this.outputFormat));

        const data = this.inMemoryService.getDataBasedOnFormat(this.outputFormat['groupedAttrs']);
        this.dataPresentForGroups.push({});
        const sub = this.dataGeneratorService
            .getMergedData(data['data'], [], _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)),
                _.keys(this.outputFormat['columns']), data)
            .subscribe(dataObj => {
                dataObj.data = this.dataGeneratorService.mergeMultipleDataSets(data, dataObj.data, _.keys(this.outputFormat['rows']));

                const colDefs = this.agGridCustomService.createColumnDef(dataObj.cols, this.outputFormat, this.reportFormat, null);
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                this.secondaryColumnDefs = this.primaryColumnDefs.concat(colDefs);

                this.gridApi.columnApi.setSecondaryColumns(this.secondaryColumnDefs);
                const lastrow = this.getLastRowResult(dataObj.data, params.request);
                setTimeout(function () {
                    // self.allLeafsData.push({
                    //     'node': params.parentNode, 'data': dataObj.data,
                    //     'request': params.request, 'params': params
                    // });
                    callback(dataObj.data, lastrow);
                }, 10);
            });
    }

    changeFormat(behaviour, entity) {
        this.reportFormat[entity].hierarchies[0].type = behaviour;

        if (this.reportFormat.columns.hierarchies[0].type === Behaviour.Nested) {
            this.reportFormat.columns.hierarchies[0].currentAttribute = this.reportFormat.columns.hierarchies[0].order[0];
        }

        if (this.reportFormat.rows.hierarchies[0].type === Behaviour.Nested) {
            this.reportFormat.rows.hierarchies[0].currentAttribute = this.reportFormat.rows.hierarchies[0].order[0];
        }

        this.reportFormat[entity].hierarchies[0].currentAttribute = this.reportFormat[entity].hierarchies[0].order[0];
        this.dataPresentForGroups = [];
        this.allLeafsData = [];
        // this.getDataForSelectedFormat();
    }

    getNextLevelData(callback, params: IEnterpriseGetRowsParams) {

        const attrsInfo = this.getNextLevelAttribute(params.parentNode.field);
        const self = this;
        const drillInfo = _.pick(params.parentNode.data, attrsInfo['parents']);

        this.outputFormat = this.formatService.getFormat(this.reportFormat);
        document.getElementById('format').innerHTML = '';
        document.getElementById('format').appendChild(renderjson(this.outputFormat));

        const data = this.inMemoryService.getDataBasedOnFormat(this.outputFormat['groupedAttrs']);
        const filteredData = this.filterDataBasedOnDrillVals(data['data'], drillInfo);

        const sub = this.dataGeneratorService
            .getMergedData(filteredData, [], _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)),
                _.keys(this.outputFormat['columns']), data)
            .subscribe(dataObj => {
                dataObj.data = this.dataGeneratorService.mergeMultipleDataSets(data, dataObj.data,
                    _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)));

                if (this.dataPresentForGroups.length === 0) {
                    const lastrow = this.getLastRowResult(dataObj.data, params.request);
                    setTimeout(function () {
                        self.allLeafsData.push({
                            'node': params.parentNode, 'data': dataObj.data,
                            'request': params.request, 'params': params
                        });
                        callback(dataObj.data, lastrow);
                    }, 10);
                } else if (this.dataPresentForGroups.length > 0) {
                    this.updateDataForAllGridColumns(dataObj.data, callback, params, drillInfo);
                }

            });
    }

    filterDataBasedOnDrillVals(data, filters) {
        _.map(filters, (value, key) => {
            data = data.filter((record) => value === record[key]);
        });
        return data;
    }

    getNextLevelAttribute(currentAttrDesc: string): { [key: string]: any } {
        let index = (_.values(this.outputFormat['rows'])).indexOf(currentAttrDesc);
        const parents = [];
        if (index === -1) {
            this.reportFormat.rows.hierarchies[0].currentAttribute = this.reportFormat.rows.hierarchies[0].order[0];
            return {
                'currentAttr': this.reportFormat.rows.hierarchies[0].order[0],
                'nextAttr': this.reportFormat.rows.hierarchies[0].order[0], 'parents': parents
            };
        }
        const currentAttr = _.keys(this.outputFormat['rows'])[index];
        let nextAttr;

        index = this.reportFormat.rows.hierarchies[0].order.indexOf(currentAttr);

        this.reportFormat.rows.hierarchies[0].order.forEach((x, i) => {
            if (i <= index) {
                parents.push(x);
            }
        });
        if (this.reportFormat.rows.hierarchies[0].order.length > index + 1) {
            nextAttr = this.reportFormat.rows.hierarchies[0].order[index + 1];
            this.reportFormat.rows.hierarchies[0].currentAttribute = nextAttr;
        }

        return { 'currentAttr': currentAttr, 'nextAttr': nextAttr, 'parents': parents };
    }


    createColumnDef(cols) {

        let colDef = [];
        colDef = this.agGridCustomService.getColDef(cols, 0, [], [],
            this.agGridCustomService.getAttributes(this.reportFormat, 'columns', _.keys(this.outputFormat['columns'])));
        this.primaryColumnDefs = this.primaryColumnDefs.concat(colDef);

        if (_.size(cols) === 0) {
            this.primaryColumnDefs.push({
                headerName: 'Value',
                field: 'value',
                width: 110,
                filter: 'agNumberColumnFilter'
            });
        }

    }

    getLastRowResult(result, request) {
        const lastRowFound = (result.length <= request.endRow);
        const lastRow = lastRowFound ? result.length : null;
        return lastRow;
    }

    updateReportFormatForGroup(columnGroup) {

        if (!columnGroup.colGroupDef) {
            this.reportFormat.columns.hierarchies[0].currentAttribute = this.reportFormat.columns.hierarchies[0].order[0];
        } else {
            const currentAttr: Attribute = columnGroup.colGroupDef.attribute;

            let nextAttr;
            const index = this.reportFormat.columns.hierarchies[0].order.indexOf(currentAttr.name);
            if (this.reportFormat.columns.hierarchies[0].order.length > index + 1) {
                nextAttr = this.reportFormat.columns.hierarchies[0].order[index + 1];
                this.reportFormat.columns.hierarchies[0].currentAttribute = nextAttr;
            }
        }

    }

    columnGroupOpened(event) {
        console.log('opened: ', event);
        if (event.columnGroup.expanded && (this.reportFormat.columns.hierarchies[0].type === Behaviour.Replacement ||
            (_.map(this.dataPresentForGroups, (x) => x.groupId).indexOf(event.columnGroup.groupId) === -1 &&
                this.reportFormat.columns.hierarchies[0].type === Behaviour.Nested))) {
            this.dataPresentForGroups.push(event.columnGroup);

            this.updateReportFormatForGroup(event.columnGroup);

            const parents = _.clone(event.columnGroup.colGroupDef.parents);

            const parentInfo = _.clone(event.columnGroup.colGroupDef.value);

            if (this.reportFormat.columns.hierarchies[0].type === Behaviour.Replacement) {
                this.reportFormat.rows.hierarchies[0].currentAttribute = this.reportFormat.rows.hierarchies[0].order[0];
                this.dataPresentForGroups = [];
                this.allLeafsData = [];
                this.gridApi.api.purgeEnterpriseCache();
            } else {
                let allCols = this.secondaryColumnDefs;

                parents.forEach(parentValue => {
                    allCols = _.find(allCols, (x) => x['headerName'] === parentValue).children;
                });

                this.reportFormat.rows.hierarchies[0].currentAttribute = this.reportFormat.rows.hierarchies[0].order[0];

                const group = _.find(allCols, (x) => x['headerName'] === event.columnGroup.colGroupDef.headerName);

                group.children.forEach(element => {
                    if (element.columnGroupShow === 'open') {
                        element.headerName = '';
                    }
                });

                // group.children = group.children.filter((x => x.columnGroupShow === 'closed'));
                parents.push(event.columnGroup.colGroupDef.headerName);
                this.updateDataForGridRows(parents, parentInfo, group);
            }

        }
    }

    updateDataForGridRows(parents, parentInfo, group) {
        const lastGroupIndex = this.allLeafsData.length - 1;
        const self = this;

        this.allLeafsData.forEach((rowGroup: NodeInfo, rowGroupIndex) => {

            const attrsInfo = this.getNextLevelAttribute(rowGroup.node.field);
            let drillInfo = _.pick(rowGroup.node.data, attrsInfo['parents']);
            drillInfo = _.assign(drillInfo, parentInfo);
            this.outputFormat = this.formatService.getFormat(this.reportFormat);
            const data = this.inMemoryService.getDataBasedOnFormat(this.outputFormat['groupedAttrs']);

            const filteredData = this.filterDataBasedOnDrillVals(data['data'], drillInfo);

            const sub = this.dataGeneratorService
                .getMergedData(filteredData, _.values(parentInfo),
                    _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)),
                    _.keys(this.outputFormat['columns']), data)
                .subscribe(dataObj => {
                    dataObj.data = this.dataGeneratorService.mergeMultipleDataSets(data, dataObj.data,
                        _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)));

                    this.dataMergeService.mergeTablesBasedOnRows(rowGroup.data, dataObj.data,
                        _.keys(self.agGridCustomService.getGroupedAttrs('rows', self.outputFormat)));

                    const rowsCount = rowGroup.node.childrenCache.virtualRowCount;

                    const rowNodes = rowGroup.node.childrenCache.blocks[0].rowNodes.slice(0, rowsCount);

                    if (rowGroupIndex === 0) {
                        let colDef = [];
                        if (_.last(this.reportFormat.columns.hierarchies[0].order) ===
                            this.reportFormat.columns.hierarchies[0].currentAttribute) {

                            colDef = this.agGridCustomService.getColDef(dataObj.cols, 0, [], _.values(parentInfo),
                                this.agGridCustomService.getAttributes(this.reportFormat, 'columns', _.keys(this.outputFormat['columns'])));

                        } else {
                            colDef = this.agGridCustomService.getHierarchyColDef(dataObj.cols, 0, [], parents,
                                this.agGridCustomService.getAttributes(this.reportFormat, 'columns',
                                    _.keys(this.outputFormat['columns'])), parentInfo);
                        }

                        colDef.forEach(x => {
                            x.columnGroupShow = 'open';
                        });

                        group.children = _.union(group.children, colDef);
                        group.openByDefault = true;

                        setTimeout(function () {
                            self.gridApi.columnApi.setSecondaryColumns(self.secondaryColumnDefs);
                        }, 1000);

                    }

                    const lastrow = self.getLastRowResult(rowGroup.data, rowGroup.params.request);
                    rowGroup.params.successCallback(rowGroup.data, lastrow);

                });
        });

    }

    updateDataForAllGridColumns(primaryData, callback, params, drillInfo) {
        const lastGroupIndex = this.dataPresentForGroups.length - 1;
        const self = this;
        this.dataPresentForGroups.forEach((columnGroup, i) => {
            let parents = [];
            let parentInfo = {};
            let totalFilterVals = {};

            this.updateReportFormatForGroup(columnGroup);

            if (columnGroup.colGroupDef) {
                parents = _.clone(columnGroup.colGroupDef.parents);

                parentInfo = _.clone(columnGroup.colGroupDef.value);
                totalFilterVals = _.clone(columnGroup.colGroupDef.value);

                parents.push(columnGroup.colGroupDef.headerName);
            }

            totalFilterVals = _.assign(totalFilterVals, drillInfo);
            this.outputFormat = this.formatService.getFormat(this.reportFormat);
            const data = this.inMemoryService.getDataBasedOnFormat(this.outputFormat['groupedAttrs']);
            const filteredData = this.filterDataBasedOnDrillVals(data['data'], parentInfo);

            this.dataGeneratorService
                .getMergedData(filteredData, _.values(parentInfo), _.keys(this.outputFormat['rows']),
                    _.keys(this.agGridCustomService.getGroupedAttrs('columns', this.outputFormat)), data)
                .subscribe(dataObj => {
                    const nextLevelData = this.dataGeneratorService.mergeMultipleDataSets(data, dataObj.data,
                        _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)));

                    this.dataMergeService.mergeTablesBasedOnRows(primaryData, nextLevelData,
                        _.keys(this.agGridCustomService.getGroupedAttrs('rows', this.outputFormat)));

                });

            if (i === lastGroupIndex) {
                const lastrow = this.getLastRowResult(primaryData, params.request);
                setTimeout(function () {
                    self.allLeafsData.push({ 'node': params.parentNode, 'data': primaryData, 'request': params.request, 'params': params });
                    callback(primaryData, lastrow);
                }, 10);
            }

        });
    }
}
