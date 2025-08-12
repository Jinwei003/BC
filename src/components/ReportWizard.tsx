import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

interface IngredientsData {
  productName: string;
  manufacturer: string;
  manufacturingDate: string;
  expiryDate: string;
  ingredients: string;
  nutritionalInfo: string;
  allergens: string;
  certifications: string;
}

interface TestProcessData {
  testingLaboratory: string;
  testDate: string;
  testResults: string;
  testMethodology: string;
}

interface AuthenticationData {
  certificates: string;
  complianceChecks: string;
  auditTrail: string;
}

interface ReportWizardProps {
  onSubmit: (data: {
    batchId: string;
    ingredientsData: IngredientsData;
    testProcessData: TestProcessData;
    authenticationData: AuthenticationData;
  }) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const steps: WizardStep[] = [
  {
    id: 1,
    title: 'Ingredients Report',
    description: 'Product details and ingredient information'
  },
  {
    id: 2,
    title: 'Test Process Report',
    description: 'Laboratory testing and quality assurance'
  },
  {
    id: 3,
    title: 'Authentication Report',
    description: 'Certificates and compliance verification'
  },
  {
    id: 4,
    title: 'Review & Submit',
    description: 'Review all information before submission'
  }
];

export default function ReportWizard({ onSubmit, isLoading, onCancel }: ReportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [batchId, setBatchId] = useState('');
  const [ingredientsData, setIngredientsData] = useState<IngredientsData>({
    productName: '',
    manufacturer: '',
    manufacturingDate: '',
    expiryDate: '',
    ingredients: '',
    nutritionalInfo: '',
    allergens: '',
    certifications: ''
  });
  const [testProcessData, setTestProcessData] = useState<TestProcessData>({
    testingLaboratory: '',
    testDate: '',
    testResults: '',
    testMethodology: ''
  });
  const [authenticationData, setAuthenticationData] = useState<AuthenticationData>({
    certificates: '',
    complianceChecks: '',
    auditTrail: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!batchId.trim()) newErrors.batchId = 'Batch ID is required';
      if (!ingredientsData.productName.trim()) newErrors.productName = 'Product name is required';
      if (!ingredientsData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
      if (!ingredientsData.manufacturingDate) newErrors.manufacturingDate = 'Manufacturing date is required';
      if (!ingredientsData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    } else if (step === 2) {
      if (!testProcessData.testingLaboratory.trim()) newErrors.testingLaboratory = 'Testing laboratory is required';
      if (!testProcessData.testDate) newErrors.testDate = 'Test date is required';
      if (!testProcessData.testResults.trim()) newErrors.testResults = 'Test results are required';
    } else if (step === 3) {
      if (!authenticationData.certificates.trim()) newErrors.certificates = 'Certificates are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(3)) {
      onSubmit({
        batchId,
        ingredientsData,
        testProcessData,
        authenticationData
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep > step.id
                ? 'bg-green-500 text-white'
                : currentStep === step.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
            </div>
            <div className="mt-2 text-center">
              <div className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500 max-w-24">
                {step.description}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ingredients Report</h2>
        <p className="text-gray-600 mt-2">Enter product details and ingredient information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch ID *
          </label>
          <input
            type="text"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.batchId ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter batch ID"
          />
          {errors.batchId && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.batchId}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={ingredientsData.productName}
            onChange={(e) => setIngredientsData(prev => ({ ...prev, productName: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.productName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter product name"
          />
          {errors.productName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.productName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer *
          </label>
          <input
            type="text"
            value={ingredientsData.manufacturer}
            onChange={(e) => setIngredientsData(prev => ({ ...prev, manufacturer: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.manufacturer ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter manufacturer name"
          />
          {errors.manufacturer && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.manufacturer}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturing Date *
          </label>
          <input
            type="date"
            value={ingredientsData.manufacturingDate}
            onChange={(e) => setIngredientsData(prev => ({ ...prev, manufacturingDate: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.manufacturingDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.manufacturingDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.manufacturingDate}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date *
          </label>
          <input
            type="date"
            value={ingredientsData.expiryDate}
            onChange={(e) => setIngredientsData(prev => ({ ...prev, expiryDate: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.expiryDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.expiryDate}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients
          </label>
          <textarea
            value={ingredientsData.ingredients}
            onChange={(e) => setIngredientsData(prev => ({ ...prev, ingredients: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter ingredients information"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nutritional Information
          </label>
          <textarea
            value={ingredientsData.nutritionalInfo}
            onChange={(e) => setIngredientsData(prev => ({ ...prev, nutritionalInfo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter nutritional information"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergens
          </label>
          <input
            type="text"
            value={ingredientsData.allergens}
            onChange={(e) => setIngredientsData(prev => ({ ...prev, allergens: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter allergen information"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certifications
          </label>
          <textarea
            value={ingredientsData.certifications}
            onChange={(e) => setIngredientsData(prev => ({ ...prev, certifications: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter certification information"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Test Process Report</h2>
        <p className="text-gray-600 mt-2">Enter laboratory testing and quality assurance information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Testing Laboratory *
          </label>
          <input
            type="text"
            value={testProcessData.testingLaboratory}
            onChange={(e) => setTestProcessData(prev => ({ ...prev, testingLaboratory: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.testingLaboratory ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter testing laboratory name"
          />
          {errors.testingLaboratory && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.testingLaboratory}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Date *
          </label>
          <input
            type="date"
            value={testProcessData.testDate}
            onChange={(e) => setTestProcessData(prev => ({ ...prev, testDate: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.testDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.testDate && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.testDate}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Results *
          </label>
          <textarea
            value={testProcessData.testResults}
            onChange={(e) => setTestProcessData(prev => ({ ...prev, testResults: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.testResults ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="Enter detailed test results"
          />
          {errors.testResults && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.testResults}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Methodology
          </label>
          <textarea
            value={testProcessData.testMethodology}
            onChange={(e) => setTestProcessData(prev => ({ ...prev, testMethodology: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter test methodology and procedures"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Authentication Report</h2>
        <p className="text-gray-600 mt-2">Enter certificates and compliance verification information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificates *
          </label>
          <textarea
            value={authenticationData.certificates}
            onChange={(e) => setAuthenticationData(prev => ({ ...prev, certificates: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.certificates ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="Enter certificate information"
          />
          {errors.certificates && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.certificates}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compliance Checks
          </label>
          <textarea
            value={authenticationData.complianceChecks}
            onChange={(e) => setAuthenticationData(prev => ({ ...prev, complianceChecks: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter compliance check information"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audit Trail
          </label>
          <textarea
            value={authenticationData.auditTrail}
            onChange={(e) => setAuthenticationData(prev => ({ ...prev, auditTrail: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Enter audit trail information"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>
        <p className="text-gray-600 mt-2">Please review all information before submitting</p>
      </div>

      <div className="space-y-6">
        {/* Ingredients Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients Report</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Batch ID:</span> {batchId}</div>
            <div><span className="font-medium">Product Name:</span> {ingredientsData.productName}</div>
            <div><span className="font-medium">Manufacturer:</span> {ingredientsData.manufacturer}</div>
            <div><span className="font-medium">Manufacturing Date:</span> {ingredientsData.manufacturingDate}</div>
            <div><span className="font-medium">Expiry Date:</span> {ingredientsData.expiryDate}</div>
          </div>
        </div>

        {/* Test Process Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Process Report</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Testing Laboratory:</span> {testProcessData.testingLaboratory}</div>
            <div><span className="font-medium">Test Date:</span> {testProcessData.testDate}</div>
          </div>
        </div>

        {/* Authentication Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication Report</h3>
          <div className="text-sm">
            <div><span className="font-medium">Certificates:</span> {authenticationData.certificates ? 'Provided' : 'Not provided'}</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Important Notice</h4>
              <p className="text-sm text-blue-700 mt-1">
                By submitting this report, you confirm that all information provided is accurate and complete. 
                Your report will be pending admin approval before being recorded on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderStepIndicator()}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {renderCurrentStep()}
        
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}