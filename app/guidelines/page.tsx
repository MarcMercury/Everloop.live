import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Sparkles,
  Users,
  Shield,
  PenLine
} from 'lucide-react'

export const metadata = {
  title: 'Writing Guidelines | Everloop',
  description: 'Guidelines for contributing to the Everloop canon',
}

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-parchment mb-4">
            Writing <span className="text-gold">Guidelines</span>
          </h1>
          <p className="text-parchment-muted text-lg">
            Everything you need to know about contributing stories to the Everloop canon.
          </p>
        </div>

        {/* Core Principles */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-parchment mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-gold" />
            Core Principles
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-4">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-parchment">Respect the Canon</h3>
                  <p className="text-parchment-muted text-sm">
                    The Everloop has established lore, characters, and locations. Your stories should 
                    fit within this framework, not contradict it. Use the Archive to research existing canon.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-parchment">Expand, Don&apos;t Override</h3>
                  <p className="text-parchment-muted text-sm">
                    Add to the world rather than changing what exists. Fill in gaps, explore untold 
                    stories, and create new characters that complement the existing cast.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-parchment">Maintain Tone</h3>
                  <p className="text-parchment-muted text-sm">
                    The Everloop is a world of mystery, ancient magic, and looping time. Stories should 
                    maintain a fantasy atmosphere with hints of cosmic significance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What We Look For */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-parchment mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-gold" />
            What We Look For
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gold" />
                  Strong Storytelling
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-parchment-muted">
                Compelling narratives with clear structure, engaging characters, and 
                meaningful conflict. Quality prose that draws readers in.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-gold" />
                  Canon Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-parchment-muted">
                Stories that reference existing lore naturally, not forced. Characters 
                that feel like they belong in the Everloop universe.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-gold" />
                  Original Voice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-parchment-muted">
                Your unique perspective and style. We want diverse voices contributing 
                to the tapestry of the Everloop.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-gold" />
                  Careful Worldbuilding
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-parchment-muted">
                New elements that enrich without overpowering. If you introduce something 
                new, consider how it affects the broader world.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What to Avoid */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-parchment mb-6 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-400" />
            What to Avoid
          </h2>
          <Card className="border-red-500/20">
            <CardContent className="pt-6 space-y-3">
              <div className="flex gap-3 text-sm">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-parchment-muted">
                  <strong className="text-parchment">Canon Contradictions:</strong> Don&apos;t kill established 
                  characters, destroy major locations, or contradict known history without approval.
                </span>
              </div>
              <div className="flex gap-3 text-sm">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-parchment-muted">
                  <strong className="text-parchment">Overpowered Elements:</strong> Avoid introducing 
                  all-powerful artifacts, godlike characters, or reality-breaking magic.
                </span>
              </div>
              <div className="flex gap-3 text-sm">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-parchment-muted">
                  <strong className="text-parchment">Modern References:</strong> The Everloop is a fantasy world. 
                  Avoid anachronisms, pop culture references, or modern technology.
                </span>
              </div>
              <div className="flex gap-3 text-sm">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-parchment-muted">
                  <strong className="text-parchment">Gratuitous Content:</strong> While the Everloop can be dark, 
                  avoid excessive violence, explicit content, or content that exists purely for shock value.
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Submission Process */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-parchment mb-6">The Submission Process</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-parchment">Write Your Story</h3>
                <p className="text-parchment-muted text-sm">
                  Use the Write page to craft your story. Reference canon entities to ensure consistency.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-parchment">AI Review</h3>
                <p className="text-parchment-muted text-sm">
                  When you submit, our AI analyzes your story for canon consistency and provides feedback.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-parchment">Curator Review</h3>
                <p className="text-parchment-muted text-sm">
                  Lorekeepers review submissions, considering both quality and canon alignment.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-semibold shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-parchment">Canon Status</h3>
                <p className="text-parchment-muted text-sm">
                  Approved stories become part of the Everloop canon, accessible in the Archive forever.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-gold/10">
          <p className="text-parchment-muted mb-4">Ready to contribute to the Everloop?</p>
          <div className="flex gap-4 justify-center">
            <Link href="/explore">
              <Button variant="outline">Explore the Archive</Button>
            </Link>
            <Link href="/write">
              <Button>Start Writing</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
