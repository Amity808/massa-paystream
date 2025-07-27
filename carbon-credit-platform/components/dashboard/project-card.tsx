"use client"

// components/dashboard/project-card.tsx
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/types"
import { MapPin, CheckCircle, Loader2, Leaf } from "lucide-react"

interface ProjectCardProps {
  project: Project
  onVerify?: (projectId: string) => void
  onMintCredits?: (projectId: string) => void
  showActions?: boolean
}

export default function ProjectCard({ project, onVerify, onMintCredits, showActions = true }: ProjectCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={project.imageUrl || "/placeholder.svg?height=200&width=300&query=carbon offset project landscape"}
          alt={project.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          {project.name}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow">
        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300 mb-2">
          <MapPin className="h-4 w-4" />
          Location: {project.location}
        </div>
        <div className="text-xl font-bold text-green-600">{project.creditsMinted} Credits Minted</div>
        <div
          className={`text-sm font-medium mt-2 flex items-center gap-1 ${
            project.status === "verified" || project.status === "active"
              ? "text-green-500"
              : project.status === "pending"
                ? "text-orange-500"
                : "text-gray-500"
          }`}
        >
          Status: {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          {project.status === "pending" && <Loader2 className="h-4 w-4 animate-spin" />}
          {(project.status === "verified" || project.status === "active") && <CheckCircle className="h-4 w-4" />}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2">
          {project.status === "pending" && onVerify && (
            <Button onClick={() => onVerify(project.id)} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Verify Project
            </Button>
          )}
          {(project.status === "verified" || project.status === "active") && onMintCredits && (
            <Button
              onClick={() => onMintCredits(project.id)}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Mint Credits
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
