import { FakeServer } from './fake-server';
import { DataGeneratorService } from './../../services/data-generator.service';
import * as _ from 'lodash';
import { ReportFormat } from '../report-format';
import { FormatService } from '../../services/format.service';

import { AgGridCustomService } from '../../services/ag-grid-custom.service';
import { AgGridNg2 } from 'ag-grid-angular';

export class EnterpriseDatasource {
    agGrid: AgGridNg2;

    fakeServer: FakeServer;
    constructor(fakeServer, agGrid) {
        this.fakeServer = fakeServer;
        this.agGrid = agGrid;
    }


    getRows(params) {
        console.log('EnterpriseDatasource.getRows: params = ', params);
        const self = this;
        const request = params.request;
        // if we are on the top level, then group keys will be [],
        // if we are on the second level, then group keys will be like ['United States']
        const groupKeys = request.groupKeys;

        const doingTopLevel = groupKeys.length === 0;

        if (doingTopLevel) {
            this.fakeServer.getFirstLevelData(successCallback, params);
        } else {
            const node = request.groupKeys[0];

            this.fakeServer.getNextLevelData(successCallback, params);
            // this.getnextLevelData(successCallback, params);
            // this.fakeServer.getCountryDetails(successCallback, country, request);
        }

        function successCallback(resultForGrid, lastRow) {
            params.successCallback(resultForGrid, lastRow);
            // self.agGrid.columnApi.setSecondaryColumns([]);
            // self.agGrid.api.setColumnDefs([]);
        }
    }





    /*getnextLevelData(callback, params) {
        const sub = this.dataGeneratorService.getMergedData(this.server.nextLevelData, [], ['product1']).subscribe(dataObj => {
            const lastrow = this.getLastRowResult(dataObj.data, params.request);
            if (!this.client.finalLevelData) {
                this.client.finalLevelData = dataObj.data;
            } else {
                this.mergeNextLevelData(this.client.finalLevelData, dataObj.data, 'product1');
            }
            this.getFurtherLevelData(this.client.finalLevelData);
            const self = this;
            setTimeout(function () {
                callback(self.client.finalLevelData, lastrow);
            }, 1000);
        });
    }

    getFurtherLevelData(primaryData) {
        this.dataPresentForGroupIds.forEach(id => {
            const agGroup = this.gridApi.columnApi.getColumnGroup(id);
            const parents = [agGroup.originalColumnGroup.colGroupDef.headerName];
            const group = _.find(this.columnDefs, (x) => x['headerName'] === agGroup.originalColumnGroup.colGroupDef.headerName);
            const sub = this.dataGeneratorService.getMergedData(this.server.finalLevelData, parents, ['product1']).subscribe(dataObj => {
                this.mergeNextLevelData(primaryData, dataObj.data, 'product1');
            });
        });

    }

    getFurtherLevelDataForRows(parents) {
        this.rowNodesDataPresent.forEach(node => {
            const sub = this.dataGeneratorService.getMergedData(this.server.finalLevelData, parents, ['product1']).subscribe(dataObj => {
                this.mergeNextLevelData(this.client.finalLevelData, dataObj.data, 'product1');
                const firstChild = this.gridApi.api.enterpriseRowModel.getRow(node.childrenCache
                    .displayIndexStart);
                const lastChild = this.gridApi.api.enterpriseRowModel.getRow(node.childrenCache
                    .displayIndexEnd - 1);
                const allNodes = this.gridApi.api.enterpriseRowModel.getNodesInRangeForSelection(firstChild, lastChild);

                for (let i = 0; i < allNodes.length; i++) {
                    allNodes[i].updateData(this.client.finalLevelData[i]);
                }

            });
        });

    }

    rowGroupOpened(event) {
        console.log(event);
        this.rowNodesDataPresent.push(event.node);
    }


    columnGroupOpened(event) {
        const group = _.find(this.columnDefs, (x) => x['headerName'] === event.columnGroup.colGroupDef.headerName);
        if (event.columnGroup.expanded && this.dataPresentForGroupIds.indexOf(event.columnGroup.groupId) === -1) {
            this.dataPresentForGroupIds.push(event.columnGroup.groupId);
            // event.columnGroup.colGroupDef.children = event.columnGroup.colGroupDef.children
            // .filter((x=>{return x.columnGroupShow == "closed"}));
            group.children = group.children.filter((x => x.columnGroupShow === 'closed'));
            const filter = event.columnGroup.colGroupDef.headerName.replace('L1', 'L2');
            const data = this.server.secondLevelData.filter((x) => x['market'] === filter);

            const parents = [event.columnGroup.colGroupDef.headerName];

            const sub = this.dataGeneratorService.getMergedData(this.server.secondLevelData, parents).subscribe(dataObj => {
                this.mergeNextLevelData(this.client.firstLevelData, dataObj.data, 'product');
                const colDef = this.getColumnDefs(dataObj, parents);
                group.children = _.union(group.children, colDef);
                group.openByDefault = true;
                event.api.setRowData(this.client.firstLevelData);
            });
            event.api.setColumnDefs(this.columnDefs);
            // event.columnApi.resetColumnState();
            this.getFurtherLevelDataForRows(parents);
        } else {
            group.openByDefault = false;
        }

    }

    mergeNextLevelData(primaryData, nextLevelData, attr) {
        for (let i = 0; i < primaryData.length; i++) {
            const record = _.find(nextLevelData, (x) => x[attr] === primaryData[i][attr]);
            if (record) {
                primaryData[i] = _.assign(primaryData[i], record);
            }
        }
    }

    getColumnDefs(nextLevelObj, parents): object[] {
        const colDef = [];

        nextLevelObj.cols[0].forEach((element: string) => {
            colDef.push({
                headerName: element.replace((parents.length > 0 ? parents + '_' : ''), ''),
                field: element,
                width: 110,
                columnGroupShow: 'open',
                filter: 'agNumberColumnFilter'
            });
        });

        return colDef;
    }*/

}
