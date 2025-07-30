"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { Loader2, Plus, TreePine, DollarSign, Calendar, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"

interface Project {
  id: string
  name: string
  type: string
  location: string
  totalCapacity: number
  creditsIssued: number
  activeCredits: number
  isVerified: boolean
  verificationBody: string
}

interface MintingForm {
  projectId: string
  tonnageCO2: string
  vintage: string
  creditType: string
  price: string
  verificationStandard: string
  quantity: string
  description: string
}

export default function CreditMintingPage() {
  const { currentAddress } = useUser()
  const { mintCarbonCredits, getProjectDetails, isLoading } = useContract()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [formData, setFormData] = useState<MintingForm>({
    projectId: "",
    tonnageCO2: "",
    vintage: "",
    creditType: "",
    price: "",
    verificationStandard: "",
    quantity: "",
    description: ""
  })

  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentAddress) return

      // Mock data for now - in real implementation, fetch from smart contract
      const mockProjects: Project[] = [
        {
          id: "PROJ001",
          name: "Amazon Reforestation Project",
          type: "reforestation",
          location: "Brazil",
          totalCapacity: 10000,
          creditsIssued: 2500,
          activeCredits: 2000,
          isVerified: true,
          verificationBody: "VCS"
        },
        {
          id: "PROJ002",
          name: "Solar Farm Development",
          type: "renewable-energy",
          location: "India",
          totalCapacity: 5000,
          creditsIssued: 1500,
          activeCredits: 1200,
          isVerified: true,
          verificationBody: "Gold Standard"
        },
        {
          id: "PROJ003",
          name: "Methane Capture Initiative",
          type: "methane-capture",
          location: "United States",
          totalCapacity: 3000,
          creditsIssued: 0,
          activeCredits: 0,
          isVerified: false,
          verificationBody: ""
        }
      ]

      setProjects(mockProjects)
    }

    fetchProjects()
  }, [currentAddress])

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setFormData(prev => ({
      ...prev,
      projectId: project.id,
      tonnageCO2: "1",
      vintage: new Date().getFullYear().toString(),
      creditType: "reforestation",
      price: "25",
      verificationStandard: project.verificationBody,
      quantity: "100",
      description: `Carbon credits from ${project.name}`
    }))
    setShowForm(true)
  }

  const validateForm = () => {
    if (!formData.projectId || !formData.tonnageCO2 || !formData.vintage ||
      !formData.creditType || !formData.price || !formData.verificationStandard ||
      !formData.quantity) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return false
    }

    if (Number.parseFloat(formData.tonnageCO2) <= 0 || Number.parseFloat(formData.price) <= 0 ||
      Number.parseFloat(formData.quantity) <= 0) {
      toast({
        title: "Invalid Values",
        description: "All numeric values must be greater than 0",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleMint = async () => {
    if (!validateForm()) return

    setIsMinting(true)
    try {
      const result = await mintCarbonCredits(
        formData.projectId,
        Number.parseFloat(formData.tonnageCO2),
        Number.parseInt(formData.vintage),
        formData.creditType,
        Number.parseFloat(formData.price),
        formData.verificationStandard,
        Number.parseInt(formData.quantity)
      )

      if (result.success) {
        toast({
          title: "Credits Minted Successfully",
          description: `${formData.quantity} credits have been minted from ${selectedProject?.name}`,
        })
        setShowForm(false)
        setFormData({
          projectId: "",
          tonnageCO2: "",
          vintage: "",
          creditType: "",
          price: "",
          verificationStandard: "",
          quantity: "",
          description: ""
        })
        // Refresh projects list
      } else {
        toast({
          title: "Minting Failed",
          description: result.error || "Failed to mint credits",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: "An error occurred during minting",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      "reforestation": "Reforestation",
      "renewable-energy": "Renewable Energy",
      "energy-efficiency": "Energy Efficiency",
      "methane-capture": "Methane Capture",
      "soil-carbon": "Soil Carbon",
      "blue-carbon": "Blue Carbon",
      "biochar": "Biochar",
      "direct-air-capture": "Direct Air Capture"
    }
    return labels[type] || type
  }

  const getVerificationBadgeColor = (standard: string) => {
    const colors: Record<string, string> = {
      "VCS": "bg-green-100 text-green-800",
      "Gold Standard": "bg-yellow-100 text-yellow-800",
      "CCB": "bg-blue-100 text-blue-800"
    }
    return colors[standard] || "bg-gray-100 text-gray-800"
  }

  return (
    <ProtectedRoute requiredRole={["project"]}>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Credit Minting</h2>
            <p className="text-muted-foreground">Mint carbon credits from your verified projects</p>
          </div>
        </div>

        {/* Project Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="w-5 h-5" />
              Your Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${selectedProject?.id === project.id ? 'ring-2 ring-green-500' : ''
                    }`}
                  onClick={() => handleProjectSelect(project)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                      </div>
                      <Badge
                        className={project.isVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {project.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <Badge variant="outline">{getProjectTypeLabel(project.type)}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Capacity</span>
                      <span className="font-semibold">{project.totalCapacity.toLocaleString()} tons</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Credits Issued</span>
                      <span className="font-semibold">{project.creditsIssued.toLocaleString()} tons</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Credits</span>
                      <span className="font-semibold text-green-600">{project.activeCredits.toLocaleString()} tons</span>
                    </div>

                    {project.isVerified && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Verification</span>
                        <Badge className={getVerificationBadgeColor(project.verificationBody)}>
                          {project.verificationBody}
                        </Badge>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      disabled={!project.isVerified}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProjectSelect(project)
                      }}
                    >
                      {project.isVerified ? "Mint Credits" : "Awaiting Verification"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Minting Form */}
        {showForm && selectedProject && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Mint Credits from {selectedProject.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tonnageCO2">Tonnage CO2 per Credit</Label>
                    <Input
                      id="tonnageCO2"
                      type="number"
                      step="0.01"
                      value={formData.tonnageCO2}
                      onChange={(e) => setFormData(prev => ({ ...prev, tonnageCO2: e.target.value }))}
                      placeholder="Enter tonnage per credit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity">Number of Credits</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="Enter number of credits to mint"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vintage">Vintage Year</Label>
                    <Input
                      id="vintage"
                      type="number"
                      value={formData.vintage}
                      onChange={(e) => setFormData(prev => ({ ...prev, vintage: e.target.value }))}
                      placeholder="Enter vintage year"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price per Credit (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Enter price per credit"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="creditType">Credit Type</Label>
                    <Select
                      value={formData.creditType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, creditType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit type" />
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="verificationStandard">Verification Standard</Label>
                    <Select
                      value={formData.verificationStandard}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, verificationStandard: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select verification standard" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VCS">VCS (Verified Carbon Standard)</SelectItem>
                        <SelectItem value="Gold Standard">Gold Standard</SelectItem>
                        <SelectItem value="CCB">CCB (Climate, Community & Biodiversity)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide a description of the credits being minted"
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <Card className="bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4">Minting Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Credits:</span>
                        <span className="font-semibold ml-2">{formData.quantity}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Tonnage:</span>
                        <span className="font-semibold ml-2">
                          {(Number.parseFloat(formData.tonnageCO2) * Number.parseInt(formData.quantity)).toLocaleString()} tons CO2e
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Value:</span>
                        <span className="font-semibold ml-2">
                          ${(Number.parseFloat(formData.price) * Number.parseInt(formData.quantity)).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Project:</span>
                        <span className="font-semibold ml-2">{selectedProject.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={handleMint}
                    disabled={isMinting}
                    className="flex-1"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting Credits...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Mint Credits
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
