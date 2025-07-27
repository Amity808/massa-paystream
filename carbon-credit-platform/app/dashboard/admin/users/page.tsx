// app/dashboard/admin/users/page.tsx
"use client"

import { Label } from "@/components/ui/label"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useContract } from "@/hooks/use-contract"
import { Loader2, Trash, UserPlus } from "lucide-react"
import type { UserRole, User } from "@/lib/types"
import { Input } from "@/components/ui/input"

export default function UserManagementPage() {
  const { getMockData, addVerifier, removeVerifier, loading, error } = useContract()
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [newVerifierAddress, setNewVerifierAddress] = useState("")
  const [newVerifierName, setNewVerifierName] = useState("")
  const [addVerifierLoading, setAddVerifierLoading] = useState(false)
  const [addVerifierError, setAddVerifierError] = useState<string | null>(null)
  const [addVerifierSuccess, setAddVerifierSuccess] = useState<string | null>(null)

  const fetchUsers = () => {
    const companies = getMockData.companies()
    const projects = getMockData.projects() // Project owners are users
    const verifiers = getMockData.verifiers()
    const admins = getMockData.admins()

    // Combine and deduplicate users by address
    const combinedUsersMap = new Map<string, User>()
    ;[
      ...companies,
      ...projects.map((p) => ({ address: p.ownerId, role: "Project Owner" as UserRole, name: `Owner of ${p.name}` })),
      ...verifiers,
      ...admins,
    ].forEach((user) => {
      if (user.address) {
        combinedUsersMap.set(user.address, user)
      }
    })
    setAllUsers(Array.from(combinedUsersMap.values()))
  }

  useEffect(() => {
    fetchUsers()
  }, [getMockData])

  const handleAddVerifier = async () => {
    if (!newVerifierAddress || !newVerifierName) {
      setAddVerifierError("Address and Name are required for new verifier.")
      return
    }
    setAddVerifierLoading(true)
    setAddVerifierError(null)
    setAddVerifierSuccess(null)

    const result = await addVerifier(newVerifierAddress, newVerifierName)
    if (result?.success) {
      setAddVerifierSuccess(`Verifier ${newVerifierName} added successfully!`)
      setNewVerifierAddress("")
      setNewVerifierName("")
      fetchUsers() // Re-fetch users to update list
    } else {
      setAddVerifierError(result?.message || "Failed to add verifier.")
    }
    setAddVerifierLoading(false)
  }

  const handleRemoveVerifier = async (address: string) => {
    if (!confirm(`Are you sure you want to remove verifier ${address}?`)) return

    const result = await removeVerifier(address)
    if (result?.success) {
      alert("Verifier removed successfully!")
      fetchUsers() // Re-fetch users to update list
    } else {
      alert(result?.message || "Failed to remove verifier.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <p className="ml-4 text-lg">Loading user data...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-error text-center py-8">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>Add New Verifier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="verifier-address">Verifier Wallet Address</Label>
              <Input
                id="verifier-address"
                placeholder="Enter Massa wallet address"
                value={newVerifierAddress}
                onChange={(e) => setNewVerifierAddress(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="verifier-name">Verifier Name</Label>
              <Input
                id="verifier-name"
                placeholder="e.g., EcoAudit Solutions"
                value={newVerifierName}
                onChange={(e) => setNewVerifierName(e.target.value)}
              />
            </div>
          </div>
          {addVerifierError && <p className="text-error text-sm">{addVerifierError}</p>}
          {addVerifierSuccess && <p className="text-success text-sm">{addVerifierSuccess}</p>}
          <Button
            onClick={handleAddVerifier}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            disabled={addVerifierLoading}
          >
            {addVerifierLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" /> Add Verifier
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Address</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Name/Company</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  allUsers.map((user) => (
                    <TableRow key={user.address}>
                      <TableCell className="font-medium truncate max-w-[150px]">{user.address}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.name || user.companyName || "N/A"}</TableCell>
                      <TableCell>
                        {user.role === "Verifier" && (
                          <Button variant="destructive" size="sm" onClick={() => handleRemoveVerifier(user.address)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove Verifier</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
