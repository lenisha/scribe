import axios, { AxiosInstance } from 'axios';
import config from "@/services/config";

async function generateSOAPNotes(transcription: string, language: string, 
                                 startTime: Date | null, endTime: Date | null) : Promise<string> {

    if (transcription === undefined || transcription === null || transcription === '') 
        return '';

    try {
         
        const res = await axios.post(config.api.baseUrl + '/api/generate-doc',
            {
             "transcription": transcription,
             "language": language
            }, 
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        if (startTime && endTime) {
            const timestamp = `${formatDate(startTime)} - ${formatDate(endTime)} (${formatDuration(startTime, endTime)})`;
            return res.data.soap_note + '\n\n' + timestamp;
        }
        return res.data.soap_note;
    } catch (err) {
        console.log(err);
        return '';
    }
    
}

const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const formatDuration = (start: Date, end: Date) => {
    const duration = new Date(end.getTime() - start.getTime());
    const hours = String(duration.getUTCHours()).padStart(2, '0');
    const minutes = String(duration.getUTCMinutes()).padStart(2, '0');
    const seconds = String(duration.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

export { generateSOAPNotes };