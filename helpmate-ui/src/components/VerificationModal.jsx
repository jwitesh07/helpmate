// src/components/VerificationModal.jsx

import React, { useState, useCallback, useMemo } from 'react';

const CheckCircleIcon = () => (
    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
);

const UploadIcon = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


const FileUploadArea = ({ type, file, setFile, onToast }) => {
    const fileInputId = `modal${type}File`;
    const fileNameId = `modal${type}FileName`;

    const handleFileUpload = useCallback((uploadedFile) => {
        if (uploadedFile.size > 10 * 1024 * 1024) {
            onToast('File size must be less than 10MB');
            return;
        }
        setFile(uploadedFile);
        onToast('File uploaded successfully!');
    }, [setFile, onToast]);

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    };

    return (
        <div 
            onClick={() => document.getElementById(fileInputId).click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove('dragover'); }}
            onDrop={handleDrop}
            className="upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
        >
            <UploadIcon />
            <div className="mt-4">
                <p className="text-sm text-gray-600">
                    <span className="font-medium text-emerald-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
            <input type="file" id={fileInputId} className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleChange} />
            {file && (
                <div className="mt-4">
                    <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md justify-center">
                        <CheckCircleIcon /><span id={fileNameId} className="text-sm text-green-800 ml-2">{file.name}</span>
                    </div>
                </div>
            )}
        </div>
    );
};


const VerificationModal = ({ show, onClose, onVerificationSuccess, onToast }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [aadhaarFile, setAadhaarFile] = useState(null);
    const [panFile, setPanFile] = useState(null);
    
    const totalSteps = 3;
    const progressPercentage = useMemo(() => (currentStep / totalSteps) * 100, [currentStep]);

    if (!show) return null;

    const handleAadhaarSubmit = (e) => {
        e.preventDefault();
        const aadhaarNumber = e.target.modalAadhaarNumber.value;
        if (aadhaarNumber.length !== 12 || !aadhaarFile) {
            onToast(aadhaarNumber.length !== 12 ? 'Invalid Aadhaar number' : 'Please upload your Aadhaar card');
            return;
        }
        onToast('Aadhaar submitted successfully!');
        setTimeout(() => setCurrentStep(2), 500);
    };

    const handlePanSubmit = (e) => {
        e.preventDefault();
        const panNumber = e.target.modalPanNumber.value;
        if (panNumber.length !== 10 || !panFile) {
            onToast(panNumber.length !== 10 ? 'Invalid PAN number' : 'Please upload your PAN card');
            return;
        }
        onToast('PAN submitted successfully!');
        setTimeout(() => setCurrentStep(3), 500);
    };

    const handleComplete = () => {
        onVerificationSuccess(); // Triggers global state update
        onToast('Verification complete! You can now post and accept tasks.');
    };

    // Reset state when closing the modal for a fresh start next time
    const handleClose = () => {
        setCurrentStep(1);
        setAadhaarFile(null);
        setPanFile(null);
        onClose();
    };

    return (
        <div id="verificationModal" className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircleIcon />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Document Verification</h2>
                                <p className="text-gray-600">Complete your identity verification</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    {/* Modal Content */}
                    <div className="p-6">
                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-2">
                                <span>Verification Progress</span> <span id="modalProgressText">Step {currentStep} of {totalSteps}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="progress-bar bg-emerald-600 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>

                        {/* Step 1: Aadhaar Verification */}
                        <div id="modalAadhaarStep" className={`verification-step ${currentStep === 1 ? 'active' : ''}`}>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">🆔</div>
                                <h3 className="text-xl font-semibold text-gray-900">Aadhaar Card Verification</h3>
                                <p className="text-gray-600 mt-2">Upload a clear photo of your Aadhaar card</p>
                            </div>
                            <form onSubmit={handleAadhaarSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="modalAadhaarNumber" className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                                    <input 
                                        id="modalAadhaarNumber" 
                                        name="modalAadhaarNumber" 
                                        type="text" 
                                        maxLength="12" 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" 
                                        placeholder="Enter 12-digit Aadhaar number"
                                        onChange={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter your 12-digit Aadhaar number without spaces</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Aadhaar Card</label>
                                    <FileUploadArea type="Aadhaar" file={aadhaarFile} setFile={setAadhaarFile} onToast={onToast} />
                                </div>
                                <button type="submit" className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors font-medium"> Verify Aadhaar &amp; Continue </button>
                            </form>
                        </div>

                        {/* Step 2: PAN Card Verification */}
                        <div id="modalPanStep" className={`verification-step ${currentStep === 2 ? 'active' : ''}`}>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">💳</div>
                                <h3 className="text-xl font-semibold text-gray-900">PAN Card Verification</h3>
                                <p className="text-gray-600 mt-2">Upload a clear photo of your PAN card</p>
                            </div>
                            <form onSubmit={handlePanSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="modalPanNumber" className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                                    <input 
                                        id="modalPanNumber" 
                                        name="modalPanNumber" 
                                        type="text" 
                                        maxLength="10" 
                                        required 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 uppercase" 
                                        placeholder="ABCDE1234F"
                                        onChange={(e) => e.target.value = e.target.value.toUpperCase()}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter your 10-character PAN number</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload PAN Card</label>
                                    <FileUploadArea type="Pan" file={panFile} setFile={setPanFile} onToast={onToast} />
                                </div>
                                <div className="flex space-x-4">
                                    <button type="button" onClick={() => setCurrentStep(1)} className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"> Back </button> 
                                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors font-medium"> Verify PAN &amp; Continue </button>
                                </div>
                            </form>
                        </div>

                        {/* Step 3: Verification Complete */}
                        <div id="modalCompleteStep" className={`verification-step ${currentStep === 3 ? 'active' : ''}`}>
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircleIcon />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Verification Complete!</h3>
                                <p className="text-gray-600 mb-8">Your documents have been successfully uploaded and are being verified. You'll receive a confirmation within 24 hours.</p>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        <p className="text-sm text-green-800"><strong>What's next?</strong> You can now post tasks and accept help requests. Full access has been granted!</p>
                                    </div>
                                </div>
                                <button onClick={handleComplete} className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors font-medium text-lg"> Continue Using HelpMate </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;