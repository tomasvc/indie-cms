import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function RecentActivity() {
    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>This is a summary of your recent activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-bold">Projects</h2>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}