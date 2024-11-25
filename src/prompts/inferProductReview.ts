import OpenAI from 'openai';
import { configDotenv } from 'dotenv';
configDotenv();

const oi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const inferProductReview = async (productReview: string) => {
  // infer this
  const infer = {
    productName: 'SmartVac 3000',
    pros: 'It cleans well',
    cons: 'battery last short',
    overallSentiment: 'mix',
    suitability: 'no',
  };
  const prompt = `
  Analyze the  product's review by customer enclosed within triple backticks.
  You goal is to extract the insight of the product and its suitability.
  
  Attributes to extract:
  - product name: Name of the product being reviewed
  - pros: positive aspect of the product
  - cons: negative aspect of the product
  - overll Sentiment: determine if the review is postive, negative or mix based on the content
  - suitability: Decides if the product is suitable based on thier requirements, (true/false)

  When all attributes extracted, return a JSON object in the following format:
  {
   "product_name": "product name",
    "pros": ["List of positive aspects"],
    cons: ["List of negative aspects"],
    overallSentiment: 'positive/negative/mix',
    suitability: 'true/false',
  }
 if any attribute is unknown, mark the value of that key as unknown.
  `;

  try {
    const response = await oi.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `\`\`\`${productReview}\`\`\`` },
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
const productReview = `I recently purchased some item  from you, and while it cleans well, the battery life is disappointing. It only lasts for about 30 minutes, which isn't enough for my 2-bedroom apartment.`;

inferProductReview(productReview);