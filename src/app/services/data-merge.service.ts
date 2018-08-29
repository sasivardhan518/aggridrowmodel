import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class DataMergeService {

    constructor() { }

    mergeTablesBasedOnRows(primaryData, nextLevelData, attrs: string[]) {
        for (let i = 0; i < primaryData.length; i++) {

            const record = _.find(nextLevelData, (x) => _.isMatch(x, _.pick(primaryData[i], attrs)));
            if (record) {
                primaryData[i] = _.assign(primaryData[i], record);
            }
        }
    }

    convertServerDataToUI(data: string[][] | number[][] | Date[][], attrs: string[],
        measures: string[], columnMap: { [key: string]: number }) {
        const uiData = [];

        _.each(data, (record) => {
            const uiRecord = {};
            _.each(attrs, (attr) => {
                uiRecord[attr] = record[columnMap[attr]];
            });
            _.each(measures, (measure) => {
                const measureRecord = _.clone(uiRecord);
                measureRecord['measure'] = measure;
                measureRecord['value'] = record[columnMap[measure]];
                uiData.push(measureRecord);
            });
        });

        console.log(uiData);

    }

}
