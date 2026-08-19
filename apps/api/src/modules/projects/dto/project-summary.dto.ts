export interface ProjectSummaryDeveloperDto {
  id: string;
  name: string;
}

// docs/requirements.md section 7.7.
export interface ProjectSummaryDto {
  id: string;
  name: string;
  city: string;
  district: string;
  developer: ProjectSummaryDeveloperDto;
  apartmentCount: number;
}
