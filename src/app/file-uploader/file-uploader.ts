import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderService } from '../services/file-uploader.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

@Component({
  selector: 'app-file-uploader',
  imports: [CommonModule],
  templateUrl: './file-uploader.html',
  styleUrl: './file-uploader.scss'
})
export class FileUploaderComponent {
  private readonly selectedFile = signal<File | null>(null);
  private readonly uploadProgress = signal(0);
  private readonly uploadStatus = signal<UploadStatus>('idle');
  private readonly errorMessage = signal<string | null>(null);
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  readonly file = this.selectedFile.asReadonly();
  readonly progress = this.uploadProgress.asReadonly();
  readonly status = this.uploadStatus.asReadonly();
  readonly error = this.errorMessage.asReadonly();
  readonly isUploading = computed(() => this.status() === 'uploading');
  readonly isSuccess = computed(() => this.status() === 'success');
  readonly hasError = computed(() => this.status() === 'error');
  readonly fileSizeKB = computed(() => {
    const file = this.file();
    return file ? (file.size / 1024).toFixed(2) : null;
  });
  readonly canUpload = computed(() => !!this.file() && !this.isUploading());
  private fileUploaderService = inject(FileUploaderService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files?.length) {
      return;
    }

    const file = files[0];
    this.errorMessage.set(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage.set(`File type not allowed. Accepted types: ${ALLOWED_TYPES.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      this.errorMessage.set(`File size exceeds 10MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    this.selectedFile.set(file);
    this.uploadStatus.set('idle');
  }

  uploadFile(): void {
    const file = this.file();
    if (!file) {
      return;
    }

    this.uploadStatus.set('uploading');
    this.uploadProgress.set(0);
    this.errorMessage.set(null);

    // Simulate file upload with progress
    this.progressInterval = setInterval(() => {
      this.uploadProgress.update(progress => {
        const newProgress = progress + Math.random() * 30;
        if (newProgress >= 100) {
          this.completeUpload();
          return 100;
        }
        return newProgress;
      });
    }, 300);
  }

  private completeUpload(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.uploadStatus.set('success');
    this.fileUploaderService.upload('/file-uploader', this.file()!).subscribe({
      next: () => {
        this.uploadStatus.set('success');
        this.uploadProgress.set(100);
      },
      error: (error) => {
        this.uploadStatus.set('error');
        this.errorMessage.set('Failed to upload file.');
      }
    });
  }

  resetUpload(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.uploadStatus.set('idle');
    this.errorMessage.set(null);
  }
}
