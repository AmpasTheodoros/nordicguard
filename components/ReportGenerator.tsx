'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ReportType = 'riskDistribution' | 'checkVolume';

export default function ReportGenerator() {
  const [reportType, setReportType] = useState<ReportType>('riskDistribution');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async () => {
    const response = await fetch(`/api/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`);
    if (response.ok) {
      const data = await response.json();
      setReportData(data);
    } else {
      console.error('Failed to generate report');
    }
  };

  const renderChart = () => {
    if (!reportData) return null;

    if (reportType === 'riskDistribution') {
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

    if (reportType === 'checkVolume') {
      return <p className="text-2xl font-bold">Total Checks: {reportData.totalChecks}</p>;
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Report Generator</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Report Type:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="border p-2 rounded"
          >
            <option value="riskDistribution">Risk Distribution</option>
            <option value="checkVolume">Check Volume</option>
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