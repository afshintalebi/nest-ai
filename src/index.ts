import { Command } from 'commander';
import { extractSchemaFromPrompt } from './ai';
import { generateCode } from './generator';

const program = new Command();

program
  .name('nest-ai-gen')
  .description('AI-powered NestJS CQRS Module Generator')
  .version('1.0.0');

// define the main command that takes a prompt
program
  .argument('<prompt>', 'Describe the entity you want to generate in plain English')
  .action(async (prompt: string) => {
    try {
      console.log(`\n🤖 Analyzing request: "${prompt}"...`);
      
      // 1. send description to OpenAI
      console.log('⏳ Asking AI to extract schema...');
      const schema = await extractSchemaFromPrompt(prompt);
      
      console.log(`✅ AI successfully extracted the schema:`);
      console.dir(schema, { depth: null, colors: true });

      // 2. pass the extracted JSON to our Handlebars generator
      await generateCode(schema);
      
    } catch (error) {
      console.error('\n❌ Fatal Error:', (error as Error).message);
      process.exit(1);
    }
  });

// parse the terminal arguments
program.parse(process.argv);