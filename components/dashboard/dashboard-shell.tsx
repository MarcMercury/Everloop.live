'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PenLine, Gamepad2 } from 'lucide-react'

interface DashboardShellProps {
  writingContent: React.ReactNode
  playingContent: React.ReactNode
}

export function DashboardShell({ writingContent, playingContent }: DashboardShellProps) {
  return (
    <Tabs defaultValue="writing" className="space-y-8">
      <TabsList className="grid w-full max-w-md grid-cols-2 bg-teal-deep/50 border border-gold/10">
        <TabsTrigger value="writing" className="gap-2 text-base data-[state=active]:bg-teal-rich data-[state=active]:text-gold">
          <PenLine className="w-4 h-4" />
          Writing
        </TabsTrigger>
        <TabsTrigger value="playing" className="gap-2 text-base data-[state=active]:bg-teal-rich data-[state=active]:text-gold">
          <Gamepad2 className="w-4 h-4" />
          Playing
        </TabsTrigger>
      </TabsList>

      <TabsContent value="writing">
        {writingContent}
      </TabsContent>

      <TabsContent value="playing">
        {playingContent}
      </TabsContent>
    </Tabs>
  )
}
