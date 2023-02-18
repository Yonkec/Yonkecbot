//Function to process a text completion via DaVinci
export async function runCompletion (message, openai) {
    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: message,
            max_tokens: 500,
        });

        return completion.data.choices[0].text;
    }
    catch (error){
        console.log(error)
        return "Stop being a dick, you know I won't respond to that.";
    }
}

//Function to process an image completeion via DALL-E
export async function imageCompletion (message, openai) {
    try {
        const completion = await openai.createImage({
            prompt: message,
            n:1,
            size:'1024x1024',
        });

        return completion.data.data[0].url;
    }
    catch (error){
        console.log(error);
        return "Your request was rejected as a result of our safety system. Your prompt may contain text that is not allowed by our safety system.";
    }
}