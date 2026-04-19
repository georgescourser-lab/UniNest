'use client'

import React, { useEffect, useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'

export type ListingCapacity = 'SINGLE' | 'TWO_SHARING'
export type ListingCategory = 'BEDSITTER' | 'HOSTEL'

export interface FilterOptions {
  areas: string[]
  categories: ListingCategory[]
  capacities: ListingCapacity[]
  priceMin: number
  priceMax: number
  onlyVerified: boolean
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void
  initialFilters?: FilterOptions
}

export const kuAreaOptions = [
  'Kahawa Wendani',
  'Kahawa Sukari',
  'KM',
  'Mwihoko',
  'Githurai',
  'Ruiru',
]

const defaultFilters: FilterOptions = {
  areas: [],
  categories: [],
  capacities: [],
  priceMin: 3000,
  priceMax: 35000,
  onlyVerified: false,
}

const categoryOptions: Array<{ label: string; value: ListingCategory }> = [
  { label: 'Bedsitters', value: 'BEDSITTER' },
  { label: 'Hostels', value: 'HOSTEL' },
]

const capacityOptions: Array<{ label: string; value: ListingCapacity }> = [
  { label: 'Single', value: 'SINGLE' },
  { label: '2-sharing', value: 'TWO_SHARING' },
]

export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  initialFilters = defaultFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    area: true,
    category: true,
    capacity: true,
    price: true,
    trust: true,
  })

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleValue = <T extends string>(values: T[], value: T): T[] => {
    if (values.includes(value)) {
      return values.filter((item) => item !== value)
    }

    return [...values, value]
  }

  const handleReset = () => {
    handleFilterChange(defaultFilters)
  }

  return (
    <aside className="surface-card space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Search Filters
        </h3>
        <button
          onClick={handleReset}
          className="text-sm font-medium text-electric-blue transition hover:text-electric-green"
        >
          Reset all
        </button>
      </div>

      <FilterSection
        title="Areas"
        isExpanded={expandedSections.area}
        onToggle={() => toggleSection('area')}
      >
        <div className="flex flex-wrap gap-2">
          {kuAreaOptions.map((area) => {
            const isSelected = filters.areas.includes(area)
            return (
              <button
                key={area}
                type="button"
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    areas: toggleValue(filters.areas, area),
                  })
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'border-electric-blue bg-electric-blue/15 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-electric-green'
                }`}
              >
                {area}
              </button>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection
        title="Property Type"
        isExpanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-2">
          {categoryOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={filters.categories.includes(option.value)}
                onChange={() =>
                  handleFilterChange({
                    ...filters,
                    categories: toggleValue(filters.categories, option.value),
                  })
                }
                className="h-4 w-4 rounded border-border bg-card text-electric-blue"
              />
              {option.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Capacity"
        isExpanded={expandedSections.capacity}
        onToggle={() => toggleSection('capacity')}
      >
        <div className="space-y-2">
          {capacityOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={filters.capacities.includes(option.value)}
                onChange={() =>
                  handleFilterChange({
                    ...filters,
                    capacities: toggleValue(filters.capacities, option.value),
                  })
                }
                className="h-4 w-4 rounded border-border bg-card text-electric-blue"
              />
              {option.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        title="Price (KES/month)"
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Min: KES {filters.priceMin.toLocaleString()}
            </label>
            <input
              type="range"
              min="3000"
              max="35000"
              step="500"
              value={filters.priceMin}
              aria-label="Minimum monthly price"
              title="Minimum monthly price"
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  priceMin: Math.min(parseInt(e.target.value, 10), filters.priceMax),
                })
              }
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Max: KES {filters.priceMax.toLocaleString()}
            </label>
            <input
              type="range"
              min="3000"
              max="35000"
              step="500"
              value={filters.priceMax}
              aria-label="Maximum monthly price"
              title="Maximum monthly price"
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  priceMax: Math.max(parseInt(e.target.value, 10), filters.priceMin),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection
        title="Trust & Safety"
        isExpanded={expandedSections.trust}
        onToggle={() => toggleSection('trust')}
      >
        <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={filters.onlyVerified}
            onChange={(e) =>
              handleFilterChange({
                ...filters,
                onlyVerified: e.target.checked,
              })
            }
            className="mt-0.5 h-4 w-4 rounded border-border bg-card text-electric-blue"
          />
          <span>
            Show only verified listings
            <span className="mt-1 block text-xs text-muted-foreground">
              Skip ghost developments and only view trusted landlords.
            </span>
          </span>
        </label>
      </FilterSection>

      <div className="rounded-xl border border-electric-blue/40 bg-electric-blue/10 p-3 text-xs text-foreground">
        <p className="flex items-center gap-2 font-semibold">
          <Sparkles size={14} className="text-electric-blue" />
          No viewing fees on Uninest
        </p>
        <p className="mt-1 text-muted-foreground">
          Compare options, short-list safely, and only pay when you are ready to book.
        </p>
      </div>
    </aside>
  )
}

interface FilterSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, isExpanded, onToggle, children }) => {
  return (
    <div className="border-b border-border pb-4 last:border-b-0 last:pb-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-sm font-semibold text-foreground"
      >
        {title}
        <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default FilterPanel
