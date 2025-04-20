
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Code, Play, Undo } from "lucide-react";
import { motion } from "framer-motion";

const Compiler = () => {
  const [html, setHtml] = useState('<div class="container">\n  <h1>Hello, World!</h1>\n  <p>Start editing to see some magic happen!</p>\n</div>');
  const [css, setCss] = useState('.container {\n  font-family: sans-serif;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n  text-align: center;\n}\n\nh1 {\n  color: #4f46e5;\n}\n\np {\n  color: #666;\n}');
  const [js, setJs] = useState('// JavaScript goes here\nconsole.log("Hello from JavaScript!");\n\n// Get the heading element\nconst heading = document.querySelector("h1");\n\n// Add a click event listener\nheading.addEventListener("click", () => {\n  heading.style.color = "#" + Math.floor(Math.random()*16777215).toString(16);\n});');
  const [output, setOutput] = useState("");

  // Update the output whenever the code changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const combinedOutput = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
        </html>
      `;
      setOutput(combinedOutput);
    }, 500);

    return () => clearTimeout(timer);
  }, [html, css, js]);

  // Reset the code to initial values
  const handleReset = () => {
    setHtml('<div class="container">\n  <h1>Hello, World!</h1>\n  <p>Start editing to see some magic happen!</p>\n</div>');
    setCss('.container {\n  font-family: sans-serif;\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n  text-align: center;\n}\n\nh1 {\n  color: #4f46e5;\n}\n\np {\n  color: #666;\n}');
    setJs('// JavaScript goes here\nconsole.log("Hello from JavaScript!");\n\n// Get the heading element\nconst heading = document.querySelector("h1");\n\n// Add a click event listener\nheading.addEventListener("click", () => {\n  heading.style.color = "#" + Math.floor(Math.random()*16777215).toString(16);\n});');
  };

  // Run the code
  const handleRun = () => {
    const combinedOutput = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}</script>
      </body>
      </html>
    `;
    setOutput(combinedOutput);
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
              Interactive Code Editor
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Write, preview, and test your HTML, CSS, and JavaScript code in real-time with our interactive code editor.
            </p>
          </div>
          
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              <Card className="w-full lg:w-1/2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-1">
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="bg-white mb-2">
                      <TabsTrigger value="html" className="flex items-center gap-1">
                        <Code size={16} /> HTML
                      </TabsTrigger>
                      <TabsTrigger value="css" className="flex items-center gap-1">
                        <Code size={16} /> CSS
                      </TabsTrigger>
                      <TabsTrigger value="js" className="flex items-center gap-1">
                        <Code size={16} /> JS
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="html" className="mt-0">
                      <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        className="w-full h-[400px] p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none resize-none"
                        spellCheck="false"
                      />
                    </TabsContent>
                    
                    <TabsContent value="css" className="mt-0">
                      <textarea
                        value={css}
                        onChange={(e) => setCss(e.target.value)}
                        className="w-full h-[400px] p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none resize-none"
                        spellCheck="false"
                      />
                    </TabsContent>
                    
                    <TabsContent value="js" className="mt-0">
                      <textarea
                        value={js}
                        onChange={(e) => setJs(e.target.value)}
                        className="w-full h-[400px] p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none resize-none"
                        spellCheck="false"
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
              
              <Card className="w-full lg:w-1/2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-100 p-2 flex items-center justify-between border-b">
                  <h3 className="text-sm font-medium">Output</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleReset}
                      className="flex items-center gap-1"
                    >
                      <Undo size={14} />
                      Reset
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleRun}
                      className="flex items-center gap-1"
                    >
                      <Play size={14} />
                      Run
                    </Button>
                  </div>
                </div>
                <div className="h-[400px] bg-white">
                  <iframe
                    srcDoc={output}
                    title="output"
                    sandbox="allow-scripts"
                    className="w-full h-full border-0"
                  />
                </div>
              </Card>
            </div>
            
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-3">Tips</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                <li>Click on the HTML, CSS, or JS tabs to edit different parts of your code.</li>
                <li>Your code automatically updates as you type. Click "Run" to manually refresh the preview.</li>
                <li>Try clicking on the heading in the preview to see the JavaScript in action.</li>
                <li>Click "Reset" to restore the default starter code.</li>
                <li>The editor supports standard HTML5, CSS3, and modern JavaScript features.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Compiler;
