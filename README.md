<div align="center">
  <a href="https://github.com/olivestory-corp/Sasara">
    <img src="public/favicon.ico" width="150" height="150" alt="banner" /><br>
  </a>
</div>

# Sasara AI
Sasara AI brings secure and local AI to your desktop with built-in RAG knowledge base and Markdown note. You can use local mode without any internet connection to protect your privacy.

You can download the latest version from our [Website](https://sasaradesktop.com/).

At its core, Sasara AI is built on:
- <u>[Ollama](https://ollama.com/)</u>: For running local LLMs quickly and efficiently.
- <u>[LlamaIndex](https://www.llamaindex.ai/)</u>: As the data framework.
- <u>[Klee](https://github.com/signerlabs/klee-service)</u>: As the integrated AI backend kernel.

## 🌠 Screenshot

<img src="public/screenshot1.png" alt="Sasara Demo" style="border-radius: 8px">

## 🤝 Contributing
We warmly welcome contributions to Sasara AI! Here are some ways you can get involved:

1. Contribute Code: Develop new features or enhance existing code.
2. Fix Bugs: Submit solutions for any bugs you encounter.
3. Maintain Issues: Assist in managing GitHub issues.
4. Product Design: Take part in design discussions.
5. Write Documentation: Enhance user manuals and guides.
6. Community Engagement: Participate in discussions and support users.
7. Promote Usage: Help spread the word about Sasara AI.

## 🔧 Installation

You can download the [released version here](https://sasaradesktop.com/) or you can setup following the processes below:

### 1. System Requirements

- Node.js 20.x or higher
- Yarn 1.22.19 or higher

### 2. Clone the Repository

```bash
git clone https://github.com/olivestory-corp/Sasara.git
cd Sasara
```

### 3. Install Dependencies

```bash
yarn install
```

### 4. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit the `.env` file to configure the following environment variables according to your requirements:

#### Basic Configuration

```
# Remote Mode Configuration
# Set to 'true' to enable remote mode, 'false' to use local mode (default is 'false')
VITE_USE_SUPABASE=false

# Supabase configuration (only required if VITE_USE_SUPABASE=true)
# These are used to configure your own remote service
# If not specified, the system will use our default deployed service
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_AUTH_CALLBACK_URL=your_callback_url

# Ollama service address (default: http://localhost:11434)
VITE_OLLAMA_BASE_URL=http://localhost:11434

# Local Python service address (default: http://localhost:6190)
VITE_REQUEST_PREFIX_URL=http://localhost:6190
```

### 5. Set Up Backend Service

Before running the client, you need to set up and start the backend service. Clone and configure the backend service repository:

```bash
git clone https://github.com/olivestory-corp/klee-service.git
cd klee-service
```

Follow the installation instructions in the backend repository to set up and start the service. The backend service needs to be running on port 6190 (or the port you specified in `VITE_REQUEST_PREFIX_URL`) for the client to connect properly.

Refer to the [klee-service repository](https://github.com/olivestory-corp/klee-service) for detailed backend setup instructions.

### 6. Run in Development Mode

```bash
yarn dev
```

This command will start both the Vite development server and the Electron application.

### 7. Build the Application - Optional


```bash
yarn build
```


### 8. macOS App Signing and Notarization - Optional

Edit `.env` file if you need to build a signed application for macOS.

```
# Apple ID account
APPLEID=your_apple_id@example.com
# Apple ID password or app-specific password
APPLEIDPASS=your_apple_id_password
# Apple Developer Team ID
APPLETEAMID=your_team_id
```

After building is complete, you can find the compiled application in the `dist` directory.

## 🚀 Other Useful Commands

- `yarn type-check`: Run TypeScript type checking
- `yarn lint`: Run ESLint and Stylelint for code quality checking
- `yarn lint:fix`: Automatically fix resolvable code style issues
- `yarn generate-icons`: Generate application icons (requires app-icon.png file)

## 📄 License & Credits

This project is a fork of [signerlabs/Klee](https://github.com/signerlabs/Klee) and complies with the terms of the [MIT License](https://opensource.org/licenses/MIT).

## 📖 Technology Stack

<u>[Electron](https://www.electronjs.org/)</u> | <u>[React](https://react.dev/)</u> | <u>[TypeScript](https://www.typescriptlang.org/)</u> | <u>[Vite](https://vite.dev/)</u> | <u>[Tailwind CSS](https://tailwindcss.com/)</u> | <u>[Radix UI](https://www.radix-ui.com/)</u> | <u>[i18nex](https://www.i18next.com/)</u> | <u>[React Query](https://github.com/TanStack/query/)</u> | <u>[Jotai](https://jotai.org/)</u>
