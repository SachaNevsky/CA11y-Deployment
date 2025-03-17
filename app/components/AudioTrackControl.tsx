import { Slider } from "@heroui/slider";
import { AudioControls } from "../api/types";

// AudioTrackControl.tsx - Extract audio controls
interface AudioTrackControlProps {
	label: string;
	control: AudioControls;
	onVolumeChange: (value: number) => void;
	onMuteToggle: () => void;
}

const AudioTrackControl: React.FC<AudioTrackControlProps> = ({ label, control, onVolumeChange, onMuteToggle }) => (
	<div className="mb-2">
		<label>{label} - {Math.floor(control.volume * 100)}%</label>
		<div className="flex items-center">
			<Slider
				aria-label={`${label}VolumeSlider`}
				name={`${label.toLowerCase()}Slider`}
				size="md"
				classNames={{ track: "custom-slider-track" }}
				color={control.muted ? "secondary" : "primary"}
				defaultValue={control.volume}
				minValue={0}
				maxValue={1}
				step={0.05}
				value={control.volume}
				onChange={(val) => onVolumeChange(val as number)}
			/>
			<button className="ml-2" onClick={onMuteToggle}>
				{control.muted ? "🔇" : "🔊"}
			</button>
		</div>
	</div>
);

export default AudioTrackControl;