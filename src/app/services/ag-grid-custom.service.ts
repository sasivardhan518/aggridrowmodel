import { Attribute, ReportFormat, Behaviour } from './../formats/report-format';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class AgGridCustomService {

    constructor() { }

    getColDef(cols: string[][], index: number, vals: string[], parents: string[], attributes: Attribute[]) {
        const colDef = [];

        if (cols.length - 1 === index) {
            cols[index].forEach(element => {
                colDef.push({
                    headerName: element[attributes[index].description],
                    field: (parents).concat(_.map(vals.concat(element), (x, i) => x[attributes[i].name])).join('_'),
                    width: 120,
                    filter: 'agNumberColumnFilter'
                });
            });
        } else {
            cols[index].forEach(element => {
                colDef.push({
                    headerName: element[attributes[index].description],
                    field: element[attributes[index].name],
                    width: 120,
                    children: this.getColDef(cols, index + 1, vals.concat(element), parents, attributes)
                });
            });

        }

        return colDef;

    }

    getHierarchyColDef(cols: string[][], index: number, vals: string[], parents: string[], attributes: Attribute[], parentInfo: object) {
        const colDef = [];

        function getChildDefs(element) {
            const childDefs = [];
            childDefs.push({
                headerName: '',
                field: (_.values(parentInfo)).concat(_.map(vals.concat(element), (x, i) => x[attributes[i].name])).join('_'),
                width: 110,
                columnGroupShow: 'closed',
                filter: 'agNumberColumnFilter'
            },
                {
                    // tslint:disable-next-line:max-line-length
                    headerName: `<img src="https://raw.githubusercontent.com/ag-grid/ag-grid-docs/master/src/javascript-grid-enterprise-model/spinner.gif"
                     style="width:22px;height:22px;">`,
                    field: (_.values(parentInfo)).concat(_.map(vals.concat(element), (x, i) => x[attributes[i].name])).join('_'),
                    width: 110,
                    columnGroupShow: 'open',
                    filter: 'agNumberColumnFilter'
                });
            return childDefs;
        }

        cols[index].forEach(element => {
            colDef.push({
                headerName: element[attributes[index].description],
                field: element[attributes[index].name],
                width: 110,
                expandable: true,
                marryChildren: true,
                children: getChildDefs(element),
                attribute: _.clone(attributes[index]),
                parents: parents,
                value: _.assign(_.clone(parentInfo), { [attributes[index].name]: element[attributes[index].name] })
            });
        });

        return colDef;
    }

    createColumnDef(cols, outputFormat, reportFormat: ReportFormat, drillDownCall?: Function, context?) {
        let columnDefs = [];
        const self = this;

        if (reportFormat.rows.hierarchies[0].type !== Behaviour.Nested) {
            _.forEach(outputFormat['rows'], (desc: string, name: string) => {
                columnDefs.push({
                    headerName: desc,
                    field: desc,
                    width: 150,
                    showRowGroup: true,
                    // cellRenderer: 'agGroupCellRenderer',
                    cellRenderer: function (params) {
                        // tslint:disable-next-line:max-line-length
                        const lastAttr = _.last(reportFormat.rows.hierarchies[0].order);
                        if (reportFormat.rows.hierarchies[0].type === Behaviour.Replacement
                            && reportFormat.rows.hierarchies[0].currentAttribute !== lastAttr) {
                            return '<div style="color: #007bff; text-decoration: underline; cursor: pointer;">' + params.value + '</div>';
                        } else {
                            return params.value;
                        }
                    },
                    onCellClicked: drillDownCall.bind(context)
                });
            });
        }

        let colDef = [];
        if (reportFormat.columns.hierarchies[0].type === Behaviour.Tabular ||
            (reportFormat.columns.hierarchies[0].type === Behaviour.Replacement &&
                _.last(reportFormat.columns.hierarchies[0].order) === reportFormat.columns.hierarchies[0].currentAttribute)) {
            colDef = this.getColDef(cols, 0, [], [],
                this.getAttributes(reportFormat, 'columns', _.keys(outputFormat['columns'])));
        } else if (reportFormat.columns.hierarchies[0].type === Behaviour.Nested ||
            reportFormat.columns.hierarchies[0].type === Behaviour.Replacement) {
            colDef = this.getHierarchyColDef(cols, 0, [], [], this.getAttributes(reportFormat, 'columns',
                _.keys(outputFormat['columns'])), {});
        }

        columnDefs = columnDefs.concat(colDef);

        if (_.size(cols) === 0) {
            columnDefs.push({
                headerName: 'Value',
                field: 'value',
                width: 110,
                filter: 'agNumberColumnFilter'
            });
        }

        return columnDefs;
    }

    getGroupedAttrs(entity: string, format: object): object {
        let groupedKeys: string[] = _.keys(format[entity]);
        groupedKeys = groupedKeys.filter((x) => format['groupedAttrs'][x]);
        return _.pick(format[entity], groupedKeys);
    }

    getAttributes(format: ReportFormat, entity: string, attributes: string[]): Attribute[] {
        const result: Attribute[] = [];

        attributes.forEach(attr => {
            result.push(format[entity].hierarchies[0].attributes[attr]);
        });

        return result;

    }

}
