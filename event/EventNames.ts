export const EventNames = {
	ReportCreated: 'ReportCreated',
	ReportDeleted: 'ReportDeleted',
	ReportPublished: 'ReportPublished',
	SizedPhotoAdded: 'SizedPhotoAdded',
	CleanupReported: 'CleanupReported',
	CleanupApproved: 'CleanupApproved',
	CleanupRejected: 'CleanupRejected',
} as const
export type EventNames = (typeof EventNames)[keyof typeof EventNames]
