import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import GoogleOAuth from './oauth/google'

type SignUpFields = {
    firstName: string
    lastName: string
    email: string
    password: string
}

type Props = {
    onSubmit: (e: React.FormEvent) => void
    register: UseFormRegister<SignUpFields>
    errors: FieldErrors<SignUpFields>
    isLoading: boolean
}

export default function SignUpPage({ onSubmit, register, errors, isLoading }: Props) {
    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={onSubmit}
                className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div className="text-center">
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Create a Morphiq Account</h1>
                        <p className="text-sm text-muted-foreground">Welcome! Create an account to get started</p>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="block text-sm">First name</Label>
                                <Input
                                    type="text"
                                    id="firstName"
                                    placeholder="John"
                                    {...register('firstName')}
                                />
                                {errors.firstName && (
                                    <p className="text-destructive text-xs">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="block text-sm">Last name</Label>
                                <Input
                                    type="text"
                                    id="lastName"
                                    placeholder="Doe"
                                    {...register('lastName')}
                                />
                                {errors.lastName && (
                                    <p className="text-destructive text-xs">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="block text-sm">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-destructive text-xs">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm">Password</Label>
                            <Input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-destructive text-xs">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                            ) : 'Create Account'}
                        </Button>
                    </div>

                    <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <hr className="border-dashed" />
                        <span className="text-muted-foreground text-xs">Or continue with</span>
                        <hr className="border-dashed" />
                    </div>

                    <div>
                        <GoogleOAuth />
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Already have an account?{' '}
                        <Button asChild variant="link" className="px-1">
                            <Link href="/auth/sign-in">Sign In</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}