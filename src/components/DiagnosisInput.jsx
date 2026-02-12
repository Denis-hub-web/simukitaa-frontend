import React, { useState, useEffect, useRef, memo } from 'react';

/**
 * Isolated Diagnosis Component
 * Separates typing state from parent re-renders to ensure smooth typing.
 */
const DiagnosisInput = memo(({ value, onChange, placeholder = "Describe the issue and solution..." }) => {
    const [localValue, setLocalValue] = useState(value || '');
    const textareaRef = useRef(null);
    const mountCount = useRef(0);

    // Track mounting to detect parent re-mounting issues
    useEffect(() => {
        mountCount.current += 1;
        console.log(`[DiagnosisInput] Mounted count: ${mountCount.current}`);
        return () => console.log('[DiagnosisInput] UNMOUNTED');
    }, []);

    // Sync with parent value if it changes externally (e.g., on load)
    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value || '');
        }
    }, [value]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setLocalValue(newVal);
        // Notify parent immediately but with zero overhead
        onChange(newVal);
    };

    return (
        <div className="diagnosis-input-wrapper">
            <textarea
                ref={textareaRef}
                id="atomic-diagnosis-textarea"
                name="diagnosis_atomic"
                required
                rows={4}
                autoComplete="off"
                spellCheck="false"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none font-bold outline-none transition-colors"
                style={{ minHeight: '120px' }}
            />
            <div className="text-[10px] text-gray-400 mt-1 flex justify-between font-bold uppercase tracking-widest">
                <span>Atomic Performance Mode Active</span>
                <span>{localValue.length} characters</span>
            </div>
        </div>
    );
});

export default DiagnosisInput;
