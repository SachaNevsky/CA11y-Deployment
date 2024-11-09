import ButtonLogger from "./components/ButtonLogger";

const Home = () => {
	return (
		<div>
			<ButtonLogger action="Click" user="Sacha">
				Click
			</ButtonLogger>
		</div>
	);
};

export default Home;