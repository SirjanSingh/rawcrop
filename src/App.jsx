import { useState } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";

// Using Shadcn button
import { Input } from "@/components/ui/input";  // Using Shadcn input
import { Card, CardContent } from "@/components/ui/card"; // Using Shadcn card
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6">
      <h1 className="text-3xl font-bold">Upload your files here</h1>

      <FileUpload /> {/* ✅ Add this line to use the component */}
      {/* Counter Card
      <Card className="w-full max-w-md shadow-md">
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="text-xl font-semibold">Counter</h2>
          <p className="text-gray-600">Count is {count}</p>
          <Button onClick={() => setCount((prev) => prev + 1)} className="w-full">
            Increment
          </Button>
        </CardContent>
      </Card> */}

      {/* Input Card */}
      {/* <Card className="w-full max-w-md shadow-md">
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="text-xl font-semibold">Enter your name</h2>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type here..."
          />
          {name && <p className="text-gray-600">Hello, {name}!</p>}
        </CardContent>
      </Card> */}
    </div>



  );
}

export default App;
