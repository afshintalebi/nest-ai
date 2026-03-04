# 🤖 NestJS AI Module Generator (CQRS + Mongoose)

An intelligent, AI-powered CLI tool that generates highly-opinionated NestJS boilerplate code. Instead of manually creating schemas, DTOs, CQRS commands, handlers, services, and controllers, simply describe what you want in **plain English**, and this tool will generate the entire module architecture in seconds.

## ✨ Features

- **🧠 AI-Powered Parsing:** Uses OpenAI to convert natural language descriptions into strictly typed JSON schemas.
- **🏗️ Strict Architecture:** Generates code adhering specifically to a `Common / Core / External` module structure using **Mongoose** (MongoDB) and the **CQRS Pattern**.
- **⚙️ Configuration-Driven:** Entirely template-based using `Handlebars` (.hbs) and a `structure.json` file. You can change the generated code without touching the TypeScript CLI engine.
- **🛡️ Smart Conflict Resolution:** Interactive terminal prompts protect you from accidentally overwriting existing files (Skip, Overwrite, Overwrite All, or Abort).

---

## 📂 Target Architecture

This tool is designed to generate files into a structured NestJS application. If you ask the tool to generate a `Customer` entity in the `core` module, it produces the following structure:

```text
src/
└── core/
    └── customer/
        ├── schemas/customer.schema.ts
        ├── cqrs/
        │   ├── dtos/create-customer.dto.ts
        │   └── commands/
        │       ├── impl/create-customer.command.ts
        │       └── handlers/create-customer.handler.ts
        ├── customer.service.ts
        ├── customer.controller.ts
        └── customer.module.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- An active [OpenAI API Key](https://platform.openai.com/)

### Installation

1. **Clone the repository / initialize the project:**
   ```bash
   git clone <your-repo-url>
   cd nest-ai-generator
   npm install
   ```

2. **Environment Variables:**
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

---

## 💻 Usage

Run the generator via npm by passing your module requirements as a string prompt.

```bash
npm run generate "I need a Customer entity in the core module. It needs a string name, a string email, an optional number age, and a boolean isActive which is required."
```
### What happens when you run this?
1. **AI Extraction:** The CLI sends your prompt to OpenAI to extract a structured JSON object representing your entity.
2. **Template Compilation:** The tool reads `templates/structure.json` to know which files to create.
3. **Code Generation:** It injects the AI JSON data into `Handlebars` templates and writes the files to your `src/` directory.

### 🛡️ Interactive File Conflicts
If the tool detects that a file already exists (e.g., you are running the command twice), it will pause and ask you how to handle the conflict:

```Text
⚠️  Conflict: schemas/customer.schema.ts already exists.
? How would you like to proceed? 
❯ ⏭️  Skip THIS file (Keep existing code)
  📄 Overwrite THIS file only
  💣 Overwrite ALL conflicting files
  🛑 Abort generation completely
```

---

## 🛠️ How it Works (Under the Hood)
This tool utilizes a Hybrid AI + Templating Approach to prevent AI hallucinations.

Instead of asking the AI to write raw NestJS code (which is prone to errors, missing imports, or architectural inconsistencies), the AI's only job is to generate a standardized JSON object like this:

```json
{
  "className": "Customer",
  "camelCaseName": "customer",
  "moduleType": "core",
  "properties": [
    { "name": "email", "type": "string", "isRequired": true },
    { "name": "age", "type": "number", "isRequired": false }
  ]
}
```

The CLI then passes this JSON to <strong>Handlebars (.hbs) templates</strong> to generate guaranteed, perfectly formatted TypeScript code.

---

## 🎨 Customizing the Templates
Because this tool is Configuration-Driven, you can add new files (like Unit Tests, Swagger configurations, or GraphQL Resolvers) without modifying the underlying TypeScript generator engine!

### 1. **The structure.json file**
This file dictates what files are created and where they are saved. You can use Handlebars syntax in the output paths.

```json
{
  "description": "NestJS CQRS Architecture",
  "files": [
    {
      "template": "schema.hbs",
      "output": "schemas/{{camelCaseName}}.schema.ts"
    },
    {
      "template": "new-feature.hbs",
      "output": "some-folder/{{camelCaseName}}.custom.ts"
    }
  ]
}
```

### 2. **Handlebars Templates (.hbs)**

Templates live in the `/templates` folder. You can use loops and conditionals based on the AI's output.

**Example Template (create-dto.hbs):**

```handlebars
export class Create{{className}}Dto {
{{#each properties}}
  {{this.name}}{{#if this.isRequired}}{{else}}?{{/if}}: {{this.type}};
{{/each}}
}
```

---

## 🤝 Next Steps & Extension Ideas
- **Update/Delete/Get**: Add standard CQRS Read and Update `queries/handlers` to the `structure.json` and templates.
- **Custom Handlebars Helpers**: Add string manipulation helpers to your `generator.ts` (e.g., converting names to `UPPER_SNAKE_CASE` for constants).
- **Swagger/OpenAPI**: Update the DTO templates to automatically inject `@ApiProperty()` decorators.
