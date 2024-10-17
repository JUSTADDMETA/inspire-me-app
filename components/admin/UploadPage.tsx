"use client";

import React, { useCallback, useState, useEffect } from 'react';
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
  const [externalLink, setExternalLink] = useState('https://');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('categories');
    
    if (error) {
      console.error('Fehler beim Abrufen der Kategorien:', error);
    } else {
      const uniqueCategories = new Set<string>();
      data.forEach((video: any) => {
        const categories = JSON.parse(video.categories);
        categories.forEach((category: string) => uniqueCategories.add(category));
      });
      setAllCategories(Array.from(uniqueCategories));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress(0);
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile || selectedCategories.length === 0) return;

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

      await s3Client.send(command);

      const { error } = await supabase
        .from('videos')
        .insert([
          {
            file_name: fileName,
            title,
            description,
            external_link: externalLink,
            categories: JSON.stringify(selectedCategories)
          }
        ]);

      if (error) {
        console.error('Fehler beim Speichern der Metadaten:', error);
      } else {
        setTitle('');
        setDescription('');
        setExternalLink('https://');
        setSelectedCategories([]);
        setSelectedFile(null);
        fetchCategories(); // Aktualisiert die Kategorienliste
        setNotification('Video hochgeladen!');
        setTimeout(() => setNotification(null), 3000); // Entfernt die Benachrichtigung nach 3 Sekunden
      }
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  const handleAddCategory = () => {
    if (newCategory && !allCategories.includes(newCategory)) {
      setAllCategories((prev) => [...prev, newCategory]);
      setSelectedCategories((prev) => [...prev, newCategory]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center justify-center text-black relative w-full">
      {notification && (
        <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded">
          {notification}
        </div>
      )}
      <section className="w-full p-4 h-screen">
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
            placeholder="Externe URL"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded bg-gray-800 text-white"
          />
          
          {/* Vorhandene Kategorien als Tags */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full ${selectedCategories.includes(category) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Neue Kategorie hinzufügen */}
          <div className="flex mt-2">
            <input
              type="text"
              placeholder="Neue Kategorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded bg-gray-800 text-white"
            />
            <button
              onClick={handleAddCategory}
              className="ml-2 px-4 py-2 bg-black text-white rounded"
            >
              Hinzufügen
            </button>
          </div>
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
        
        {selectedFile && (
          <div className="mt-2 text-center">
            <p className="text-white">{selectedFile.name} ausgewählt</p>
            <button onClick={removeSelectedFile} className="mt-2 p-2 bg-red-500 text-white rounded">
              Entfernen
            </button>
          </div>
        )}

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