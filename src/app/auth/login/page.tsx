import { LoginForm } from "./form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default async function Page({ searchParams }: { searchParams: any }) {
  const queryParams = await searchParams;
  // Handle error messages from the callback
  const errorMessage = queryParams.error
    ? getErrorMessage(queryParams.error as string)
    : null;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <LoginForm />
      </div>
    </div>
  );
}

// Function to get human-readable error messages
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "access_denied":
      return "You don't have permission to access this application. Only KilimoLink staff members are allowed.";
    case "server_error":
      return "An error occurred during sign in. Please try again later.";
    case "no_code":
      return "Authentication failed. Please try again.";
    default:
      return "An unknown error occurred. Please try again.";
  }
}
