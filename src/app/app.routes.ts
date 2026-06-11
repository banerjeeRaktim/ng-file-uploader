import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'file-uploader',
    pathMatch: 'full'
  },
  {
    path: 'file-uploader',
    loadComponent: () =>
      import('./file-uploader/file-uploader').then(
        m => m.FileUploaderComponent
      )
  }
];
