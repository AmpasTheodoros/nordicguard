'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type BackgroundCheckResult = {
  riskScore: number;
  flags: string[];
  categories: {
    financial: number;
    criminal: number;
    employment: number;
  };
  recommendations: string[];
};

type BackgroundCheck = {
  id: string;
  status: string;
  name: string;
  personalNumber: string;
  result: BackgroundCheckResult | null;
  initiatedAt: string;
  completedAt: string | null;
};

export default function BackgroundCheckList() {
  const [checks, setChecks] = useState<BackgroundCheck[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minRiskScore, setMinRiskScore] = useState('');
  const [maxRiskScore, setMaxRiskScore] = useState('');

  const fetchBackgroundChecks = async (page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
        startDate,
        endDate,
        minRiskScore,
        maxRiskScore,
      });
      const response = await fetch(`/api/background-check?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch background checks');
      }
      const data = await response.json();
      setChecks(data.backgroundChecks);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching background checks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackgroundChecks(currentPage);
  }, [currentPage, searchTerm, startDate, endDate, minRiskScore, maxRiskScore]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBackgroundChecks(1);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Background Checks</h2>
      <form onSubmit={handleFilterChange} className="mb-4 space-y-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or personal number"
          className="border p-2 w-full"
        />
        <div className="flex space-x-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2"
          />
        </div>
        <div className="flex space-x-2">
          <input
            type="number"
            value={minRiskScore}
            onChange={(e) => setMinRiskScore(e.target.value)}
            placeholder="Min Risk Score"
            className="border p-2"
          />
          <input
            type="number"
            value={maxRiskScore}
            onChange={(e) => setMaxRiskScore(e.target.value)}
            placeholder="Max Risk Score"
            className="border p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Apply Filters</button>
      </form>
      {checks.length === 0 ? (
        <p>No background checks found.</p>
      ) : (
        <>
          <ul className="space-y-4">
          {checks.map(check => (
            <li key={check.id} className="border p-4 rounded-md">
              <Link href={`/background-check/${check.id}`} className="text-blue-500 hover:underline">
                <h3 className="font-medium">{check.name}</h3>
              </Link>
              <p>Personal Number: {check.personalNumber}</p>
              <p>Status: {check.status}</p>
              {check.result && (
                <>
                  <p>Risk Score: {check.result.riskScore.toFixed(2)}</p>
                  <p>Flags: {check.result.flags.join(', ')}</p>
                  <p>Categories:</p>
                  <ul className="list-disc list-inside ml-4">
                    <li>Financial: {check.result.categories.financial}</li>
                    <li>Criminal: {check.result.categories.criminal}</li>
                    <li>Employment: {check.result.categories.employment}</li>
                  </ul>
                  <p>Recommendations:</p>
                  <ul className="list-disc list-inside ml-4">
                    {check.result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </>
              )}
              <p>Initiated: {new Date(check.initiatedAt).toLocaleString()}</p>
              {check.completedAt && <p>Completed: {new Date(check.completedAt).toLocaleString()}</p>}
            </li>
          ))}
        </ul>
          <div className="mt-4 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}