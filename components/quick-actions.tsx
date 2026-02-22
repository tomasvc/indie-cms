import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FolderPlus, Receipt, Sparkles } from "lucide-react";

export function QuickActions() {
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>This is a summary of your quick actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="lg" className="w-full h-fit justify-start gap-3 px-3 py-2 hover:!bg-muted">
                        <Receipt />
                        <span className="flex flex-col items-start">
                            <span className="font-medium text-left">Create New Invoice</span>
                            <span className="text-xs text-muted-foreground text-left">Create and send an invoice</span>
                        </span>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full h-fit justify-start gap-3 px-3 py-2 hover:!bg-muted">
                        <FolderPlus />
                        <span className="flex flex-col items-start">
                            <span className="font-medium text-left">New Project</span>
                            <span className="text-xs text-muted-foreground text-left">Start a new project workspace</span>
                        </span>
                    </Button>
                    <Button variant="outline" size="lg" className="w-full h-fit justify-start gap-3 px-3 py-2 hover:!bg-muted">
                        <Sparkles />
                        <span className="flex flex-col items-start">
                            <span className="font-medium text-left">AI Proposal</span>
                            <span className="text-xs text-muted-foreground text-left">Generate a proposal with AI</span>
                        </span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}