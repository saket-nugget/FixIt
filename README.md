# FIXIT - Industrial AI Assistant 🔧✨

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)
![Gemini](https://img.shields.io/badge/Gemini-1.5-8E75B2)

**FIXIT** is a powerful, intelligent web application designed to revolutionize industrial maintenance. Point your camera at any machine, and let our AI diagnose the issue, identify the root cause, and guide you through the repair process step-by-step.

![App Screenshot](https://via.placeholder.com/1200x600/1a1612/f9a824?text=FixIt+Dashboard+Screenshot)

## ✨ Features

-   **🤖 AI Visual Diagnostics**: Powered by Google Gemini 1.5, instantly analyzes video and images to detect mechanical faults.
-   **💬 Smart Chat Interface**: Context-aware AI mechanic that answers your specific repair questions.
-   **🗣️ Hands-Free Voice Control**: Speak to the app while your hands are busy with tools.
-   **📚 Custom Manuals Library**: Save successful repair chats as permanent guides for your team.
-   **📊 Local History**: Automatically logs every scan and diagnosis for future reference.
-   **🔒 Privacy First**: All data is stored locally on your device.

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)

-   **Frontend**: React + Vite
-   **Styling**: Tailwind CSS (Dark/Industrial Theme)
-   **AI**: Google Gemini API (Multimodal Vision & Text)
-   **State Management**: React Hooks & LocalStorage
-   **Speech**: Web Speech API

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18+)
-   A Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/fixit.git
    cd fixit
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    VITE_GEMINI_MODEL=gemini-1.5-flash
    ```

4.  **Run the App**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

## 📖 Usage Guide

1.  **Scan**: Click "Start Scanner" to use your camera or upload a video file of the broken machine.
2.  **Diagnose**: Wait for the AI to analyze the visual feed and produce a confidence score and root cause.
3.  **Fix**:
    -   Follow the recommended steps.
    -   Use the **Chat** to ask specific questions like "What tool do I use for step 2?".
    -   Use **Voice** input if your hands are dirty.
4.  **Save**: Click "Save as Manual" to store the solution in your library.

## 🔮 Future Scope

-   **👓 AR Overlay**: Augmented reality to point at parts and see labels.
-   **☁️ Cloud Sync**: Team accounts to share manuals across the factory floor.
-   **📱 Native Mobile App**: React Native version for field technicians.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
