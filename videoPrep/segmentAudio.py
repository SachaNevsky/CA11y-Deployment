import json
import math
import re
import subprocess
import time
import os
import glob
from mutagen.mp3 import MP3


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


def parse_time(t):
    t = t.replace(',', '.')
    h, m, s = t.split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def count_syllables(word):
    word = word.lower()
    vowels = "aeiouy"
    syllables = 0
    if word and word[0] in vowels:
        syllables += 1
    for i in range(1, len(word)):
        if word[i] in vowels and word[i-1] not in vowels:
            syllables += 1
    if word.endswith("e"):
        syllables -= 1
    return syllables if syllables > 0 else 1


def process_vtt_subtitles(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()

    blocks = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith("WEBVTT"):
            i += 1
            continue
        if "-->" in line:
            start, end = [t.strip() for t in line.split("-->")]
            i += 1
        else:
            i += 1
            continue

        text_lines = []
        while i < len(lines) and lines[i].strip():
            text_lines.append(lines[i].strip())
            i += 1
        text = " ".join(text_lines)
        words = re.findall(r'\b\w+\b', text)
        syllables = [count_syllables(w) for w in words]
        start_sec = parse_time(start)
        end_sec = parse_time(end)
        duration = round(end_sec - start_sec, 2)
        blocks.append({
            "start": start,
            "end": end,
            "text": text,
            "words": words,
            "syllables": syllables,
            "duration": duration,
            "start_sec": start_sec,
            "end_sec": end_sec
        })
        i += 1

    results = []
    last_complete = None

    for idx in range(len(blocks)):
        total_words = 0
        total_syllables = 0
        num_blocks = 0
        j = idx

        while j < len(blocks) and total_words < 100:
            blk = blocks[j]
            total_words += len(blk["words"])
            total_syllables += sum(blk["syllables"])
            num_blocks += 1
            j += 1

        if total_words >= 100:
            fkScore = 206.835 - (1.015 * (total_words / num_blocks)) - \
                (84.6 * (total_syllables / total_words))
            last_complete = {"fkScore": fkScore}
        else:
            if last_complete:
                fkScore = last_complete["fkScore"]
            else:
                fkScore = None

        current_block = blocks[idx]
        wpm = (len(current_block["words"]) * 60 / current_block["duration"]
               ) if current_block["duration"] > 0 else 0

        # TODO
        complexity = fkScore * 100 / wpm

        results.append({
            "startTime": current_block["start"],
            "endTime": current_block["end"],
            "duration": current_block["duration"],
            "fkScore": int(fkScore) if fkScore is not None else None,
            "wordsPerMinute": int(wpm),
            "complexityScore": complexity
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

    subtitles = process_vtt_subtitles(f"{dir}/{video}.vtt")
    append_subtitles_to_existing_file(f"{dir}/{video}.json", subtitles)

    # subtitles = process_vtt_subtitles(f"captions.vtt")
    # append_subtitles_to_existing_file(f"captions.json", subtitles)
