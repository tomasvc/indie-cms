import { Metadata } from "next";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata: Metadata = {
    title: "Onboarding",
    description: "Welcome to Freelance OS. Your workspace for projects, clients, and invoices. Get set up in a few quick steps and start managing your work with ease.",
};

export default function OnboardingPage() {
    return (
        <div className="flex min-h-[60vh] w-full animate-fadein">
            <OnboardingFlow />
        </div>
    );
}


