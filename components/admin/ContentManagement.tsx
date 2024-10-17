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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);

  useEffect(() => {
    fetchVideos();
    fetchCategories();
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

  const handleDelete = async (id: number, fileName: string) => {
    try {
      const { error: deleteError } = await supabase
        .storage
        .from('videos')
        .remove([fileName]);

      if (deleteError) {
        throw new Error('Fehler beim Löschen des Videos im Bucket: ' + deleteError.message);
      }

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
        console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
      }
    }
  };

  const handleEdit = async (updatedVideo: Video) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: updatedVideo.title,
          description: updatedVideo.description,
          categories: JSON.stringify(updatedVideo.categories),
          external_link: updatedVideo.external_link
        })
        .eq('id', updatedVideo.id);

      if (error) {
        throw new Error('Fehler beim Aktualisieren des Videos: ' + error.message);
      }

      setVideos(videos.map(video => video.id === updatedVideo.id ? updatedVideo : video));
      setVideoToEdit(null);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
      }
    }
  };

  const confirmDelete = (video: Video) => {
    setVideoToDelete(video);
    setShowConfirm(true);
  };

  const startEdit = (video: Video) => {
    setVideoToEdit(video);
  };

  const filteredVideos = videos
    .filter(video => 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.categories.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(video => 
      selectedCategory === '' || video.categories.includes(selectedCategory)
    );

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Suche..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded bg-white text-black"
        >
          <option value="">Alle Kategorien</option>
          {allCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filteredVideos.map((video) => (
          <div key={video.id} className="card p-4 border border-gray-300 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
            <p className="mb-2">{video.description}</p>
            <p>Kategorien: {video.categories.join(', ')}</p>
            <p>Externer Link: <a href={video.external_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{video.external_link}</a></p>
            <video src={video.videoUrl} controls className="mt-2 w-full h-auto" style={{ aspectRatio: '9/16' }} />
            <button onClick={() => startEdit(video)} className="mt-2 p-2 bg-blue-500 text-white rounded">
              Bearbeiten
            </button>
            <button onClick={() => confirmDelete(video)} className="mt-2 p-2 bg-red-500 text-white rounded">
              Löschen
            </button>
          </div>
        ))}
      </div>

      {showConfirm && videoToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="flex flex-col bg-gray-800 p-4 rounded shadow-lg">
            <p>Möchten Sie das Video "{videoToDelete.title}" wirklich löschen?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowConfirm(false)} className="p-2 bg-gray-300 rounded">Nein</button>
              <button onClick={() => handleDelete(videoToDelete.id, videoToDelete.file_name)} className="p-2 bg-red-500 text-white rounded">Ja</button>
            </div>
          </div>
        </div>
      )}

      {videoToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <div className="flex flex-col bg-gray-800 p-4 rounded shadow-lg">
            <h3>Video bearbeiten: {videoToEdit.title}</h3>
            <input
              type="text"
              value={videoToEdit.title}
              onChange={(e) => setVideoToEdit({ ...videoToEdit, title: e.target.value })}
              className="p-2 border rounded mb-2"
            />
            <textarea
              value={videoToEdit.description}
              onChange={(e) => setVideoToEdit({ ...videoToEdit, description: e.target.value })}
              className="p-2 border rounded mb-2"
            />
            <input
              type="text"
              value={videoToEdit.external_link}
              onChange={(e) => setVideoToEdit({ ...videoToEdit, external_link: e.target.value })}
              className="p-2 border rounded mb-2"
            />
            <input
              type="text"
              value={videoToEdit.categories.join(', ')}
              onChange={(e) => setVideoToEdit({ ...videoToEdit, categories: e.target.value.split(',').map(cat => cat.trim()) })}
              className="p-2 border rounded mb-2"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => handleEdit(videoToEdit)} className="p-2 bg-green-500 text-white rounded">
                Speichern
              </button>
              <button onClick={() => setVideoToEdit(null)} className="p-2 bg-gray-300 rounded">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}