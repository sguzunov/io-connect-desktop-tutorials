## Overview

This guide will show you how to use [**io.Connect Desktop**](https://interop.io/products/io-connect/) (former Glue42 Enterprise) in an Angular app using the [`@glue42/ng`](https://www.npmjs.com/package/@glue42/ng) library.

## Introduction

You are a part of the IT department of a big multi-national bank and you have been tasked to create an app which will be used by the Asset Management department of the bank. The project will consist of two apps:
- **Clients** - displays a full list of clients and details about them;
- **Stocks** - displays a full list of stocks with prices. When the user clicks on a stock, details about the selected stock should be displayed.

All apps are being developed by different teams within the organizations and therefore are being hosted at different origins.

As an end result, the users want to be able to run apps in separate windows in order to take advantage of their multi-monitor setups. Also, they want the apps, even though in separate windows, to be able to communicate with each other. For example, when a client is selected in the **Clients** app, the **Stocks** app should display only the stocks of the selected client.

## Prerequisites

This tutorial assumes that you are familiar with Angular 2+ and the concepts of JavaScript and asynchronous programming.

It is also recommended to have the [**io.Connect Desktop**](https://docs.glue42.com/getting-started/what-is-glue42/general-overview/index.html) documentation available for reference.

## Tutorial Structure

In this repo you will find a `/tutorials` directory with the following structure:

```cmd
/tutorials
    /angular
        /solution
        /start
    /guides
        /03_angular
    /rest-server
```

| Directory | Description |
|-----------|-------------|
| `/guides` | Contains the text files of the tutorials. |
| `/angular` | Contain the starting files for the tutorials and also a full solution for each of them. |
| `/rest-server` | A simple server used in the tutorials to serve the necessary `JSON` data. |

## 1. Initial Setup

Clone this repo to get the tutorial files.

### 1.1. Start Files

Next, go to the `/tutorials/angular/start` directory which contains the starting files for the project. The tutorial examples assume that you will be working in the `/start` directory, but, of course, you can move the files and work from another directory.

The `/start` directory contains the following:

| Directory | Description |
|-----------|-------------|
| `/clients` | This is the **Clients** app. This is a standalone Angular app and is scaffolded with the Angular CLI without any custom settings. |
| `/stocks` | the **Stocks** app. Also a standalone Angular app scaffolded with the Angular CLI with one one custom setting - the `port` property in the `angular.json` file is set to 4100, because the two apps cannot run on the same port simultaneously. |

Go to the directories of both apps (`start/clients` and `start/stocks`), open a command prompt and run:

```cmd
npm install

npm start
```

This will install all necessary dependencies and will run apps as follows:

| URL | Application |
|-----|-------------|
| `http://localhost:4200/` | **Clients** |
| `http://localhost:4100/` | **Stocks** |

### 1.2. Solution Files

Before you continue, take a look at the solution files. You are free to use the solution as you like - you can check after each section to see how it solves the problem, or you can use it as a reference point in case you get stuck.

Go to the `/rest-server` directory and start the REST Server (as described in the [REST Server](#setup-rest_server) chapter).

Install all dependencies in `angular/solution/clients` and `angular/solution/stocks` and start both apps by running the following commands:

```cmd
npm install

npm start
```

This will install all necessary dependencies and will run apps as follows:

| URL | Application |
|-----|-------------|
| `http://localhost:4200/` | **Clients** |
| `http://localhost:4100/` | **Stocks** |

### 1.3. REST Server

Before starting with the project, go to the `/tutorials/rest-server` directory and start the REST server that will host the necessary data for the apps:

```cmd
npm install

npm start
```

This will launch the server at port 8080.

## 2. Project Setup

Setting up an app is just as simple as installing a new `npm` package and calling a function. Go to the **Clients** and **Stocks** apps base directory and run:

```cmd
npm install --save @glue42/ng
```

The `@glue42/ng` library comes with the [`@glue42/desktop`](https://www.npmjs.com/package/@glue42/desktop) package, so you don't have to add any additional dependencies.

Next, import the `Glue42Ng` module and the `Glue` factory function in the **Clients**'s  and **Stocks**'s root `AppModule`. Call the `forRoot()` method of `Glue42Ng` and define a config object with a single property `desktop` and pass the `Glue` factory function:

```javascript
...
import { Glue42Ng } from "@glue42/ng";
import Glue from "@glue42/desktop";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        NgbModule,
        HttpClientModule,
        Glue42Ng.forRoot({ desktop: { factory: Glue } }),
    ],
    providers: [DataService, GlueService],
    bootstrap: [AppComponent]
})

export class AppModule { }
```

Note that you should import `Glue42Ng` only once in your root `AppModule`.

This is everything you need to do to initialize the Glue42 library in your Angular apps. Now you have fully functional apps which can connect and communicate with each other.

When the apps are accessed, the Glue42 library will be initialized on app bootstrap. In order to gain access to the Glue42 API or to any errors during the initialization, you have to use the `Glue42Store` service. You could inject the `Glue42Store` directly in your components, but a better practice is to define a service that will inject the `Glue42Store`, perform all specific operations you need and expose only the functionality needed by your components.

In both apps there is an empty `glue.service.ts` which is already provided in the respective root modules and injected in the components. There you will inject the `Glue42Store` and expose the functionality you need.

The Glue42 library has been initialized, so now you will provide a visual indicator for the state of Glue42 in case of an initialization error. Go to the `glue.service.ts` file of the **Clients** and **Stocks** apps and define a public getter called `glueStatus` that should return either `"available"` or `"unavailable"` depending on whether there have been any initialization errors:

```javascript
    constructor(private readonly glueStore: Glue42Store) {
        // Setting the Glue42 API to the window object makes it easier to launch the app, open the console and experiment.
        (window as any).glue = this.glueStore.getGlue();
    }

    public get glueStatus(): GlueStatus {
        return this.glueStore.getInitError() ? "unavailable" : "available";
    }
```

Now, go to the `app.component.ts` file of the **Clients** app and the `stocks.component.ts` and `stock-details.component.ts` files of the **Stocks** app. In `ngOnInit()` assign `this.glueService.glueStatus` to the `this.glueStatus` property:

```javascript
constructor(
    ...
    private readonly glueService: GlueService
) { }

public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;
    ...
}
```

If everything is correct, when you open the apps, you should see in the top left corner "Glue42 is available".

Next, you need to create app definitions and add them to the applications configuration folder. You must create a JSON file with app configuration. 
Place this file in the [App Store] (https://docs.interop.io/desktop/capabilities/app-management/overview/index.html#app_stores) (usually `%LocalAppData%\interop.io\io.Connect Desktop\Desktop\config\apps` folder) of your io.Connect Desktop.

You can copy the app definitions for this tutorial from below:

```json
[
    {
        "type": "window",
        "name": "clients",
        "title": "Clients",
        "details": {
            "url": "http://localhost:4200/",
            "allowChannels": true
        }
    },
    {
        "type": "window",
        "name": "stocks",
        "title": "Stocks",
        "details": {
            "url": "http://localhost:4100/",
            "allowChannels": true
        }
    }
]
```

## 3. App/Window Management

The goal of this chapter is to start building the user flow of the entire project. The end users will open the **Clients** app and will be able to start the **Stocks** app from the "Stocks" button in it. Clicking on a stock in the **Stocks** app will open the **Stock Details** app.

Currently, the only way for the user to open the **Stocks** app is to manually enter its URL in the address bar. This, however, prevents the app from connecting to the Glue42 environment. Also, the **Stock Details** app is currently a separate view of the **Stocks** app. The end users have multiple monitors and would like to take advantage of that - they want clicking on a stock to open a new window with the respective app. The new window for the selected stock must also have specific dimensions and position. To achieve all this, you will use the [App Management API](https://docs.glue42.com/glue42-concepts/application-management/javascript/index.html) and [Window Management API](https://docs.glue42.com/glue42-concepts/windows/window-management/javascript/index.html).

### 3.1. Starting an App at Runtime

Instruct the **Clients** app to start the **Stocks** app in a new window when the user clicks on the "Stocks" button. Go to the `GlueService` of the **Clients** app and define a new method `openStockWindow()` which returns a `Promise<void>`. Use the `glue.appManager.application()` to find the **Stocks** app and then use the `app.start()` method to start the app:

```javascript
public async openStockWindow(): Promise<void> {
    // Note that the app name is with lower case as in the app definition.
    const stockApp = this.glueStore.getGlue().appManager.application('stocks');
    if (stockApp != null) {
      await stockApp.start().catch(console.error);
    }
}
```

To complete the user flow, instruct the **Stocks** app to open a new window each time the user clicks on a stock. Glue42 Window *must have a unique name*. To avoid errors resulting from attempting to open Glue42 Windows with conflicting names, check whether the clicked stock has already been opened in a new window.

Go to the `GlueService` of the **Stocks** app and define a new method `openStockDetails()` which accepts a `stock` object as a parameter. Use the `glue.windows.open()` method to open a new Glue42 Window at runtime by providing a unique name and a URL:

```javascript
public async openStockDetails(stock: Stock): Promise<void> {
    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4100/details/";

    // Check whether the clicked stock has already been opened in a new window.
    const stockWindowExists = this.glueStore.getGlue().windows.list().find(w => w.name === windowName);

    if (!stockWindowExists) {
        // Open a new window by providing a name and URL. The name must be unique.
        await this.glueStore.getGlue().windows.open(windowName, URL);
    }
}
```

Next, go to `stocks.component.ts` and call `openStockDetails()` from the `handleStockClick()` method:

```javascript
public handleStockClick(stock: Stock): void {
    this.glueService.openStockDetails(stock).catch(console.error);
}
```

### 4.2. Window Settings

Next, define settings for the new window position (`top` and `left`) and size (`width` and `height`):

```javascript
public async openStockDetails(stock: Stock): Promise<void> {
    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4100/details/";
    // Optional object with settings for the new window.
    const windowSettings: Glue42.Windows.Settings = {
        width: 600,
        height: 600
    };

    const stockWindowExists = this.glueStore.getGlue().windows.list().find(w => w.name === windowName);

    if (!stockWindowExists) {
        await this.glueStore.getGlue().windows.open(windowName, URL, windowSettings);
    }
}
```

### 4.3. Window Context

Every Glue42 Window has its own `context` property (its value can be any object) which can be defined when opening the window and can be updated later. You will pass the stock selected from the **Stocks** app as a window context for the new **Stock Details** window:

```javascript
public async openStockDetails(stock: Stock): Promise<void> {
    const windowName = `${stock.BPOD} Details`;
    const URL = "http://localhost:4100/details/";
    // Optional object with settings for the new window.
    const windowSettings: Glue42.Windows.Settings = {
        width: 600,
        height: 600,
        // Pass the selected stock as a context for the new window.
        context: stock
    };

    const stockWindowExists = this.glueStore.getGlue().windows.list().find(w => w.name === windowName);

    if (!stockWindowExists) {
        await this.glueStore.getGlue().windows.open(windowName, URL, windowSettings);
    }
}
```

Next, the **Stock Details** app needs to get this context. Since this is actually a window of the **Stocks** Angular app, you will simply extend the `GlueService` with a `getMyContext()` method, which will return the context of the current window:

```javascript
public async getMyContext() {
    // Getting the context of the current window.
    return await this.glueStore.getGlue().windows.my().getContext();
}
```

Finally, go to `stock-details.component.ts` and extend the `this.stock` assignment to take either the selected stock in the data service (if set) or get it from the window context:

```javascript
public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;
    this.stock = this.dataService.selectedStock;

    if (this.glueStatus === "available") {
        this.stock = await this.glueService.getMyContext();
    }
}
```

Now, when you click on a stock, the new window will open with the specified position and size and will display the details of the selected stock.

## 4. Interop

In this section you will use some of the functionalities provided by the [Interop API](https://docs.glue42.com/glue42-concepts/data-sharing-between-apps/interop/overview/index.html).

### 4.1. Registering Interop Methods and Streams

When a user clicks on a client, the **Stocks** app should show only the stocks owned by this client. You can achieve this by registering an Interop method in the **Stocks** app which, when invoked, will receive the portfolio of the selected client and re-render the stocks table. Also, the **Stocks** app will create an Interop stream to which it will push the new stock prices. Subscribers to the stream will get notified when new prices have been generated.

Go to the `GlueService` file of the **Stocks** app and define a method that will register an Interop method called `SelectClient`. The method will expect to receive an object with a property `client` which will contain the entire object of the selected client:

```javascript
...
constructor(private readonly glueStore: Glue42Store, private _zone: NgZone) { }
...
public async registerClientSelect() {
    const methodName = "SelectClient";
    const handler = (args) => {
        this._zone.run(() => this.selectedClientSource.next(args.client))
    };
    // Registering an Interop method by providing a name and callback
    // that will be called when the method is invoked.
    await this.glueStore.getGlue().interop.register(methodName, handler);
}
```

*Note that the `next` invocation is wrapped in `NgZone.run`, because the custom event is executed outside the Angular Zone and therefore won't trigger change detection, unless explicitly ran inside the zone.*

Next, you need to create an Interop stream called `LivePrices`, inject the `DataService`, subscribe to new price updates and push to the stream:

```javascript
...
constructor(private readonly glueStore: Glue42Store, private _zone: NgZone, private readonly dataService: DataService) { }
...
public async createPriceStream() {
    const streamName = "LivePrices";
    // Creating an Interop stream.
    const priceStream = await this.glueStore.getGlue().interop.createStream(streamName);
    // Pushing data to the stream.
    this.dataService.onStockPrices().subscribe(priceUpdate => priceStream.push(priceUpdate));
}
```

Now, go to `stocks.component.ts`, call these methods from the `GlueService` and subscribe to the `onClientSelected()` `Observable`. The best place to do that is in the `ngOnInit()` method where you will check if Glue42 is ready and only then attempt to register the Interop method and stream:

```javascript
public async ngOnInit(): Promise<void> {

    this.glueStatus = this.glueService.glueStatus;

    // Checking the Glue42 status.
    if (this.glueService.glueStatus === "available") {
        // Registering the Interop method.
        this.glueService.registerClientSelect().catch(console.log);
        // Creating the Interop stream.
        this.glueService.createPriceStream().catch(console.log);
        // Subscribing for notifications when the selected client changes.
        this.glueService.onClientSelected()
            .subscribe((client) => {
                this.stocks = this.allStocks.filter(stock => client.portfolio.includes(stock.RIC));
            });
    }
    ...
}
```

Note that in a real production app you may need to unregister the Interop method and close the Interop stream in the `ngOnDestroy()` hook. This depends on your business case, but here it is safe to leave it as it is. Also, note that the `registerClientSelect()` and `createPriceStream()` invocations aren't awaited, because in this particular case it isn't important when they will resolve, but this may be different in a real production app.

You also don't need to wrap the callback which pushes updates to the stream, because internally the `DataService` uses `setInterval()` that by default triggers a change detection.

### 4.2. Method Discovery

Go to the **Clients** app and define a `sendSelectedClient()` method in the `GlueService` that first will check whether the `SelectClient` method has been registered (i.e., whether the **Stocks** app is running):

```javascript
public sendSelectedClient(client: Client): void {
    // Finding an Interop method by name.
    const interopMethod = this.glueStore.getGlue().interop.methods().find(method => method.name === "SelectClient");
}
```

### 4.3. Method Invocation

Now, you have to invoke `SelectClient` if it exists. Extend the `sendSelectedClient()` method:

```javascript
// Now the method is `async` because `glue.interop.invoke()` returns a `Promise`.
public async sendSelectedClient(client: Client): Promise<void> {
    const interopMethod = this.glueStore.getGlue().interop.methods().find(method => method.name === "SelectClient");

    if (interopMethod) {
        const args = { client };
        // Invoking an Interop method by name and providing arguments for the invocation.
        await this.glueStore.getGlue().interop.invoke(foundMethod, args);
    }
}
```

Go to the `app.component.ts` of the **Clients** app and define a `handleClientClick()` method from which you will invoke `sendSelectedClient()`:

```javascript
public handleClientClick(client: Client): void {
    this.glueService.sendSelectedClient(client);
}
```

Now when you click on a client in the **Clients** app, the **Stocks** app should display only the stocks that are in the portfolio of the selected client.

### 4.4. Stream Subscription

Now, you need to subscribe the **Stock Details** app to the previously created Interop stream so that it can receive real time price updates about the selected stock.

First, go to the `GlueService` of the **Stocks** app and define a method that will receive the selected stock as an argument and will subscribe to the stream:

```javascript
public async subscribeToLivePrices(stock: Stock): Promise<Glue42.Interop.Subscription> {

    // Interop streams are special Interop methods that have a property `supportsStreaming: true`.
    // You can filter Interop methods by name and that property to find the stream you are interested in.
    const stream = this.glueStore.getGlue().interop.methods().find(method => method.name === "LivePrices" && method.supportsStreaming);

    if (!stream) {
        return;
    }

    // Creating a stream subscription.
    const subscription = await this.glueStore.getGlue().interop.subscribe(stream);

    // Use the `onData()` method of the `subscription` object to define
    // a handler for the received stream data.
    subscription.onData((streamData) => {
        const newPrices = streamData.data.stocks;
        // Extract only the stock you are interested in.
        const selectedStockPrice = newPrices.find(prices => prices.RIC === stock.RIC);

        this._zone.run(() => this.priceUpdateSource.next({
            Ask: Number(selectedStockPrice.Ask),
            Bid: Number(selectedStockPrice.Bid)
        }));

    });

    return subscription;
}
```

Go to the `stock-details.component.ts`, check if Glue42 is available and only then subscribe to the `LivePrices` Interop stream. Uncomment the private `glueSubscription` variable. Subscribe to the `onPriceUpdate()` `Observable` provided by the `GlueService` and handle the new prices. Define a `ngOnDestroy()` method where you have to close the subscription if it exists:

```javascript
public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;
    this.stock = this.dataService.selectedStock;

    if (this.glueStatus === "available") {
        // Subscribing to the stream.
        this.glueSubscription = await this.glueService.subscribeToLivePrices(this.stock);
    }

    this.glueService.onPriceUpdate().subscribe((newPrices) => {
        this.stock.Ask = newPrices.Ask;
        this.stock.Bid = newPrices.Bid;
    });
}

public ngOnDestroy(): void {
    if (this.glueSubscription) {
        // Closing the stream subscription.
        this.glueSubscription.close();
    }
}
```

Now the **Stocks Details** should display live price updates for the selected stock.

## 5. Shared Contexts

The next request of the users is to be able to see in the **Stock Details** app whether the selected client has the selected stock in their portfolio. This time, you will use the [Shared Contexts API](https://docs.glue42.com/glue42-concepts/data-sharing-between-apps/shared-contexts/overview/index.html) to connect the **Clients**, **Stocks** and **Stock Details** apps.

### 5.1. Updating a Context

First, go to the **Clients** app and extend the `sendSelectedClient()` method in the `GlueService`. Comment out or delete the existing logic that uses the Interop API, and, instead, update the shared context object called `SelectedClient` (if the context doesn't exist, it will be created first) with the `client` object:

```javascript
public async sendSelectedClient(client: Client): Promise<void> {
    // Updating a shared context by name with a provided value (any object).
    await this.glueStore.getGlue().contexts.update("SelectedClient", client);
}
```

### 5.2. Subscribing for Context Updates

Now, go to the **Stocks** app and define a method `subscribeToSharedContext()` in the `GlueService`. Subscribe to the shared context called `SelectedClient`:

```javascript
public async subscribeToSharedContext() {
    // Subscribing for updates to a shared context by specifying
    // context name and providing a handler for the updates.
    this.glueStore.getGlue().contexts.subscribe("SelectedClient", (client) => {
        this._zone.run(() => this.selectedClientSource.next(client));
    });
}
```

Next, go to `stocks.component.ts` and comment out or delete the call to the `registerClientSelect()` method that uses the Interop API. Call `subscribeToSharedContext()` instead:

```javascript
public async ngOnInit(): Promise<void> {

    this.glueStatus = this.glueService.glueStatus;

    if (this.glueService.glueStatus === "available") {
        ...
        this.glueService.subscribeToSharedContext().catch(console.log);
        ...
    }
    ...
}
```

Now **Clients** and **Stocks** communicate via Shared Contexts.

Finally, go to `stock-details.component.ts`, call the same `subscribeToSharedContext()` function and subscribe to `onClientSelected()`. When a new client has been selected, you need to check if that client has the current stock in their portfolio and set the `this.clientMessage` property to the appropriate value:

```javascript
public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;
    ...

    if (this.glueStatus === "available") {
        ...
        this.glueService.subscribeToSharedContext().catch(console.log);
    }

    this.glueService.onClientSelected()
        .subscribe((client) => {
            this.clientMessage = client.portfolio.includes(this.stock.RIC) ?
                `${client.name} has this stock in their portfolio` :
                `${client.name} does NOT have this stock in their portfolio`;
        });
    ...
}
```

Now all three apps are connected through the same shared context object and a single action in one of them can trigger changes in all.

## 6. Channels

The latest requirement from the users is to be able work with multiple clients at a time by having multiple instances of the **Stocks** app show the portfolios of different clients. Currently, no matter how many instances of the **Stocks** app are running, they are all listening for updates to the same context and therefore all show information about the same selected client. Here, you will use the [Channels API](https://docs.glue42.com/glue42-concepts/data-sharing-between-apps/channels/overview/index.html) to allow each instance of the **Stocks** app to subscribe for updates to the context of a selected channel. The different channels are color coded and the user will be able to select a channel from the Channel Selector UI. The **Clients** app will update the context of the currently selected channel when the user clicks on a client.

### 6.1. Channels Configuration

The Channels API is disabled by default. To enable it, set the channels property of the configuration object to true when initializing the Glue42 library

```javascript
// in app.module.ts
import { Glue42 }, Glue from "@glue42/desktop";

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
    ChannelSelectModule
  ],
  providers: [DataService, GlueService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 6.2. Publishing and Subscribing

The **Clients** app will publish to the current channel. All client selection logic is handled by the `handleClientClick()` method of the `app.component.ts` which in turn delegates it to the `sendSelectedClient()` of the `glue.service.ts`. All you have to do, is extend that method to also update the current channel context:

```javascript
public async sendSelectedClient(client: Client): Promise<void> {
    await Promise.all([
        this.glueStore.getGlue().contexts.update("SelectedClient", client),
        // Publishing data to the current channel.s
        this.glueStore.getGlue().channels.publish(client)
    ]);
}
```

You have to leave the logic for updating the shared context object, because the **Stocks Details** functionality has to remain the same.

Next, the **Stocks** app has to subscribe for updates to the current channel. Go to the `glue.service.ts` of the **Stocks** app and define a method for subscribing to the channel context:

```javascript
public subscribeToChannelContext() {
    // Subscribing for updates to the current channel and
    // providing a handler for the updates.
    this.glueStore.getGlue().channels.subscribe((client) => {
        this._zone.run(() => this.selectedClientSource.next(client));
    });
}
```

Go to the `stocks.component.ts` and modify `ngOnInit()` by calling `subscribeToChannelContext()` and removing the call to `subscribeToSharedContext()`:

```javascript
public async ngOnInit(): Promise<void> {
    this.glueStatus = this.glueService.glueStatus;

    if (this.glueService.glueStatus === "available") {
        ...
        this.glueService.subscribeToChannelContext();
        this.glueService.onClientSelected()
            .subscribe((client) => {
                if (client.portfolio) {
                    this.stocks = this.allStocks.filter((stock) => client.portfolio.includes(stock.RIC));
                    return;
                }
                this.stocks = this.allStocks;
            });
        ...
    }
    ...
}
```

Note that you have to check for the presence of a client portfolio, because when the app joins a new channel, it will always receive initial channel context. And if nothing has been published to that specific channel, the context will be an empty object. In this case, the app has to display all stocks.

Now, when you can open several instances of the **Stocks** app and keep them on different channels. The **Clients** app will update the context of its current channel when a client has been selected, and only the **Stocks** instance that is on the same color channel should update.

Congratulations! You have completed te tutorial.
