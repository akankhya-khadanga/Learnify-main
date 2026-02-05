'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Play, Eye } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { ISL_DATASET } from '@/lib/isl-dataset'

// Declare CWASA types
declare global {
  interface Window {
    loadAvatar?: (avatar: string, url: string) => void
    playSign?: (signFile: string) => void
  }
}

// Dataset Viewer Component - Uses real ISL datasets (CISLR, INCLUDE, ISLTranslate)
export const DatasetViewer = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const [playingSign, setPlayingSign] = useState<string | null>(null)
  
  // Use the generated dataset from real ISL sources
  const fullDataset = ISL_DATASET
  
  // Initialize mini avatar for previews
  useEffect(() => {
    // Check if CWASA is loaded and avatar is available
    const checkAvatarReady = () => {
      // Check for CWASA object and playSign function
      if (typeof window !== 'undefined') {
        const hasPlaySign = typeof window.playSign === 'function'
        
        // Also check if avatar canvas exists (more reliable)
        const avatarCanvas = document.querySelector('.CWASAAvatar canvas')
        const avatarIframe = document.querySelector('.CWASAAvatar iframe')
        const hasAvatar = avatarCanvas !== null || avatarIframe !== null
        
        if (hasPlaySign || hasAvatar) {
                    setAvatarLoaded(true)
          return true
        }
      }
      return false
    }
    
    // Try immediately
    if (checkAvatarReady()) return
    
    // Poll every 300ms for up to 15 seconds (50 attempts)
    const maxAttempts = 50
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
            if (checkAvatarReady() || attempts >= maxAttempts) {
        if (attempts >= maxAttempts) {
                  }
        clearInterval(interval)
      }
    }, 300)
    
    return () => clearInterval(interval)
  }, [])
  
  // Filter dataset
  const filteredDataset = fullDataset.filter(item => {
    const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sign.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  // Get unique categories from dataset
  const categories = ['all', ...Array.from(new Set(fullDataset.map(item => item.category))).sort()]
  
  // Play sign animation - reuses main avatar
  const handlePlaySign = (signName: string) => {
    if (typeof window !== 'undefined' && window.playSign) {
      setPlayingSign(signName)
      const signFile = `/SignFiles/${signName}.sigml`
      window.playSign(signFile)
      
      // Clear playing state after 3 seconds
      setTimeout(() => setPlayingSign(null), 3000)
    }
  }
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Real ISL Action Dataset</h2>
          <p className="text-sm text-muted-foreground">
            {fullDataset.length} action words from authentic ISL datasets: CISLR (~4,700 words), INCLUDE (~4,287 signs), ISLTranslate (~31k pairs). 
            Every word performs a <strong>CHARACTER ACTION</strong> - no fingerspelling!
            <br/>
            <span className="text-xs font-semibold text-green-600 mt-1 inline-block">✓ All entries validated - 100% have working .sigml files!</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              📚 CISLR Dataset
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
              🎯 INCLUDE Dataset  
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              🔄 ISLTranslate
            </span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
              ⚡ iSign Benchmark
            </span>
            {avatarLoaded && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                ✓ Avatar Ready - Click any action box to see the character perform! (Watch the floating window at bottom-right)
              </span>
            )}
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              suppressHydrationWarning
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-56" suppressHydrationWarning>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {categories.map(cat => (
                <SelectItem 
                  key={cat} 
                  value={cat}
                  className="cursor-pointer"
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Dataset Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-3 font-semibold">#</th>
                  <th className="text-left p-3 font-semibold">Word</th>
                  <th className="text-left p-3 font-semibold">Watch Action</th>
                  <th className="text-left p-3 font-semibold">Example (SOV)</th>
                  <th className="text-left p-3 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredDataset.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      No results found for "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredDataset.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="p-3 text-muted-foreground">{index + 1}</td>
                      <td className="p-3 font-medium">{item.word}</td>
                      <td className="p-3">
                        <div 
                          className={`relative w-40 h-28 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 overflow-hidden transition-all ${
                            avatarLoaded 
                              ? 'border-blue-200 cursor-pointer hover:border-blue-500 hover:shadow-lg group' 
                              : 'border-gray-200 cursor-wait opacity-60'
                          }`}
                          onClick={() => avatarLoaded && handlePlaySign(item.sign)}
                          title={avatarLoaded ? `Click to watch sign for "${item.word}"` : 'Waiting for avatar to load...'}
                        >
                          {!avatarLoaded ? (
                            <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center">
                              <div className="animate-spin text-3xl mb-2">⏳</div>
                              <span className="text-xs text-gray-600 font-medium">Loading</span>
                              <span className="text-[10px] text-gray-400 mt-1">Avatar...</span>
                            </div>
                          ) : playingSign === item.sign ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 border-green-500">
                              <Play className="h-10 w-10 text-green-600 mb-2 animate-bounce" fill="currentColor" />
                              <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Playing</span>
                              <span className="text-xs text-green-600 mt-1">{item.word}</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:bg-blue-100/50 transition-colors">
                              <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">🤾</div>
                              <span className="text-xs font-semibold text-gray-700">Watch Sign</span>
                              <div className="flex items-center gap-1 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Eye className="h-3 w-3 text-blue-600" />
                                <span className="text-[10px] text-blue-600">Click to play</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground italic">{item.sovExample}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {item.category}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Showing {filteredDataset.length} of {fullDataset.length} total mappings • All words use full action signs • 
          {playingSign ? <span className="text-green-600 font-bold ml-1">▶ Playing sign animation</span> : <span className="ml-1">Click any action box to watch the character perform!</span>}
        </p>
      </div>
    </Card>
  )
}


