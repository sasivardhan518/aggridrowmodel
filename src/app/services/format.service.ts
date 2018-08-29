import { ReportFormat, Hierarchy, Attribute, Behaviour } from './../formats/report-format';
import { Injectable, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class FormatService {

    getColumns: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    getFormat(reportFormat: ReportFormat) {
        const result = { rows: {}, pages: {}, columns: {}, groupedAttrs: {} };
        const allHirarchies = reportFormat.rows.hierarchies.concat(reportFormat.pages.hierarchies).concat(reportFormat.columns.hierarchies);

        this.getFormatForHierarchy(reportFormat, result, 'rows');
        this.getFormatForHierarchy(reportFormat, result, 'pages');
        this.getFormatForHierarchy(reportFormat, result, 'columns');
        // allHirarchies.forEach((a) => reslult.attrs = reslult.attrs.concat(Object.keys(a.attributes)));
        return result;
    }

    getFormatForHierarchy(reportFormat: ReportFormat, result, entityType: string) {
        _.forEach(reportFormat[entityType].hierarchies, (hierarchy: Hierarchy) => {
            if (hierarchy.type === Behaviour.Nested) {
                const currentIndex = hierarchy.order.indexOf(hierarchy.currentAttribute);
                _.forEach(hierarchy.order, (name: string, index: number) => {
                    result[entityType][name] = hierarchy.attributes[name].description;
                    if (index <= currentIndex) {
                        result.groupedAttrs[name] = hierarchy.attributes[name].description;
                    }
                });

                if (entityType === 'columns') {
                    result[entityType] = {};
                    result[entityType][hierarchy.currentAttribute] = hierarchy.attributes[hierarchy.currentAttribute].description;
                }
                // result.groupedAttrs[hierarchy.currentAttribute] = hierarchy.attributes[hierarchy.currentAttribute].description;
            } else if (hierarchy.type === Behaviour.Tabular) {
                _.forEach(hierarchy.order, (attrName: string) => {
                    result[entityType][attrName] = hierarchy.attributes[attrName].description;
                    result.groupedAttrs[attrName] = hierarchy.attributes[attrName].description;
                });
                /*_.forEach(hierarchy.attributes, (value: Attribute, name) => {
                    result[entityType][name] = value.description;
                    result.groupedAttrs[name] = value.description;
                });*/
            } else if (hierarchy.type === Behaviour.Replacement) {
                result[entityType][hierarchy.currentAttribute] = hierarchy.attributes[hierarchy.currentAttribute].description;
                result.groupedAttrs[hierarchy.currentAttribute] = hierarchy.attributes[hierarchy.currentAttribute].description;
            }
        });
    }

}
