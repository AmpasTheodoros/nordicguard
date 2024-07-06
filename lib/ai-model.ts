import { getCriminalRecords, getFinancialRecords, getEmploymentHistory } from './externalApis';

type BackgroundCheckInput = {
  name: string;
  personalNumber: string;
};

type BackgroundCheckResult = {
  riskScore: number;
  flags: string[];
  criminalRecords: any[];
  financialRecord: any;
  employmentHistory: any[];
};

export async function processBackgroundCheck(input: BackgroundCheckInput): Promise<BackgroundCheckResult> {
  const { personalNumber } = input;

  // Fetch data from external APIs
  const [criminalRecords, financialRecord, employmentHistory] = await Promise.all([
    getCriminalRecords(personalNumber),
    getFinancialRecords(personalNumber),
    getEmploymentHistory(personalNumber),
  ]);

  // Calculate risk score
  let riskScore = 50; // Start with a baseline score

  // Adjust score based on criminal records
  riskScore += criminalRecords.length * 10;

  // Adjust score based on financial records
  riskScore += (700 - financialRecord.creditScore) / 10;
  riskScore += financialRecord.bankruptcies * 15;

  // Adjust score based on employment history
  const currentJob = employmentHistory.find(job => job.endDate === null);
  if (!currentJob) {
    riskScore += 10; // Increase risk if currently unemployed
  }

  // Cap risk score between 0 and 100
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Generate flags
  const flags: string[] = [];
  if (criminalRecords.length > 0) flags.push('Criminal record found');
  if (financialRecord.creditScore < 600) flags.push('Low credit score');
  if (financialRecord.bankruptcies > 0) flags.push('Bankruptcy on record');
  if (!currentJob) flags.push('Currently unemployed');

  return {
    riskScore,
    flags,
    criminalRecords,
    financialRecord,
    employmentHistory,
  };
}