import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from './data.service';
import { StockDetailsComponent } from './stock-details/stock-details.component';
import { StocksComponent } from './stocks/stocks.component';

import { Glue42Ng } from '@glue42/ng';
import Glue, { Glue42 } from '@glue42/desktop';
import { GlueService } from './glue.service';

const config: Glue42.Config = {
  channels: true
};

@NgModule({
  declarations: [AppComponent, StockDetailsComponent, StocksComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    Glue42Ng.forRoot({ desktop: { factory: Glue, config } }),
  ],
  providers: [DataService, GlueService],
  bootstrap: [AppComponent],
})
export class AppModule {}
