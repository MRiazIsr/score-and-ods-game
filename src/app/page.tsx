import { Card } from "./components/Card";
import { SubmitButton } from "./components/SubmitButton"

export default function Home() {
  return (
      <main className="flex min-h-screen items-center justify-center">
        <Card
            title="TIP MANAGER"
            description="Please Log In "
        >
            <SubmitButton buttonText="Log In"/>
        </Card>
      </main>
  );
}
