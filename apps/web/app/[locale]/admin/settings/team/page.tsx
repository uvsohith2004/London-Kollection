"use client"

import * as React from "react"
import { 
  UserPlus, 
  MoreHorizontal, 
  ShieldCheck, 
  Mail, 
  Edit3, 
  Trash2 
} from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@workspace/ui/components/dropdown-menu"

// Extended mock data to demonstrate the UI better
const TEAM_MEMBERS = [
  { id: "1", name: "Alice Admin", email: "alice@londonkollection.com", role: "admin", status: "active" },
  { id: "2", name: "Bob Manager", email: "bob@londonkollection.com", role: "manager", status: "active" },
  { id: "3", name: "Charlie Editor", email: "charlie@londonkollection.com", role: "editor", status: "invited" },
  { id: "4", name: "Diana Support", email: "diana@londonkollection.com", role: "support", status: "active" },
]

export default function SettingsTeamPage() {
  // Helper to generate initials for the avatar
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
  }

  // Helper for role badge styling
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
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
            Manage your internal roster, assign roles, and control platform permissions.
          </p>
        </div>
        <Button className="h-12 w-full shrink-0 gap-2 rounded-full px-6 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* MOBILE VIEW (< 768px)
        Stack of tactile cards. Tables do not belong on mobile.
      */}
      <div className="grid gap-4 md:hidden">
        {TEAM_MEMBERS.map((user) => (
          <div 
            key={user.id} 
            className="flex flex-col rounded-2xl border border-border/40 bg-card p-5 shadow-sm transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {getInitials(user.name)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">{user.name}</h4>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
        
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
             
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem className="gap-2 rounded-lg"><Edit3 className="h-4 w-4" /> Edit Role</DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 rounded-lg"><Mail className="h-4 w-4" /> Resend Invite</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="h-4 w-4" /> Revoke Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-4">
              <span className={cn("flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest", getRoleBadge(user.role))}>
                {user.role}
              </span>
              {user.status === "invited" && (
                <span className="rounded-full border border-border/40 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
      <div className="hidden overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm md:block">
        
        {/* List Header */}
        <div className="grid grid-cols-12 items-center border-b border-border/40 bg-muted/10 px-6 py-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          <div className="col-span-5 lg:col-span-4">Member</div>
          <div className="col-span-4 lg:col-span-4">Contact</div>
          <div className="col-span-2 lg:col-span-3">Role Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {/* List Body */}
        <div className="divide-y divide-border/40">
          {TEAM_MEMBERS.map((user) => (
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
                  <h4 className="text-sm font-medium text-foreground">{user.name}</h4>
                  {user.role === "admin" && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <ShieldCheck className="h-3 w-3 text-indigo-500" /> Full Access
                    </span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="col-span-4 truncate pr-4 lg:col-span-4">
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>

              {/* Badges */}
              <div className="col-span-2 flex flex-col items-start gap-2 lg:col-span-3 lg:flex-row lg:items-center">
                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest", getRoleBadge(user.role))}>
                  {user.role}
                </span>
                {user.status === "invited" && (
                  <span className="inline-flex rounded-full border border-border/40 bg-muted/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                  <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
                    <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer"><Edit3 className="h-4 w-4" /> Edit Permissions</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer"><Mail className="h-4 w-4" /> Resend Invite</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash2 className="h-4 w-4" /> Revoke Access
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}
