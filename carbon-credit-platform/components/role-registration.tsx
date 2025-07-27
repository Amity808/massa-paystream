"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, TreePine, Shield, Settings } from "lucide-react"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"

interface RoleRegistrationProps {
    onComplete?: () => void
}

export function RoleRegistration({ onComplete }: RoleRegistrationProps) {
    const { userRole, currentAddress, setUserRole } = useUser()
    const { registerAsCompany, registerAsProject, isLoading } = useContract()

    // Company registration state
    const [companyForm, setCompanyForm] = useState({
        businessName: "",
        registrationNumber: "",
        industry: "",
        annualEmissions: "",
    })

    // Project registration state
    const [projectForm, setProjectForm] = useState({
        projectId: "",
        projectName: "",
        projectType: "",
        location: "",
        totalCapacity: "",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateCompanyForm = () => {
        const newErrors: Record<string, string> = {}

        if (!companyForm.businessName.trim()) {
            newErrors.businessName = "Business name is required"
        }
        if (!companyForm.registrationNumber.trim()) {
            newErrors.registrationNumber = "Registration number is required"
        }
        if (!companyForm.industry.trim()) {
            newErrors.industry = "Industry is required"
        }
        if (!companyForm.annualEmissions || Number.parseFloat(companyForm.annualEmissions) <= 0) {
            newErrors.annualEmissions = "Valid annual emissions amount is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateProjectForm = () => {
        const newErrors: Record<string, string> = {}

        if (!projectForm.projectId.trim()) {
            newErrors.projectId = "Project ID is required"
        }
        if (!projectForm.projectName.trim()) {
            newErrors.projectName = "Project name is required"
        }
        if (!projectForm.projectType.trim()) {
            newErrors.projectType = "Project type is required"
        }
        if (!projectForm.location.trim()) {
            newErrors.location = "Location is required"
        }
        if (!projectForm.totalCapacity || Number.parseFloat(projectForm.totalCapacity) <= 0) {
            newErrors.totalCapacity = "Valid total capacity is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateCompanyForm()) return

        const result = await registerAsCompany(
            companyForm.businessName,
            companyForm.registrationNumber,
            companyForm.industry,
            Number.parseFloat(companyForm.annualEmissions)
        )

        if (result.success) {
            onComplete?.()
        }
    }

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateProjectForm()) return

        const result = await registerAsProject(
            projectForm.projectId,
            projectForm.projectName,
            projectForm.projectType,
            projectForm.location,
            Number.parseFloat(projectForm.totalCapacity)
        )

        if (result.success) {
            onComplete?.()
        }
    }

    if (userRole) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {userRole === 'company' && <Building2 className="w-12 h-12 text-blue-500" />}
                        {userRole === 'project' && <TreePine className="w-12 h-12 text-green-500" />}
                        {userRole === 'verifier' && <Shield className="w-12 h-12 text-purple-500" />}
                        {userRole === 'admin' && <Settings className="w-12 h-12 text-orange-500" />}
                    </div>
                    <CardTitle>Registration Complete</CardTitle>
                    <CardDescription>
                        You are registered as: <Badge variant="secondary">{userRole}</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={onComplete} className="w-full">
                        Go to Dashboard
                    </Button>
                    <Button
                        onClick={() => {
                            // Clear role to allow re-registration - no localStorage needed
                            setUserRole(null)
                            window.location.reload()
                        }}
                        variant="outline"
                        className="w-full"
                    >
                        Register as Different Role
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Complete Your Registration</CardTitle>
                    <CardDescription>
                        Choose your role and provide the required information to start using the platform
                    </CardDescription>
                    <div className="text-sm text-muted-foreground mt-2">
                        Connected Address: <code className="text-xs">{currentAddress}</code>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="company" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="company" className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Company
                            </TabsTrigger>
                            <TabsTrigger value="project" className="flex items-center gap-2">
                                <TreePine className="w-4 h-4" />
                                Project Owner
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="company" className="space-y-4">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                                <h3 className="font-semibold">Register as Company</h3>
                                <p className="text-sm text-muted-foreground">
                                    Track emissions, purchase carbon credits, and manage compliance
                                </p>
                            </div>

                            <form onSubmit={handleCompanySubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input
                                        id="businessName"
                                        value={companyForm.businessName}
                                        onChange={(e) => setCompanyForm(prev => ({ ...prev, businessName: e.target.value }))}
                                        placeholder="Enter your business name"
                                        className={errors.businessName ? "border-red-500" : ""}
                                    />
                                    {errors.businessName && (
                                        <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="registrationNumber">Registration Number</Label>
                                    <Input
                                        id="registrationNumber"
                                        value={companyForm.registrationNumber}
                                        onChange={(e) => setCompanyForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                                        placeholder="Enter your business registration number"
                                        className={errors.registrationNumber ? "border-red-500" : ""}
                                    />
                                    {errors.registrationNumber && (
                                        <p className="text-sm text-red-500 mt-1">{errors.registrationNumber}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="industry">Industry</Label>
                                    <Select
                                        value={companyForm.industry}
                                        onValueChange={(value) => setCompanyForm(prev => ({ ...prev, industry: value }))}
                                    >
                                        <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select your industry" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="energy">Energy</SelectItem>
                                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                            <SelectItem value="transportation">Transportation</SelectItem>
                                            <SelectItem value="agriculture">Agriculture</SelectItem>
                                            <SelectItem value="technology">Technology</SelectItem>
                                            <SelectItem value="finance">Finance</SelectItem>
                                            <SelectItem value="healthcare">Healthcare</SelectItem>
                                            <SelectItem value="retail">Retail</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.industry && (
                                        <p className="text-sm text-red-500 mt-1">{errors.industry}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="annualEmissions">Annual Emissions (tonnes CO2e)</Label>
                                    <Input
                                        id="annualEmissions"
                                        type="number"
                                        value={companyForm.annualEmissions}
                                        onChange={(e) => setCompanyForm(prev => ({ ...prev, annualEmissions: e.target.value }))}
                                        placeholder="Enter your annual emissions"
                                        className={errors.annualEmissions ? "border-red-500" : ""}
                                    />
                                    {errors.annualEmissions && (
                                        <p className="text-sm text-red-500 mt-1">{errors.annualEmissions}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Registering..." : "Register as Company"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="project" className="space-y-4">
                            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                <TreePine className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                <h3 className="font-semibold">Register as Project Owner</h3>
                                <p className="text-sm text-muted-foreground">
                                    Create carbon offset projects and mint carbon credits
                                </p>
                            </div>

                            <form onSubmit={handleProjectSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="projectId">Project ID</Label>
                                    <Input
                                        id="projectId"
                                        value={projectForm.projectId}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, projectId: e.target.value }))}
                                        placeholder="Enter unique project identifier"
                                        className={errors.projectId ? "border-red-500" : ""}
                                    />
                                    {errors.projectId && (
                                        <p className="text-sm text-red-500 mt-1">{errors.projectId}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="projectName">Project Name</Label>
                                    <Input
                                        id="projectName"
                                        value={projectForm.projectName}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, projectName: e.target.value }))}
                                        placeholder="Enter project name"
                                        className={errors.projectName ? "border-red-500" : ""}
                                    />
                                    {errors.projectName && (
                                        <p className="text-sm text-red-500 mt-1">{errors.projectName}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="projectType">Project Type</Label>
                                    <Select
                                        value={projectForm.projectType}
                                        onValueChange={(value) => setProjectForm(prev => ({ ...prev, projectType: value }))}
                                    >
                                        <SelectTrigger className={errors.projectType ? "border-red-500" : ""}>
                                            <SelectValue placeholder="Select project type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="reforestation">Reforestation</SelectItem>
                                            <SelectItem value="renewable-energy">Renewable Energy</SelectItem>
                                            <SelectItem value="energy-efficiency">Energy Efficiency</SelectItem>
                                            <SelectItem value="methane-capture">Methane Capture</SelectItem>
                                            <SelectItem value="soil-carbon">Soil Carbon</SelectItem>
                                            <SelectItem value="blue-carbon">Blue Carbon</SelectItem>
                                            <SelectItem value="biochar">Biochar</SelectItem>
                                            <SelectItem value="direct-air-capture">Direct Air Capture</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.projectType && (
                                        <p className="text-sm text-red-500 mt-1">{errors.projectType}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={projectForm.location}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="Enter project location"
                                        className={errors.location ? "border-red-500" : ""}
                                    />
                                    {errors.location && (
                                        <p className="text-sm text-red-500 mt-1">{errors.location}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="totalCapacity">Total Capacity (tonnes CO2e)</Label>
                                    <Input
                                        id="totalCapacity"
                                        type="number"
                                        value={projectForm.totalCapacity}
                                        onChange={(e) => setProjectForm(prev => ({ ...prev, totalCapacity: e.target.value }))}
                                        placeholder="Enter total project capacity"
                                        className={errors.totalCapacity ? "border-red-500" : ""}
                                    />
                                    {errors.totalCapacity && (
                                        <p className="text-sm text-red-500 mt-1">{errors.totalCapacity}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Registering..." : "Register as Project Owner"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
} 