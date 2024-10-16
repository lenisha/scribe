import os
from promptflow.core import Prompty
from promptflow.core import AzureOpenAIModelConfiguration

from promptflow.tracing import start_trace
from jinja2 import Environment, FileSystemLoader  



OPENAI_MODEL = os.getenv('AZURE_OPENAI_DEPLOYMENT', 'gpt-4o')


def render_soap_jinja(template_path: str):  
    env = Environment(loader=FileSystemLoader('.'))  
    template = env.get_template(template_path)  
    soap_example = template.render()  
    return soap_example  


# Define the function to send the transcription to Prompty
def send_transcription_to_prompty(transcription, language="en-CA"):

    model_config = {
        "configuration": AzureOpenAIModelConfiguration(
           azure_deployment=OPENAI_MODEL
        )
    }

    # start a trace session, and print a url for user to check trace
    # start_trace()
    # Load prompty definition from file
    prompty = Prompty.load(source="soap_note.prompty", model=model_config)
    result = prompty(transcription = transcription,
                     language = language, 
                     soap_instructions = render_soap_jinja('./data/soap_note.jinja2'),
                     soap_example = render_soap_jinja('./data/soap_example.jinja2'))

    return result


# Define the function to send the transcription to Prompty
def send_note_to_prompty(soap_note, language="en-CA"):

    model_config = {
        "configuration": AzureOpenAIModelConfiguration(
           azure_deployment=OPENAI_MODEL
        )
    }

    # start a trace session, and print a url for user to check trace
    # start_trace()
    # Load prompty definition from file
    prompty = Prompty.load(source="soap_handout.prompty", model=model_config)
    result = prompty(soap_note = soap_note,
                     language = language)

    return result