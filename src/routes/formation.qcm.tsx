import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/formation/qcm")({
  component: () => <Outlet />,
});
