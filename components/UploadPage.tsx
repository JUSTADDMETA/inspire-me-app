"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress(0);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    const s3Client = new S3Client({
      forcePathStyle: true,
      region: 'eu-central-1',
      endpoint: 'https://ddbyrpmrexntgqszrays.supabase.co/storage/v1/s3',
      credentials: {
        accessKeyId: '00a9a23344167d67a5a5f3fd9b2c69a1',
        secretAccessKey: '2b77d2e902a9584f44ebd984a2d1b30ae592d1462b76a13889e9c4a9e183e476',
      }
    });

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    try {
      const command = new PutObjectCommand({
        Bucket: 'videos',
        Key: fileName,
        Body: selectedFile,
      });

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      await s3Client.send(command);

      const { error } = await supabase
        .from('videos')
        .insert([
          {
            file_name: fileName,
            title,
            description,
            categories: JSON.stringify(categories.split(','))
          }
        ]);

      if (error) {
        console.error('Fehler beim Speichern der Metadaten:', error);
      } else {
        setTitle('');
        setDescription('');
        setCategories('');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center justify-center text-black">
      <section className="w-full max-w-md p-4 border-b-2 border-gray-300 border rounded">
        <h2 className="text-lg font-bold mb-4">Video Upload</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-gray-800 text-white"
          />
          <textarea
            placeholder="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-gray-800 text-white"
          />
          <input
            type="text"
            placeholder="Kategorien (kommagetrennt)"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-gray-800 text-white"
          />
        </div>

        <div
          {...getRootProps()}
          className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${
            isDragActive ? 'border-black bg-gray-100' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Dateien hier ablegen ...</p>
          ) : (
            <p className="text-white">Dateien hier hineinziehen oder klicken, um Dateien auszuwählen</p>
          )}
        </div>
        
        <div className="mt-2 text-center">
          <button
            onClick={handleUpload}
            className={`w-full mt-2 p-2 bg-black text-white border border-gray-200 rounded ${isUploading || !selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isUploading || !selectedFile}
          >
            Hochladen
          </button>
          {isUploading && (
            <div className="mt-2">
              <progress value={uploadProgress} max="100" className="w-full"></progress>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}