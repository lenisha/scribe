import os
from openai import OpenAI
from jinja2 import Environment, FileSystemLoader  


client = OpenAI(api_key="secret")
MODEL_NAME = 'gpt-4-turbo'  # Use the appropriate model name

def chat_with_gpt(prompt, temperature=0.0, max_tokens=512):
    response = client.chat.completions.create(messages=[{"role": "user","content": prompt,}], model="gpt-4o", temperature=temperature, max_completion_tokens=max_tokens)


    return response.choices[0].message.content
    


def render_soap_jinja(template_path: str):  
    env = Environment(loader=FileSystemLoader('.'))  
    template = env.get_template(template_path)  
    soap_example = template.render()  
    return soap_example  

def send_transcription_to_openai(transcription, language):
    # Render Jinja templates
    soap_instructions = render_soap_jinja('llm_utils/prompts/soap_note.jinja2')
    soap_example = render_soap_jinja('llm_utils/prompts/soap_example.jinja2')

    # Prepare the prompt
    prompt = f"""
    You are an expert writing medical SOAP notes. You will take the transcribed conversation provided by the clinician and you will create a detailed SOAP formatted report.  
    You will not add any additional notes or commentary to your response other than your SOAP formatted report. 
    Output Language: {language}

    You will reference these instructions on writing SOAP reports: 

    ## INSTRUCTIONS
    {soap_instructions}

    ## EXAMPLES
    Here are example of SOAP notes - format your response in a similar way: 
    {soap_example} 

    Now the user will provide you the Doctor's notes.

    user:
    {transcription}
    """

    response = chat_with_gpt(prompt)

    return response

def read_transcription(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read().strip()
    return content

def generate_soap(transcript_path, language):
    transcription_text = read_transcription(transcript_path)
    return send_transcription_to_openai(transcription_text, language)


# Usage example
# if __name__ == "__main__":
#     transcription_text = read_transcription("data/transcripts/english/Ryan Case 2.txt")
#     result = send_transcription_to_openai(transcription_text)
#     print(result)