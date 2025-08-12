import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  LogOut,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Clock,
  Activity,
  TrendingUp,
  FileText,
  UserCheck,
  UserX
} from 'lucide-react';

interface Merchant {
  _id: string;
  walletAddress: string;
  organization: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Complaint {
  _id: string;
  complaintId: string;
  batchId: string;
  complainant: {
    name: string;
    email: string;
    phone?: string;
  };
  complaintType: string;
  severity: string;
  description: string;
  symptoms?: string[];
  purchaseDetails?: {
    location?: string;
    date?: string;
    price?: number;
  };
  evidenceFiles?: any[];
  status: 'submitted' | 'open' | 'investigating' | 'resolved' | 'closed';
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface SystemStats {
  totalMerchants: number;
  pendingMerchants: number;
  approvedMerchants: number;
  rejectedMerchants: number;
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'merchants' | 'complaints' | 'reports' | 'verified-reports'>('overview');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [approvedReports, setApprovedReports] = useState<any[]>([]);

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Search and filter states
  const [merchantSearch, setMerchantSearch] = useState('');
  const [merchantFilter, setMerchantFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'submitted' | 'open' | 'investigating' | 'resolved' | 'closed'>('all');
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchStats();
    fetchMerchants();
    fetchComplaints();
    fetchPendingReports();
    fetchApprovedReports();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    console.log('Checking auth, token:', token);
    if (!token || token === 'null' || token === 'undefined') {
      console.log('No valid token found, redirecting to login');
      localStorage.removeItem('adminToken'); // Clean up invalid token
      navigate('/admin/login');
      return;
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token || token === 'null' || token === 'undefined') {
        navigate('/admin/login');
        return;
      }
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMerchants = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token || token === 'null' || token === 'undefined') {
        navigate('/admin/login');
        return;
      }
      const response = await fetch('/api/admin/merchants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMerchants(data.merchants);
      }
    } catch (error) {
      console.error('Error fetching merchants:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token || token === 'null' || token === 'undefined') {
        navigate('/admin/login');
        return;
      }
      const response = await fetch('/api/admin/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingReports = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token || token === 'null' || token === 'undefined') {
        navigate('/admin/login');
        return;
      }
      const response = await fetch('/api/admin/reports/combined/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Ensure data is always an array
        if (data.success && Array.isArray(data.reports)) {
          setPendingReports(data.reports);
        } else if (Array.isArray(data)) {
          setPendingReports(data);
        } else {
          setPendingReports([]);
        }
      } else {
        setPendingReports([]);
      }
    } catch (error) {
      console.error('Error fetching pending reports:', error);
      setPendingReports([]);
    }
  };

