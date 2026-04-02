'use client'

import { useRef, useMemo, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import { BookOpen, X, Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

interface BookStory {
  id: string
  title: string
  slug: string
  content_text: string | null
  word_count: number | null
  created_at: string
  author: {
    username: string
    display_name: string | null
  } | null
}

// ═══════════════════════════════════════════════════════════
// Deterministic hash for consistent book appearance
// ═══════════════════════════════════════════════════════════

// Static cover images extracted from story PDF first pages
const COVER_IMAGES: Record<string, string> = {
  'the-bell-tree-and-the-broken-world': '/covers/story1-01.png',
  'the-prince-and-the-drowning-city': '/covers/story2-01.png',
  'the-ballad-of-rook-and-myx': '/covers/story3-01.png',
  'in-service-of-the-veykar': '/covers/story4-01.png',
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// Rich leather/cloth colors for book covers
const BOOK_PALETTES = [
  { cover: '#5C1A1A', spine: '#3D1111', accent: '#D4A84B', pages: '#F5F0E0' }, // Burgundy leather
  { cover: '#1A3D2E', spine: '#0F2A1E', accent: '#C5A55A', pages: '#F2ECD8' }, // Forest green
  { cover: '#1A2744', spine: '#0F1A30', accent: '#D4A84B', pages: '#F5F0E0' }, // Navy blue
  { cover: '#3D1A3D', spine: '#2A0F2A', accent: '#C5A55A', pages: '#F2ECD8' }, // Royal purple
  { cover: '#4A2A0A', spine: '#331C06', accent: '#D4A84B', pages: '#F5F0E0' }, // Aged brown
  { cover: '#1A3544', spine: '#0F2430', accent: '#C5A55A', pages: '#F2ECD8' }, // Dark teal
  { cover: '#5C2A1A', spine: '#3D1C11', accent: '#D4A84B', pages: '#F5F0E0' }, // Sienna
  { cover: '#2A1A44', spine: '#1C0F30', accent: '#C5A55A', pages: '#F2ECD8' }, // Deep indigo
  { cover: '#443A1A', spine: '#302A0F', accent: '#D4A84B', pages: '#F5F0E0' }, // Dark gold
  { cover: '#1A4444', spine: '#0F3030', accent: '#C5A55A', pages: '#F2ECD8' }, // Deep aqua
]

function getBookProps(id: string, index: number) {
  const hash = hashCode(id)
  const palette = BOOK_PALETTES[hash % BOOK_PALETTES.length]

  // Varying dimensions for natural look
  const heightBase = 2.0
  const height = heightBase + (((hash >> 3) % 8) - 4) * 0.08 // 1.68 - 2.32
  const thickness = 0.25 + ((hash >> 6) % 6) * 0.04         // 0.25 - 0.45
  const depth = 1.4 + ((hash >> 9) % 4) * 0.05              // 1.4 - 1.55

  // Tilting
  const tiltSeed = (hash >> 12) % 10
  let tiltZ = 0
  let isFlat = false
  if (tiltSeed < 2) tiltZ = -0.06  // lean left
  else if (tiltSeed < 4) tiltZ = 0.05  // lean right
  else if (tiltSeed === 9 && index > 0) isFlat = true // lay flat (not first)

  return { palette, height, thickness, depth, tiltZ, isFlat }
}

// ═══════════════════════════════════════════════════════════
// Spine Text Texture (Canvas-based for crisp rendering)
// ═══════════════════════════════════════════════════════════

function createSpineTexture(
  title: string,
  accentColor: string,
  coverColor: string,
  width: number,
  height: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  const scale = 2 // High DPI
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // Leather-like gradient base
  const grad = ctx.createLinearGradient(0, 0, width, 0)
  grad.addColorStop(0, coverColor)
  grad.addColorStop(0.3, lightenColor(coverColor, 15))
  grad.addColorStop(0.7, lightenColor(coverColor, 10))
  grad.addColorStop(1, darkenColor(coverColor, 10))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Subtle leather grain noise
  ctx.globalAlpha = 0.08
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const s = Math.random() * 1.5 + 0.5
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff'
    ctx.fillRect(x, y, s, s)
  }
  ctx.globalAlpha = 1

  // Gold accent lines (top and bottom)
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.6
  ctx.beginPath()
  ctx.moveTo(width * 0.15, 30)
  ctx.lineTo(width * 0.85, 30)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(width * 0.15, height - 30)
  ctx.lineTo(width * 0.85, height - 30)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Small decorative diamond
  ctx.fillStyle = accentColor
  ctx.globalAlpha = 0.5
  const dSize = 4
  ctx.save()
  ctx.translate(width / 2, 50)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-dSize / 2, -dSize / 2, dSize, dSize)
  ctx.restore()
  ctx.save()
  ctx.translate(width / 2, height - 50)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-dSize / 2, -dSize / 2, dSize, dSize)
  ctx.restore()
  ctx.globalAlpha = 1

  // Title text — rotated vertically
  const maxLen = 30
  const displayTitle = title.length > maxLen ? title.slice(0, maxLen - 1) + '…' : title
  const fontSize = Math.min(14, width * 0.38)

  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Gold embossed text effect
  ctx.fillStyle = darkenColor(accentColor, 30)
  ctx.fillText(displayTitle, 0, 1)
  ctx.fillStyle = accentColor
  ctx.fillText(displayTitle, 0, 0)
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent))
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent))
  const b = Math.min(255, (num & 0xff) + Math.round(2.55 * percent))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent))
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(2.55 * percent))
  const b = Math.max(0, (num & 0xff) - Math.round(2.55 * percent))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

