import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const parseMessage = async (message: string) => {
  try {
    const instruction = `
    Extract the following details from the text:
        - Name
        - Customer
        - Address

        Response format:
        {
            "name": "<name>",
            "customer": "<customer>",
            "address": "<address>"
        }
    
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: instruction },
        { role: 'user', content: `Text: "${message}"` },
      ],
    });

    const parsedMessage = response.choices[0].message.content;

    if (!parsedMessage) throw new Error('No data returned from OpenAI');

    return JSON.parse(parsedMessage);
  } catch (error) {
    console.error('Error in parsing message:', error);
    throw new Error('Error parsing message');
  }
};
