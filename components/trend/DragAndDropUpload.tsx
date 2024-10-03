'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DragAndDropUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const { error } = await supabase.storage
        .from('videos') // Replace with your actual bucket name
        .upload(fileName, file)

      if (error) {
        console.error('Error uploading file:', error)
      } else {
        setUploadedFiles(prev => [...prev, fileName])
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div className="mt-8">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Uploaded Files:</h3>
          <ul className="list-disc pl-5">
            {uploadedFiles.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}