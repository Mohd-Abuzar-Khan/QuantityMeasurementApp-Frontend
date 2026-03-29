import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

/**
 * Application entry point.
 * Bootstraps the root {@link AppModule} in the browser platform.
 */
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error('Bootstrap error:', err));
