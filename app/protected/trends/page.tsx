'use client'

import React, { useState, useEffect, memo } from 'react'
import { ArrowRightIcon, SparklesIcon, TagIcon, PlayIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid'
import { createClient } from '@/utils/supabase/client'

interface Trend {
  id: number
  title: string
  description: string
  categories: string[]
  videoUrl: string
  createdAt: string
}

const styles = {
  container: 'min-h-screen p-8 bg-black text-white',
  header: 'text-3xl font-bold mb-8 text-center',
  button: 'w-full text-lg bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center',
  card: 'w-full max-w-md mx-auto shadow-lg rounded-lg overflow-hidden transition duration-300 ease-in-out transform hover:shadow-xl bg-gray-800 text-gray-100',
  cardContent: 'p-6',
  videoContainer: 'w-full aspect-video mb-4 relative',
  video: 'w-full h-full object-cover rounded-lg',
  playButton: 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition duration-300 ease-in-out',
  title: 'text-2xl font-bold mb-2',
  tagContainer: 'mb-4 flex flex-wrap',
  tag: 'inline-flex items-center bg-gray-600 text-gray-200 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2',
  description: 'text-sm mb-4 text-gray-400',
  nextButton: 'w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center',
  progressBar: 'w-full bg-gray-200 rounded-full h-2.5 mb-4',
  progressFill: 'bg-gray-500 h-2.5 rounded-full transition-all duration-300 ease-in-out',
  adminButton: 'fixed bottom-4 right-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out',
  modal: 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center',
  modalContent: 'bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full m-4',
  input: 'mt-1 block w-full rounded-md border-gray-500 shadow-sm focus:border-gray-400 focus:ring focus:ring-gray-300 focus:ring-opacity-50',
  label: 'block text-sm font-medium text-gray-300',
  adminGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  dropZone: 'border-2 border-dashed border-gray-500 p-4 rounded-md text-center text-gray-300 mt-2 cursor-pointer',
  dropZoneActive: 'border-blue-500 bg-blue-50',
}

const TrendCard = memo(({ trend, onNextTrend, isAdmin, onEdit, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const updateProgress = () => {
      if (videoRef.current) {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
        setProgress(progress)
      }
    }

    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateProgress)
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', updateProgress)
      }
    }
  }, [])

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.videoContainer}>
          <video
            ref={videoRef}
            src={trend.videoUrl}
            className={styles.video}
            onClick={togglePlay}
          >
            Ihr Browser unterstützt das Video-Tag nicht.
          </video>
          {!isPlaying && (
            <div className={styles.playButton} onClick={togglePlay}>
              <PlayIcon className="w-16 h-16 text-white" />
            </div>
          )}
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
        <h2 className={styles.title}>{trend.title}</h2>
        <div className={styles.tagContainer}>
          {trend.categories.map(category => (
            <span key={category} className={styles.tag}>
              <TagIcon className="w-4 h-4 mr-1" />
              {category}
            </span>
          ))}
        </div>
        <p className={styles.description}>{trend.description}</p>
        {isAdmin ? (
          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={() => onEdit && onEdit(trend)} className="text-blue-600 hover:text-blue-800">
              <PencilIcon className="h-5 w-5" />
            </button>
            <button onClick={() => onDelete && onDelete(trend.id)} className="text-red-600 hover:text-red-800">
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button onClick={onNextTrend} className={styles.nextButton}>
            Nächster Trend
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>
    </div>
  )
})

TrendCard.displayName = 'TrendCard'

