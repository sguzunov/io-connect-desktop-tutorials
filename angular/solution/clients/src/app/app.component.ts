import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { Client, GlueStatus } from './types';
import { GlueService } from './glue.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public clients: Client[] = [];
  public glueStatus: GlueStatus = 'disconnected';

  constructor(
    private readonly data: DataService,
    private readonly glueService: GlueService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;

    this.clients = await this.data.getClients();
  }

  public async handleClientClick(client: Client): Promise<void> {
    this.glueService.sendSelectedClient(client).catch(console.log);
  }

  public handleOpenStocksApp(): void {
    this.glueService.openStockWindow();
  }
}
