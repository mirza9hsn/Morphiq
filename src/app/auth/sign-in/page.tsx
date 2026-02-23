"use client"

import LoginPage from "@/components/sign-in"
import { useAuth } from "@/hooks/use-auth"

export default function SignInPage() {
    const { handleSignIn, signInForm, isLoading } = useAuth()
    const { register, handleSubmit, formState: { errors } } = signInForm

    return (
        <LoginPage
            onSubmit={handleSubmit(handleSignIn)}
            register={register}
            errors={errors}
            isLoading={isLoading}
        />
    )
}