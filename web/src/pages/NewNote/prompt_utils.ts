import axios, { AxiosInstance } from 'axios';
import config from "@/services/config";

async function generateSOAPNotes(transcription: string) : Promise<string> {

    if (transcription === undefined || transcription === null || transcription === '') 
        return '';

    try {
         
        const res = await axios.post(config.api.baseUrl + '/api/generate-doc',
            {
             "transcription": transcription
            }, 
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
     

        return res.data.soap_note;
    } catch (err) {
        console.log(err);
        return '';
    }
    
}

export { generateSOAPNotes };