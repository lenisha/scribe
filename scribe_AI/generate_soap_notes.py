import os
from tqdm import tqdm
from llm_utils.notes import generate_soap

def process_transcripts(input_dir, output_dir):
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Collect all text files
    transcript_files = []
    for root, dirs, files in os.walk(input_dir):
        for file_name in files:
            if file_name.endswith(".txt"):
                transcript_files.append(os.path.join(root, file_name))
                
    # Iterate over transcript files with a progress bar
    for transcript_path in tqdm(transcript_files, desc="Processing transcripts"):
        language = "en-CA" if "english" in transcript_path else "fr-CA"
        relative_path = os.path.relpath(transcript_path, input_dir)
        output_path = os.path.join(output_dir, relative_path)

        # Ensure the output directory for each file exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Generate the SOAP note
        soap_note = generate_soap(transcript_path, language)

        # Save the result
        with open(output_path, "w") as output_file:
            output_file.write(soap_note)

# Directory paths
input_directory = "data/transcripts"
output_directory = "data/LLM_SOAP_NOTES"

# Process the transcripts
process_transcripts(input_directory, output_directory)