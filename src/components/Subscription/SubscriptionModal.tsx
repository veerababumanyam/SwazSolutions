import React from 'react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose?: () => void;
    currentStatus?: string;
    endDate?: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentStatus, endDate }) => {
    if (!isOpen) return null;

    const handleSubscribe = async (provider: 'cashfree' | 'phonepe' | 'rupeepayments') => {
        try {
            const response = await fetch('/api/subscription/create-order', {
                method: 'POST',
                credentials: 'include', // Send httpOnly cookies automatically
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ provider })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.payment_link) {
                    window.location.href = data.payment_link;
                } else if (data.order_id) {
                    alert(`Order created (${data.order_id}). Please complete payment via ${provider}.`);
                }
            } else {
                alert('Failed to start subscription: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Failed to connect to subscription service');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Premium Access Required</h2>
                    <p className="text-gray-400 mb-6">
                        {currentStatus === 'free' ? 'Your free trial has ended.' : 'Your subscription has expired.'}
                        <br />
                        Upgrade to Premium to continue enjoying unlimited music.
                    </p>

                    <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300">Yearly Subscription</span>
                            <span className="text-2xl font-bold text-white">₹200<span className="text-sm font-normal text-gray-400">/yr</span></span>
                        </div>
                        <ul className="text-left text-sm text-gray-400 space-y-2 mt-3">
                            <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Unlimited high-quality streaming</li>
                            <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Ad-free experience</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-left text-sm text-gray-400 mb-1">Select Payment Method</label>
                        <button
                            onClick={() => handleSubscribe('cashfree')}
                            className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all border border-white/5 flex items-center justify-center"
                        >
                            Pay with Cashfree
                        </button>
                        <button
                            onClick={() => handleSubscribe('phonepe')}
                            className="w-full py-3 px-4 bg-[#5f259f] hover:bg-[#4d1e82] text-white font-medium rounded-xl transition-all border border-white/5 flex items-center justify-center"
                        >
                            Pay with PhonePe
                        </button>
                        <button
                            onClick={() => handleSubscribe('rupeepayments')}
                            className="w-full py-3 px-4 bg-green-700 hover:bg-green-600 text-white font-medium rounded-xl transition-all border border-white/5 flex items-center justify-center"
                        >
                            Pay with RupeePayments
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionModal;
