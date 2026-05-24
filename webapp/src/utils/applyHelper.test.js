import { describe, it, expect } from 'vitest';
import { getApplyData } from './applyHelper';

describe('getApplyData', () => {
  it('should return internal apply url when jobDetail is missing or not redirecting', () => {
    const job = {
      title: 'Internal Job',
      apply_url: 'https://jobroom.jobcourier.ch/job/view-job.php?id=123',
      redirect: false,
      external_url: null
    };

    const result = getApplyData(job, null);
    expect(result.redirect).toBe(false);
    expect(result.url).toBe('https://jobroom.jobcourier.ch/job/view-job.php?id=123');
  });

  it('should override with external redirect data when jobDetail has a valid external redirect', () => {
    const job = {
      title: 'External Job',
      apply_url: 'https://jobroom.jobcourier.ch/job/view-job.php?id=456',
      redirect: false, // List thinks it is false
      external_url: null
    };

    const jobDetail = {
      id: '456',
      title: 'External Job',
      apply_url: 'https://jobroom.jobcourier.ch/job/view-job.php?id=456',
      redirect: true, // Detail knows it is true!
      external_url: 'https://www.manpower.ch/en/job/633404'
    };

    const result = getApplyData(job, jobDetail);
    expect(result.redirect).toBe(true);
    expect(result.url).toBe('https://www.manpower.ch/en/job/633404');
  });

  it('should gracefully handle empty or undefined inputs', () => {
    const result = getApplyData(null, null);
    expect(result.redirect).toBe(false);
    expect(result.url).toBe('');
  });
});