// ═══════════════════════════════════════════════════════════
// Cover Texture (front of book when pulled off shelf)
// ═══════════════════════════════════════════════════════════

function createCoverTexture(
  title: string,
  author: string,
  accentColor: string,
  coverColor: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  const w = 512
  const h = 720
  const scale = 2
  canvas.width = w * scale
  canvas.height = h * scale
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)

  // Rich cover gradient
  const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.8)
  grad.addColorStop(0, lightenColor(coverColor, 12))
  grad.addColorStop(1, darkenColor(coverColor, 8))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Leather grain
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff'
    ctx.fillRect(x, y, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5)
  }
  ctx.globalAlpha = 1

  // Ornate border
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.5
  const m = 30 // margin
  ctx.strokeRect(m, m, w - m * 2, h - m * 2)
  // Inner border
  ctx.lineWidth = 0.5
  ctx.strokeRect(m + 8, m + 8, w - (m + 8) * 2, h - (m + 8) * 2)
  ctx.globalAlpha = 1

  // Corner ornaments
  const ornamentSize = 12
  ctx.fillStyle = accentColor
  ctx.globalAlpha = 0.6
  const corners = [
    [m + 4, m + 4],
    [w - m - 4, m + 4],
    [m + 4, h - m - 4],
    [w - m - 4, h - m - 4],
  ]
  corners.forEach(([cx, cy]) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-ornamentSize / 2, -ornamentSize / 2, ornamentSize, ornamentSize)
    ctx.restore()
  })
  ctx.globalAlpha = 1

  // Decorative line above title
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(w * 0.2, h * 0.25)
  ctx.lineTo(w * 0.8, h * 0.25)
  ctx.stroke()
  ctx.globalAlpha = 1

  // Title
  const titleLines = wrapText(ctx, title, w - 120, 'bold 28px Georgia, serif')
  ctx.font = 'bold 28px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const titleY = h * 0.38
  titleLines.forEach((line, i) => {
    const y = titleY + i * 36
    // Shadow
    ctx.fillStyle = darkenColor(accentColor, 40)
    ctx.fillText(line, w / 2, y + 1.5)
    // Main
    ctx.fillStyle = accentColor
    ctx.fillText(line, w / 2, y)
  })

  // Divider
  const divY = titleY + titleLines.length * 36 + 20
  ctx.fillStyle = accentColor
  ctx.globalAlpha = 0.4
  ctx.save()
  ctx.translate(w / 2, divY)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-4, -4, 8, 8)
  ctx.restore()
  ctx.globalAlpha = 1

  // Author
  if (author) {
    ctx.font = 'italic 18px Georgia, "Times New Roman", serif'
    ctx.fillStyle = accentColor
    ctx.globalAlpha = 0.7
    ctx.fillText(author, w / 2, divY + 40)
    ctx.globalAlpha = 1
  }

  // Decorative line below
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(w * 0.2, h * 0.75)
  ctx.lineTo(w * 0.8, h * 0.75)
  ctx.stroke()
  ctx.globalAlpha = 1

  // "Everloop Canon" at bottom
  ctx.font = '12px Georgia, serif'
  ctx.fillStyle = accentColor
  ctx.globalAlpha = 0.4
  ctx.fillText('✦ Everloop Canon ✦', w / 2, h - m - 20)
  ctx.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, font: string): string[] {
  ctx.font = font
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 3) // Max 3 lines
}

