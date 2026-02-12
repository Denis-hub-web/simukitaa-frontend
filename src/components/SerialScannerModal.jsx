import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faImage, faCheckCircle, faSpinner, faUpload } from '@fortawesome/free-solid-svg-icons';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

const SerialScannerModal = ({ isOpen, onClose, onSerialDetected }) => {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [scannedText, setScannedText] = useState('');
    const [extractedSerial, setExtractedSerial] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [error, setError] = useState('');

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setError('');
            setScannedText('');
            setExtractedSerial('');

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            setTimeout(() => scanImage(file), 500);
        }
    };

    const scanImage = async (file) => {
        setIsProcessing(true);
        setOcrProgress(0);

        try {
            const result = await Tesseract.recognize(file, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(m.progress * 100));
                    }
                }
            });

            const text = result.data.text;
            setScannedText(text);

            const serial = extractSerialNumber(text);
            if (serial) {
                setExtractedSerial(serial);
            } else {
                setError('No serial number detected. Try a clearer photo with better lighting.');
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setError('Failed to read text. Please try again.');
        } finally {
            setIsProcessing(false);
            setOcrProgress(0);
        }
    };

    const extractSerialNumber = (text) => {
        const lines = text.split('\n');

        // Strategy 1: Find line with "Serial"
        for (const line of lines) {
            if (/serial/i.test(line)) {
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

        // Strategy 2: Look for S/N
        for (const line of lines) {
            if (/S\/N|SN[:.]/i.test(line)) {
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

        // Strategy 3: IMEI
        for (const line of lines) {
            if (/IMEI/i.test(line)) {
                const imeiMatch = line.match(/\b([0-9]{15})\b/);
                if (imeiMatch) return imeiMatch[1];
            }
        }

        // Strategy 4: Generic pattern
        const genericMatch = text.match(/\b([A-Z]{1,3}[0-9]{2}[A-Z0-9]{5,15})\b/i);
        if (genericMatch) return genericMatch[1].toUpperCase();

        return null;
    };

    const handleUseSerial = () => {
        if (extractedSerial && onSerialDetected) {
            onSerialDetected(extractedSerial);
            handleClose();
        }
    };

    const handleClose = () => {
        setImagePreview(null);
        setScannedText('');
        setExtractedSerial('');
        setError('');
        setIsProcessing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                        <h2 className="text-xl font-bold text-gray-900">📷 Scan Serial Number</h2>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Upload Button */}
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
                                className="w-full px-6 py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-4"
                            >
                                <FontAwesomeIcon icon={faUpload} className="text-5xl" />
                                <div>
                                    <p className="text-lg mb-1">Upload or Take Photo</p>
                                    <p className="text-sm text-blue-100">Point camera at serial number</p>
                                </div>
                            </button>
                        ) : (
                            <div>
                                {/* Image Preview */}
                                <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-auto max-h-64 object-contain"
                                    />
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                                            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-white animate-spin mb-3" />
                                            <p className="text-white font-bold mb-2">Reading text...</p>
                                            <div className="w-48 h-2 bg-white/30 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-300"
                                                    style={{ width: `${ocrProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-white text-sm mt-1">{ocrProgress}%</p>
                                        </div>
                                    )}
                                </div>

                                {/* Retry Button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isProcessing}
                                    className="w-full mb-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={faImage} className="mr-2" />
                                    Upload Different Image
                                </button>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {extractedSerial && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-4"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-green-600" />
                                    <h3 className="font-bold text-gray-900">Serial Detected!</h3>
                                </div>
                                <div className="bg-white rounded-xl p-3 font-mono text-xl font-bold text-gray-900 mb-4 break-all">
                                    {extractedSerial}
                                </div>
                                <button
                                    onClick={handleUseSerial}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Use This Serial
                                </button>
                            </motion.div>
                        )}

                        {/* Tips */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-xs text-blue-700 font-bold mb-2">💡 Tips for best results:</p>
                            <ul className="text-xs text-blue-600 space-y-1">
                                <li>• Use good lighting</li>
                                <li>• Hold camera steady</li>
                                <li>• Avoid glare and shadows</li>
                                <li>• Get close to read text clearly</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SerialScannerModal;
