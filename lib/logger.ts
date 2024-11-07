export async function logAction(user: string, action: string) {
    try {
        const response = await fetch('/api/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, action }),
        });

        if (!response.ok) {
            throw new Error('Failed to log action');
        }

        return await response.json();
    } catch (error) {
        console.error('Error logging action:', error);
    }
}