#!/usr/bin/env python

import os
import subprocess
from conversation_transcription import recognize_from_file
from tqdm import tqdm

def extract_audio(mp4_filename, wav_filename):
    # Use ffmpeg to extract audio
    # Command: ffmpeg -i input.mp4 -ac 1 -ar 16000 -vn output.wav
    # -ac 1 sets audio channels to mono
    # -ar 16000 sets audio sample rate to 16kHz
    # -vn to skip video
    command = ['ffmpeg', '-i', mp4_filename, '-ac', '1', '-ar', '16000', '-vn', wav_filename]
    subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)

def main():
    consults_dir = os.path.join('data', 'consults/french')
    transcripts_dir = os.path.join('data', 'transcripts/french')

    # Create transcripts directory if it doesn't exist
    if not os.path.exists(transcripts_dir):
        os.makedirs(transcripts_dir)

    # Get list of .mp4 files in consults_dir
    mp4_files = [f for f in os.listdir(consults_dir) if f.endswith('.mp4')]

    # Use tqdm to create a progress bar over the list of files
    for mp4_file in tqdm(mp4_files, desc='Processing files', unit='file'):
        mp4_path = os.path.join(consults_dir, mp4_file)

        # Create a temporary wav filename
        base_name = os.path.splitext(mp4_file)[0]
        wav_file = base_name + '.wav'
        wav_path = os.path.join(consults_dir, wav_file)

        # Extract audio from mp4 to wav
        tqdm.write(f"Extracting audio from {mp4_file}")
        extract_audio(mp4_path, wav_path)

        # Create output transcript filename
        transcript_file = base_name + '.txt'
        transcript_path = os.path.join(transcripts_dir, transcript_file)

        # Transcribe the wav file and save to transcript_path
        tqdm.write(f"Transcribing {wav_file}")
        recognize_from_file(wav_path, transcript_path)

        # Optionally delete the wav file
        tqdm.write(f"Deleting temporary file {wav_file}")
        os.remove(wav_path)

        tqdm.write(f"Finished processing {mp4_file}")

    print("All files processed.")

if __name__ == '__main__':
    main()