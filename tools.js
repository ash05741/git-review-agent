import fs from 'fs';
import { Type } from '@google/genai';

// 1. Describe the tools to the LLM using JSON Schema
export const fileTools = {
    functionDeclarations: [
        {
            name: 'read_file',
            description: 'Read the contents of a local file.',
            parameters: {
                type: Type.OBJECT,
                properties: { filepath: { type: Type.STRING } },
                required: ['filepath'],
            },
        },
        {
            name: 'write_file',
            description: 'Overwrite a local file with new fixed code.',
            parameters: {
                type: Type.OBJECT,
                properties: {
                    filepath: { type: Type.STRING },
                    content: { type: Type.STRING, description: 'The new code to write' },
                },
                required: ['filepath', 'content'],
            },
        }
    ],
};

// 2. The local execution logic
export async function handleTool(call) {
    const { filepath, content } = call.args;

    if (call.name === 'read_file') {
        console.log(`\n[Agent Action] 📖 Reading ${filepath}...`);
        try { return fs.readFileSync(filepath, 'utf8'); }
        catch (e) { return `Error: ${e.message}`; }
    }

    if (call.name === 'write_file') {
        console.log(`\n[Agent Action] ✍️ Overwriting ${filepath}...`);
        try {
            fs.writeFileSync(filepath, content);
            return "File updated successfully.";
        } catch (e) { return `Error: ${e.message}`; }
    }
}