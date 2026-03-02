import { useRef, useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import type { CsvRow } from '../types';
import { UploadCloud } from 'lucide-react';

interface CsvUploadProps {
  onData: (rows: CsvRow[]) => void;
}

export default function CsvUpload({ onData }: CsvUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parse error: ${results.errors[0]?.message || 'Unknown error'}`);
          return;
        }
        if (results.data.length === 0) {
          setError('CSV file is empty.');
          return;
        }
        onData(results.data);
      },
      error: (err: Error) => {
        setError(`Failed to read file: ${err.message}`);
      },
    });
  }, [onData]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="animate-fade-in w-full max-w-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Premium Request Viewer</h1>
        <p className="text-muted-foreground text-sm">
          Analyze your GitHub Copilot premium request usage data
        </p>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          card p-10 text-center cursor-pointer group
          ${
            dragging
              ? 'border-primary bg-accent dark:bg-primary/10 border-2 scale-[1.02]'
              : 'hover:border-primary/50 dark:hover:border-primary/40 hover:shadow-lg'
          }
          transition-all duration-200
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="mb-5 flex justify-center">
          <div className={`p-4 rounded-2xl transition-all duration-200
            ${dragging
              ? 'bg-primary/15 text-primary'
              : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            }`}>
            <UploadCloud className="h-10 w-10" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-lg font-semibold mb-1.5">Upload CSV Report</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Drag & drop your premium request usage CSV here, or{' '}
          <span className="text-primary font-medium">click to browse</span>
        </p>
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
