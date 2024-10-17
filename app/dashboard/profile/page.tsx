"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = {
  id: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Fehler bei der Authentifizierung:', authError);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Fehler beim Abrufen des Profils:', error);
    } else {
      setProfile(data);
    }
  };

  if (!profile) {
    return <div>Lade Profil...</div>;
  }

  return (
    <div className="p-4 h-screen">
      <h2 className="text-lg font-bold mb-4">Mein Profil</h2>
      <div className="p-4 border border-gray-300 rounded-lg shadow-md">
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Rolle:</strong> {profile.role}</p>
      </div>
    </div>
  );
}