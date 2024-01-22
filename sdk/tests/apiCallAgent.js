const OpenAI = require("openai");
const Client = require("../dist/app").Client;

const openai = new OpenAI(apiKey = process.env.OPENAI_API_KEY);

const agentops = new Client({
    apiKey: process.env.AGENTOPS_API_KEY,
    tags: ["Mock agent", "Node SDK"],
    patchApi: [openai]
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

async function pass(x) {
    console.log(x);
    await sleep(1000);
    return x;
}

async function fail(x) {
    await sleep(1000);
    throw new Error("This is a test error");
}



async function streamChat() {
    const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Say this is a test' }],
        stream: true,
    });
    for await (const chunk of stream) {
        console.log(chunk.choices[0]?.delta?.content || '');
    }
}

streamChat().then(() => { });


const main = async () => {

    await chat().then((completion) => { console.log(completion) });
    await streamChat().then(() => { });

    const successfulEvent = agentops.wrap(pass);
    await successfulEvent("success");


    const failedEvent = agentops.wrap(fail);
    try {
        await failedEvent("fail");
    }
    catch (e) {
        console.log(e);
    }

    const nested = async (x) => {
        successfulEvent(x)
    }

    const nestedEvent = agentops.wrap(nested);
    await nestedEvent("nested event");

}

main().then(() => { agentops.endSession("Success"); });

