import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Wallet, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function MerchantLogin() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
      // Request account access - this will show MetaMask's account selector
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

  const signMessage = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first.');
      return;
    }

    setIsLoggingIn(true);
    setError(null);

    try {
      // Create a message to sign
      const message = `Login to ProteinVerify as merchant\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
      
      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      // Send login request to backend
      const response = await fetch('/api/auth/merchant/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          message,
          signature,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('merchantToken', data.token);
        localStorage.setItem('merchantWallet', walletAddress);
        
        // Navigate to merchant dashboard
        navigate('/merchant/dashboard');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Please sign the message to login.');
      } else {
        setError('Failed to sign message. Please try again.');
      }
      console.error('Error signing message:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setError(null);
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

      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Merchant Login</h2>
            <p className="text-gray-600">
              Connect your MetaMask wallet to access the merchant dashboard
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
                    You need MetaMask installed to login as a merchant.
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

          {/* Wallet Connection Status */}
          {walletAddress && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-800 mb-1">
                    Wallet Connected
                  </h3>
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

          {/* Action Buttons */}
          <div className="space-y-4">
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
              <button
                onClick={signMessage}
                disabled={isLoggingIn}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign Message & Login'
                )}
              </button>
            )}
          </div>

          {/* Registration Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have a merchant account?{' '}
              <Link
                to="/merchant/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">How it works:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Connect your MetaMask wallet</li>
              <li>2. Sign a message to verify ownership</li>
              <li>3. Access your merchant dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}