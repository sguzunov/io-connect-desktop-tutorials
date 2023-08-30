import { Component, OnInit } from '@angular/core';
import { Stock, GlueStatus } from '../types';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { GlueService } from '../glue.service';

@Component({
  templateUrl: './stocks.component.html'
})
export class StocksComponent implements OnInit {
  private allStocks: Stock[] = [];
  public stocks: Stock[] = [];
  public glueStatus: GlueStatus = "disconnected";

  constructor(private readonly data: DataService, private readonly router: Router, private readonly glueService: GlueService) { }

  public async ngOnInit(): Promise<void> {
    this.allStocks = await this.data.getStocks(); 
    this.stocks = this.allStocks;

    this.data.onStockPrices()
      .subscribe((update) => {
        this.stocks.forEach((stock) => {
          const matchingStock = update.stocks.find((stockUpdate) => stockUpdate.RIC === stock.RIC);
          stock.Ask = matchingStock.Ask;
          stock.Bid = matchingStock.Bid;
        })
      });
  }

  public handleStockClick(stock: Stock): void {
    this.data.selectedStock = stock;
    this.router.navigate(['/details']);
  }
}
