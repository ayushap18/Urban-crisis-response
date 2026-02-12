import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { analyticsService } from './analyticsService';

export interface UploadProgressCallback {
  (progress: number, downloadUrl?: string): void;
}

export const storageService = {
  uploadEvidence: (
    file: File, 
    incidentId: string, 
    onProgress: UploadProgressCallback,
    onError: (error: Error) => void
  ) => {
    if (!storage) {
        const error = new Error("Storage not configured. Check your .env file.");
        console.warn(error.message);
        onError(error);
        return;
    }

    // Create a unique path: incidents/{incidentId}/{timestamp}_{filename}
    const storagePath = `incidents/${incidentId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error("Upload failed", error);
        onError(error);
      },
      async () => {
        // Upload complete
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress(100, downloadURL);
        
        analyticsService.logEvent('evidence_uploaded', {
          incident_id: incidentId,
          file_type: file.type,
          file_size: file.size
        });
      }
    );
    
    return uploadTask; // Allow cancelling if needed
  }
};