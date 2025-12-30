import { MousePointer2 } from "lucide-react";

export function TestCard() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground overflow-hidden border-border/50 shadow-sm">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                        <h3 className="text-2xl font-bold mt-1">24,563</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <MousePointer2 className="w-5 h-5 text-primary" />
                    </div>
                </div>
            </div>
        </div>
    )
}