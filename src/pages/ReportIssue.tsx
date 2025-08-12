import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ReportIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    batchId: '',
    complainantName: '',
    complainantEmail: '',
    complainantPhone: '',
    complaintType: '',
    severity: '',
    description: '',
    symptoms: '',
    purchaseLocation: '',
    purchaseDate: '',
    purchasePrice: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [batchValidation, setBatchValidation] = useState<{
    isValidating: boolean;
    isValid: boolean;
    message: string;
    batchInfo: any;
  }>({ isValidating: false, isValid: false, message: '', batchInfo: null });

  const complaintTypes = [
    { value: 'quality', label: 'Quality Issue' },
    { value: 'safety', label: 'Safety Concern' },
    { value: 'labeling', label: 'Labeling Problem' },
    { value: 'contamination', label: 'Contamination' },
    { value: 'adverse_reaction', label: 'Adverse Reaction' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const validateBatch = async (batchId: string) => {
    if (!batchId.trim()) {
      setBatchValidation({ isValidating: false, isValid: false, message: '', batchInfo: null });
      return;
    }

    setBatchValidation(prev => ({ ...prev, isValidating: true, message: '' }));

    try {
      const response = await fetch(`/api/verification/validate-batch/${batchId}`);
      const data = await response.json();

      if (data.success) {
        setBatchValidation({
          isValidating: false,
          isValid: true,
          message: `✅ Batch validated: ${data.batch.productName} by ${data.batch.manufacturer}`,
          batchInfo: data.batch
        });
      } else {
        setBatchValidation({
          isValidating: false,
          isValid: false,
          message: `❌ ${data.message}`,
          batchInfo: null
        });
      }
    } catch (error) {
      setBatchValidation({
        isValidating: false,
        isValid: false,
        message: '❌ Error validating batch. Please try again.',
        batchInfo: null
      });
    }
  };

  const handleBatchIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, batchId: value }));
    
    // Reset validation state when user types
    if (value !== formData.batchId) {
      setBatchValidation(prev => ({ ...prev, isValid: false, message: '' }));
    }
  };

  // Debounce batch validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.batchId.trim()) {
        validateBatch(formData.batchId);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.batchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Check if batch is validated
    if (!batchValidation.isValid) {
      setError('Please enter a valid and approved Batch ID before submitting.');
      return;
    }

    // Basic form validation
    if (!formData.complainantName || !formData.complainantEmail || !formData.complaintType || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Map form data to backend structure
      const submitData = {
        ...formData,
        purchaseDetails: {
          retailer: formData.purchaseLocation,
          purchaseDate: formData.purchaseDate,
          price: formData.purchasePrice
        }
      };
      
      // Remove the flat purchase fields
      delete submitData.purchaseLocation;
      delete submitData.purchaseDate;
      delete submitData.purchasePrice;

      const response = await fetch('/api/verification/complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Your complaint has been submitted successfully!');
        setComplaintId(data.complaintId);
        setFormData({
          batchId: '',
          complainantName: '',
          complainantEmail: '',
          complainantPhone: '',
          complaintType: '',
          severity: '',
          description: '',
          symptoms: '',
          purchaseLocation: '',
          purchaseDate: '',
          purchasePrice: ''
        });
      } else {
        setError(data.message || 'Failed to submit complaint. Please try again.');
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
      console.error('Complaint submission error:', error);
    } finally {
      setIsLoading(false);
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

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h2>
            <p className="text-gray-600">
              Help us maintain product quality and safety by reporting any issues you've encountered
            </p>
          </div>

          {/* Success Message */}
          {success && complaintId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Complaint Submitted Successfully!</h3>
                  <p className="text-sm text-green-700 mb-3">{success}</p>
                  <div className="bg-green-100 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-green-800">Your Complaint ID:</p>
                    <p className="text-lg font-bold text-green-900">{complaintId}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Please save this ID for tracking your complaint status
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setSuccess(null);
                        setComplaintId(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Submit Another Report
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Return to Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Report Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Batch ID */}
              <div>
                <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-2">
                  Batch ID *
                </label>
                <input
                  type="text"
                  id="batchId"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleBatchIdChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    batchValidation.isValid ? 'border-green-300 bg-green-50' : 
                    batchValidation.message && !batchValidation.isValid ? 'border-red-300 bg-red-50' : 
                    'border-gray-300'
                  }`}
                  placeholder="Enter the batch ID from the product"
                  required
                />
                
                {/* Validation Status */}
                {batchValidation.isValidating && (
                  <p className="text-sm text-blue-600 mt-1 flex items-center">
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></span>
                    Validating batch...
                  </p>
                )}
                
                {batchValidation.message && !batchValidation.isValidating && (
                  <p className={`text-sm mt-1 ${
                    batchValidation.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {batchValidation.message}
                  </p>
                )}
                
                {!batchValidation.message && (
                  <p className="text-sm text-gray-500 mt-1">
                    You can find the batch ID on the product packaging or verification page
                  </p>
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="complainantName" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="complainantName"
                    name="complainantName"
                    value={formData.complainantName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="complainantEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="complainantEmail"
                    name="complainantEmail"
                    value={formData.complainantEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="complainantPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="complainantPhone"
                  name="complainantPhone"
                  value={formData.complainantPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Complaint Type and Severity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="complaintType" className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Type *
                  </label>
                  <select
                    id="complaintType"
                    name="complaintType"
                    value={formData.complaintType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Select an issue type</option>
                    {complaintTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select severity (optional)</option>
                    {severityLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a detailed description of the issue, including when it occurred and any other relevant information..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The more details you provide, the better we can investigate and resolve the issue
                </p>
              </div>

              {/* Symptoms */}
              <div>
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms Experienced (Optional)
                </label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="If applicable, describe any symptoms experienced (separate multiple symptoms with commas)..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  For adverse reactions, please provide detailed symptom information
                </p>
              </div>

              {/* Purchase Details */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Purchase Information (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="purchaseLocation" className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Location
                    </label>
                    <input
                      type="text"
                      id="purchaseLocation"
                      name="purchaseLocation"
                      value={formData.purchaseLocation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Store name or location"
                    />
                  </div>
                  <div>
                    <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      id="purchaseDate"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="purchasePrice"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>



              {/* Privacy Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Privacy Notice</h4>
                <p className="text-sm text-blue-700">
                  Your personal information will be used solely for investigating this complaint. 
                  We may contact you for additional information or to provide updates on the investigation.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !batchValidation.isValid || batchValidation.isValidating}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Report...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Submit Report
                  </div>
                )}
              </button>
            </form>
          )}

          {/* Help Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• For urgent safety concerns, contact emergency services immediately</p>
              <p>• For general inquiries, email us at support@proteinverify.com</p>
              <p>• You can track your complaint status using the complaint ID provided</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}