import { Injectable } from '@angular/core';
import { DataGeneratorService } from './data-generator.service';
import * as _ from 'lodash';

interface InMemoryModel {
    attributes: string[];
    data: object;
}

@Injectable()
export class InMemoryService {

    allLevelData: InMemoryModel[] = [];

    constructor(private dataGenerator: DataGeneratorService) {

    }

    getDataBasedOnFormat(groupedAttrs) {
        let data;
        const currentLevel = this.allLevelData.find(x => _.isEqual(x.attributes.sort(), Object.keys(groupedAttrs).sort()));
        if (currentLevel) {
            data = currentLevel.data;
        } else {
            data = this.dataGenerator.generateDataForMerge(groupedAttrs);
            const level: InMemoryModel = { attributes: Object.keys(groupedAttrs).sort(), data: data };
            this.allLevelData.push(level);
        }

        return data;

    }

}
