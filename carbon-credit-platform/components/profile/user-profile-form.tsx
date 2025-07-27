// components/profile/user-profile-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { User } from "@/lib/types"
import { useEffect, useState } from "react"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  companyName: z.string().optional(),
  // Add other fields as needed for specific roles
})

type UserProfileFormValues = z.infer<typeof formSchema>

interface UserProfileFormProps {
  initialData: User | null
  onSaveSuccess: () => void
}

export default function UserProfileForm({ initialData, onSaveSuccess }: UserProfileFormProps) {
  const { updateUserProfile, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      companyName: initialData?.companyName || "",
    },
  })

  // Reset form with new initialData if it changes (e.g., after a fresh fetch)
  useEffect(() => {
    form.reset({
      name: initialData?.name || "",
      email: initialData?.email || "",
      companyName: initialData?.companyName || "",
    })
  }, [initialData, form])

  const onSubmit = async (values: UserProfileFormValues) => {
    if (!currentAddress) {
      alert("Wallet not connected. Cannot save profile.")
      return
    }

    setSuccessMessage(null)
    const result = await updateUserProfile(currentAddress, values)

    if (result?.success) {
      setSuccessMessage("Profile updated successfully!")
      onSaveSuccess() // Callback to trigger re-fetch in parent
    } else {
      alert(result?.message || "Failed to update profile.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your personal and role-specific information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="address">Wallet Address</Label>
            <Input id="address" value={currentAddress || "Not Connected"} disabled className="font-mono" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={initialData?.role || "N/A"} disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Your Name" />
            {form.formState.errors.name && <p className="text-error text-sm">{form.formState.errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} placeholder="your@example.com" />
            {form.formState.errors.email && <p className="text-error text-sm">{form.formState.errors.email.message}</p>}
          </div>

          {initialData?.role === "Company" && (
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" {...form.register("companyName")} placeholder="Your Company Name" />
              {form.formState.errors.companyName && (
                <p className="text-error text-sm">{form.formState.errors.companyName.message}</p>
              )}
            </div>
          )}

          {error && <p className="text-error text-sm">{error}</p>}
          {successMessage && <p className="text-success text-sm">{successMessage}</p>}

          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
