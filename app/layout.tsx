import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
	title: "CA11y Deplyment",
	description: "An app used for the deployment of video interventions as part of the CA11y project.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" sizes="32x32" />
			</head>
			<body className="m-auto font-bold">
				<Header />
				<main role="main">
					{children}
				</main>
			</body>
		</html>
	);
}
