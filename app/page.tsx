"use client";

import { logAction } from '@/lib/logger';

const LoggerForm = () => {

	const handleClick = async () => {
		const user = "user";
		const action = "action";

		await logAction(user, action);
	};

	return (
		<div>
			<button onClick={handleClick}>Log Action</button>
		</div>
	);
};

export default LoggerForm;