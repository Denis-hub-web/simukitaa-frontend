import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../utils/api';

const Login = () => {
    const [passcode, setPasscode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [ripples, setRipples] = useState({});

    const keypadNumbers = [
        { num: '1', letters: '' },
        { num: '2', letters: 'ABC' },
        { num: '3', letters: 'DEF' },
        { num: '4', letters: 'GHI' },
        { num: '5', letters: 'JKL' },
        { num: '6', letters: 'MNO' },
        { num: '7', letters: 'PQRS' },
        { num: '8', letters: 'TUV' },
        { num: '9', letters: 'WXYZ' },
    ];

    const createRipple = (key) => {
        setRipples(prev => ({ ...prev, [key]: Date.now() }));
        setTimeout(() => {
            setRipples(prev => {
                const newRipples = { ...prev };
                delete newRipples[key];
                return newRipples;
            });
        }, 600);
    };

    const handleNumberClick = (num) => {
        if (passcode.length < 6 && !isLoading) {
            createRipple(num);
            setPasscode(passcode + num);
            setError(false);
        }
    };

    useEffect(() => {
        if (passcode.length === 6) {
            handleSubmit();
        }
    }, [passcode]);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await authAPI.loginWithPasscode(passcode);

            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 300);
        } catch (err) {
            setError(true);
            setPasscode('');
            setIsLoading(false);

            setTimeout(() => setError(false), 600);
        }
    };

    const NumberButton = ({ item }) => (
        <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => handleNumberClick(item.num)}
            disabled={isLoading}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center text-white transition-all hover:bg-white/20 active:bg-white/30 disabled:opacity-50 overflow-hidden group"
        >
            {/* Liquidity ripple effect */}
            {ripples[item.num] && (
                <motion.span
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full bg-white/30"
                />
            )}

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <span className="relative z-10 text-2xl sm:text-3xl font-light">{item.num}</span>
            {item.letters && (
                <span className="relative z-10 text-[8px] sm:text-[9px] font-medium tracking-wider mt-0.5 opacity-60">
                    {item.letters}
                </span>
            )}
        </motion.button>
    );

    return (
        <div className="min-h-[100dvh] relative overflow-hidden flex items-center justify-center p-4">
            {/* Blurred gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-teal-600">
                <div className="absolute inset-0 backdrop-blur-3xl bg-white/10" />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 right-0 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-gradient-to-br from-blue-500/30 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        rotate: [0, -5, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-gradient-to-tr from-teal-500/30 to-transparent rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 w-full max-w-[280px] sm:max-w-[320px]">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6 sm:mb-8"
                >
                    <h1 className="text-white text-lg sm:text-xl font-medium mb-4 sm:mb-5">Enter Passcode</h1>

                    {/* Passcode Dots */}
                    <motion.div
                        animate={error ? {
                            x: [-10, 10, -10, 10, -5, 5, 0],
                            transition: { duration: 0.4 }
                        } : {}}
                        className="flex justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-10"
                    >
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 transition-all duration-200 ${index < passcode.length
                                    ? 'bg-white border-white scale-125'
                                    : 'bg-transparent border-white/50'
                                    }`} />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Keypad */}
                <div className="space-y-2.5 sm:space-y-3">
                    {/* Numbers 1-9 */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        {keypadNumbers.map((item) => (
                            <NumberButton key={item.num} item={item} />
                        ))}
                    </div>

                    {/* Bottom row: 0 */}
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                        <div /> {/* Empty */}
                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => handleNumberClick('0')}
                            disabled={isLoading}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white/20 active:bg-white/30 disabled:opacity-50 overflow-hidden group"
                        >
                            {/* Liquidity ripple effect */}
                            {ripples['0'] && (
                                <motion.span
                                    initial={{ scale: 0, opacity: 0.6 }}
                                    animate={{ scale: 2.5, opacity: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="absolute inset-0 rounded-full bg-white/30"
                                />
                            )}

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <span className="relative z-10 text-2xl sm:text-3xl font-light">0</span>
                        </motion.button>
                        <div /> {/* Empty */}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
