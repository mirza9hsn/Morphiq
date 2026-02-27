import { useLazyGetCheckoutQuery } from '@/redux/api/billing'
import { useAppSelector } from '@/redux/store'
import { toast } from 'sonner'
import { useState } from 'react'

export const useSubscriptionPlan = () => {
    const [trigger, { isFetching }] = useLazyGetCheckoutQuery()
    const { id } = useAppSelector((state) => state.profile.user)
    const [activePlanId, setActivePlanId] = useState<string | null>(null)

    const onSubscribe = async (planId: string) => {
        setActivePlanId(planId)
        try {
            const res = await trigger(id).unwrap()
            window.location.href = res.url
        } catch (err) {
            console.error('Checkout error:', err)
            toast.error('Could not start checkout. Please try again.')
        } finally {
            setActivePlanId(null)
        }
    }

    return { onSubscribe, isFetching, activePlanId }
}