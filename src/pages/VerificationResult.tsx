import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, AlertTriangle, ArrowLeft, Calendar, Building, FileText, Award, Beaker, Clock } from 'lucide-react';

interface VerificationData {
  batchId: string;
  status: string;
  isComplete: boolean;
  sha256Hash?: string;
  ipfsCid?: string;
  blockchainHash?: string;
  blockchainVerification: {
    onChain: boolean;
    verified: boolean;
    merchant?: string;
    timestamp?: number;
    hashesMatch?: boolean;
    reason?: string;
    error?: string;
    blockchainTxHash?: string;
  };
  reports: {
    ingredients?: {
      productName: string;
      manufacturer: string;
      manufacturingDate: string;
      expiryDate: string;
      ingredients: Array<{ name: string; percentage: number; source: string }>;
      nutritionalInfo: {
        protein: number;
        carbohydrates: number;
        fats: number;
        calories: number;
        fiber: number;
        sugar: number;
      };
      allergens: string[];
      certifications: string[];
      reportHash: string;
      createdAt: string;
    };
    testProcess?: {
      testingLaboratory: {
        name: string;
        accreditation: string;
        location: string;
      };
      testDate: string;
      testResults: {
        proteinContent: {
          claimed: number;
          actual: number;
          variance: number;
          passed: boolean;
        };
        purity: {
          percentage: number;
          contaminants: string[];
          passed: boolean;
        };
        microbiological: {
          totalPlateCount: number;
          yeastMold: number;
          ecoli: boolean;
          salmonella: boolean;
          passed: boolean;
        };
        heavyMetals: {
          lead: number;
          mercury: number;
          cadmium: number;
          arsenic: number;
          passed: boolean;
        };
        overallResult: string;
      };
      testMethodology: string;
      reportHash: string;
      createdAt: string;
    };
    authentication?: {
      certificates: Array<{
        type: string;
        name: string;
        issuingAuthority: string;
        certificateNumber: string;
        issueDate: string;
        expiryDate: string;
        scope: string;
        status: string;
        verificationUrl?: string;
      }>;
      complianceChecks: {
        regulatory: {
          fda: boolean;
          usda: boolean;
          gmp: boolean;
          haccp: boolean;
        };
        qualityStandards: {
          iso22000: boolean;
          brc: boolean;
          sqf: boolean;
        };
        overall: boolean;
      };
      auditTrail: Array<{
        auditor: string;
        auditDate: string;
        auditType: string;
        findings: string;
        overallRating: string;
      }>;
      reportHash: string;
      createdAt: string;
    };
  };
  verificationSummary: {
    dataIntegrity: boolean;
    blockchainVerified: boolean;
    reportsComplete: boolean;
    approvedAt?: string;
    approvedBy?: string;
    trustScore: number;
  };
}

