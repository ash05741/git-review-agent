import { GoogleGenAI } from '@google/genai';
import { execSync } from 'child_process';

const ai = new GoogleGenAI({}); // Automatically uses GEMINI_API_KEY environment variable

function getStagedDiff() {
    try {
        // Reads whatever files you have run 'git add' on
        return execSync('git diff --cached').toString();
    } catch (error) {
        return '';
    }
}

async function runReviewAgent() {
    const diff = getStagedDiff();

    if (!diff) {
        console.log("No staged changes found. Run 'git add .' to stage files for review.");
        return;
    }

    console.log("🕵️  Agent analyzing staged architecture and logic...\n");

    const prompt = `You are a senior TypeScript/Node.js developer. Review this git diff. 
  Skip all pleasantries. Provide 2-3 concise bullet points identifying bugs, edge cases, or optimizations.
  
  Diff:
  ${diff}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
    });

    console.log(response.text);
}

runReviewAgent();