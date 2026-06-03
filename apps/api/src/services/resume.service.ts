import { extractText, getDocumentProxy } from 'unpdf';
import mammoth from 'mammoth';

export async function parseResume(buffer: Buffer, mimetype: string): Promise<string> {
    if (mimetype === 'application/pdf') {
        try {
            const pdf = await getDocumentProxy(new Uint8Array(buffer));
            const { text } = await extractText(pdf, { mergePages: true });
            return text;
        } catch (error: any) {
            console.error('[Resume Parser] Failed to parse PDF resume:', error);
            throw new Error(`Failed to parse PDF resume: ${error.message}`);
        }
    } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword'
    ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } else if (mimetype === 'text/plain') {
        return buffer.toString('utf-8');
    } else {
        throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
    }
}
