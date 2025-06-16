import React from 'react'
import { AddressElement, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button, message as antdMessage } from 'antd'
import { CampaignType } from '@/interfaces';
import { addNewDonation } from '@/actions/donations';
import { useRouter } from 'next/navigation';

interface PaymentModalProps {
    campaign: CampaignType,
    amount: number,
    messageText: string,
}

function PaymentModal({ campaign, amount, messageText }: PaymentModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [messageApi, contextHolder] = antdMessage.useMessage();
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            setLoading(true);
            event.preventDefault();

            if (!stripe || !elements) {
                return;
            }

            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: "https://localhost:3000/profile/donations",
                },
                redirect: "if_required",
            });

            if (result.error) {
                messageApi.error(result.error?.message || "Payment failed");
            } else {
                const donationPayload = {
                    campaign: campaign._id,
                    amount,
                    message: messageText,
                    paymentId: result.paymentIntent?.id,
                };
                await addNewDonation(donationPayload);
                messageApi.success("Donation successful")
                router.push("/profile/donations")
            }
        } catch (error: any) {
            messageApi.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return ( 
        <form onSubmit={onSubmit}>
            {contextHolder}
            <PaymentElement />
            <AddressElement
                options={{
                    allowedCountries: ['US', 'UA'],
                    mode: 'shipping'
                }}>
            </AddressElement>
            <div className="flex gap-5 justify-end mt-5">
                <Button>Cancel</Button>
                <Button type="primary" htmlType="submit"
                    loading={loading}>
                    Pay
                </Button>
            </div>
        </form>
    )
}

export default PaymentModal