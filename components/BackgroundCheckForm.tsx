'use client';

import { useState } from 'react';

export default function BackgroundCheckForm() {
  const [name, setName] = useState('');
  const [personalNumber, setPersonalNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/background-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, personalNumber }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to initiate background check');
      }
  
      const result = await response.json();
      console.log('Background check initiated:', result);
      // Here you would typically update the UI to show the initiated check
      alert('Background check initiated successfully!');
    } catch (error) {
      console.error('Error initiating background check:', error);
      alert('Failed to initiate background check. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="personalNumber" className="block text-sm font-medium text-gray-700">Personal Number</label>
        <input
          type="text"
          id="personalNumber"
          value={personalNumber}
          onChange={(e) => setPersonalNumber(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        Initiate Background Check
      </button>
    </form>
  );
}