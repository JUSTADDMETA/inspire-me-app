"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('categories');
    
    if (error) {
      console.error('Fehler beim Abrufen der Kategorien:', error);
      setError('Fehler beim Abrufen der Kategorien');
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
    if (!selectedFile || selectedCategories.length === 0 || !title || !description || !externalLink) {
      setError('Bitte füllen Sie alle Felder aus und wählen Sie mindestens eine Kategorie aus.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const s3Client = new S3Client({
      forcePathStyle: true,
      region: 'eu-central-1',
      endpoint: 'https://ddbyrpmrexntgqszrays.supabase.co/storage/v1/s3',
      credentials: {
        accessKeyId: '43a884bdeab7b0e908b19e06015f1812',
    secretAccessKey: '5451064c12683eaadb32e7060b618b7b8e6a812646fcfe16663ebaa1df208a2a',
      }
    });

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    try {
      const command = new PutObjectCommand({
        Bucket: 'videos',
        Key: fileName,
        Body: selectedFile,
        ContentType: selectedFile.type,
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
        setError('Fehler beim Speichern der Metadaten');
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
      setError('Fehler beim Hochladen der Datei');
    } finally {
      setIsUploading(false);
      setUploadProgress(100); // Setzt den Upload-Fortschritt auf 100%
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
    setUploadProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col text-white bg-black relative w-full min-h-screen p-4">
      {notification && (
        <div className="absolute top-4 right-4 bg-green-800 text-white p-2 rounded">
          {notification}
        </div>
      )}
      {error && (
        <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded">
          {error}
        </div>
      )}
      <section className="w-full p-4 space-y-4">
        <div className="space-y-2">
          
          <input
            type="text"
            placeholder="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded bg-black text-white focus:ring-2 focus:ring-gray-200"
          />
          <textarea
            placeholder="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded bg-black text-white focus:ring-2 focus:ring-gray-200"
          />
          <input
            type="text"
            placeholder="Externe URL"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded bg-black text-white focus:ring-2 focus:ring-gray-200"
          />
          
          {/* Vorhandene Kategorien als Tags */}
          <div className="flex flex-wrap gap-2 pt-4 pb-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Neue Kategorie hinzufügen */}
          <div className="flex mt-2 pb-4">
            <input
              type="text"
              placeholder="Neue Kategorie"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-grow p-2 border border-gray-600 rounded bg-black text-white focus:ring-2 focus:ring-gray-500"
            />
            <button
              onClick={handleAddCategory}
              className="ml-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors duration-200"
            >
              Hinzufügen
            </button>
          </div>
        </div>

        {selectedFile ? (
          <div className="mt-2 text-center">
            <p className="text-white">{selectedFile.name} ausgewählt</p>
            <button onClick={removeSelectedFile} className="mt-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200">
              Entfernen
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 ${
              isDragActive ? 'border-blue-500 bg-black' : 'border-gray-600 bg-black'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Dateien hier ablegen ...</p>
            ) : (
              <p className="text-gray-400">Dateien hier hineinziehen oder klicken, um Dateien auszuwählen</p>
            )}
          </div>
        )}

        <div className="mt-2 text-center">
          <button
            onClick={handleUpload}
            className={`w-full mt-2 p-2 bg-white text-black border border-gray-600 rounded hover:bg-gray-200 transition-colors duration-200 ${isUploading || !selectedFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <div className="flex items-center justify-center">
                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                {`Hochladen... ${uploadProgress}%`}
              </div>
            ) : (
              'Hochladen'
            )}
          </button>
        </div>
      </section>
    </div>
  );
}