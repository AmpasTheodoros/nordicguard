import { BackgroundCheck } from '@prisma/client';

type BackgroundCheckInput = {
  name: string;
  personalNumber: string;
  // Add more input fields as needed
};

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

// Mock database for demonstration purposes
const mockDatabase = {
  criminalRecords: new Set(['19800101-1234', '19900202-5678']),
  financialDefaults: new Set(['19850505-9876', '19900202-5678']),
  employmentHistory: new Map([
    ['19800101-1234', 2],
    ['19850505-9876', 5],
    ['19900202-5678', 1],
  ]),
};

export async function processBackgroundCheck(input: BackgroundCheckInput): Promise<BackgroundCheckResult> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { personalNumber } = input;

  // Check criminal records
  const hasCriminalRecord = mockDatabase.criminalRecords.has(personalNumber);

  // Check financial defaults
  const hasFinancialDefaults = mockDatabase.financialDefaults.has(personalNumber);

  // Check employment history
  const employmentYears = mockDatabase.employmentHistory.get(personalNumber) || 0;

  // Calculate category scores
  const criminalScore = hasCriminalRecord ? 100 : 0;
  const financialScore = hasFinancialDefaults ? 80 : 0;
  const employmentScore = Math.max(0, 100 - employmentYears * 20); // Lower score for more years of employment

  // Calculate overall risk score
  const riskScore = (criminalScore * 0.4 + financialScore * 0.4 + employmentScore * 0.2);

  // Determine flags
  const flags: string[] = [];
  if (hasCriminalRecord) flags.push('Criminal record found');
  if (hasFinancialDefaults) flags.push('Financial defaults detected');
  if (employmentYears < 2) flags.push('Limited employment history');

  // Generate recommendations
  const recommendations: string[] = [];
  if (hasCriminalRecord) recommendations.push('Conduct in-depth interview about criminal history');
  if (hasFinancialDefaults) recommendations.push('Require financial background explanation');
  if (employmentYears < 2) recommendations.push('Verify recent employment references');

  return {
    riskScore,
    flags,
    categories: {
      criminal: criminalScore,
      financial: financialScore,
      employment: employmentScore,
    },
    recommendations,
  };
}