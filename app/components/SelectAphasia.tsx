"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChallengeCard from "./ChallengeCard";

/**
 * Interface for the `SelectAphasia` props
 * @param {string} name - The name of the user.
 */
interface SelectAphasiaProps {
	name: string
}

interface aphasiaCharacteristicsProps {
	listening: number;
	speaking: number;
	reading: number;
	writing: number;
	barriers: string[];
	handedness: "leftHanded" | "rightHanded";
}

/**
 * A React component that allows the user to select whether they select a persona or choose aphasia characteristics. 
 * 
 * @param {SelectAphasiaProps} props - The props for the `SelectAphasia` component.
 * @param {string} props.name - The name of the user.
 * @returns {JSX.Element} The rendered `SelectAphasia` component
 * @example <SelectAphasia name={} />
 */
const SelectAphasia: React.FC<SelectAphasiaProps> = ({ name }: SelectAphasiaProps): JSX.Element => {
	const router = useRouter();

	const [aphasiaCharacteristics, setAphasiaCharacteristics] = useState<aphasiaCharacteristicsProps>({
		listening: 0,
		speaking: 0,
		reading: 0,
		writing: 0,
		barriers: [],
		handedness: "rightHanded"
	});

	const handleConfirm = () => {
		localStorage.setItem("ca11yAphasiaCharacteristics", JSON.stringify(aphasiaCharacteristics));
		router.push("/videoLibrary");
	}

	const challenges = [
		{ text: "Fast speech", icon: "" },
		{ text: "Remembering things", icon: "" },
		{ text: "Multiple speakers", icon: "" },
		{ text: "Strong accents", icon: "" }
	]

	const handleAbilityChange = (ability: string, value: number) => {
		setAphasiaCharacteristics(prev => ({
			...prev,
			[ability.toLowerCase()]: value
		}));
	};

	const handleChallengeToggle = (challengeText: string) => {
		const formattedText = challengeText.replace(/\s+/g, '');

		setAphasiaCharacteristics(prev => {
			if (prev.barriers.includes(formattedText)) {
				return {
					...prev,
					barriers: prev.barriers.filter(barrier => barrier !== formattedText)
				};
			} else {
				return {
					...prev,
					barriers: [...prev.barriers, formattedText]
				};
			}
		});
	};

	const isBarrierSelected = (challengeText: string) => {
		const formattedText = challengeText.replace(/\s+/g, '');
		return aphasiaCharacteristics.barriers.includes(formattedText);
	};

	return (
		<div className="mx-[16%]">
			<p className="text-lg font-semibold mb-4">Hello {name}! We will ask you some questions about your aphasia.</p>
			{aphasiaCharacteristics.listening !== 0 && aphasiaCharacteristics.speaking !== 0 && aphasiaCharacteristics.reading !== 0 && aphasiaCharacteristics.writing !== 0 ? (
				<button onClick={handleConfirm} className={"py-4 px-10 border-solid border-2 rounded-md border-gray-300"}>Confirm</button>
			) : (
				<button className={"py-4 px-10 border-solid border-2 rounded-md border-gray-300 text-gray-300 cursor-default"}>Confirm</button>
			)}
			<div>
				<div className="p-4">
					<div className="my-6">
						<p className="text-lg font-semibold mb-2">
							What hand do you prefer using?
						</p>
						<button
							className={`mx-2 py-4 px-8 rounded-md border-2 ${aphasiaCharacteristics.handedness === "leftHanded" ? "border-blue-500 bg-blue-100" : "border-gray-300"}`}
							onClick={() => setAphasiaCharacteristics({ ...aphasiaCharacteristics, handedness: "leftHanded" })}
						>
							Left-Handed
						</button>
						<button
							className={`mx-2 py-4 px-8 rounded-md border-2 ${aphasiaCharacteristics.handedness === "rightHanded" ? "border-blue-500 bg-blue-100" : "border-gray-300"}`}
							onClick={() => setAphasiaCharacteristics({ ...aphasiaCharacteristics, handedness: "rightHanded" })}
						>
							Right-Handed
						</button>
					</div>
					<div className="my-6">
						<p className="text-lg font-semibold mb-2">
							How do you find your language abilities?
						</p>
						<div className="grid grid-cols-2 gap-y-2 mb-4 items-center">
							<div></div>
							<div className="w-fit">
								<div className="w-full text-center font-medium text-lg">
									👎&nbsp; Bad &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Good&nbsp;👍
								</div>
								<div className="flex justify-start space-x-4 w-fit invisible h-0">
									{[1, 2, 3, 4, 5].map((value) => (
										<input
											key={value}
											type="radio"
											id={`header-${value}`}
											name="header-rating"
											value={value}
											className="w-6 h-6 cursor-pointer"
										/>
									))}
								</div>
							</div>
						</div>
						{["Listening", "Speaking", "Reading", "Writing"].map((ability) => (
							<div key={ability} className="grid grid-cols-2 items-center gap-y-4 mb-3">
								<label className="text-right pr-4 text-lg self-center">
									{ability}:
								</label>
								<div className="flex justify-start space-x-4 w-fit">
									{[1, 2, 3, 4, 5].map((value) => (
										<input
											key={`${ability}-${value}`}
											type="radio"
											id={`${ability.toLowerCase()}-${value}`}
											name={ability.toLowerCase()}
											value={value}
											checked={aphasiaCharacteristics[ability.toLowerCase() as keyof typeof aphasiaCharacteristics] === value}
											onChange={() => handleAbilityChange(ability, value)}
											className="w-6 h-6 cursor-pointer"
										/>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="mt-6">
					Which of these do you find challenging?
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
						{challenges.map((challenge) => {
							return (
								<button
									key={challenge.text}
									onClick={() => handleChallengeToggle(challenge.text)}
								>
									<ChallengeCard
										text={challenge.text}
										icon={challenge.icon}
										isSelected={isBarrierSelected(challenge.text)}
									/>
								</button>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

export default SelectAphasia;