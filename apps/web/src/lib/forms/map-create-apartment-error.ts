import type { CreateApartmentFormValues } from '@apartments/shared';
import type { FieldPath, UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/lib/api/client';

type CreateApartmentField = FieldPath<CreateApartmentFormValues>;

function messageFromApiError(error: ApiError): string {
  if (error.details && Array.isArray(error.details.message)) {
    return error.details.message.join(', ');
  }

  return error.message;
}

function firstValidationField(message: string): CreateApartmentField | null {
  const fieldNames: CreateApartmentField[] = [
    'unitName',
    'unitNumber',
    'projectId',
    'price',
    'bedrooms',
    'bathrooms',
    'areaSqm',
    'description',
    'floor',
    'address',
    'status',
    'amenitiesText',
    'imageUrlsText',
  ];

  const match = fieldNames.find((field) => message.includes(field));
  return match ?? null;
}

export function applyCreateApartmentApiError(
  error: ApiError,
  setError: UseFormSetError<CreateApartmentFormValues>,
  setFormError: (message: string) => void,
): void {
  const message = messageFromApiError(error);

  if (error.status === 409) {
    setError('unitNumber', { message });
    return;
  }

  if (error.status === 422) {
    setError('projectId', { message });
    return;
  }

  if (error.status === 400 && error.details && Array.isArray(error.details.message)) {
    for (const item of error.details.message) {
      const field = firstValidationField(item);
      if (field) {
        setError(field, { message: item });
        return;
      }
    }
  }

  setFormError(message);
}
