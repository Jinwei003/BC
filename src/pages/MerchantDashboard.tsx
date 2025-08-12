import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  LogOut,
  Package,
  Search,
  Filter,
  Eye,
  Plus,
  ExternalLink,
  X
} from 'lucide-react';
import ReportWizard from '../components/ReportWizard';

interface Batch {
  _id: string;
  batchId: string;
  productName: string;
  manufacturer: string;
  createdAt: string;
  hasIngredients: boolean;
  hasTestProcess: boolean;
  hasAuthentication: boolean;
  onBlockchain: boolean;
  blockchainTxHash?: string;
}

interface MerchantProfile {
  _id: string;
  walletAddress: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  businessLicense?: string;
  description?: string;
  status: string;
}

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'batches'>('overview');
  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [combinedReports, setCombinedReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Upload states
  const [showWizard, setShowWizard] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchProfile();
    fetchBatches();
    fetchCombinedReports();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('merchantToken');
    if (!token) {
      navigate('/merchant/login');
      return;
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('merchantToken');
      const response = await fetch('/api/auth/merchant/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        // Map API response to frontend expected format
        const mappedProfile = {
          ...data.merchant,
          contactPerson: data.merchant.name,
          companyName: data.merchant.organization
        };
        setProfile(mappedProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('merchantToken');
      const response = await fetch('/api/merchant/batches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCombinedReports = async () => {
    try {
      const token = localStorage.getItem('merchantToken');
      const response = await fetch('/api/merchant/reports/combined', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setCombinedReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching combined reports:', error);
    }
  };

  const openReportModal = (report: any) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setSelectedReport(null);
    setShowReportModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('merchantToken');
    localStorage.removeItem('walletAddress');
    navigate('/');
  };



  const handleWizardSubmit = async (data: {
    batchId: string;
    ingredientsData: any;
    testProcessData: any;
    authenticationData: any;
  }) => {
    setUploadLoading(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const token = localStorage.getItem('merchantToken');
      const response = await fetch('/api/merchant/reports/combined', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        setUploadSuccess('Your report is pending admin approval.');
        setShowWizard(false);
        fetchBatches(); // Refresh batches
        fetchCombinedReports(); // Refresh combined reports
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const filteredReports = combinedReports.filter(report => {
    const matchesSearch = report.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.ingredientsData?.productName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'approved') {
      return matchesSearch && report.status === 'approved';
    } else if (statusFilter === 'pending') {
      return matchesSearch && report.status === 'pending';
    } else if (statusFilter === 'rejected') {
      return matchesSearch && report.status === 'rejected';
    }
    
    return matchesSearch;
  });

  // Filter batches based on search and status
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = searchTerm === '' || 
      batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    // Note: For batches, we don't have approved/pending/rejected status like reports
    // So we'll just return all matches for now
    
    return matchesSearch;
  });



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Merchant Dashboard</h1>
                <p className="text-sm text-gray-600">{profile?.companyName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Package },
              { id: 'upload', label: 'Upload Reports', icon: Upload },
              { id: 'batches', label: 'My Batches', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Notifications Section */}
            {combinedReports.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Report Status Notifications</h3>
                {combinedReports.map((report) => {
                  if (report.status === 'approved') {
                    return (
                      <div key={report._id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-800">
                              ✅ Your report for batch {report.batchId} has been approved and recorded on blockchain.
                            </h4>
                            <div className="mt-2 text-sm text-green-700">
                              <p><strong>Product:</strong> {report.ingredientsData?.productName}</p>
                              {report.sha256Hash && (
                                <p><strong>SHA-256 Hash:</strong> <code className="bg-green-100 px-1 rounded">{report.sha256Hash}</code></p>
                              )}
                              {report.ipfsCid && (
                                <p><strong>IPFS CID:</strong> <code className="bg-green-100 px-1 rounded">{report.ipfsCid}</code></p>
                              )}
                              {report.blockchainTxHash && (
                                <p><strong>Blockchain TX:</strong> <code className="bg-green-100 px-1 rounded">{report.blockchainTxHash}</code></p>
                              )}
                              <p><strong>Approved:</strong> {new Date(report.approvedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (report.status === 'rejected') {
                    return (
                      <div key={report._id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800">
                              ❌ Your report for batch {report.batchId} was rejected.
                            </h4>
                            <div className="mt-2 text-sm text-red-700">
                              <p><strong>Product:</strong> {report.ingredientsData?.productName}</p>
                              <p><strong>Reason:</strong> {report.rejectionReason}</p>
                              <p><strong>Rejected:</strong> {new Date(report.rejectedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (report.status === 'pending') {
                    return (
                      <div key={report._id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-yellow-800">
                              ⏳ Your report for batch {report.batchId} is pending admin approval.
                            </h4>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p><strong>Product:</strong> {report.ingredientsData?.productName}</p>
                              <p><strong>Submitted:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.companyName || 'Not Provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.contactPerson || 'Not Provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.email || 'Not Provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.phone || 'Not Provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Address</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.address || 'Not Provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business License Number</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.businessLicense || 'Not Provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blockchain Wallet Address</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono break-all">{profile?.walletAddress || 'Not Provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    profile?.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : profile?.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile?.status}
                  </span>
                </div>
              </div>
              {profile?.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Business Description</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.description}</p>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-semibold text-gray-900">{combinedReports.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {combinedReports.filter(r => r.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {combinedReports.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">On Blockchain</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {combinedReports.filter(r => r.status === 'approved' && r.ipfsCid).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Upload Reports</h3>
            
            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-green-700">{uploadSuccess}</p>
                </div>
              </div>
            )}

            {!showWizard ? (
              <div className="text-center py-8">
                <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Product Reports</h4>
                <p className="text-gray-600 mb-6">Use our guided wizard to upload all required reports for your product batch.</p>
                <button
                  onClick={() => setShowWizard(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Start Upload Wizard
                </button>
              </div>
            ) : (
              <ReportWizard
                onSubmit={handleWizardSubmit}
                onCancel={() => setShowWizard(false)}
                isLoading={uploadLoading}
              />
            )}
          </div>
        )}

        {/* Batches Tab */}
        {activeTab === 'batches' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'approved' | 'pending' | 'rejected')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Reports</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Reports ({filteredReports.length})</h3>
              </div>
              
              {filteredReports.length === 0 ? (
                <div className="p-6 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reports found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <div key={report._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-center space-x-4 mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{report.batchId}</h4>
                              <p className="text-sm text-gray-600">{report.ingredientsReport?.productName || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{report.ingredientsReport?.manufacturer || 'N/A'}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              report.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : report.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {report.status === 'approved' ? '✅ Approved' : 
                               report.status === 'pending' ? '⏳ Pending' : 
                               '❌ Rejected'}
                            </span>
                          </div>

                          {/* Report Sections */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h5 className="font-medium text-gray-900 mb-2">📋 Ingredients Report</h5>
                              <p className="text-sm text-gray-600">Manufacturing: {report.ingredientsReport?.manufacturingDate}</p>
                              <p className="text-sm text-gray-600">Expiry: {report.ingredientsReport?.expiryDate}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h5 className="font-medium text-gray-900 mb-2">🧪 Test Process Report</h5>
                              <p className="text-sm text-gray-600">Lab: {report.testProcessReport?.testingLaboratory}</p>
                              <p className="text-sm text-gray-600">Date: {report.testProcessReport?.testDate}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <h5 className="font-medium text-gray-900 mb-2">🎯 Authentication Report</h5>
                              <p className="text-sm text-gray-600">Certificates: {report.authenticationReport?.certificates ? 'Available' : 'N/A'}</p>
                              <p className="text-sm text-gray-600">Compliance: {report.authenticationReport?.complianceChecks ? 'Checked' : 'N/A'}</p>
                            </div>
                          </div>

                          {/* Status-specific Information */}
                          {report.status === 'approved' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                              <h5 className="font-medium text-green-900 mb-3">🔗 Blockchain &amp; IPFS Information</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-green-800">SHA-256 Hash:</p>
                                  <p className="text-xs text-green-700 font-mono bg-green-100 p-1 rounded mt-1">
                                    {report.sha256Hash || 'Not available'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-800">IPFS CID:</p>
                                  <p className="text-xs text-green-700 font-mono bg-green-100 p-1 rounded mt-1">
                                    {report.ipfsCid || 'Not available'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-green-800">Blockchain TX Hash:</p>
                                  <p className="text-xs text-green-700 font-mono bg-green-100 p-1 rounded mt-1">
                                    {report.blockchainTxHash || 'Not available'}
                                  </p>
                                </div>
                              </div>
                              {report.ipfsCid && report.blockchainTxHash && (
                                <p className="text-sm text-green-800 mt-2 font-medium">✅ Blockchain: Verified</p>
                              )}
                            </div>
                          )}

                          {report.status === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                              <h5 className="font-medium text-red-900 mb-2">❌ Rejection Reason</h5>
                              <p className="text-sm text-red-800 bg-red-100 p-3 rounded">
                                {report.rejectionReason || 'No specific reason provided'}
                              </p>
                            </div>
                          )}

                          {report.status === 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                              <h5 className="font-medium text-yellow-900 mb-2">⏳ Status: Pending</h5>
                              <p className="text-sm text-yellow-800">
                                Your report is under review by admin. You will be notified once the review is complete.
                              </p>
                            </div>
                          )}
                          
                          {/* Timestamps */}
                          <div className="text-xs text-gray-500">
                            <span>Submitted: {new Date(report.createdAt).toLocaleDateString()}</span>
                            {report.approvedAt && (
                              <span className="ml-4">Approved: {new Date(report.approvedAt).toLocaleDateString()}</span>
                            )}
                            {report.rejectedAt && (
                              <span className="ml-4">Rejected: {new Date(report.rejectedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <button
                            onClick={() => openReportModal(report)}
                            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => openReportModal(report)}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span>Verification Page</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Report Details - Batch ID: {selectedReport.batchId}
                </h2>
                <button
                  onClick={closeReportModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Ingredients Report */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Ingredients Report
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Product:</span> {selectedReport.ingredientsReport?.productName || 'N/A'}</p>
                    <p><span className="font-medium">Manufacturer:</span> {selectedReport.ingredientsReport?.manufacturer || 'N/A'}</p>
                    <p><span className="font-medium">Manufacturing Date:</span> {selectedReport.ingredientsReport?.manufacturingDate || 'N/A'}</p>
                    <p><span className="font-medium">Expiry Date:</span> {selectedReport.ingredientsReport?.expiryDate || 'N/A'}</p>
                    <p><span className="font-medium">Ingredients:</span> {selectedReport.ingredientsReport?.ingredients || 'N/A'}</p>
                    <p><span className="font-medium">Allergens:</span> {selectedReport.ingredientsReport?.allergens || 'None'}</p>
                  </div>
                </div>

                {/* Test Process Report */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Test Process Report
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Test Date:</span> {selectedReport.testProcessReport?.testDate || 'N/A'}</p>
                    <p><span className="font-medium">Laboratory:</span> {selectedReport.testProcessReport?.laboratory || 'N/A'}</p>
                    <p><span className="font-medium">Test Methodology:</span> {selectedReport.testProcessReport?.testMethodology || 'N/A'}</p>
                    <p><span className="font-medium">Test Results:</span> {selectedReport.testProcessReport?.testResults || 'N/A'}</p>
                  </div>
                </div>

                {/* Authentication Report */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Authentication Report
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Certificates:</span> {selectedReport.authenticationReport?.certificates || 'N/A'}</p>
                    <p><span className="font-medium">Compliance Checks:</span> {selectedReport.authenticationReport?.complianceChecks || 'N/A'}</p>
                    <p><span className="font-medium">Audit Trail:</span> {selectedReport.authenticationReport?.auditTrail || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Status-specific Information */}
              {selectedReport.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Blockchain & IPFS Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium text-sm">SHA-256 Hash</span>
                      </div>
                      <p className="text-xs text-gray-600 break-all">
                        {selectedReport.sha256Hash || selectedReport.reportHash || 'Not available'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium text-sm">IPFS CID</span>
                      </div>
                      <p className="text-xs text-gray-600 break-all">
                        {selectedReport.ipfsCid || selectedReport.ipfsHash || 'Not available'}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium text-sm">Blockchain Transaction Hash</span>
                      </div>
                      <p className="text-xs text-gray-600 break-all">
                        {selectedReport.blockchainTxHash || 'Not available'}
                      </p>
                      {selectedReport.onBlockchain && (
                        <div className="mt-2 flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">Blockchain: Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedReport.status === 'rejected' && selectedReport.rejectionReason && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Rejection Reason
                  </h3>
                  <div className="bg-red-100 border border-red-300 p-3 rounded">
                    <p className="text-red-800 font-medium">{selectedReport.rejectionReason}</p>
                  </div>
                </div>
              )}

              {selectedReport.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Status: Pending
                  </h3>
                  <div className="bg-yellow-100 border border-yellow-300 p-3 rounded">
                    <p className="text-yellow-800">Your report is under review by admin. You will be notified once the review is complete.</p>
                  </div>
                </div>
              )}

              {/* Report Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Report Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Merchant:</span> {selectedReport.merchantWallet || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedReport.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedReport.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedReport.status === 'approved' ? '✅ Approved' :
                       selectedReport.status === 'rejected' ? '❌ Rejected' :
                       '⏳ Pending'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span> {new Date(selectedReport.createdAt).toLocaleString()}
                  </div>
                  {selectedReport.approvedAt && (
                    <div>
                      <span className="font-medium">Approved:</span> {new Date(selectedReport.approvedAt).toLocaleString()}
                    </div>
                  )}
                  {selectedReport.rejectedAt && (
                    <div>
                      <span className="font-medium">Rejected:</span> {new Date(selectedReport.rejectedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => navigate(`/verification/${selectedReport.batchId}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Verification Page
                </button>
                <button
                  onClick={closeReportModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}