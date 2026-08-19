'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ApartmentStatus,
  createApartmentFormSchema,
  toCreateApartmentRequest,
  type CreateApartmentFormOutput,
  type CreateApartmentFormValues,
  type ProjectSummary,
} from '@apartments/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth/auth-context';
import { ApiError } from '@/lib/api/client';
import { createBrowserApiClient } from '@/lib/api/browser';
import { applyCreateApartmentApiError } from '@/lib/forms/map-create-apartment-error';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { label: 'Available', value: ApartmentStatus.AVAILABLE },
  { label: 'Reserved', value: ApartmentStatus.RESERVED },
  { label: 'Sold', value: ApartmentStatus.SOLD },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function CreateApartmentForm() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateApartmentFormValues, unknown, CreateApartmentFormOutput>({
    resolver: zodResolver(createApartmentFormSchema),
    defaultValues: {
      unitName: '',
      unitNumber: '',
      projectId: '',
      price: '',
      bedrooms: 0,
      bathrooms: 0,
      areaSqm: '',
      description: '',
      floor: '',
      address: '',
      status: ApartmentStatus.AVAILABLE,
      amenitiesText: '',
      imageUrlsText: '',
    },
  });

  useEffect(() => {
    createBrowserApiClient()
      .listProjects()
      .then((response) => setProjects(response.data))
      .catch(() => setProjectsError('Unable to load projects. Refresh the page and try again.'));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (!accessToken) {
      setFormError('You must be logged in to add an apartment.');
      return;
    }

    setFormError(null);

    try {
      const created = await createBrowserApiClient().createApartment(
        toCreateApartmentRequest(values),
        accessToken,
      );
      router.push(`/apartments/${created.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        applyCreateApartmentApiError(error, setError, setFormError);
        return;
      }

      setFormError('Unable to create the apartment. Try again in a moment.');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="unitName">Unit name</Label>
          <Input id="unitName" className="min-h-11" {...register('unitName')} />
          <FieldError message={errors.unitName?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitNumber">Unit number</Label>
          <Input id="unitNumber" className="min-h-11" {...register('unitNumber')} />
          <FieldError message={errors.unitNumber?.message} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="projectId">Project</Label>
          <Controller
            control={control}
            name="projectId"
            render={({ field }) => {
              const selectedProject = projects.find((project) => project.id === field.value);

              return (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value);
                    }
                  }}
                >
                  <SelectTrigger id="projectId" className="min-h-11 w-full">
                    <SelectValue placeholder="Select a project">
                      {selectedProject
                        ? `${selectedProject.name} · ${selectedProject.city}`
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} · {project.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {projectsError ? <FieldError message={projectsError} /> : null}
          <FieldError message={errors.projectId?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (EGP)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            className="min-h-11"
            {...register('price')}
          />
          <FieldError message={errors.price?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="areaSqm">Area (m²)</Label>
          <Input
            id="areaSqm"
            type="number"
            min={0}
            step="0.01"
            className="min-h-11"
            {...register('areaSqm')}
          />
          <FieldError message={errors.areaSqm?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min={0}
            step="1"
            className="min-h-11"
            {...register('bedrooms')}
          />
          <FieldError message={errors.bedrooms?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min={0}
            step="1"
            className="min-h-11"
            {...register('bathrooms')}
          />
          <FieldError message={errors.bathrooms?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor">Floor</Label>
          <Input id="floor" type="number" step="1" className="min-h-11" {...register('floor')} />
          <FieldError message={errors.floor?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value ?? ApartmentStatus.AVAILABLE}
                onValueChange={(value) => {
                  if (value) {
                    field.onChange(value as ApartmentStatus);
                  }
                }}
              >
                <SelectTrigger id="status" className="min-h-11 w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.status?.message} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" className="min-h-11" {...register('address')} />
          <FieldError message={errors.address?.message} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={4}
            className={cn(
              'min-h-11 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            )}
            {...register('description')}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="amenitiesText">Amenities</Label>
          <textarea
            id="amenitiesText"
            rows={4}
            placeholder="One amenity per line"
            className={cn(
              'min-h-11 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            )}
            {...register('amenitiesText')}
          />
          <FieldError message={errors.amenitiesText?.message} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="imageUrlsText">Image URLs</Label>
          <textarea
            id="imageUrlsText"
            rows={4}
            placeholder="One http or https URL per line"
            className={cn(
              'min-h-11 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            )}
            {...register('imageUrlsText')}
          />
          <FieldError message={errors.imageUrlsText?.message} />
        </div>
      </div>

      {formError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting || Boolean(projectsError)}>
        {isSubmitting ? 'Creating apartment…' : 'Create apartment'}
      </Button>
    </form>
  );
}
