
# CKB TX Elevator

A full-stack application that visualizes the CKB blockchain using an elevator metaphor, making blockchain concepts more intuitive and easier to understand.

## Features

- Visual representation of CKB blockchain as an elevator system
- Real-time block monitoring and visualization
- Interactive blockchain explorer with elevator-style interface

## Project Structure

- `/src` - Backend service with CKB Node RPC
- `/frontend` - Preact-based visualization interface

## Getting Started

### Prerequisites

- Node.js (>= 20.x)
- pnpm
- SQLite3

### How to Run

1. Clone the repository:

```bash
git clone https://github.com/cryptape/ckb-tx-elevator.git
```

Install dependencies:

```bash
pnpm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Start the development servers:

```bash
# Backend
pnpm dev

# Frontend
cd frontend && pnpm dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
