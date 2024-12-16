"use client"

import { useEffect, useState } from "react";
// import ButtonLogger from "./components/ButtonLogger";
import { logAction } from "@/lib/logger";
import SelectAphasia from "./components/selectAphasia";

const Home = () => {
	console.log("rendered")
	const [loaded, setLoaded] = useState<boolean>(false);
	const [name, setName] = useState<string>("");

	useEffect(() => {
		console.log("useEffect")
		if (typeof window !== "undefined") {
			const storedName = localStorage.getItem("ca11yDeploymentName");
			if (storedName) {
				setName(storedName);
			}
			setLoaded(true);
		}
	}, []);

	if (loaded === false) {
		return <div>Loading...</div>;
	}

	/**
	 * Handles the form submission event for setting a name.
	 * 
	 * This function prevents the default form submission behavior, extracts the value of the 
	 * `nameInput` field from the form, updates the state with the new name, and stores it 
	 * in `localStorage` if available.
	 *
	 * @param {React.SyntheticEvent<HTMLFormElement>} event - The form submission event.
	 * 
	 * @throws Will throw an error if `localStorage` is not defined.
	 */
	const handleNameSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;
		const formElements = form.elements as typeof form.elements & {
			nameInput: { value: string }
		}

		const inputName = formElements.nameInput.value;

		if (typeof localStorage !== "undefined") {
			setName(inputName);
			localStorage.setItem("ca11yDeploymentName", inputName);
		}

		logAction(inputName, "'Submitted' a name.");
	}

	return (
		<div className="m-auto text-center">
			{name !== "" ? (
				<div className="pt-2">
					<SelectAphasia name={name} />
				</div>
			) : (
				<form onSubmit={handleNameSubmit}>
					<div>
						<div>
							<label htmlFor="nameInput" className="mx-2 my-4">What is your name?</label>
						</div>
						<div>
							<input
								id="nameInput"
								type="text"
								className="mx-2 my-4 p-4 w-1/3 rounded-md border-solid border-2 border-gray-400"
							/>
						</div>
						<button
							type="submit"
							className="px-4 py-2 rounded-md border-solid border-2 border-gray-300 transition hover:border-gray-400 hover:bg-gray-200 ease-in delay-100"
						>
							Submit
						</button>
					</div>
				</form>
			)}
		</div>
	);
};

export default Home;