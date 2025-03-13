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

    for file_path in files:
        dirName, oldName = os.path.split(file_path)
        newPath = os.path.join(dirName, newName)

        os.rename(file_path, newPath)
        print(f"Renamed '{oldName}' to '{newName}'")


def deleteFiles(directory, searchStr):
    files = glob.glob(os.path.join(directory, f"*{searchStr}*"))
    for file in files:
        try:
            os.remove(file)
            print(f"Deleted: {file}")
        except Exception as e:
            print(f"Error deleting {file}: {e}")


if __name__ == "__main__":
    video = "theSocialNetwork"

    print(f"Processing {video}.mp3")
    dir = f"C:/Users/sacha/Desktop/ca11y-deployment/public/{video}"

    strCrowded = "(Vocals)"
    strMusic = "(Instrumental)"
    strVoice = "(other)"
    strCrowd = "(crowd)"

    with open(f"{dir}/{video}.json", "w") as file:
        audio = MP3(f"{dir}/{video}.mp3")
        file.write(f"{{\n    \"duration\": {int(audio.info.length)}\n}}")

    dockerSegmentMusic(name=video)

    renameFiles(directory=dir, searchStr=strCrowded, newName="crowded.mp3")
    renameFiles(directory=dir, searchStr=strMusic,
                newName=f"{video}_music.mp3")

    dockerSegmentCrowd(name=video)

    renameFiles(directory=dir, searchStr=strVoice,
                newName=f"{video}_speaker.mp3")
    renameFiles(directory=dir, searchStr=strCrowd,
                newName=f"{video}_other.mp3")

    deleteFiles(directory=dir, searchStr="crowded")
