import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
	title: "CA11y Deplyment",
	description: "An app used for the deployment of video interventions as part of the CA11y project.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<html lang="en">
			<body>
				{children}
			</body>
		</html>
	);
}
