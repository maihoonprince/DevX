
// Python Interpreter Utilities
// This file contains a simple Python interpreter simulation for browser environments

interface PythonValue {
  type: 'string' | 'number' | 'boolean' | 'list' | 'dict' | 'set' | 'none' | 'function';
  value: any;
}

interface PythonScope {
  [key: string]: PythonValue;
}

/**
 * Simulates Python code execution
 * @param code The Python code to interpret
 * @returns The string output that would be produced by the code
 */
export const interpretPython = (code: string): string => {
  const output: string[] = [];
  const globalScope: PythonScope = {};
  const indentStack: number[] = [];
  const functionDefinitions: Record<string, { params: string[], body: string[], scope: PythonScope }> = {};
  
  try {
    // Split code into lines
    const lines = code.split('\n');
    
    // Process each line
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      // Calculate indentation level
      const indentation = getIndentation(line);
      
      // Handle block closing
      while (indentStack.length > 0 && indentation < indentStack[indentStack.length - 1]) {
        indentStack.pop();
      }
      
      // Process the line based on its content
      if (trimmedLine.startsWith('print(')) {
        // Handle print statements
        handlePrint(trimmedLine, globalScope, output);
      } 
      else if (trimmedLine.startsWith('def ')) {
        // Handle function definitions
        const funcMatch = trimmedLine.match(/def\s+(\w+)\((.*?)\):/);
        if (funcMatch) {
          const funcName = funcMatch[1];
          const params = funcMatch[2].split(',').map(p => p.trim());
          
          // Create function body by collecting all indented lines
          const funcBody: string[] = [];
          indentStack.push(indentation);
          
          // Find all lines in the function body
          let i = lineIndex + 1;
          while (i < lines.length) {
            const nextLine = lines[i];
            const nextIndent = getIndentation(nextLine);
            
            if (nextIndent > indentation || !nextLine.trim()) {
              if (nextLine.trim()) funcBody.push(nextLine);
              i++;
            } else {
              break;
            }
          }
          
          // Store the function definition
          functionDefinitions[funcName] = {
            params,
            body: funcBody,
            scope: { ...globalScope }
          };
          
          // Add function to global scope
          globalScope[funcName] = {
            type: 'function',
            value: funcName
          };
          
          // Skip function body as we've already processed it
          lineIndex = i - 1;
        }
      }
      else if (trimmedLine.includes('=') && !trimmedLine.includes('==')) {
        // Handle variable assignments
        handleAssignment(trimmedLine, globalScope);
      }
      else if (trimmedLine.startsWith('if ') && trimmedLine.endsWith(':')) {
        // Handle if statements
        const conditionResult = evaluateCondition(trimmedLine.slice(3, -1), globalScope);
        indentStack.push(indentation);
        
        if (!conditionResult) {
          // Skip the if block if condition is false
          lineIndex = skipCodeBlock(lines, lineIndex, indentation);
          
          // Check if there's an else block
          if (lineIndex + 1 < lines.length && lines[lineIndex + 1].trim() === 'else:') {
            lineIndex++; // Move to the else line
            indentStack.push(indentation); // Push else indentation
          }
        }
      }
      else if (trimmedLine === 'else:') {
        // Skip the else block if we got here (means if condition was true)
        lineIndex = skipCodeBlock(lines, lineIndex, indentation);
      }
      else if (trimmedLine.startsWith('elif ') && trimmedLine.endsWith(':')) {
        // Handle elif statement
        const conditionResult = evaluateCondition(trimmedLine.slice(5, -1), globalScope);
        indentStack.push(indentation);
        
        if (!conditionResult) {
          // Skip the elif block if condition is false
          lineIndex = skipCodeBlock(lines, lineIndex, indentation);
        }
      }
      else if (trimmedLine.startsWith('for ') && trimmedLine.includes(' in ') && trimmedLine.endsWith(':')) {
        // Handle for loops
        const loopMatch = trimmedLine.match(/for\s+(\w+)\s+in\s+(.*?):/);
        
        if (loopMatch) {
          const iterVar = loopMatch[1];
          const iterableExpr = loopMatch[2];
          const iterable = evaluateExpression(iterableExpr, globalScope);
          
          indentStack.push(indentation);
          
          // Collect the loop body
          const loopBody: string[] = [];
          let i = lineIndex + 1;
          
          while (i < lines.length) {
            const nextLine = lines[i];
            const nextIndent = getIndentation(nextLine);
            
            if (nextIndent > indentation || !nextLine.trim()) {
              if (nextLine.trim()) loopBody.push(nextLine);
              i++;
            } else {
              break;
            }
          }
          
          // Execute the loop for each value in the iterable
          if (Array.isArray(iterable)) {
            for (const item of iterable) {
              // Create a new scope for this iteration
              globalScope[iterVar] = {
                type: typeof item === 'string' ? 'string' : 
                       typeof item === 'number' ? 'number' :
                       typeof item === 'boolean' ? 'boolean' : 
                       Array.isArray(item) ? 'list' : 'none',
                value: item
              };
              
              // Execute each line in the loop body
              for (const bodyLine of loopBody) {
                if (bodyLine.trim().startsWith('print(')) {
                  handlePrint(bodyLine.trim(), globalScope, output);
                }
                else if (bodyLine.trim().includes('=') && !bodyLine.trim().includes('==')) {
                  handleAssignment(bodyLine.trim(), globalScope);
                }
              }
            }
          }
          
          // Skip past the loop body
          lineIndex = i - 1;
        }
      }
      else if (trimmedLine.startsWith('while ') && trimmedLine.endsWith(':')) {
        // Handle while loops (with iteration limit for safety)
        const condition = trimmedLine.slice(6, -1);
        const MAX_ITERATIONS = 1000;
        let iterations = 0;
        
        indentStack.push(indentation);
        
        // Collect the loop body
        const loopBody: string[] = [];
        let i = lineIndex + 1;
        
        while (i < lines.length) {
          const nextLine = lines[i];
          const nextIndent = getIndentation(nextLine);
          
          if (nextIndent > indentation || !nextLine.trim()) {
            if (nextLine.trim()) loopBody.push(nextLine);
            i++;
          } else {
            break;
          }
        }
        
        // Execute the while loop
        while (evaluateCondition(condition, globalScope) && iterations < MAX_ITERATIONS) {
          // Execute each line in the loop body
          for (const bodyLine of loopBody) {
            if (bodyLine.trim().startsWith('print(')) {
              handlePrint(bodyLine.trim(), globalScope, output);
            }
            else if (bodyLine.trim().includes('=') && !bodyLine.trim().includes('==')) {
              handleAssignment(bodyLine.trim(), globalScope);
            }
          }
          
          iterations++;
        }
        
        if (iterations >= MAX_ITERATIONS) {
          output.push("[Warning: While loop iteration limit reached (1000 iterations). Loop execution halted.]");
        }
        
        // Skip past the loop body
        lineIndex = i - 1;
      }
      else if (/^\w+\(.*\)$/.test(trimmedLine)) {
        // Handle function calls
        const funcCallMatch = trimmedLine.match(/^(\w+)\((.*)\)$/);
        if (funcCallMatch && functionDefinitions[funcCallMatch[1]]) {
          const funcName = funcCallMatch[1];
          const func = functionDefinitions[funcName];
          const argString = funcCallMatch[2];
          
          // Parse arguments
          const args = argString ? argString.split(',').map(arg => {
            const trimmedArg = arg.trim();
            return evaluateSingleExpression(trimmedArg, globalScope);
          }) : [];
          
          // Create function scope with arguments
          const funcScope: PythonScope = { ...func.scope };
          
          // Assign arguments to parameters
          func.params.forEach((param, i) => {
            if (i < args.length) {
              funcScope[param] = args[i] as PythonValue;
            } else {
              // Default to None if no argument provided
              funcScope[param] = { type: 'none', value: null };
            }
          });
          
          // Execute function body
          for (const bodyLine of func.body) {
            const trimmedBodyLine = bodyLine.trim();
            
            if (trimmedBodyLine.startsWith('print(')) {
              handlePrint(trimmedBodyLine, funcScope, output);
            }
            else if (trimmedBodyLine.includes('=') && !trimmedBodyLine.includes('==')) {
              handleAssignment(trimmedBodyLine, funcScope);
            }
            else if (trimmedBodyLine.startsWith('return ')) {
              // Handle return statement (not processing the return value for now)
              break;
            }
          }
        }
      }
    }
    
    return output.join('\n');
  } catch (error) {
    console.error('Python interpreter error:', error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
};

// Helper function to get indentation level
const getIndentation = (line: string): number => {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
};

// Helper function to handle print statements
const handlePrint = (line: string, scope: PythonScope, output: string[]): void => {
  // Extract content inside print()
  const printMatch = line.match(/print\((.*)\)/);
  if (printMatch) {
    let content = printMatch[1].trim();
    
    // Handle empty print()
    if (!content) {
      output.push("");
      return;
    }
    
    // Check if it's an f-string
    if ((content.startsWith('f"') && content.endsWith('"')) || 
        (content.startsWith("f'") && content.endsWith("'"))) {
      let fString = content.substring(2, content.length - 1);
      
      // Replace {var} with variable values
      fString = fString.replace(/\{([^}]+)\}/g, (match, varName) => {
        const variable = scope[varName];
        return variable ? String(variable.value) : 'undefined';
      });
      
      output.push(fString);
      return;
    }
    
    // Handle comma-separated arguments
    const printArgs = splitPrintArgs(content).map(arg => {
      const trimmedArg = arg.trim();
      return evaluateSingleExpression(trimmedArg, scope);
    });
    
    // Join arguments with spaces (like Python does)
    output.push(printArgs.map(arg => 
      arg.type === 'string' ? arg.value : 
      String(arg.value)
    ).join(' '));
  }
};

