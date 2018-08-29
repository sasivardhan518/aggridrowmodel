import { AgEnterpriseRowmodelComponent } from './ag-enterprise-rowmodel/ag-enterprise-rowmodel.component';

import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';
import { Format1Component } from './formats/format1/format1.component';
import { Format2Component } from './formats/format2/format2.component';
import { Format4Component } from './formats/format4/format4.component';
import { Format3Component } from './formats/format3/format3.component';



const APP_ROUTES: Routes = [
    { path: '', redirectTo: '/format1', pathMatch: 'full' },
    { path: 'format1', component: Format1Component },
    { path: 'format2', component: Format2Component },
    { path: 'format3', component: Format3Component },
    { path: 'format4', component: Format4Component },
    { path: 'format5', component: AgEnterpriseRowmodelComponent },
];

export const routing = RouterModule.forRoot(APP_ROUTES);
