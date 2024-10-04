"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Video = {
  id: number;
  file_name: string;
  title: string;
  description: string;
  categories: string[];
  videoUrl: string;
  external_link: string;
};

export default function AdminView() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showConfirm, setShowConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

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
      const parsedData = data.map((video: any) => ({
        ...video,
        categories: JSON.parse(video.categories),
        videoUrl: `https://ddbyrpmrexntgqszrays.supabase.co/storage/v1/object/public/videos/${video.file_name}`
      }));
      setVideos(parsedData);
    }
  };

  const handleDelete = async (id: number, fileName: string) => {
    try {
      // Lösche das Video aus dem Bucket
      const { error: deleteError } = await supabase
        .storage
        .from('videos') // Stelle sicher, dass dies der korrekte Bucket-Name ist
        .remove([fileName]); // Datei mit vollständigem Pfad, falls nötig
  
      if (deleteError) {
        throw new Error('Fehler beim Löschen des Videos im Bucket: ' + deleteError.message);
      }
  
      // Lösche den Datenbankeintrag
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
  
      if (dbError) {
        throw new Error('Fehler beim Löschen des Datenbankeintrags: ' + dbError.message);
      }
  
      setVideos(videos.filter(video => video.id !== id));
      setShowConfirm(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  };

  const confirmDelete = (video: Video) => {
    setVideoToDelete(video);
    setShowConfirm(true);
  };

  const filteredVideos = videos
    .filter(video => video.title.toLowerCase().includes(searchTerm.toLowerCase()) || video.categories.join(', ').toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Suche..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded"
        />
        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-300 rounded">
          Sortiere: {sortOrder === 'asc' ? 'Aufsteigend' : 'Absteigend'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filteredVideos.map((video) => (
          <div key={video.id} className="card p-4 border border-gray-300 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
            <p className="mb-2">{video.description}</p>
            <p>Kategorien: {video.categories.join(', ')}</p>
            <p>Externer Link: <a href={video.external_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{video.external_link}</a></p>
            <video src={video.videoUrl} controls className="mt-2 w-full h-auto" style={{ aspectRatio: '9/16' }} />
            <button onClick={() => confirmDelete(video)} className="mt-2 p-2 bg-red-500 text-white rounded">
              Löschen
            </button>
          </div>
        ))}
      </div>

      {showConfirm && videoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg">
            <p>Möchten Sie das Video "{videoToDelete.title}" wirklich löschen?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowConfirm(false)} className="p-2 bg-gray-300 rounded">Nein</button>
              <button onClick={() => handleDelete(videoToDelete.id, videoToDelete.file_name)} className="p-2 bg-red-500 text-white rounded">Ja</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}