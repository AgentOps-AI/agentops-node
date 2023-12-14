import OpenAI from "openai";
import { Client } from 'agentops';

const openai = new OpenAI();                        // Add your API key here or in the .env

const agentops = new Client({
    apiKey: "",                                     // Add your API key here or in the .env
    tags: ["abc", "success"],                       // Optionally add tags to your run
    patchApi: [openai]                              // Record LLM calls automatically (Only OpenAI is currently supported)
});

// agentops.patchApi(openai)                        // Alternatively, you can patch API calls later

// Sample OpenAI call (automatically recorded if specified in "patched")
async function chat() {
    const completion = await openai.chat.completions.create({
        messages: [{ "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": "Who won the world series in 2020?" },
        { "role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020." },
        { "role": "user", "content": "Where was it played?" }],
        model: "gpt-3.5-turbo",
    });

    return completion
}

// Sample other function
function orignal(x: string) {
    console.log(x);
    return 5;
}

// You can track other functions by wrapping the function.
const wrapped = agentops.wrap(orignal);
wrapped("hello");


chat().then(() => {
    agentops.endSession("Success"); // Make sure you end your session when your agent is done.
});