// ═══════════════════════════════════════════════════════════
// 3D Book Mesh
// ═══════════════════════════════════════════════════════════

function Book3D({
  story,
  index,
  xPos,
  isHovered,
  onHover,
  onClick,
}: {
  story: BookStory
  index: number
  xPos: number
  isHovered: boolean
  onHover: (id: string | null) => void
  onClick: (id: string) => void
}) {
  const meshRef = useRef<THREE.Group>(null)
  const props = useMemo(() => getBookProps(story.id, index), [story.id, index])
  const { palette, height, thickness, depth, tiltZ, isFlat } = props

  // Create materials
  const materials = useMemo(() => {
    const spineTexture = createSpineTexture(
      story.title,
      palette.accent,
      palette.spine,
      128,
      512,
    )

    const coverMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.cover),
      roughness: 0.65,
      metalness: 0.05,
      bumpScale: 0.02,
    })

    const spineMat = new THREE.MeshStandardMaterial({
      map: spineTexture,
      roughness: 0.6,
      metalness: 0.05,
    })

    const pageMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.pages),
      roughness: 0.9,
      metalness: 0.0,
    })

    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(palette.accent),
      roughness: 0.3,
      metalness: 0.6,
      emissive: new THREE.Color(palette.accent),
      emissiveIntensity: 0.05,
    })

    // Materials order for BoxGeometry: +x, -x, +y, -y, +z, -z
    // Right (pages top), Left (pages bottom), Top, Bottom, Front (cover), Back (spine)
    return [pageMat, pageMat, coverMat, coverMat, coverMat, spineMat]
  }, [story.title, palette])

  // Hover animation target
  const targetY = useRef(0)
  const currentY = useRef(0)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    targetY.current = isHovered ? 0.15 : 0
    currentY.current += (targetY.current - currentY.current) * Math.min(delta * 8, 1)

    if (isFlat) {
      meshRef.current.position.set(xPos, height + 0.15 + currentY.current, 0)
      meshRef.current.rotation.set(0, 0, Math.PI / 2)
    } else {
      meshRef.current.position.set(xPos, height / 2 + currentY.current, 0)
      meshRef.current.rotation.set(0, 0, tiltZ)
    }
  })

  const yPos = isFlat ? height + 0.15 : height / 2

  return (
    <group
      ref={meshRef}
      position={[xPos, yPos, 0]}
      rotation={isFlat ? [0, 0, Math.PI / 2] : [0, 0, tiltZ]}
      onPointerEnter={(e) => { e.stopPropagation(); onHover(story.id) }}
      onPointerLeave={(e) => { e.stopPropagation(); onHover(null) }}
      onClick={(e) => { e.stopPropagation(); onClick(story.id) }}
    >
      {/* Main book body */}
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[thickness, height, depth]} />
      </mesh>

      {/* Gold edge bands — top headband */}
      <mesh position={[0, height / 2 - 0.01, 0]} castShadow>
        <boxGeometry args={[thickness + 0.005, 0.02, depth + 0.005]} />
        <meshStandardMaterial
          color={palette.accent}
          roughness={0.3}
          metalness={0.7}
          emissive={palette.accent}
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Gold edge bands — bottom tailband */}
      <mesh position={[0, -height / 2 + 0.01, 0]} castShadow>
        <boxGeometry args={[thickness + 0.005, 0.02, depth + 0.005]} />
        <meshStandardMaterial
          color={palette.accent}
          roughness={0.3}
          metalness={0.7}
          emissive={palette.accent}
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Page block visible on the front edge (right side) */}
      <mesh position={[thickness / 2 + 0.008, 0, 0]} castShadow>
        <boxGeometry args={[0.015, height - 0.08, depth - 0.06]} />
        <meshStandardMaterial
          color={palette.pages}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Hover glow indicator */}
      {isHovered && (
        <pointLight
          position={[0, 0, depth / 2 + 0.3]}
          color={palette.accent}
          intensity={0.3}
          distance={1.5}
          decay={2}
        />
      )}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// Wooden Shelf
