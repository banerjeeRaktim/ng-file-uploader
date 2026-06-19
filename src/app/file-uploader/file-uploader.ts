import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploaderService } from '../services/file-uploader.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];

@Component({
  selector: 'app-file-uploader',
  imports: [CommonModule],
  templateUrl: './file-uploader.html',
  styleUrl: './file-uploader.scss'
})
export class FileUploaderComponent {
  private readonly selectedFile = signal<File | null>(null);
  private readonly errorMessage = signal<string | null>(null);
  private readonly successMessage = signal<string | null>(null);
  readonly file = this.selectedFile.asReadonly();
  readonly fileSizeKB = computed(() => {
    const file = this.file();
    return file ? (file.size / 1024).toFixed(2) : null;
  })
  readonly error = this.errorMessage.asReadonly();
  readonly success = this.successMessage.asReadonly();
  private fileUploaderService = inject(FileUploaderService);
  constructor() {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) {
      return;
    }
    const file = files[0];
    this.errorMessage.set(null);
    this.successMessage.set(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage.set(`File type not allowed. Accepted types: ${ALLOWED_TYPES.join(', ')}`);
      this.selectedFile.set(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.errorMessage.set(`File size exceeds 10MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      this.selectedFile.set(null);
      return;
    }
    this.selectedFile.set(file);
  }

  uploadFile(): void {
    this.fileUploaderService.generatePresignedUrl('/generate-upload-url', this.file()!).subscribe({
      next: () => {
        // Handle successful upload if needed
        this.successMessage.set('File uploaded successfully! Now Processing...');
      },
      error: (error) => {
        this.errorMessage.set('Failed to upload file.');
      }
    });
  }
}
