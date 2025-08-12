import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Wallet, AlertCircle, CheckCircle, ArrowLeft, Building, Mail, Phone, MapPin } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface FormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  businessLicense: string;
  description: string;
}

export default function MerchantRegister() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    businessLicense: '',
    description: '',
  });

  useEffect(() => {
    // Check if MetaMask is installed
    setIsMetaMaskInstalled(typeof window.ethereum !== 'undefined');
    
    // Don't auto-connect - let users manually choose their wallet
  }, []);

  // Removed auto-connection logic to allow manual wallet selection

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Please connect your wallet to continue.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Only validate fields that the backend actually requires
    if (!formData.companyName || !formData.contactPerson || !formData.email) {
      setError('All fields are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!walletAddress) {
      setError('Please connect your MetaMask wallet');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create a message to sign for verification
      const message = `Register merchant account for ProteinVerify\nCompany: ${formData.companyName}\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
      
      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      // Send registration request to backend
      const response = await fetch('/api/auth/merchant/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.contactPerson,        // Map contactPerson to name
          organization: formData.companyName,  // Map companyName to organization
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          businessLicense: formData.businessLicense,
          description: formData.description,
          walletAddress,
          signature,
          message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration successful! Your application is pending admin approval. You will be notified once approved.');
        // Reset form
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          businessLicense: '',
          description: '',
        });
        setWalletAddress(null);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Please sign the message to complete registration.');
      } else {
        setError('Failed to complete registration. Please try again.');
      }
      console.error('Error during registration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setError(null);
  };

  const switchWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError('MetaMask is not installed.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Use wallet_requestPermissions to force MetaMask to show account selector
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });

      // After permissions are granted, get the selected accounts
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        setError('No accounts found. Please make sure MetaMask is unlocked.');
      }
    } catch (error: any) {
      console.error('Error switching wallet:', error);
      if (error.code === 4001) {
        setError('Wallet switching was cancelled.');
      } else if (error.code === -32002) {
        setError('A wallet connection request is already pending. Please check MetaMask.');
      } else {
        setError('Failed to switch wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Merchant Registration</h2>
            <p className="text-gray-600">
              Register your company to start uploading protein powder verification reports
            </p>
          </div>

          {/* MetaMask Installation Check */}
          {!isMetaMaskInstalled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">
                    MetaMask Required
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    You need MetaMask installed to register as a merchant.
                  </p>
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Install MetaMask →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 mb-1">Success!</h3>
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Connection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Connect Your Wallet</h3>
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting || !isMetaMaskInstalled}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect MetaMask
                  </div>
                )}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800 mb-1">
                      Wallet Connected
                    </h4>
                    <p className="text-sm text-green-700 font-mono break-all mb-3">
                      {walletAddress}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={switchWallet}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Switch Wallet
                      </button>
                      <button
                        onClick={disconnectWallet}
                        className="text-sm text-green-800 hover:text-green-900 underline"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">2. Company Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your Company Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full Name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contact@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Business Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Complete business address"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-2">
                Business License Number *
              </label>
              <input
                type="text"
                id="businessLicense"
                name="businessLicense"
                value={formData.businessLicense}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Business registration/license number"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your business and products (optional)"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !walletAddress}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  'Register & Sign Message'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/merchant/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Login here
              </Link>
            </p>
          </div>

          {/* Process Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Registration Process:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Connect your MetaMask wallet</li>
              <li>2. Fill out company information</li>
              <li>3. Sign verification message</li>
              <li>4. Wait for admin approval</li>
              <li>5. Start uploading verification reports</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}