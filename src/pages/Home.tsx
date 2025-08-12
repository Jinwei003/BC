import { useState } from 'react';
import { Search, Shield, Users, FileCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [batchId, setBatchId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleBatchVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim()) return;
    
    setIsVerifying(true);
    // Navigate to verification results page
    navigate(`/verify/${batchId.trim()}`);
  };

  const handleMerchantLogin = () => {
    navigate('/merchant/login');
  };

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ProteinVerify</h1>
            </div>
            <nav className="flex space-x-6">
              <button 
                onClick={() => navigate('/about')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                About
              </button>
              <button 
                onClick={() => navigate('/help')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Help
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Blockchain-Powered Protein Powder Verification
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Ensure the authenticity and quality of your protein powder with our comprehensive 
            verification system powered by blockchain technology and IPFS storage.
          </p>

          {/* Main Verification Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <div className="flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-semibold text-gray-900">Verify Your Product</h3>
            </div>
            
            <form onSubmit={handleBatchVerification} className="max-w-md mx-auto">
              <div className="mb-6">
                <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Batch ID
                </label>
                <input
                  type="text"
                  id="batchId"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="e.g., BATCH-2024-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isVerifying || !batchId.trim()}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Verify Product'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ProteinVerify?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Blockchain Security</h4>
              <p className="text-gray-600">
                Immutable records stored on blockchain ensure data integrity and prevent tampering.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Complete Traceability</h4>
              <p className="text-gray-600">
                Track ingredients, testing processes, and certifications from source to shelf.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Quality Assurance</h4>
              <p className="text-gray-600">
                Comprehensive testing and certification data to ensure product quality and safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Access Portals */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Access Portals
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Merchant Portal */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 mx-auto">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-2xl font-semibold text-gray-900 text-center mb-4">
                Merchant Portal
              </h4>
              <p className="text-gray-600 text-center mb-6">
                Upload product reports, manage batches, and maintain compliance records.
              </p>
              <button
                onClick={handleMerchantLogin}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Connect with MetaMask
              </button>
            </div>

            {/* Admin Portal */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6 mx-auto">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="text-2xl font-semibold text-gray-900 text-center mb-4">
                Admin Portal
              </h4>
              <p className="text-gray-600 text-center mb-6">
                Manage merchants, review complaints, and monitor system activities.
              </p>
              <button
                onClick={handleAdminLogin}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Report Issues Section */}
      <section className="py-16 bg-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6 mx-auto">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Found an Issue?
          </h3>
          <p className="text-gray-600 mb-6">
            Report quality concerns, adverse reactions, or other issues with verified products.
          </p>
          <button
            onClick={() => navigate('/report-issue')}
            className="bg-yellow-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
          >
            Report an Issue
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">ProteinVerify</span>
              </div>
              <p className="text-gray-400">
                Ensuring protein powder authenticity through blockchain technology.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How it Works</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ProteinVerify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}