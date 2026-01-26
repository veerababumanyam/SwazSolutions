import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SubscriptionModal from './SubscriptionModal';

const SubscriptionManager: React.FC = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            setIsOpen(false);
            return;
        }

        // Admin bypass
        if (user.role === 'admin') {
            setIsOpen(false);
            return;
        }

        const checkSubscription = () => {
            const isPaid = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'paid';

            // If subscription is active, no modal
            if (isPaid) {
                setIsOpen(false);
                return;
            }

            // Check expiry for free/trial users (and cancelled ones)
            if (user.subscriptionEnd) {
                const endDate = new Date(user.subscriptionEnd);
                const now = new Date();

                // If expired
                if (now > endDate) {
                    setIsOpen(true);
                } else {
                    setIsOpen(false);
                }
            } else {
                // No subscription info usually means free new user? Or error.
                // If we default to 'free' and 30 days, this shouldn't happen unless old user.
                // Maybe open for old users without subscription info?
                // For now, only block if explicitly expired.
                setIsOpen(false);
            }
        };

        checkSubscription();
    }, [user]);

    return (
        <SubscriptionModal
            isOpen={isOpen}
            // onClose={() => setIsOpen(false)} // Cannot close if expired
            currentStatus={user?.subscriptionStatus}
            endDate={user?.subscriptionEnd}
        />
    );
};

export default SubscriptionManager;
