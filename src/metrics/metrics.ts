export class Metrics {
    totalRequests = 0;
    blockedRequests = 0;
    latencySum = 0;

    recordRequest() {
        this.totalRequests++;
    }
    recordBlocked() {
        this.blockedRequests++;
    }
    recordLatency(ms: number) {
        this.latencySum += ms;
    }
    getMetrics() {
        return ({
            totalRequests: this.totalRequests,
            blockedRequests: this.blockedRequests,
            avgLatencyMs: this.totalRequests === 0 ? 0 : (this.latencySum / this.totalRequests)
        })
    }
}

export const metrics = new Metrics();