// Helper to split print arguments properly handling nested functions/parentheses
const splitPrintArgs = (argsStr: string): string[] => {
  const result: string[] = [];
  let current = '';
  let parenCount = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
    // Handle string literals
    if ((char === '"' || char === "'") && (i === 0 || argsStr[i-1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    // Handle parentheses
    if (!inString) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
    }
    
    // Split on commas only when not inside parentheses or strings
    if (char === ',' && parenCount === 0 && !inString) {
      result.push(current);
      current = '';
      continue;
    }
    
    current += char;
  }
  
  if (current) {
    result.push(current);
  }
  
  return result;
};

// Helper function to handle variable assignments
const handleAssignment = (line: string, scope: PythonScope): void => {
  const parts = line.split('=');
  const varName = parts[0].trim();
  const valueStr = parts.slice(1).join('=').trim();
  
  // Evaluate the right side of the assignment
  const value = evaluateExpression(valueStr, scope);
  
  // Store in scope with appropriate type
  if (value !== undefined) {
    scope[varName] = {
      type: typeof value === 'string' ? 'string' : 
             typeof value === 'number' ? 'number' :
             typeof value === 'boolean' ? 'boolean' : 
             Array.isArray(value) ? 'list' :
             value === null ? 'none' : 'string',
      value
    };
  }
};

// Helper function to evaluate Python expressions
const evaluateExpression = (expr: string, scope: PythonScope): any => {
  try {
    // Handle string literals
    if ((expr.startsWith('"') && expr.endsWith('"')) || 
        (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.substring(1, expr.length - 1);
    }
    
    // Handle boolean literals
    if (expr === 'True') return true;
    if (expr === 'False') return false;
    if (expr === 'None') return null;
    
    // Handle variable references
    if (scope[expr]) return scope[expr].value;
    
    // Handle range function
    const rangeMatch = expr.match(/range\((\d+)(?:,\s*(\d+))?(?:,\s*(\d+))?\)/);
    if (rangeMatch) {
      const start = rangeMatch[2] ? parseInt(rangeMatch[1]) : 0;
      const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : parseInt(rangeMatch[1]);
      const step = rangeMatch[3] ? parseInt(rangeMatch[3]) : 1;
      
      const result = [];
      for (let i = start; i < end; i += step) {
        result.push(i);
      }
      return result;
    }
    
    // Handle lists
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const listContent = expr.substring(1, expr.length - 1).trim();
      if (!listContent) return [];
      
      return listContent.split(',').map(item => {
        const trimmedItem = item.trim();
        return evaluateSingleExpression(trimmedItem, scope).value;
      });
    }
    
    // Handle basic arithmetic expressions
    // Replace variables with their values for eval
    let evalExpr = expr;
    for (const [key, value] of Object.entries(scope)) {
      if (new RegExp(`\\b${key}\\b`).test(evalExpr)) {
        const replacementValue = value.type === 'string' ? 
          `'${value.value}'` : String(value.value);
        evalExpr = evalExpr.replace(new RegExp(`\\b${key}\\b`, 'g'), replacementValue);
      }
    }
    
    // Convert Python syntax to JavaScript
    evalExpr = evalExpr
      .replace(/ and /g, ' && ')
      .replace(/ or /g, ' || ')
      .replace(/ not /g, ' !')
      .replace(/True/g, 'true')
      .replace(/False/g, 'false')
      .replace(/None/g, 'null');
    
    // Handle numeric expressions and operators
    try {
      // eslint-disable-next-line no-eval
      return eval(evalExpr);
    } catch (e) {
      console.error('Error evaluating expression:', evalExpr, e);
      return expr; // Return original expression if eval fails
    }
  } catch (error) {
    console.error('Error in expression evaluation:', error);
    return expr; // Return original expression on error
  }
};

// Helper function to evaluate a single expression to a Python value
const evaluateSingleExpression = (expr: string, scope: PythonScope): PythonValue => {
  const value = evaluateExpression(expr, scope);
  
  return {
    type: typeof value === 'string' ? 'string' : 
           typeof value === 'number' ? 'number' :
           typeof value === 'boolean' ? 'boolean' : 
           Array.isArray(value) ? 'list' :
           value === null ? 'none' : 'string',
    value
  };
};

// Helper function to evaluate conditions for if statements
const evaluateCondition = (condition: string, scope: PythonScope): boolean => {
  try {
    // Convert Python comparison operators to JavaScript
    let jsCondition = condition
      .replace(/ and /g, ' && ')
      .replace(/ or /g, ' || ')
      .replace(/ not /g, ' !')
      .replace(/True/g, 'true')
      .replace(/False/g, 'false')
      .replace(/None/g, 'null')
      .replace(/==/g, '==='); // Correct equality check
      
    // Replace variables with their values
    for (const [key, value] of Object.entries(scope)) {
      if (new RegExp(`\\b${key}\\b`).test(jsCondition)) {
        const replacementValue = value.type === 'string' ? 
          `'${value.value}'` : String(value.value);
        jsCondition = jsCondition.replace(new RegExp(`\\b${key}\\b`, 'g'), replacementValue);
      }
    }
    
    // eslint-disable-next-line no-eval
    return Boolean(eval(jsCondition));
  } catch (error) {
    console.error('Error evaluating condition:', condition, error);
    return false;
  }
};

// Helper function to skip a code block
const skipCodeBlock = (lines: string[], currentLine: number, currentIndent: number): number => {
  let lineIndex = currentLine + 1;
  
  while (lineIndex < lines.length) {
    const nextLine = lines[lineIndex];
    const nextIndent = getIndentation(nextLine);
    
    if (nextLine.trim() && nextIndent <= currentIndent) {
      return lineIndex - 1;
    }
    
    lineIndex++;
  }
  
  return lines.length - 1;
};
