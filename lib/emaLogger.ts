/**
 * A helper function that POSTs EMA responses to the database.
 * @param user - The user submitting the response.
 * @param questionId - The ID of the question.
 * @param question - The text of the question.
 * @param response - The user's response value.
 * @returns The JSON of the POST method response
 */
export async function logEMAResponse(user: string, questionId: string, question: string, response: number) {
    try {
        const result = await fetch('/api/emas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user, questionId, question, response }),
        });

        if (!result.ok) {
            throw new Error('Failed to log EMA response');
        }

        return await result.json();
    } catch (error) {
        console.error('Error logging EMA response:', error);
    }
}