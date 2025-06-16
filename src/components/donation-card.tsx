'use client'

import { CampaignType, DonationType } from '@/interfaces'
import { Progress, ProgressProps, Input, Button, Modal, message } from 'antd';
import React from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';
import { getStripeClientSecret } from '@/actions/paymensts';
import PaymentModal from './payment-modal';
import { getDonationsByCampaignId } from '@/actions/donations';

const { TextArea } = Input;

interface DonationCardProps {
    campaign: CampaignType;
    donations?: DonationType[];
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Stripe publishable key is not defined');
}

function DonationCard({ campaign, donations = [] }: DonationCardProps) {
    const [allDonations, setAllDonations] = React.useState<DonationType[]>([]);
    const [showAllDonationsModal, setShowAllDonationsModal] = React.useState(false);
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [clientSecret, setClientSecret] = React.useState("");
    const [amountError, setAmountError] = React.useState("");
    const [amount, setAmount] = React.useState<number | undefined>();
    const [messageText, setMessageText] = React.useState("");

    const collectedPercentage = Math.round((campaign.collectedAmount / campaign.targetAmount) * 100);
    const twoColors: ProgressProps['strokeColor'] = {
        '0%': '#FA5053',
        '100%': '#5CE65C',
    };

    const validateAmount = (value: number | undefined): boolean => {
        if (value === undefined || isNaN(value)) {
            setAmountError('Please enter a valid amount');
            return false;
        }
        
        if (value <= 0) {
            setAmountError('Amount must be greater than 0');
            return false;
        }
        
        if (value > 1000000) {
            setAmountError('Maximum donation amount is $1,000,000');
            return false;
        }
        
        setAmountError('');
        return true;
    };

    const getClientSecret = async () => {
        if (!validateAmount(amount)) return;
        
        try {
            setLoading(true);
            const response = await getStripeClientSecret({ amount: amount! });
            if (response.error) throw new Error(response.error);
            setClientSecret(response.clientSecret);
            setShowPaymentModal(true);
        } catch (error: any) {
            message.error(error.message || 'Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setAmount(undefined);
            setAmountError('');
            return;
        }
        
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setAmount(numValue);
            validateAmount(numValue);
        }
    };

    const donationCard = (donation: DonationType) => (
        <div key={donation._id} className='border p-2 rounded border-solid border-primary flex flex-col gap-y-1'>
            <span className='text-primary text-sm font-semibold'>
                $ {donation.amount} by {donation.user.userName}
            </span>
            {donation.message && (
                <span className='text-c2 text-sm ml-2'>{donation.message}</span>
            )}
        </div>
    );

    const getRecentDonations = () => {
        if (donations.length === 0) {
            return <span className='text-c2 text-sm'>No donations yet, be the first one.</span>;
        }
        return donations.map(donationCard);
    };

    const getAllDonations = async () => {
        try {
            const response: any = await getDonationsByCampaignId(campaign._id);
            if (response.error) throw new Error(response.error);
            setAllDonations(response.data);
        } catch (error: any) {
            message.error(error.message || "Failed to get all donations");
        }
    };

    return (
        <div className='border border-solid rounded border-primary p-5'>
            <span className="text-xl text-primary font-semibold">
                $ {campaign.collectedAmount} raised of $ {campaign.targetAmount}
            </span>
            <Progress percent={collectedPercentage} strokeColor={twoColors} className='mb-8' />

            {campaign.showDonors && (
                <>
                    <span className="text-primary text-sm font-semibold my-5 pb-5">
                        Recent donations:
                    </span>
                    <div className="flex flex-col gap-2 mb-4">
                        {getRecentDonations()}
                    </div>

                    {donations.length > 0 && (
                        <span
                            className='text-primary text-sm font-semibold cursor-pointer underline'
                            onClick={async () => {
                                await getAllDonations();
                                setShowAllDonationsModal(true);
                            }}>
                            View all
                        </span>
                    )}
                </>
            )}

            <hr className='my-8 border-c2 border-t' />

            <div className="flex flex-col gap-5 mt-8">
                <div>
                    <Input
                        placeholder='Amount'
                        type="number"
                        min="0.01"
                        step="1"
                        onChange={handleAmountChange}
                        value={amount?.toString()}
                        status={amountError ? 'error' : ''}
                        prefix="$"
                    />
                    {amountError && <div className="text-red-500 text-sm mt-1">{amountError}</div>}
                </div>
                
                <TextArea
                    placeholder='Message'
                    rows={4}
                    onChange={(e) => setMessageText(e.target.value)}
                    value={messageText}
                />
                
                <Button
                    className='mt-8'
                    type="primary"
                    block
                    onClick={getClientSecret}
                    loading={loading}
                    disabled={!amount || !!amountError}
                >
                    Donate
                </Button>

                {showPaymentModal && clientSecret && (
                    <Modal
                        open={showPaymentModal}
                        onCancel={() => {
                            setShowPaymentModal(false);
                            setClientSecret("");
                        }}
                        width={600}
                        footer={null}
                        title="Complete your donation payment"
                    >
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <PaymentModal
                                messageText={messageText}
                                campaign={campaign}
                                amount={amount || 0}
                            />
                        </Elements>
                    </Modal>
                )}

                {showAllDonationsModal && (
                    <Modal
                        open={showAllDonationsModal}
                        onCancel={() => setShowAllDonationsModal(false)}
                        width={600}
                        footer={null}
                        title="All donations for this campaign"
                    >
                        <div className='flex flex-col gap-5 my-5'>
                            {allDonations.map(donationCard)}
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default DonationCard;