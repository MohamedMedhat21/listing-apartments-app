'use client';

import type { ProjectSummary } from '@apartments/shared';
import { ApartmentStatus } from '@apartments/shared';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListingQuery } from '@/lib/listing/use-listing-query';

const BEDROOM_OPTIONS = [
  { label: 'Any bedrooms', value: 'any' },
  { label: 'Studio (0)', value: '0' },
  { label: '1 bedroom', value: '1' },
  { label: '2 bedrooms', value: '2' },
  { label: '3 bedrooms', value: '3' },
  { label: '4+ bedrooms', value: '4' },
] as const;

const STATUS_OPTIONS = [
  { label: 'Any status', value: 'any' },
  { label: 'Available', value: ApartmentStatus.AVAILABLE },
  { label: 'Reserved', value: ApartmentStatus.RESERVED },
  { label: 'Sold', value: ApartmentStatus.SOLD },
] as const;

interface FilterPanelProps {
  projects: ProjectSummary[];
}

function FilterFields({ projects }: FilterPanelProps) {
  const { query, updateQuery } = useListingQuery();
  const selectedProject =
    query.projectId !== undefined
      ? projects.find((project) => project.id === query.projectId)
      : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor="filter-project">Project</Label>
        <Select
          value={query.projectId ?? 'any'}
          onValueChange={(nextValue) => {
            if (!nextValue) {
              return;
            }

            updateQuery({ projectId: nextValue === 'any' ? undefined : nextValue });
          }}
        >
          <SelectTrigger id="filter-project" className="min-h-11 w-full">
            <SelectValue placeholder="All projects">
              {selectedProject ? selectedProject.name : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">All projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-min-price">Min price (EGP)</Label>
        <Input
          id="filter-min-price"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="No minimum"
          className="min-h-11"
          value={query.minPrice ?? ''}
          onChange={(event) => {
            const raw = event.target.value.trim();
            updateQuery({ minPrice: raw ? Number.parseFloat(raw) : undefined });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-max-price">Max price (EGP)</Label>
        <Input
          id="filter-max-price"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="No maximum"
          className="min-h-11"
          value={query.maxPrice ?? ''}
          onChange={(event) => {
            const raw = event.target.value.trim();
            updateQuery({ maxPrice: raw ? Number.parseFloat(raw) : undefined });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-bedrooms">Bedrooms</Label>
        <Select
          value={query.bedrooms === undefined ? 'any' : String(query.bedrooms)}
          onValueChange={(nextValue) => {
            if (!nextValue) {
              return;
            }

            updateQuery({
              bedrooms: nextValue === 'any' ? undefined : Number.parseInt(nextValue, 10),
            });
          }}
        >
          <SelectTrigger id="filter-bedrooms" className="min-h-11 w-full">
            <SelectValue placeholder="Any bedrooms" />
          </SelectTrigger>
          <SelectContent>
            {BEDROOM_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-status">Status</Label>
        <Select
          value={query.status ?? 'any'}
          onValueChange={(nextValue) => {
            if (!nextValue) {
              return;
            }

            updateQuery({
              status: nextValue === 'any' ? undefined : (nextValue as ApartmentStatus),
            });
          }}
        >
          <SelectTrigger id="filter-status" className="min-h-11 w-full">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function FilterPanel({ projects }: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="hidden md:block">
        <FilterFields projects={projects} />
      </div>

      <Collapsible open={open} onOpenChange={setOpen} className="md:hidden">
        <CollapsibleTrigger
          render={
            <Button type="button" variant="outline" className="w-full justify-between">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal aria-hidden="true" className="size-4" />
                Filters
              </span>
            </Button>
          }
        />
        <CollapsibleContent className="pt-4">
          <FilterFields projects={projects} />
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
