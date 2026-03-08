// Atoms — re-exports shadcn primitives for iframe bundling.
// @/ aliases are resolved by esbuild at build time. Never import this in app code.
export { Button, buttonVariants } from '@/components/ui/button'
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
export { Input } from '@/components/ui/input'
export { Badge, badgeVariants } from '@/components/ui/badge'
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
export { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
export { Separator } from '@/components/ui/separator'
export { Label } from '@/components/ui/label'
export { Textarea } from '@/components/ui/textarea'
export { Switch } from '@/components/ui/switch'
