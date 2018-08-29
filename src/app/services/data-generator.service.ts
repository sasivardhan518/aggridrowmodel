import { element } from 'protractor';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class DataGeneratorService {

    data = [];
    testRunData = [];

    constructor() { }

    getSimpleData(): Observable<any> {
        const testDataRecord = { marketCount: 20, productCount: 100, dayCount: 2, measureCount: 2 };
        this.generateMockData(testDataRecord.marketCount, testDataRecord.productCount, testDataRecord.dayCount,
            testDataRecord.measureCount);
        return new Observable(observer => observer.next(this.data));
    }

    getPivotData(): Observable<any> {
        /*testRunData.push({ marketCount: 10, productCount: 100, dayCount:10, measureCount:1 });
    testRunData.push({ marketCount: 100, productCount: 10, dayCount:5, measureCount:10 });
    testRunData.push({ marketCount: 500, productCount: 100, dayCount:2, measureCount:1 });
    testRunData.push({ marketCount: 100, productCount: 1000, dayCount:2, measureCount:5 });*/
        // testRunData.push({ marketCount: 500, productCount: 1000, dayCount:2, measureCount:5 });
        const testDataRecord = { marketCount: 5, productCount: 5, dayCount: 2, measureCount: 2 };
        this.generateMockData(testDataRecord.marketCount, testDataRecord.productCount, testDataRecord.dayCount,
            testDataRecord.measureCount);
        const resultData = [];
        const counter = 0;
        console.log(this.data);
        const startTime = Date.now();
        const rows = ['product', 'day', 'measure'];
        const cols = ['market'];
        let uniqueRowsObject = this.findUniqueRows(rows);
        const self = this;

        const pivotTime = Date.now();
        _.each(this.data, function (x) {
            const rowObject = uniqueRowsObject[self.getRowData(x, rows)];
            if (_.isEmpty(rowObject)) {
                _.each(rows, function (row) {
                    rowObject[row] = x[row];
                });
            }
            rowObject[self.getRowData(x, cols)] = x.value;
        });

        const pivotResultantTime = (Date.now() - pivotTime) / 1000;
        console.log('Pivoting Time in seconds :', pivotResultantTime);

        const uniqueCols = this.findUniqueCols(cols, [], {});


        uniqueRowsObject = _.values(uniqueRowsObject);
        const resultantTime = (Date.now() - startTime) / 1000;
        console.log('Transformation Time in seconds :', resultantTime);
        console.log(uniqueRowsObject, Object.keys(uniqueRowsObject).length);

        return new Observable(observer => observer.next({ data: uniqueRowsObject, cols: uniqueCols }));
    }

    getMergedData(serverData, parents: string[], rowDims, colDims, wholeData): Observable<any> {
        this.data = serverData;
        const resultData = [];
        const counter = 0;
        console.log(this.data);
        const startTime = Date.now();
        const rows = rowDims ? rowDims : ['product'];
        const cols = colDims ? colDims : ['market'];
        let uniqueRowsObject = this.findUniqueRows(rows);
        const self = this;

        const pivotTime = Date.now();
        _.each(this.data, function (x) {
            const rowObject = uniqueRowsObject[self.getRowData(x, rows)];
            // if (_.isEmpty(rowObject)) {
            _.each(rows, function (row) {
                rowObject[row] = x[row];
            });
            //  }
            if (cols.length > 0) {
                rowObject[(parents.length > 0 ? parents.join('_') + '_' : '') + self.getRowData(x, cols)] = x.value;
                // rowObject[self.getRowData(x, cols)] = x.value;
            } else {
                rowObject['value'] = x.value;
            }
        });

        const pivotResultantTime = (Date.now() - pivotTime) / 1000;
        console.log('Pivoting Time in seconds :', pivotResultantTime);

        const uniqueCols = this.findUniqueCols(cols, parents, wholeData);


        uniqueRowsObject = _.values(uniqueRowsObject);
        const resultantTime = (Date.now() - startTime) / 1000;
        console.log('Transformation Time in seconds :', resultantTime);
        console.log(uniqueRowsObject, Object.keys(uniqueRowsObject).length);

        return new Observable(observer => observer.next({ data: uniqueRowsObject, cols: uniqueCols }));
    }

    getRowData(obj, rows) {
        let str = '';
        rows.forEach(function (row, i) {
            if (str) {
                str += '_' + obj[row];
            } else {
                str += obj[row];
            }
        });
        return str;
    }

    findUniqueRows(rows) {
        const startTime = Date.now();
        const self = this;
        const uniqueRowsArray = _.uniq(_.map(this.data, function (x) {
            return self.getRowData(x, rows);
        }));

        const uniqueRowsObject = {};
        _.map(uniqueRowsArray, function (x) {
            uniqueRowsObject[x] = {};
        });

        const resultantTime = (Date.now() - startTime) / 1000;
        console.log('Unique Row combinations taken Time in seconds :', resultantTime);
        return uniqueRowsObject;
    }

    findUniqueCols(colAttributes, parents, serverData): string[][] {
        const startTime = Date.now();
        const self = this;
        const uniqueColsArray = [];

        // cols.forEach(elm => {
        //     const uniqueCols = _.uniq(_.map(this.data, function (x) {
        //         return (parents.length > 0 ? parents + '_' : '') + x[elm];
        //     }));

        //     uniqueColsArray.push(uniqueCols);
        // });

        colAttributes.forEach(attr => {
            const uniqueCols = [];
            const uniqueVals = _.uniq(_.map(this.data, function (x) {
                return x[attr];
            }));

            uniqueVals.forEach(val => {
                const uniqRec = _.find(serverData[attr], (x) => x[attr] === val);
                uniqueCols.push(uniqRec);
            });
            uniqueColsArray.push(uniqueCols);
        });

        const resultantTime = (Date.now() - startTime) / 1000;
        console.log('Unique Col combinations taken Time in seconds :', resultantTime);
        return uniqueColsArray;
    }

    generateMockData(marketCount, productCount, dayCount, measureCount) {
        this.data = [];
        for (let i = 0; i < productCount; i++) {
            for (let j = 0; j < marketCount; j++) {
                for (let k = 0; k < dayCount; k++) {
                    for (let l = 0; l < measureCount; l++) {
                        // tslint:disable-next-line:max-line-length
                        this.data.push({ 'product': 'P' + i, 'market': 'M' + j, 'day': 'day' + k, 'measure': 'measure' + l, 'value': Math.floor(Math.random() * 1000) });
                    }
                }
            }
        }


        console.log('Mock data generated for rows: ' + marketCount * productCount * dayCount * measureCount);
    }

    generateServerMockData(marketCount, productCount, dayCount, measureCount) {
        const data = [];
        for (let i = 0; i < productCount; i++) {
            for (let j = 0; j < marketCount; j++) {
                for (let k = 0; k < dayCount; k++) {
                    // tslint:disable-next-line:max-line-length
                    data.push({ 'product': 'P' + i, 'market': 'M' + j, 'day': 'day' + k, 'measure1': Math.floor(Math.random() * 1000), 'measure2': Math.floor(Math.random() * 1000), 'measure3': Math.floor(Math.random() * 1000) });
                }
            }
        }

        console.log('Mock data generated for rows: ' + marketCount * productCount * dayCount * measureCount);
        return data;
    }

    generateSearchData(dateCount, stringCount, numberCount) {
        const data = [];
        let bool = true;
        for (let i = 0; i < dateCount; i++) {
            for (let j = 0; j < stringCount; j++) {
                for (let l = 0; l < numberCount; l++) {
                    // tslint:disable-next-line:max-line-length
                    data.push({ 'date': new Date('200' + i), 'string': 'str ' + i + ' ' + j + l, 'boolean': bool = !bool, 'number': Math.floor(Math.random() * 1000) });
                }
            }
        }

        console.log('Mock data generated for rows: ' + dateCount * stringCount * numberCount);
        return data;
    }

    generateDataForMerge(attributes: { [index: string]: string }) {
        const result = {};
        _.forEach(attributes, (desc, name) => {
            result[name] = [];
            for (let i = 1; i < 5; i++) {
                const record = {};
                 record[name] = i;
                // record[name] = name + i;
                record[desc] = desc + i;
                result[name].push(record);
            }
        });

        result['data'] = this.cartesianProduct(Object.values(result), attributes);
        // this.saveFile('reportData.json', 'data:application/json', new Blob([JSON.stringify(result)], { type: '' }));
        console.log(result['data'].length);
        // return result;

        return result;
    }

    cartesianProduct(arr, attributes) {
        const partialResult = arr.reduce(function (a, b) {
            return a.map(function (x) {
                return b.map(function (y) {
                    return x.concat(y);
                });
            }).reduce(function (x, y) { return x.concat(y); }, []);
        }, [[]]);

        const result = [];
        for (let i = 0; i < partialResult.length; i++) {
            const record = { value: Math.floor(Math.random() * 1000) };
            for (let j = 0; j < partialResult[i].length; j++) {
                Object.assign(record, partialResult[i][j]);
            }
            _.each(attributes, (attr) => {
                delete record[attr];
            });

            result.push(record);
        }
        console.log('No. of records: ', result.length);
        return result;

    }

    saveFile(name, type, data) {
        // tslint:disable-next-line:curly
        if (data != null && navigator.msSaveBlob)
            return navigator.msSaveBlob(new Blob([data], { type: type }), name);

        const a = document.createElement('a');
        a.style.display = 'none';
        const url = window.URL.createObjectURL(new Blob([data], { type: type }));
        a.href = url;
        a.download = name;
        document.getElementsByTagName('body')[0].appendChild(a);
        a.click();
        setTimeout(function () {  // fixes firefox html removal bug
            window.URL.revokeObjectURL(url);
            a.remove();
        }, 500);
    }

    mergeMultipleDataSets(dataInfo, data, attributes) {
        const uniqueObj = this.generateUniqueValsForAttributes(dataInfo, attributes);
        const self = this;
        _.each(data, (record) => {
            _.each(attributes, (attr) => {
                _.assign(record, uniqueObj[attr][self.getRowData(record, [attr])]);
            });
        });
        return data;
    }

    generateUniqueValsForAttributes(dataInfo, attributes) {
        const result = {};
        attributes.forEach(attr => {
            const attrData = dataInfo[attr];
            result[attr] = this.createUniqueObj(attrData, [attr]);
        });
        return result;
    }

    createUniqueObj(data, props) {
        const self = this;
        const uniqueRowsObject = {};
        const uniqueRowsArray = _.map(data, function (x) {
            uniqueRowsObject[self.getRowData(x, props)] = x;
        });
        return uniqueRowsObject;
    }

    getDispalyOrderData(data: object[], attrOrder: any[], attrName) {
        let filterData = [];
        attrOrder.forEach(attrVal => {
            filterData = filterData.concat(data.filter((record) => attrVal === record[attrName]));
        });
        return filterData;
    }

    applyPageFilter(data: object[], attrName, value) {
        return data.filter((record) => value === record[attrName]);
    }

    getDispalyOrderData2(data: object[], attrOrder: string[], attrName) {
        data = data.filter((record) => attrOrder.indexOf(record[attrName]) > -1);
        const attrOrderHash = this.createAttrOrderHash(attrOrder);
        data = data.sort((a, b) => {
            return attrOrderHash[a[attrName]] - attrOrderHash[b[attrName]];
        });
        return data;
    }

    createAttrOrderHash(attrOrder) {
        const self = this;
        const uniqueRowsObject = {};
        const uniqueRowsArray = _.map(attrOrder, function (value, index) {
            uniqueRowsObject[value] = index + 1;
        });
        return uniqueRowsObject;
    }

    transformIntialResult(sourceData, measures) {
        sourceData = this.generateServerMockData(2, 2, 2, 2);
        console.log('Mock Data', sourceData);
        const resultData = [];
        const attribData = this.omitObjKeysFromArray(sourceData, measures);

        _.forEach(sourceData, function (dataObj, index) {
            _(measures).forEach(function (measure, measureIndex) {
                const atrbData = attribData[index];
                resultData.push(_.extend(_.clone(atrbData), {
                    'measure': measure, 'value': dataObj[measure]
                    // 'measure': measure['Name'], 'value': dataObj[measure['Name']]
                }));
            });
        });

        console.log('Intial Transformed Data:', resultData);
        return resultData;
    }

    omitObjKeysFromArray(data, keys) {
        const modifiedData = [];
        _(data).forEach(function (obj) {
            modifiedData.push(_.omit(obj, keys));
        });
        return modifiedData;
    }

    pickObjKeysFromArray(data, keys) {
        const modifiedData = [];
        _(data).forEach(function (obj) {
            modifiedData.push(_.pick(obj, keys));
        });
        return modifiedData;
    }



}


