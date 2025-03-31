// ./lib/logger.ts
/**
 * A helper function that POSTs logged actions to the database. 
 * @param user - The user performing the action.
 * @param action - The action being performed.
 * @returns The JSON of the POST method response
 */
export const logAction = (() => {
    const debounceMap = new Map<string, number>();
    const DEBOUNCE_INTERVAL = 500; // 500ms debounce

    return async function (user: string, action: string) {
        try {
            console.log(">", typeof user, typeof action)
            const now = Date.now();
            const key = `${user}-${action}`;

            if (debounceMap.has(key)) {
                const lastLogTime = debounceMap.get(key)!;
                if (now - lastLogTime < DEBOUNCE_INTERVAL) {
                    return;
                }
            }

            debounceMap.set(key, now);

            console.log('Attempting to log action:', { user, action });

            try {
                const response = await fetch('/api/logs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ user, action }),
                });

                console.log('Log response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Failed to log action. Response:', errorText);
                    debounceMap.delete(key);
                    throw new Error(`Failed to log action: ${errorText}`);
                }

                return await response.json();
            } catch (fetchError) {
                console.error('Fetch error in logAction:', fetchError);
                throw fetchError;
            }
        } catch (error) {
            console.log(">>", typeof error)
            console.error('Complete error logging action:', error);
            throw error;
        }
    };
})();