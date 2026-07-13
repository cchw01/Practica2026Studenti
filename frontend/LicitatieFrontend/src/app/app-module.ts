import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { ReviewComponent} from './Models/review/review';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, ReviewComponent],
  providers: [provideBrowserGlobalErrorListeners(), provideAnimationsAsync()],
  bootstrap: [App],
})
export class AppModule {}
