import { GoogleGenAI } from '@google/genai';
import { fileTools, handleTool } from './tools.js';

const ai = new GoogleGenAI({}); // Uses your GEMINI_API_KEY

async function runAutoFixer(targetFile) {
    console.log(`🤖 Agent initializing on ${targetFile}...`);

    const chat = ai.chats.create({
        model: 'gemini-3.5-flash',
        config: {
            tools: [fileTools],
            // System instructions strictly define the agent's persona and workflow
            systemInstruction: "You are an autonomous code repair agent. Read the requested file, identify the bugs, and write the corrected code back to the file using your tools."
        }
    });

    let response = await chat.sendMessage({ message: `Please fix the bugs in ${targetFile}` });

    // THE REASONING LOOP
    while (response.functionCalls) {
        for (const call of response.functionCalls) {

            // Execute the local filesystem tool
            const result = await handleTool(call);

            // Feed the result back to the AI so it knows what happened
            response = await chat.sendMessage({
                message: [{ functionResponse: { name: call.name, response: result } }]
            });
        }
    }

    console.log(`\n✅ Mission Complete: ${response.text}\n`);
}

const target = process.argv[2];
if (!target) {
    console.log("Usage: node agent.js <filename>");
    process.exit(1);
}

runAutoFixer(target);