import OpenAI from 'openai';
import 'dotenv/config';

// 1. define the TypeScript interfaces so we get autocomplete later
export interface EntityProperty {
  name: string;
  type: string;
  isRequired: boolean;
}

export interface EntitySchema {
  className: string;      // e.g., 'User'
  camelCaseName: string;  // e.g., 'user'
  moduleType: 'common' | 'core' | 'external';
  properties: EntityProperty[];
}

// 2. initialize OpenAI (automatically picks up OPENAI_API_KEY from .env)
const openai = new OpenAI();

// 3. the extraction function
export async function extractSchemaFromPrompt(userPrompt: string): Promise<EntitySchema> {
  const systemPrompt = `
    You are an expert NestJS software architect. 
    The user will describe an entity or module they want to create. 
    Your job is to extract the entity details and output them STRICTLY as a JSON object.
    
    Rules:
    - className MUST be PascalCase (e.g., 'Product').
    - camelCaseName MUST be camelCase (e.g., 'product').
    - moduleType MUST be exactly one of: 'common', 'core', or 'external'. If the user doesn't specify, default to 'core'.
    - Properties must use basic TypeScript types ('string', 'number', 'boolean', 'Date', etc.).
    - If a property seems optional based on the description, set isRequired to false, otherwise true.

    Example Output format:
    {
      "className": "User",
      "camelCaseName": "user",
      "moduleType": "core",
      "properties": [
        { "name": "email", "type": "string", "isRequired": true },
        { "name": "age", "type": "number", "isRequired": false }
      ]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // set your model here
      response_format: { type: "json_object" }, // this forces OpenAI to return valid JSON
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2, // low temperature for more deterministic/stable output
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("OpenAI returned empty content.");
    }

    // parse the JSON string into our TypeScript interface
    const parsedData: EntitySchema = JSON.parse(content);
    return parsedData;

  } catch (error) {
    console.error("❌ Failed to extract schema from AI:", error);
    throw error;
  }
}