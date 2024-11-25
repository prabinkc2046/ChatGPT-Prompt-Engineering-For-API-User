import OpenAI from 'openai';
import { configDotenv } from 'dotenv';
configDotenv();

interface OrderDetailType {
  order_id: string;
  iten_name: string;
  quantity: number;
  delivery_date: string;
}

interface OrderError {
  order: string;
}

const aiAgent = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const processOrder = async (
  userInput: string
): Promise<string | OrderDetailType | OrderError> => {
  const prompt = `
  You will process customer's order detail enclosed by ###.
  Follow these steps:
  step 1: identify following keys:
  - order_id: a unique 6 digits number to identify product
  - item_name: Name of the product
  - quantity: Number of items.
  - delivery_date: Date of expected delivery.

  step 2: Ensure all the above keys are valid and present.
  if any of the above key is missing, generate a friendly message to obtain
  missing keys. Your message to ask missing details should follow this format:
  
  <These are the details missing: <missing details separated by commas>.
  Could you kindly provide these details?>
  step3: Ensure the provided quanity of item is number.
  If quanity is not a number, generate a friendly message in json format to obtain quantity in
  number. Use message to ask quanity in number should follow this format:

<Could you please provide quantity in number?>
step 4: When all the keys are present and valid, return JSON object with above keys.

Customer's order details: ###${userInput}###
`;

  try {
    const response = await aiAgent.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `###${userInput}###` },
      ],
    });

    const data = response.choices[0].message.content;
    if (!data) throw Error(`No data returned from openai`);

    const parsedData = JSON.parse(data) as OrderDetailType;

    const missingDetails = [];
    // validate the data
    if (!parsedData.iten_name) {
      missingDetails.push(parsedData.iten_name);
    }

    if (!parsedData.delivery_date) {
      missingDetails.push(parsedData.delivery_date);
    }

    if (!parsedData.order_id) {
      missingDetails.push(parsedData.order_id);
    }
    if (!parsedData.quantity || parsedData.quantity <= 0) {
      missingDetails.push(parsedData.quantity);
    }

    if (missingDetails.length > 0) {
      return `Missing details: ${missingDetails.join(
        ', '
      )}. Could you provide these details?`;
    }
    console.log(parsedData);
    return parsedData;
  } catch (error) {
    console.log(`Failed to generate text by openai`, error);
    return { order: 'error' };
  }
};

processOrder(
  'order id 22233 item name is shampoo. \
  i bought 3 shampoos yesterday. \
  i am expecting to receive on 2024-12-25.'
);
