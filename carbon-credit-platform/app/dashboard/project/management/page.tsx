// app/dashboard/project/management/page.tsx
"use client"

import ProjectRegistrationForm from "@/components/forms/project-registration-form"
import ProjectCard from "@/components/dashboard/project-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContract } from "@/hooks/use-contract"
import { useUser } from "@/contexts/user-context"
import { useEffect, useState } from "react"
import type { Project } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function ProjectManagementPage() {
  const { getMockData, loading, error } = useContract()
  const { currentAddress } = useUser()
  const [myProjects, setMyProjects] = useState<Project[]>([])

  const fetchProjects = () => {
    if (currentAddress) {
      const allProjects = getMockData.projects()
      const ownerProjects = allProjects.filter((p) => p.ownerId === currentAddress)
      setMyProjects(ownerProjects)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [currentAddress, getMockData])

  // Mock actions for project management (actual logic would be in useContract)
  const handleVerify = (projectId: string) => {
    alert(`Simulating verification for project: ${projectId}`)
    // In a real app, this would be a call to verifyProject(projectId, currentAddress)
    fetchProjects() // Re-fetch to update status
  }

  const handleMintCredits = (projectId: string) => {
    alert(`Simulating minting credits for project: ${projectId}`)
    // In a real app, this would navigate to the minting page or open a modal
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading project data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProjectRegistrationForm />
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {myProjects.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">You have not registered any projects yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onVerify={handleVerify}
                  onMintCredits={handleMintCredits}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
