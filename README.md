
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

update `frontend/vite.config.ts`'s `define` env var as well.

Start the development servers:

```bash
# Backend
pnpm dev

# Frontend
cd frontend && pnpm dev
```

## .env config

The following environment variables need to be configured:

- `MAINNET_DATABASE_FILE`: Path to SQLite database file for mainnet
- `TESTNET_DATABASE_FILE`: Path to SQLite database file for testnet
- `MAINNET_WS_RPC_URL`: CKB Node WebSocket RPC URL for mainnet
- `TESTNET_WS_RPC_URL`: CKB Node WebSocket RPC URL for testnet
- `MAINNET_HTTP_RPC_URL`: CKB Node HTTP RPC URL for mainnet
- `TESTNET_HTTP_RPC_URL`: CKB Node HTTP RPC URL for testnet
- `API_HTTP_PORT`: Port for Backend HTTP API server
- `API_WS_PORT`: Port for Backend WebSocket server
- `ALLOW_ORIGIN`: CORS allowed origins (default: "*") for Backend server
  - for multiple allow origins, separate with , eg: "domain1.com,domain2.com"

See `.env.example` for default values.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
