"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type User = {
  id: number;
  email: string;
  role: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Fehler beim Abrufen der Benutzer:', error);
    } else {
      console.log('Benutzerdaten:', data); // Log-Ausgabe
      setUsers(data);
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Aktualisieren der Rolle:', error);
    } else {
      setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Benutzerverwaltung</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="p-4 border border-gray-300 rounded-lg shadow-md">
            <p>Email: {user.email}</p>
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user.id, e.target.value)}
              className="mt-2 p-1 border rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}