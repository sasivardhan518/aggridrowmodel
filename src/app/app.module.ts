import { FakeServer } from './formats/format4/fake-server';
import { DataMergeService } from './services/data-merge.service';
import { AgEnterpriseRowmodelComponent } from './ag-enterprise-rowmodel/ag-enterprise-rowmodel.component';
import { DataGeneratorService } from './services/data-generator.service';
import { Format2Component } from './formats/format2/format2.component';
import { Format1Component } from './formats/format1/format1.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AgGridModule } from 'ag-grid-angular/main';
import { Http, HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { Format3Component } from './formats/format3/format3.component';
import { Format4Component } from './formats/format4/format4.component';
import { routing } from './app.routing';
import { LicenseManager } from 'ag-grid-enterprise/main';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormatService } from './services/format.service';
import { AgGridCustomService } from './services/ag-grid-custom.service';
import { InMemoryService } from './services/in-memory.service';
import { ButtonsModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap';
import { CustomCellRendererComponent } from './formats/format4/custom-cell-renderer/custom-cell-renderer.component';
import { DataService } from './services/data.service';

LicenseManager.setLicenseKey('MTU0NTk1NTIwMDAwMA==99e8863bacaa061d761d1de465dc0562');


@NgModule({
  declarations: [
    AppComponent,
    Format1Component,
    Format2Component,
    Format3Component,
    Format4Component,
    AgEnterpriseRowmodelComponent,
    CustomCellRendererComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ButtonsModule.forRoot(),
    TabsModule.forRoot(),
    AgGridModule.withComponents([CustomCellRendererComponent]),
    routing
  ],
  providers: [DataGeneratorService, FormatService, AgGridCustomService, InMemoryService, DataMergeService, DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
