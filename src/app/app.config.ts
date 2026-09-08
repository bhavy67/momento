import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { db } from '@core/db/database.service';
import { DEV_PEOPLE, DEV_EVENTS, DEV_MEMORIES, DEV_GIFTS } from '@core/dev/dev-data';

function devDataInitializer() {
  return async () => {
    const count = await db.events.count();
    if (count > 0) return;
    await db.transaction('rw', [db.people, db.events, db.memories, db.gifts], async () => {
      await db.people.bulkAdd(DEV_PEOPLE);
      await db.events.bulkAdd(DEV_EVENTS);
      await db.memories.bulkAdd(DEV_MEMORIES);
      await db.gifts.bulkAdd(DEV_GIFTS);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: devDataInitializer,
      multi: true,
    },
  ],
};
