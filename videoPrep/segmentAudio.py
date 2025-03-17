from datetime import datetime
import json
import math
import re
import subprocess
import time
import os
import glob
from mutagen.mp3 import MP3
import re
import json
import os


def isDockerRunning():
    try:
        subprocess.run(["docker", "info"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except subprocess.CalledProcessError:
        return False


def startDocker():
    if not isDockerRunning():
        command = 'Start-Process -FilePath "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe"'
        subprocess.run(["powershell", "-Command", command], shell=True)
        for _ in range(30):
            time.sleep(1)
            print("Checking if Docker started...")
            if isDockerRunning():
                print("Docker started...")
                return True
        print("Docker failed to start...")
        return False
    return True


def dockerSegmentMusic(name):
    command = [
        "docker", "run", "--gpus", "all",
        "-v", "C:/Users/sacha/Desktop/ca11y-deployment/public:/data",
        "beveradb/audio-separator:gpu", f"/data/{name}.mp3",
        "--output_format=MP3",
        "--output_dir", f"/data/{name}"
    ]

    if startDocker():
        print("Executing Docker command to segment music...")
        subprocess.run(command, shell=True)


def dockerSegmentCrowd(name):
    command = [
        "docker", "run", "--gpus", "all",
        "-v", f"C:/Users/sacha/Desktop/ca11y-deployment/public/{name}:/data",
        "beveradb/audio-separator:gpu", "/data/crowded.mp3",
        "-m", "mel_band_roformer_crowd_aufr33_viperx_sdr_8.7144.ckpt",
        "--output_format=MP3",
        "--output_dir", "/data"
    ]

    if startDocker():
        print("Executing Docker command to segment crowd noise...")
        subprocess.run(command, shell=True)


def renameFiles(directory, searchStr, newName):
    files = glob.glob(os.path.join(directory, f"*{searchStr}*"))

    if not files:
        print(f"No files found containing '{searchStr}' in {directory}.")
        return

    for filePath in files:
        dirName, oldName = os.path.split(filePath)
        newPath = os.path.join(dirName, newName)

        os.rename(filePath, newPath)
        print(f"Renamed '{oldName}' to '{newName}'")


def deleteFiles(directory, searchStr):
    files = glob.glob(os.path.join(directory, f"*{searchStr}*"))
    for file in files:
        try:
            os.remove(file)
            print(f"Deleted: {file}")
        except Exception as e:
            print(f"Error deleting {file}: {e}")


def parse_vtt_time(time_str):
    h, m, s = time_str.split(':')
    seconds = float(h) * 3600 + float(m) * 60 + float(s)
    return seconds


def parse_vtt_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    content = re.sub(r'^WEBVTT.*?(?=\n\n|\n\d)', '', content, flags=re.DOTALL)

    pattern = r'(\d+:[\d:.]+)\s+-->\s+(\d+:[\d:.]+)\n([\s\S]*?)(?=\n\n|\n\d+:[\d:.]+|$)'
    matches = re.findall(pattern, content)

    subtitles = []
    for start_time, end_time, text in matches:
        cleaned_text = re.sub(r'<[^>]+>', '', text).strip()
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text)

        if cleaned_text:
            subtitles.append({
                'start': parse_vtt_time(start_time),
                'end': parse_vtt_time(end_time),
                'text': cleaned_text
            })

    return subtitles


def count_syllables(word):
    word = word.lower()
    word = re.sub(r'[^a-z]', '', word)

    if not word:
        return 0

    vowels = 'aeiouy'
    count = 0
    prev_is_vowel = False

    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_is_vowel:
            count += 1
        prev_is_vowel = is_vowel

    if word.endswith('e') and len(word) > 2 and word[-2] not in vowels:
        count -= 1
    if word.endswith('le') and len(word) > 2 and word[-3] not in vowels:
        count += 1
    if count == 0:
        count = 1

    return count


def flesch_reading_ease(text, num_subtitle_blocks):
    text = re.sub(r'[^\w\s.]', '', text)

    words = re.findall(r'\b\w+\b', text.lower())
    total_words = len(words)

    if total_words < 100:
        if total_words == 0:
            return 100.0

    total_syllables = sum(count_syllables(word) for word in words)

    if total_words == 0 or num_subtitle_blocks == 0:
        return 100.0

    score = 206.835 - 1.015 * \
        (total_words / num_subtitle_blocks) - \
        84.6 * (total_syllables / total_words)

    return int(round(score))


def words_per_minute(text, duration_seconds):
    if duration_seconds <= 0:
        return 0

    words = re.findall(r'\b\w+\b', text.lower())
    word_count = len(words)

    minutes = duration_seconds / 60
    wpm = word_count / minutes if minutes > 0 else 0
    return int(round(wpm))


def calculate_complexity_score(fk_score, wpm):
    if fk_score is None:
        fk_score = 90.0

    fk_component = 10 - max(0, min(9, math.floor((90 - fk_score) / 10)))

    wpm_reduction = 1
    if wpm > 150:
        wpm_reduction = round(
            (10 - math.log(math.floor((wpm - 150) / 25))) / 10, 2)

    final_score = max(1, min(10, fk_component * wpm_reduction))

    return round(final_score/10, 2)


def analyze_subtitles_with_rolling_window(subtitles):
    results = []
    last_valid_fk_score = 100.0

    for i in range(len(subtitles)):
        original_start = subtitles[i]['start']
        original_end = subtitles[i]['end']
        original_text = subtitles[i]['text']

        window_text = original_text
        window_start = original_start
        window_end = original_end

        j = i + 1
        words_in_window = len(re.findall(r'\b\w+\b', window_text.lower()))
        num_blocks_in_window = 1

        while words_in_window < 100 and j < len(subtitles):
            window_text += " " + subtitles[j]['text']
            window_end = subtitles[j]['end']
            words_in_window = len(re.findall(r'\b\w+\b', window_text.lower()))
            num_blocks_in_window += 1
            j += 1

        window_duration = window_end - window_start

        if words_in_window >= 100:
            fk_score = flesch_reading_ease(window_text, num_blocks_in_window)
            last_valid_fk_score = fk_score
        else:
            fk_score = last_valid_fk_score

        wpm = words_per_minute(window_text, window_duration)
        complexity = calculate_complexity_score(fk_score, wpm)

        results.append({
            'start_time': original_start,
            'end_time': original_end,
            'text': original_text,
            'flesch_reading_ease': fk_score,
            'words_per_minute': wpm,
            'complexity_score': complexity
        })

    return results


def append_subtitles_to_existing_file(existing_file, subtitles_data):
    with open(existing_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data["subtitles"] = subtitles_data
    with open(existing_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    video = "theSocialNetwork"

    print(f"Processing {video}.mp3")
    dir = f"C:/Users/sacha/Desktop/ca11y-deployment/public/{video}"

    # strCrowded = "(Vocals)"
    # strMusic = "(Instrumental)"
    # strVoice = "(other)"
    # strCrowd = "(crowd)"

    # with open(f"{dir}/{video}.json", "w") as file:
    #     audio = MP3(f"{dir}/{video}.mp3")
    #     file.write(f"{{\n    \"duration\": {int(audio.info.length)}\n}}")

    # dockerSegmentMusic(name=video)

    # renameFiles(directory=dir, searchStr=strCrowded, newName="crowded.mp3")
    # renameFiles(directory=dir, searchStr=strMusic,
    #             newName=f"{video}_music.mp3")

    # dockerSegmentCrowd(name=video)

    # renameFiles(directory=dir, searchStr=strVoice,
    #             newName=f"{video}_speaker.mp3")
    # renameFiles(directory=dir, searchStr=strCrowd,
    #             newName=f"{video}_other.mp3")

    # deleteFiles(directory=dir, searchStr="crowded")

    subtitles = parse_vtt_file(f"{dir}/{video}.vtt")
    results = analyze_subtitles_with_rolling_window(subtitles)
    append_subtitles_to_existing_file(f"{dir}/{video}.json", results)

    # subtitles = process_vtt_subtitles(f"captions.vtt")
    # append_subtitles_to_existing_file(f"captions.json", subtitles)
