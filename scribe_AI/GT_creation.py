import os
import json
import re  # Import re module for regular expressions

# Define directories
soap_notes_dir = 'data/soap_notes'
transcripts_dir = 'data/transcripts'
llm_soap_notes_dir = 'data/LLM_SOAP_NOTES'

def read_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read().strip()

# Define the parse_soap_note function
def parse_soap_note(note):
    """
    Parses a SOAP note and returns a dictionary with keys:
    'Subjective', 'Objective', 'Assessment', 'Plan'.
    """
    # Define regex patterns for section headers
    section_headers = {
        'Subjective': r'(?:^|\n)(S:|Subjective:)',
        'Objective': r'(?:^|\n)(O:|Objective:)',
        'Assessment': r'(?:^|\n)(A:|Assessment:)',
        'Plan': r'(?:^|\n)(P:|Plan:)'
    }
    
    # Find the start indices of each section
    sections = {}
    for section, pattern in section_headers.items():
        matches = list(re.finditer(pattern, note, re.IGNORECASE))
        if matches:
            sections[section] = matches
    
    # If no sections were found, return an empty dictionary
    if not sections:
        return {}
    
    # Get the sorted positions of all section headers
    positions = []
    for section, matches in sections.items():
        for match in matches:
            positions.append((match.start(), section))
    
    positions.sort()
    
    # Extract content for each section
    parsed_note = {}
    for i, (start_idx, section) in enumerate(positions):
        # End index is the start of the next section or end of the note
        end_idx = positions[i + 1][0] if i + 1 < len(positions) else len(note)
        # Extract content between start and end indices
        content = note[start_idx:end_idx].strip()
        # Remove the section header from the content
        content = re.sub(r'^(S:|O:|A:|P:|Subjective:|Objective:|Assessment:|Plan:)', '', content, flags=re.IGNORECASE).strip()
        # Store the clean content
        parsed_note[section] = content
    
    return parsed_note

def get_file_details(language):
    notes_path = os.path.join(soap_notes_dir, language)
    transcripts_path = os.path.join(transcripts_dir, language)
    llm_notes_path = os.path.join(llm_soap_notes_dir, language)

    filenames = [f for f in os.listdir(notes_path) if f.endswith('.txt')]
    data_list = []

    for filename in filenames:
        soap_text = read_file(os.path.join(notes_path, filename))
        transcript_text = read_file(os.path.join(transcripts_path, filename))
        
        # Check if LLM SOAP note exists and read
        llm_soap_text = ''
        llm_filename = os.path.join(llm_notes_path, filename)
        if os.path.exists(llm_filename):
            llm_soap_text = read_file(llm_filename)

        # Parse the SOAP notes into sections
        parsed_soap_note = parse_soap_note(soap_text)
        parsed_llm_soap_note = parse_soap_note(llm_soap_text)

        data_list.append({
            'filename': filename,
            'language': language,
            'transcription': transcript_text,
            'soap_note': soap_text,
            'llm_soap_note': llm_soap_text,
            'parsed_soap_note': parsed_soap_note,
            'parsed_llm_soap_note': parsed_llm_soap_note
        })

    return data_list

def create_ground_truth():
    ground_truth = []

    for language in ['english', 'french']:
        ground_truth.extend(get_file_details(language))

    return ground_truth

if __name__ == "__main__":
    ground_truth_data = create_ground_truth()

    # Write to JSON file
    with open('data/ground_truth.json', 'w', encoding='utf-8') as json_file:
        json.dump(ground_truth_data, json_file, ensure_ascii=False, indent=4)

    print("Ground truth dataset created with parsed SOAP sections: data/ground_truth.json")