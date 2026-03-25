import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { UserVerification } from './entities/user-verification.entity';

@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(UserVerification)
    private verificationRepository: Repository<UserVerification>,
  ) {}

  async createReport(reportData: any) {
    const report = this.reportRepository.create(reportData);
    return await this.reportRepository.save(report);
  }

  async getPendingReports() {
    return await this.reportRepository.find({
      where: { status: 'pending' },
      relations: ['reporter', 'moderator'],
    });
  }
}
