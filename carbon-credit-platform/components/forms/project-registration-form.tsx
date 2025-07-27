// components/forms/project-registration-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { setError } from "@/utils/error-utils" // Import setError from error-utils

const formSchema = z.object({
  name: z.string().min(3, "Project name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
})

type ProjectRegistrationFormValues = z.infer<typeof formSchema>

export default function ProjectRegistrationForm() {
  const { registerProject, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<ProjectRegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
    },
  })

  const onSubmit = async (values: ProjectRegistrationFormValues) => {
    if (!currentAddress) {
      setError("Wallet not connected. Please connect your wallet.")
      return
    }

    setSuccessMessage(null)
    const result = await registerProject({
      ownerId: currentAddress,
      name: values.name,
      description: values.description,
      location: values.location,
    })

    if (result?.success) {
      setSuccessMessage("Project registered successfully! Awaiting verification.")
      form.reset()
    } else {
      setError(result?.message || "Failed to register project.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Register New Project</CardTitle>
        <CardDescription>Submit details for your carbon offset project.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-error text-sm">{form.formState.errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} rows={4} />
            {form.formState.errors.description && (
              <p className="text-error text-sm">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...form.register("location")} />
            {form.formState.errors.location && (
              <p className="text-error text-sm">{form.formState.errors.location.message}</p>
            )}
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          {successMessage && <p className="text-success text-sm">{successMessage}</p>}
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register Project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
