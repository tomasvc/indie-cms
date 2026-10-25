import type { SECTIONS } from "./constants";

export type { ProjectFormValues } from "@/lib/schemas/project";

export type SectionId = (typeof SECTIONS)[number]["id"];
