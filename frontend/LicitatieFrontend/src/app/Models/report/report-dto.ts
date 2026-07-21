import { ReportTargetType } from './report-target-type-enum';
import { ReportReason } from './report-reason-enum';
import { ReportStatus } from './report-status-enum';

export interface CreateReportDto {
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  description?: string; 
}

export interface ReportResponseDto {
  id: number;
  reporterId: number;
  reporterUserName: string;
  targetType: ReportTargetType;
  targetId: number;
  targetDisplayName: string;
  targetOwnerId?: number;
  targetOwnerUserName?: string;
  reason: ReportReason;
  description?: string;
  createdAt: Date;
  status: ReportStatus;
  reviewedAt?: Date;
}

export interface UpdateReportStatusDto {
  status: ReportStatus;
}