// ═══════════════════════════════════════════════════════════

function WoodenShelf({ width, yPos }: { width: number; yPos: number }) {
  const woodMaterial = useMemo(() => {
    // Procedural wood grain via canvas
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 64
    const ctx = canvas.getContext('2d')!

    // Base wood color
    const grad = ctx.createLinearGradient(0, 0, 512, 0)
    grad.addColorStop(0, '#5C3A1E')
    grad.addColorStop(0.25, '#6B4423')
    grad.addColorStop(0.5, '#5C3A1E')
    grad.addColorStop(0.75, '#704828')
    grad.addColorStop(1, '#5C3A1E')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 64)

    // Wood grain lines
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 30; i++) {
      const y = Math.random() * 64
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(128, y + (Math.random() - 0.5) * 6, 384, y + (Math.random() - 0.5) * 6, 512, y + (Math.random() - 0.5) * 4)
      ctx.stroke()
    }

    // Knots
    ctx.fillStyle = '#4A2E14'
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * 480 + 16
      const y = Math.random() * 48 + 8
      ctx.beginPath()
      ctx.ellipse(x, y, 4 + Math.random() * 3, 3 + Math.random() * 2, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 1)

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.05,
      color: new THREE.Color('#6B4423'),
    })
  }, [])

  const bracketMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3D2714'),
      roughness: 0.4,
      metalness: 0.3,
    })
  }, [])

  return (
    <group position={[0, yPos, 0]}>
      {/* Main shelf plank */}
      <mesh material={woodMaterial} castShadow receiveShadow>
        <boxGeometry args={[width + 0.4, 0.08, 1.7]} />
      </mesh>

      {/* Front lip/bevel */}
      <mesh position={[0, 0.02, 0.85]} material={woodMaterial} castShadow>
        <boxGeometry args={[width + 0.5, 0.12, 0.06]} />
      </mesh>

      {/* Metal brackets */}
      {[-width / 2 + 0.3, width / 2 - 0.3].map((bx, i) => (
        <group key={i} position={[bx, -0.15, 0.8]}>
          <mesh material={bracketMaterial} castShadow>
            <boxGeometry args={[0.04, 0.25, 0.04]} />
          </mesh>
          <mesh position={[0, -0.12, -0.06]} material={bracketMaterial} castShadow>
            <boxGeometry args={[0.04, 0.04, 0.16]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
// Bookcase Back Panel
// ═══════════════════════════════════════════════════════════

function BookcaseBack({ width, height }: { width: number; height: number }) {
  const material = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Dark stained wood
    const grad = ctx.createLinearGradient(0, 0, 0, 512)
    grad.addColorStop(0, '#1A120A')
    grad.addColorStop(0.5, '#231810')
    grad.addColorStop(1, '#1A120A')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 256, 512)

    // Vertical grain
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + (Math.random() - 0.5) * 8, 512)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping

    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.85,
      metalness: 0.02,
      color: new THREE.Color('#1E150E'),
    })
  }, [])

  return (
    <mesh position={[0, height / 2, -0.85]} material={material} receiveShadow>
      <boxGeometry args={[width + 0.6, height + 0.5, 0.05]} />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════
// Complete Shelf Row Scene
// ═══════════════════════════════════════════════════════════

function ShelfScene({
  stories,
  hoveredId,
  onHover,
  onClick,
}: {
  stories: BookStory[]
  hoveredId: string | null
  onHover: (id: string | null) => void
  onClick: (id: string) => void
}) {
  // Layout books across shelves
  const booksPerShelf = 7
  const shelfSpacing = 2.6
  const shelves: BookStory[][] = []
  for (let i = 0; i < stories.length; i += booksPerShelf) {
    shelves.push(stories.slice(i, i + booksPerShelf))
  }

  const shelfWidth = 6
  const totalHeight = shelves.length * shelfSpacing

  return (
    <>
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 6, 5]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={8}
        shadow-camera-bottom={-2}
      />
      <directionalLight position={[-2, 4, 3]} intensity={0.3} />
      {/* Warm point light for atmosphere */}
      <pointLight position={[0, totalHeight / 2, 3]} intensity={0.4} color="#D4A84B" distance={10} decay={2} />

      {/* Bookcase back panel */}
      <BookcaseBack width={shelfWidth} height={totalHeight} />

      {/* Shelves and books */}
      {shelves.map((shelfStories, shelfIdx) => {
        const shelfY = -shelfIdx * shelfSpacing
        // Calculate x positions with slight gaps
        let currentX = -shelfWidth / 2 + 0.3
        const bookPositions = shelfStories.map((story, i) => {
          const bProps = getBookProps(story.id, shelfIdx * booksPerShelf + i)
          const x = currentX + bProps.thickness / 2
          currentX += bProps.thickness + 0.02
          return { story, x, index: shelfIdx * booksPerShelf + i }
        })

        return (
          <group key={shelfIdx}>
            <WoodenShelf width={shelfWidth} yPos={shelfY} />
            {bookPositions.map(({ story, x, index: idx }) => (
              <group key={story.id} position={[0, shelfY + 0.04, 0]}>
                <Book3D
                  story={story}
                  index={idx}
                  xPos={x}
                  isHovered={hoveredId === story.id}
                  onHover={onHover}
                  onClick={onClick}
                />
              </group>
            ))}
          </group>
        )
      })}

      {/* Bottom shelf */}
      <WoodenShelf width={shelfWidth} yPos={-shelves.length * shelfSpacing} />

      {/* Floor contact shadow */}
      <ContactShadows
        position={[0, -shelves.length * shelfSpacing - 0.04, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
      />

      <Environment preset="apartment" />
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// Selected Book Overlay (HTML — pulled off shelf)
// ═══════════════════════════════════════════════════════════

function SelectedBookOverlay({
  story,
  onClose,
}: {
  story: BookStory
  onClose: () => void
}) {
  const router = useRouter()
  const [aiCoverImage, setAiCoverImage] = useState<string | null>(null)
  const [loadingCover, setLoadingCover] = useState(false)
  const palette = BOOK_PALETTES[hashCode(story.id) % BOOK_PALETTES.length]
  const authorName = story.author?.display_name || story.author?.username || 'Anonymous'

  // Use static PDF cover if available, otherwise AI-generated
  const staticCover = COVER_IMAGES[story.slug] || null
  const coverImage = staticCover || aiCoverImage

  const generateCover = useCallback(async () => {
    setLoadingCover(true)
    try {
      const res = await fetch('/api/stories/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: story.title,
          author: authorName,
          snippet: story.content_text?.slice(0, 200),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.imageUrl) setAiCoverImage(data.imageUrl)
      }
    } catch {
      // Silently fail — cover imagery is optional
    } finally {
      setLoadingCover(false)
    }
  }, [story, authorName])

  return (
    <div
      className="book-selected-overlay"
      onClick={onClose}
    >
      <div
        className="book-cover-reveal relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-20 w-10 h-10 rounded-full bg-charcoal-900/90 border border-gold/30 flex items-center justify-center text-parchment-muted hover:text-parchment hover:border-gold/60 transition-colors backdrop-blur-sm"
          aria-label="Put book back"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D-styled book cover */}
        <div
          className="book-cover-3d relative cursor-pointer group"
          onClick={() => router.push(`/stories/${story.slug}`)}
        >
          {/* Book spine (left edge) */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[18px] z-10"
            style={{
              background: `linear-gradient(90deg, ${darkenColor(palette.spine, 10)}, ${palette.spine}, ${darkenColor(palette.spine, 5)})`,
              transformOrigin: 'right center',
              transform: 'perspective(800px) rotateY(-8deg)',
              borderRadius: '2px 0 0 2px',
            }}
          />

          {/* Main cover surface */}
          <div
            className="relative w-[280px] sm:w-[320px] overflow-hidden rounded-r-md"
            style={{
              aspectRatio: coverImage ? undefined : '2 / 3',
              background: coverImage
                ? undefined
                : `radial-gradient(ellipse at 30% 30%, ${lightenColor(palette.cover, 12)}, ${palette.cover} 50%, ${darkenColor(palette.cover, 8)})`,
              boxShadow: `
                8px 8px 20px rgba(0,0,0,0.5),
                -2px 0 8px rgba(0,0,0,0.3),
                inset 2px 0 4px rgba(255,255,255,0.08),
                inset -1px 0 3px rgba(0,0,0,0.15)
              `,
              transform: 'perspective(800px) rotateY(-2deg)',
              transformOrigin: 'left center',
            }}
          >
            {/* Full cover image (from PDF first page) */}
            {coverImage ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt={`Cover of ${story.title}`}
                  className="w-full h-auto block"
                  style={{ minHeight: '400px', objectFit: 'cover' }}
                />

                {/* Page edges (right side) */}
                <div
                  className="absolute top-[4px] right-0 bottom-[4px] w-[6px]"
                  style={{
                    background: `repeating-linear-gradient(
                      to bottom,
                      ${palette.pages},
                      ${palette.pages} 1px,
                      ${darkenColor(palette.pages, 5)} 1px,
                      ${darkenColor(palette.pages, 5)} 2px
                    )`,
                    borderRadius: '0 2px 2px 0',
                    boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.15)',
                  }}
                />

                {/* Hover CTA overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-12 z-20">
                  <span className="flex items-center gap-2 text-gold font-medium text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                    <BookOpen className="w-4 h-4" />
                    Click to Read
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Fallback: styled cover without image */}

                {/* Leather texture overlay */}
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M5 0h1L0 5V4zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                />

                {/* Ornate border */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: '20px',
                    border: `1.5px solid ${palette.accent}40`,
                    borderRadius: '2px',
                  }}
                />
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: '26px',
                    border: `0.5px solid ${palette.accent}25`,
                    borderRadius: '1px',
                  }}
                />

                {/* Corner ornaments */}
                {[
                  'top-[18px] left-[18px]',
                  'top-[18px] right-[18px]',
                  'bottom-[18px] left-[18px]',
                  'bottom-[18px] right-[18px]',
                ].map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute ${pos} w-3 h-3 rotate-45 pointer-events-none`}
                    style={{ backgroundColor: `${palette.accent}50` }}
                  />
                ))}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 py-16 z-10">
                  <div
                    className="w-24 h-[1px] mb-6"
                    style={{ background: `linear-gradient(90deg, transparent, ${palette.accent}60, transparent)` }}
                  />
                  <h3
                    className="text-2xl sm:text-3xl font-serif leading-tight mb-4"
                    style={{
                      color: palette.accent,
                      textShadow: `0 1px 3px ${darkenColor(palette.cover, 20)}`,
                    }}
                  >
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-[1px]" style={{ backgroundColor: `${palette.accent}50` }} />
                    <div className="w-2 h-2 rotate-45" style={{ backgroundColor: `${palette.accent}60` }} />
                    <div className="w-6 h-[1px]" style={{ backgroundColor: `${palette.accent}50` }} />
                  </div>
                  <p className="text-sm font-serif italic mb-6 opacity-70" style={{ color: palette.accent }}>
                    by {authorName}
                  </p>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 z-10">
                  <p className="text-[10px] font-serif tracking-[0.2em] uppercase opacity-30" style={{ color: palette.accent }}>
                    ✦ Everloop Canon ✦
                  </p>
                  {story.word_count && (
                    <p className="text-[9px] opacity-20" style={{ color: palette.pages }}>
                      {story.word_count.toLocaleString()} words
                    </p>
                  )}
                </div>

                {/* Page edges (right side) */}
                <div
                  className="absolute top-[4px] right-0 bottom-[4px] w-[6px]"
                  style={{
                    background: `repeating-linear-gradient(to bottom, ${palette.pages}, ${palette.pages} 1px, ${darkenColor(palette.pages, 5)} 1px, ${darkenColor(palette.pages, 5)} 2px)`,
                    borderRadius: '0 2px 2px 0',
                    boxShadow: 'inset -1px 0 2px rgba(0,0,0,0.15)',
                  }}
                />

                {/* Hover CTA overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-12 z-20">
                  <span className="flex items-center gap-2 text-gold font-medium text-sm">
                    <BookOpen className="w-4 h-4" />
                    Click to Read
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Generate AI cover button — only for stories without a static cover */}
        {!coverImage && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              generateCover()
            }}
            disabled={loadingCover}
            className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 border border-gold/30 text-gold text-sm hover:bg-gold/20 transition-colors disabled:opacity-50"
          >
            {loadingCover ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Cover Art...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Generate AI Cover Art
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// Main Bookshelf Export
// ═══════════════════════════════════════════════════════════

interface BookshelfProps {
  stories: BookStory[]
}

export function Bookshelf({ stories }: BookshelfProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedStory = selectedId ? stories.find(s => s.id === selectedId) : null

  // Camera position based on number of shelves
  const shelfCount = Math.ceil(stories.length / 7)
  const cameraY = -(shelfCount - 1) * 1.3
  const cameraZ = 5 + shelfCount * 0.5

  return (
    <div className="bookshelf-container relative">
      <div className="relative w-full" style={{ height: `${Math.max(500, shelfCount * 260 + 100)}px` }}>
        <Canvas
          camera={{
            position: [0, cameraY, cameraZ],
            fov: 45,
            near: 0.1,
            far: 50,
          }}
          shadows
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <ShelfScene
              stories={stories}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onClick={(id) => setSelectedId(id)}
            />
          </Suspense>
        </Canvas>

        {/* Pointer cursor on hover */}
        {hoveredId && (
          <style>{`.bookshelf-container canvas { cursor: pointer !important; }`}</style>
        )}
      </div>

      {/* Selected book overlay — HTML for full interactivity */}
      {selectedStory && (
        <SelectedBookOverlay
          story={selectedStory}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}

export function BookshelfSkeleton() {
  return (
    <div className="w-full flex items-center justify-center" style={{ height: '500px' }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-gold/60 animate-spin" />
        <p className="text-sm text-parchment-muted">Loading the Library...</p>
      </div>
    </div>
  )
}
