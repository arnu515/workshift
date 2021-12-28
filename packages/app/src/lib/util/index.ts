import user from "../stores/user";

export function getMessage(res: {
  data: { message?: string | string[]; error?: string };
  status: number;
}): string {
  const { data, status } = res;
  if (status === 401) user.set(null);
  if (Array.isArray(data.message)) {
    return data.message.join("\n");
  }
  if (data.message) return data.message;
  if (data.error) return data.error;
  return "An unknown error occurred";
}
