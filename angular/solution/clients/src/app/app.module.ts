import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from './data.service';

import { Glue42Ng } from "@glue42/ng";
import Glue, { Glue42 } from "@glue42/desktop";
import { GlueService } from './glue.service';

const config: Glue42.Config = {
  channels: true
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    HttpClientModule,
    Glue42Ng.forRoot({ desktop: { factory: Glue, config } }),
  ],
  providers: [DataService, GlueService],
  bootstrap: [AppComponent]
})
export class AppModule { }