export default function VerificationResult() {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerificationData = async () => {
      if (!batchId) {
        setError('No batch ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/verification/batch/${batchId}`);
        const data = await response.json();

        if (data.success) {
          setVerificationData(data.verification);
        } else {
          setError(data.message || 'Failed to fetch verification data');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Verification fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationData();
  }, [batchId]);

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return 'High Trust';
    if (score >= 60) return 'Medium Trust';
    return 'Low Trust';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying batch {batchId}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!verificationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No verification data available</p>
        </div>
      </div>
    );
  }

  const { reports, verificationSummary, blockchainVerification } = verificationData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </button>
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">ProteinVerify</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Batch Verification</h2>
              <p className="text-xl text-gray-600 mt-1">Batch ID: {batchId}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${getTrustScoreColor(verificationSummary.trustScore)}`}>
              {getTrustScoreLabel(verificationSummary.trustScore)} ({verificationSummary.trustScore}%)
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              {verificationSummary.reportsComplete ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">Reports Complete</p>
                <p className="text-sm text-gray-600">
                  {verificationSummary.reportsComplete ? 'All reports available' : 'Missing reports'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {verificationSummary.blockchainVerified ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">Blockchain Verified</p>
                <p className="text-sm text-gray-600">
                  {verificationSummary.blockchainVerified ? 'On-chain verified' : 'Not on blockchain'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {verificationSummary.dataIntegrity ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className="font-medium">Data Integrity</p>
                <p className="text-sm text-gray-600">
                  {verificationSummary.dataIntegrity ? 'Hashes match' : 'Data modified'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {blockchainVerification?.onChain ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">Blockchain Status</p>
                <p className="text-sm text-gray-600">
                  {blockchainVerification?.onChain ? 'Recorded on-chain' : 'Not on blockchain'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information */}
        {reports.ingredients && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Product Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Name:</span>
                    <span className="font-medium">{reports.ingredients.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manufacturer:</span>
                    <span className="font-medium">{reports.ingredients.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manufacturing Date:</span>
                    <span className="font-medium">
                      {new Date(reports.ingredients.manufacturingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="font-medium">
                      {new Date(reports.ingredients.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Nutritional Information (per 100g)</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-medium">{reports.ingredients.nutritionalInfo.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carbohydrates:</span>
                    <span className="font-medium">{reports.ingredients.nutritionalInfo.carbohydrates}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fats:</span>
                    <span className="font-medium">{reports.ingredients.nutritionalInfo.fats}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-medium">{reports.ingredients.nutritionalInfo.calories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fiber:</span>
                    <span className="font-medium">{reports.ingredients.nutritionalInfo.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sugar:</span>
                    <span className="font-medium">{reports.ingredients.nutritionalInfo.sugar}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.ingredients.ingredients && Array.isArray(reports.ingredients.ingredients) ? (
                  reports.ingredients.ingredients.map((ingredient, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="font-medium text-gray-900">{ingredient.name || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{ingredient.percentage || 0}%</div>
                      <div className="text-sm text-gray-500">Source: {ingredient.source || 'N/A'}</div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-gray-500 text-center py-4">
                    No ingredients data available
                  </div>
                )}
              </div>
            </div>

            {/* Allergens */}
            {reports.ingredients.allergens && Array.isArray(reports.ingredients.allergens) && reports.ingredients.allergens.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Allergens</h4>
                <div className="flex flex-wrap gap-2">
                  {reports.ingredients.allergens.map((allergen, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {reports.ingredients.certifications && Array.isArray(reports.ingredients.certifications) && reports.ingredients.certifications.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {reports.ingredients.certifications.map((cert, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {typeof cert === 'string' ? cert : (cert as any)?.name || 'Unknown Certification'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Results */}
        {reports.testProcess && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <Beaker className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Test Results</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Testing Laboratory</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{reports.testProcess.testingLaboratory.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accreditation:</span>
                    <span className="font-medium">{reports.testProcess.testingLaboratory.accreditation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{reports.testProcess.testingLaboratory.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Date:</span>
                    <span className="font-medium">
                      {new Date(reports.testProcess.testDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Result</h4>
                <div className={`p-4 rounded-lg ${
                  reports.testProcess.testResults.overallResult === 'PASS' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className="flex items-center">
                    {reports.testProcess.testResults.overallResult === 'PASS' ? (
                      <CheckCircle className="h-5 w-5 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 mr-2" />
                    )}
                    <span className="font-semibold text-lg">
                      {reports.testProcess.testResults.overallResult}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h4>
              <div className="text-gray-700 whitespace-pre-wrap">
                {typeof reports.testProcess?.testResults === 'string' 
                  ? reports.testProcess.testResults 
                  : reports.testProcess?.testResults 
                    ? JSON.stringify(reports.testProcess.testResults, null, 2)
                    : 'No test results available'
                }
              </div>
            </div>
          </div>
        )}

        {/* Certifications & Compliance */}
        {reports.authentication && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <Award className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Certifications & Compliance</h3>
            </div>

            {/* Certificates */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Certificates</h4>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-gray-700 whitespace-pre-wrap">
                  {typeof reports.authentication?.certificates === 'string' 
                    ? reports.authentication.certificates 
                    : reports.authentication?.certificates 
                      ? JSON.stringify(reports.authentication.certificates, null, 2)
                      : 'No certificates information available'
                  }
                </div>
              </div>
            </div>

            {/* Compliance Checks */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {typeof reports.authentication?.complianceChecks === 'string' 
                  ? reports.authentication.complianceChecks 
                  : reports.authentication?.complianceChecks 
                    ? JSON.stringify(reports.authentication.complianceChecks, null, 2)
                    : 'No compliance information available'
                }
              </p>
            </div>
          </div>
        )}

        {/* Blockchain Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-2xl font-bold text-gray-900">Blockchain Verification</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">On Blockchain:</span>
                  <div className="flex items-center">
                    {blockchainVerification?.onChain ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`font-medium ${
                      blockchainVerification?.onChain ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {blockchainVerification?.onChain ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Data Integrity:</span>
                  <div className="flex items-center">
                    {blockchainVerification?.verified ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`font-medium ${
                      blockchainVerification?.verified ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {blockchainVerification?.verified ? 'Verified' : 'Failed'}
                    </span>
                  </div>
                </div>

                {blockchainVerification?.hashesMatch !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Hash Verification:</span>
                    <div className="flex items-center">
                      {blockchainVerification?.hashesMatch ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        blockchainVerification?.hashesMatch ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {blockchainVerification?.hashesMatch ? 'Match' : 'Mismatch'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Details</h4>
              <div className="space-y-3">
                {verificationData.sha256Hash && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">SHA-256 Hash:</span>
                    <span className="font-mono text-sm break-all">
                      {verificationData.sha256Hash}
                    </span>
                  </div>
                )}

                {verificationData.ipfsCid && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">IPFS CID:</span>
                    <span className="font-mono text-sm break-all">
                      {verificationData.ipfsCid}
                    </span>
                  </div>
                )}

                {verificationData.blockchainHash && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blockchain Hash:</span>
                    <span className="font-mono text-sm break-all">
                      {verificationData.blockchainHash}
                    </span>
                  </div>
                )}

                {blockchainVerification?.merchant && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Merchant:</span>
                    <span className="font-mono text-sm">
                      {blockchainVerification.merchant.slice(0, 6)}...{blockchainVerification.merchant.slice(-4)}
                    </span>
                  </div>
                )}

                {blockchainVerification?.timestamp && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recorded:</span>
                    <span className="font-medium">
                      {new Date(blockchainVerification.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>
                )}

                {blockchainVerification?.reason && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <strong>Issue:</strong> {blockchainVerification.reason}
                  </div>
                )}

                {blockchainVerification?.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <strong>Error:</strong> {blockchainVerification.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Report Issue Button */}
        <div className="text-center">
          <button
            onClick={() => navigate(`/report-issue?batchId=${batchId}`)}
            className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
          >
            Report an Issue with this Product
          </button>
        </div>
      </div>
    </div>
  );
}