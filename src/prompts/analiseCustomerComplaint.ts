import OpenAI from 'openai';
import { configDotenv } from 'dotenv';
configDotenv();

const oi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const analyseCustomerComplaint = async (customerComplaint: string) => {
  const prompt = `
  Analyse the customer's complaint enclosed within triple backticks to infer
  following information and return JSON object:
  customer name: Name of the complaining customer. if missing, mark it as unknown.
  issue type: understand the nature of issue and categorise it into following category:
  - product defect: e.g., damaged product, faulty product
  - service delay: e.g., late delivery, unresponsive support
  - billing issue: e.g., incorrect charges, refunds
  - other : if none of the above applies
  description: Concise summary of the issue mentioned
  urgency: determine if the urgency of the compalint is high based on wording like "immediately", "urgent" or similar
  Format the response as following JSON object:

{
  "customer_name": "Name",
  "issue_type": "issue type",
  "description": "description",
  "urgency": "urgent/non-urgent"
}
  `;

  try {
    const response = await oi.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `\`\`\`${customerComplaint}\`\`\`` },
      ],
    });

    const data = response.choices[0].message.content;
    if (!data) {
      console.log({ error: 'No text generated by openai' });
      return;
    }
    const processedText = JSON.parse(data);
    console.log(processedText);
  } catch (error) {
    console.log({ error: `Failed to generate text by openai, ${error}` });
    return { error: `Failed to generate text by openai, ${error}` };
  }
};

// customer order
const customerComplaints = `"Hello, my name is prabin. I received a  TV set from your store last week, and I need it replaced faster than sooner. TV does not turn on. Please respond quickly."  `;

analyseCustomerComplaint(customerComplaints);