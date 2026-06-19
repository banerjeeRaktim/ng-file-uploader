import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FileUploaderService {
  private http = inject(HttpClient);
  private baseAPIUrl = environment.baseUrl;

  upload(url: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(this.baseAPIUrl + url, formData).pipe(
      catchError(this.handleError)
    );
  }

  generatePresignedUrl(url: string, file: File): Observable<any> {
    return this.http.post(this.baseAPIUrl + url, { file_name: file.name, content_type: file.type })
    .pipe(
      switchMap((response: any) => this.uploadToS3(response, file)),
      catchError(this.handleError)
    );
  }

  uploadToS3(presignedResponse: any, file: File): Observable<number | boolean> {
    const formData = new FormData();

    Object.keys(presignedResponse.fields).forEach(key => {
      formData.append(key, presignedResponse.fields[key]);
    });

    formData.append('file', file);
    return this.http.post(presignedResponse.url, formData, {
      observe: 'events',
      responseType: 'text'
    }).pipe(
      map((event: HttpEvent<string>) => {
        switch (event.type) {
          case HttpEventType.Response:
            if (event.status === 204) {
              return true;
            }
            return false;
          default:
            return 0;
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}

