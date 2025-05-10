
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Puzzle, Terminal, Laptop, BookOpen, Brain, FileCode, Database, Globe, Cpu, BookCheck, Bot, Server, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { GiYinYang } from "react-icons/gi";

const PlaygroundCard = ({ 
  title, 
  description, 
  icon: Icon, 
  delay = 0, 
  to, 
  badge,
  gradient = "from-primary to-purple-600"
}: { 
  title: string; 
  description: string; 
  icon: any; 
  delay?: number; 
  to?: string;
  badge?: string;
  gradient?: string;
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (to) {
      navigate(to);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
      onClick={handleClick}
    >
      <Card className="h-full transform transition-all duration-300 hover:shadow-lg cursor-pointer hover-card-shine bg-white/50 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10`}>
              <Icon className={`h-6 w-6 text-white`} />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle>{title}</CardTitle>
              {badge && (
                <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                  {badge}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FeatureSection = ({ title, description, className = "" }: { title: string; description: string, className?: string }) => (
  <div className={`text-center max-w-4xl mx-auto mb-12 ${className}`}>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
    >
      {title}
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-gray-600 text-lg"
    >
      {description}
    </motion.p>
  </div>
);

const StatsCard = ({ count, label, icon: Icon, color }: { count: string; label: string; icon: any; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4"
  >
    <div className={`p-4 rounded-full ${color}`}>
      <Icon className="h-7 w-7 text-white" />
    </div>
    <div>
      <p className="text-3xl font-bold">{count}</p>
      <p className="text-gray-500">{label}</p>
    </div>
  </motion.div>
);

const Playground = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-6 mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600"
            >
              Interactive Code Playground
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Experience the future of coding with our interactive playground. Write, compile, and learn in real-time with instant feedback and collaborative features.
            </motion.p>
          </div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          >
            <StatsCard count="50+" label="Code Challenges" icon={Puzzle} color="bg-blue-500" />
            <StatsCard count="25+" label="Tutorial Modules" icon={BookCheck} color="bg-purple-500" />
            <StatsCard count="10K+" label="Daily Users" icon={Play} color="bg-green-500" />
            <StatsCard count="3" label="Programming Languages" icon={Code} color="bg-amber-500" />
          </motion.div>

          <FeatureSection 
            title="Built for Modern Developers"
            description="Our playground is equipped with the latest development tools and features to help you write better code faster."
          />

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start mb-6 bg-white/50 backdrop-blur-sm p-1 rounded-lg">
              <TabsTrigger value="all" className="text-base">All Features</TabsTrigger>
              <TabsTrigger value="challenges" className="text-base">Challenges</TabsTrigger>
              <TabsTrigger value="tutorials" className="text-base">Tutorials</TabsTrigger>
              <TabsTrigger value="projects" className="text-base">Projects</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PlaygroundCard
                title="DSA Theory"
                description="Learn Data Structures and Algorithms from basics to advanced with detailed explanations, examples, and visualizations."
                icon={BookOpen}
                delay={0}
                to="/dsa-theory"
              />
              <PlaygroundCard
                title="Interactive Code Editor"
                description="Write and test your code in real-time with our powerful online editor featuring syntax highlighting, auto-completion, and live preview."
                icon={Code}
                delay={0.1}
                to="/compiler"
              />
              <PlaygroundCard
                title="DSA Coding Challenges"
                description="Sharpen your skills with our curated collection of programming challenges, ranging from beginner to advanced levels."
                icon={Puzzle}
                delay={0.2}
                to="/dsa-questions"
              />
              <PlaygroundCard
                title="MERN Stack"
                description="Learn MERN Stack from basics to advanced with detailed explanations, examples, and visualizations."
                icon={Terminal}
                delay={0.3}
                to="/learn"
              />
              <PlaygroundCard
                title="Python IDE"
                description="Write, run, and debug Python code directly in your browser with our powerful Python online compiler."
                icon={Laptop}
                delay={0.4}
                to="/python-ide"
                badge="New"
              />
              <PlaygroundCard
                title="OrBi : AI Assistant"
                description="Get intelligent code suggestions, debugging help, and explanations from our built-in AI assistant."
                // icon={Bot}
                icon={GiYinYang}
                delay={0.5}
                gradient="from-blue-500 to-cyan-400"
              />
              {/* <PlaygroundCard
                title="Database Playground"
                description="Test SQL queries, design schemas, and visualize data structures with our interactive database playground."
                icon={Database}
                delay={0.6}
                gradient="from-amber-500 to-orange-400"
              />
              <PlaygroundCard
                title="Algorithm Visualizer"
                description="Watch algorithms in action with step-by-step visualizations to better understand complex computational concepts."
                icon={Brain}
                delay={0.7}
                gradient="from-green-500 to-teal-400"
              />
              <PlaygroundCard
                title="API Tester"
                description="Build, test, and debug API endpoints with our intuitive interface for RESTful and GraphQL APIs."
                icon={Globe}
                delay={0.8}
                gradient="from-red-500 to-pink-400"
              /> */}
            </TabsContent>

            <TabsContent value="challenges" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PlaygroundCard
                title="Algorithm Challenges"
                description="Master algorithmic problem-solving with our collection of challenges. Practice sorting, searching, and optimization problems."
                icon={Puzzle}
                delay={0.1}
                gradient="from-blue-500 to-indigo-600"
              />
              <PlaygroundCard
                title="Data Structure Challenges"
                description="Implement and understand various data structures through hands-on coding exercises. From arrays to advanced tree structures."
                icon={Code}
                delay={0.2}
                gradient="from-purple-500 to-pink-500"
              />
              <PlaygroundCard
                title="Daily Coding Problems"
                description="Stay sharp with our daily coding challenges. New problems are added regularly to keep you engaged and learning."
                icon={Terminal}
                delay={0.3}
                gradient="from-amber-500 to-orange-500"
                badge="Daily"
              />
              <PlaygroundCard
                title="Contest Platform"
                description="Participate in coding contests and compete with other developers. Track your progress and improve your ranking."
                icon={Laptop}
                delay={0.4}
                gradient="from-green-500 to-teal-500"
              />
              <PlaygroundCard
                title="LeetCode Style Problems"
                description="Practice problems similar to those asked in technical interviews at top tech companies. Get prepared for your next job interview."
                icon={FileCode}
                delay={0.5}
                gradient="from-red-500 to-pink-500"
              />
              <PlaygroundCard
                title="System Design Challenges"
                description="Learn how to design scalable systems through interactive challenges focused on architecture, databases, and distributed systems."
                icon={Server}
                delay={0.6}
                gradient="from-cyan-500 to-blue-500"
              />
            </TabsContent>

            <TabsContent value="tutorials" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PlaygroundCard
                title="Interactive Learning Paths"
                description="Follow structured learning paths tailored to your skill level. Master programming concepts step by step."
                icon={Terminal}
                delay={0.1}
                gradient="from-purple-500 to-indigo-500"
              />
              <PlaygroundCard
                title="Video Tutorials"
                description="Access comprehensive video tutorials with hands-on coding exercises. Learn by doing with expert guidance."
                icon={Laptop}
                delay={0.2}
                gradient="from-amber-500 to-red-500"
              />
              <PlaygroundCard
                title="Documentation Guide"
                description="Navigate through interactive documentation with live code examples. Learn best practices and coding standards."
                icon={Code}
                delay={0.3}
                gradient="from-blue-500 to-cyan-500"
              />
              <PlaygroundCard
                title="Code Reviews"
                description="Get feedback on your code from our AI-powered code review system. Learn from your mistakes and improve."
                icon={Puzzle}
                delay={0.4}
                gradient="from-green-500 to-emerald-500"
                badge="AI Powered"
              />
              <PlaygroundCard
                title="Interview Preparation"
                description="Prepare for technical interviews with guided lessons and practice sessions focused on common interview questions."
                icon={BookCheck}
                delay={0.5}
                gradient="from-rose-500 to-pink-500"
              />
              <PlaygroundCard
                title="Tech Stack Workshops"
                description="Deep dive into popular technology stacks with guided workshops covering frontend, backend, and full-stack development."
                icon={Cpu}
                delay={0.6}
                gradient="from-indigo-500 to-violet-500"
              />
            </TabsContent>

            <TabsContent value="projects" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PlaygroundCard
                title="Frontend Projects"
                description="Build responsive web applications using modern frameworks like React. Create beautiful UIs with real-world applications."
                icon={Code}
                delay={0.1}
                gradient="from-blue-500 to-indigo-500"
              />
              <PlaygroundCard
                title="Backend Projects"
                description="Develop scalable backend services using Node.js and Express. Learn database integration and API development."
                icon={Terminal}
                delay={0.2}
                gradient="from-green-500 to-teal-500"
              />
              <PlaygroundCard
                title="Full-Stack Projects"
                description="Create end-to-end applications combining frontend and backend technologies. Build complete web applications."
                icon={Laptop}
                delay={0.3}
                gradient="from-purple-500 to-pink-500"
              />
              <PlaygroundCard
                title="DevOps Projects"
                description="Learn deployment, containerization, and CI/CD pipelines through hands-on projects. Master modern DevOps tools."
                icon={Puzzle}
                delay={0.4}
                gradient="from-amber-500 to-orange-500"
              />
              <PlaygroundCard
                title="Mobile App Projects"
                description="Build cross-platform mobile applications using React Native. Create apps that work on iOS and Android from a single codebase."
                icon={Bot}
                delay={0.5}
                gradient="from-cyan-500 to-blue-500"
              />
              <PlaygroundCard
                title="AI/ML Projects"
                description="Explore machine learning and artificial intelligence through guided projects that teach you to build smart applications."
                icon={Brain}
                delay={0.6}
                gradient="from-rose-500 to-red-500"
                badge="Advanced"
              />
            </TabsContent>
          </Tabs>

          {/* Featured Section */}
          <div className="my-16">
            <FeatureSection 
              title="Featured Playground"
              description="Our most popular tools and learning resources"
              className="mb-8"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 md:p-10 shadow-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-white/50 backdrop-blur-sm inline-block p-2 rounded-lg">
                    <Badge variant="outline" className="bg-gradient-to-r from-primary to-purple-600 text-white">
                      Featured
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-bold">Master Data Structures & Algorithms</h3>
                  <p className="text-gray-700">
                    Our comprehensive DSA curriculum combines theory and practice to help you master 
                    the fundamentals of computer science and ace your technical interviews.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Play className="h-4 w-4 text-green-600" />
                      </div>
                      <span>50+ interactive coding challenges</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Play className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Visual algorithm animations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Play className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Time & space complexity analysis</span>
                    </li>
                  </ul>
                  <button 
                    onClick={() => window.location.href = "/dsa-theory"} 
                    className="mt-4 bg-gradient-to-r from-primary to-purple-600 text-white py-2 px-6 rounded-lg hover:opacity-90 transition-all"
                  >
                    Start Learning →
                  </button>
                </div>
                <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 shadow-sm">
                  <div className="font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-lg">
                    <pre className="overflow-auto max-h-60">
{`class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        
    def append(self, data):
        new_node = Node(data)
        
        if self.head is None:
            self.head = new_node
            return
            
        last_node = self.head
        while last_node.next:
            last_node = last_node.next
            
        last_node.next = new_node
        
    def print_list(self):
        current = self.head
        while current:
            print(current.data, end=" → ")
            current = current.next
        print("None")`}
                    </pre>
                  </div>
                  <p className="text-center text-sm mt-4 text-gray-600">Example: Linked List implementation in Python</p>
                </div>
              </div>
            </motion.div>
          </div>

          <FeatureSection 
            title="Ready to Start Coding?"
            description="Join thousands of developers who are already using our playground to improve their coding skills and build amazing projects."
          />

          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-primary to-purple-600 text-white py-3 px-8 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all"
              onClick={() => window.location.href = "/compiler"}
            >
              Launch Code Editor
            </motion.button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Playground;
