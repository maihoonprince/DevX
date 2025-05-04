
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, RotateCcw, Download, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const PythonIDE = () => {
  const [code, setCode] = useState("# Write your Python code here\n\nprint('Hello, World!')\n\n# Example multiplication table\nnumber = 3\nfor i in range(1, 11):\n    print(number, \"x\", i, \"=\", number * i)");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      setOutput("Running code...");
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enhanced Python code execution simulation
      let simulatedOutput: string[] = [];
      
      // Parse the code to extract and simulate print statements
      const codeLines = code.split('\n');
      let variables: Record<string, any> = {};
      let indent = 0;
      let currentBlock: string[] = [];
      let inFunction = false;
      let functions: Record<string, {params: string[], body: string[], scope: Record<string, any>}> = {};
      let skipToLine = -1;
      
      // Very basic Python interpreter simulation
      for (let lineIndex = 0; lineIndex < codeLines.length; lineIndex++) {
        if (lineIndex < skipToLine) continue;
        
        const line = codeLines[lineIndex];
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (trimmedLine.startsWith('#') || !trimmedLine) continue;
        
        // Calculate indentation level
        const currentIndent = line.search(/\S|$/);
        
        // Handle function definitions
        if (trimmedLine.startsWith('def ')) {
          const funcMatch = trimmedLine.match(/def\s+(\w+)\((.*?)\):/);
          if (funcMatch) {
            const funcName = funcMatch[1];
            const params = funcMatch[2].split(',').map(p => p.trim());
            const funcBody: string[] = [];
            
            let i = lineIndex + 1;
            while (i < codeLines.length) {
              const nextLine = codeLines[i];
              const nextIndent = nextLine.search(/\S|$/);
              
              if (nextIndent > currentIndent && nextLine.trim()) {
                funcBody.push(nextLine);
                i++;
              } else {
                break;
              }
            }
            
            functions[funcName] = {
              params,
              body: funcBody,
              scope: { ...variables }
            };
            
            skipToLine = i;
            continue;
          }
        }
        
        // Handle function calls
        const funcCallMatch = trimmedLine.match(/^(\w+)\((.*?)\)$/);
        if (funcCallMatch && functions[funcCallMatch[1]]) {
          const funcName = funcCallMatch[1];
          const func = functions[funcName];
          const args = funcCallMatch[2].split(',').map(arg => {
            arg = arg.trim();
            
            // Handle string args
            if ((arg.startsWith("'") && arg.endsWith("'")) || 
                (arg.startsWith('"') && arg.endsWith('"'))) {
              return arg.substring(1, arg.length - 1);
            }
            
            // Handle variable args
            if (variables[arg] !== undefined) {
              return variables[arg];
            }
            
            // Handle numeric args
            if (!isNaN(Number(arg))) {
              return Number(arg);
            }
            
            return arg;
          });
          
          // Create function scope with arguments
          const funcScope: Record<string, any> = { ...func.scope };
          func.params.forEach((param, i) => {
            funcScope[param] = args[i];
          });
          
          // Execute function body
          const savedVars = { ...variables };
          variables = funcScope;
          
          for (const bodyLine of func.body) {
            // Handle print statements within the function
            if (bodyLine.trim().includes('print(')) {
              simulatePrintStatement(bodyLine, variables, simulatedOutput);
            }
            
            // Handle variable assignments within the function
            handleVariableAssignment(bodyLine, variables);
          }
          
          // Restore parent scope
          variables = savedVars;
          continue;
        }
        
        // Handle if statements (basic implementation)
        if (trimmedLine.startsWith('if ') && trimmedLine.endsWith(':')) {
          const condition = trimmedLine.substring(3, trimmedLine.length - 1);
          let conditionResult = false;
          
          try {
            // Evaluate the condition by replacing variables
            let evalCondition = condition;
            for (const [key, value] of Object.entries(variables)) {
              if (typeof value === 'string') {
                evalCondition = evalCondition.replace(new RegExp(`\\b${key}\\b`, 'g'), `'${value}'`);
              } else {
                evalCondition = evalCondition.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
              }
            }
            
            // Handle common Python comparisons
            evalCondition = evalCondition
              .replace(/==/g, '===')
              .replace(/!=/g, '!==')
              .replace(/ and /g, ' && ')
              .replace(/ or /g, ' || ')
              .replace(/ not /g, ' !');
              
            // eslint-disable-next-line no-eval
            conditionResult = eval(evalCondition);
          } catch (error) {
            console.error('Error evaluating condition:', error);
          }
          
          let i = lineIndex + 1;
          const ifBlock: number[] = [];
          let elseBlock: number[] = [];
          let foundElse = false;
          
          // Collect if and else blocks
          while (i < codeLines.length) {
            const nextLine = codeLines[i];
            const nextIndent = nextLine.search(/\S|$/);
            const nextTrimmed = nextLine.trim();
            
            if (nextIndent > currentIndent) {
              if (!foundElse) {
                ifBlock.push(i);
              } else {
                elseBlock.push(i);
              }
              i++;
            } else if (nextIndent === currentIndent && nextTrimmed.startsWith('else:')) {
              foundElse = true;
              i++;
            } else {
              break;
            }
          }
          
          // Execute the appropriate block
          if (conditionResult && ifBlock.length > 0) {
            // Don't skip the if block
          } else if (!conditionResult && foundElse) {
            // Skip the if block, go to else
            skipToLine = elseBlock[0];
            continue;
          } else {
            // Skip both blocks
            skipToLine = i;
            continue;
          }
        }
        
        // Handle variable assignments
        handleVariableAssignment(line, variables);
        
        // Handle print statements
        if (trimmedLine.includes('print(')) {
          simulatePrintStatement(line, variables, simulatedOutput);
        }
        
        // Handle for loops
        if (trimmedLine.startsWith('for ') && trimmedLine.includes(' in ') && trimmedLine.endsWith(':')) {
          processForLoop(lineIndex, codeLines, variables, simulatedOutput);
        }
        
        // Handle while loops (very basic)
        if (trimmedLine.startsWith('while ') && trimmedLine.endsWith(':')) {
          // This is a simplified simulation - we'll just run through once to avoid infinite loops
          simulatedOutput.push("[Note: while loops are simulated to run once in this environment]");
          
          const loopBody: number[] = [];
          let i = lineIndex + 1;
          while (i < codeLines.length) {
            const nextLine = codeLines[i];
            const nextIndent = nextLine.search(/\S|$/);
            
            if (nextIndent > currentIndent && nextLine.trim()) {
              loopBody.push(i);
              i++;
            } else {
              break;
            }
          }
          
          // Skip past the while loop
          skipToLine = i;
          continue;
        }
      }
      
      setOutput(simulatedOutput.length > 0 ? simulatedOutput.join('\n') : "No output generated");
    } catch (error) {
      console.error('Code execution error:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };
  
  // Helper function for handling print statements
  const simulatePrintStatement = (line: string, vars: Record<string, any>, output: string[]) => {
    try {
      // Extract content inside print()
      const printMatch = line.match(/print\((.*)\)/);
      if (printMatch && printMatch[1]) {
        const printContent = printMatch[1];
        
        // Handle empty print()
        if (!printContent.trim()) {
          output.push("");
          return;
        }
        
        // Handle f-strings (very basic simulation)
        if (printContent.startsWith('f"') || printContent.startsWith("f'")) {
          let fString = printContent.substring(2, printContent.length - 1);
          // Replace {var} with variable values
          const fStringVars = fString.match(/\{([^}]+)\}/g);
          if (fStringVars) {
            fStringVars.forEach(match => {
              const varName = match.substring(1, match.length - 1);
              if (vars[varName] !== undefined) {
                fString = fString.replace(match, String(vars[varName]));
              }
            });
          }
          output.push(fString);
          return;
        }
        
        // Handle comma-separated arguments in print()
        const printArgs = printContent.split(',').map(arg => {
          const trimmed = arg.trim();
          
          // Handle string literals
          if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || 
              (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
            return trimmed.substring(1, trimmed.length - 1);
          } 
          
          // Handle variables
          if (vars[trimmed] !== undefined) {
            return vars[trimmed];
          }
          
          // Handle expressions (basic)
          try {
            let evalExpr = trimmed;
            // Replace variables with their values
            for (const [key, value] of Object.entries(vars)) {
              if (typeof value === 'string') {
                evalExpr = evalExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), `'${value}'`);
              } else {
                evalExpr = evalExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
              }
            }
            // eslint-disable-next-line no-eval
            return eval(evalExpr);
          } catch (e) {
            return trimmed;
          }
        });
        
        output.push(printArgs.join(' '));
      }
    } catch (error) {
      console.error('Error in print statement:', error);
      output.push(`[Error in print statement: ${error}]`);
    }
  };
  
  // Helper function for handling variable assignments
  const handleVariableAssignment = (line: string, vars: Record<string, any>) => {
    if (line.includes('=') && !line.includes('==')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const varName = parts[0].trim();
        const valueStr = parts.slice(1).join('=').trim();
        
        try {
          // Handle string literals
          if ((valueStr.startsWith("'") && valueStr.endsWith("'")) || 
              (valueStr.startsWith('"') && valueStr.endsWith('"'))) {
            vars[varName] = valueStr.substring(1, valueStr.length - 1);
            return;
          }
          
          // Handle lists
          if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
            try {
              // Replace Python syntax with JS syntax
              const jsArray = valueStr
                .replace(/'/g, '"')  // Replace single quotes with double quotes
                .replace(/None/g, 'null')  // Replace None with null
                .replace(/True/g, 'true')  // Replace True with true
                .replace(/False/g, 'false');  // Replace False with false
              
              // eslint-disable-next-line no-eval
              vars[varName] = eval(jsArray);
              return;
            } catch (e) {
              console.error('Error parsing list:', e);
            }
          }
          
          // Handle numeric values and expressions
          let evalExpr = valueStr;
          // Replace variables with their values
          for (const [key, value] of Object.entries(vars)) {
            if (typeof value === 'string') {
              evalExpr = evalExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), `'${value}'`);
            } else if (Array.isArray(value)) {
              evalExpr = evalExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), JSON.stringify(value));
            } else {
              evalExpr = evalExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
            }
          }
          
          // eslint-disable-next-line no-eval
          vars[varName] = eval(evalExpr);
        } catch (e) {
          console.error('Error in variable assignment:', e);
        }
      }
    }
  };
  
  // Helper function for handling for loops
  const processForLoop = (lineIndex: number, codeLines: string[], vars: Record<string, any>, output: string[]) => {
    const line = codeLines[lineIndex];
    const loopMatch = line.match(/for\s+(\w+)\s+in\s+(.*?):/);
    
    if (loopMatch) {
      const [_, iterVar, iterableExpr] = loopMatch;
      let iterable: any[] = [];
      
      try {
        // Handle range function
        const rangeMatch = iterableExpr.match(/range\((\d+)(?:,\s*(\d+))?(?:,\s*(\d+))?\)/);
        if (rangeMatch) {
          const start = rangeMatch[2] ? parseInt(rangeMatch[1]) : 0;
          const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : parseInt(rangeMatch[1]);
          const step = rangeMatch[3] ? parseInt(rangeMatch[3]) : 1;
          
          for (let i = start; i < end; i += step) {
            iterable.push(i);
          }
        } 
        // Handle lists/arrays
        else if (vars[iterableExpr] && Array.isArray(vars[iterableExpr])) {
          iterable = vars[iterableExpr];
        }
        // Handle strings
        else if (vars[iterableExpr] && typeof vars[iterableExpr] === 'string') {
          iterable = vars[iterableExpr].split('');
        }
        
        // Find indentation level of the loop
        const currentIndent = line.search(/\S|$/);
        
        // Find the indented block that belongs to this loop
        let i = lineIndex + 1;
        let loopBody: string[] = [];
        while (i < codeLines.length) {
          const nextLine = codeLines[i];
          const nextIndent = nextLine.search(/\S|$/);
          
          if ((nextIndent > currentIndent || !nextLine.trim()) && i < codeLines.length) {
            loopBody.push(nextLine);
            i++;
          } else {
            break;
          }
        }
        
        // Execute the loop for each value in the iterable
        for (const value of iterable) {
          const loopVars = { ...vars };
          loopVars[iterVar] = value;
          
          for (const bodyLine of loopBody) {
            if (!bodyLine.trim()) continue;
            
            // Handle print statements within the loop
            if (bodyLine.trim().includes('print(')) {
              simulatePrintStatement(bodyLine, loopVars, output);
            }
            
            // Handle variable assignments within the loop
            handleVariableAssignment(bodyLine, loopVars);
          }
          
          // Update parent scope variables that were modified in the loop
          Object.assign(vars, loopVars);
        }
      } catch (error) {
        console.error('Error in for loop:', error);
        output.push(`[Error in for loop: ${error}]`);
      }
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
            <Card className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-medium text-gray-700">Code Editor</h2>
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
              <div className="p-0">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[400px] p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none resize-none rounded-none"
                  spellCheck="false"
                />
              </div>
            </Card>
            
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
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Basic variable assignments and operations</li>
              <li>String manipulation and printing</li>
              <li>Lists and basic data structures</li>
              <li>For loops with range and iterables</li>
              <li>If/else conditional statements</li>
              <li>Basic function definitions and calls</li>
              <li>F-string support for formatted output</li>
              <li><strong>Note:</strong> This is a browser-based simulation and has limitations. Complex Python libraries and certain features are not available.</li>
            </ul>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PythonIDE;
