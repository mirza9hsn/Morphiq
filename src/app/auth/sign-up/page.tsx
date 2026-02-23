"use client"

import SignUpPage from "@/components/sign-up"
import { useAuth } from "@/hooks/use-auth"

export default function SignUpRoute() {
    const { handleSignUp, signUpForm, isLoading } = useAuth()
    const { register, handleSubmit, formState: { errors } } = signUpForm

    return (
        <SignUpPage
            onSubmit={handleSubmit(handleSignUp)}
            register={register}
            errors={errors}
            isLoading={isLoading}
        />
    )
}
