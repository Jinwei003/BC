import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TestProcess from '../api/models/TestProcess.js';
import Authentication from '../api/models/Authentication.js';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

const batchId = 'PROT-20241201-A';
const merchantWallet = '0x742d35cc6634c0532925a3b8d4c9db96590c6c87';

// Sample TestProcess data
const sampleTestProcess = {
  batchId,
  merchantWallet,
  testingLaboratory: {
    name: 'Premium Testing Labs Inc.',
    address: '456 Science Park, Research City, RC 12345',
    certification: 'ISO/IEC 17025:2017',
    contactInfo: {
      phone: '+1-555-0199',
      email: 'lab@premiumtesting.com'
    }
  },
  testDate: new Date('2024-12-02'),
  testResults: {
    proteinContent: {
      measured: 24.8,
      expected: 25.0,
      variance: -0.8,
      passed: true
    },
    purityTest: {
      contaminants: [
        {
          name: 'Heavy Metals',
          level: 0.5,
          unit: 'ppm',
          limit: 10.0,
          passed: true
        },
        {
          name: 'Pesticide Residues',
          level: 0.1,
          unit: 'ppm',
          limit: 0.5,
          passed: true
        }
      ],
      overallPurity: 99.8,
      passed: true
    },
    microbiologicalTest: {
      bacteria: {
        count: 50,
        unit: 'CFU/g',
        limit: 1000,
        passed: true
      },
      yeastMold: {
        count: 10,
        unit: 'CFU/g',
        limit: 100,
        passed: true
      },
      pathogens: [
        {
          name: 'Salmonella',
          detected: false,
          passed: true
        },
        {
          name: 'E. coli',
          detected: false,
          passed: true
        }
      ],
      passed: true
    },
    heavyMetals: [
      {
        metal: 'Lead',
        level: 0.1,
        unit: 'ppm',
        limit: 0.5,
        passed: true
      },
      {
        metal: 'Mercury',
        level: 0.05,
        unit: 'ppm',
        limit: 0.1,
        passed: true
      }
    ],
    overallResult: 'PASS'
  },
  testMethodology: {
    standards: ['AOAC 990.03', 'ISO 8968-1', 'AOAC 991.20'],
    equipment: [
      {
        name: 'HPLC System',
        model: 'Agilent 1260 Infinity',
        calibrationDate: new Date('2024-11-01')
      },
      {
        name: 'Kjeldahl Analyzer',
        model: 'FOSS Kjeltec 8400',
        calibrationDate: new Date('2024-11-15')
      }
    ],
    procedures: 'Sample preparation according to AOAC 990.03. Protein analysis using Kjeldahl method. Heavy metals analysis using ICP-MS. Microbiological testing using standard plate count.'
  },
  reportHash: crypto.createHash('sha256').update(JSON.stringify({ batchId, testDate: '2024-12-02', result: 'PASS' })).digest('hex'),
  ipfsHash: 'QmTestProcessHashForTesting123456789'
};

// Sample Authentication data
const sampleAuthentication = {
  batchId,
  merchantWallet,
  certificates: [
    {
      type: 'ISO',
      name: 'ISO 22000:2018',
      issuingAuthority: 'ISO Certification Body',
      certificateNumber: 'ISO-22000-2024-001',
      issueDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-12-01'),
      scope: 'Food Safety Management System',
      status: 'VALID',
      verificationUrl: 'https://iso.org/verify/ISO-22000-2024-001'
    },
    {
      type: 'HACCP',
      name: 'HACCP Certification',
      issuingAuthority: 'Food Safety Authority',
      certificateNumber: 'HACCP-2024-001',
      issueDate: new Date('2024-02-01'),
      expiryDate: new Date('2025-12-01'),
      scope: 'Hazard Analysis and Critical Control Points',
      status: 'VALID',
      verificationUrl: 'https://fsa.gov/verify/HACCP-2024-001'
    },
    {
      type: 'GMP',
      name: 'Good Manufacturing Practice',
      issuingAuthority: 'Good Manufacturing Practice Board',
      certificateNumber: 'GMP-2024-001',
      issueDate: new Date('2024-03-01'),
      expiryDate: new Date('2025-12-01'),
      scope: 'Manufacturing Quality Standards',
      status: 'VALID',
      verificationUrl: 'https://gmp.org/verify/GMP-2024-001'
    }
  ],
  complianceChecks: {
    regulatoryCompliance: {
      fda: {
        compliant: true,
        details: 'FDA registration number: 12345678910'
      },
      usda: {
        compliant: true,
        details: 'USDA organic certification pending'
      },
      localRegulations: {
        compliant: true,
        details: 'All local health department requirements met'
      }
    },
    qualityStandards: {
      iso22000: {
        compliant: true,
        certificateNumber: 'ISO-22000-2024-001'
      },
      haccp: {
        compliant: true,
        certificateNumber: 'HACCP-2024-001'
      },
      gmp: {
        compliant: true,
        certificateNumber: 'GMP-2024-001'
      }
    },
    overallCompliance: 'FULLY_COMPLIANT'
  },
  auditTrail: [
    {
      auditor: {
        name: 'Sarah Johnson',
        organization: 'Quality Assurance International',
        credentials: 'Certified Food Safety Auditor (CFSA)'
      },
      auditDate: new Date('2024-11-20'),
      auditType: 'EXTERNAL',
      findings: [
        {
          category: 'Documentation',
          severity: 'MINOR',
          description: 'Some batch records missing signatures',
          correctedAction: 'Updated documentation procedures',
          status: 'CLOSED'
        }
      ],
      overallRating: 'GOOD'
    }
  ],
  evidenceFiles: [],
  reportHash: crypto.createHash('sha256').update(JSON.stringify({ batchId, compliance: 'FULLY_COMPLIANT' })).digest('hex'),
  ipfsHash: 'QmAuthenticationHashForTesting123456789'
};

async function addMissingReports() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing reports for this batch
    console.log('Clearing existing reports for batch:', batchId);
    await TestProcess.deleteOne({ batchId });
    await Authentication.deleteOne({ batchId });
    console.log('✓ Cleared existing reports');

    // Create TestProcess report
    console.log('Creating TestProcess report...');
    const testProcess = new TestProcess(sampleTestProcess);
    await testProcess.save();
    console.log('✓ TestProcess report created for batch:', batchId);

    // Create Authentication report
    console.log('Creating Authentication report...');
    const authentication = new Authentication(sampleAuthentication);
    await authentication.save();
    console.log('✓ Authentication report created for batch:', batchId);

    console.log('\n=== MISSING REPORTS ADDED ===');
    console.log('Batch ID:', batchId);
    console.log('TestProcess Hash:', sampleTestProcess.reportHash);
    console.log('Authentication Hash:', sampleAuthentication.reportHash);
    console.log('\nNow all three reports are complete for verification!');
    console.log('=====================================\n');

  } catch (error) {
    console.error('Error adding missing reports:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addMissingReports().catch(console.error);