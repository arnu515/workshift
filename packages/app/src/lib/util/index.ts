import { user } from '$lib/stores/user';

export function getMessage(res: { data: { message: string | string[] }; status: number }): string {
	const { data, status } = res;
	if (status === 401) user.set(null);
	if (Array.isArray(data.message)) {
		return data.message.join('\n');
	}
	return data.message;
}
