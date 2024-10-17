"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string;
  website: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile>({
    username: '',
    full_name: '',
    avatar_url: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
        setError('Error getting session. Please try again.');
        return;
      }

      if (session?.user) {
        setUser(session.user);
        getProfile(session.user);
      } else {
        setError('User not logged in. Please sign in to view your profile.');
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        getProfile(session.user);
      } else {
        setUser(null);
        setProfile({
          username: '',
          full_name: '',
          avatar_url: '',
          website: ''
        });
        setError('User not logged in. Please sign in to view your profile.');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const getProfile = async (user: User) => {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, full_name, avatar_url, website`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error.message);
      setError('Error loading user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!user) {
        throw new Error('User not logged in');
      }

      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }

      setSuccess('Profile updated successfully!');
      setError(null);
    } catch (error) {
      console.error('Error updating user data:', error.message);
      setError('Error updating profile. Please try again.');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <form onSubmit={updateProfile} className="form-widget max-w-md mx-auto mt-10 p-4 bg-gray-800 rounded shadow-md">
      <h1 className="text-2xl mb-4 text-white">Your Profile</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          value={profile.username}
          onChange={handleChange}
          className="mt-1 p-2 block w-full bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">Full Name</label>
        <input
          id="full_name"
          type="text"
          name="full_name"
          value={profile.full_name}
          onChange={handleChange}
          className="mt-1 p-2 block w-full bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-300">Avatar URL</label>
        <input
          id="avatar_url"
          type="text"
          name="avatar_url"
          value={profile.avatar_url}
          onChange={handleChange}
          className="mt-1 p-2 block w-full bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="website" className="block text-sm font-medium text-gray-300">Website</label>
        <input
          id="website"
          type="text"
          name="website"
          value={profile.website}
          onChange={handleChange}
          className="mt-1 p-2 block w-full bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Loading ...' : 'Update Profile'}
        </button>
      </div>
    </form>
  );
};

export default Profile;