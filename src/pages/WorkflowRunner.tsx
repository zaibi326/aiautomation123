import { WorkflowRunner as WorkflowRunnerComponent } from "@/components/WorkflowRunner";

const WorkflowRunnerPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Workflow Automation Engine</h1>
          <p className="text-muted-foreground">
            Select and run JSON-based workflows like a lightweight n8n
          </p>
        </div>
        <WorkflowRunnerComponent />
      </main>
    </div>
  );
};

export default WorkflowRunnerPage;