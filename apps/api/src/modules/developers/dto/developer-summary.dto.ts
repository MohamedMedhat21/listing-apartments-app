// docs/requirements.md section 7.8.
export interface DeveloperSummaryDto {
  id: string;
  name: string;
  logoUrl: string | null;
  projectCount: number;
}
