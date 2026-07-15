"use client"

import * as React from "react"
import {
  UserPlus,
  MoreHorizontal,
  ShieldCheck,
  Mail,
  Edit3,
  Trash2,
  Loader2,
  Search,
} from "lucide-react"
import { inviteAdmin } from "./action"
import { useDebounce } from "@/hooks/use-debounce"
import { searchAdminUsers } from "@/api-client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Input } from "@workspace/ui/components/input"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export default function SettingsTeamPage({
  initialUsers = [],
}: {
  initialUsers: any[]
}) {
  const [search, setSearch] = React.useState("")
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)
  const router = useRouter()

  const { data: session } = authClient.useSession()
  const isAdmin = session?.user?.role === "admin"

  // Filter users to only show admins (and pending invites if any), and apply local search
  const teamMembers = React.useMemo(() => {
    return initialUsers
      .filter((u) => u.role === "admin")
      .filter((u) => {
        if (!search) return true
        const s = search.toLowerCase()
        return (
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
        )
      })
  }, [initialUsers, search])

  // Helper to generate initials for the avatar
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Helper for role badge styling
  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
      case "manager":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      case "editor":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      default:
        return "bg-muted text-muted-foreground border-border/40"
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16 font-sans">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Team & Access
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your internal roster, assign roles, and control platform
            permissions.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-full border-border/40 pl-9"
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => setIsInviteOpen(true)}
              className="h-10 shrink-0 gap-2 rounded-full px-6 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="h-4 w-4" />
              Invite Admin
            </Button>
          )}
        </div>
      </div>

      {/* MOBILE VIEW (< 768px)
        Stack of tactile cards. Tables do not belong on mobile.
      */}
      <div className="grid gap-4 md:hidden">
        {teamMembers.map((user: any) => (
          <div
            key={user.id}
            className="flex flex-col rounded-2xl border border-border/40 bg-card p-5 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {getInitials(user.name)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">
                    {user.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem className="gap-2 rounded-lg">
                    <Edit3 className="h-4 w-4" /> Edit Role
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 rounded-lg">
                    <Mail className="h-4 w-4" /> Resend Invite
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash2 className="h-4 w-4" /> Revoke Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-4">
              <span
                className={cn(
                  "flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase",
                  getRoleBadge(user.role)
                )}
              >
                {user.role}
              </span>
              {user.status === "invited" && (
                <span className="rounded-full border border-border/40 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Pending
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* TABLET & DESKTOP VIEW (>= 768px)
        A unified, soft-bordered list that expands beautifully on larger screens.
      */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/40 bg-card md:block">
        {/* List Header */}
        <div className="grid grid-cols-12 items-center border-b border-border/40 bg-muted/10 px-6 py-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          <div className="col-span-5 lg:col-span-4">Member</div>
          <div className="col-span-4 lg:col-span-4">Contact</div>
          <div className="col-span-2 lg:col-span-3">Role Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* List Body */}
        <div className="divide-y divide-border/40">
          {teamMembers.map((user: any) => (
            <div
              key={user.id}
              className="grid grid-cols-12 items-center px-6 py-4 transition-colors hover:bg-muted/20"
            >
              {/* Name & Avatar */}
              <div className="col-span-5 flex items-center gap-4 lg:col-span-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {getInitials(user.name)}
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-medium text-foreground">
                    {user.name}
                  </h4>
                  {user.role === "admin" && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <ShieldCheck className="h-3 w-3 text-indigo-500" /> Full
                      Access
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="col-span-4 truncate pr-4 lg:col-span-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>

              {/* Badges */}
              <div className="col-span-2 flex flex-col items-start gap-2 lg:col-span-3 lg:flex-row lg:items-center">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase",
                    getRoleBadge(user.role)
                  )}
                >
                  {user.role}
                </span>
                {user.status === "invited" && (
                  <span className="inline-flex rounded-full border border-border/40 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Pending
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg">
                      <Edit3 className="h-4 w-4" /> Edit Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg">
                      <Mail className="h-4 w-4" /> Resend Invite
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="h-4 w-4" /> Revoke Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InviteAdminDialog open={isInviteOpen} onOpenChange={setIsInviteOpen} />
    </div>
  )
}

function InviteAdminDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [users, setUsers] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [isInviting, setIsInviting] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    if (debouncedSearch) {
      setIsLoading(true)
      searchAdminUsers(debouncedSearch).then((res: any) => {
        const found = res?.data || res?.items || (Array.isArray(res) ? res : [])
        // Only show users who are not already admins
        setUsers(found.filter((u: any) => u.role !== "admin"))
        setIsLoading(false)
      })
    } else {
      setUsers([])
    }
  }, [debouncedSearch])

  const handleInvite = async () => {
    if (!selectedUser) return
    setIsInviting(true)
    const res = await inviteAdmin(selectedUser.id)
    setIsInviting(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success(
        `${selectedUser.name || selectedUser.email} is now an admin!`
      )
      onOpenChange(false)
      setSelectedUser(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Admin</DialogTitle>
          <DialogDescription>
            Search for an existing user and upgrade their role to Admin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedUser
                    ? selectedUser.name || selectedUser.email
                    : "Search user by name or email..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              }
            />

            <PopoverContent className="w-[380px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search user..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoading ? "Searching..." : "No users found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {users.map((user) => (
                      <CommandItem
                        key={user.id}
                        value={user.email}
                        onSelect={() => setSelectedUser(user)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedUser?.id === user.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {user.name || user.email}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedUser || isInviting} onClick={handleInvite}>
            {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Make Admin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