  const fetchApprovedReports = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token || token === 'null' || token === 'undefined') {
        navigate('/admin/login');
        return;
      }
      const response = await fetch('/api/admin/reports/combined/approved', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Ensure data is always an array
        if (data.success && Array.isArray(data.reports)) {
          setApprovedReports(data.reports);
        } else if (Array.isArray(data)) {
          setApprovedReports(data);
        } else {
          setApprovedReports([]);
        }
      } else {
        setApprovedReports([]);
      }
    } catch (error) {
      console.error('Error fetching approved reports:', error);
      setApprovedReports([]);
    }
  };

  const handleMerchantAction = async (merchantId: string, action: 'approve' | 'reject' | 'revoke') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/merchants/${merchantId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchMerchants();
        fetchStats();
      } else {
        setError(data.message || `Failed to ${action} merchant`);
      }
    } catch (error) {
      setError(`Network error occurred while trying to ${action} merchant`);
      console.error(`Error ${action}ing merchant:`, error);
    }
  };

  const handleComplaintStatusUpdate = async (complaintId: string, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/complaints/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchComplaints();
        fetchStats();
      } else {
        setError(data.message || 'Failed to update complaint status');
      }
    } catch (error) {
      setError('Network error occurred while updating complaint');
      console.error('Error updating complaint:', error);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      console.log(`=== Starting ${action} action for report ${reportId} ===`);
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('adminToken');
      console.log('Token check:', {
        exists: !!token,
        isNull: token === 'null',
        isUndefined: token === 'undefined',
        length: token?.length
      });
      
      if (!token || token === 'null' || token === 'undefined') {
        console.log('Invalid token, redirecting to login');
        setError('Authentication token is missing. Please log in again.');
        navigate('/admin/login');
        return;
      }

      const url = `/api/admin/reports/combined/${reportId}/${action}`;
      const requestBody = action === 'reject' ? { reason } : {};
      
      console.log(`Making ${action} request to:`, url);
      console.log('Request body:', requestBody);
      console.log('Token preview:', token.substring(0, 20) + '...');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        console.log(`✅ ${action} successful!`);
        if (action === 'approve') {
          // Extract blockchain data from nested response structure
          const sha256Hash = data.blockchain?.hash || data.sha256Hash || 'N/A';
          const ipfsCid = data.blockchain?.ipfsCid || data.ipfsCid || 'N/A';
          const blockchainTxHash = data.blockchain?.transactionHash || data.blockchainTxHash || 'N/A';
          setSuccessMessage(`Report approved successfully! SHA-256: ${sha256Hash}, IPFS CID: ${ipfsCid}, Blockchain TX: ${blockchainTxHash}`);
          console.log('Extracted values:', { sha256Hash, ipfsCid, blockchainTxHash });
          console.log('Full blockchain data:', data.blockchain);
        } else {
          setSuccessMessage(`Report rejected successfully. Reason: ${reason}`);
        }
        
        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
        
        // Refresh both pending and approved reports lists
        console.log('Refreshing pending reports...');
        await fetchPendingReports();
        console.log('Pending reports refreshed');
        
        console.log('Refreshing approved reports...');
        await fetchApprovedReports();
        console.log('Approved reports refreshed');
      } else {
        console.log(`❌ ${action} failed:`, { status: response.status, data });
        // Handle specific error cases
        if (response.status === 401 || response.status === 403) {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        } else {
          setError(data.message || `Failed to ${action} report. Please try again.`);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      setError(`Network error occurred while ${action}ing report. Please check your connection and try again.`);
    } finally {
      console.log(`=== Finished ${action} action ===`);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.organization.toLowerCase().includes(merchantSearch.toLowerCase()) ||
                         merchant.name.toLowerCase().includes(merchantSearch.toLowerCase()) ||
                         merchant.email.toLowerCase().includes(merchantSearch.toLowerCase());
    
    if (merchantFilter === 'all') return matchesSearch;
    return matchesSearch && merchant.status === merchantFilter;
  });

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.complaintId.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                         complaint.batchId.toLowerCase().includes(complaintSearch.toLowerCase()) ||
                         complaint.complainant.name.toLowerCase().includes(complaintSearch.toLowerCase());
    
    if (complaintFilter === 'all') return matchesSearch;
    return matchesSearch && complaint.status === complaintFilter;
  });

  const filteredReports = (pendingReports || []).filter(report => {
    const matchesSearch = !reportSearch || 
      report.batchId?.toLowerCase().includes(reportSearch.toLowerCase()) ||
      report.merchantId?.organizationName?.toLowerCase().includes(reportSearch.toLowerCase()) ||
      report.reportData?.ingredientsData?.productName?.toLowerCase().includes(reportSearch.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string, type: 'merchant' | 'complaint') => {
    const colors = {
      merchant: {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800'
      },
      complaint: {
        submitted: 'bg-blue-100 text-blue-800',
        open: 'bg-red-100 text-red-800',
        investigating: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800'
      }
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[type][status as keyof typeof colors[typeof type]]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">System Administration</p>
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
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-600 hover:text-red-800 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-700">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-sm text-green-600 hover:text-green-800 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'merchants', label: 'Merchants', icon: Users },
              { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'verified-reports', label: 'Verified Reports', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
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
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Merchants</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalMerchants}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.pendingMerchants}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalComplaints}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Open Complaints</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.openComplaints}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Merchant Management</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {stats.pendingMerchants} merchants waiting for approval
                  </p>
                  <button
                    onClick={() => setActiveTab('merchants')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Review Merchants →
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Complaint Review</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {stats.openComplaints} open complaints need attention
                  </p>
                  <button
                    onClick={() => setActiveTab('complaints')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Review Complaints →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Merchants Tab */}
        {activeTab === 'merchants' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search merchants..."
                      value={merchantSearch}
                      onChange={(e) => setMerchantSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={merchantFilter}
                    onChange={(e) => setMerchantFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Merchants List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Merchants ({filteredMerchants.length})</h3>
              </div>
              
              {filteredMerchants.length === 0 ? (
                <div className="p-6 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No merchants found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredMerchants.map((merchant) => (
                    <div key={merchant._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{merchant.organization}</h4>
                              <p className="text-sm text-gray-600">{merchant.name}</p>
                              <p className="text-xs text-gray-500">{merchant.email}</p>
                              <p className="text-xs text-gray-500">{merchant.walletAddress}</p>
                            </div>
                            {getStatusBadge(merchant.status, 'merchant')}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Registered: {new Date(merchant.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {merchant.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleMerchantAction(merchant._id, 'approve')}
                                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Check className="h-4 w-4" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleMerchantAction(merchant._id, 'reject')}
                                className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <X className="h-4 w-4" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {merchant.status === 'approved' && (
                            <button
                              onClick={() => handleMerchantAction(merchant._id, 'revoke')}
                              className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <UserX className="h-4 w-4" />
                              <span>Revoke</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={complaintSearch}
                      onChange={(e) => setComplaintSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={complaintFilter}
                    onChange={(e) => setComplaintFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Complaints ({filteredComplaints.length})</h3>
              </div>
              
              {filteredComplaints.length === 0 ? (
                <div className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No complaints found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredComplaints.map((complaint) => (
                    <div key={complaint._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{complaint.complaintId}</h4>
                            {getStatusBadge(complaint.status, 'complaint')}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600"><strong>Batch ID:</strong> {complaint.batchId}</p>
                            <p className="text-sm text-gray-600"><strong>Issue Type:</strong> {complaint.complaintType}</p>
                            <p className="text-sm text-gray-600"><strong>Severity:</strong> {complaint.severity}</p>
                            <p className="text-sm text-gray-600"><strong>Complainant:</strong> {complaint.complainant.name} ({complaint.complainant.email})</p>
                            <p className="text-sm text-gray-600"><strong>Description:</strong> {complaint.description}</p>
                            <p className="text-xs text-gray-500">Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <select
                            value={complaint.status}
                            onChange={(e) => handleComplaintStatusUpdate(complaint._id, e.target.value)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            <option value="submitted">Submitted</option>
                            <option value="open">Open</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          <button
                            onClick={() => navigate(`/verification/${complaint.batchId}`)}
                            className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Batch</span>
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

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reports by batch ID or merchant..."
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              {filteredReports.map((report) => (
                <div key={report._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  {/* Report Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Batch ID: {report.batchId}</h3>
                        <p className="text-sm text-gray-600">
                          Merchant: {report.merchantId?.organizationName || 'Unknown'} | 
                          Submitted: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                        <div className="space-x-2">
                          <button
                            onClick={() => {
                              console.log('Approve button clicked for report:', report._id);
                              handleReportAction(report._id, 'approve');
                            }}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                              isLoading 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReportId(report._id);
                              setShowRejectModal(true);
                            }}
                            disabled={isLoading}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                              isLoading 
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Content - All 3 Sections */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Ingredients Section */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3">📋 Ingredients Report</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Product Name:</strong> {report.ingredientsReport?.productName || 'N/A'}</div>
                          <div><strong>Manufacturer:</strong> {report.ingredientsReport?.manufacturer || 'N/A'}</div>
                          <div><strong>Manufacturing Date:</strong> {report.ingredientsReport?.manufacturingDate || 'N/A'}</div>
                          <div><strong>Expiry Date:</strong> {report.ingredientsReport?.expiryDate || 'N/A'}</div>
                          <div><strong>Ingredients:</strong> {report.ingredientsReport?.ingredients || 'N/A'}</div>
                          <div><strong>Allergens:</strong> {report.ingredientsReport?.allergens || 'None'}</div>
                        </div>
                      </div>

                      {/* Test Process Section */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">🧪 Test Process Report</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Test Date:</strong> {report.testProcessReport?.testDate || 'N/A'}</div>
                           <div><strong>Laboratory:</strong> {report.testProcessReport?.testingLaboratory || 'N/A'}</div>
                           <div><strong>Test Methodology:</strong> {report.testProcessReport?.testMethodology || 'N/A'}</div>
                           <div><strong>Test Results:</strong> {report.testProcessReport?.testResults || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Authentication Section */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-3">🔐 Authentication Report</h4>
                        <div className="space-y-2 text-sm">
                          <div><strong>Certificates:</strong> {report.authenticationReport?.certificates || 'N/A'}</div>
                          <div><strong>Compliance Checks:</strong> {report.authenticationReport?.complianceChecks || 'N/A'}</div>
                          <div><strong>Audit Trail:</strong> {report.authenticationReport?.auditTrail || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredReports.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No pending combined reports found.
              </div>
            )}
          </div>
        )}

        {/* Verified Reports Tab */}
        {activeTab === 'verified-reports' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search verified reports by batch ID or merchant..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Reports List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Verified Reports ({approvedReports.length})</h3>
              </div>
              
              {approvedReports.length === 0 ? (
                <div className="p-6 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No verified reports found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {approvedReports.map((report) => (
                    <div key={report._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">Batch ID: {report.batchId}</h4>
                              <p className="text-sm text-gray-600">
                                Merchant: {report.merchantId?.organizationName || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Submitted: {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                              ✅ Approved
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowDetailModal(true);
                            }}
                            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
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

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reject Report</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedReportId('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please provide a reason for rejection:
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  placeholder="Enter rejection reason..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedReportId('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      handleReportAction(selectedReportId, 'reject', rejectionReason);
                      setShowRejectModal(false);
                      setRejectionReason('');
                      setSelectedReportId('');
                    }
                  }}
                  disabled={!rejectionReason.trim() || isLoading}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    !rejectionReason.trim() || isLoading
                      ? 'bg-red-300 text-red-100 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      <span>Reject Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal for Verified Reports */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Report Details - Batch ID: {selectedReport.batchId}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                {/* Report Content - All 3 Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Ingredients Section */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">🧾 Ingredients Report</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Product Name:</strong> {selectedReport.ingredientsReport?.productName || 'N/A'}</div>
                      <div><strong>Manufacturer:</strong> {selectedReport.ingredientsReport?.manufacturer || 'N/A'}</div>
                      <div><strong>Manufacturing Date:</strong> {selectedReport.ingredientsReport?.manufacturingDate || 'N/A'}</div>
                      <div><strong>Expiry Date:</strong> {selectedReport.ingredientsReport?.expiryDate || 'N/A'}</div>
                      <div><strong>Ingredients:</strong> {selectedReport.ingredientsReport?.ingredients || 'N/A'}</div>
                      <div><strong>Allergens:</strong> {selectedReport.ingredientsReport?.allergens || 'None'}</div>
                    </div>
                  </div>

                  {/* Test Process Section */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3">🔬 Test Process Report</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Test Date:</strong> {selectedReport.testProcessReport?.testDate || 'N/A'}</div>
                      <div><strong>Laboratory:</strong> {selectedReport.testProcessReport?.testingLaboratory || 'N/A'}</div>
                      <div><strong>Test Methodology:</strong> {selectedReport.testProcessReport?.testMethodology || 'N/A'}</div>
                      <div><strong>Test Results:</strong> {selectedReport.testProcessReport?.testResults || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Authentication Section */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-3">🔐 Authentication Report</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Certificates:</strong> {selectedReport.authenticationReport?.certificates || 'N/A'}</div>
                      <div><strong>Compliance Checks:</strong> {selectedReport.authenticationReport?.complianceChecks || 'N/A'}</div>
                      <div><strong>Audit Trail:</strong> {selectedReport.authenticationReport?.auditTrail || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">🔗 Blockchain & IPFS Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-2">✅ SHA-256 Hash</h5>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {selectedReport.sha256Hash || 'Not available'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-2">✅ IPFS CID</h5>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {selectedReport.ipfsCid || 'Not available'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-2">✅ Blockchain Transaction Hash</h5>
                      <p className="text-sm text-gray-600 font-mono break-all">
                        {selectedReport.blockchainTxHash || 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="mt-6 bg-white border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">📋 Report Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Merchant:</strong> {selectedReport.merchantId?.organizationName || 'Unknown'}</div>
                    <div><strong>Status:</strong> <span className="text-green-600 font-medium">✅ Approved</span></div>
                    <div><strong>Submitted:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</div>
                    <div><strong>Approved:</strong> {selectedReport.approvedAt ? new Date(selectedReport.approvedAt).toLocaleString() : 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}