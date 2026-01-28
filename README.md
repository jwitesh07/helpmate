HelpMate: Hyperlocal Service Marketplace
HelpMate is a full-stack hyperlocal marketplace that connects "Requesters" (people needing tasks done) with "Helpers" (local service providers). The platform features real-time communication, secure role-based dashboards, and a multi-step verification flow.

🚀 Key Features
Dual-Role Architecture: Toggle between Helper and Requester modes with dynamically filtered dashboards.

Real-Time Chat: Instant messaging between task owners and assignees powered by Socket.IO.

Secure Authentication: 3-step onboarding including Mobile OTP verification and JWT-based session management.

Gated Functionality: Logic-driven UI that prevents unverified users from performing critical actions (e.g., posting or accepting paid tasks).

Task Management: Full CRUD lifecycle for tasks, from creation and bidding to assignment and completion.


🛠 Tech Stack
Frontend:"React (Vite), Tailwind CSS, Lucide React (Icons), Axios"
Backend:"Node.js, Express.js, Socket.IO"
Database:MySQL  (Relational schema)
Auth:"JWT (JSON Web Tokens), OTP-based Verification"


🏗 System Architecture:
The project follows a modular client-server architecture:

Client: Vite-powered React app using functional components and hooks for state management.

Server: Express API handling RESTful routes and a Socket.IO manager for WebSocket events.

Database: A relational schema managing users, tasks, task_assignments, and chat_messages.



Installation:

Clone the repository

Bash
git clone https://github.com/your-username/helpmate.git
cd helpmate


Setup Backend:
Bash
cd backend
npm install
npm run dev
Create a .env file in the /server directory:

Code snippet
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=helpmate_db
JWT_SECRET=your_super_secret_key
Initialize the database using the provided SQL schema in /database/schema.sql.


Setup Frontend:
Bash
cd helpmate-ui
npm install
npm run dev

📸 Screenshots:
<img width="956" height="727" alt="Screenshot 2026-01-28 at 6 26 31 PM" src="https://github.com/user-attachments/assets/981fc32c-8354-4c26-ab3d-2e4fbbd41337" />
<img width="921" height="722" alt="Screenshot 2026-01-28 at 6 26 53 PM" src="https://github.com/user-attachments/assets/095f02f7-2b7a-44f8-b460-ee7e019f757f" />
<img width="1380" height="762" alt="Screenshot 2026-01-28 at 6 27 30 PM" src="https://github.com/user-attachments/assets/74d88e52-3be3-4e25-b2d1-6b8c4063d0d6" />
<img width="1393" height="757" alt="Screenshot 2026-01-28 at 6 27 16 PM" src="https://github.com/user-attachments/assets/6343a28e-720b-49df-a6e9-a3eb37ed59d8" />



