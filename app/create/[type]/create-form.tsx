'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Sparkles, 
  ImageIcon, 
  RefreshCw, 
  Check, 
  Loader2,
  Save,
  ArrowLeft 
} from 'lucide-react'
import Link from 'next/link'
import { 
  generateEntityDescription, 
  generateEntityImage, 
  saveEntity,
  type EntityType 
} from '@/lib/actions/create'

// ═══════════════════════════════════════════════════════════
// TYPE-SPECIFIC CONFIGURATIONS
// Each entity type has tailored prompts, placeholders, and hints
// ═══════════════════════════════════════════════════════════

interface TypeConfig {
  label: string
  namePlaceholder: string
  nameHint: string
  taglinePlaceholder: string
  taglineHint: string
  taglineExample: string
  descriptionPlaceholder: string
  descriptionHints: string[]
  emptyImageHint: string
}

const typeConfigs: Record<EntityType, TypeConfig> = {
  character: {
    label: 'Character',
    namePlaceholder: 'Kaelen Voss, The Drift Warden...',
    nameHint: 'Names in the Everloop often carry meaning—titles, epithets, or echoes of past lives.',
    taglinePlaceholder: 'A soul caught between two ages...',
    taglineHint: 'Capture their essence in a single breath. What defines them?',
    taglineExample: '"The last keeper of the Unwritten Oath"',
    descriptionPlaceholder: `Who is this person? Consider:

• Their role in the world—are they a wanderer, a scholar, a forgotten ruler?
• What drives them—duty, revenge, love, or something they cannot name?
• Physical presence—how do others perceive them when they enter a room?
• Their connection to the Loops—are they aware of time's cycles?
• Secrets they carry—what do they hide, even from themselves?`,
    descriptionHints: [
      'What haunts them from a past Loop?',
      'What relationship defines them most?',
      'What would they sacrifice everything for?',
    ],
    emptyImageHint: 'Describe your character\'s appearance and presence, then generate their portrait',
  },
  
  location: {
    label: 'Location',
    namePlaceholder: 'The Hollow Spire, Verandell Harbor...',
    nameHint: 'Places in the Everloop have names that echo through time—some remembered, some forbidden.',
    taglinePlaceholder: 'Where the sea meets the sky\'s tears...',
    taglineHint: 'Evoke the feeling of arriving here for the first time.',
    taglineExample: '"A lighthouse that guides ships to shores that no longer exist"',
    descriptionPlaceholder: `Paint this place into existence. Consider:

• The atmosphere—what does one feel upon arriving? Dread? Wonder? Peace?
• Sensory details—the sounds, smells, textures that make it real
• History echoes—what happened here that left its mark?
• The Loop's touch—does time flow strangely here? What persists?
• Who dwells here—or what drove them away?`,
    descriptionHints: [
      'What secret does this place guard?',
      'How has it changed across the Loops?',
      'What draws travelers here despite the danger?',
    ],
    emptyImageHint: 'Describe the atmosphere and landmarks, then generate concept art of this place',
  },
  
  creature: {
    label: 'Creature',
    namePlaceholder: 'Veilstalker, Ember Wraith, The Hollow King...',
    nameHint: 'Creatures often earn names from those who survive encountering them.',
    taglinePlaceholder: 'Born from the space between heartbeats...',
    taglineHint: 'What whispered warning would travelers share about this being?',
    taglineExample: '"It wears the faces of those who trusted too easily"',
    descriptionPlaceholder: `Bring this being to life. Consider:

• Its nature—is it a beast, a spirit, something that defies categorization?
• Origins—was it created, evolved, or did it simply always exist?
• Behavior—how does it hunt, communicate, or interact with the world?
• The threat or wonder it represents—is it dangerous, sacred, or both?
• Its place in the Loop—does it remember past cycles? Does it transcend them?`,
    descriptionHints: [
      'What do people get wrong about this creature?',
      'Is there a way to survive an encounter?',
      'What does it want that mortals cannot understand?',
    ],
    emptyImageHint: 'Detail the creature\'s form and nature, then generate its visual design',
  },
}

