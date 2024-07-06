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

  const fetchBackgroundChecks = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/background-check?page=${page}&limit=10`);
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
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-8">
    <h2 className="text-xl font-semibold mb-4">Recent Background Checks</h2>
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