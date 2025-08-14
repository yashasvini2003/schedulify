# Timetable Maker: Intelligent Timetable Management

**Timetable Maker** is a modern, web-based application designed to simplify the complex task of creating and managing school timetables. Built with a clean and intuitive user interface, it provides administrators with the tools to efficiently schedule classes, manage teacher assignments, and resolve conflicts. The application is designed to be fast, responsive, and easy to use.

## Core Features

- **Centralized Timetable Editor:** An interactive master grid to assign classes and subjects to teachers for specific time slots.  
- **Dynamic Data Management:** Easily add, edit, or remove teachers, classes, and subjects. The timetable grid updates automatically.  
- **Clash Detection:** The system automatically prevents scheduling conflicts, such as assigning two teachers to the same class at the same time, or one teacher to multiple classes simultaneously.  
- **Repeat Assignments:** Quickly schedule recurring classes by applying an assignment to multiple days and periods at once.  
- **Teacher Timetable Viewer:** Generate and view individual timetables for every teacher, showing their workload and free periods.  
- **Class Timetable Viewer:** Generate and view timetables for each class, ready to be shared with students.  
- **PDF Export:** Export both teacher and class timetables as professional, multi-page PDF documents for easy printing and distribution.  
- **Persistent Storage:** All data is automatically saved to the browser's local storage, ensuring your work is never lost between sessions.  

## Tech Stack

Timetable Maker is built with a modern, robust, and scalable technology stack:

- **Framework:** [Next.js](https://nextjs.org/) (App Router)  
- **Language:** [TypeScript](https://www.typescriptlang.org/)  
- **UI Library:** [React](https://reactjs.org/)  
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)  
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)  
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)  
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)  
- **Icons:** [Lucide React](https://lucide.dev/)  

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
You will need to have [Node.js](https://nodejs.org/) (version 18 or later) and npm installed on your machine.

### Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/yashasvini2003/timetable.git
    ```
2. **Navigate to the project directory:**
    ```sh
    cd your-repository-name
    ```
3. **Install NPM packages:**
    ```sh
    npm install
    ```
    
### Running the Application

To start the development server, run the following command:

```sh
npm run dev
```