interface CreateEntityFormProps {
  type: EntityType
}

export function CreateEntityForm({ type }: CreateEntityFormProps) {
  const config = typeConfigs[type]
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Rotate through description hints as inspiration
  const [hintIndex, setHintIndex] = useState(0)
  const currentHint = config.descriptionHints[hintIndex]

  const handleExpandDescription = async () => {
    if (!name.trim()) {
      setError('Please enter a name first')
      return
    }
    
    setError(null)
    setIsGeneratingText(true)
    
    try {
      const result = await generateEntityDescription({
        name,
        tagline,
        type,
        existingDescription: description || undefined,
      })
      
      if (result.success && result.description) {
        setDescription(result.description)
      } else {
        setError(result.error || 'Failed to generate description')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsGeneratingText(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!name.trim() || !description.trim()) {
      setError('Please enter a name and description first')
      return
    }
    
    setError(null)
    setIsGeneratingImage(true)
    
    try {
      const result = await generateEntityImage({
        name,
        type,
        description,
      })
      
      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl)
      } else {
        setError(result.error || 'Failed to generate image')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !tagline.trim() || !description.trim()) {
      setError('Please fill in all required fields')
      return
    }
    
    setError(null)
    setIsSaving(true)
    
    try {
      const result = await saveEntity({
        name,
        tagline,
        description,
        type,
        imageUrl: imageUrl || undefined,
      })
      
      if (result.success) {
        router.push('/roster')
      } else {
        setError(result.error || 'Failed to save entity')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-parchment">
                  Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={config.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-teal-deep/50"
                />
                <p className="text-xs text-parchment-muted">
                  {config.nameHint}
                </p>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label htmlFor="tagline" className="text-parchment">
                  Tagline <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="tagline"
                  placeholder={config.taglinePlaceholder}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="bg-teal-deep/50"
                />
                <p className="text-xs text-parchment-muted">
                  {config.taglineHint}
                </p>
                <p className="text-xs text-gold/60 italic">
                  Example: {config.taglineExample}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-parchment">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleExpandDescription}
                    disabled={isGeneratingText || !name.trim()}
                    className="text-gold hover:text-gold/80 gap-1"
                  >
                    {isGeneratingText ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {description ? 'Expand' : 'Generate'} with AI
                  </Button>
                </div>
                <textarea
                  id="description"
                  placeholder={config.descriptionPlaceholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 bg-teal-deep/50 border border-gold/20 rounded-md text-parchment placeholder:text-parchment-muted/50 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none"
                />
                {/* Rotating inspiration hints */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gold/50 italic">
                    💡 {currentHint}
                  </p>
                  <button
                    type="button"
                    onClick={() => setHintIndex((i) => (i + 1) % config.descriptionHints.length)}
                    className="text-xs text-parchment-muted hover:text-gold transition-colors"
                  >
                    Another prompt →
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Image Section */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-parchment">Concept Art</Label>
                  {!imageUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !name.trim() || !description.trim()}
                      className="text-gold hover:text-gold/80 gap-1"
                    >
                      {isGeneratingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                      Generate Art
                    </Button>
                  )}
                </div>

                {/* Image Preview Area */}
                <div className="aspect-square rounded-lg border border-gold/20 bg-teal-deep/30 overflow-hidden relative">
                  {isGeneratingImage ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                      <p className="text-parchment-muted text-sm">Generating concept art...</p>
                      <p className="text-parchment-muted/60 text-xs mt-1">This may take a moment</p>
                    </div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name || 'Generated concept art'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-parchment-muted/30 mb-4" />
                      <p className="text-parchment-muted/60 text-sm text-center px-8">
                        {config.emptyImageHint}
                      </p>
                    </div>
                  )}
                </div>

                {/* Image Actions */}
                {imageUrl && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="flex-1 gap-1"
                    >
                      <RefreshCw className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                      disabled
                    >
                      <Check className="w-4 h-4" />
                      Kept
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link href="/create" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Button
              onClick={handleSave}
              disabled={isSaving || !name.trim() || !tagline.trim() || !description.trim()}
              className="flex-1 gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save to Roster
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
