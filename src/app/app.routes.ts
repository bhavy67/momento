import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('@features/home/home').then(m => m.Home),
    title: 'Momento',
  },
  {
    path: 'people',
    loadComponent: () =>
      import('@features/people/people-list/people-list').then(m => m.PeopleList),
    title: 'People · Momento',
  },
  {
    path: 'people/new',
    loadComponent: () =>
      import('@features/people/person-form/person-form').then(m => m.PersonForm),
    title: 'Add person · Momento',
  },
  {
    path: 'people/:id',
    loadComponent: () =>
      import('@features/people/person-detail/person-detail').then(m => m.PersonDetail),
    title: 'Person · Momento',
  },
  {
    path: 'people/:id/edit',
    loadComponent: () =>
      import('@features/people/person-form/person-form').then(m => m.PersonForm),
    title: 'Edit person · Momento',
  },
  {
    path: 'events',
    loadComponent: () =>
      import('@features/events/event-list/event-list').then(m => m.EventList),
    title: 'Events · Momento',
  },
  {
    path: 'events/new',
    loadComponent: () =>
      import('@features/events/event-form/event-form').then(m => m.EventForm),
    title: 'Add event · Momento',
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('@features/events/event-detail/event-detail').then(m => m.EventDetail),
    title: 'Event · Momento',
  },
  {
    path: 'events/:id/edit',
    loadComponent: () =>
      import('@features/events/event-form/event-form').then(m => m.EventForm),
    title: 'Edit event · Momento',
  },
  {
    path: 'gifts/new',
    loadComponent: () =>
      import('@features/gifts/gift-form/gift-form').then(m => m.GiftForm),
    title: 'Add gift · Momento',
  },
  {
    path: 'gifts/:id/edit',
    loadComponent: () =>
      import('@features/gifts/gift-form/gift-form').then(m => m.GiftForm),
    title: 'Edit gift · Momento',
  },
  {
    path: 'memories/new',
    loadComponent: () =>
      import('@features/memories/memory-form/memory-form').then(m => m.MemoryForm),
    title: 'Add memory · Momento',
  },
  {
    path: 'memories/:id',
    loadComponent: () =>
      import('@features/memories/memory-detail/memory-detail').then(m => m.MemoryDetail),
    title: 'Memory · Momento',
  },
  {
    path: 'memories/:id/edit',
    loadComponent: () =>
      import('@features/memories/memory-form/memory-form').then(m => m.MemoryForm),
    title: 'Edit memory · Momento',
  },
  {
    path: 'timeline',
    loadComponent: () =>
      import('@features/timeline/timeline').then(m => m.Timeline),
    title: 'Timeline · Momento',
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('@features/settings/settings').then(m => m.Settings),
    title: 'Settings · Momento',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