const TrendForm = ({ trend, onSave, onCancel }) => {
  const [formData, setFormData] = useState(trend || {
    title: '',
    description: '',
    categories: [],
    videoUrl: '',
  })
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categories' ? value.split(',').map(cat => cat.trim()) : value
    }))
  }

  const handleFileUpload = async (file) => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(`videos/${file.name}`, file)

    if (error) {
      console.error("Error uploading file:", error)
      return
    }

    const { data: urlData } = supabase.storage.from('videos').getPublicUrl(data.path)
    setFormData(prev => ({ ...prev, videoUrl: urlData.publicUrl }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileUpload(droppedFile)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData) }} className="space-y-4">
      <div>
        <label htmlFor="title" className={styles.label}>Titel</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>
      <div>
        <label htmlFor="description" className={styles.label}>Beschreibung</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>
      <div>
        <label htmlFor="categories" className={styles.label}>Kategorien (kommagetrennt)</label>
        <input
          type="text"
          id="categories"
          name="categories"
          value={formData.categories.join(', ')}
          onChange={handleChange}
          className={styles.input}
        />
      </div>
      <div>
        <label htmlFor="videoUrl" className={styles.label}>Video-URL oder Datei hochladen</label>
        <input
          type="url"
          id="videoUrl"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          className={styles.input}
        />
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          Datei hierher ziehen oder klicken, um hochzuladen
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Speichern
        </button>
      </div>
    </form>
  )
}

export default function TrendPage() {
  const [showTrend, setShowTrend] = useState(false)
  const [currentTrendIndex, setCurrentTrendIndex] = useState(0)
  const [trends, setTrends] = useState<Trend[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTrend, setCurrentTrend] = useState<Trend | null>(null)

  useEffect(() => {
    const fetchTrends = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('trends')
        .select('*')
      
      if (error) {
        console.error("Error fetching trends:", error)
      } else {
        setTrends(data)
      }
    }

    fetchTrends()
  }, [])

  const handleInspireMe = () => {
    setShowTrend(true)
  }

  const handleNextTrend = () => {
    setCurrentTrendIndex((prevIndex) => (prevIndex + 1) % trends.length)
  }

  const handleCreateTrend = () => {
    setCurrentTrend(null)
    setIsModalOpen(true)
  }

  const handleEditTrend = (trend: Trend) => {
    setCurrentTrend(trend)
    setIsModalOpen(true)
  }

  const handleSaveTrend = async (trendData: Trend) => {
    const supabase = createClient()
    let result
    if (trendData.id) {
      result = await supabase
        .from('trends')
        .update(trendData)
        .eq('id', trendData.id)
    } else {
      result = await supabase
        .from('trends')
        .insert(trendData)
    }

    if (result.error) {
      console.error("Error saving trend:", result.error)
    } else {
      const updatedTrends = trends.some(t => t.id === trendData.id)
        ? trends.map(t => t.id === trendData.id ? trendData : t)
        : [...trends, trendData]
      setTrends(updatedTrends)
      setIsModalOpen(false)
    }
  }

  const handleDeleteTrend = async (id: number) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Trend löschen möchten?')) {
      const supabase = createClient()
      const { error } = await supabase
        .from('trends')
        .delete()
        .eq('id', id)

      if (error) {
        console.error("Error deleting trend:", error)
      } else {
        setTrends(trends.filter(t => t.id !== id))
      }
    }
  }

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin)
    setShowTrend(false)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{isAdmin ? 'Admin Dashboard' : 'Trend Dashboard'}</h1>
      
      {isAdmin ? (
        <>
          <button onClick={handleCreateTrend} className={`${styles.button} mb-4`}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Neuen Trend erstellen
          </button>
          <div className={styles.adminGrid}>
            {trends.map(trend => (
              <TrendCard
                key={trend.id}
                trend={trend}
                onNextTrend={() => {}}
                isAdmin={true}
                onEdit={handleEditTrend}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.card}>
          {!showTrend ? (
            <button onClick={handleInspireMe} className={styles.button}>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Inspire Me
            </button>
          ) : trends.length > 0 ? (
            <TrendCard
              trend={trends[currentTrendIndex]}
              onNextTrend={handleNextTrend}
              isAdmin={false}
            />
          ) : (
            <div className="text-center py-12">Keine Trends verfügbar.</div>
          )}
        </div>
      )}

      <button onClick={toggleAdmin} className={styles.adminButton}>
        {isAdmin ? 'User View' : 'Admin View'}
      </button>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className="text-2xl font-bold mb-4">
              {currentTrend ? 'Trend bearbeiten' : 'Neuen Trend erstellen'}
            </h2>
            <TrendForm
              trend={currentTrend}
              onSave={handleSaveTrend}
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}