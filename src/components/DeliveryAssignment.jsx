import { useState, useEffect } from 'react';
import { deliveryAPI, userAPI } from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faStickyNote, faTruck, faUser } from '@fortawesome/free-solid-svg-icons';

const DeliveryAssignment = ({ delivery, onClose, onSuccess }) => {
    const [deliveryPersons, setDeliveryPersons] = useState([]);
    const [selectedPerson, setSelectedPerson] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDeliveryPersons();
    }, []);

    const loadDeliveryPersons = async () => {
        try {
            const res = await userAPI.getAll();
            const persons = res.data.data.users.filter(u => u.role === 'DELIVERY' && u.isActive !== false);
            setDeliveryPersons(persons);
        } catch (err) {
            setError('Failed to load delivery persons');
        }
    };

    const handleAssign = async () => {
        if (!selectedPerson) {
            setError('Please select a delivery person');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await deliveryAPI.assign(delivery.id, selectedPerson);
            alert('✅ Delivery assigned successfully!');
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to assign delivery');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* Delivery Details */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-3">
                <h3 className="font-black text-lg text-slate-900 mb-4">
                    <FontAwesomeIcon icon={faTruck} className="text-blue-600 mr-2" />
                    Delivery #{delivery?.deliveryNumber}
                </h3>

                <div className="space-y-2.5 text-sm">
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500 mt-1" />
                        <div>
                            <p className="font-bold text-xs text-gray-500 mb-0.5">Address</p>
                            <p className="text-slate-900 font-bold">{delivery?.deliveryAddress}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faPhone} className="text-blue-500 mt-1" />
                        <div>
                            <p className="font-bold text-xs text-gray-500 mb-0.5">Phone</p>
                            <p className="text-slate-900 font-bold">{delivery?.deliveryPhone}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faStickyNote} className="text-amber-500 mt-1" />
                        <div>
                            <p className="font-bold text-xs text-gray-500 mb-0.5">Delivery Time</p>
                            <p className="text-slate-900 font-bold">
                                {delivery?.deliveryTime === 'now' ? 'ASAP' :
                                    delivery?.deliveryTime === 'tomorrow' ? 'Tomorrow' :
                                        new Date(delivery?.deliveryTime).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {delivery?.specialInstructions && (
                        <div className="flex items-start gap-3 pt-2 border-t border-blue-200">
                            <FontAwesomeIcon icon={faStickyNote} className="text-purple-500 mt-1" />
                            <div>
                                <p className="font-bold text-xs text-gray-500 mb-0.5">Special Instructions</p>
                                <p className="text-slate-700 italic">{delivery?.specialInstructions}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Assignment Section */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                    Assign to Delivery Person
                </label>

                {deliveryPersons.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <p className="text-amber-800 font-semibold">⚠️ No delivery persons available</p>
                        <p className="text-sm text-amber-600 mt-1">Ask CEO to create DELIVERY role users first</p>
                    </div>
                ) : (
                    <select
                        value={selectedPerson}
                        onChange={(e) => setSelectedPerson(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900"
                    >
                        <option value="">-- Select delivery person --</option>
                        {deliveryPersons.map(person => (
                            <option key={person.id} value={person.id}>
                                {person.name} - {person.phone || 'No phone'}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold"
                >
                    Cancel
                </button>
                <button
                    onClick={handleAssign}
                    disabled={!selectedPerson || loading || deliveryPersons.length === 0}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                    {loading ? 'Assigning...' : '✓ Assign Delivery'}
                </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
                🔒 CEO will be notified of this assignment.
            </p>
        </div>
    );
};

export default DeliveryAssignment;
