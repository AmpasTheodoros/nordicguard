'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type BackgroundCheckStats = {
  lowRisk: number;
  mediumRisk: number;
  highRisk: number;
  averageRiskScore: number;
};

export default function BackgroundCheckStats() {
  const [stats, setStats] = useState<BackgroundCheckStats | null>(null);

  useEffect(() => {
    fetch('/api/background-check/stats')
      .then(response => response.json())
      .then(data => setStats(data))
      .catch(error => console.error('Error fetching stats:', error));
  }, []);

  if (!stats) {
    return <div>Loading stats...</div>;
  }

  const chartData = [
    { name: 'Low Risk', value: stats.lowRisk },
    { name: 'Medium Risk', value: stats.mediumRisk },
    { name: 'High Risk', value: stats.highRisk },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Background Check Statistics</h2>
      <p>Average Risk Score: {stats.averageRiskScore.toFixed(2)}</p>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}