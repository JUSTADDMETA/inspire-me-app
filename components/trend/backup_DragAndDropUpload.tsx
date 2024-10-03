'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DragAndDropUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [videos, setVideos] = useState([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const s3Client = new S3Client({
      forcePathStyle: true,
      region: 'eu-central-1',
      endpoint: 'https://ddbyrpmrexntgqszrays.supabase.co/storage/v1/s3',
      credentials: {
        accessKeyId: '00a9a23344167d67a5a5f3fd9b2c69a1',
        secretAccessKey: '2b77d2e902a9584f44ebd984a2d1b30ae592d1462b76a13889e9c4a9e183e476',
      }
    });

    for (const file of acceptedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      try {
        const command = new PutObjectCommand({
          Bucket: 'videos',
          Key: fileName,
          Body: file,
        });

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
          // Füge das neue Video direkt zur Liste hinzu
          setVideos(prevVideos => [
            ...prevVideos,
            {
              file_name: fileName,
              title,
              description,
              categories: categories.split(','),
              videoUrl: `https://ddbyrpmrexntgqszrays.supabase.co/storage/v1/object/public/videos/${fileName}`
            }
          ]);
        }
      } catch (error) {
        console.error('Fehler beim Hochladen der Datei:', error);
      }
    }
  }, [title, description, categories]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*');

    if (error) {
      console.error('Fehler beim Abrufen der Videos:', error);
    } else {
      const parsedData = data.map(video => ({
        ...video,
        categories: JSON.parse(video.categories),
        videoUrl: `https://ddbyrpmrexntgqszrays.supabase.co/storage/v1/object/public/videos/${video.file_name}`
      }));
      setVideos(parsedData);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="mt-8">
      <input type="text" placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Beschreibung" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="text" placeholder="Kategorien (kommagetrennt)" value={categories} onChange={(e) => setCategories(e.target.value)} />

      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Dateien hier ablegen ...</p>
        ) : (
          <p>Dateien hier hineinziehen oder klicken, um Dateien auszuwählen</p>
        )}
      </div>
      
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Hochgeladene Dateien:</h3>
        <ul className="list-disc pl-5">
          {videos.map((video, index) => (
            <li key={index}>
              <strong>{video.title}</strong> - {video.description} <br />
              Kategorien: {video.categories.join(', ')} <br />
              <video src={video.videoUrl} controls />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}