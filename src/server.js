const http = require('http');
const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Uncaught Exception Handler
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

// Create HTTP Server
const server = http.createServer(app);

// Connect to MongoDB and Start Server
const startServer = async () => {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════╗
║   🍕 FoodVille Server Running!      ║
║   📡 Port: ${PORT}                     ║
║   🌍 Mode: ${process.env.NODE_ENV || 'development'}          ║
║   🔗 http://localhost:${PORT}         ║
╚══════════════════════════════════════╝
        `);
    });
};

startServer();

// Unhandled Rejection Handler
process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});