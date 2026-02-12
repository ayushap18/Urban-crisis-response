import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useAccessibility } from '../context/AccessibilityContext';

interface Props {
  incidentId: string;
}

const EvidenceUpload: React.FC<Props> = ({ incidentId }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { announce } = useAccessibility();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    announce(`Uploading ${file.name}...`);

    storageService.uploadEvidence(
      file,
      incidentId,
      (prog, url) => {
        setProgress(prog);
        if (url) {
          setUploadedUrl(url);
          setUploading(false);
          announce("Upload complete.");
        }
      },
      (error) => {
        setUploading(false);
        announce("Upload failed.");
        alert("Upload failed");
      }
    );
  };

  return (
    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
           <Upload className="w-3 h-3" /> Incident Evidence
        </h4>
        {uploadedUrl && <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Saved to Cloud Storage</span>}
      </div>

      {!uploadedUrl ? (
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-600 transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
               <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            ) : (
               <Upload className="w-4 h-4" />
            )}
            {uploading ? `Uploading ${Math.round(progress)}%` : 'Upload Photos / Docs'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
           <div className="flex items-center gap-2">
             <FileText className="w-4 h-4 text-blue-400" />
             <span className="text-xs text-slate-200">Evidence File</span>
           </div>
           <a 
             href={uploadedUrl} 
             target="_blank" 
             rel="noreferrer" 
             className="text-xs text-blue-400 hover:underline"
           >
             View
           </a>
        </div>
      )}
      
      {uploading && (
        <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default EvidenceUpload;