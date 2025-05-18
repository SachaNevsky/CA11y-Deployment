"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image'
import { logAction } from "@/lib/logAction";
// import SelectAphasia from "./components/SelectAphasia";

const Home = () => {
	const router = useRouter();
	const [loaded, setLoaded] = useState<boolean>(false);
	const [name, setName] = useState<string>("");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedName = localStorage.getItem("ca11yDeploymentName");
			const storedAphasiaCharacteristic = localStorage.getItem("ca11yAphasiaCharacteristics");

			// if (storedName) setName(storedName);

			setLoaded(true);

			if (storedName && storedAphasiaCharacteristic) router.push("/videoLibrary");
		}
	}, [router]);

	if (loaded === false) {
		return <div>Loading...</div>;
	}

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
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
	const handleNameSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const form = event.currentTarget;
		const formElements = form.elements as typeof form.elements & {
			nameInput: { value: string }
		}

		const inputName = formElements.nameInput.value
			.trim()
			.replace(/<[^>]*>/g, '')
			.replace(/['";`\\]/g, '')
			.replace(/javascript:/gi, '')
			.substring(0, 50);

		if (typeof localStorage !== "undefined") {
			// setName(inputName);
			localStorage.setItem("ca11yDeploymentName", inputName);
		}

		logAction(inputName, "'Submitted' a name.");
		router.push("/videoLibrary");
	}

	return (
		// <div className="m-auto text-center">
		// 	{name !== "" ? (
		// 		<div className="pt-2">
		// 			<SelectAphasia name={name} />
		// 		</div>
		// 	) : (
		// 		<form onSubmit={handleNameSubmit}>
		// 			<div>
		// 				<div className="mx-2 mt-8 text-2xl">
		// 					<label htmlFor="nameInput">Hello! What is your name?</label>
		// 					<Image className="m-auto" alt="Icon of an ID card" src="/icons/name.png" width={100} height={100} />
		// 				</div>
		// 				<div>
		// 					<input
		// 						placeholder="Enter name here..."
		// 						id="nameInput"
		// 						type="text"
		// 						className="mx-2 my-8 p-4 w-1/2 md:w-1/3 rounded-md border-solid border-2 border-gray-400"
		// 					/>
		// 				</div>
		// 				<button type="submit" className="py-4 rounded-md font-bold text-lg transition-colors duration-200 shadow-md bg-blue-500 hover:bg-blue-600 text-white w-1/2 md:w-1/6">
		// 					Submit
		// 				</button>
		// 			</div>
		// 		</form>
		// 	)}
		// </div>
		<div className="m-auto text-center">
			<form onSubmit={handleNameSubmit}>
				<div>
					<div className="mx-2 mt-8 text-2xl">
						<label htmlFor="nameInput">Hello! What is your name?</label>
						<Image className="m-auto" alt="Icon of an ID card" src="/icons/name.png" width={100} height={100} />
					</div>
					<div>
						<input
							placeholder="Enter name here..."
							id="nameInput"
							type="text"
							value={name}
							onChange={handleNameChange}
							className="mx-2 my-8 p-4 w-1/2 md:w-1/3 rounded-md border-solid border-2 border-gray-400"
						/>
					</div>
					<button type="submit" disabled={!name.trim()} className={`py-4 rounded-md font-bold text-lg transition-colors duration-200 shadow-md text-white w-1/2 md:w-1/6 ${name.trim() ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-300 hover:bg-blue-400 cursor-not-allowed"} `}>
						Submit
					</button>
				</div>
			</form>
		</div>
	);
};

export default Home;