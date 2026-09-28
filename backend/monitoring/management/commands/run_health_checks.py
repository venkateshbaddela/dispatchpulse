import time
from django.core.management.base import BaseCommand
from monitoring.engine import probe_all_services_concurrently
from monitoring.models import HealthCheckLog

class Command(BaseCommand):
    help = "Executes concurrent HTTP probes across all services and evaluates alert tripwires."

    def add_arguments(self, parser):
        parser.add_argument(
            "--daemon",
            action="store_true",
            help="Run in a continuous polling daemon loop instead of a single sweep.",
        ) 
        parser.add_argument(
            "--interval",
            type=int,
            default=15,
            help="Interval in seconds between sweeps when running in --daemon mode (default: 15s).",
        )
        parser.add_argument(
            "--workers",
            type=int,
            default=10,
            help="Maximum concurrent probe threads (default: 10)."
        )

    def handle(self, *args, **options):
        is_daemon = options["daemon"]
        interval = options["interval"]
        workers = options["workers"]

        if is_daemon:
            self.stdout.write(
               self.style.SUCCESS(
                    f"Starting DispatchPulse Health Check Daemon (polling every {interval}s, workers={workers})..."
                ) 
            )
            self.stdout.write("Press Ctrl+C to stop.\n")
            try:
                while True:
                    self._run_sweep(workers)
                    time.sleep(interval)
            except KeyboardInterrupt:
                self.stdout.write(self.style.WARNING("\nDaemon stopped by user. Exiting cleanly."))
        else:
            self.stdout.write("Running single-pass health check sweep...")
            self._run_sweep(workers)


    def _run_sweep(self, workers:int):
        start_time = time.perf_counter()
        results = probe_all_services_concurrently(max_workers=workers)
        elapsed_sec = time.perf_counter() - start_time

        # Print per-service telemetry line
        for log in results["logs"]:
            if isinstance(log, HealthCheckLog):
                service_name = log.service.name
                status_str = f"[{log.status_code}]" if log.status_code else "[ERR]"
                latency_str = f"{log.latency_ms}ms"

                if log.is_success:
                    prefix = self.style.SUCCESS("✓ PASS")
                    self.stdout.write(
                        f"  {prefix} {service_name:<30} {status_str:<7} {latency_str:<8}"
                    )
                else:
                    prefix = self.style.ERROR("✗ FAIL")
                    err_info = f"({log.error_message})" if log.error_message else ""
                    self.stdout.write(
                        f"  {prefix} {service_name:<30} {status_str:<7} {latency_str:<8} {err_info}"
                    )

        total = results["total"]
        passed = results["success"]
        failed = results["failed"]

        summary = f"Sweep completed in {elapsed_sec:.2f}s — Total: {total} | Healthy: {passed} | Failing: {failed}"
        if failed > 0:
            self.stdout.write(self.style.WARNING(summary + "\n"))
        else:
            self.stdout.write(self.style.SUCCESS(summary + "\n"))