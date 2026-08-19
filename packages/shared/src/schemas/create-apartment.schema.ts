import { z } from 'zod';

import { ApartmentStatus } from '../enums/apartment-status.enum';
import type { CreateApartmentRequest } from '../contracts/api-contracts';

const apartmentStatusValues = [
  ApartmentStatus.AVAILABLE,
  ApartmentStatus.RESERVED,
  ApartmentStatus.SOLD,
] as const;

function parseMultiline(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export const createApartmentFormSchema = z.object({
  unitName: z.string().trim().min(1, 'Unit name is required').max(150),
  unitNumber: z.string().trim().min(1, 'Unit number is required').max(50),
  projectId: z.uuid('Select a project'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms must be 0 or more'),
  bathrooms: z.coerce.number().int().min(0, 'Bathrooms must be 0 or more'),
  areaSqm: z.coerce.number().positive('Area must be greater than 0'),
  description: z.string().trim().max(5000).optional().or(z.literal('')),
  floor: z
    .union([z.literal(''), z.coerce.number().int()])
    .optional()
    .transform((value) => (value === '' || value === undefined ? undefined : value)),
  address: z.string().trim().max(255).optional().or(z.literal('')),
  status: z.enum(apartmentStatusValues).optional(),
  amenitiesText: z.string().optional(),
  imageUrlsText: z
    .string()
    .optional()
    .superRefine((value, context) => {
      for (const url of parseMultiline(value)) {
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            context.addIssue({
              code: 'custom',
              message: 'Each image URL must start with http:// or https://',
            });
            return;
          }
        } catch {
          context.addIssue({
            code: 'custom',
            message: 'Each image URL must be a valid http:// or https:// address',
          });
          return;
        }
      }
    }),
});

export type CreateApartmentFormValues = z.input<typeof createApartmentFormSchema>;
export type CreateApartmentFormOutput = z.output<typeof createApartmentFormSchema>;

export function toCreateApartmentRequest(
  values: CreateApartmentFormOutput,
): CreateApartmentRequest {
  const amenities = parseMultiline(values.amenitiesText).slice(0, 30);
  const imageUrls = parseMultiline(values.imageUrlsText).slice(0, 12);

  const request: CreateApartmentRequest = {
    unitName: values.unitName,
    unitNumber: values.unitNumber,
    projectId: values.projectId,
    price: values.price,
    bedrooms: values.bedrooms,
    bathrooms: values.bathrooms,
    areaSqm: values.areaSqm,
  };

  if (values.description) {
    request.description = values.description;
  }
  if (values.floor !== undefined) {
    request.floor = values.floor;
  }
  if (values.address) {
    request.address = values.address;
  }
  if (values.status) {
    request.status = values.status;
  }
  if (amenities.length > 0) {
    request.amenities = amenities;
  }
  if (imageUrls.length > 0) {
    request.imageUrls = imageUrls;
  }

  return request;
}
