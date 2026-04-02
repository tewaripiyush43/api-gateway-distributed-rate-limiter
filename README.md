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
- multi-tenant downstream resolution
- service-level path routing
- latency and traffic metrics
- request tracing via `x-request-id`
- Redis-aware health checks
- graceful shutdown

The rate limiting state is stored in Redis so limits remain globally consistent across multiple gateway instances, while tenant configuration drives dynamic downstream routing.

The proxy layer forwards requests as streams, allowing the gateway to stay payload-agnostic and handle large files or mixed content types without buffering.

---

## Core Features

- Express + TypeScript gateway setup
- stream-based downstream proxy forwarding
- content-type agnostic request passthrough
- path normalization and tenant-aware service routing
- request body and header forwarding
- upstream timeout handling with `AbortController`
- safe `504 Gateway Timeout` responses
- Redis-backed distributed rate limiting
- Fixed Window and Sliding Window strategies
- Strategy Pattern based limiter selection
- API-key and plan-based rate limiting
- Redis `MULTI` transactions for atomic updates
- timeout-safe fail-open behavior on Redis outages and hangs
- request tracing via `x-request-id`
- Redis-aware `/health`
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
                │ Middleware Pipeline      │
                │ - Request ID             │
                │ - Metrics                │
                │ - Global Limiter         │
                │ - Tenant Resolution      │
                │ - Plan Limiter           │
                │ - URL Resolver           │
                │ - Stream Proxy           │
                └──────────┬───────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌──────────────────┐      ┌────────────────────┐
    │ Redis Shared     │      │ Tenant Downstream  │
    │ Rate Limit State │      │ Services / APIs    │
    └──────────────────┘      └────────────────────┘
```

---
## Request Lifecycle

```text
Client
  → Request ID assigned or reused
  → Metrics middleware starts timer
  → Global distributed rate limit validation
  → API key tenant resolution
  → Plan-based rate limiting
  → Downstream URL resolution
  → Stream-based transparent proxy to downstream service
  → Upstream response passthrough
  → Metrics updated
  → Response returned with x-request-id
```
The gateway resolves tenant and service routing before proxying while staying transparent to payload type.

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
  → requestIdMiddleware
  → metrics
  → globalRateLimiter
  → apiKeyMiddleware
  → planSelector
  → downstreamUrlResolver
  → proxyHandler
  → 404 middleware
  → globalErrorHandler
```

Each middleware handles a single responsibility, keeping the request pipeline easy to extend and reason about.

---

## Multi-Tenant Service Routing

The gateway supports tenant-aware downstream routing using API-key based configuration.

Each API key resolves:

- tenant plan
- tenant base URL
- service path mappings

A request like:

```text
/proxy/user/profile
```

is resolved as:
```text
{tenantBaseUrl} + /user-service + /profile
```

This enables the same gateway instance to serve multiple tenants while routing requests to tenant-specific downstream systems.

---

## Reliability and Failure Handling

The gateway includes:

- upstream timeout protection using `AbortController`
- safe `504` response mapping
- centralized error middleware
- timeout-safe fail-open behavior for Redis dependency hangs
- Redis-aware `/health` with bounded live ping checks
- graceful shutdown with bounded Redis cleanup timeout
- forced shutdown timeout fallback

Fail-open behavior is preserved even during Redis blackhole scenarios by bounding Redis dependency interactions with timeouts.

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