import axios from 'axios';

// You'll need to install axios: npm install axios

interface CriminalRecord {
  offense: string;
  date: string;
}

interface FinancialRecord {
  creditScore: number;
  bankruptcies: number;
}

interface EmploymentRecord {
  employer: string;
  startDate: string;
  endDate: string | null;
}

export async function getCriminalRecords(personalNumber: string): Promise<CriminalRecord[]> {
  // In a real-world scenario, you would call an actual API here
  // For now, we'll simulate an API call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  // Simulated data
  return personalNumber.endsWith('1') ? 
    [{ offense: 'Minor theft', date: '2020-03-15' }] : 
    [];
}

export async function getFinancialRecords(personalNumber: string): Promise<FinancialRecord> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulated data
  return {
    creditScore: Math.floor(Math.random() * 300) + 500,
    bankruptcies: personalNumber.endsWith('2') ? 1 : 0,
  };
}

export async function getEmploymentHistory(personalNumber: string): Promise<EmploymentRecord[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulated data
  return [
    {
      employer: 'Tech Corp',
      startDate: '2018-01-01',
      endDate: '2021-12-31',
    },
    {
      employer: 'Innovation Inc',
      startDate: '2022-01-15',
      endDate: null,
    },
  ];
}