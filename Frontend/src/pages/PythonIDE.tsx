
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, RotateCcw, Download, Copy, Code, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Import PythonInterpreter from our utility file
import { interpretPython } from "@/utils/pythonInterpreter";

const PythonIDE = () => {
  const [code, setCode] = useState("# Write your Python code here\n\nprint('Hello, World!')\n\n# Example multiplication table\nnumber = 3\nfor i in range(1, 11):\n    print(number, \"x\", i, \"=\", number * i)");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("editor");

  const examples = {
    basic: `# Basic Python Examples\n\nprint("Hello, World!")\n\n# Variables and data types\nname = "Python"\nversion = 3.9\nis_awesome = True\n\nprint(f"I'm using {name} version {version}")\nprint("Python is awesome:", is_awesome)\n`,
    
    conditions: `# Conditional Statements\n\n# if-elif-else example\nscore = 85\n\nif score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")\nelif score >= 70:\n    print("Grade: C")\nelif score >= 60:\n    print("Grade: D")\nelse:\n    print("Grade: F")\n\n# Nested if statements\nis_weekend = True\nis_sunny = True\n\nif is_weekend:\n    if is_sunny:\n        print("Let's go to the beach!")\n    else:\n        print("Let's watch a movie at home.")\nelse:\n    print("I have to work today.")`,
    
    loops: `# Loop Examples\n\n# For loop with range\nprint("Counting from 1 to 5:")\nfor i in range(1, 6):\n    print(i)\n\n# While loop\nprint("\\nCounting down from 5 to 1:")\ncount = 5\nwhile count > 0:\n    print(count)\n    count -= 1\n\n# Nested loops - multiplication table 1-5\nprint("\\nMultiplication table 1-5:")\nfor i in range(1, 6):\n    for j in range(1, 6):\n        print(f"{i} × {j} = {i*j}")\n    print()  # Print a blank line between tables\n`,
    
    functions: `# Function Examples\n\n# Basic function definition\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Function call\nmessage = greet("Developer")\nprint(message)\n\n# Function with default parameter\ndef power(base, exponent=2):\n    return base ** exponent\n\nprint(f"2² = {power(2)}")  # Uses default exponent\nprint(f"2³ = {power(2, 3)}")  # Custom exponent\n\n# Function with multiple returns\ndef get_min_max(numbers):\n    if not numbers:\n        return None, None\n    return min(numbers), max(numbers)\n\nnumbers = [5, 2, 8, 1, 9, 3]\nminimum, maximum = get_min_max(numbers)\nprint(f"Min: {minimum}, Max: {maximum}")\n`,
    
    dataStructures: `# Data Structures Examples\n\n# Lists\nfruits = ["apple", "banana", "cherry"]\nprint("Fruits:", fruits)\nfruits.append("orange")\nprint("After append:", fruits)\nprint("First fruit:", fruits[0])\n\n# Dictionaries\nstudent = {\n    "name": "Alice",\n    "age": 20,\n    "courses": ["Math", "Computer Science", "Physics"]\n}\n\nprint("\\nStudent info:")\nprint(f"Name: {student['name']}")\nprint(f"Age: {student['age']}")\nprint(f"Courses: {', '.join(student['courses'])}")\n\n# Sets\ncolors1 = {"red", "green", "blue"}\ncolors2 = {"green", "blue", "yellow"}\n\nprint("\\nSet operations:")\nprint(f"Union: {colors1 | colors2}")  # Union\nprint(f"Intersection: {colors1 & colors2}")  # Intersection\n`
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      setOutput("Running Python code...");
      
      // Use our improved Python interpreter
      const result = interpretPython(code);
      
      setOutput(result);
      
    } catch (error) {
      console.error('Code execution error:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode("# Write your Python code here\n\nprint('Hello, World!')\n\n# Example multiplication table\nnumber = 3\nfor i in range(1, 11):\n    print(number, \"x\", i, \"=\", number * i)");
    setOutput("");
    toast.success("Code reset to default");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "python_code.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Code downloaded successfully");
  };

  const loadExample = (exampleKey: keyof typeof examples) => {
    setCode(examples[exampleKey]);
    setActiveTab("editor");
    toast.success(`${exampleKey.charAt(0).toUpperCase() + exampleKey.slice(1)} example loaded`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="container mx-auto px-4 pt-16 pb-12 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="flex flex-col items-center space-y-4 text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Python Online IDE
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Write and execute Python code directly in your browser. Perfect for learning, prototyping, or quick scripts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            <div className="space-y-4">
              <Tabs 
                defaultValue="editor" 
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <div className="flex justify-between items-center mb-2">
                  <TabsList className="bg-white">
                    <TabsTrigger value="editor" className="flex items-center gap-1">
                      <Code size={16} /> Editor
                    </TabsTrigger>
                    <TabsTrigger value="examples" className="flex items-center gap-1">
                      <Lightbulb size={16} /> Examples
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyToClipboard}
                      className="flex items-center gap-1"
                    >
                      <Copy size={14} />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={downloadCode}
                      className="flex items-center gap-1"
                    >
                      <Download size={14} />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleReset}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </Button>
                  </div>
                </div>
                
                <TabsContent value="editor" className="mt-0">
                  <Card className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-0">
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-[450px] p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none resize-none rounded-none border-0"
                        spellCheck="false"
                      />
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="examples" className="mt-0">
                  <Card className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <h3 className="text-lg font-medium mb-4">Python Code Examples</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ExampleCard 
                        title="Basic Syntax" 
                        description="Variables, print statements, and data types" 
                        onClick={() => loadExample('basic')}
                      />
                      <ExampleCard 
                        title="Conditional Statements" 
                        description="if, elif, else statements and nested conditions" 
                        onClick={() => loadExample('conditions')}
                      />
                      <ExampleCard 
                        title="Loops" 
                        description="For loops, while loops, and nested loops" 
                        onClick={() => loadExample('loops')}
                      />
                      <ExampleCard 
                        title="Functions" 
                        description="Defining and calling functions with parameters" 
                        onClick={() => loadExample('functions')}
                      />
                      <ExampleCard 
                        title="Data Structures" 
                        description="Lists, dictionaries, and sets" 
                        onClick={() => loadExample('dataStructures')}
                      />
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-medium text-gray-700">Output</h2>
                <Button 
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center gap-1"
                >
                  <Play size={14} />
                  Run Code
                </Button>
              </div>
              <div className="p-4">
                <div className="bg-black text-green-400 font-mono p-4 h-[400px] rounded-md overflow-auto whitespace-pre-wrap">
                  {output ? output : <span className="text-gray-500 italic">Output will appear here...</span>}
                </div>
              </div>
            </Card>
          </div>
          
          <div className="p-6 bg-white rounded-lg border border-gray-200 mt-6 max-w-4xl">
            <h3 className="text-xl font-semibold mb-3">Python Features Supported</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Core Features</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Variables & data types (numbers, strings, booleans)</li>
                  <li>Basic operators and expressions</li>
                  <li>String manipulation and formatting</li>
                  <li>Lists, dictionaries and basic data structures</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Control Structures</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>if/elif/else conditional statements</li>
                  <li>For loops with range and iterables</li>
                  <li>While loops and control flow</li>
                  <li>Function definitions and calls</li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <p className="text-amber-600 text-sm mt-2">
                  <strong>Note:</strong> This is a browser-based simulation and has limitations. 
                  Complex Python libraries and certain advanced features are not available.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

// Helper component for example cards
const ExampleCard = ({ 
  title, 
  description, 
  onClick 
}: { 
  title: string; 
  description: string; 
  onClick: () => void 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={onClick}
            className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to load this example</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PythonIDE;
