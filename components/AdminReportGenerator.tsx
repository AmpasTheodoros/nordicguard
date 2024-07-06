'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ReportType = 'userGrowth' | 'systemWideRiskDistribution';

export default function AdminReportGenerator() {
  const [reportType, setReportType] = useState<ReportType>('userGrowth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    const response = await fetch(`/api/admin/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`);
    if (response.ok) {
      const data = await response.json();
      setReportData(data);
    } else {
      console.error('Failed to generate admin report');
    }
  };

  const renderChart = () => {
    if (!reportData) return null;

    if (reportType === 'userGrowth') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="newUsers" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (reportType === 'systemWideRiskDistribution') {
      const data = [
        { name: 'Low Risk', value: reportData.low },
        { name: 'Medium Risk', value: reportData.medium },
        { name: 'High Risk', value: reportData.high },
      ];

      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Admin Report Generator</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Report Type:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="border p-2 rounded"
          >
            <option value="userGrowth">User Growth</option>
            <option value="systemWideRiskDistribution">System-wide Risk Distribution</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Start Date:</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-2">End Date:</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <button 
          onClick={generateReport}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Report
        </button>
      </div>
      <div className="mt-8">
        {renderChart()}
      </div>
    </div>
  );
}