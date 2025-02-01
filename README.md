# Ledger Lifeline Backend

This repository contains the backend codebase for **Ledger Lifeline**, an accounting software application designed to virtualize the bookkeeping process. Built with **Node.js** and **Express.js**, the backend handles the core CRUD operations, logical functions, and integrations with **MongoDB** for data storage and **AWS S3** for file storage.

The frontend UI codebase of **Ledger Lifeline** can be found [here](https://github.com/Emmett922/ledgerlifeline).

## Table of Contents

- [About the Application](#about-the-application)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
  - [Config](#config)
  - [Controllers](#controllers)
  - [Middleware](#middleware)
  - [Models](#models)
  - [Routes](#routes)
  - [Utils](#utils)
- [Installation and Setup](#installation-and-setup)
- [Contributing](#contributing)
- [License](#license)

---

## About the Application

The backend of Ledger Lifeline powers the application's functionalities, including:
- **CRUD Operations:** For accounts, users, journal entries, and more.
- **Authentication & Authorization:** Secure user login and role-based access control.
- **File Management:** Integration with AWS S3 for uploading and retrieving files.
- **Event Logging:** Tracks account updates, user actions, and login attempts.
- **Financial Statement Generation:** Converts financial data into downloadable PDF documents.

---

## Features

### General Features
- User management: Create, update, suspend, and deactivate users.
- Account management: View, create, and update accounts.
- Journal entry handling: Create, approve/deny, and post entries to the ledger.
- Email functionality for user communication.
- Generates financial statements in PDF format.

### Admin Features
- View and manage user creation requests.
- Access comprehensive event logs for accounts, users, and login attempts.

---

## Technology Stack

- **Node.js**: Backend runtime environment.
- **Express.js**: For creating API routes and middleware.
- **MongoDB**: Database for storing application data.
- **AWS S3**: File storage for source documents and receipts.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB.

---

## Directory Structure

The backend is organized into the following main directories:

### Config
- **`dbConn.js`**: Configuration file for connecting to MongoDB.
- **CORS Configuration (`allowedOrigins.js`, `corsOptions.js`)**: Defines allowed origins for cross-origin requests.

### Controllers
Houses the main CRUD and logical operations:
- **`accountController.js`**: Handles account-related operations (get, create, update).
- **`adminController.js`**: Manages user creation requests (approve/deny).
- **`emailHandler.js`**: Implements all email functionalities.
- **`errorMessageController.js`**: Handles predefined error messages.
- **`eventLogsController.js`**: Retrieves logs for login attempts, user updates, and account updates.
- **`journalEntryController.js`**:
  - Creates and retrieves journal entries.
  - Handles approval/denial of entries.
  - Posts approved entries to the ledger and updates account balances.
  - Uploads entry files to AWS S3.
- **`statementGenerator.js`**: Converts financial statements into downloadable PDF documents.
- **`usersController.js`**:
  - Retrieves users (all or by username/email).
  - Handles login attempts and user creation.
  - Generates unique usernames.
  - Updates user information, passwords, roles, and statuses.

### Middleware
Contains utility files for request and error handling:
- **`logger.js`**: Logs incoming requests.
- **`errorHandler.js`**: Captures and logs application errors.

### Models
Defines the MongoDB schemas used throughout the application:
- **`accountUpdate.js`**
- **`accounts.js`**
- **`errorMessage.js`**
- **`journalEntry.js`**
- **`loginAttempt.js`**
- **`password.js`**
- **`user.js`**
- **`userUpdate.js`**

### Routes
Initializes API endpoints to interact with the controllers:
- **`accountRoutes.js`**
- **`adminRoutes.js`**
- **`emailRoutes.js`**
- **`errorMessageRoutes.js`**
- **`eventLogRoutes.js`**
- **`fileUploadRoutes.js`**
- **`journalEntryRoutes.js`**
- **`root.js`**
- **`userRoutes.js`**

### Utils
- **`s3helper.js`**: Handles file uploads to AWS S3.

### Root Directory
- **`server.js`**: Initializes the backend application.
