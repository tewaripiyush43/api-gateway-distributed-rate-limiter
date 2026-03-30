# API Gateway with Distributed Rate Limiting

A production-style API Gateway built with **Express + TypeScript** that proxies downstream traffic and enforces **distributed rate limiting across horizontally scalable gateway instances using Redis shared state**.

The project focuses on backend infrastructure fundamentals such as request validation, proxying, plan-aware rate limiting, Redis atomicity, observability, graceful shutdown, and Dockerized local deployment.

---

## Overview

This gateway sits in front of downstream services and centralizes:

- request forwarding
- API key authentication
- Free / Pro plan enforcement
- distributed rate limiting
- latency and traffic metrics
- timeout protection
- graceful shutdown

The rate limiting state is stored in Redis so limits remain globally consistent across multiple gateway instances.

---

## Core Features

- Express + TypeScript gateway setup
- downstream proxy forwarding
- path normalization
- request body and header forwarding
- upstream timeout handling with `AbortController`
- safe `504 Gateway Timeout` responses
- Redis-backed distributed rate limiting
- Fixed Window and Sliding Window strategies
- Strategy Pattern based limiter selection
- API-key and plan-based rate limiting
- Redis `MULTI` transactions for atomic updates
- fail-open behavior on Redis failure
- request metrics via `/metrics`
- graceful shutdown on `SIGTERM` / `SIGINT`
- Docker and Docker Compose local setup

---

## High-Level Architecture

```text
                 ┌──────────────────────┐
Client Request ─▶│      API Gateway     │
                 │  Express + TypeScript│
                 └──────────┬───────────┘
                            │
                            ▼
                ┌──────────────────────────┐
                │ Middleware Pipeline       │
                │ - Metrics                 │
                │ - API Key Auth            │
                │ - Plan Resolution         │
                │ - Rate Limiter            │
                │ - Proxy Forwarding        │
                └──────────┬───────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌──────────────────┐      ┌────────────────────┐
    │ Redis Shared     │      │ Downstream Service │
    │ Rate Limit State │      │ / APIs             │
    └──────────────────┘      └────────────────────┘
```

---

## Request Lifecycle

```text
Client
  → Metrics middleware starts timer
  → API key validation
  → Plan selection (Free / Pro)
  → Distributed Redis rate limit validation
  → Proxy request to downstream
  → Upstream response passthrough
  → Metrics updated
  → Response returned
```

Rate limits and authentication checks are enforced before proxy forwarding.

---

## Distributed Rate Limiting Design

The distributed rate limiting layer ensures consistent enforcement across multiple gateway instances.

A local in-memory counter stops working correctly once traffic is distributed across multiple replicas. To solve this, limiter state is stored in Redis so every gateway instance updates the same request counters.

### Why it is distributed

```text
Gateway Instance A ─┐
                    ├──▶ Redis Counter Key
Gateway Instance B ─┘
```

This prevents the same API key from bypassing limits by routing requests through different gateway instances.

### Implemented strategies

#### Fixed Window
- simple counter per time window
- low Redis overhead
- fast and predictable
- minor boundary burst issue

#### Sliding Window
- smoother rate limiting
- better burst control
- reduces burst spikes near window boundaries
- slightly higher Redis complexity

The limiter algorithms are isolated behind the Strategy Pattern, making it easy to add new strategies.

---

## Redis Consistency and Atomicity

Redis operations use **`MULTI` transactions** to keep updates atomic.

This prevents race conditions when multiple gateway instances receive requests simultaneously for the same API key.

The key design is TTL-driven so expired counters are removed automatically.

Typical counter shape:

```text
rate_limit:{apiKey}:{window}
```

This keeps the design:
- horizontally scalable
- expiry friendly
- predictable Redis key lifecycle
- easy to debug

---

## Middleware Design

```text
request
  → metrics
  → apiKeyMiddleware
  → planSelector
  → distributedRateLimiter
  → proxyHandler
  → 404 middleware
  → globalErrorHandler
```

Each middleware handles a single responsibility, keeping the request pipeline easy to extend and reason about.

---

## Reliability and Failure Handling

The gateway includes:

- upstream timeout protection using `AbortController`
- safe `504` response mapping
- centralized error middleware
- fail-open strategy if Redis is unavailable
- graceful shutdown with Redis connection cleanup
- forced shutdown timeout fallback

Fail-open behavior prioritizes gateway availability during Redis outages.

---

## Metrics

The `/metrics` endpoint currently exposes:

- total requests
- blocked requests
- average latency

This helps monitor request throughput, limiter effectiveness, and latency trends.

---

## Running Locally

### Start with Docker

```bash
docker-compose up --build
```

### Run locally

```bash
npm install
npm run dev
```

The Docker Compose setup includes:

- `api-gateway`
- `gateway-redis`

Redis is available to the gateway through:

```text
redis://redis:6379
```

---

## Engineering Tradeoffs

### Fixed Window
**Pros**
- simple
- fast
- low Redis usage

**Cons**
- window boundary spikes

### Sliding Window
**Pros**
- smoother burst control
- better burst accuracy

**Cons**
- more Redis work per request