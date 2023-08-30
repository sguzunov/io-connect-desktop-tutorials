import { Injectable } from '@angular/core';
import { Glue42Store } from '@glue42/ng';
import { GlueStatus, Client } from './types';

@Injectable()
export class GlueService {
  constructor(private readonly glueStore: Glue42Store) {
    const counter = sessionStorage.getItem('counter');
    if (!counter) {
      sessionStorage.setItem('counter', '0');
    }
  }

  public get glueStatus(): GlueStatus {
    return this.glueStore.getInitError() ? 'unavailable' : 'available';
  }

  public async sendSelectedClient(client: Client): Promise<void> {
    // const foundMethod = this.glueStore.getGlue().interop.methods().find((method) => method.name === "SelectClient");

    // if (foundMethod) {
    //     await this.glueStore.getGlue().interop.invoke(foundMethod, { client });
    // }

    await Promise.all([
      this.glueStore.getGlue().contexts.update('SelectedClient', client),
      this.glueStore.getGlue().channels.publish(client),
    ]);
  }

  public async openStockWindow(): Promise<void> {
    // Note that the app name is with lower case as in the app definition.
    const stockApp = this.glueStore.getGlue().appManager.application('stocks');
    if (stockApp != null) {
      await stockApp.start().catch(console.error);
    }
  }
}
