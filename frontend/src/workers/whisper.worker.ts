import { pipeline, env } from '@xenova/transformers';

// Skip local check, we'll fetch from Hugging Face hub
env.allowLocalModels = false;

class PipelineSingleton {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance: any = null;

    static async getInstance(progress_callback: any = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    const { audioData, type } = event.data;
    
    if (type === 'init') {
        try {
            await PipelineSingleton.getInstance((x: any) => {
                self.postMessage({ status: 'progress', data: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (e: any) {
            self.postMessage({ status: 'error', data: e.message });
        }
        return;
    }

    if (type === 'transcribe') {
        try {
            self.postMessage({ status: 'decoding' });
            
            const transcriber = await PipelineSingleton.getInstance();
            const output = await transcriber(audioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe',
            });

            self.postMessage({
                status: 'complete',
                text: output.text
            });
        } catch (e: any) {
            self.postMessage({ status: 'error', data: e.message });
        }
    }
});
