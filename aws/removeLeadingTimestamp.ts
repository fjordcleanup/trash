export const removeLeadingTimestamp = (message: string): string => {
	if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\t/.test(message)) {
		message = message.replace(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z\t/,
			'',
		)
	}
	return message
}
