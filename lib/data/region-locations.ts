import type { RegionId } from './regions'

export type LocationCategory = { heading: string; items: string[] }

export type RegionDirectory = {
  id: RegionId
  emoji: string
  name: string
  color: string
  categories: LocationCategory[]
}

export const WORLD_LOCATIONS: RegionDirectory[] = [
  {
    id: 'deyune', emoji: '🌾', name: 'The Deyune Steps', color: '#d4a84b',
    categories: [
      { heading: 'Settlements', items: ['Karak Camp', 'Tovin Encampment', 'Red Mile Camp', 'Sarn Flats Settlement', 'Khelt Crossing', 'Orun Field Camp'] },
      { heading: 'Towns', items: ['Ashfall Crossing', 'Nerin Post', 'Vask Hollow', 'Telmar Edge'] },
      { heading: 'Cities', items: ['Thorne Reach', 'Valen Spur'] },
      { heading: 'Outposts / Forts', items: ['Long Run Watch', 'East Wind Post', 'Step Gate Station'] },
      { heading: 'Ruins', items: ['Old Karak Stones', 'Broken Teeth Site', 'First Camp Remains'] },
      { heading: 'Taverns / Armories', items: ['The Long Fire', 'Step Barrow Forge'] },
      { heading: 'Key Features', items: ['The Long Run', 'The Standing Teeth', 'Whispering Expanse'] },
    ],
  },
  {
    id: 'ashen', emoji: '🌋', name: 'The Ashen Spine', color: '#cc5533',
    categories: [
      { heading: 'Villages', items: ['Emberfall Village', 'Korrin Hold', 'Blackridge Camp', 'Vesta Hollow'] },
      { heading: 'Towns', items: ['Cinder Vale', 'Rookforge', 'Taldrin Pass'] },
      { heading: 'Cities', items: ['Ironmark', 'Varr Keep'] },
      { heading: 'Outposts / Forts', items: ['Spine Watch', 'Furnace Post', 'High Ash Station'] },
      { heading: 'Ruins', items: ['Old Varr', 'Burnt Gate', 'Deep Core Site'] },
      { heading: 'Taverns / Armories', items: ['The Ash Line', 'Black Hammer Forge', 'Red Barrel House'] },
    ],
  },
  {
    id: 'virelay', emoji: '🌊', name: 'Virelay Coastlands', color: '#8888aa',
    categories: [
      { heading: 'Villages', items: ['Lowtide', 'Marrow Bay', 'East Dock', 'Halven Shore'] },
      { heading: 'Towns', items: ['Kelport', 'Darnis Bay', 'Coris Reach'] },
      { heading: 'Cities', items: ['Virelay'] },
      { heading: 'Outposts / Forts', items: ['Cliffwatch', 'Harbor Post 3', 'Tide Gate'] },
      { heading: 'Ruins / Anomalies', items: ['The Drowned City', 'The Well Site', 'Old Harbor'] },
      { heading: 'Taverns', items: ['The Salt House', 'Broken Mast', 'Low Lantern'] },
    ],
  },
  {
    id: 'varnhalt', emoji: '🏕️', name: 'Varnhalt Frontier', color: '#a08050',
    categories: [
      { heading: 'Villages', items: ['Dry Creek', 'Talon Ridge Camp', 'Brack Hollow', 'Pine Run'] },
      { heading: 'Towns', items: ['Varnhalt', 'West Varnhalt', 'Drellin Post', 'Korr Field'] },
      { heading: 'Cities', items: ['High Ridge Market', 'Farpoint'] },
      { heading: 'Outposts / Forts', items: ['North Watch', 'Timber Post', 'Ridge Line Station'] },
      { heading: 'Ruins', items: ['Old Varnhalt', 'Burn Camp Site', 'Stone Line Remains'] },
      { heading: 'Taverns', items: ['The Split Table', 'Red Knife Tavern', 'Last Light'] },
      { heading: 'Key Location', items: ['The Black Stone Tower'] },
    ],
  },
  {
    id: 'bellroot', emoji: '🌲', name: 'Bellroot Vale', color: '#50c070',
    categories: [
      { heading: 'Villages', items: ['Merrow Bend', 'Tallpine', 'Rootfall', 'Green Hollow'] },
      { heading: 'Towns', items: ['Drelmere', 'East Drelmere', "Halrick's Reach"] },
      { heading: 'Cities', items: ['Bellroot Crossing', 'South Vale Cluster'] },
      { heading: 'Outposts', items: ['Root Watch', 'Vale Station', 'North Path Post'] },
      { heading: 'Ruins', items: ['Old Bellroot Site', 'First Root Chamber', 'Lost Grove'] },
      { heading: 'Taverns', items: ['The Quiet Bell', 'Root & Stone', 'The Low Fire'] },
      { heading: 'Key Location', items: ['The Bell Tree'] },
    ],
  },
  {
    id: 'glass', emoji: '🪞', name: 'Glass Expanse', color: '#c0c8d0',
    categories: [
      { heading: 'Settlements', items: ['Shard Camp', 'Mirror Post', 'Drylight Camp'] },
      { heading: 'Towns', items: ['Glass Reach', 'Twinmark', 'Clearline'] },
      { heading: 'Cities', items: ['Prism City', 'Vell Glass'] },
      { heading: 'Outposts', items: ['Reflection Station', 'West Mirror Post'] },
      { heading: 'Ruins', items: ['Old Prism', 'Split Site', 'Echo Ruins'] },
      { heading: 'Taverns', items: ['The Second Face', 'Clear Glass House'] },
    ],
  },
  {
    id: 'luminous', emoji: '✨', name: 'Luminous Fold', color: '#e0d890',
    categories: [
      { heading: 'Settlements', items: ['Order Field', 'Line Camp'] },
      { heading: 'Towns', items: ['Symmetry', 'East Order', 'Venn'] },
      { heading: 'Cities', items: ['Lumina', 'Central Fold'] },
      { heading: 'Outposts', items: ['Grid Station 1', 'Grid Station 2', 'Grid Station 3', 'Grid Station 4', 'Grid Station 5', 'Grid Station 6', 'Axis Watch'] },
      { heading: 'Ruins', items: ['Broken Line', 'Old Fold Node'] },
      { heading: 'Taverns', items: ['The Even Table', 'The Quiet Line'] },
    ],
  },
  {
    id: 'drowned', emoji: '🌊', name: 'Drowned Reach', color: '#509088',
    categories: [
      { heading: 'Settlements', items: ['Lowwater', 'Drift Camp', 'Salt Edge'] },
      { heading: 'Towns', items: ['New Harbor', 'West Reach', 'Floodmark'] },
      { heading: 'Cities', items: ['Deep Reach', 'Sunken Port'] },
      { heading: 'Outposts', items: ['Tide Watch', 'Flood Station'] },
      { heading: 'Ruins', items: ['The Sunken City', 'Old Reach', 'Drowned Gate'] },
      { heading: 'Taverns', items: ['The Wet Lantern', 'Last Dock', 'Salt Line'] },
    ],
  },
]

export function getRegionLocations(regionId: string): RegionDirectory | undefined {
  return WORLD_LOCATIONS.find((r) => r.id === regionId)
}
