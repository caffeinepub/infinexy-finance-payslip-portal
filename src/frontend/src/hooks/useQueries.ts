import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Employee, Payslip, backendInterface } from "../backend";
import { useActor } from "./useActor";

export function useAllPayslips() {
  const { actor, isFetching } = useActor();
  return useQuery<Payslip[]>({
    queryKey: ["payslips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllPayslips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployeePayslips(username: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Payslip[]>({
    queryKey: ["payslips", "employee", username],
    queryFn: async () => {
      if (!actor || !username) return [];
      return actor.getPayslipsByEmployee(username);
    },
    enabled: !!actor && !isFetching && !!username,
  });
}

export function useAllEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeletePayslip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payslipId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePayslip(payslipId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslips"] });
    },
  });
}

type CreateArgs = Parameters<backendInterface["createPayslip"]>;
type UpdateArgs = Parameters<backendInterface["updatePayslip"]>;

export function useCreatePayslip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.createPayslip(...data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslips"] });
    },
  });
}

export function useUpdatePayslip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateArgs) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePayslip(...data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payslips"] });
    },
  });
}
