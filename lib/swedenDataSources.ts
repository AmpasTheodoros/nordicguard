import axios from 'axios';

interface CriminalRecord {
  offense: string;
  date: string;
  disposition: string;
}

interface EmploymentRecord {
  employer: string;
  position: string;
  startDate: string;
  endDate: string | null;
}

interface TaxRecord {
  year: string;
  income: number;
  taxesPaid: number;
}

interface PropertyRecord {
  propertyId: string;
  address: string;
  ownershipStatus: string;
}

interface VehicleRecord {
  vehicleId: string;
  registrationNumber: string;
  model: string;
  owner: string;
}

interface EducationRecord {
  institution: string;
  degree: string;
  graduationYear: string;
}

interface SocialMediaProfile {
  platform: string;
  username: string;
  url: string;
}

interface LegalRecord {
  caseId: string;
  caseType: string;
  status: string;
  date: string;
}

// API for criminal records using Open Data from the Swedish Police
async function getCriminalRecords(personalNumber: string): Promise<CriminalRecord[]> {
  const apiUrl = `https://api.dataportal.se/criminal_records/${personalNumber}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching criminal records:', error);
    throw new Error('Failed to fetch criminal records');
  }
}

// API for employment history using Open Data from employment statistics
async function getEmploymentHistory(personalNumber: string): Promise<EmploymentRecord[]> {
  const apiUrl = `https://api.dataportal.se/employment_history/${personalNumber}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching employment history:', error);
    throw new Error('Failed to fetch employment history');
  }
}

// API for tax records using Open Data from the Swedish Tax Agency
async function getTaxRecords(personalNumber: string): Promise<TaxRecord[]> {
  const apiUrl = `https://api.dataportal.se/tax_records/${personalNumber}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching tax records:', error);
    throw new Error('Failed to fetch tax records');
  }
}

// API for property records using Open Data from Lantmäteriet
async function getPropertyRecords(personalNumber: string): Promise<PropertyRecord[]> {
  const apiUrl = `https://api.dataportal.se/property_records/${personalNumber}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching property records:', error);
    throw new Error('Failed to fetch property records');
  }
}

// API for vehicle records using Open Data from Transportstyrelsen
async function getVehicleRecords(personalNumber: string): Promise<VehicleRecord[]> {
  const apiUrl = `https://api.dataportal.se/vehicle_records/${personalNumber}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle records:', error);
    throw new Error('Failed to fetch vehicle records');
  }
}

// API for education records using Open Data from Swedish educational institutions
async function getEducationRecords(personalNumber: string): Promise<EducationRecord[]> {
  const apiUrl = `https://api.dataportal.se/education_records/${personalNumber}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching education records:', error);
    throw new Error('Failed to fetch education records');
  }
}

// Free API for social media profiles using Twitter API (requires free developer account)
async function getSocialMediaProfiles(username: string): Promise<SocialMediaProfile[]> {
  const apiUrl = `https://api.twitter.com/2/users/by/username/${username}`;
  const apiKey = process.env.TWITTER_API_KEY;

  try {
    const response = await axios.get(apiUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching social media profiles:', error);
    throw new Error('Failed to fetch social media profiles');
  }
}

// API for legal records using Open Data from the Swedish National Courts Administration
async function getLegalRecords(personalNumber: string): Promise<LegalRecord[]> {
  const apiUrl = `https://api.dataportal.se/legal_records/${personalNumber}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching legal records:', error);
    throw new Error('Failed to fetch legal records');
  }
}

export { getCriminalRecords, getEmploymentHistory, getTaxRecords, getPropertyRecords, getVehicleRecords, getEducationRecords, getSocialMediaProfiles, getLegalRecords };
