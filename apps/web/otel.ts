// Starts tracing before the app loads: node --import ./otel.mjs .output/index
// Bundled to otel.mjs at build time, because .output only ships the app's own dependencies.
// Spans go over OTLP/HTTP to the ADOT collector sidecar, which forwards them to X-Ray.
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { AWSXRayIdGenerator } from '@opentelemetry/id-generator-aws-xray';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';
import { NodeSDK } from '@opentelemetry/sdk-node';

const quietPaths = ['/api/health', '/static/'];

const sdk = new NodeSDK({
  serviceName: process.env.OTEL_SERVICE_NAME ?? 'zurich-life-direct-web',
  // Reads OTEL_EXPORTER_OTLP_ENDPOINT; defaults to the sidecar on localhost:4318.
  traceExporter: new OTLPTraceExporter(),
  // X-Ray needs its own trace ID format and header. The header also rides on the SNS publish,
  // so SNS active tracing can carry the trace on to SQS and the Lambda.
  idGenerator: new AWSXRayIdGenerator(),
  textMapPropagator: new AWSXRayPropagator(),
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingRequestHook: (request) =>
        quietPaths.some((path) => request.url?.startsWith(path) ?? false),
    }),
    // Node's fetch (used for the MuleSoft calls) runs on undici, not the http module.
    new UndiciInstrumentation(),
    new AwsInstrumentation({ suppressInternalInstrumentation: true }),
  ],
});

sdk.start();

process.once('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
