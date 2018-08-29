import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-custom-cell-renderer',
  template: `{{params.value}}`,
  // templateUrl: './custom-cell-renderer.component.html',
  styleUrls: ['./custom-cell-renderer.component.css']
})
export class CustomCellRendererComponent implements ICellRendererAngularComp {

  public params: any;

  openGroups = ['1', '2', '3', 'Category2-1', 'Category1-3', 'Category3-0', 'Category3', 'Category2', 'Category1'];

  agInit(params: any): void {
    this.params = params;
    // if (params.node.group && !params.node.expanded) {
    if (params.node.group && !params.node.expanded && this.openGroups.indexOf(params.node.id) > -1) {
      setTimeout(() => {
        params.node.setExpanded(true);
      }, 100);

    }
    console.log(params);
  }

  refresh(): boolean {
    return true;
  }


}
