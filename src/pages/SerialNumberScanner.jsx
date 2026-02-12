import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faImage, faCopy, faCheckCircle, faSpinner, faUpload, faTrash } from '@fortawesome/free-solid-svg-icons';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

const SerialNumberScanner = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [scannedText, setScannedText] = useState('');
    const [extractedSerial, setExtractedSerial] = useState('');
    const [scanHistory, setScanHistory] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [ocrProgress, setOcrProgress] = useState(0);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setError('');
            setScannedText('');
            setExtractedSerial('');

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Auto-scan after image loads
            setTimeout(() => scanImage(file), 500);
        }
    };

    const scanImage = async (file) => {
        setIsProcessing(true);
        setOcrProgress(0);
        setScannedText('');
        setExtractedSerial('');

        try {
            // Perform OCR on the uploaded image
            const result = await Tesseract.recognize(file, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(m.progress * 100));
                    }
                }
            });

            const text = result.data.text;
            setScannedText(text);

            // Extract serial number from text
            const serial = extractSerialNumber(text);
            if (serial) {
                setExtractedSerial(serial);
                addToHistory(serial);
            } else {
                setError('No serial number detected in the image. Try a clearer photo with better lighting.');
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Failed to read text from image. Please try again with a clearer photo.');
        } finally {
            setIsProcessing(false);
            setOcrProgress(0);
        }
    };

    const extractSerialNumber = (text) => {
        // Split text into lines for better analysis
        const lines = text.split('\n');

        // Strategy 1: Find line containing "Serial" and extract the serial number from it
        for (const line of lines) {
            if (/serial/i.test(line)) {
                // Found a line with "Serial" - now extract alphanumeric codes from this line
                // Look for patterns like C02MALFNQL (letter followed by numbers and letters)
                const serialMatches = line.match(/\b([A-Z][A-Z0-9]{7,19})\b/gi);
                if (serialMatches && serialMatches.length > 0) {
                    // Return the first match that has both letters and numbers
                    for (const match of serialMatches) {
                        const hasLetters = /[A-Z]/i.test(match);
                        const hasNumbers = /[0-9]/.test(match);
                        if (hasLetters && hasNumbers && match.length >= 8) {
                            return match.toUpperCase();
                        }
                    }
                }
            }
        }

        // Strategy 2: Look for S/N or SN pattern
        for (const line of lines) {
            if (/S\/N|SN[:.\s]/i.test(line)) {
                const serialMatches = line.match(/\b([A-Z][A-Z0-9]{7,19})\b/gi);
                if (serialMatches && serialMatches.length > 0) {
                    for (const match of serialMatches) {
                        const hasLetters = /[A-Z]/i.test(match);
                        const hasNumbers = /[0-9]/.test(match);
                        if (hasLetters && hasNumbers && match.length >= 8) {
                            return match.toUpperCase();
                        }
                    }
                }
            }
        }

        // Strategy 3: Look for IMEI (15 digits only)
        for (const line of lines) {
            if (/IMEI/i.test(line)) {
                const imeiMatch = line.match(/\b([0-9]{15})\b/);
                if (imeiMatch && imeiMatch[1]) {
                    return imeiMatch[1];
                }
            }
        }

        // Strategy 4: Generic search for typical serial number patterns across all text
        // Pattern: Starts with 1-3 letters, followed by 2 digits, then mix of letters/numbers
        const genericMatch = text.match(/\b([A-Z]{1,3}[0-9]{2}[A-Z0-9]{5,15})\b/i);
        if (genericMatch && genericMatch[1]) {
            return genericMatch[1].toUpperCase();
        }

        return null;
    };

    const addToHistory = (serial) => {
        const timestamp = new Date().toLocaleTimeString();
        setScanHistory(prev => [{ serial, timestamp }, ...prev.slice(0, 9)]); // Keep last 10
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setScannedText('');
        setExtractedSerial('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Serial Number Scanner</h1>
                            <p className="text-sm text-gray-500 mt-0.5">Test OCR scanning of printed serial numbers</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Upload Section */}
                <div className="mb-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageSelect}
                        className="hidden"
                    />

                    {!imagePreview ? (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full px-6 py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-4"
                        >
                            <FontAwesomeIcon icon={faUpload} className="text-5xl" />
                            <div>
                                <p className="text-xl mb-2">Upload or Take Photo</p>
                                <p className="text-sm text-blue-100">Point camera at serial number or select image from gallery</p>
                            </div>
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faImage} />
                                Upload New Image
                            </button>
                            <button
                                onClick={clearImage}
                                disabled={isProcessing}
                                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800">
                        {error}
                    </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                    <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden mb-6">
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-auto max-h-96 object-contain bg-gray-100"
                            />

                            {/* Processing Overlay */}
                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                    <FontAwesomeIcon icon={faSpinner} className="text-5xl text-white animate-spin mb-4" />
                                    <p className="text-white text-xl font-bold mb-2">Reading text...</p>
                                    <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${ocrProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-white text-sm mt-2">{ocrProgress}%</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Results Section */}
                <AnimatePresence>
                    {extractedSerial && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6"
                        >
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 shadow-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Serial Number Detected!</h2>
                                </div>
                                <div className="bg-white rounded-xl p-4 font-mono text-2xl font-bold text-gray-900 flex items-center justify-between">
                                    <span className="break-all">{extractedSerial}</span>
                                    <button
                                        onClick={() => copyToClipboard(extractedSerial)}
                                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
                                    >
                                        <FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} />
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Raw OCR Text (for debugging) */}
                {scannedText && (
                    <div className="mb-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
                        <h3 className="font-bold text-gray-700 mb-2">Raw Text Detected (Debug):</h3>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">{scannedText}</pre>
                    </div>
                )}

                {/* Scan History */}
                {scanHistory.length > 0 && (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Scan History</h2>
                        <div className="space-y-2">
                            {scanHistory.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                            {index + 1}
                                        </span>
                                        <span className="font-mono font-bold text-gray-900 truncate">{item.serial}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs text-gray-500">{item.timestamp}</span>
                                        <button
                                            onClick={() => copyToClipboard(item.serial)}
                                            className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faCopy} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
                    <h3 className="font-bold text-blue-900 mb-3">📋 How to Use:</h3>
                    <ol className="space-y-2 text-sm text-blue-800">
                        <li className="flex gap-2">
                            <span className="font-bold">1.</span>
                            <span>Click "Upload or Take Photo" button</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">2.</span>
                            <span><strong>Mobile:</strong> Choose "Camera" to take a photo of the serial number</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">3.</span>
                            <span><strong>Desktop:</strong> Upload an image of the product box</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">4.</span>
                            <span>Make sure the serial number text is clear and well-lit</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-bold">5.</span>
                            <span>The scanner will automatically detect and extract the serial number</span>
                        </li>
                    </ol>
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700 font-bold mb-1">💡 Tips for best results:</p>
                        <ul className="text-xs text-blue-600 space-y-1">
                            <li>• Use good lighting</li>
                            <li>• Hold camera steady and focus on text</li>
                            <li>• Avoid glare and shadows</li>
                            <li>• Get close enough to read the text clearly</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SerialNumberScanner;
