# Homemaker Suite: Live Off the Land Edition

A comprehensive digital guide and toolset for modern homesteading, survival, and self-sufficiency. This application combines improved knowledge management with interactive tools to help you master skills from gardening to emergency preparedness.

## 🌟 Features

- **Extensive Knowledge Base**: Organized into 21+ modules covering gardening, medical care, infrastructure, food storage, and more.
- **Interactive Tools**: Calculators and wizards for planning resources (e.g., Energy Planner, Construction Calculator).
- **Offline Capable**: Built as a Progressive Web App (PWA) to ensure access to critical information without an internet connection.
- **Scenario Playbooks**: Actionable guides for specific emergency scenarios like severe winter storms.
- **Modern Tech Stack**: Fast, responsive, and mobile-friendly interface.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Content Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown) for rendering the extensive library of markdown guides.

## 📂 Project Structure

The repository is organized into content modules and the application source code:

- **`app/`**: Contains the source code for the React application.
- **`0 Foundations` - `21 Scenario Playbooks`**: Markdown content files organized by topic.
- **`10 Tools & Wizards`**: JSON configurations for interactive tools.
- **`DEPLOYMENT.md`**: Instructions for deploying the application.

## 🚀 Getting Started

To run the application locally:

1.  **Navigate to the app directory:**
    ```bash
    cd app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    The application will typically run at `http://localhost:5173`.

## 📦 Building for Production

To create a production build:

```bash
cd app
npm run build
```

## ☁️ Deployment

This project is configured for deployment on Cloudflare Pages.

To deploy manually using Wrangler:

```bash
cd app
npm run deploy
```

For more detailed deployment instructions, please refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
