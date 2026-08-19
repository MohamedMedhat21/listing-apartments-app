// Allowed values for `GET /api/v1/apartments?sort=` (docs/requirements.md
// BR-13). Shared so the frontend's sort control (P7) uses the exact same
// values the API validates against.
export enum ApartmentSortOption {
  CREATED_AT_DESC = 'createdAt:desc',
  CREATED_AT_ASC = 'createdAt:asc',
  PRICE_ASC = 'price:asc',
  PRICE_DESC = 'price:desc',
  AREA_SQM_ASC = 'areaSqm:asc',
  AREA_SQM_DESC = 'areaSqm:desc',
}
