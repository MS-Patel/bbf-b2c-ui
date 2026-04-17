import { useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/react-hook-form" as never;
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles, ShieldCheck, TrendingUp } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/brand-logo";

import { useAuthStore } from "@/stores/auth-store";
import {
  useLoginMutation,
  useOtpLoginMutation,
  useRequestOtpMutation,
} from "@/features/auth/api";
import {
  loginSchema,
  otpVerifySchema,
  ROLE_OPTIONS,
  type LoginFormValues,
  type OtpVerifyFormValues,
} from "@/features/auth/schemas";
import { ROLE_HOME } from "@/features/auth/role-routes";
import type { UserRole } from "@/types/auth";

const searchSchema = z.object({
  redirect: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — WealthOS" },
      { name: "description", content: "Sign in to your WealthOS account." },
    ],
  }),
  component: LoginPage,
});
